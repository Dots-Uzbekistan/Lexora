import uuid
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from app.schemas.chat import ChatRequest, ChatResponse, Message
from app.core.consultation_engine import ConsultationEngine

router = APIRouter()
consultation_engine = ConsultationEngine()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat endpoint for consultation agent"""
    try:
        print(f"Received request: {request}")
        print(f"Messages: {[f'{msg.role}: {repr(msg.content)}' for msg in request.messages]}")
        
        response_messages = await consultation_engine.get_response(
            messages=request.messages,
            session_id=request.session_id
        )
        
        print(f"Response messages: {[f'{msg.role}: {repr(msg.content)}' for msg in response_messages]}")
        
        # Validate all messages before creating response
        validated_messages = []
        for msg in response_messages:
            if msg.content and msg.content.strip():
                validated_messages.append(msg)
            else:
                print(f"Skipping empty message: {msg}")
        
        return ChatResponse(
            messages=validated_messages,
            session_id=request.session_id
        )
    
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")

@router.post("/chat/new-session")
async def new_session():
    """Create a new chat session"""
    session_id = str(uuid.uuid4())
    return {"session_id": session_id}

@router.get("/chat/{session_id}/history")
async def get_chat_history(session_id: str):
    """Get chat history for a session"""
    try:
        history = consultation_engine.get_session_history(session_id)
        return {"session_id": session_id, "messages": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting history: {str(e)}")

@router.delete("/chat/{session_id}")
async def clear_chat_history(session_id: str):
    """Clear chat history for a session"""
    try:
        success = consultation_engine.clear_session(session_id)
        if success:
            return {"message": f"Session {session_id} cleared successfully"}
        else:
            return {"message": f"Session {session_id} not found"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error clearing session: {str(e)}")

@router.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "service": "consultation"}