from typing import List, Dict
from langchain_core.messages import HumanMessage, AIMessage

from app.agents.consultation_agent import graph
from app.schemas.chat import Message

class ConsultationEngine:
    def __init__(self):
        self.graph = graph
        # Simple in-memory session storage
        self._sessions: Dict[str, List[Message]] = {}
    
    async def get_response(self, messages: List[Message], session_id: str) -> List[Message]:
        """Get response from consultation agent with session persistence"""
        
        # Get or create session history
        if session_id not in self._sessions:
            self._sessions[session_id] = []
        
        session_history = self._sessions[session_id]
        
        # Remember how many assistant messages we had before processing
        previous_assistant_count = len([msg for msg in session_history if msg.role == "assistant"])
        
        # Add new user messages to session history
        for msg in messages:
            if msg not in session_history:  # Avoid duplicates
                session_history.append(msg)
        
        # Convert ALL session messages to LangGraph format (for context)
        langgraph_messages = []
        for msg in session_history:
            if msg.role == "user":
                langgraph_messages.append(HumanMessage(content=msg.content))
            elif msg.role == "assistant":
                langgraph_messages.append(AIMessage(content=msg.content))
        
        # Create state with full conversation history
        initial_state = {
            "messages": langgraph_messages,
            "remaining_steps": 10,
            "search_results": [],
            "parsed_documents": {}
        }
        
        # Run the graph
        config = {"configurable": {"thread_id": session_id}}
        result = await self.graph.ainvoke(initial_state, config)
        
        # Convert back to API format - but only return NEW assistant messages
        all_messages = []
        print(f"Total messages from graph: {len(result['messages'])}")
        
        for i, msg in enumerate(result["messages"]):
            print(f"Message {i}: type={type(msg)}, content={repr(getattr(msg, 'content', 'NO_CONTENT'))}")
            
            # Check if message has content and it's not empty
            if not hasattr(msg, 'content'):
                print(f"Message {i}: No content attribute, skipping")
                continue
                
            content = msg.content
            if not content or not content.strip():
                print(f"Message {i}: Empty content '{repr(content)}', skipping")
                continue
                
            # Determine role
            role = None
            if hasattr(msg, 'type'):
                if msg.type == "human":
                    role = "user"
                elif msg.type == "ai":
                    role = "assistant"
                else:
                    print(f"Message {i}: Unknown type '{msg.type}', skipping")
                    continue
            elif isinstance(msg, HumanMessage):
                role = "user"
            elif isinstance(msg, AIMessage):
                role = "assistant"
            else:
                print(f"Message {i}: Unknown message class '{type(msg)}', skipping")
                continue
            
            # Create message with validation
            try:
                clean_content = content.strip()
                if len(clean_content) > 0:  # Double check before creating
                    all_messages.append(Message(
                        role=role,
                        content=clean_content
                    ))
                    print(f"Message {i}: Successfully added {role} message")
                else:
                    print(f"Message {i}: Content too short after strip: '{clean_content}'")
            except Exception as e:
                print(f"Message {i}: Validation error: {e}")
                continue
        
        # Store ALL messages in session history
        for msg in all_messages:
            if msg not in session_history:
                session_history.append(msg)
        
        # Update session storage
        self._sessions[session_id] = session_history
        
        # Return only the LATEST assistant message (there should be only one new one)
        assistant_messages = [msg for msg in all_messages if msg.role == "assistant"]
        latest_assistant_message = assistant_messages[-1] if assistant_messages else []
        
        print(f"Returning latest assistant message (total assistant messages in result: {len(assistant_messages)})")
        
        return [latest_assistant_message] if latest_assistant_message else []
    
    def get_session_history(self, session_id: str) -> List[Message]:
        """Get conversation history for a session"""
        return self._sessions.get(session_id, [])
    
    def clear_session(self, session_id: str) -> bool:
        """Clear conversation history for a session"""
        if session_id in self._sessions:
            del self._sessions[session_id]
            return True
        return False