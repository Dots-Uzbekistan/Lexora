from typing import List, Dict, Any, Annotated, Optional
from langchain_core.tools import tool, InjectedToolCallId
from langchain_core.messages import ToolMessage
from langgraph.prebuilt import InjectedState
from langgraph.types import Command, interrupt
from datetime import datetime
import re

from app.schemas.research_state import (
    SearchResult, ValidationResult, MultiSearchQuery, 
    DocumentContent, Artifact, ArtifactVersion
)
from app.tools.legal_search_service import legal_search_service
from app.tools.document_parser import legal_parser_instance


@tool
def generate_multi_search_strategy(
    user_question: str,
    legal_concepts_identified: Annotated[List[str], InjectedState("legal_concepts_identified")],
    search_queries_planned: Annotated[List[MultiSearchQuery], InjectedState("search_queries_planned")],
    tool_call_id: Annotated[str, InjectedToolCallId]
) -> Command:
    """Generate multiple search queries from general to specific for comprehensive legal research.
    
    Creates 3-5 progressive search queries that move from broad legal concepts to specific
    terms related to the user's question. This mimics how professional lawyers approach
    legal research in databases.
    
    Args:
        user_question: The user's legal research question
        legal_concepts_identified: Previously identified legal concepts (injected from state)
        search_queries_planned: Previously planned queries (injected from state)
    
    Returns:
        Command object that updates state with planned search queries
    """
    
    # Skip if already planned
    if search_queries_planned:
        return Command(
            update={
                "messages": [ToolMessage("Search strategy already planned", tool_call_id=tool_call_id)]
            }
        )
    
    # Analyze the question to identify legal concepts
    question_lower = user_question.lower()
    
    # Common Uzbek legal concepts mapping
    legal_concept_keywords = {
        "трудовой": ["трудовое право", "трудовые отношения", "трудовой договор"],
        "пенсия": ["пенсионное обеспечение", "социальные выплаты", "пенсионный фонд"],
        "налог": ["налоговое право", "налогообложение", "налоговый кодекс"],
        "договор": ["договорное право", "обязательства", "гражданское право"],
        "собственность": ["право собственности", "имущественные права", "гражданское право"],
        "семья": ["семейное право", "брак", "семейные отношения"],
        "наследство": ["наследственное право", "наследование", "завещание"],
        "уголовн": ["уголовное право", "уголовная ответственность", "уголовный кодекс"],
        "административн": ["административное право", "административная ответственность"],
        "земля": ["земельное право", "земельные отношения", "землепользование"],
        "предприниматель": ["предпринимательское право", "бизнес", "коммерческое право"]
    }
    
    # Identify relevant legal areas
    identified_concepts = []
    for keyword, concepts in legal_concept_keywords.items():
        if keyword in question_lower:
            identified_concepts.extend(concepts)
    
    # If no specific concepts found, use general approach
    if not identified_concepts:
        identified_concepts = ["правовое регулирование", "законодательство", "правовые нормы"]
    
    # Generate search queries (3-5 queries from general to specific)
    planned_queries = []
    
    # Query 1: Most general - broad legal area
    if identified_concepts:
        general_query = identified_concepts[0]
        planned_queries.append(MultiSearchQuery(
            query=general_query,
            query_type="general",
            legal_concepts=[general_query],
            rationale=f"Broad search for general legal framework in {general_query}"
        ))
    
    # Query 2: Medium specificity - combine concepts with key terms
    key_terms = re.findall(r'\b[а-яё]{4,}\b', question_lower)[:3]  # Extract key Russian words
    if key_terms and identified_concepts:
        medium_query = f"{identified_concepts[0]} {' '.join(key_terms[:2])}"
        planned_queries.append(MultiSearchQuery(
            query=medium_query,
            query_type="medium",
            legal_concepts=identified_concepts[:2],
            rationale=f"Medium specificity search combining legal area with key terms"
        ))
    
    # Query 3: Specific - focused on main question elements
    if len(key_terms) >= 2:
        specific_query = ' '.join(key_terms[:3])
        planned_queries.append(MultiSearchQuery(
            query=specific_query,
            query_type="specific",
            legal_concepts=key_terms[:3],
            rationale="Specific search using key terms from user question"
        ))
    
    # Query 4: Alternative approach (if complex question)
    if len(key_terms) >= 4 or len(identified_concepts) > 1:
        alt_concepts = identified_concepts[1:2] if len(identified_concepts) > 1 else key_terms[3:4]
        alt_query = ' '.join(alt_concepts)
        planned_queries.append(MultiSearchQuery(
            query=alt_query,
            query_type="alternative",
            legal_concepts=alt_concepts,
            rationale="Alternative search approach for comprehensive coverage"
        ))
    
    # Query 5: Very specific (if needed)
    if len(question_lower.split()) > 8:  # Complex question
        very_specific = ' '.join(key_terms[:4]) if len(key_terms) >= 4 else user_question[:50]
        planned_queries.append(MultiSearchQuery(
            query=very_specific,
            query_type="very_specific",
            legal_concepts=key_terms[:4],
            rationale="Very specific search for complex multi-part question"
        ))
    
    # Ensure we have at least 3 queries
    if len(planned_queries) < 3:
        # Add fallback query
        fallback_query = user_question[:30] + "..." if len(user_question) > 30 else user_question
        planned_queries.append(MultiSearchQuery(
            query=fallback_query,
            query_type="fallback",
            legal_concepts=[],
            rationale="Fallback search using truncated user question"
        ))
    
    strategy_summary = f"Generated {len(planned_queries)} search queries: " + \
                      " → ".join([f"{q.query_type}({q.query})" for q in planned_queries])
    
    return Command(
        update={
            "search_queries_planned": planned_queries,
            "legal_concepts_identified": list(set(identified_concepts + key_terms)),
            "search_strategy_rationale": strategy_summary,
            "completed_stages": ["strategy_generated"],
            "messages": [ToolMessage(f"Search strategy generated: {strategy_summary}", tool_call_id=tool_call_id)]
        }
    )


@tool  
def execute_multi_search(
    search_queries_planned: Annotated[List[MultiSearchQuery], InjectedState("search_queries_planned")],
    search_queries_executed: Annotated[List[str], InjectedState("search_queries_executed")],
    raw_search_results: Annotated[List[SearchResult], InjectedState("raw_search_results")],
    tool_call_id: Annotated[str, InjectedToolCallId]
) -> Command:
    """Execute the planned search queries using Brave Search and collect results.
    
    Args:
        search_queries_planned: Planned search queries (injected from state)
        search_queries_executed: Already executed queries (injected from state)
        raw_search_results: Existing search results (injected from state)
    
    Returns:
        Command object that updates state with search results
    """
    
    if not search_queries_planned:
        return Command(
            update={
                "messages": [ToolMessage("No search queries planned. Generate strategy first.", tool_call_id=tool_call_id)]
            }
        )
    
    new_results = []
    executed_queries = []
    
    for query_plan in search_queries_planned:
        if query_plan.query in search_queries_executed:
            continue  # Skip already executed
            
        # Execute search using Brave Search
        search_response = legal_search_service.search_legal_documents(query_plan.query)
        
        if search_response["search_successful"] and search_response["documents"]:
            # Convert to SearchResult objects
            for doc in search_response["documents"]:
                search_result = SearchResult(
                    document_id=doc['document_id'],
                    title=doc['title'],
                    snippet=doc['snippet'],
                    url=doc['url'],
                    document_date=doc['document_date'],
                    relevance_score=doc['relevance_score']
                )
                new_results.append(search_result)
            
            executed_queries.append(query_plan.query)
    
    # Remove duplicates based on document_id
    all_results = raw_search_results + new_results
    unique_results = []
    seen_ids = set()
    
    for result in all_results:
        if result.document_id not in seen_ids:
            unique_results.append(result)
            seen_ids.add(result.document_id)
    
    # Create detailed results for agent visibility
    execution_summary = f"Executed {len(executed_queries)} searches, found {len(new_results)} new documents, total unique: {len(unique_results)}"
    
    if unique_results:
        detailed_results = f"{execution_summary}\n\nFound documents:\n"
        for i, result in enumerate(unique_results, 1):
            date_info = f" - {result.document_date}" if result.document_date else ""
            detailed_results += f"{i}. **{result.title}**{date_info}\n"
            detailed_results += f"   ID: {result.document_id}\n"
            detailed_results += f"   Score: {result.relevance_score:.2f}\n"
            detailed_results += f"   Snippet: {result.snippet[:150]}...\n\n"
    else:
        detailed_results = execution_summary
    
    return Command(
        update={
            "raw_search_results": unique_results,
            "search_queries_executed": search_queries_executed + executed_queries,
            "completed_stages": ["multi_search_executed"],
            "messages": [ToolMessage(detailed_results, tool_call_id=tool_call_id)]
        }
    )


@tool
def validate_and_rank_sources(
    raw_search_results: Annotated[List[SearchResult], InjectedState("raw_search_results")],
    current_user_question: Annotated[str, InjectedState("current_user_question")],
    validation_results: Annotated[List[ValidationResult], InjectedState("validation_results")],
    tool_call_id: Annotated[str, InjectedToolCallId]
) -> Command:
    """Validate search results for relevance and eliminate duplicates.
    
    Args:
        raw_search_results: Search results to validate (injected from state)
        current_user_question: User's question for relevance check (injected from state)
        validation_results: Existing validation results (injected from state)
    
    Returns:
        Command object that updates state with validation results
    """
    
    if not raw_search_results:
        return Command(
            update={
                "messages": [ToolMessage("No search results to validate", tool_call_id=tool_call_id)]
            }
        )
    
    if validation_results:
        return Command(
            update={
                "messages": [ToolMessage("Sources already validated", tool_call_id=tool_call_id)]
            }
        )
    
    validated_results = []
    question_keywords = set(current_user_question.lower().split())
    
    for result in raw_search_results:
        # Calculate relevance based on title and snippet
        title_words = set(result.title.lower().split())
        snippet_words = set(result.snippet.lower().split())
        
        # Keyword overlap score
        title_overlap = len(question_keywords.intersection(title_words)) / max(len(question_keywords), 1)
        snippet_overlap = len(question_keywords.intersection(snippet_words)) / max(len(question_keywords), 1)
        
        # Combined relevance score
        relevance_score = (title_overlap * 0.4 + snippet_overlap * 0.3 + result.relevance_score * 0.3)
        
        # Determine if relevant (threshold: 0.3)
        is_relevant = relevance_score >= 0.3
        
        # Generate brief one-sentence reasoning for why this source is relevant
        if is_relevant:
            # Create meaningful reasoning based on content overlap
            overlapping_keywords = question_keywords.intersection(title_words.union(snippet_words))
            if overlapping_keywords:
                key_matches = list(overlapping_keywords)[:3]  # Top 3 matching keywords
                reasoning = f"Contains key terms: {', '.join(key_matches)} - directly addresses the question"
            else:
                reasoning = f"High relevance score ({relevance_score:.2f}) - content matches question intent"
        else:
            reasoning = f"Limited relevance ({relevance_score:.2f}) - few matching keywords with question"
        
        validation_result = ValidationResult(
            document_id=result.document_id,
            title=result.title,
            is_relevant=is_relevant,
            relevance_score=relevance_score,
            reasoning=reasoning
        )
        validated_results.append(validation_result)
    
    # Sort by relevance score
    validated_results.sort(key=lambda x: x.relevance_score, reverse=True)
    
    relevant_count = sum(1 for r in validated_results if r.is_relevant)
    validation_summary = f"Validated {len(validated_results)} sources: {relevant_count} relevant, {len(validated_results) - relevant_count} not relevant"
    
    # Create detailed validation results for agent visibility
    detailed_validation = f"{validation_summary}\n\nValidation Results:\n"
    
    # Show relevant sources first
    relevant_sources = [r for r in validated_results if r.is_relevant]
    if relevant_sources:
        detailed_validation += "\n**RELEVANT SOURCES:**\n"
        for i, result in enumerate(relevant_sources, 1):
            detailed_validation += f"{i}. **{result.title}** (Score: {result.relevance_score:.2f})\n"
            detailed_validation += f"   ID: {result.document_id}\n"
            detailed_validation += f"   Reasoning: {result.reasoning}\n\n"
    
    # Show top 3 non-relevant sources for context
    non_relevant_sources = [r for r in validated_results if not r.is_relevant][:3]
    if non_relevant_sources:
        detailed_validation += "**TOP NON-RELEVANT SOURCES (for context):**\n"
        for i, result in enumerate(non_relevant_sources, 1):
            detailed_validation += f"{i}. **{result.title}** (Score: {result.relevance_score:.2f})\n"
            detailed_validation += f"   ID: {result.document_id}\n"
            detailed_validation += f"   Reasoning: {result.reasoning}\n\n"
    
    return Command(
        update={
            "validation_results": validated_results,
            "completed_stages": ["sources_validated"],
            "messages": [ToolMessage(detailed_validation, tool_call_id=tool_call_id)]
        }
    )


@tool
def request_source_approval(
    validation_results: Annotated[List[ValidationResult], InjectedState("validation_results")],
    current_user_question: Annotated[str, InjectedState("current_user_question")],
    completed_stages: Annotated[List[str], InjectedState("completed_stages")],
    tool_call_id: Annotated[str, InjectedToolCallId]
) -> Command:
    """Request human approval for validated sources before proceeding with document analysis.
    
    Uses LangGraph's interrupt functionality to pause execution until human input.
    
    Args:
        validation_results: Validation results (injected from state)
        current_user_question: User's question (injected from state)
        completed_stages: Completed workflow stages (injected from state)
    
    Returns:
        Command object that sets up approval workflow and interrupts execution
    """
    
    if not validation_results:
        return Command(
            update={
                "messages": [ToolMessage("No validation results available for approval", tool_call_id=tool_call_id)]
            }
        )
    
    if "source_approval_requested" in completed_stages:
        return Command(
            update={
                "pending_approval": True,
                "messages": [ToolMessage("Source approval already requested, waiting for response", tool_call_id=tool_call_id)]
            }
        )
    
    # Prepare approval request with relevant sources
    relevant_sources = [r for r in validation_results if r.is_relevant]
    
    # Handle case where no sources are relevant
    if len(relevant_sources) == 0:
        no_sources_message = f"I searched for sources related to: {current_user_question}\n\n"
        no_sources_message += f"Unfortunately, I found {len(validation_results)} sources but none were sufficiently relevant to your question.\n\n"
        no_sources_message += "Would you like me to:\n"
        no_sources_message += "1. Try a different search approach\n"
        no_sources_message += "2. Broaden the search criteria\n"
        no_sources_message += "3. Proceed with the best available sources anyway\n\n"
        no_sources_message += "Please let me know how you'd like to proceed."
        
        return Command(
            update={
                "pending_approval": True,
                "approval_required_for": "no_sources",
                "workflow_stage": "no_relevant_sources",
                "completed_stages": completed_stages + ["no_relevant_sources_found"],
                "messages": [ToolMessage(no_sources_message, tool_call_id=tool_call_id)]
            }
        )
    
    approval_text = f"Found {len(relevant_sources)} relevant sources for: {current_user_question}\n\n"
    approval_text += "Please review and approve sources:\n"
    
    for i, source in enumerate(relevant_sources, 1):
        approval_text += f"{i}. **{source.title}** (Score: {source.relevance_score:.2f})\n"
        approval_text += f"   Reasoning: {source.reasoning}\n"
        approval_text += f"   Document ID: {source.document_id}\n\n"
    
    approval_text += "Reply with document IDs to approve (e.g., '123456 789012') or 'all' to approve all relevant sources."
    
    # Set up state for approval and interrupt
    update_state = {
        "pending_approval": True,
        "approval_required_for": "sources",
        "last_approval_request": approval_text,
        "workflow_stage": "awaiting_approval",
        "completed_stages": completed_stages + ["source_approval_requested"],
        "messages": [ToolMessage(approval_text, tool_call_id=tool_call_id)]
    }
    
    # Interrupt execution for human input
    return Command(update=update_state, graph=interrupt(approval_text))



@tool
def artifact(
    command: str,
    artifact_id: str,
    title: Optional[str] = None,
    artifact_type: Optional[str] = None,
    content: Optional[str] = None,
    old_str: Optional[str] = None,
    new_str: Optional[str] = None,
    stage: Optional[str] = None,
    *,
    artifacts: Annotated[Dict[str, Artifact], InjectedState("artifacts")],
    tool_call_id: Annotated[str, InjectedToolCallId]
) -> Command:
    """Manage artifacts with version control for legal documents.
    
    Args:
        command: Action to perform (create, update, rewrite)
        artifact_id: Semantic identifier chosen by agent
        title: Title of artifact (required for create)
        artifact_type: Type of artifact (required for create)
        content: Full content (required for create/rewrite)
        old_str: String to replace (required for update)
        new_str: Replacement string (required for update)
        stage: Stage of artifact (draft, review, final)
    
    Returns:
        Command object with artifact XML response
    """
    
    if command == "create":
        if not title or not artifact_type or not content:
            return Command(
                update={
                    "messages": [ToolMessage("Create command requires title, artifact_type, and content", tool_call_id=tool_call_id)]
                }
            )
        
        # Create new artifact with first version
        version_1 = ArtifactVersion(
            version=1,
            content=content,
            created_at=datetime.now().isoformat(),
            stage=stage or "draft"
        )
        
        new_artifact = Artifact(
            id=artifact_id,
            title=title,
            type=artifact_type,
            current_version=1,
            versions={1: version_1}
        )
        
        updated_artifacts = {**artifacts, artifact_id: new_artifact}
        
        # Generate XML response
        xml_response = f"""<artifact command="create" artifact_id="{artifact_id}" title="{title}" type="{artifact_type}" stage="{stage or 'draft'}">
{content}
</artifact>"""
        
        return Command(
            update={
                "artifacts": updated_artifacts,
                "current_artifact_id": artifact_id,
                "messages": [ToolMessage(xml_response, tool_call_id=tool_call_id)]
            }
        )
    
    elif command == "update":
        if not old_str or not new_str:
            return Command(
                update={
                    "messages": [ToolMessage("Update command requires old_str and new_str", tool_call_id=tool_call_id)]
                }
            )
        
        if artifact_id not in artifacts:
            return Command(
                update={
                    "messages": [ToolMessage(f"Artifact {artifact_id} not found", tool_call_id=tool_call_id)]
                }
            )
        
        artifact = artifacts[artifact_id]
        current_content = artifact.get_current_content()
        
        if old_str not in current_content:
            return Command(
                update={
                    "messages": [ToolMessage(f"String '{old_str}' not found in artifact", tool_call_id=tool_call_id)]
                }
            )
        
        # Update content
        new_content = current_content.replace(old_str, new_str)
        new_version_num = artifact.current_version + 1
        
        new_version = ArtifactVersion(
            version=new_version_num,
            content=new_content,
            created_at=datetime.now().isoformat(),
            stage=stage or artifact.versions[artifact.current_version].stage
        )
        
        updated_artifact = Artifact(
            id=artifact.id,
            title=artifact.title,
            type=artifact.type,
            current_version=new_version_num,
            versions={**artifact.versions, new_version_num: new_version}
        )
        
        updated_artifacts = {**artifacts, artifact_id: updated_artifact}
        
        xml_response = f"""<artifact command="update" artifact_id="{artifact_id}" old_str="{old_str}" new_str="{new_str}">
{new_content}
</artifact>"""
        
        return Command(
            update={
                "artifacts": updated_artifacts,
                "messages": [ToolMessage(xml_response, tool_call_id=tool_call_id)]
            }
        )
    
    elif command == "rewrite":
        if not content:
            return Command(
                update={
                    "messages": [ToolMessage("Rewrite command requires content", tool_call_id=tool_call_id)]
                }
            )
        
        if artifact_id not in artifacts:
            return Command(
                update={
                    "messages": [ToolMessage(f"Artifact {artifact_id} not found", tool_call_id=tool_call_id)]
                }
            )
        
        artifact = artifacts[artifact_id]
        new_version_num = artifact.current_version + 1
        
        new_version = ArtifactVersion(
            version=new_version_num,
            content=content,
            created_at=datetime.now().isoformat(),
            stage=stage or artifact.versions[artifact.current_version].stage
        )
        
        updated_artifact = Artifact(
            id=artifact.id,
            title=artifact.title,
            type=artifact.type,
            current_version=new_version_num,
            versions={**artifact.versions, new_version_num: new_version}
        )
        
        updated_artifacts = {**artifacts, artifact_id: updated_artifact}
        
        xml_response = f"""<artifact command="rewrite" artifact_id="{artifact_id}">
{content}
</artifact>"""
        
        return Command(
            update={
                "artifacts": updated_artifacts,
                "messages": [ToolMessage(xml_response, tool_call_id=tool_call_id)]
            }
        )
    
    else:
        return Command(
            update={
                "messages": [ToolMessage(f"Unknown command: {command}", tool_call_id=tool_call_id)]
            }
        )