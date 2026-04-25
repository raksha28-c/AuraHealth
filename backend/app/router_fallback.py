"""
Fallback medical router with complete functionality
"""

from typing import Any
from langdetect import detect as detect_lang

def classify_domain_simple(text: str) -> str:
    """Simple domain classification without AI"""
    text_lower = text.lower()
    
    # Emergency keywords
    emergency_words = ["chest pain", "heart attack", "emergency", "severe", "can't breathe", "unconscious", "bleeding"]
    if any(word in text_lower for word in emergency_words):
        return "EMERGENCY"
    
    # AYUSH keywords
    ayush_words = ["ayurveda", "herbal", "tulsi", "turmeric", "yoga", "homeopathy"]
    if any(word in text_lower for word in ayush_words):
        return "AYURVEDA"
    
    # Nutrition keywords
    nutrition_words = ["diet", "food", "nutrition", "eat", "vitamin", "protein"]
    if any(word in text_lower for word in nutrition_words):
        return "NUTRITION"
    
    # Default to allopathy
    return "ALLOPATHY"

def get_medical_response(transcript: str, domain: str) -> str:
    """Get medical response based on symptoms and domain"""
    transcript_lower = transcript.lower()
    
    # Emergency responses
    if domain == "EMERGENCY":
        return "Namaste. This sounds like an emergency. Please call 108 immediately or go to the nearest hospital. I'm sharing the nearest PHC link."
    
    # AYUSH responses
    if domain == "AYURVEDA":
        if "headache" in transcript_lower:
            return "Namaste. For headache in Ayurveda: Try applying paste of sandalwood on forehead, drink tulsi-ginger tea, and practice gentle head massage. Consult Ayurvedic practitioner for persistent issues."
        elif "fever" in transcript_lower:
            return "Namaste. For fever in Ayurveda: Drink coriander seed water, take tulsi leaves with honey, and avoid heavy foods. Consult practitioner if fever persists."
        else:
            return "Namaste. For Ayurvedic guidance, I recommend consulting a qualified Ayurvedic practitioner who can provide personalized treatment based on your constitution."
    
    # Nutrition responses
    if domain == "NUTRITION":
        if "weak" in transcript_lower or "tired" in transcript_lower:
            return "Namaste. For weakness: Eat iron-rich foods like spinach, lentils, and jaggery. Include vitamin C foods like lemon and amla for better absorption. Rest well and stay hydrated."
        elif "child" in transcript_lower:
            return "Namaste. For child nutrition: Include proteins like dal, paneer, and eggs. Give fruits and vegetables daily. Ensure adequate milk and water intake."
        else:
            return "Namaste. For nutrition: Eat balanced meals with proteins, vitamins, and minerals. Include local seasonal fruits and vegetables. Stay hydrated throughout the day."
    
    # Allopathy responses (default)
    medical_responses = {
        "headache": "Namaste. For headache: Rest in a quiet place, drink plenty of water, and take paracetamol 500mg if needed. If the headache is severe or persistent, please consult a doctor.",
        "fever": "Namaste. For fever: Stay hydrated, get plenty of rest, and take paracetamol 500mg every 6 hours. If temperature goes above 102°F, seek medical help immediately.",
        "pain": "Namaste. For pain: Rest the affected area, apply cold compress, and take paracetamol if needed. If pain persists for more than 3 days, consult a healthcare provider.",
        "cough": "Namaste. For cough: Drink warm water with honey, take steam inhalation, and rest. If cough persists for more than a week, consult a doctor.",
        "cold": "Namaste. For cold: Rest, drink warm fluids, take steam inhalation, and use saline nasal drops. Consult doctor if symptoms worsen.",
        "stomach": "Namaste. For stomach issues: Eat light food, drink ORS solution, and avoid spicy food. If vomiting or diarrhea continues, consult doctor.",
        "vomiting": "Namaste. For vomiting: Stop eating for 2-3 hours, sip ORS solution slowly, then start with light foods like rice and banana. Consult doctor if vomiting continues.",
        "diarrhea": "Namaste. For diarrhea: Drink plenty of ORS solution, eat rice and banana, avoid dairy and spicy foods. Consult doctor if continues for more than 2 days.",
        "sore throat": "Namaste. For sore throat: Gargle with warm salt water, drink warm fluids with honey, and rest your voice. Consult doctor if severe or with fever.",
        "injury": "Namaste. For injury: Clean the wound with antiseptic, apply bandage, and rest. If bleeding heavily or deep wound, seek medical help immediately.",
        "burn": "Namaste. For burns: Cool the area with running water for 10-15 minutes, apply sterile dressing. For severe burns, seek emergency medical help."
    }
    
    # Find matching response
    for symptom, response in medical_responses.items():
        if symptom in transcript_lower:
            return response
    
    # Default response
    return "Namaste. I recommend consulting a local healthcare provider for proper medical advice. Please describe your symptoms in more detail so I can provide better guidance."

def detect_language_simple(text: str) -> str:
    """Simple language detection"""
    # Check for Hindi characters
    hindi_chars = ['आ', 'इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ए', 'ऐ', 'ओ', 'औ', 'अ', 'ं', 'ः', 'ँ']
    if any(char in text for char in hindi_chars):
        return "hi"
    
    # Check for other Indian languages
    if any(char in text for char in ['ಕ', 'ಖ', 'ಗ', 'ಘ', 'ಙ']):  # Kannada
        return "kn"
    if any(char in text for char in ['క', 'ఖ', 'గ', 'ఘ', 'ఙ']):  # Telugu
        return "te"
    if any(char in text for char in ['க', 'கா', 'கி', 'கீ', 'கு', 'கூ']):  # Tamil
        return "ta"
    
    return "en"

def translate_response(response: str, target_lang: str) -> str:
    """Simple translation placeholders"""
    translations = {
        "hi": f"[हिंदी] {response}",
        "kn": f"[ಕನ್ನಡ] {response}",
        "te": f"[తెలుగు] {response}",
        "ta": f"[தமிழ்] {response}",
        "mr": f"[मराठी] {response}"
    }
    return translations.get(target_lang, response)

async def process_medical_request(user_id: str, transcript: str, consent_to_save: bool) -> dict[str, Any]:
    """Process medical request with complete fallback logic"""
    
    # Detect language
    try:
        detected = detect_lang(transcript)
    except:
        detected = detect_language_simple(transcript)
    
    # Classify domain
    domain = classify_domain_simple(transcript)
    
    # Get response
    answer_en = get_medical_response(transcript, domain)
    
    # Translate if needed
    answer_text = translate_response(answer_en, detected) if detected != "en" else answer_en
    
    # Emergency handling
    emergency_payload = None
    if domain == "EMERGENCY":
        emergency_payload = {"action": "PHC_LOCATOR", "status": "triggered"}
    
    return {
        "domain": domain,
        "detected_language": detected,
        "answer_text": answer_text,
        "guardrail_triggered": False,
        "sources": [],
        "memory_context": [],
        "emergency": emergency_payload
    }
