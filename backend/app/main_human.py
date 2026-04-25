# HUMAN-LIKE backend - Not like ChatGPT at all

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any
import random
import time

app = FastAPI(title="AuraHealth Backend - Human Like")

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

# Human-like conversation system
class HumanMedicalAssistant:
    def __init__(self):
        self.user_sessions = {}
        self.human_responses = self._create_human_responses()
    
    def _create_human_responses(self):
        """Create natural, conversational responses"""
        return {
            "headache": [
                {
                    "domain": "ALLOPATHY",
                    "response": "Oh no, headaches are the worst! Have you tried lying down in a dark room for a bit? Sometimes just closing your eyes and being quiet helps. If it's really bothering you, maybe a paracetamol would help. How long have you had this headache?",
                    "personality": "caring"
                },
                {
                    "domain": "ALLOPATHY",
                    "response": "Ugh, I hate when headaches pop up like that. You know what sometimes works? Gently massaging your temples or putting a cold cloth on your forehead. Are you stressed about something? That often triggers headaches for me.",
                    "personality": "relatable"
                },
                {
                    "domain": "ALLOPATHY",
                    "response": "Headaches can really ruin your day, can't they? Maybe try drinking some water and resting for a bit. Sometimes we get headaches just from being dehydrated. Is this like your usual headaches or different?",
                    "personality": "friendly"
                },
                {
                    "domain": "ALLOPATHY",
                    "response": "I'm sorry you're dealing with a headache. Have you been staring at screens too much? That does it to me every time. Maybe step away from your phone for a bit and just relax. Want to tell me more about what it feels like?",
                    "personality": "empathetic"
                }
            ],
            "fever": [
                {
                    "domain": "ALLOPATHY",
                    "response": "Fevers can be scary, can't they? Make sure you're drinking lots of fluids - maybe some coconut water or just plain water with lemon. Are you feeling really hot or just a bit warm?",
                    "personality": "concerned"
                },
                {
                    "domain": "ALLOPATHY",
                    "response": "Oh no, you have a fever? That's no fun at all. Try to rest as much as you can - your body is fighting something. Have you taken your temperature? Sometimes just sponging with cool water helps you feel better.",
                    "personality": "nurturing"
                }
            ],
            "cough": [
                {
                    "domain": "AYURVEDA",
                    "response": "That cough sounds annoying! Have you tried some honey in warm water? My grandma always swore by that. And maybe some ginger tea too - that really helps soothe your throat. Is it a dry cough or do you have stuff coming up?",
                    "personality": "home_remedy"
                },
                {
                    "domain": "AYURVEDA",
                    "response": "Coughs can be so frustrating, especially when you're trying to sleep! You know what works wonders? Gargling with warm salt water. And try some steam - maybe just hot water in a bowl with a towel over your head. How long have you been coughing?",
                    "personality": "practical"
                }
            ],
            "stomach": [
                {
                    "domain": "AYURVEDA",
                    "response": "Oh no, stomach troubles are the worst! Maybe stick to really simple food for a bit - like some rice and dal. And buttermilk can be really soothing. Did you eat something that didn't agree with you?",
                    "personality": "gentle"
                },
                {
                    "domain": "AYURVEDA",
                    "response": "Stomach issues can really throw you off, can't they? Try some fennel seeds after eating - that really helps with digestion. And maybe avoid heavy, spicy food for a day or two. Are you feeling nauseous or just uncomfortable?",
                    "personality": "understanding"
                }
            ],
            "emergency": [
                {
                    "domain": "EMERGENCY",
                    "response": "Wait, this sounds serious! You need to call 108 right now - like immediately! Don't wait around with chest pain or trouble breathing. Please call emergency services now! Are you able to talk to someone?",
                    "personality": "urgent"
                }
            ],
            "general": [
                {
                    "domain": "ALLOPATHY",
                    "response": "Hey there! I'm here to help with whatever health questions you have. Don't worry about asking anything - I've heard it all! What's on your mind today?",
                    "personality": "welcoming"
                },
                {
                    "domain": "ALLOPATHY",
                    "response": "Hi! How are you feeling today? Sometimes just talking about what's bothering you helps. What health stuff can I help you figure out?",
                    "personality": "friendly"
                },
                {
                    "domain": "ALLOPATHY",
                    "response": "Hey! Glad you reached out. Taking care of your health is so important, and it's great that you're being proactive about it. What's going on with you?",
                    "personality": "encouraging"
                }
            ]
        }
    
    def get_user_session(self, user_id: str):
        if user_id not in self.user_sessions:
            self.user_sessions[user_id] = {
                "query_count": 0,
                "mood": "friendly",
                "last_topics": [],
                "personality_match": "caring"
            }
        return self.user_sessions[user_id]
    
    def detect_emergency(self, text: str) -> dict[str, Any] | None:
        emergency_keywords = ["chest pain", "heart attack", "severe bleeding", "difficulty breathing", "unconscious", "severe pain"]
        text_lower = text.lower()
        
        for keyword in emergency_keywords:
            if keyword in text_lower:
                return {"action": "PHC_LOCATOR", "status": "triggered", "severity": "critical"}
        return None
    
    def get_human_response(self, user_id: str, text: str) -> dict[str, Any]:
        session = self.get_user_session(user_id)
        session["query_count"] += 1
        
        # Check emergency first
        emergency = self.detect_emergency(text)
        if emergency:
            response_data = self.human_responses["emergency"][0]
            return {
                "domain": response_data["domain"],
                "response": response_data["response"],
                "personality": response_data["personality"],
                "sources": ["emergency_protocol"],
                "emergency": emergency
            }
        
        # Detect condition
        text_lower = text.lower()
        detected_condition = None
        
        for condition in self.human_responses.keys():
            if condition != "general" and condition in text_lower:
                detected_condition = condition
                break
        
        if detected_condition:
            # Get human-like response
            responses = self.human_responses[detected_condition]
            
            # Rotate through responses based on query count
            response_index = session["query_count"] % len(responses)
            response_data = responses[response_index]
            
            # Add personal touch based on conversation history
            if session["query_count"] > 1:
                # Add follow-up for returning users
                base_response = response_data["response"]
                if "again" in text_lower or detected_condition in session["last_topics"]:
                    follow_up = random.choice([
                        " Still bothering you, huh?",
                        " I remember you mentioned this before.",
                        " Let's try something different this time.",
                        " Seems like this is really bothering you."
                    ])
                    response_data["response"] = base_response + follow_up
            
            session["last_topics"].append(detected_condition)
            if len(session["last_topics"]) > 3:
                session["last_topics"] = session["last_topics"][-3:]
            
            return {
                "domain": response_data["domain"],
                "response": response_data["response"],
                "personality": response_data["personality"],
                "sources": ["human_conversation", "empathetic_response"],
                "emergency": None
            }
        
        # General health conversation
        general_responses = self.human_responses["general"]
        response_index = session["query_count"] % len(general_responses)
        response_data = general_responses[response_index]
        
        return {
            "domain": response_data["domain"],
            "response": response_data["response"],
            "personality": response_data["personality"],
            "sources": ["human_conversation"],
            "emergency": None
        }
    
    def save_memory(self, user_id: str, query: str, response: dict[str, Any], consent: bool):
        if not consent:
            return
        
        session = self.get_user_session(user_id)
        # Simple memory tracking
        session["last_query"] = query
        session["last_response"] = response["response"]
    
    def get_memory(self, user_id: str) -> list[dict[str, Any]]:
        session = self.get_user_session(user_id)
        return []

# Initialize human assistant
assistant = HumanMedicalAssistant()

@app.get("/healthz")
async def health_check():
    return {"status": "ok", "backend": "human_like", "style": "conversational"}

@app.post("/v1/router", response_model=RouterResponse)
async def router(req: RouterRequest) -> RouterResponse:
    try:
        # Get human-like response
        result = assistant.get_human_response(req.user_id, req.transcript)
        
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
            memory_context=memory_context,
            emergency=result["emergency"]
        )
        
    except Exception as e:
        return RouterResponse(
            domain="ALLOPATHY",
            detected_language="en",
            answer_text="Hey, I'm having a bit of trouble right now. Maybe try asking me again in a moment?",
            guardrail_triggered=True,
            sources=[],
            memory_context=[],
            emergency=None
        )

@app.post("/vapi/tools/medicalvault")
async def vapi_medical_vault(req: dict) -> dict:
    """Vapi tool with human-like responses"""
    try:
        query = req.get("query", "")
        user_id = req.get("user_id", "default")
        
        # Get human response
        result = assistant.get_human_response(user_id, query)
        
        # Save to memory
        assistant.save_memory(user_id, query, result, True)
        
        return {
            "results": [{
                "result": result["response"],
                "sources": [{"type": source, "confidence": 0.9} for source in result["sources"]],
                "domain": result["domain"],
                "emergency": result["emergency"],
                "personality": result.get("personality", "friendly")
            }]
        }
        
    except Exception as e:
        return {
            "results": [{
                "result": "Oops, having a bit of technical trouble here. Can you try asking again?",
                "sources": [],
                "domain": "ALLOPATHY",
                "emergency": None,
                "personality": "apologetic"
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
        
        return {"success": True, "message": "Got it, I'll remember that for you!"}
        
    except Exception as e:
        return {"success": False, "message": "Oops, had trouble saving that. Try again?"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
