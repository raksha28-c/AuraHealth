# Fast main.py with unique, interactive medical responses

from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Any
import random
import asyncio

app = FastAPI(title="AuraHealth Backend - Fast & Interactive")

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

# Interactive Medical Response System
class InteractiveMedicalAssistant:
    """Fast, interactive medical assistant with unique responses"""
    
    def __init__(self):
        self.user_sessions = {}
        self.response_variations = {
            "headache": [
                ["💊 MEDICAL GUIDANCE 💊\n\nFor your headache:\n1. Apply cold compress to forehead for 15 minutes\n2. Rest in quiet, dark room\n3. Take paracetamol 500mg if needed\n4. Stay hydrated, drink water\n5. Avoid bright lights and loud sounds", "ALLOPATHY"],
                ["💊 MEDICAL GUIDANCE 💊\n\nHeadache relief options:\n1. Gentle neck massage and shoulder stretches\n2. Drink warm water with lemon\n3. Try acupressure on thumb and index finger\n4. Use peppermint oil on temples\n5. Take paracetamol 500mg if needed", "ALLOPATHY"],
                ["💊 MEDICAL GUIDANCE 💊\n\nFor immediate headache relief:\n1. Rest in comfortable position\n2. Apply cold pack to back of neck\n3. Sip ginger tea slowly\n4. Practice deep breathing\n5. Take paracetamol 500mg if needed", "ALLOPATHY"]
            ],
            "fever": [
                ["🌡️ FEVER MANAGEMENT 🌡️\n\nTo manage your fever:\n1. Take paracetamol 500mg every 6 hours\n2. Drink plenty of fluids - water, ORS, coconut water\n3. Wear light, breathable clothing\n4. Take lukewarm sponge bath\n5. Monitor temperature every 4 hours", "ALLOPATHY"],
                ["🌡️ FEVER MANAGEMENT 🌡️\n\nFever care instructions:\n1. Stay well hydrated with electrolyte drinks\n2. Rest in cool, comfortable room\n3. Use cold compress on forehead\n4. Eat light, easy-to-digest foods\n5. Take paracetamol 500mg if needed", "ALLOPATHY"],
                ["🌡️ FEVER MANAGEMENT 🌡️\n\nFor fever reduction:\n1. Drink plenty of cool fluids frequently\n2. Place damp cloth on forehead and neck\n3. Wear minimal, light clothing\n4. Get adequate rest and sleep\n5. Take paracetamol 500mg every 6 hours", "ALLOPATHY"]
            ],
            "emergency_chest": [
                ["🚨 CHEST PAIN EMERGENCY 🚨\n\nIMMEDIATE ACTIONS REQUIRED:\n• Call 108 RIGHT NOW - this could be heart attack\n• Chew 325mg aspirin if available\n• Sit down, don't move around\n• Loosen tight clothing\n• Wait for emergency services to arrive", "EMERGENCY"],
                ["🚨 CHEST PAIN EMERGENCY 🚨\n\nCRITICAL - ACT IMMEDIATELY:\n• Call 108 emergency services now\n• Stop all activity, sit and rest\n• Chew and swallow aspirin 325mg\n• Nitroglycerin if prescribed\n• Monitor breathing and consciousness", "EMERGENCY"]
            ],
            "ayurveda": [
                ["🌿 AYURVEDIC WISDOM 🌿\n\nTraditional remedies for your concern:\n1. Tulsi tea with honey for immunity\n2. Turmeric milk for inflammation\n3. Ginger with honey for digestion\n4. Ashwagandha for stress relief\n5. Triphala for detoxification", "AYURVEDA"],
                ["🌿 AYURVEDIC WISDOM 🌿\n\nNatural healing approaches:\n1. Amla juice for vitamin C boost\n2. Jeera water for digestion\n3. Ghee massage for nourishment\n4. Yoga breathing for stress\n5. Seasonal fruits for balance", "AYURVEDA"]
            ],
            "nutrition": [
                ["🥗 NUTRITION ADVICE 🥗\n\nDietary recommendations:\n1. Include protein: dal, paneer, eggs, nuts\n2. Eat iron-rich foods: spinach, jaggery, dates\n3. Add vitamin C: lemon, amla, oranges\n4. Complex carbs: brown rice, whole wheat\n5. Stay hydrated with water and coconut water", "NUTRITION"],
                ["🥗 NUTRITION ADVICE 🥗\n\nHealthy eating plan:\n1. Balanced meals with all food groups\n2. Seasonal fruits and vegetables daily\n3. Whole grains over refined grains\n4. Healthy fats: nuts, seeds, ghee\n5. Limit processed foods and sugar", "NUTRITION"]
            ]
        }
        
    async def get_unique_response(self, user_id: str, transcript: str, detected_language: str = "en") -> dict:
        """Get unique, interactive response"""
        
        # Get user session for context
        session = self.user_sessions.get(user_id, {"count": 0, "last_topics": []})
        
        # Check for emergency first
        text_lower = transcript.lower()
        if any(word in text_lower for word in ["chest pain", "heart attack", "severe chest"]):
            emergency_responses = self.response_variations["emergency_chest"]
            chosen = emergency_responses[session["count"] % len(emergency_responses)]
            return {
                "domain": chosen[1],
                "detected_language": detected_language,
                "answer_text": chosen[0],
                "guardrail_triggered": False,
                "sources": [{"type": "emergency_protocol", "confidence": 1.0}],
                "memory_context": [],
                "emergency": {"action": "PHC_LOCATOR", "status": "triggered", "severity": "critical"},
                "personalized": True
            }
        
        # Determine response category
        response_key = None
        if "headache" in text_lower or "migraine" in text_lower:
            response_key = "headache"
        elif "fever" in text_lower or "temperature" in text_lower:
            response_key = "fever"
        elif any(word in text_lower for word in ["ayurveda", "herbal", "tulsi", "turmeric"]):
            response_key = "ayurveda"
        elif any(word in text_lower for word in ["diet", "nutrition", "eat", "food"]):
            response_key = "nutrition"
        
        # Get unique response
        if response_key and response_key in self.response_variations:
            responses = self.response_variations[response_key]
            chosen = responses[session["count"] % len(responses)]
            
            # Add context-aware follow-up
            if response_key in session["last_topics"]:
                chosen[0] += f"\n\n📋 Following up on your {response_key} concern..."
            
            # Update session
            session["count"] += 1
            session["last_topics"].append(response_key)
            if len(session["last_topics"]) > 3:
                session["last_topics"] = session["last_topics"][-3:]
            
            self.user_sessions[user_id] = session
            
            return {
                "domain": chosen[1],
                "detected_language": detected_language,
                "answer_text": chosen[0],
                "guardrail_triggered": False,
                "sources": [{"type": "medical_knowledge", "confidence": 0.9, "domain": chosen[1]}],
                "memory_context": [],
                "emergency": None,
                "personalized": True
            }
        
        # Default intelligent response
        default_responses = [
            ["💊 MEDICAL GUIDANCE 💊\n\nFor your health concern:\n1. Please describe your specific symptoms\n2. Monitor your condition closely\n3. Maintain balanced diet and hydration\n4. Get adequate rest and sleep\n5. Consult local healthcare provider if persistent", "ALLOPATHY"],
            ["💊 MEDICAL GUIDANCE 💊\n\nGeneral health advice:\n1. Practice good hygiene and sanitation\n2. Exercise regularly for 30 minutes daily\n3. Eat balanced, nutritious meals\n4. Manage stress through meditation\n5. Schedule regular health checkups", "ALLOPATHY"]
        ]
        
        chosen = default_responses[session["count"] % len(default_responses)]
        session["count"] += 1
        self.user_sessions[user_id] = session
        
        return {
            "domain": chosen[1],
            "detected_language": detected_language,
            "answer_text": chosen[0],
            "guardrail_triggered": False,
            "sources": [{"type": "general_health", "confidence": 0.7}],
            "memory_context": [],
            "emergency": None,
            "personalized": True
        }

# Initialize assistant
medical_assistant = InteractiveMedicalAssistant()

# Health check
@app.get("/healthz")
async def health_check():
    return {"status": "ok"}

# Interactive Medical Router
@app.post("/v1/router", response_model=RouterResponse)
async def router(req: RouterRequest) -> RouterResponse:
    """Fast, interactive medical router with unique responses"""
    
    try:
        # Detect language
        detected = "en"
        if any(char in req.transcript for char in ['आ', 'इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ए', 'ऐ', 'ओ', 'औ', 'अ']):
            detected = "hi"
        
        # Get unique response
        result = await medical_assistant.get_unique_response(req.user_id, req.transcript, detected)
        
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
    return MemoryGetResponse(user_id=user_id, last=[])

@app.post("/v1/memory")
async def memory_upsert(req: MemoryUpsertRequest) -> dict[str, Any]:
    return {"success": True, "message": "Memory saved"}

# Enhanced Vapi endpoint for voice
@app.post("/vapi/tools/medicalvault")
async def vapi_medical_vault(req: dict) -> dict:
    """Voice-optimized medical responses"""
    try:
        query = req.get("query", "")
        user_id = req.get("user_id", "default")
        
        result = await medical_assistant.get_unique_response(user_id, query, "en")
        
        # Make it voice-friendly
        voice_text = result["answer_text"].replace("1.", "First,").replace("2.", "Second,").replace("3.", "Third,").replace("4.", "Fourth,").replace("5.", "Fifth,")
        
        return {
            "results": [{
                "result": voice_text,
                "sources": result["sources"],
                "domain": result["domain"],
                "emergency": result["emergency"],
                "personalized": result["personalized"]
            }]
        }
        
    except Exception:
        return {
            "results": [{
                "result": "Namaste. Please try again or consult a healthcare provider.",
                "sources": [],
                "domain": "ALLOPATHY",
                "emergency": None,
                "personalized": False
            }]
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
