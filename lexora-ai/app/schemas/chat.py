from typing import List, Literal, Optional, Dict, Any
from pydantic import BaseModel, Field

class Message(BaseModel):
    role: Literal["user", "assistant", "system"] = Field(..., description="The role of the message sender")
    content: str = Field(..., description="The content of the message", min_length=1, max_length=15000)

class ChatRequest(BaseModel):
    messages: List[Message] = Field(
        ...,
        description="List of messages in the conversation",
        min_length=1,
    )
    session_id: str = Field(..., description="Session ID for conversation tracking")

class ChatResponse(BaseModel):
    messages: List[Message] = Field(..., description="List of messages in the conversation")
    session_id: str = Field(..., description="Session ID for conversation tracking")
    # Optional interrupt fields for research agent
    interrupt_type: Optional[Literal["source_approval", "artifact_review"]] = Field(
        None, description="Type of interrupt requiring user interaction"
    )
    interrupt_data: Optional[Dict[str, Any]] = Field(
        None, description="Data needed for interrupt UI rendering"
    )
    interrupt_id: Optional[str] = Field(
        None, description="Unique ID for tracking interrupt workflow"
    )

class StreamResponse(BaseModel):
    content: str = Field(default="", description="The content of the current chunk")
    done: bool = Field(default=False, description="Whether the stream is complete")