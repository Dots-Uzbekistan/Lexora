import uuid
from fastapi import APIRouter, HTTPException

from app.schemas.chat import ChatRequest, ChatResponse, Message
from app.core.research_agent import ResearchAgentWrapper

router = APIRouter()
research_agent = ResearchAgentWrapper()


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat endpoint for Research agent with interrupt handling"""
    try:
        print(f"Received research request: {request}")
        print(f"Messages: {[f'{msg.role}: {repr(msg.content)}' for msg in request.messages]}")
        
        response_data = await research_agent.get_response(
            messages=request.messages,
            session_id=request.session_id
        )
        
        print(f"Response data: {response_data}")
        
        # Validate messages before creating response
        validated_messages = []
        for msg in response_data.get("messages", []):
            if msg.content and msg.content.strip():
                validated_messages.append(msg)
            else:
                print(f"Skipping empty message: {msg}")
        
        # Create response with optional interrupt fields
        response = ChatResponse(
            messages=validated_messages,
            session_id=request.session_id,
            interrupt_type=response_data.get("interrupt_type"),
            interrupt_data=response_data.get("interrupt_data"),
            interrupt_id=response_data.get("interrupt_id")
        )
        
        return response
    
    except Exception as e:
        print(f"Error in research chat endpoint: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing research chat: {str(e)}")


@router.post("/chat/new-session")
async def new_session():
    """Create a new research chat session"""
    session_id = str(uuid.uuid4())
    return {"session_id": session_id}


@router.get("/chat/{session_id}/history")
async def get_chat_history(session_id: str):
    """Get chat history for a research session"""
    try:
        history = research_agent.get_session_history(session_id)
        return {"session_id": session_id, "messages": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting research history: {str(e)}")


@router.delete("/chat/{session_id}")
async def clear_chat_history(session_id: str):
    """Clear chat history for a research session"""
    try:
        success = research_agent.clear_session(session_id)
        if success:
            return {"message": f"Research session {session_id} cleared successfully"}
        else:
            return {"message": f"Research session {session_id} not found"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing research session: {str(e)}")


@router.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "service": "research"}