# TRULY INTERACTIVE backend - Unique responses for each user

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any
import random
import time

app = FastAPI(title="AuraHealth Backend - Interactive")

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

# Interactive medical response system
class InteractiveMedicalAssistant:
    def __init__(self):
        self.user_sessions = {}
        self.response_variations = self._create_response_variations()
    
    def _create_response_variations(self):
        """Create multiple variations for each condition to ensure unique responses"""
        return {
            "headache": [
                {
                    "domain": "ALLOPATHY",
                    "response": "Based on your headache pattern, I recommend: 1) Apply cold pack to forehead for 15 minutes 2) Rest in quiet, dark room 3) Try gentle neck massage 4) Stay hydrated with water 5) Consider paracetamol 500mg if needed. How long have you been experiencing this?",
                    "follow_up": "How long have you been experiencing this headache?"
                },
                {
                    "domain": "ALLOPATHY", 
                    "response": "For your headache relief: 1) Practice deep breathing exercises 2) Apply warm compress to back of neck 3) Drink peppermint tea slowly 4) Avoid screen time for 1 hour 5) Take paracetamol if pain is moderate. Is this a recurring issue for you?",
                    "follow_up": "Is this a recurring issue for you?"
                },
                {
                    "domain": "ALLOPATHY",
                    "response": "I understand your headache discomfort. Try these steps: 1) Press pressure points between thumb and index finger 2) Use lavender oil on temples 3) Sleep with elevated head 4) Avoid caffeine temporarily 5) Stay in a calm environment. What triggers your headaches usually?",
                    "follow_up": "What triggers your headaches usually?"
                }
            ],
            "fever": [
                {
                    "domain": "ALLOPATHY",
                    "response": "For your fever management: 1) Take paracetamol 500mg every 6 hours 2) Sponge with lukewarm water 3) Wear light cotton clothes 4) Drink coconut water with lemon 5) Monitor temperature every 4 hours. What's your current temperature reading?",
                    "follow_up": "What's your current temperature reading?"
                },
                {
                    "domain": "ALLOPATHY",
                    "response": "To manage your fever effectively: 1) Stay well-hydrated with ORS solution 2) Place cool cloth on forehead 3) Eat light meals like khichdi 4) Avoid heavy blankets 5) Rest in a ventilated room. Since when did the fever start?",
                    "follow_up": "Since when did the fever start?"
                }
            ],
            "cough": [
                {
                    "domain": "AYURVEDA",
                    "response": "For your cough, try these ayurvedic remedies: 1) Drink warm water with honey and turmeric 2) Gargle with salt water 3 times 3) Steam inhalation with tulsi leaves 4) Avoid cold drinks and ice cream 5) Try mulethi (licorice) tea. Is it a dry or productive cough?",
                    "follow_up": "Is it a dry or productive cough?"
                },
                {
                    "domain": "AYURVEDA",
                    "response": "Ayurvedic approach for your cough: 1) Take ginger juice with honey 2) Chew cloves slowly 3) Drink warm milk with haldi 4) Use eucalyptus oil for chest massage 5) Eat ripe banana with honey. Have you tried any home remedies already?",
                    "follow_up": "Have you tried any home remedies already?"
                }
            ],
            "emergency": [
                {
                    "domain": "EMERGENCY",
                    "response": "🚨 MEDICAL EMERGENCY DETECTED! Call 108 IMMEDIATELY! While waiting: 1) Stay calm and sit upright 2) Loosen tight clothing 3) If conscious, chew aspirin 325mg 4) Don't eat or drink 5) Have someone stay with you. This could be serious - don't delay!",
                    "follow_up": "Are you alone right now?"
                }
            ]
        }
    
    def get_user_session(self, user_id: str):
        if user_id not in self.user_sessions:
            self.user_sessions[user_id] = {
                "query_count": 0,
                "last_conditions": [],
                "context": [],
                "personalization": {
                    "name": user_id.replace("_", " ").title(),
                    "preferred_style": "caring"
                }
            }
        return self.user_sessions[user_id]
    
    def detect_emergency(self, text: str) -> dict[str, Any] | None:
        emergency_keywords = ["chest pain", "heart attack", "severe bleeding", "difficulty breathing", "unconscious", "severe pain"]
        text_lower = text.lower()
        
        for keyword in emergency_keywords:
            if keyword in text_lower:
                return {"action": "PHC_LOCATOR", "status": "triggered", "severity": "critical"}
        return None
    
    def get_unique_response(self, user_id: str, text: str) -> dict[str, Any]:
        session = self.get_user_session(user_id)
        session["query_count"] += 1
        
        # Check emergency first
        emergency = self.detect_emergency(text)
        if emergency:
            response_data = random.choice(self.response_variations["emergency"])
            return {
                "domain": response_data["domain"],
                "response": response_data["response"],
                "follow_up": response_data["follow_up"],
                "sources": ["emergency_protocol"],
                "emergency": emergency,
                "personalized": True
            }
        
        # Detect condition and get unique variation
        text_lower = text.lower()
        detected_condition = None
        
        for condition in self.response_variations.keys():
            if condition in text_lower:
                detected_condition = condition
                break
        
        if detected_condition:
            # Get different response based on user history
            variations = self.response_variations[detected_condition]
            
            # Select response based on user's query count and history
            if detected_condition in session["last_conditions"]:
                # User asked about this before - give different advice
                available_indices = [i for i in range(len(variations)) 
                                   if i != session["last_conditions"].get(detected_condition, 0)]
                if available_indices:
                    response_index = random.choice(available_indices)
                else:
                    response_index = random.randint(0, len(variations) - 1)
            else:
                # First time asking this condition
                response_index = session["query_count"] % len(variations)
            
            response_data = variations[response_index]
            session["last_conditions"][detected_condition] = response_index
            
            # Add personalization
            personalized_response = self._add_personalization(response_data["response"], session)
            
            return {
                "domain": response_data["domain"],
                "response": personalized_response,
                "follow_up": response_data["follow_up"],
                "sources": ["medical_guideline", "personalized_advice"],
                "emergency": None,
                "personalized": True
            }
        
        # Default response with personalization
        default_responses = [
            f"Hi {session['personalization']['name']}! For general health, I suggest: 1) Eat seasonal fruits daily 2) Stay hydrated with 8 glasses of water 3) Get 7-8 hours of sleep 4) Exercise for 30 minutes 5) Practice meditation. What specific health concerns do you have?",
            f"{session['personalization']['name']}, to maintain good health: 1) Include green vegetables in meals 2) Take stairs instead of elevator 3) Practice deep breathing 4) Limit screen time before bed 5) Stay positive. How can I help with your specific health goals?",
            f"Based on your health profile {session['personalization']['name']}: 1) Eat balanced meals with protein 2) Stay active with walking/yoga 3) Manage stress through hobbies 4) Get regular health checkups 5) Maintain work-life balance. What area would you like to focus on?"
        ]
        
        response_text = default_responses[session["query_count"] % len(default_responses)]
        
        return {
            "domain": "ALLOPATHY",
            "response": response_text,
            "follow_up": "What area would you like to focus on?",
            "sources": ["general_health", "personalized"],
            "emergency": None,
            "personalized": True
        }
    
    def _add_personalization(self, response: str, session: dict) -> str:
        """Add personalization based on user session"""
        name = session["personalization"]["name"]
        query_count = session["query_count"]
        
        if query_count == 1:
            # First interaction
            return f"Hello {name}! {response}"
        elif query_count > 3:
            # Returning user
            return f"Welcome back {name}! {response}"
        else:
            # Regular interaction
            return f"{name}, {response}"
    
    def save_memory(self, user_id: str, query: str, response: dict[str, Any], consent: bool):
        if not consent:
            return
        
        session = self.get_user_session(user_id)
        session["context"].append({
            "query": query,
            "response": response["response"],
            "domain": response["domain"],
            "timestamp": time.time()
        })
        
        # Keep only last 5 interactions
        if len(session["context"]) > 5:
            session["context"] = session["context"][-5:]
    
    def get_memory(self, user_id: str) -> list[dict[str, Any]]:
        session = self.get_user_session(user_id)
        return session["context"]

# Initialize interactive assistant
assistant = InteractiveMedicalAssistant()

@app.get("/healthz")
async def health_check():
    return {"status": "ok", "backend": "interactive", "personalization": "enabled"}

@app.post("/v1/router", response_model=RouterResponse)
async def router(req: RouterRequest) -> RouterResponse:
    try:
        # Get unique, personalized response
        result = assistant.get_unique_response(req.user_id, req.transcript)
        
        # Save to memory if consent given
        if req.consent_to_save:
            assistant.save_memory(req.user_id, req.transcript, result, req.consent_to_save)
        
        # Get memory context
        memory_context = assistant.get_memory(req.user_id)
        
        return RouterResponse(
            domain=result["domain"],
            detected_language="en",
            answer_text=result["response"],
            guardrail_triggered=False,
            sources=[{"type": source, "confidence": 0.9} for source in result["sources"]],
            memory_context=memory_context[-2:],
            emergency=result["emergency"]
        )
        
    except Exception as e:
        return RouterResponse(
            domain="ALLOPATHY",
            detected_language="en",
            answer_text="I'm experiencing technical difficulties right now. Please consult a healthcare provider for proper medical advice.",
            guardrail_triggered=True,
            sources=[],
            memory_context=[],
            emergency=None
        )

@app.post("/vapi/tools/medicalvault")
async def vapi_medical_vault(req: dict) -> dict:
    """Vapi tool with interactive responses"""
    try:
        query = req.get("query", "")
        user_id = req.get("user_id", "default")
        
        # Get unique response
        result = assistant.get_unique_response(user_id, query)
        
        # Save to memory
        assistant.save_memory(user_id, query, result, True)
        
        return {
            "results": [{
                "result": result["response"],
                "sources": [{"type": source, "confidence": 0.9} for source in result["sources"]],
                "domain": result["domain"],
                "emergency": result["emergency"],
                "personalized": result.get("personalized", False)
            }]
        }
        
    except Exception as e:
        return {
            "results": [{
                "result": "Namaste. I'm having technical difficulties right now. Please try again or consult a healthcare provider.",
                "sources": [],
                "domain": "ALLOPATHY",
                "emergency": None,
                "personalized": False
            }]
        }

@app.get("/v1/memory/{user_id}")
async def memory_get(user_id: str) -> dict:
    try:
        memories = assistant.get_memory(user_id)
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
        
        assistant.save_memory(user_id, raw_text, result, consent)
        
        return {"success": True, "message": "Memory saved successfully"}
        
    except Exception as e:
        return {"success": False, "message": "Failed to save memory"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
