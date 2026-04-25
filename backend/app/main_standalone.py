# Fully standalone backend - NO API KEYS NEEDED

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any

app = FastAPI(title="AuraHealth Backend - Standalone")

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

# Complete medical knowledge base
MEDICAL_RESPONSES = {
    "headache": {
        "domain": "ALLOPATHY",
        "response": "For headache relief: 1) Rest in quiet, dark room 2) Apply cold compress to forehead for 15 minutes 3) Take paracetamol 500mg if needed 4) Stay hydrated with water 5) Avoid bright lights and screens. If severe or persists > 2 days, consult doctor.",
        "sources": ["medical_guideline", "who_recommendations"]
    },
    "fever": {
        "domain": "ALLOPATHY", 
        "response": "For fever management: 1) Take paracetamol 500mg every 6 hours 2) Drink plenty of fluids - water, coconut water, lemon water 3) Wear light cotton clothing 4) Take lukewarm sponge bath 5) Monitor temperature every 4 hours. Consult if fever > 102°F or persists > 3 days.",
        "sources": ["medical_guideline", "pediatric_care"]
    },
    "cough": {
        "domain": "AYURVEDA",
        "response": "For cough relief: 1) Drink warm water with honey and lemon 2) Gargle with warm salt water 3 times daily 3) Try steam inhalation with eucalyptus oil 4) Drink ginger tea with tulsi leaves 5) Avoid cold drinks and fried foods. Use turmeric milk at night for relief.",
        "sources": ["ayurvedic_guidelines", "home_remedies"]
    },
    "cold": {
        "domain": "AYURVEDA",
        "response": "For cold relief: 1) Drink warm fluids throughout the day 2) Take steam inhalation 3) Use saline nasal drops 4) Eat light, warm foods like khichdi 5) Rest and keep body warm. Add vitamin C rich foods like lemon and amla.",
        "sources": ["ayurvedic_guidelines", "home_remedies"]
    },
    "stomach": {
        "domain": "AYURVEDA",
        "response": "For stomach issues: 1) Eat light, easily digestible food like rice and dal 2) Drink buttermilk with roasted jeera powder 3) Avoid spicy, oily foods for 2-3 days 4) Try fennel seed tea after meals 5) Eat ripe banana for potassium and easy digestion.",
        "sources": ["ayurvedic_guidelines", "dietary_recommendations"]
    },
    "pain": {
        "domain": "ALLOPATHY",
        "response": "For pain management: 1) Rest the affected area 2) Apply cold compress for first 24 hours, then warm compress 3) Take paracetamol 500mg for mild pain 4) Gentle stretching if muscle pain 5) Consult doctor if severe pain or pain persists > 3 days.",
        "sources": ["medical_guideline", "pain_management"]
    },
    "nutrition": {
        "domain": "NUTRITION",
        "response": "For better nutrition: 1) Include seasonal fruits daily - at least 2 servings 2) Eat green leafy vegetables like spinach, fenugreek 3) Add whole grains like brown rice, oats 4) Include protein sources like dal, eggs, paneer 5) Use healthy fats like nuts and ghee in moderation.",
        "sources": ["nutrition_guidelines", "indian_diet_pyramid"]
    },
    "emergency": {
        "domain": "EMERGENCY",
        "response": "🚨 EMERGENCY! Call 108 immediately! This appears to be a medical emergency. While waiting for help: 1) Stay calm and sit or lie down comfortably 2) Loosen tight clothing 3) If conscious and no allergy, chew 325mg aspirin 4) Don't eat or drink anything 5) Have someone stay with you until help arrives.",
        "sources": ["emergency_protocol"],
        "emergency": {"action": "PHC_LOCATOR", "status": "triggered", "severity": "critical"}
    }
}

# User memory storage
USER_MEMORY = {}

class StandaloneMedicalBackend:
    def __init__(self):
        self.responses = MEDICAL_RESPONSES
        self.memory = USER_MEMORY
    
    def detect_emergency(self, text: str) -> dict[str, Any] | None:
        emergency_keywords = ["chest pain", "heart attack", "severe bleeding", "difficulty breathing", "unconscious", "severe pain", "emergency"]
        text_lower = text.lower()
        
        for keyword in emergency_keywords:
            if keyword in text_lower:
                return self.responses["emergency"]["emergency"]
        return None
    
    def get_medical_response(self, text: str) -> dict[str, Any]:
        text_lower = text.lower()
        
        # Emergency check first
        emergency = self.detect_emergency(text)
        if emergency:
            return {
                "domain": "EMERGENCY",
                "response": self.responses["emergency"]["response"],
                "sources": self.responses["emergency"]["sources"],
                "emergency": emergency
            }
        
        # Search for matching conditions
        for key, data in self.responses.items():
            if key in text_lower:
                return {
                    "domain": data["domain"],
                    "response": data["response"],
                    "sources": data["sources"],
                    "emergency": None
                }
        
        # Default response for general health
        return {
            "domain": "ALLOPATHY",
            "response": "For general health maintenance: 1) Eat balanced diet with fruits and vegetables daily 2) Stay hydrated with 8-10 glasses of water 3) Get 7-8 hours of quality sleep 4) Exercise for 30 minutes daily - walking, yoga, or any activity 5) Practice stress management through meditation or deep breathing. For specific medical concerns, please consult a healthcare provider.",
            "sources": ["general_health_guidelines"],
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
            "timestamp": len(self.memory[user_id])  # Simple counter
        })
        
        # Keep only last 5 memories
        if len(self.memory[user_id]) > 5:
            self.memory[user_id] = self.memory[user_id][-5:]
    
    def get_memory(self, user_id: str) -> list[dict[str, Any]]:
        return self.memory.get(user_id, [])

# Initialize backend
backend = StandaloneMedicalBackend()

@app.get("/healthz")
async def health_check():
    return {"status": "ok", "backend": "standalone", "database": "built_in"}

@app.post("/v1/router", response_model=RouterResponse)
async def router(req: RouterRequest) -> RouterResponse:
    try:
        # Get medical response
        result = backend.get_medical_response(req.transcript)
        
        # Save to memory if consent given
        if req.consent_to_save:
            backend.save_memory(req.user_id, req.transcript, result, req.consent_to_save)
        
        # Get memory context
        memory_context = backend.get_memory(req.user_id)
        
        return RouterResponse(
            domain=result["domain"],
            detected_language="en",
            answer_text=result["response"],
            guardrail_triggered=False,
            sources=[{"type": source, "confidence": 0.95} for source in result["sources"]],
            memory_context=memory_context[-2:],  # Last 2 memories
            emergency=result["emergency"]
        )
        
    except Exception as e:
        return RouterResponse(
            domain="ALLOPATHY",
            detected_language="en",
            answer_text="I'm experiencing technical difficulties. Please consult a local healthcare provider for proper medical advice.",
            guardrail_triggered=True,
            sources=[],
            memory_context=[],
            emergency=None
        )

@app.post("/vapi/tools/medicalvault")
async def vapi_medical_vault(req: dict) -> dict:
    """Vapi tool endpoint - connects to standalone backend"""
    try:
        query = req.get("query", "")
        user_id = req.get("user_id", "default")
        
        # Get medical response
        result = backend.get_medical_response(query)
        
        # Save to memory
        backend.save_memory(user_id, query, result, True)
        
        return {
            "results": [{
                "result": result["response"],
                "sources": [{"type": source, "confidence": 0.95} for source in result["sources"]],
                "domain": result["domain"],
                "emergency": result["emergency"]
            }]
        }
        
    except Exception as e:
        return {
            "results": [{
                "result": "Namaste. I'm having technical difficulties right now. Please try again or consult a healthcare provider.",
                "sources": [],
                "domain": "ALLOPATHY",
                "emergency": None
            }]
        }

@app.get("/v1/memory/{user_id}")
async def memory_get(user_id: str) -> dict:
    try:
        memories = backend.get_memory(user_id)
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
        
        result = {
            "domain": "ALLOPATHY",
            "response": summary
        }
        
        backend.save_memory(user_id, raw_text, result, consent)
        
        return {"success": True, "message": "Memory saved successfully"}
        
    except Exception as e:
        return {"success": False, "message": "Failed to save memory"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
