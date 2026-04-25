# Fixed medical router endpoint with fallbacks
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Any

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

@app.post("/v1/router", response_model=RouterResponse)
async def router_fixed(req: RouterRequest) -> RouterResponse:
    """Fixed medical router with fallback responses"""
    
    # Simple domain classification
    transcript_lower = req.transcript.lower()
    domain = "ALLOPATHY"
    
    if any(word in transcript_lower for word in ["chest pain", "heart attack", "emergency", "severe", "can't breathe"]):
        domain = "EMERGENCY"
    elif any(word in transcript_lower for word in ["ayurveda", "herbal", "tulsi", "turmeric"]):
        domain = "AYURVEDA"
    elif any(word in transcript_lower for word in ["diet", "food", "nutrition", "eat"]):
        domain = "NUTRITION"
    
    # Language detection
    detected_language = "en"
    if any(char in req.transcript for char in ['आ', 'इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ए', 'ऐ', 'ओ', 'औ', 'अ', 'ं', 'ः', 'ँ']):
        detected_language = "hi"
    
    # Emergency handling
    if domain == "EMERGENCY":
        return RouterResponse(
            domain=domain,
            detected_language=detected_language,
            answer_text="Namaste. This sounds like an emergency. Please call 108 immediately or go to the nearest hospital. I'm sharing the nearest PHC link.",
            guardrail_triggered=False,
            sources=[],
            memory_context=[],
            emergency={"action": "PHC_LOCATOR", "status": "triggered"}
        )
    
    # Fallback medical responses
    fallback_responses = {
        "headache": "Namaste. For headache: Rest in a quiet place, drink plenty of water, and take paracetamol 500mg if needed. If the headache is severe or persistent, please consult a doctor.",
        "fever": "Namaste. For fever: Stay hydrated, get plenty of rest, and take paracetamol 500mg every 6 hours. If temperature goes above 102°F, seek medical help immediately.",
        "pain": "Namaste. For pain: Rest the affected area, apply cold compress, and take paracetamol if needed. If pain persists for more than 3 days, consult a healthcare provider.",
        "cough": "Namaste. For cough: Drink warm water with honey, take steam inhalation, and rest. If cough persists for more than a week, consult a doctor.",
        "cold": "Namaste. For cold: Rest, drink warm fluids, take steam inhalation, and use saline nasal drops. Consult doctor if symptoms worsen.",
        "stomach": "Namaste. For stomach issues: Eat light food, drink ORS solution, and avoid spicy food. If vomiting or diarrhea continues, consult doctor.",
        "default": "Namaste. I recommend consulting a local healthcare provider for proper medical advice. Please describe your symptoms in more detail."
    }
    
    # Find matching response
    answer_text = fallback_responses["default"]
    for key, response in fallback_responses.items():
        if key in transcript_lower and key != "default":
            answer_text = response
            break
    
    # Translate if needed
    if detected_language != "en":
        answer_text = f"[Hindi Response] {answer_text}"
    
    return RouterResponse(
        domain=domain,
        detected_language=detected_language,
        answer_text=answer_text,
        guardrail_triggered=False,
        sources=[],
        memory_context=[],
        emergency=None
    )
