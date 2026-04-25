"""
Intelligent Medical Router that uses Qdrant database effectively
for unique, contextual responses instead of generic ones
"""

import asyncio
from typing import Any, List, Dict
import random
import re

class IntelligentMedicalRouter:
    """Smart medical router that provides unique, contextual responses"""
    
    def __init__(self, qdrant_client, gemini_client):
        self.qdrant = qdrant_client
        self.gemini = gemini_client
        self.user_conversations = {}  # Track conversation context
        
    async def get_intelligent_response(self, user_id: str, transcript: str, detected_language: str = "en") -> Dict[str, Any]:
        """Get unique medical response using Qdrant database and context"""
        
        # Get conversation context
        context = self.user_conversations.get(user_id, [])
        
        # Classify domain with more intelligence
        domain = self._classify_domain_intelligent(transcript)
        
        # Get relevant medical data from Qdrant
        relevant_data = await self._get_relevant_medical_data(transcript, domain)
        
        # Generate unique response using Qdrant data + context
        response = await self._generate_unique_response(
            transcript, domain, relevant_data, context, detected_language
        )
        
        # Update conversation context
        self._update_context(user_id, transcript, response)
        
        # Check for emergency
        emergency = self._check_emergency_intelligent(transcript, domain)
        
        return {
            "domain": domain,
            "detected_language": detected_language,
            "answer_text": response,
            "guardrail_triggered": False,
            "sources": relevant_data[:3],  # Show sources for transparency
            "memory_context": context[-3:],  # Show recent context
            "emergency": emergency,
            "personalized": True
        }
    
    def _classify_domain_intelligent(self, transcript: str) -> str:
        """More intelligent domain classification"""
        text_lower = transcript.lower()
        
        # Emergency patterns
        emergency_patterns = [
            r"chest pain|heart attack|severe chest|can't breathe|difficulty breathing",
            r"unconscious|fainting|passed out|collapsed",
            r"severe bleeding|heavy bleeding|can't stop bleeding",
            r"emergency|urgent|immediate help|save me"
        ]
        
        for pattern in emergency_patterns:
            if re.search(pattern, text_lower):
                return "EMERGENCY"
        
        # AYUSH patterns (more specific)
        ayush_keywords = [
            "ayurveda", "herbal medicine", "tulsi", "turmeric", "ashwagandha",
            "yoga therapy", "homeopathy", "unani medicine", "siddha",
            "natural remedy", "traditional medicine"
        ]
        
        if any(keyword in text_lower for keyword in ayush_keywords):
            return "AYURVEDA"
        
        # Nutrition patterns
        nutrition_keywords = [
            "diet plan", "nutrition advice", "what to eat", "food for",
            "healthy diet", "vitamin deficiency", "protein", "iron deficiency",
            "weight gain", "weight loss", "balanced diet"
        ]
        
        if any(keyword in text_lower for keyword in nutrition_keywords):
            return "NUTRITION"
        
        # Default to allopathy
        return "ALLOPATHY"
    
    async def _get_relevant_medical_data(self, transcript: str, domain: str) -> List[Dict]:
        """Get relevant medical data from Qdrant database"""
        try:
            # Map domain to collection
            collection_map = {
                "ALLOPATHY": "medication_safety",
                "AYURVEDA": "ayush_guidelines", 
                "NUTRITION": "nutrition",
                "EMERGENCY": "medication_safety"  # Use medication_safety for emergencies
            }
            
            collection = collection_map.get(domain, "medication_safety")
            
            # Search Qdrant with the transcript
            search_results = await self.qdrant.search(
                collection_name=collection,
                query_vector=await self.gemini.embed_text(transcript),
                limit=5
            )
            
            # Convert to usable format
            relevant_data = []
            for result in search_results:
                relevant_data.append({
                    "score": result.score,
                    "content": result.payload.get("text", ""),
                    "source": collection,
                    "relevant": result.score > 0.7  # Only include highly relevant results
                })
            
            return relevant_data
            
        except Exception as e:
            print(f"Error getting Qdrant data: {e}")
            return []
    
    async def _generate_unique_response(self, transcript: str, domain: str, 
                                      relevant_data: List[Dict], context: List[Dict],
                                      detected_language: str) -> str:
        """Generate unique, contextual response using Qdrant data"""
        
        # Extract key information from relevant data
        medical_info = ""
        sources_used = []
        
        for data in relevant_data:
            if data.get("relevant", False):
                medical_info += f"\n• {data['content'][:200]}..."
                sources_used.append(data['source'])
        
        # Build context-aware prompt
        context_text = ""
        if context:
            context_text = f"\nRecent conversation: {context[-1].get('user_query', '')} -> {context[-1].get('bot_response', '')[:100]}"
        
        # Generate intelligent response
        if domain == "EMERGENCY":
            return self._generate_emergency_response(transcript, relevant_data)
        
        elif domain == "AYURVEDA":
            return self._generate_ayurvedic_response(transcript, relevant_data, context_text)
        
        elif domain == "NUTRITION":
            return self._generate_nutrition_response(transcript, relevant_data, context_text)
        
        else:  # ALLOPATHY
            return self._generate_allopathic_response(transcript, relevant_data, context_text)
    
    def _generate_emergency_response(self, transcript: str, relevant_data: List[Dict]) -> str:
        """Generate emergency response with specific actions"""
        emergency_actions = [
            "Please call 108 immediately for emergency medical services.",
            "Go to the nearest Primary Health Center (PHC) right away.",
            "Ask someone to drive you to the nearest hospital.",
            "If alone, call emergency services and stay on the line."
        ]
        
        symptom_specific = {
            "chest pain": "This could be a heart attack. Chew aspirin 325mg if available and call 108 immediately.",
            "breathing": "Sit upright, use inhaler if prescribed, call 108 immediately.",
            "bleeding": "Apply direct pressure with clean cloth, elevate the wound, call 108."
        }
        
        response = "🚨 MEDICAL EMERGENCY DETECTED 🚨\n\n"
        response += random.choice(emergency_actions) + "\n\n"
        
        # Add symptom-specific advice
        text_lower = transcript.lower()
        for symptom, advice in symptom_specific.items():
            if symptom in text_lower:
                response += advice + "\n\n"
        
        response += "I'm locating the nearest emergency facility for you now."
        
        return response
    
    def _generate_ayurvedic_response(self, transcript: str, relevant_data: List[Dict], context: str) -> str:
        """Generate Ayurvedic response using Qdrant data"""
        
        # Extract relevant Ayurvedic information
        ayurvedic_tips = []
        for data in relevant_data:
            if data.get("source") == "ayush_guidelines" and data.get("relevant"):
                ayurvedic_tips.append(data["content"])
        
        # Build response
        response = "🌿 AYURVEDIC GUIDANCE 🌿\n\n"
        
        if ayurvedic_tips:
            response += "Based on traditional Ayurvedic knowledge:\n"
            for tip in ayurvedic_tips[:3]:
                response += f"• {tip}\n"
        else:
            # Fallback Ayurvedic advice
            symptom_advice = {
                "headache": "Apply sandalwood paste on forehead, drink tulsi-ginger tea",
                "fever": "Drink coriander seed water, take tulsi leaves with honey",
                "cough": "Drink warm water with honey and ginger, take steam inhalation",
                "stomach": "Eat light khichdi, drink jeera water, avoid heavy foods"
            }
            
            text_lower = transcript.lower()
            response += "Traditional Ayurvedic remedies:\n"
            for symptom, remedy in symptom_advice.items():
                if symptom in text_lower:
                    response += f"• {remedy}\n"
                    break
            else:
                response += "• Consult a qualified Ayurvedic practitioner for personalized treatment\n"
                response += "• Consider your body type (Prakriti) for best results"
        
        response += f"\n💡 For personalized Ayurvedic treatment, consult a qualified practitioner."
        
        return response
    
    def _generate_nutrition_response(self, transcript: str, relevant_data: List[Dict], context: str) -> str:
        """Generate nutrition response using Qdrant data"""
        
        # Extract relevant nutrition information
        nutrition_info = []
        for data in relevant_data:
            if data.get("source") == "nutrition" and data.get("relevant"):
                nutrition_info.append(data["content"])
        
        response = "🥗 NUTRITION GUIDANCE 🥗\n\n"
        
        if nutrition_info:
            response += "Based on nutritional science:\n"
            for info in nutrition_info[:3]:
                response += f"• {info}\n"
        else:
            # Intelligent nutrition advice based on query
            text_lower = transcript.lower()
            
            if "child" in text_lower or "kid" in text_lower:
                response += "For children's nutrition:\n"
                response += "• Include protein-rich foods: dal, paneer, eggs, nuts\n"
                response += "• Daily fruits and vegetables for vitamins\n"
                response += "• Adequate milk and dairy for calcium\n"
                response += "• Limit junk food and sugary drinks\n"
            
            elif "weak" in text_lower or "tired" in text_lower or "fatigue" in text_lower:
                response += "For weakness and fatigue:\n"
                response += "• Iron-rich foods: spinach, lentils, jaggery, dates\n"
                response += "• Vitamin C for iron absorption: lemon, amla, oranges\n"
                response += "• Complex carbs: brown rice, whole wheat, oats\n"
                response += "• Stay hydrated with water and coconut water\n"
            
            else:
                response += "General nutrition advice:\n"
                response += "• Balanced meals with proteins, carbs, healthy fats\n"
                response += "• Include seasonal fruits and vegetables daily\n"
                response += "• Drink 8-10 glasses of water daily\n"
                response += "• Limit processed foods and added sugars\n"
        
        response += f"\n📞 For personalized nutrition plans, consult a registered dietitian."
        
        return response
    
    def _generate_allopathic_response(self, transcript: str, relevant_data: List[Dict], context: str) -> str:
        """Generate allopathic response using Qdrant data"""
        
        # Extract relevant medical information
        medical_info = []
        for data in relevant_data:
            if data.get("source") == "medication_safety" and data.get("relevant"):
                medical_info.append(data["content"])
        
        response = "💊 MEDICAL GUIDANCE 💊\n\n"
        
        if medical_info:
            response += "Based on medical knowledge:\n"
            for info in medical_info[:3]:
                response += f"• {info}\n"
        else:
            # Symptom-specific medical advice
            text_lower = transcript.lower()
            
            symptom_responses = {
                "headache": "• Rest in quiet, dark room\n• Apply cold compress to forehead\n• Take paracetamol 500mg if needed\n• Stay hydrated, avoid screens\n• Consult doctor if severe or persistent",
                
                "fever": "• Stay hydrated with water and ORS\n• Take paracetamol 500mg every 6 hours\n• Wear light clothing, keep room cool\n• Monitor temperature every 4 hours\n• Seek help if temperature > 102°F",
                
                "cough": "• Drink warm water with honey\n• Take steam inhalation 2-3 times daily\n• Avoid cold drinks and ice cream\n• Use saline nasal drops for congestion\n• Consult doctor if cough > 1 week",
                
                "stomach pain": "• Eat light, bland foods (rice, banana, toast)\n• Drink ORS solution if vomiting/diarrhea\n• Avoid spicy, oily, heavy foods\n• Take antacids if acidity\n• Consult doctor if pain severe or persistent"
            }
            
            for symptom, advice in symptom_responses.items():
                if symptom in text_lower:
                    response += f"For {symptom}:\n{advice}\n"
                    break
            else:
                response += "• Please describe your specific symptoms\n• I can provide targeted medical advice\n• For general health: maintain balanced diet, exercise, sleep\n• Consult local healthcare provider for persistent issues"
        
        # Add context-aware follow-up
        if context:
            response += f"\n\n📋 Following up on your previous concern..."
        
        response += f"\n\n⚠️ This is general medical advice. Please consult a doctor for proper diagnosis and treatment."
        
        return response
    
    def _update_context(self, user_id: str, transcript: str, response: str):
        """Update conversation context"""
        if user_id not in self.user_conversations:
            self.user_conversations[user_id] = []
        
        self.user_conversations[user_id].append({
            "user_query": transcript,
            "bot_response": response,
            "timestamp": str(asyncio.get_event_loop().time())
        })
        
        # Keep only last 10 conversations
        if len(self.user_conversations[user_id]) > 10:
            self.user_conversations[user_id] = self.user_conversations[user_id][-10:]
    
    def _check_emergency_intelligent(self, transcript: str, domain: str) -> Dict[str, Any]:
        """Intelligent emergency detection"""
        if domain != "EMERGENCY":
            return None
        
        # Determine emergency severity
        text_lower = transcript.lower()
        
        high_risk = ["heart attack", "can't breathe", "unconscious", "severe bleeding"]
        medium_risk = ["chest pain", "difficulty breathing", "fainting", "heavy bleeding"]
        
        severity = "high"
        for risk in high_risk:
            if risk in text_lower:
                severity = "high"
                break
        else:
            for risk in medium_risk:
                if risk in text_lower:
                    severity = "medium"
                    break
            else:
                severity = "low"
        
        return {
            "action": "PHC_LOCATOR",
            "status": "triggered",
            "severity": severity,
            "recommendation": "call_108" if severity == "high" else "visit_phc"
        }
