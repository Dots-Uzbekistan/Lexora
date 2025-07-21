from typing import List, Dict, Any, Annotated
from langchain_core.tools import tool, InjectedToolCallId
from langchain_core.messages import ToolMessage
from langgraph.prebuilt import InjectedState
from langgraph.types import Command
from datetime import datetime

from app.schemas.consultation_state import SearchResult, DocumentContent
from app.tools.legal_search_service import legal_search_service
from app.tools.document_parser import legal_parser_instance


@tool
def consultation_search(
    query: str,
    search_results: Annotated[List[SearchResult], InjectedState("search_results")],
    tool_call_id: Annotated[str, InjectedToolCallId]
) -> Command:
    """Search for legal documents and return visible results for consultation agent."""
    
    # Perform the search
    results = legal_search_service.search_legal_documents(query)
    
    # Handle search failures
    if not results["search_successful"]:
        return Command(
            update={
                "has_searched": True,
                "last_search_query": query,
                "messages": [ToolMessage(f"Brave Search failed for query: {query}. Error: {results.get('error', 'Unknown error')}", tool_call_id=tool_call_id)]
            }
        )
    
    # Handle no results
    if results["total_found"] == 0:
        return Command(
            update={
                "has_searched": True,
                "last_search_query": query,
                "search_results": [],
                "messages": [ToolMessage(f"No legal documents found for query: {query}", tool_call_id=tool_call_id)]
            }
        )
    
    # Convert to SearchResult objects
    search_result_objects = []
    sorted_docs = sorted(results["documents"], key=lambda x: x['relevance_score'], reverse=True)
    
    for doc in sorted_docs[:10]:  # Limit to top 10 results
        search_result_objects.append(SearchResult(
            document_id=doc['document_id'],
            title=doc['title'],
            snippet=doc['snippet'],
            url=doc['url'],
            document_date=doc['document_date'],
            relevance_score=doc['relevance_score']
        ))
    
    # Format results for agent visibility
    results_text = f"Found {len(search_result_objects)} legal documents via Brave Search:\n\n"
    for i, doc in enumerate(search_result_objects, 1):
        date_info = f" - {doc.document_date}" if doc.document_date else ""
        results_text += f"{i}. **{doc.title}**{date_info}\n"
        results_text += f"   ID: {doc.document_id}\n"
        results_text += f"   Snippet: {doc.snippet}\n\n"
    
    return Command(
        update={
            "search_results": search_result_objects,
            "last_search_query": query,
            "has_searched": True,
            "current_question": query,
            "messages": [ToolMessage(results_text, tool_call_id=tool_call_id)]
        }
    )


@tool
def parse_legal_document(
    document_id: str,
    search_results: Annotated[List[SearchResult], InjectedState("search_results")],
    parsed_documents: Annotated[Dict[str, DocumentContent], InjectedState("parsed_documents")],
    tool_call_id: Annotated[str, InjectedToolCallId]
) -> Command:
    """Parse a specific legal document for consultation agent."""
    
    # Check if already parsed
    if document_id in parsed_documents:
        return Command(
            update={
                "messages": [ToolMessage(f"Document {document_id} already parsed", tool_call_id=tool_call_id)]
            }
        )
    
    # Find the document URL from search results
    document_url = None
    document_title = "Unknown Document"
    
    for search_result in search_results:
        if search_result.document_id == document_id:
            document_url = search_result.url
            document_title = search_result.title
            break
    
    if not document_url:
        return Command(
            update={
                "messages": [ToolMessage(f"Document {document_id} not found in search results", tool_call_id=tool_call_id)]
            }
        )
    
    # Parse the document
    result = legal_parser_instance.parse_legal_document(document_url)
    
    if not result["success"]:
        return Command(
            update={
                "messages": [ToolMessage(f"Failed to parse document {document_id}: {result.get('error', 'Unknown error')}", tool_call_id=tool_call_id)]
            }
        )
    
    # Create DocumentContent object
    document_content = DocumentContent(
        document_id=document_id,
        title=result["metadata"]["title"],
        content=result["markdown"],
        metadata=result["metadata"],
        parsing_date=datetime.now().isoformat()
    )
    
    # Store in state
    updated_parsed_documents = {**parsed_documents, document_id: document_content}
    
    # Return parsed content for agent to see
    content_preview = document_content.content[:1000] + "..." if len(document_content.content) > 1000 else document_content.content
    
    return Command(
        update={
            "parsed_documents": updated_parsed_documents,
            "messages": [ToolMessage(f"Successfully parsed document {document_id}: {result['metadata']['title']}\n\nContent preview:\n{content_preview}", tool_call_id=tool_call_id)]
        }
    )