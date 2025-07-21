from typing import List, Dict, Optional, Any
import uuid
import re
from langchain_core.messages import HumanMessage, AIMessage
from langgraph.errors import NodeInterrupt

from app.agents.research_agent import graph
from app.schemas.chat import Message
from app.schemas.research_state import ValidationResult


class ResearchAgentWrapper:
    def __init__(self):
        self.graph = graph
        # Simple in-memory session storage
        self._sessions: Dict[str, Dict] = {}

    async def get_response(self, messages: List[Message], session_id: str) -> Dict[str, Any]:
        """Get response from research agent with session persistence and interrupt handling"""
        
        # Get or create session history
        if session_id not in self._sessions:
            self._sessions[session_id] = {
                "messages": [],
                "state": None,
                "pending_interrupt": None
            }
        
        session = self._sessions[session_id]
        session_history = session["messages"]
        
        # Add new user messages to session history
        for msg in messages:
            if msg not in session_history:  # Avoid duplicates
                session_history.append(msg)
        
        # Convert ALL session messages to LangGraph format
        langgraph_messages = []
        for msg in session_history:
            if msg.role == "user":
                langgraph_messages.append(HumanMessage(content=msg.content))
            elif msg.role == "assistant":
                langgraph_messages.append(AIMessage(content=msg.content))
        
        # Check if we're handling an approval response
        latest_user_message = messages[-1].content.lower() if messages else ""
        is_approval_response = self._is_approval_message(latest_user_message)
        
        # Create or update state
        if session["state"] is None:
            # First interaction - create initial state
            initial_state = {
                "messages": langgraph_messages,
                "current_user_question": messages[0].content if messages else "",
                "remaining_steps": 20,
                "workflow_stage": "multi_search",
                "search_queries_planned": [],
                "search_queries_executed": [],
                "raw_search_results": [],
                "validation_results": [],
                "approved_document_ids": [],
                "rejected_document_ids": [],
                "parsed_documents": {},
                "document_summaries": {},
                "legal_concepts_identified": [],
                "relevant_legal_areas": [],
                "artifacts": {},
                "current_artifact_id": "",
                "completed_stages": [],
                "pending_approval": False,
                "approval_required_for": "",
                "human_feedback": "",
                "last_approval_request": "",
                "needs_additional_search": False,
                "suggested_queries": []
            }
            session["state"] = initial_state
        else:
            # Update existing state with new messages and feedback
            session["state"]["messages"] = langgraph_messages
            if messages:
                session["state"]["human_feedback"] = messages[-1].content
                
                # If it's an approval response, parse it
                if is_approval_response:
                    approved_ids = self._parse_approval_message(latest_user_message)
                    session["state"]["approved_document_ids"] = approved_ids
                    session["state"]["pending_approval"] = False
                    session["state"]["workflow_stage"] = "sources_approved"
        
        # Run the graph
        config = {"configurable": {"thread_id": session_id}}
        
        try:
            print(f"Invoking graph with state: pending_approval={session['state'].get('pending_approval', False)}")
            result = await self.graph.ainvoke(session["state"], config)
            print(f"Graph result: pending_approval={result.get('pending_approval', False)}, workflow_stage={result.get('workflow_stage', 'unknown')}")
            
            # Update session state
            session["state"] = result
            
            # Extract assistant messages and check for interrupts
            new_assistant_messages = []
            interrupt_data = None
            
            for msg in result["messages"]:
                if hasattr(msg, 'content') and msg.content and msg.content.strip():
                    if isinstance(msg, AIMessage) or (hasattr(msg, 'type') and msg.type == "ai"):
                        try:
                            clean_content = msg.content.strip()
                            if len(clean_content) > 0:
                                message_obj = Message(role="assistant", content=clean_content)
                                # Only add if it's not already in session
                                if message_obj not in session_history:
                                    new_assistant_messages.append(message_obj)
                                    session_history.append(message_obj)
                        except Exception as e:
                            print(f"Skipping message due to validation error: {e}")
                            continue
            
            # Check for pending approval (interrupt)
            interrupt_data = None
            current_user_question = session["state"].get("current_user_question", "")
            
            if result.get("pending_approval", False):
                print(f"Pending approval detected: {result.get('workflow_stage', 'unknown')}")
                
                if result.get("workflow_stage") == "no_relevant_sources":
                    # Handle no relevant sources case
                    interrupt_data = {
                        "interrupt_type": "source_approval",
                        "interrupt_id": str(uuid.uuid4()),
                        "interrupt_data": {
                            "sources": [],
                            "total_sources": 0,
                            "question": current_user_question,
                            "no_relevant_sources": True,
                            "total_found": len(result.get("validation_results", []))
                        }
                    }
                else:
                    # Handle normal source approval
                    interrupt_data = self._create_source_approval_interrupt(result)
            
            # Update session
            self._sessions[session_id] = session
            
            # Prepare response
            response_data = {
                "messages": new_assistant_messages[-1:] if new_assistant_messages else []
            }
            
            # Add interrupt data if present
            if interrupt_data:
                response_data.update(interrupt_data)
                print(f"Interrupt data added: {interrupt_data}")
            
            return response_data
            
        except NodeInterrupt as interrupt:
            # Handle LangGraph interrupts
            print(f"LangGraph interrupt detected: {interrupt}")
            
            # Check if it's a source approval interrupt
            if "approval" in str(interrupt).lower():
                interrupt_data = self._create_source_approval_interrupt(session["state"])
                
                # Create a message explaining the interrupt
                approval_message = self._format_approval_message(session["state"])
                message_obj = Message(role="assistant", content=approval_message)
                
                if message_obj not in session_history:
                    session_history.append(message_obj)
                
                # Update session
                self._sessions[session_id] = session
                
                response_data = {
                    "messages": [message_obj]
                }
                response_data.update(interrupt_data)
                
                return response_data
            
            # Handle other types of interrupts
            return {
                "messages": [Message(
                    role="assistant", 
                    content="I need your input to continue. Please provide your feedback."
                )]
            }
            
        except Exception as e:
            print(f"Error in research agent: {e}")
            return {
                "messages": [Message(
                    role="assistant", 
                    content=f"Sorry, I encountered an error: {str(e)}"
                )]
            }

    def _is_approval_message(self, message: str) -> bool:
        """Check if message is an approval response"""
        approval_keywords = ["approved", "approve", "select", "choose", "yes", "ok", "confirm"]
        message_lower = message.lower()
        return any(keyword in message_lower for keyword in approval_keywords) or \
               bool(re.search(r'\b\d{6,}\b', message))  # Contains document IDs

    def _parse_approval_message(self, message: str) -> List[str]:
        """Parse approval message to extract document IDs or special commands"""
        message_lower = message.lower().strip()
        
        if "all" in message_lower or "все" in message_lower:
            return ["all"]
        elif "retry" in message_lower:
            return ["retry"]
        elif "broaden" in message_lower:
            return ["broaden"]
        elif "proceed" in message_lower:
            return ["proceed"]
        elif "none" in message_lower or "skip" in message_lower:
            return []
        else:
            # Extract document IDs from message
            doc_ids = re.findall(r'\b\d{6,}\b', message)
            return doc_ids

    def _create_source_approval_interrupt(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """Create interrupt data for source approval"""
        validation_results = state.get("validation_results", [])
        
        if not validation_results:
            return {}
        
        # Convert validation results to frontend format
        sources_data = []
        for result in validation_results:
            if hasattr(result, 'is_relevant') and result.is_relevant:
                source_data = {
                    "document_id": result.document_id,
                    "title": result.title,
                    "relevance_score": result.relevance_score,
                    "reasoning": result.reasoning,
                    "url": getattr(result, 'url', '')
                }
                sources_data.append(source_data)
        
        interrupt_id = str(uuid.uuid4())
        
        return {
            "interrupt_type": "source_approval",
            "interrupt_id": interrupt_id,
            "interrupt_data": {
                "sources": sources_data,
                "total_sources": len(sources_data),
                "question": state.get("current_user_question", "")
            }
        }

    def _format_approval_message(self, state: Dict[str, Any]) -> str:
        """Format a user-friendly message for source approval"""
        validation_results = state.get("validation_results", [])
        relevant_sources = [r for r in validation_results if hasattr(r, 'is_relevant') and r.is_relevant]
        
        if not relevant_sources:
            return "I couldn't find any relevant sources for your question. Please try rephrasing your question."
        
        message = f"I found {len(relevant_sources)} relevant sources for your question. Please review and select the sources you'd like me to analyze:\n\n"
        
        for i, source in enumerate(relevant_sources, 1):
            message += f"{i}. **{source.title}** (Relevance: {source.relevance_score:.2f})\n"
            message += f"   Why relevant: {source.reasoning}\n"
            message += f"   Document ID: {source.document_id}\n\n"
        
        message += "Please select the sources you want me to analyze by clicking the approval buttons, or type 'all' to approve all sources."
        
        return message

    def get_session_history(self, session_id: str) -> List[Message]:
        """Get conversation history for a session"""
        if session_id in self._sessions:
            return self._sessions[session_id]["messages"]
        return []

    def clear_session(self, session_id: str) -> bool:
        """Clear conversation history for a session"""
        if session_id in self._sessions:
            del self._sessions[session_id]
            return True
        return False