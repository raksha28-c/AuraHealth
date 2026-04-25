# Main backend with proper Qdrant + Vapi integration

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Any
import asyncio
import httpx
import os

app = FastAPI(title="AuraHealth Backend - Qdrant + Vapi Integration")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

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

# Settings
class Settings:
    qdrant_url = os.getenv("QDRANT_URL", "https://your-qdrant-cluster.cloud.qdrant.io")
    qdrant_api_key = os.getenv("QDRANT_API_KEY", "your_qdrant_api_key")
    gemini_api_key = os.getenv("GOOGLE_AI_API_KEY", "your_gemini_api_key")
    jwt_secret = os.getenv("JWT_SECRET", "your_jwt_secret")
    database_url = os.getenv("DATABASE_URL", "sqlite:///./test.db")
    vapi_private_key = os.getenv("VAPI_PRIVATE_KEY", "your_vapi_private_key")

settings = Settings()

# Gemini Client
class GeminiClient:
    def __init__(self):
        self.api_key = settings.gemini_api_key
        self._base = "https://generativelanguage.googleapis.com/v1beta"
    
    async def embed_text(self, text: str) -> list[float]:
        url = f"{self._base}/models/text-embedding-004:embedContent"
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                url,
                params={"key": self.api_key},
                json={
                    "model": "models/text-embedding-004",
                    "content": {"parts": [{"text": text}]},
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return data["embedding"]["values"]
    
    async def generate_json(self, *, model: str, system: str, user: str, schema_hint: dict[str, Any] | None = None) -> dict[str, Any]:
        url = f"{self._base}/models/{model}:generateContent"
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                url,
                params={"key": self.api_key},
                json={
                    "contents": [
                        {"role": "user", "parts": [{"text": f"{system}\n\n{user}"}]}
                    ],
                    "generationConfig": {"temperature": 0.3}
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return {"response": data["candidates"][0]["content"]["parts"][0]["text"]}

# Qdrant Client
class AsyncQdrantClient:
    def __init__(self, url: str, api_key: str):
        self.url = url
        self.api_key = api_key
        self.client = httpx.AsyncClient(timeout=30)
    
    async def search(self, collection_name: str, query_vector: list[float], limit: int = 5):
        url = f"{self.url}/collections/{collection_name}/points/search"
        headers = {"api-key": self.api_key}
        payload = {
            "vector": query_vector,
            "limit": limit,
            "with_payload": True
        }
        
        response = await self.client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()
    
    async def upsert(self, collection_name: str, points: list[dict]):
        url = f"{self.url}/collections/{collection_name}/points"
        headers = {"api-key": self.api_key}
        payload = {"points": points}
        
        response = await self.client.put(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()

# Medical Vault with Qdrant Integration
class MedicalVault:
    def __init__(self, qdrant: AsyncQdrantClient, gemini: GeminiClient):
        self.qdrant = qdrant
        self.gemini = gemini
    
    async def memory_upsert(self, user_id: str, summary: str, raw_text: str, consent: bool, metadata: dict[str, Any]):
        if not consent:
            return
        
        try:
            embedding = await self.gemini.embed_text(f"{summary} {raw_text}")
            point = {
                "id": f"{user_id}_{asyncio.get_event_loop().time()}",
                "vector": embedding,
                "payload": {
                    "user_id": user_id,
                    "summary": summary,
                    "raw_text": raw_text,
                    "timestamp": asyncio.get_event_loop().time(),
                    "metadata": metadata
                }
            }
            await self.qdrant.upsert("user_memory", [point])
        except Exception as e:
            print(f"Memory upsert failed: {e}")

# Intelligent Medical Router with Qdrant
class IntelligentMedicalRouter:
    def __init__(self, qdrant: AsyncQdrantClient, gemini: GeminiClient):
        self.qdrant = qdrant
        self.gemini = gemini
        self.vault = MedicalVault(qdrant, gemini)
    
    async def get_intelligent_response(self, user_id: str, transcript: str, detected_language: str = "en") -> dict[str, Any]:
        # Check for emergency first
        text_lower = transcript.lower()
        if any(word in text_lower for word in ["chest pain", "heart attack", "severe bleeding", "difficulty breathing"]):
            return {
                "domain": "EMERGENCY",
                "detected_language": detected_language,
                "answer_text": "🚨 EMERGENCY! Call 108 immediately. This appears to be a medical emergency. Please seek immediate medical attention.",
                "guardrail_triggered": False,
                "sources": [{"type": "emergency_protocol", "confidence": 1.0}],
                "memory_context": [],
                "emergency": {"action": "PHC_LOCATOR", "status": "triggered", "severity": "critical"}
            }
        
        # Use Qdrant to search medical knowledge
        try:
            # Generate embedding for the query
            query_embedding = await self.gemini.embed_text(transcript)
            
            # Search across medical collections
            collections = ["medication_safety", "ayush_guidelines", "nutrition"]
            all_results = []
            
            for collection in collections:
                try:
                    search_results = await self.qdrant.search(collection, query_embedding, limit=3)
                    if "result" in search_results:
                        all_results.extend(search_results["result"])
                except Exception as e:
                    print(f"Search in {collection} failed: {e}")
            
            # Determine domain based on results
            domain = "ALLOPATHY"
            if any("ayush" in str(result.get("payload", {})).lower() for result in all_results):
                domain = "AYURVEDA"
            elif any("nutrition" in str(result.get("payload", {})).lower() for result in all_results):
                domain = "NUTRITION"
            
            # Generate contextual response using Gemini
            context = "\n".join([
                str(result.get("payload", {}).get("text", ""))
                for result in all_results[:3]
            ])
            
            prompt = f"""
            Based on this medical knowledge: {context}
            
            User query: {transcript}
            Language: {detected_language}
            
            Provide a helpful, contextual medical response in {detected_language}. 
            Include specific advice and if serious, suggest consulting a healthcare provider.
            """
            
            gemini_response = await self.gemini.generate_json(
                model="gemini-1.5-flash",
                system="You are a helpful medical assistant providing safe, contextual advice.",
                user=prompt
            )
            
            return {
                "domain": domain,
                "detected_language": detected_language,
                "answer_text": gemini_response.get("response", "I recommend consulting a healthcare provider for proper medical advice."),
                "guardrail_triggered": False,
                "sources": [{"type": "qdrant_search", "confidence": 0.8, "results": len(all_results)}],
                "memory_context": [],
                "emergency": None
            }
            
        except Exception as e:
            print(f"Intelligent routing failed: {e}")
            # Fallback response
            return {
                "domain": "ALLOPATHY",
                "detected_language": detected_language,
                "answer_text": "I recommend consulting a local healthcare provider for proper medical advice.",
                "guardrail_triggered": True,
                "sources": [],
                "memory_context": [],
                "emergency": None
            }

# Health check
@app.get("/healthz")
async def health_check():
    return {"status": "ok"}

# Medical Router with Qdrant + Vapi
@app.post("/v1/router", response_model=RouterResponse)
async def router(req: RouterRequest) -> RouterResponse:
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
        
        # Get intelligent response using Qdrant
        result = await intelligent_router.get_intelligent_response(
            req.user_id, req.transcript, detected
        )
        
        # Save to memory if consent given
        if req.consent_to_save:
            try:
                await intelligent_router.vault.memory_upsert(
                    user_id=req.user_id,
                    summary=f"{result['domain']}: {req.transcript}",
                    raw_text=req.transcript,
                    consent=req.consent_to_save,
                    metadata={"domain": result['domain'], "language": detected}
                )
            except Exception as e:
                print(f"Memory save failed: {e}")
        
        return RouterResponse(**result)
        
    except Exception as e:
        return RouterResponse(
            domain="ALLOPATHY",
            detected_language="en",
            answer_text="Namaste. I'm having technical difficulties. Please consult a local healthcare provider.",
            guardrail_triggered=True,
            sources=[],
            memory_context=[],
            emergency=None
        )

# Memory endpoints
@app.get("/v1/memory/{user_id}", response_model=MemoryGetResponse)
async def memory_get(user_id: str) -> MemoryGetResponse:
    try:
        # Try to get from Qdrant
        gemini = GeminiClient()
        qdrant = AsyncQdrantClient(url=settings.qdrant_url, api_key=settings.qdrant_api_key)
        
        # Search user memory
        user_embedding = await gemini.embed_text(user_id)
        search_results = await qdrant.search("user_memory", user_embedding, limit=5)
        
        memories = []
        if "result" in search_results:
            for result in search_results["result"]:
                payload = result.get("payload", {})
                memories.append({
                    "summary": payload.get("summary", ""),
                    "timestamp": payload.get("timestamp", 0)
                })
        
        return MemoryGetResponse(user_id=user_id, last=memories)
        
    except Exception as e:
        print(f"Memory retrieval failed: {e}")
        return MemoryGetResponse(user_id=user_id, last=[])

@app.post("/v1/memory")
async def memory_upsert(req: MemoryUpsertRequest) -> dict[str, Any]:
    try:
        gemini = GeminiClient()
        qdrant = AsyncQdrantClient(url=settings.qdrant_url, api_key=settings.qdrant_api_key)
        vault = MedicalVault(qdrant, gemini)
        
        await vault.memory_upsert(
            user_id=req.user_id,
            summary=req.summary,
            raw_text=req.raw_text,
            consent=req.consent,
            metadata=req.metadata
        )
        
        return {"success": True, "message": "Memory saved to Qdrant"}
        
    except Exception as e:
        print(f"Memory upsert failed: {e}")
        return {"success": False, "message": "Failed to save memory"}

# Vapi tool endpoint - connects Vapi to Qdrant
@app.post("/vapi/tools/medicalvault")
async def vapi_medical_vault(req: dict) -> dict:
    """Vapi tool that uses Qdrant for medical knowledge retrieval"""
    try:
        query = req.get("query", "")
        user_id = req.get("user_id", "default")
        
        # Use intelligent router with Qdrant
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
        print(f"Vapi tool failed: {e}")
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
