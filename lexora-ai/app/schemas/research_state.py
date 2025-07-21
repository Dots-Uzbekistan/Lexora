from pydantic import BaseModel, Field
from typing import List, Optional, Annotated, Dict, Any
from langchain_core.messages import AnyMessage
from langgraph.graph.message import add_messages
from datetime import datetime


class SearchResult(BaseModel):
    """Structured search result for legal documents"""
    document_id: str
    title: str
    snippet: str
    url: str
    document_date: str
    relevance_score: float


class ValidationResult(BaseModel):
    """Validation result for a specific document"""
    document_id: str
    title: str
    is_relevant: bool
    relevance_score: float
    reasoning: str


class DocumentContent(BaseModel):
    """Full parsed document content with metadata"""
    document_id: str
    title: str
    content: str
    metadata: Dict[str, Any]
    parsing_date: str


class DocumentSummary(BaseModel):
    """Targeted document summary for user question"""
    document_id: str
    title: str
    summary: str
    key_provisions: List[str]
    relevance_analysis: str


class ArtifactVersion(BaseModel):
    """Version information for artifacts"""
    version: int
    content: str
    created_at: str
    stage: str  # draft, review, final
    feedback: str = Field(default="")


class Artifact(BaseModel):
    """Artifact with version control"""
    id: str
    title: str
    type: str  # legal_analysis, document, etc.
    current_version: int = Field(default=1)
    versions: Dict[int, ArtifactVersion] = Field(default_factory=dict)
    
    def get_current_content(self) -> str:
        """Get current version content"""
        return self.versions[self.current_version].content if self.current_version in self.versions else ""


class MultiSearchQuery(BaseModel):
    """Individual search query in multi-query strategy"""
    query: str
    query_type: str  # general, medium, specific
    legal_concepts: List[str]
    rationale: str


class LegalResearchState(BaseModel):
    """State schema for legal research workflow with Brave Search multi-query"""
    messages: Annotated[List[AnyMessage], add_messages]
    remaining_steps: int = Field(default=20)
    
    # Current user query context
    current_user_question: str = Field(default="")
    workflow_stage: str = Field(default="multi_search")  # multi_search, validation, approval, drafting, revision
    workflow_phase: str = Field(default="research")  # research, drafting, reviewing, refining
    
    # Multi-query search strategy
    search_queries_planned: List[MultiSearchQuery] = Field(default_factory=list)
    search_queries_executed: List[str] = Field(default_factory=list)
    search_strategy_rationale: str = Field(default="")
    
    # Iterative workflow tracking
    current_draft_iteration: int = Field(default=1)
    total_iterations_needed: int = Field(default=3)
    draft_feedback_received: List[str] = Field(default_factory=list)
    refinement_areas: List[str] = Field(default_factory=list)
    
    # Workflow progress tracking
    completed_stages: List[str] = Field(default_factory=list)
    pending_approval: bool = Field(default=False)
    approval_required_for: str = Field(default="")
    
    # Search results and validation
    raw_search_results: List[SearchResult] = Field(default_factory=list)
    validation_results: List[ValidationResult] = Field(default_factory=list)
    approved_document_ids: List[str] = Field(default_factory=list)
    rejected_document_ids: List[str] = Field(default_factory=list)
    
    # Document processing
    parsed_documents: Dict[str, DocumentContent] = Field(default_factory=dict)
    document_summaries: Dict[str, DocumentSummary] = Field(default_factory=dict)
    
    # Legal research context
    legal_concepts_identified: List[str] = Field(default_factory=list)
    relevant_legal_areas: List[str] = Field(default_factory=list)
    
    # Human interaction
    human_feedback: str = Field(default="")
    last_approval_request: str = Field(default="")
    
    # Artifact management
    artifacts: Dict[str, Artifact] = Field(default_factory=dict)
    current_artifact_id: str = Field(default="")
    
    # Additional search tracking
    needs_additional_search: bool = Field(default=False)
    suggested_queries: List[str] = Field(default_factory=list)