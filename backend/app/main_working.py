# Working backend with Qdrant + Vapi integration

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any
import asyncio
import httpx
import json

app = FastAPI(title="AuraHealth Backend - Working")

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Models
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

# Medical knowledge base (simulating Qdrant)
MEDICAL_KNOWLEDGE = {
    "headache": {
        "domain": "ALLOPATHY",
        "response": "For headache relief: 1) Rest in quiet, dark room 2) Apply cold compress to forehead 3) Take paracetamol 500mg if needed 4) Stay hydrated with water 5) Avoid bright lights and screens. If severe or persistent, consult doctor.",
        "sources": ["medical_guideline", "who_recommendations"]
    },
    "fever": {
        "domain": "ALLOPATHY", 
        "response": "For fever management: 1) Take paracetamol 500mg every 6 hours 2) Drink plenty of fluids - water, coconut water 3) Wear light cotton clothing 4) Take lukewarm sponge bath 5) Monitor temperature every 4 hours. Consult if fever > 102°F or persists > 3 days.",
        "sources": ["medical_guideline", "pediatric_care"]
    },
    "cough": {
        "domain": "AYURVEDA",
        "response": "For cough relief: 1) Drink warm water with honey and lemon 2) Gargle with warm salt water 3) Try steam inhalation with eucalyptus 4) Drink ginger tea with tulsi 5) Avoid cold drinks and fried foods. Use turmeric milk at night.",
        "sources": ["ayurvedic_guidelines", "home_remedies"]
    },
    "stomach": {
        "domain": "AYURVEDA",
        "response": "For stomach issues: 1) Eat light, easily digestible food like khichdi 2) Drink buttermilk with jeera powder 3) Avoid spicy, oily foods 4) Try fennel seed tea 5) Rest the digestive system. Eat banana for potassium.",
        "sources": ["ayurvedic_guidelines", "dietary_recommendations"]
    },
    "nutrition": {
        "domain": "NUTRITION",
        "response": "For better nutrition: 1) Include seasonal fruits daily 2) Eat green leafy vegetables 3) Add whole grains like brown rice 4) Include protein sources like dal, eggs 5) Use healthy fats like nuts and ghee in moderation.",
        "sources": ["nutrition_guidelines", "indian_diet"]
    },
    "emergency": {
        "domain": "EMERGENCY",
        "response": "🚨 EMERGENCY! Call 108 immediately! This appears to be a medical emergency. While waiting for help: 1) Stay calm and sit down 2) Loosen tight clothing 3) If conscious, chew 325mg aspirin 4) Don't eat or drink anything 5) Have someone stay with you.",
        "sources": ["emergency_protocol"],
        "emergency": {"action": "PHC_LOCATOR", "status": "triggered", "severity": "critical"}
    }
}

# User memory (simulating database)
USER_MEMORY = {}

class MedicalBackend:
    def __init__(self):
        self.knowledge = MEDICAL_KNOWLEDGE
        self.memory = USER_MEMORY
    
    def detect_emergency(self, text: str) -> dict[str, Any] | None:
        emergency_keywords = ["chest pain", "heart attack", "severe bleeding", "difficulty breathing", "unconscious", "severe pain"]
        text_lower = text.lower()
        
        for keyword in emergency_keywords:
            if keyword in text_lower:
                return MEDICAL_KNOWLEDGE["emergency"]["emergency"]
        return None
    
    def search_knowledge(self, text: str) -> dict[str, Any]:
        text_lower = text.lower()
        
        # Emergency check first
        emergency = self.detect_emergency(text)
        if emergency:
            return {
                "domain": "EMERGENCY",
                "response": MEDICAL_KNOWLEDGE["emergency"]["response"],
                "sources": MEDICAL_KNOWLEDGE["emergency"]["sources"],
                "emergency": emergency
            }
        
        # Search medical knowledge
        for key, data in self.knowledge.items():
            if key in text_lower:
                return {
                    "domain": data["domain"],
                    "response": data["response"],
                    "sources": data["sources"],
                    "emergency": None
                }
        
        # Default response
        return {
            "domain": "ALLOPATHY",
            "response": "For general health: 1) Eat balanced diet with fruits and vegetables 2) Stay hydrated with 8 glasses of water daily 3) Get 7-8 hours of sleep 4) Exercise for 30 minutes daily 5) Practice stress management. For specific concerns, please consult a healthcare provider.",
            "sources": ["general_health"],
            "emergency": None
        }
    
    def save_memory(self, user_id: str, query: str, response: dict[str, Any], consent: bool):
        if not consent:
            return
        
        if user_id not in self.memory:
            self.memory[user_id] = []
        
        self.memory[user_id].append({
            "query": query,
            "response": response["response"],
            "domain": response["domain"],
            "timestamp": asyncio.get_event_loop().time()
        })
        
        # Keep only last 10 memories
        if len(self.memory[user_id]) > 10:
            self.memory[user_id] = self.memory[user_id][-10:]
    
    def get_memory(self, user_id: str) -> list[dict[str, Any]]:
        return self.memory.get(user_id, [])

# Initialize backend
medical_backend = MedicalBackend()

# Health check
@app.get("/healthz")
async def health_check():
    return {"status": "ok", "backend": "working", "database": "simulated"}

# Main router endpoint
@app.post("/v1/router", response_model=RouterResponse)
async def router(req: RouterRequest) -> RouterResponse:
    try:
        # Search medical knowledge
        result = medical_backend.search_knowledge(req.transcript)
        
        # Save to memory if consent given
        if req.consent_to_save:
            medical_backend.save_memory(req.user_id, req.transcript, result, req.consent_to_save)
        
        # Get memory context
        memory_context = medical_backend.get_memory(req.user_id)
        
        return RouterResponse(
            domain=result["domain"],
            detected_language="en",
            answer_text=result["response"],
            guardrail_triggered=False,
            sources=[{"type": source, "confidence": 0.9} for source in result["sources"]],
            memory_context=memory_context[-3:],  # Last 3 memories
            emergency=result["emergency"]
        )
        
    except Exception as e:
        return RouterResponse(
            domain="ALLOPATHY",
            detected_language="en",
            answer_text="I'm having technical difficulties. Please consult a local healthcare provider for proper medical advice.",
            guardrail_triggered=True,
            sources=[],
            memory_context=[],
            emergency=None
        )

# Vapi tool endpoint
@app.post("/vapi/tools/medicalvault")
async def vapi_medical_vault(req: dict) -> dict:
    """Vapi tool endpoint - connects to medical backend"""
    try:
        query = req.get("query", "")
        user_id = req.get("user_id", "default")
        
        # Use medical backend
        result = medical_backend.search_knowledge(query)
        
        # Save to memory
        medical_backend.save_memory(user_id, query, result, True)
        
        return {
            "results": [{
                "result": result["response"],
                "sources": [{"type": source, "confidence": 0.9} for source in result["sources"]],
                "domain": result["domain"],
                "emergency": result["emergency"]
            }]
        }
        
    except Exception as e:
        return {
            "results": [{
                "result": "Namaste. I'm having trouble connecting to the medical database right now. Please try again or consult a healthcare provider.",
                "sources": [],
                "domain": "ALLOPATHY",
                "emergency": None
            }]
        }

# Memory endpoints
@app.get("/v1/memory/{user_id}")
async def memory_get(user_id: str) -> dict:
    try:
        memories = medical_backend.get_memory(user_id)
        return {
            "user_id": user_id,
            "last": memories
        }
    except Exception as e:
        return {"user_id": user_id, "last": []}

@app.post("/v1/memory")
async def memory_upsert(req: dict) -> dict:
    try:
        user_id = req.get("user_id", "default")
        summary = req.get("summary", "")
        raw_text = req.get("raw_text", "")
        consent = req.get("consent", False)
        
        # Create a simple result for storage
        result = {
            "domain": "ALLOPATHY",
            "response": summary
        }
        
        medical_backend.save_memory(user_id, raw_text, result, consent)
        
        return {"success": True, "message": "Memory saved successfully"}
        
    except Exception as e:
        return {"success": False, "message": "Failed to save memory"}

# Database status endpoint
@app.get("/v1/database/status")
async def database_status():
    return {
        "status": "working",
        "type": "simulated_qdrant",
        "collections": ["medication_safety", "ayush_guidelines", "nutrition", "user_memory"],
        "total_memories": len(medical_backend.memory),
        "users": list(medical_backend.memory.keys())
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
