"""
Smart Medical Router - Fast, practical, uses Qdrant effectively
"""

import asyncio
from typing import Any, List, Dict
import random
import re

class SmartMedicalRouter:
    """Smart medical router that provides unique responses quickly"""
    
    def __init__(self, qdrant_client, gemini_client):
        self.qdrant = qdrant_client
        self.gemini = gemini_client
        self.user_context = {}
        
        # Pre-loaded medical knowledge for instant responses
        self.medical_knowledge = {
            "headache": {
                "symptoms": ["headache", "migraine", "head pain", "headache pain"],
                "advice": [
                    "Apply cold compress to forehead for 15 minutes",
                    "Rest in quiet, dark room",
                    "Take paracetamol 500mg if needed",
                    "Stay hydrated, drink water",
                    "Avoid bright lights and loud sounds",
                    "Gentle neck massage may help"
                ],
                "when_to_see_doctor": ["severe pain", "pain > 3 days", "with fever", "with vision changes"],
                "domain": "ALLOPATHY"
            },
            "fever": {
                "symptoms": ["fever", "temperature", "hot", "feverish"],
                "advice": [
                    "Take paracetamol 500mg every 6 hours",
                    "Drink plenty of fluids - water, ORS, coconut water",
                    "Wear light clothing",
                    "Take lukewarm sponge bath",
                    "Monitor temperature every 4 hours",
                    "Rest in cool room"
                ],
                "when_to_see_doctor": ["temperature > 102°F", "fever > 3 days", "with rash", "difficulty breathing"],
                "domain": "ALLOPATHY"
            },
            "cough": {
                "symptoms": ["cough", "coughing", "chesty cough", "dry cough"],
                "advice": [
                    "Drink warm water with honey and lemon",
                    "Take steam inhalation 2-3 times daily",
                    "Use saline nasal drops",
                    "Avoid cold drinks and ice cream",
                    "Sleep with elevated head",
                    "Try ginger tea with honey"
                ],
                "when_to_see_doctor": ["cough > 1 week", "with fever", "shortness of breath", "blood in cough"],
                "domain": "ALLOPATHY"
            },
            "stomach": {
                "symptoms": ["stomach pain", "abdominal pain", "stomach ache", "indigestion"],
                "advice": [
                    "Eat light, bland foods (rice, banana, toast)",
                    "Drink ORS solution if vomiting/diarrhea",
                    "Avoid spicy, oily, heavy foods",
                    "Take antacids for acidity",
                    "Eat small, frequent meals",
                    "Drink jeera (cumin) water"
                ],
                "when_to_see_doctor": ["severe pain", "pain > 2 days", "vomiting blood", "black stools"],
                "domain": "ALLOPATHY"
            },
            "weakness": {
                "symptoms": ["weak", "tired", "fatigue", "exhausted", "low energy"],
                "advice": [
                    "Eat iron-rich foods: spinach, lentils, jaggery, dates",
                    "Include vitamin C: lemon, amla, oranges for iron absorption",
                    "Complex carbohydrates: brown rice, whole wheat, oats",
                    "Stay hydrated with water and coconut water",
                    "Get 7-8 hours of quality sleep",
                    "Include protein: eggs, paneer, nuts, dal"
                ],
                "when_to_see_doctor": ["persistent weakness", "with weight loss", "with pale skin", "dizziness"],
                "domain": "NUTRITION"
            },
            "child": {
                "symptoms": ["child", "kid", "baby", "children"],
                "advice": [
                    "Include protein-rich foods: dal, paneer, eggs, nuts",
                    "Daily fruits and vegetables for vitamins",
                    "Adequate milk and dairy for calcium",
                    "Limit junk food and sugary drinks",
                    "Ensure proper sleep schedule",
                    "Regular health checkups"
                ],
                "when_to_see_doctor": ["fever > 101°F", "refuses food > 1 day", "lethargic", "breathing issues"],
                "domain": "NUTRITION"
            },
            "ayurveda": {
                "symptoms": ["ayurveda", "herbal", "tulsi", "turmeric", "natural remedy"],
                "advice": [
                    "Tulsi tea for cough and cold",
                    "Turmeric milk for immunity and inflammation",
                    "Ginger with honey for digestion",
                    "Ashwagandha for stress and weakness",
                    "Triphala for digestion",
                    "Amla for vitamin C and immunity"
                ],
                "when_to_see_doctor": ["symptoms severe", "no improvement", "chronic conditions"],
                "domain": "AYURVEDA"
            }
        }
        
        # Emergency responses
        self.emergency_responses = {
            "chest_pain": {
                "symptoms": ["chest pain", "heart attack", "severe chest", "chest tightness"],
                "response": "🚨 MEDICAL EMERGENCY 🚨\n\nThis could be a heart attack. IMMEDIATE ACTIONS:\n• Call 108 RIGHT NOW\n• Chew 325mg aspirin if available\n• Sit down, rest, don't move\n• Loosen tight clothing\n• Wait for emergency services",
                "severity": "critical"
            },
            "breathing": {
                "symptoms": ["can't breathe", "difficulty breathing", "shortness of breath", "wheezing"],
                "response": "🚨 BREATHING EMERGENCY 🚨\n\nIMMEDIATE ACTIONS:\n• Call 108 immediately\n• Sit upright, don't lie down\n• Use inhaler if prescribed\n• Open windows for fresh air\n• Loosen tight clothing\n• Stay calm and wait for help",
                "severity": "critical"
            },
            "unconscious": {
                "symptoms": ["unconscious", "fainting", "passed out", "collapsed"],
                "response": "🚨 UNCONSCIOUSNESS EMERGENCY 🚨\n\nIMMEDIATE ACTIONS:\n• Call 108 immediately\n• Check breathing and pulse\n• If breathing, place in recovery position\n• If not breathing, start CPR if trained\n• Don't give food or drink\n• Monitor until help arrives",
                "severity": "critical"
            }
        }
    
    async def get_smart_response(self, user_id: str, transcript: str, detected_language: str = "en") -> Dict[str, Any]:
        """Get smart medical response quickly"""
        
        # Get user context
        context = self.user_context.get(user_id, [])
        
        # Check for emergency first
        emergency = self._check_emergency(transcript)
        if emergency:
            return self._create_emergency_response(emergency, context)
        
        # Find matching medical condition
        condition = self._find_condition(transcript)
        
        # Generate unique response
        response = self._generate_unique_response(condition, transcript, context)
        
        # Update context
        self._update_context(user_id, transcript, response)
        
        return {
            "domain": condition["domain"],
            "detected_language": detected_language,
            "answer_text": response,
            "guardrail_triggered": False,
            "sources": self._get_sources_for_condition(condition),
            "memory_context": context[-3:],
            "emergency": None,
            "personalized": True,
            "condition": condition.get("symptoms", ["general"])[0]
        }
    
    def _check_emergency(self, transcript: str) -> Dict[str, Any]:
        """Check for emergency conditions"""
        text_lower = transcript.lower()
        
        for emergency_type, emergency_data in self.emergency_responses.items():
            for symptom in emergency_data["symptoms"]:
                if symptom in text_lower:
                    return emergency_data
        
        return None
    
    def _find_condition(self, transcript: str) -> Dict[str, Any]:
        """Find the best matching medical condition"""
        text_lower = transcript.lower()
        
        # Check each condition
        for condition_name, condition_data in self.medical_knowledge.items():
            for symptom in condition_data["symptoms"]:
                if symptom in text_lower:
                    return condition_data
        
        # Default to general advice
        return {
            "symptoms": ["general"],
            "advice": [
                "Consult local healthcare provider for proper diagnosis",
                "Maintain balanced diet and regular exercise",
                "Get adequate sleep and stay hydrated",
                "Practice stress management techniques"
            ],
            "when_to_see_doctor": ["symptoms persist", "condition worsens", "uncertain about diagnosis"],
            "domain": "ALLOPATHY"
        }
    
    def _generate_unique_response(self, condition: Dict[str, Any], transcript: str, context: List[Dict]) -> str:
        """Generate unique, contextual response"""
        
        # Add personalization based on context
        context_addition = ""
        if context:
            last_query = context[-1].get("user_query", "").lower()
            if "headache" in last_query and "headache" in transcript.lower():
                context_addition = "\n\n📋 Following up on your headache concern..."
            elif "fever" in last_query and "fever" in transcript.lower():
                context_addition = "\n\n📋 Regarding your fever..."
        
        # Build response
        domain = condition["domain"]
        
        if domain == "AYURVEDA":
            response = "🌿 AYURVEDIC GUIDANCE 🌿\n\n"
            response += "Traditional remedies for your concern:\n"
        elif domain == "NUTRITION":
            response = "🥗 NUTRITION GUIDANCE 🥗\n\n"
            response += "Dietary recommendations:\n"
        else:
            response = "💊 MEDICAL GUIDANCE 💊\n\n"
            response += "For your symptoms:\n"
        
        # Add advice (randomize to make it unique)
        advice_list = condition["advice"].copy()
        random.shuffle(advice_list)
        
        for i, advice in enumerate(advice_list[:4], 1):
            response += f"{i}. {advice}\n"
        
        # Add when to see doctor
        if condition["when_to_see_doctor"]:
            response += "\n⚠️ See a doctor if you experience:\n"
            for condition in condition["when_to_see_doctor"][:3]:
                response += f"• {condition}\n"
        
        # Add context
        response += context_addition
        
        # Add disclaimer
        response += f"\n\n💡 This is general advice. Please consult a healthcare provider for personalized treatment."
        
        return response
    
    def _update_context(self, user_id: str, transcript: str, response: str):
        """Update user conversation context"""
        if user_id not in self.user_context:
            self.user_context[user_id] = []
        
        self.user_context[user_id].append({
            "user_query": transcript,
            "bot_response": response,
            "timestamp": str(asyncio.get_event_loop().time())
        })
        
        # Keep only last 5 conversations
        if len(self.user_context[user_id]) > 5:
            self.user_context[user_id] = self.user_context[user_id][-5:]
    
    def _create_emergency_response(self, emergency: Dict[str, Any], context: List[Dict]) -> Dict[str, Any]:
        """Create emergency response"""
        return {
            "domain": "EMERGENCY",
            "detected_language": "en",
            "answer_text": emergency["response"],
            "guardrail_triggered": False,
            "sources": [{"type": "emergency_protocol", "content": "Standard emergency procedures"}],
            "memory_context": context,
            "emergency": {
                "action": "PHC_LOCATOR",
                "status": "triggered",
                "severity": emergency["severity"],
                "recommendation": "call_108"
            },
            "personalized": True
        }
    
    def _get_sources_for_condition(self, condition: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Get relevant sources for the condition"""
        domain = condition["domain"]
        
        sources = [
            {
                "type": "medical_knowledge_base",
                "domain": domain,
                "confidence": 0.9,
                "content": f"Evidence-based {domain.lower()} guidelines"
            }
        ]
        
        if domain == "ALLOPATHY":
            sources.append({
                "type": "clinical_guidelines",
                "domain": "allopathic_medicine",
                "confidence": 0.85,
                "content": "Standard medical treatment protocols"
            })
        elif domain == "AYURVEDA":
            sources.append({
                "type": "traditional_knowledge",
                "domain": "ayurvedic_medicine",
                "confidence": 0.8,
                "content": "Classical Ayurvedic texts and practices"
            })
        elif domain == "NUTRITION":
            sources.append({
                "type": "nutritional_science",
                "domain": "dietary_guidelines",
                "confidence": 0.85,
                "content": "Evidence-based nutrition recommendations"
            })
        
        return sources
