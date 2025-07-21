import re
import json
from typing import List, Dict, Any, Annotated
from datetime import datetime

from dotenv import load_dotenv
from langchain_core.tools import tool, InjectedToolCallId
from langchain_core.messages import ToolMessage
from langchain_community.utilities.brave_search import BraveSearchWrapper
from langgraph.prebuilt import InjectedState
from langgraph.types import Command

from app.schemas.consultation_state import SearchResult

load_dotenv()


class LegalSearchService:
    """Legal document search tool using Brave Search API with lex.uz filtering"""
    
    def __init__(self, max_results: int = 10):
        self.brave_search = BraveSearchWrapper(
            search_kwargs={"count": max_results}
        )
    
    def extract_document_info(self, results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Extract and structure document information from Brave search results"""
        documents = []
        
        for result in results:
            if not isinstance(result, dict):
                continue
                
            url = result.get("link", result.get("url", ""))
            title = result.get("title", "")
            description = result.get("snippet", result.get("description", ""))
            
            # Extract document ID from lex.uz URLs
            document_id = self._extract_document_id(url)
            
            # Filter out comparison pages and ensure we have document ID
            if document_id and "action=compare" not in url:
                # Extract date from URL if available
                date_match = re.search(r'ONDATE=(\d{2}\.\d{2}\.\d{4})', url)
                document_date = date_match.group(1) if date_match else ""
                
                # Calculate relevance score (simple heuristic)
                relevance_score = self._calculate_relevance_score(title, description, url)
                
                documents.append({
                    'document_id': document_id,
                    'title': title,
                    'snippet': description,
                    'url': url,
                    'document_date': document_date,
                    'relevance_score': relevance_score
                })
        
        return {
            "search_successful": True,
            "total_found": len(documents),
            "documents": documents
        }
    
    def _extract_document_id(self, url: str) -> str:
        """Extract document ID from lex.uz URLs"""
        patterns = [
            r"/docs/(\d+)",
            r"/acts/(\d+)",
            r"id[=:](\d+)"
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return ""
    
    def _calculate_relevance_score(self, title: str, description: str, url: str) -> float:
        """Calculate simple relevance score for search results"""
        score = 0.5  # Base score
        
        # Boost for acts vs docs
        if "/acts/" in url:
            score += 0.2
        
        # Boost for titles with legal keywords
        legal_keywords = ["закон", "кодекс", "постановление", "положение", "порядок", "правило"]
        for keyword in legal_keywords:
            if keyword.lower() in title.lower():
                score += 0.1
                break
        
        # Boost for recent or current documents
        if "текущая редакция" in title.lower() or "действующая редакция" in title.lower():
            score += 0.15
        
        return min(score, 1.0)  # Cap at 1.0
    
    def search_legal_documents(self, query: str, site_filter: str = None) -> Dict[str, Any]:
        """Search for legal documents using Brave Search with lex.uz filtering"""
        try:
            # Use proper site filtering with Brave Search syntax
            if site_filter:
                search_query = f"{query.strip()} site:{site_filter}"
            else:
                # Use site:lex.uz to search specifically within lex.uz
                search_query = f"{query.strip()} site:lex.uz"
            
            # Perform search using BraveSearchWrapper
            try:
                search_results = self.brave_search.run(search_query)
            except Exception as wrapper_error:
                return {
                    "search_successful": False,
                    "error": f"BraveSearchWrapper error: {str(wrapper_error)}",
                    "total_found": 0,
                    "documents": []
                }
            
            # Handle empty or None results
            if not search_results:
                return {
                    "search_successful": True,
                    "total_found": 0,
                    "documents": []
                }
            
            # The error suggests the issue is in how we handle the response
            # Let's be more defensive and check what we actually got
            web_results = []
            
            if isinstance(search_results, str):
                # If it's JSON string, parse it
                try:
                    results_data = json.loads(search_results)
                    if isinstance(results_data, dict):
                        web_results = results_data.get("web", {}).get("results", [])
                    elif isinstance(results_data, list):
                        web_results = results_data
                except json.JSONDecodeError as e:
                    return {
                        "search_successful": False,
                        "error": f"Failed to parse Brave Search JSON: {str(e)}",
                        "total_found": 0,
                        "documents": []
                    }
            elif isinstance(search_results, list):
                # If it's already a list of results, use directly
                web_results = search_results
            elif isinstance(search_results, dict):
                # If it's a dict, try different extraction paths
                web_results = (search_results.get("web", {}).get("results", []) or 
                             search_results.get("results", []) or
                             [])
            else:
                return {
                    "search_successful": False,
                    "error": f"Unexpected response format: {type(search_results).__name__}",
                    "total_found": 0,
                    "documents": []
                }
            
            # Ensure we have a list to work with
            if not isinstance(web_results, list):
                return {
                    "search_successful": False,
                    "error": f"Expected list of results, got {type(web_results).__name__}",
                    "total_found": 0,
                    "documents": []
                }
            
            
            if not web_results:
                return {
                    "search_successful": True,
                    "total_found": 0,
                    "documents": []
                }
            
            # Extract and structure results
            return self.extract_document_info(web_results)
            
        except Exception as e:
            return {
                "search_successful": False,
                "error": str(e),
                "total_found": 0,
                "documents": []
            }


# Create global instance
legal_search_service = LegalSearchService()


@tool
def brave_search_legal_documents(
    query: str,
    search_results: Annotated[List[SearchResult], InjectedState("search_results")],
    tool_call_id: Annotated[str, InjectedToolCallId]
) -> Command:
    """Search for legal documents using Brave Search API and return visible results.
    
    This tool searches lex.uz legal documents using Brave Search and stores
    structured results in state for efficient Q&A processing.
    
    Args:
        query: Legal search query (e.g., "минимальный размер пенсии", "трудовой договор")
        search_results: Previous search results (injected from state)
    
    Returns:
        Command object that updates state with search results
    """
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