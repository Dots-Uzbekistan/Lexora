from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import consultation, research
from app.core.config import settings

app = FastAPI(
    title="Lexora Legal AI API",
    description="Legal Q&A and Research Assistant API for Uzbek law",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(consultation.router, prefix="/api/v1/qna", tags=["Consultation"])
app.include_router(research.router, prefix="/api/v1/research", tags=["Research"])

@app.get("/")
async def root():
    return {"message": "Lexora Legal AI API", "version": "1.0.0", "services": ["Consultation", "Research"]}

@app.get("/health")
async def health():
    return {"status": "healthy"}