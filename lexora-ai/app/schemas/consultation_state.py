from pydantic import BaseModel, Field
from typing import List, Optional, Annotated, Dict, Any
from langchain_core.messages import AnyMessage
from langgraph.graph.message import add_messages


class SearchResult(BaseModel):
    """Simple search result for legal consultation"""
    document_id: str
    title: str
    snippet: str
    url: str
    document_date: str
    relevance_score: float


class DocumentContent(BaseModel):
    """Parsed document content for legal consultation"""
    document_id: str
    title: str
    content: str
    metadata: Dict[str, Any]
    parsing_date: str


class ConsultationState(BaseModel):
    """Simplified state schema for legal consultation agent"""
    messages: Annotated[List[AnyMessage], add_messages]
    remaining_steps: int = Field(default=10)  # Required by create_react_agent
    
    # Current question context
    current_question: str = Field(default="")
    
    # Search results
    search_results: List[SearchResult] = Field(default_factory=list)
    last_search_query: str = Field(default="")
    
    # Parsed documents (if needed)
    parsed_documents: Dict[str, DocumentContent] = Field(default_factory=dict)
    
    # Simple workflow tracking
    has_searched: bool = Field(default=False)
    has_sufficient_info: bool = Field(default=False)