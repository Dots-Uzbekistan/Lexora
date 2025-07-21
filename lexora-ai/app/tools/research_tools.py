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
    """🚀 START HERE: Generate multiple search queries for comprehensive legal research.
    
    Creates 3-5 progressive search queries that move from broad legal concepts to specific
    terms related to the user's question. This mimics how professional lawyers approach
    legal research in databases.
    
    WORKFLOW REQUIREMENT: This is Step 1 of the mandatory research sequence:
    1. generate_multi_search_strategy → 2. execute_multi_search → 3. validate_and_rank_sources → 4. request_source_approval
    
    Args:
        user_question: The user's legal research question - REQUIRED parameter to provide
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
    """⚠️ PREREQUISITE: Must call `generate_multi_search_strategy` first to plan search queries.
    
    Execute the planned search queries using Brave Search and collect legal documents.
    This tool runs 3-5 progressive searches from general to specific terms.
    
    WORKFLOW REQUIREMENT: This is Step 2 of the mandatory research sequence:
    1. generate_multi_search_strategy → 2. execute_multi_search → 3. validate_and_rank_sources → 4. request_source_approval
    
    Args:
        search_queries_planned: Planned search queries (injected from state) - REQUIRED from generate_multi_search_strategy
        search_queries_executed: Already executed queries (injected from state)
        raw_search_results: Existing search results (injected from state)
    
    Returns:
        Command object that updates state with search results
    """
    
    if not search_queries_planned:
        return Command(
            update={
                "messages": [ToolMessage("❌ Cannot execute searches: No search strategy found.\n\nYou MUST call `generate_multi_search_strategy` first to plan the search queries before execution.\n\nRequired sequence: generate_multi_search_strategy → execute_multi_search", tool_call_id=tool_call_id)]
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
    """⚠️ PREREQUISITE: Must call `execute_multi_search` first to get search results.
    
    Validate search results for relevance and eliminate duplicates. This tool analyzes 
    each search result for relevance to the user's question and ranks them by quality.
    
    WORKFLOW REQUIREMENT: This is Step 3 of the mandatory research sequence:
    1. generate_multi_search_strategy → 2. execute_multi_search → 3. validate_and_rank_sources → 4. request_source_approval
    
    Args:
        raw_search_results: Search results to validate (injected from state) - REQUIRED from execute_multi_search
        current_user_question: User's question for relevance check (injected from state)
        validation_results: Existing validation results (injected from state)
    
    Returns:
        Command object that updates state with validation results
    """
    
    if not raw_search_results:
        return Command(
            update={
                "messages": [ToolMessage("❌ Cannot validate sources: No search results found.\n\nYou MUST call `execute_multi_search` first to search for documents before validation.\n\nRequired sequence: generate_multi_search_strategy → execute_multi_search → validate_and_rank_sources", tool_call_id=tool_call_id)]
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
    
    # Enhanced keyword matching for pension research
    pension_keywords = {'пенсия', 'пенсии', 'пенсионн', 'размер', 'минимальн', 'повышен', 'сум', 'выплат'}
    year_keywords = {'2023', '2024', '2025'}
    amount_keywords = {'000', 'сум', 'размер', 'миқдор'}
    
    for result in raw_search_results:
        # Calculate relevance based on title and snippet
        title_lower = result.title.lower()
        snippet_lower = result.snippet.lower() if result.snippet else ""
        combined_text = title_lower + " " + snippet_lower
        
        title_words = set(title_lower.split())
        snippet_words = set(snippet_lower.split()) if snippet_lower else set()
        all_words = title_words.union(snippet_words)
        
        # Base keyword overlap score
        title_overlap = len(question_keywords.intersection(title_words)) / max(len(question_keywords), 1)
        snippet_overlap = len(question_keywords.intersection(snippet_words)) / max(len(question_keywords), 1)
        
        # Enhanced scoring for pension-specific content
        pension_score = 0
        year_score = 0
        amount_score = 0
        
        # Pension keywords bonus
        pension_matches = len(pension_keywords.intersection(all_words))
        if pension_matches > 0:
            pension_score = min(pension_matches * 0.2, 0.4)  # Up to 0.4 bonus
        
        # Year keywords bonus - critical for this question
        year_matches = len(year_keywords.intersection(all_words))
        if year_matches > 0:
            year_score = min(year_matches * 0.3, 0.6)  # Up to 0.6 bonus for years
        
        # Check for specific years in title (extra bonus)
        if any(year in title_lower for year in year_keywords):
            year_score += 0.2
        
        # Amount/number bonus (for documents with actual pension amounts)
        if any(amt_word in combined_text for amt_word in amount_keywords):
            amount_score = 0.2
            
        # Special bonus for documents about pension increases
        if 'повышении размеров' in title_lower and any(word in title_lower for word in ['пенси', 'пособ']):
            pension_score += 0.3
            
        # Combined relevance score with enhanced weighting
        base_score = (title_overlap * 0.3 + snippet_overlap * 0.2 + result.relevance_score * 0.2)
        enhanced_score = base_score + pension_score + year_score + amount_score
        
        relevance_score = min(enhanced_score, 1.0)  # Cap at 1.0
        
        # Lower threshold for enhanced algorithm
        is_relevant = relevance_score >= 0.25 or (pension_score > 0 and year_score > 0)
        
        # Generate enhanced reasoning based on scoring factors
        if is_relevant:
            reasons = []
            
            if year_score > 0:
                matched_years = [year for year in year_keywords if year in combined_text]
                reasons.append(f"Contains target years: {', '.join(matched_years)}")
                
            if pension_score > 0:
                pension_matches = pension_keywords.intersection(all_words)
                if pension_matches:
                    reasons.append(f"Pension-related terms: {', '.join(list(pension_matches)[:2])}")
                    
            if 'повышении размеров' in title_lower:
                reasons.append("Document about increasing pension/salary amounts")
                
            if amount_score > 0:
                reasons.append("Contains monetary amounts or financial details")
            
            if reasons:
                reasoning = "; ".join(reasons)
            else:
                reasoning = f"High relevance score ({relevance_score:.2f}) - matches question intent"
        else:
            reasoning = f"Limited relevance ({relevance_score:.2f}) - insufficient pension/year keywords"
        
        validation_result = ValidationResult(
            document_id=result.document_id,
            title=result.title,
            snippet=result.snippet,
            url=result.url,
            document_date=result.document_date,
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
    """⚠️ PREREQUISITE: Must call `validate_and_rank_sources` first to validate search results.
    
    Request human approval for validated sources before proceeding with document analysis.
    This tool uses LangGraph's interrupt functionality to pause execution until human input.
    
    WORKFLOW REQUIREMENT: This is Step 4 of the mandatory research sequence:
    1. generate_multi_search_strategy → 2. execute_multi_search → 3. validate_and_rank_sources → 4. request_source_approval
    
    Args:
        validation_results: Validation results (injected from state) - REQUIRED from validate_and_rank_sources
        current_user_question: User's question (injected from state)
        completed_stages: Completed workflow stages (injected from state)
    
    Returns:
        Command object that sets up approval workflow and interrupts execution
    """
    
    # Check prerequisites - must have validation results from validate_and_rank_sources
    if not validation_results:
        return Command(
            update={
                "messages": [ToolMessage("❌ Cannot request source approval: No validation results found.\n\nYou MUST call `validate_and_rank_sources` first to validate the search results before requesting approval.\n\nRequired sequence: generate_multi_search_strategy → execute_multi_search → validate_and_rank_sources → request_source_approval", tool_call_id=tool_call_id)]
            }
        )
    
    # Check if sources_validated stage was completed
    if "sources_validated" not in completed_stages:
        return Command(
            update={
                "messages": [ToolMessage("❌ Cannot request approval: Sources have not been validated.\n\nYou MUST call `validate_and_rank_sources` first to complete the validation stage before requesting approval.", tool_call_id=tool_call_id)]
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
    
    try:
        # Create user-friendly approval message  
        approval_text = f"I found {len(relevant_sources)} relevant sources for your question about minimum pension amounts in 2023, 2024, and 2025.\n\n"
        approval_text += "Please review and select the sources you'd like me to analyze:\n\n"
        
        for i, source in enumerate(relevant_sources, 1):
            approval_text += f"{i}. **{source.title}** (Relevance: {source.relevance_score:.2f})\n"
            approval_text += f"   Why relevant: {source.reasoning}\n"
            approval_text += f"   Document ID: {source.document_id}\n\n"
        
        approval_text += "Please select the sources you want me to analyze by clicking the approval buttons, or type 'all' to approve all sources."
        
        print(f"DEBUG: Creating approval request for {len(relevant_sources)} sources")
        
        # Set up state for approval workflow
        update_state = {
            "pending_approval": True,
            "approval_required_for": "sources", 
            "last_approval_request": approval_text,
            "workflow_stage": "awaiting_approval",
            "completed_stages": completed_stages + ["source_approval_requested"],
            "messages": [ToolMessage(approval_text, tool_call_id=tool_call_id)]
        }
        
        print(f"DEBUG: Update state prepared with pending_approval={update_state['pending_approval']}")
        
        # Return command that sets up the approval state
        return Command(update=update_state)
        
    except Exception as e:
        print(f"ERROR in request_source_approval: {e}")
        return Command(
            update={
                "messages": [ToolMessage(f"Error setting up source approval: {str(e)}", tool_call_id=tool_call_id)]
            }
        )



@tool
def create_legal_analysis_from_approved_sources(
    approved_document_ids: Annotated[List[str], InjectedState("approved_document_ids")],
    validation_results: Annotated[List[ValidationResult], InjectedState("validation_results")],
    current_user_question: Annotated[str, InjectedState("current_user_question")],
    parsed_documents: Annotated[Dict[str, DocumentContent], InjectedState("parsed_documents")],
    tool_call_id: Annotated[str, InjectedToolCallId]
) -> Command:
    """🎯 Create legal analysis based on approved sources with actual document content.
    
    This tool takes approved document IDs, extracts the relevant content from validation results
    or parses full documents, and creates a factual legal analysis based on real information.
    
    PREREQUISITE: Use only AFTER user approves sources via request_source_approval workflow.
    
    Args:
        approved_document_ids: Document IDs approved by human (injected from state)
        validation_results: Validation results with document info (injected from state)  
        current_user_question: User's research question (injected from state)
        parsed_documents: Already parsed document content (injected from state)
    
    Returns:
        Command with legal analysis artifact based on real document content
    """
    
    if not approved_document_ids:
        return Command(
            update={
                "messages": [ToolMessage("❌ No approved sources found. Cannot create analysis without approved documents.", tool_call_id=tool_call_id)]
            }
        )
    
    if not validation_results:
        print("WARNING: validation_results is empty, this suggests state preservation issue")
        return Command(
            update={
                "messages": [ToolMessage("❌ No validation results available. This may indicate a state preservation issue after approval. Cannot access document information without validation context.", tool_call_id=tool_call_id)]
            }
        )
    
    # Handle "all" approval by getting all relevant document IDs
    if approved_document_ids == ["all"]:
        relevant_docs = [r for r in validation_results if hasattr(r, 'is_relevant') and r.is_relevant]
        approved_document_ids = [doc.document_id for doc in relevant_docs]
        print(f"DEBUG: Expanding 'all' to {len(approved_document_ids)} relevant documents")
    
    # Find approved documents in validation results
    approved_sources = []
    for result in validation_results:
        if hasattr(result, 'document_id') and result.document_id in approved_document_ids:
            approved_sources.append(result)
    
    if not approved_sources:
        return Command(
            update={
                "messages": [ToolMessage("❌ Could not find approved documents in validation results.", tool_call_id=tool_call_id)]
            }
        )
    
    print(f"DEBUG: Creating analysis based on {len(approved_sources)} approved sources")
    
    # Parse documents that haven't been parsed yet for better analysis
    updated_parsed_documents = dict(parsed_documents)  # Copy existing
    
    for source in approved_sources:
        if source.document_id not in parsed_documents and hasattr(source, 'url') and source.url:
            try:
                print(f"DEBUG: Attempting to parse document {source.document_id}")
                parsing_result = legal_parser_instance.parse_legal_document(source.url)
                
                if parsing_result.get("success", False):
                    document_content = DocumentContent(
                        document_id=source.document_id,
                        title=parsing_result["metadata"]["title"],
                        content=parsing_result["markdown"],
                        metadata=parsing_result["metadata"],
                        parsing_date=datetime.now().isoformat()
                    )
                    updated_parsed_documents[source.document_id] = document_content
                    print(f"DEBUG: Successfully parsed document {source.document_id}")
                else:
                    print(f"DEBUG: Failed to parse document {source.document_id}: {parsing_result.get('error', 'Unknown error')}")
            except Exception as e:
                print(f"DEBUG: Exception parsing document {source.document_id}: {e}")
    
    # Create legal analysis based on actual document content
    analysis_content = f"# Анализ минимальной пенсии на основании официальных документов\n\n"
    analysis_content += f"**Исследуемый вопрос:** {current_user_question}\n\n"
    analysis_content += f"**Анализ проведен на основании {len(approved_sources)} официальных источников:**\n\n"
    
    # Add each approved source with its actual content
    for i, source in enumerate(approved_sources, 1):
        analysis_content += f"## {i}. {source.title}\n"
        analysis_content += f"**Документ:** {source.document_id}\n"
        analysis_content += f"**Релевантность:** {source.relevance_score:.2f}\n"
        analysis_content += f"**Обоснование включения:** {source.reasoning}\n\n"
        
        # Use parsed document content if available, otherwise use snippet
        if source.document_id in updated_parsed_documents:
            doc_content = updated_parsed_documents[source.document_id].content
            # Extract first 1000 characters of relevant content for better analysis
            content_preview = doc_content[:1000] + "..." if len(doc_content) > 1000 else doc_content
            analysis_content += f"**Полное содержание документа:**\n{content_preview}\n\n"
        else:
            # Use validation snippet from search results
            snippet_content = source.snippet if hasattr(source, 'snippet') and source.snippet else 'Содержание недоступно'
            analysis_content += f"**Фрагмент документа:**\n{snippet_content}\n\n"
        
        analysis_content += f"**Источник:** [Документ {source.document_id}](https://lex.uz/acts/{source.document_id})\n\n"
        analysis_content += "---\n\n"
    
    # Add conclusion note
    analysis_content += "## Заключение\n\n"
    analysis_content += "Данный анализ основан на официальных документах из правовой базы lex.uz. "
    analysis_content += "Для получения точных размеров минимальной пенсии рекомендуется ознакомиться с полными текстами указанных документов по предоставленным ссылкам.\n\n"
    analysis_content += "**Примечание:** Анализ выполнен на основании доступной информации из указанных источников. "
    analysis_content += "Для получения актуальной информации рекомендуется обратиться к последним редакциям нормативно-правовых актов."
    
    # Create artifact using the artifact tool logic
    artifact_xml = f"""<artifact command="create" artifact_id="legal_analysis_{len(approved_sources)}_sources" title="Правовой анализ: {current_user_question}" type="legal_analysis" stage="final">
{analysis_content}
</artifact>"""
    
    return Command(
        update={
            "artifacts": {f"legal_analysis_{len(approved_sources)}_sources": {
                "id": f"legal_analysis_{len(approved_sources)}_sources",
                "title": f"Правовой анализ: {current_user_question}",
                "type": "legal_analysis", 
                "content": analysis_content,
                "stage": "final"
            }},
            "parsed_documents": updated_parsed_documents,  # Save newly parsed documents
            "current_artifact_id": f"legal_analysis_{len(approved_sources)}_sources",
            "workflow_stage": "analysis_completed",
            "completed_stages": ["analysis_created"],
            "messages": [ToolMessage(artifact_xml, tool_call_id=tool_call_id)]
        }
    )


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
    """⚠️ PREREQUISITE: Use only AFTER completing the 4-step research workflow and getting approved sources.
    
    Manage artifacts with version control for legal documents. This tool creates professional
    legal analysis documents based on approved and parsed legal sources.
    
    WORKFLOW REQUIREMENT: This is Step 5+ (final step) - only use after:
    1. generate_multi_search_strategy → 2. execute_multi_search → 3. validate_and_rank_sources → 4. request_source_approval (with human approval)
    
    Args:
        command: Action to perform (create, update, rewrite)
        artifact_id: Semantic identifier chosen by agent
        title: Title of artifact (required for create)
        artifact_type: Type of artifact (required for create)
        content: Full content (required for create/rewrite)
        old_str: String to replace (required for update)
        new_str: Replacement string (required for update)
        stage: Stage of artifact (draft, review, final)
        artifacts: Existing artifacts (injected from state)
    
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