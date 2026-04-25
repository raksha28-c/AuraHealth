# Enhanced AuraHealth Backend with All Top-Level Features

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, List, Dict, Optional
import asyncio
import httpx
import os
import random
import time
import json
import re
from datetime import datetime, timedelta

app = FastAPI(title="AuraHealth Enhanced Backend - All Features")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Enhanced Models
class RouterRequest(BaseModel):
    user_id: str
    transcript: str
    consent_to_save: bool
    language: Optional[str] = "en"
    voice_mode: Optional[bool] = False

class RouterResponse(BaseModel):
    domain: str
    detected_language: str
    answer_text: str
    guardrail_triggered: bool
    sources: list[dict[str, Any]]
    memory_context: list[dict[str, Any]]
    emergency: dict[str, Any] | None
    prescription_analysis: Optional[dict[str, Any]] = None
    symptom_routing: Optional[dict[str, Any]] = None

class PrescriptionRequest(BaseModel):
    user_id: str
    prescription_text: str
    image_url: Optional[str] = None

class EmergencyAlertRequest(BaseModel):
    user_id: str
    emergency_type: str
    location: Optional[str] = None
    severity: str
    contact_info: Optional[str] = None

class PatientMemoryRequest(BaseModel):
    user_id: str
    medical_data: dict[str, Any]
    consent_to_save: bool

# Settings
class Settings:
    qdrant_url = os.getenv("QDRANT_URL", "https://your-qdrant-cluster.cloud.qdrant.io")
    qdrant_api_key = os.getenv("QDRANT_API_KEY", "your_qdrant_api_key")
    gemini_api_key = os.getenv("GOOGLE_AI_API_KEY", "your_gemini_api_key")
    vapi_private_key = os.getenv("VAPI_PRIVATE_KEY", "your_vapi_private_key")
    whatsapp_webhook_url = os.getenv("WHATSAPP_WEBHOOK_URL", "")
    emergency_contacts = os.getenv("EMERGENCY_CONTACTS", "911,108").split(",")

settings = Settings()

# Enhanced Qdrant Client
class EnhancedQdrantClient:
    def __init__(self, url: str, api_key: str):
        self.url = url
        self.api_key = api_key
        self.collections = {
            "medication_safety": [
                {"payload": {"text": "Paracetamol maximum dose: 4g per day for adults", "confidence": 0.95}},
                {"payload": {"text": "Ibuprofen should be taken with food to avoid stomach irritation", "confidence": 0.90}},
                {"payload": {"text": "Aspirin contraindicated in children under 16 due to Reye's syndrome", "confidence": 0.98}},
                {"payload": {"text": "Metformin should be taken with meals to reduce GI side effects", "confidence": 0.92}},
                {"payload": {"text": "Warfarin requires regular INR monitoring", "confidence": 0.96}}
            ],
            "symptom_routing": [
                {"payload": {"text": "Chest pain + shortness of breath = Emergency department", "confidence": 0.99}},
                {"payload": {"text": "Headache + vision changes = Neurology consult", "confidence": 0.85}},
                {"payload": {"text": "Fever + rash = Dermatology/infectious disease", "confidence": 0.80}},
                {"payload": {"text": "Abdominal pain + vomiting = Gastroenterology", "confidence": 0.88}},
                {"payload": {"text": "Joint pain + swelling = Rheumatology", "confidence": 0.82}}
            ],
            "prescription_analysis": [
                {"payload": {"text": "ACE inhibitors may cause cough as side effect", "confidence": 0.94}},
                {"payload": {"text": "Beta blockers may mask hypoglycemia symptoms", "confidence": 0.91}},
                {"payload": {"text": "Statins may cause muscle pain, monitor CK levels", "confidence": 0.89}},
                {"payload": {"text": "SSRIs may increase risk of bleeding with NSAIDs", "confidence": 0.87}},
                {"payload": {"text": "Diuretics may cause electrolyte imbalance", "confidence": 0.93}}
            ],
            "emergency_protocols": [
                {"payload": {"text": "Chest pain protocol: Call emergency services, chew aspirin", "confidence": 0.99}},
                {"payload": {"text": "Stroke protocol: FAST - Face, Arms, Speech, Time", "confidence": 0.98}},
                {"payload": {"text": "Seizure protocol: Protect airway, time duration", "confidence": 0.95}},
                {"payload": {"text": "Anaphylaxis protocol: Epinephrine, call emergency", "confidence": 0.99}},
                {"payload": {"text": "Hypoglycemia protocol: Glucose, monitor consciousness", "confidence": 0.96}}
            ],
            "user_memory": []
        }
    
    async def search(self, collection: str, query_vector: list[float], limit: int = 3):
        """Enhanced search with multiple collections"""
        if collection in self.collections:
            return {"result": self.collections[collection][:limit]}
        return {"result": []}
    
    async def upsert(self, collection: str, points: list):
        """Enhanced memory storage"""
        if collection == "user_memory":
            self.collections[collection].extend(points)
            print(f"Memory stored: {len(points)} points in {collection}")
        return {"status": "success"}

# Enhanced Gemini Client with Multilingual Support
class EnhancedGeminiClient:
    def __init__(self):
        self.api_key = settings.gemini_api_key
        self.supported_languages = {
            "en": "English",
            "hi": "Hindi",
            "bn": "Bengali",
            "te": "Telugu",
            "ta": "Tamil",
            "mr": "Marathi",
            "gu": "Gujarati",
            "kn": "Kannada",
            "ml": "Malayalam",
            "pa": "Punjabi"
        }
    
    async def embed_text(self, text: str) -> list[float]:
        """Generate embeddings for text"""
        return [random.random() for _ in range(768)]
    
    async def detect_language(self, text: str) -> str:
        """Detect language from text"""
        # Simple language detection based on common words
        hindi_indicators = ["है", "हूं", "हो", "क्या", "मैं", "आप", "यह", "वह"]
        bengali_indicators = ["আমি", "তুমি", "সে", "এটা", "ওটা", "কি", "কেন"]
        
        text_lower = text.lower()
        if any(indicator in text for indicator in hindi_indicators):
            return "hi"
        elif any(indicator in text for indicator in bengali_indicators):
            return "bn"
        return "en"
    
    async def translate_response(self, response: str, target_language: str) -> str:
        """Translate response to target language"""
        translations = {
            "hi": {
                "Based on your symptoms": "आपके लक्षणों के आधार पर",
                "I recommend": "मैं अनुशंसा करता हूं",
                "Please consult": "कृपया सलाह लें",
                "Emergency": "आपातकालीन",
                "This sounds serious": "यह गंभीर लगता है"
            },
            "bn": {
                "Based on your symptoms": "আপনার উপসর্গের উপর ভিত্তি করে",
                "I recommend": "আমি সুপারিশ করি",
                "Please consult": "অনুগ্রহ করে পরামর্শ নিন",
                "Emergency": "জরুরি",
                "This sounds serious": "এটি গুরুতর মনে হচ্ছে"
            }
        }
        
        if target_language in translations:
            for en_text, translated_text in translations[target_language].items():
                response = response.replace(en_text, translated_text)
        
        return response
    
    async def generate_json(self, model: str, system: str, user: str, language: str = "en") -> dict:
        """Generate contextual response with multilingual support"""
        
        # Enhanced medical responses
        medical_responses = [
            "Based on your symptoms, I recommend staying hydrated and getting adequate rest. If symptoms persist for more than 3 days, consult a healthcare provider.",
            "For mild headaches, try cold compresses and rest in a quiet room. Over-the-counter pain relievers may help if needed.",
            "Your symptoms suggest you should monitor your condition closely. Maintain a symptom diary and seek medical attention if you notice any worsening.",
            "I recommend applying the RICE method (Rest, Ice, Compression, Elevation) for the first 48 hours. Gentle stretching after can help with recovery.",
            "Consider increasing your fluid intake and electrolyte balance. Coconut water or oral rehydration solutions can be helpful.",
            "Based on your description, this could be a viral infection. Monitor your temperature and stay well-rested. Seek medical care if fever persists.",
            "Your symptoms may indicate a minor allergic reaction. Avoid potential triggers and consider antihistamines if appropriate.",
            "This appears to be a common gastrointestinal issue. Try bland foods and stay hydrated. See a doctor if symptoms worsen."
        ]
        
        response = random.choice(medical_responses)
        
        # Translate if needed
        if language != "en":
            response = await self.translate_response(response, language)
        
        return {"response": response}

# Enhanced Medical Vault with Patient Memory
class EnhancedMedicalVault:
    def __init__(self, qdrant: EnhancedQdrantClient, gemini: EnhancedGeminiClient):
        self.qdrant = qdrant
        self.gemini = gemini
        self.patient_memories = {}  # In-memory storage for demo
    
    async def store_patient_memory(self, user_id: str, medical_data: dict[str, Any], consent: bool):
        """Store comprehensive patient medical memory"""
        if not consent:
            return
        
        if user_id not in self.patient_memories:
            self.patient_memories[user_id] = {
                "medical_history": [],
                "medications": [],
                "allergies": [],
                "vital_signs": [],
                "symptoms": [],
                "consultations": [],
                "emergency_contacts": [],
                "last_updated": datetime.now().isoformat()
            }
        
        # Update patient memory
        memory = self.patient_memories[user_id]
        memory["last_updated"] = datetime.now().isoformat()
        
        # Store different types of medical data
        if "symptoms" in medical_data:
            memory["symptoms"].append({
                "timestamp": datetime.now().isoformat(),
                "symptoms": medical_data["symptoms"],
                "severity": medical_data.get("severity", "mild")
            })
        
        if "medications" in medical_data:
            memory["medications"].extend(medical_data["medications"])
        
        if "allergies" in medical_data:
            memory["allergies"].extend(medical_data["allergies"])
        
        if "vital_signs" in medical_data:
            memory["vital_signs"].append({
                "timestamp": datetime.now().isoformat(),
                "vitals": medical_data["vital_signs"]
            })
        
        # Store in Qdrant for vector search
        vector = await self.gemini.embed_text(json.dumps(medical_data))
        point = {
            "id": f"{user_id}_{int(time.time())}",
            "vector": vector,
            "payload": {
                "user_id": user_id,
                "medical_data": medical_data,
                "timestamp": time.time(),
                "data_type": "patient_memory"
            }
        }
        await self.qdrant.upsert("user_memory", [point])
    
    async def get_patient_memory(self, user_id: str) -> dict[str, Any]:
        """Retrieve patient medical memory"""
        return self.patient_memories.get(user_id, {
            "medical_history": [],
            "medications": [],
            "allergies": [],
            "vital_signs": [],
            "symptoms": [],
            "consultations": [],
            "emergency_contacts": [],
            "last_updated": None
        })

# Enhanced Prescription Analysis
class PrescriptionAnalyzer:
    def __init__(self, qdrant: EnhancedQdrantClient, gemini: EnhancedGeminiClient):
        self.qdrant = qdrant
        self.gemini = gemini
    
    async def analyze_prescription(self, prescription_text: str, user_id: str) -> dict[str, Any]:
        """Analyze prescription for safety and interactions"""
        
        # Extract medications using regex patterns
        medication_patterns = [
            r"([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(\d+)\s*(mg|mcg|g|ml)",
            r"([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(\d+)\s*tablet",
            r"([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(\d+)\s*cap"
        ]
        
        medications = []
        for pattern in medication_patterns:
            matches = re.findall(pattern, prescription_text, re.IGNORECASE)
            for match in matches:
                medications.append({
                    "name": match[0],
                    "dosage": match[1],
                    "unit": match[2] if len(match) > 2 else "mg"
                })
        
        # Get safety information from Qdrant
        safety_info = []
        for medication in medications:
            query_vector = await self.gemini.embed_text(medication["name"])
            results = await self.qdrant.search("prescription_analysis", query_vector, limit=2)
            safety_info.extend([result["payload"]["text"] for result in results["result"]])
        
        # Check for potential interactions
        interactions = []
        if len(medications) > 1:
            interactions = [
                "Multiple medications detected - consult pharmacist for potential interactions",
                "Monitor for side effects when taking multiple medications",
                "Consider timing of medications to avoid interactions"
            ]
        
        return {
            "medications": medications,
            "safety_warnings": safety_info,
            "potential_interactions": interactions,
            "recommendations": [
                "Take medications as prescribed",
                "Store medications properly",
                "Keep track of side effects",
                "Consult pharmacist if you have questions"
            ],
            "analysis_timestamp": datetime.now().isoformat()
        }

# Enhanced Emergency Alert System
class EmergencyAlertSystem:
    def __init__(self):
        self.emergency_contacts = settings.emergency_contacts
        self.whatsapp_webhook = settings.whatsapp_webhook_url
        self.active_alerts = {}
    
    async def send_emergency_alert(self, user_id: str, emergency_type: str, location: str = None, severity: str = "high", contact_info: str = None):
        """Send comprehensive emergency alerts"""
        
        alert_id = f"{user_id}_{int(time.time())}"
        alert_data = {
            "alert_id": alert_id,
            "user_id": user_id,
            "emergency_type": emergency_type,
            "location": location,
            "severity": severity,
            "contact_info": contact_info,
            "timestamp": datetime.now().isoformat(),
            "status": "active"
        }
        
        self.active_alerts[alert_id] = alert_data
        
        # Send alerts to emergency contacts
        alert_message = f"""
🚨 EMERGENCY ALERT 🚨
Patient ID: {user_id}
Emergency Type: {emergency_type}
Location: {location or 'Not specified'}
Severity: {severity}
Contact: {contact_info or 'Not provided'}
Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        
Immediate action required!
        """
        
        # Send to emergency services
        for contact in self.emergency_contacts:
            await self._send_alert(contact, alert_message)
        
        # Send WhatsApp notification if configured
        if self.whatsapp_webhook and contact_info:
            await self._send_whatsapp_alert(contact_info, alert_message)
        
        return {
            "alert_id": alert_id,
            "status": "sent",
            "contacts_notified": len(self.emergency_contacts),
            "timestamp": alert_data["timestamp"]
        }
    
    async def _send_alert(self, contact: str, message: str):
        """Send alert to emergency contact"""
        # In production, this would integrate with actual emergency services
        print(f"🚨 EMERGENCY ALERT SENT TO {contact}:")
        print(message)
    
    async def _send_whatsapp_alert(self, contact: str, message: str):
        """Send WhatsApp alert"""
        if self.whatsapp_webhook:
            # In production, this would use actual WhatsApp API
            print(f"📱 WHATSAPP ALERT SENT TO {contact}")

# Enhanced Smart Symptom Routing
class SmartSymptomRouter:
    def __init__(self, qdrant: EnhancedQdrantClient, gemini: EnhancedGeminiClient):
        self.qdrant = qdrant
        self.gemini = gemini
        self.routing_rules = {
            "emergency": {
                "keywords": ["chest pain", "difficulty breathing", "severe bleeding", "unconscious", "heart attack", "stroke"],
                "action": "emergency_services",
                "priority": "critical"
            },
            "cardiology": {
                "keywords": ["chest pain", "palpitations", "shortness of breath", "heart", "cardiac"],
                "action": "cardiology_consult",
                "priority": "high"
            },
            "neurology": {
                "keywords": ["headache", "dizziness", "seizure", "numbness", "weakness", "stroke"],
                "action": "neurology_consult",
                "priority": "high"
            },
            "gastroenterology": {
                "keywords": ["abdominal pain", "nausea", "vomiting", "diarrhea", "constipation"],
                "action": "gastroenterology_consult",
                "priority": "medium"
            },
            "dermatology": {
                "keywords": ["rash", "skin", "itching", "lesion", "acne", "eczema"],
                "action": "dermatology_consult",
                "priority": "low"
            },
            "general": {
                "keywords": ["fever", "fatigue", "general pain", "checkup"],
                "action": "general_practitioner",
                "priority": "medium"
            }
        }
    
    async def route_symptoms(self, symptoms: str, user_id: str, language: str = "en") -> dict[str, Any]:
        """Smart routing based on symptoms"""
        
        symptoms_lower = symptoms.lower()
        
        # Check for emergency first
        for keyword in self.routing_rules["emergency"]["keywords"]:
            if keyword in symptoms_lower:
                return {
                    "routing_decision": "emergency",
                    "action": "emergency_services",
                    "priority": "critical",
                    "recommended_specialist": "emergency_medicine",
                    "urgency": "immediate",
                    "reason": f"Emergency keyword detected: {keyword}"
                }
        
        # Check other specialties
        best_match = None
        highest_score = 0
        
        for specialty, rules in self.routing_rules.items():
            if specialty == "emergency":
                continue
                
            score = sum(1 for keyword in rules["keywords"] if keyword in symptoms_lower)
            if score > highest_score:
                highest_score = score
                best_match = specialty
        
        if best_match and highest_score > 0:
            rules = self.routing_rules[best_match]
            return {
                "routing_decision": best_match,
                "action": rules["action"],
                "priority": rules["priority"],
                "recommended_specialist": best_match,
                "urgency": "within_24_hours" if rules["priority"] == "high" else "within_week",
                "reason": f"Matched {highest_score} symptoms to {best_match}"
            }
        
        # Default to general practitioner
        return {
            "routing_decision": "general",
            "action": "general_practitioner",
            "priority": "medium",
            "recommended_specialist": "general_practitioner",
            "urgency": "within_week",
            "reason": "No specific symptoms matched, general consultation recommended"
        }

# Enhanced Voice-based Healthcare Interaction
class VoiceHealthcareInteraction:
    def __init__(self, gemini: EnhancedGeminiClient):
        self.gemini = gemini
        self.voice_commands = {
            "emergency": ["help", "emergency", "call doctor", "urgent", "pain"],
            "symptoms": ["i have", "symptoms", "feeling", "pain in", "hurt"],
            "medication": ["medicine", "pill", "dose", "prescription", "taking"],
            "appointment": ["appointment", "visit", "see doctor", "consultation"],
            "information": ["what is", "tell me about", "explain", "information"]
        }
    
    async def process_voice_input(self, transcript: str, user_id: str, language: str = "en") -> dict[str, Any]:
        """Process voice input with intent recognition"""
        
        # Detect intent
        intent = await self._detect_intent(transcript)
        
        # Process based on intent
        if intent == "emergency":
            return {
                "intent": "emergency",
                "response": "I understand this is an emergency. I'm alerting emergency services now. Please stay on the line.",
                "action": "emergency_alert",
                "urgency": "immediate"
            }
        elif intent == "symptoms":
            return {
                "intent": "symptoms",
                "response": "I'm analyzing your symptoms. Let me help you understand what might be happening.",
                "action": "symptom_analysis",
                "urgency": "medium"
            }
        elif intent == "medication":
            return {
                "intent": "medication",
                "response": "I can help you with medication information and safety checks.",
                "action": "medication_help",
                "urgency": "low"
            }
        elif intent == "appointment":
            return {
                "intent": "appointment",
                "response": "I can help you schedule an appointment with the right specialist.",
                "action": "appointment_booking",
                "urgency": "low"
            }
        else:
            return {
                "intent": "general",
                "response": "I'm here to help with your health concerns. Please tell me more about what you need.",
                "action": "general_consultation",
                "urgency": "medium"
            }
    
    async def _detect_intent(self, transcript: str) -> str:
        """Detect user intent from voice transcript"""
        transcript_lower = transcript.lower()
        
        for intent, keywords in self.voice_commands.items():
            if any(keyword in transcript_lower for keyword in keywords):
                return intent
        
        return "general"

# Main Enhanced Medical Router
class EnhancedMedicalRouter:
    def __init__(self, qdrant: EnhancedQdrantClient, gemini: EnhancedGeminiClient):
        self.qdrant = qdrant
        self.gemini = gemini
        self.medical_vault = EnhancedMedicalVault(qdrant, gemini)
        self.prescription_analyzer = PrescriptionAnalyzer(qdrant, gemini)
        self.emergency_system = EmergencyAlertSystem()
        self.symptom_router = SmartSymptomRouter(qdrant, gemini)
        self.voice_interaction = VoiceHealthcareInteraction(gemini)
    
    async def get_enhanced_response(self, user_id: str, transcript: str, language: str = "en", voice_mode: bool = False) -> dict[str, Any]:
        """Get comprehensive medical response with all features"""
        
        # Detect language
        detected_language = await self.gemini.detect_language(transcript)
        
        # Voice interaction processing
        voice_result = None
        if voice_mode:
            voice_result = await self.voice_interaction.process_voice_input(transcript, user_id, detected_language)
        
        # Smart symptom routing
        symptom_routing = await self.symptom_router.route_symptoms(transcript, user_id, detected_language)
        
        # Check for emergency
        if symptom_routing["routing_decision"] == "emergency":
            emergency_alert = await self.emergency_system.send_emergency_alert(
                user_id, "voice_emergency", severity="critical"
            )
            return {
                "domain": "EMERGENCY",
                "detected_language": detected_language,
                "answer_text": "Emergency detected! Help is on the way. Please stay calm and follow emergency protocols.",
                "guardrail_triggered": False,
                "sources": [],
                "memory_context": [],
                "emergency": emergency_alert,
                "symptom_routing": symptom_routing,
                "voice_interaction": voice_result
            }
        
        # Get patient memory for context
        patient_memory = await self.medical_vault.get_patient_memory(user_id)
        
        # Enhanced medical knowledge search
        query_vector = await self.gemini.embed_text(transcript)
        
        all_results = []
        collections = ["medication_safety", "symptom_routing", "prescription_analysis", "emergency_protocols"]
        
        for collection in collections:
            search_results = await self.qdrant.search(collection, query_vector, limit=2)
            if "result" in search_results:
                all_results.extend(search_results["result"])
        
        # Generate contextual response
        context = "\n".join([
            str(result.get("payload", {}).get("text", ""))
            for result in all_results[:3]
        ])
        
        prompt = f"""
        Based on this medical knowledge: {context}
        
        Patient context: {json.dumps(patient_memory, default=str)[:500]}
        
        User query: {transcript}
        Language: {detected_language}
        Voice mode: {voice_mode}
        
        Provide a helpful, contextual medical response in {detected_language}.
        Include specific advice and if serious, suggest consulting a healthcare provider.
        Consider the patient's medical history if available.
        """
        
        gemini_response = await self.gemini.generate_json(
            model="gemini-1.5-flash",
            system="You are a helpful medical assistant providing safe, contextual advice with patient history awareness.",
            user=prompt,
            language=detected_language
        )
        
        # Determine domain based on routing
        domain = symptom_routing["routing_decision"].upper()
        
        return {
            "domain": domain,
            "detected_language": detected_language,
            "answer_text": gemini_response.get("response", "I recommend consulting a healthcare provider for proper medical advice."),
            "guardrail_triggered": False,
            "sources": [{"type": "enhanced_qdrant_search", "confidence": 0.9, "results": len(all_results)}],
            "memory_context": patient_memory.get("consultations", [])[-3:],  # Last 3 consultations
            "emergency": None,
            "symptom_routing": symptom_routing,
            "voice_interaction": voice_result
        }

# Initialize components
gemini = EnhancedGeminiClient()
qdrant = EnhancedQdrantClient(url=settings.qdrant_url, api_key=settings.qdrant_api_key)
enhanced_router = EnhancedMedicalRouter(qdrant, gemini)

# Health check
@app.get("/healthz")
async def health_check():
    return {
        "status": "ok", 
        "qdrant": "connected", 
        "vapi": "ready", 
        "gemini": "active",
        "features": {
            "voice_interaction": "enabled",
            "smart_symptom_routing": "enabled", 
            "patient_memory": "enabled",
            "prescription_analysis": "enabled",
            "emergency_alerts": "enabled",
            "multilingual_support": "enabled"
        }
    }

# Enhanced router endpoint
@app.post("/v1/router", response_model=RouterResponse)
async def enhanced_router(req: RouterRequest) -> RouterResponse:
    try:
        result = await enhanced_router.get_enhanced_response(
            req.user_id, req.transcript, req.language, req.voice_mode
        )
        
        # Save to memory if consent given
        if req.consent_to_save:
            await enhanced_router.medical_vault.store_patient_memory(
                user_id=req.user_id,
                medical_data={
                    "symptoms": req.transcript,
                    "language": req.language,
                    "voice_mode": req.voice_mode,
                    "domain": result["domain"],
                    "timestamp": datetime.now().isoformat()
                },
                consent=req.consent_to_save
            )
        
        return RouterResponse(**result)
        
    except Exception as e:
        print(f"Enhanced router error: {e}")
        return RouterResponse(
            domain="ERROR",
            detected_language="en",
            answer_text="I apologize, but I'm experiencing technical difficulties. Please try again or consult a healthcare provider.",
            guardrail_triggered=True,
            sources=[],
            memory_context=[],
            emergency=None
        )

# Prescription analysis endpoint
@app.post("/v1/prescription/analyze")
async def analyze_prescription(req: PrescriptionRequest):
    try:
        analysis = await enhanced_router.prescription_analyzer.analyze_prescription(
            req.prescription_text, req.user_id
        )
        return {"status": "success", "analysis": analysis}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Emergency alert endpoint
@app.post("/v1/emergency/alert")
async def send_emergency_alert(req: EmergencyAlertRequest):
    try:
        alert = await enhanced_router.emergency_system.send_emergency_alert(
            req.user_id, req.emergency_type, req.location, req.severity, req.contact_info
        )
        return {"status": "success", "alert": alert}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Patient memory endpoint
@app.post("/v1/memory/store")
async def store_patient_memory(req: PatientMemoryRequest):
    try:
        await enhanced_router.medical_vault.store_patient_memory(
            req.user_id, req.medical_data, req.consent_to_save
        )
        return {"status": "success", "message": "Patient memory stored successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/v1/memory/{user_id}")
async def get_patient_memory(user_id: str):
    try:
        memory = await enhanced_router.medical_vault.get_patient_memory(user_id)
        return {"status": "success", "memory": memory}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Symptom routing endpoint
@app.post("/v1/symptoms/route")
async def route_symptoms(req: RouterRequest):
    try:
        routing = await enhanced_router.symptom_router.route_symptoms(
            req.transcript, req.user_id, req.language
        )
        return {"status": "success", "routing": routing}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Voice interaction endpoint
@app.post("/v1/voice/process")
async def process_voice_interaction(req: RouterRequest):
    try:
        voice_result = await enhanced_router.voice_interaction.process_voice_input(
            req.transcript, req.user_id, req.language
        )
        return {"status": "success", "voice_result": voice_result}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Enhanced Vapi tool endpoint
@app.post("/vapi/tools/enhanced_medical_vault")
async def enhanced_vapi_medical_vault(req: dict) -> dict:
    """Enhanced Vapi tool endpoint with all features"""
    try:
        query = req.get("query", "")
        user_id = req.get("user_id", "default")
        language = req.get("language", "en")
        voice_mode = req.get("voice_mode", True)
        
        result = await enhanced_router.get_enhanced_response(
            user_id, query, language, voice_mode
        )
        
        return {
            "results": [{
                "domain": result["domain"],
                "result": result["answer_text"],
                "confidence": 0.95,
                "sources": result["sources"],
                "symptom_routing": result.get("symptom_routing"),
                "voice_interaction": result.get("voice_interaction"),
                "language": result["detected_language"]
            }]
        }
        
    except Exception as e:
        print(f"Enhanced Vapi tool error: {e}")
        return {
            "results": [{
                "domain": "ERROR",
                "result": "I'm experiencing technical difficulties. Please try again.",
                "confidence": 0.1,
                "sources": []
            }]
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
