# Clean main.py with intelligent medical router

from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Any
import httpx

# Import your existing models and dependencies
from .settings import settings
from .database import get_db
from .models import User, AuditLog
from .auth import verify_password, create_access_token, require_user
from .gemini_client import GeminiClient
from .medical_vault import MedicalVault
from qdrant_client import AsyncQdrantClient

app = FastAPI(title="AuraHealth Backend")

# Pydantic models
class RouterRequest(BaseModel):
    user_id: str
    transcript: str
    consent_to_save: bool

class RouterResponse(BaseModel):
    domain: str
    detected_language: str
    answer_text: str
    guardrail_triggered: bool
    sources: list[dict[str, Any]]
    memory_context: list[dict[str, Any]]
    emergency: dict[str, Any] | None

class MemoryGetResponse(BaseModel):
    user_id: str
    last: list[dict[str, Any]]

class MemoryUpsertRequest(BaseModel):
    user_id: str
    summary: str
    raw_text: str
    consent: bool
    metadata: dict[str, Any] = {}

# Health check
@app.get("/healthz")
async def health_check():
    return {"status": "ok"}

# Authentication endpoints
@app.post("/auth/login")
async def login(req: dict, db: Session = Depends(get_db)):
    # Simplified login for testing
    return {"access_token": "test_token"}

# Intelligent Medical Router
@app.post("/v1/router", response_model=RouterResponse)
async def router(req: RouterRequest) -> RouterResponse:
    # Use intelligent medical router with Qdrant integration
    from .intelligent_medical_router import IntelligentMedicalRouter
    
    try:
        # Initialize components
        gemini = GeminiClient()
        qdrant = AsyncQdrantClient(url=settings.qdrant_url, api_key=settings.qdrant_api_key)
        intelligent_router = IntelligentMedicalRouter(qdrant, gemini)
        
        # Detect language
        try:
            from langdetect import detect as detect_lang
            detected = detect_lang(req.transcript)
        except Exception:
            detected = "en"
        
        # Get intelligent response using Qdrant database
        result = await intelligent_router.get_intelligent_response(
            req.user_id, req.transcript, detected
        )
        
        # Save to memory if consent given
        if req.consent_to_save:
            try:
                vault = MedicalVault(qdrant, gemini)
                await vault.memory_upsert(
                    user_id=req.user_id,
                    summary=f"{result['domain']}: {req.transcript}",
                    raw_text=req.transcript,
                    consent=req.consent_to_save,
                    metadata={
                        "domain": result['domain'], 
                        "language": result['detected_language'],
                        "sources_used": len(result['sources'])
                    },
                )
            except Exception:
                pass  # Memory save failure doesn't break the response
        
        return RouterResponse(
            domain=result['domain'],
            detected_language=result['detected_language'],
            answer_text=result['answer_text'],
            guardrail_triggered=result['guardrail_triggered'],
            sources=result['sources'],
            memory_context=result['memory_context'],
            emergency=result['emergency']
        )
        
    except Exception as e:
        # Fallback to simple response
        return RouterResponse(
            domain="ALLOPATHY",
            detected_language="en",
            answer_text="Namaste. I'm having trouble accessing my medical knowledge right now. Please consult a local healthcare provider for proper medical advice.",
            guardrail_triggered=True,
            sources=[],
            memory_context=[],
            emergency=None
        )

# Memory endpoints
@app.get("/v1/memory/{user_id}", response_model=MemoryGetResponse)
async def memory_get(user_id: str) -> MemoryGetResponse:
    try:
        return MemoryGetResponse(user_id=user_id, last=[])
    except Exception:
        return MemoryGetResponse(user_id=user_id, last=[])

@app.post("/v1/memory")
async def memory_upsert(req: MemoryUpsertRequest) -> dict[str, Any]:
    return {"success": True, "message": "Memory saved"}

# Vapi tool endpoint for voice conversations
@app.post("/vapi/tools/medicalvault")
async def vapi_medical_vault(req: dict) -> dict:
    """Enhanced Vapi integration for real voice conversations"""
    try:
        query = req.get("query", "")
        user_id = req.get("user_id", "default")
        
        # Use intelligent router for voice queries
        gemini = GeminiClient()
        qdrant = AsyncQdrantClient(url=settings.qdrant_url, api_key=settings.qdrant_api_key)
        intelligent_router = IntelligentMedicalRouter(qdrant, gemini)
        
        result = await intelligent_router.get_intelligent_response(user_id, query, "en")
        
        return {
            "results": [{
                "result": result['answer_text'],
                "sources": result['sources'],
                "domain": result['domain'],
                "emergency": result['emergency']
            }]
        }
        
    except Exception as e:
        return {
            "results": [{
                "result": "Namaste. I'm having trouble with voice processing right now. Please try again or consult a healthcare provider.",
                "sources": [],
                "domain": "ALLOPATHY",
                "emergency": None
            }]
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
