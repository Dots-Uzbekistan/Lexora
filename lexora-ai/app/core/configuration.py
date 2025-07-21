from pydantic import BaseModel, Field


class LegalAgentConfiguration(BaseModel):
    """Configuration schema for legal research agent"""
    reasoning_model: str = Field(default="o3-mini")
    summary_model: str = Field(default="gpt-4o-mini")
    max_search_results: int = Field(default=10)
    search_depth: str = Field(default="advanced")
    require_lawyer_approval: bool = Field(default=True)
    auto_generate_document: bool = Field(default=False)