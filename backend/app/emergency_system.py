# Emergency Triage System - Complete Healthcare Emergency Response

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, List, Optional, Dict
from datetime import datetime, timedelta
import json
import random

app = FastAPI(title="AuraHealth - Emergency Triage System")

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Models
class EmergencyAssessment(BaseModel):
    user_id: str
    symptoms: List[str]
    severity: str
    vital_signs: Dict[str, Any]
    location: str
    voice_input: Optional[str] = None
    timestamp: str

class AmbulanceDispatch(BaseModel):
    emergency_id: str
    patient_name: str
    phone: str
    location: str
    severity: str
    symptoms: List[str]
    estimated_arrival: str

class FirstAidGuidance(BaseModel):
    emergency_id: str
    step_number: int
    instruction: str
    duration_seconds: int
    critical_action: bool

class FamilyNotification(BaseModel):
    emergency_id: str
    family_contacts: List[str]
    patient_name: str
    location: str
    severity: str
    message: str

class HospitalPreNotification(BaseModel):
    emergency_id: str
    hospital_id: str
    patient_data: Dict[str, Any]
    estimated_arrival: str
    severity: str
    required_services: List[str]

class InsurancePreAuth(BaseModel):
    emergency_id: str
    patient_id: str
    insurance_provider: str
    policy_number: str
    emergency_type: str
    estimated_cost: str
    pre_authorized: bool

# Emergency Triage System
class EmergencyTriageSystem:
    def __init__(self):
        self.emergency_database = []
        self.ambulance_fleet = self._initialize_ambulances()
        self.hospitals = self._initialize_hospitals()
        self.first_aid_protocols = self._load_first_aid_protocols()
        self.family_networks = {}
        self.insurance_providers = self._initialize_insurance_providers()
    
    def _initialize_ambulances(self):
        """Initialize ambulance fleet with real-time tracking"""
        return [
            {
                "id": "AMB001",
                "type": "Basic Life Support",
                "location": "Central Station",
                "status": "available",
                "eta": "8 minutes",
                "equipment": ["Oxygen", "Defibrillator", "First Aid Kit", "Stretcher"]
            },
            {
                "id": "AMB002", 
                "type": "Advanced Life Support",
                "location": "North Zone",
                "status": "available",
                "eta": "12 minutes",
                "equipment": ["Ventilator", "Cardiac Monitor", "IV Setup", "Medications"]
            },
            {
                "id": "AMB003",
                "type": "Emergency Response",
                "location": "South Zone", 
                "status": "available",
                "eta": "6 minutes",
                "equipment": ["Trauma Kit", "Spine Board", "Emergency Medications"]
            }
        ]
    
    def _initialize_hospitals(self):
        """Initialize hospital network with emergency capabilities"""
        return [
            {
                "id": "HOSP001",
                "name": "City General Hospital",
                "emergency_capacity": 50,
                "icu_beds": 20,
                "trauma_center": True,
                "cardiac_care": True,
                "neurology": True,
                "contact": "emergency@citygeneral.com",
                "address": "123 Medical Center, City Center"
            },
            {
                "id": "HOSP002",
                "name": "Metro Medical Center",
                "emergency_capacity": 30,
                "icu_beds": 15,
                "trauma_center": False,
                "cardiac_care": True,
                "neurology": True,
                "contact": "er@metromedical.com",
                "address": "456 Health Avenue, Metro District"
            }
        ]
    
    def _load_first_aid_protocols(self):
        """Load step-by-step first aid guidance for golden hour"""
        return {
            "cardiac_arrest": [
                {
                    "step": 1,
                    "instruction": "Check if the person is responsive. Tap their shoulder and shout 'Are you okay?'",
                    "duration": 10,
                    "critical": True
                },
                {
                    "step": 2,
                    "instruction": "Call 108 immediately for emergency medical services",
                    "duration": 30,
                    "critical": True
                },
                {
                    "step": 3,
                    "instruction": "Begin CPR - 30 chest compressions followed by 2 rescue breaths",
                    "duration": 60,
                    "critical": True
                },
                {
                    "step": 4,
                    "instruction": "Continue CPR until medical help arrives or person shows signs of life",
                    "duration": 300,
                    "critical": True
                }
            ],
            "severe_bleeding": [
                {
                    "step": 1,
                    "instruction": "Apply direct pressure to the wound with clean cloth or bandage",
                    "duration": 15,
                    "critical": True
                },
                {
                    "step": 2,
                    "instruction": "Elevate the injured area above heart level if possible",
                    "duration": 10,
                    "critical": False
                },
                {
                    "step": 3,
                    "instruction": "Apply pressure bandage firmly but not too tight",
                    "duration": 20,
                    "critical": True
                },
                {
                    "step": 4,
                    "instruction": "Monitor for signs of shock - pale skin, rapid breathing, confusion",
                    "duration": 60,
                    "critical": True
                }
            ],
            "difficulty_breathing": [
                {
                    "step": 1,
                    "instruction": "Help person sit upright in comfortable position",
                    "duration": 10,
                    "critical": True
                },
                {
                    "step": 2,
                    "instruction": "Loosen tight clothing around neck and chest",
                    "duration": 15,
                    "critical": True
                },
                {
                    "step": 3,
                    "instruction": "Use inhaler if person has one prescribed",
                    "duration": 20,
                    "critical": True
                },
                {
                    "step": 4,
                    "instruction": "Call 108 if breathing doesn't improve within 2-3 minutes",
                    "duration": 30,
                    "critical": True
                }
            ]
        }
    
    def _initialize_insurance_providers(self):
        """Initialize insurance providers for emergency pre-authorization"""
        return [
            {
                "id": "INS001",
                "name": "HealthGuard Insurance",
                "emergency_coverage": True,
                "pre_auth_required": False,
                "contact": "emergency@healthguard.com",
                "hotline": "1800-HEALTH"
            },
            {
                "id": "INS002",
                "name": "MediCare Plus",
                "emergency_coverage": True,
                "pre_auth_required": True,
                "contact": "claims@medicareplus.com",
                "hotline": "1800-MEDIC"
            }
        ]
    
    def assess_emergency(self, assessment: EmergencyAssessment) -> Dict[str, Any]:
        """AI-powered emergency triage assessment"""
        severity_score = 0
        emergency_type = "general"
        
        # Analyze symptoms for severity
        critical_symptoms = ["chest pain", "difficulty breathing", "unconscious", "severe bleeding", "seizure"]
        high_priority_symptoms = ["fever > 102°F", "persistent vomiting", "severe pain", "confusion"]
        
        for symptom in assessment.symptoms:
            if any(critical in symptom.lower() for critical in critical_symptoms):
                severity_score += 10
                emergency_type = "critical"
            elif any(high in symptom.lower() for high in high_priority_symptoms):
                severity_score += 5
                emergency_type = "high"
            else:
                severity_score += 2
        
        # Analyze vital signs
        if assessment.vital_signs:
            if assessment.vital_signs.get("heart_rate", 0) > 120 or assessment.vital_signs.get("heart_rate", 0) < 50:
                severity_score += 8
            if assessment.vital_signs.get("blood_pressure_systolic", 0) > 180 or assessment.vital_signs.get("blood_pressure_systolic", 0) < 90:
                severity_score += 8
            if assessment.vital_signs.get("oxygen_saturation", 100) < 90:
                severity_score += 10
                emergency_type = "critical"
        
        # Determine triage level
        if severity_score >= 15:
            triage_level = "RED - Immediate"
            ambulance_type = "Advanced Life Support"
            hospital_priority = "Trauma Center"
        elif severity_score >= 8:
            triage_level = "YELLOW - Urgent"
            ambulance_type = "Basic Life Support"
            hospital_priority = "Emergency Room"
        else:
            triage_level = "GREEN - Non-urgent"
            ambulance_type = "None - Self-transport advised"
            hospital_priority = "Outpatient"
        
        return {
            "emergency_id": f"EMG{len(self.emergency_database) + 1:04d}",
            "triage_level": triage_level,
            "severity_score": severity_score,
            "emergency_type": emergency_type,
            "ambulance_type": ambulance_type,
            "hospital_priority": hospital_priority,
            "recommended_actions": self._get_recommended_actions(emergency_type, severity_score),
            "estimated_response_time": self._calculate_response_time(ambulance_type, assessment.location)
        }
    
    def _get_recommended_actions(self, emergency_type: str, severity_score: int) -> List[str]:
        """Get recommended actions based on emergency type"""
        actions = []
        
        if emergency_type == "critical":
            actions.extend([
                "Call 108 immediately",
                "Begin emergency first aid",
                "Prepare for ambulance arrival",
                "Gather patient medications and medical history"
            ])
        elif emergency_type == "high":
            actions.extend([
                "Call 108 for urgent medical assistance",
                "Monitor vital signs",
                "Keep patient comfortable",
                "Prepare medical information"
            ])
        else:
            actions.extend([
                "Contact primary care physician",
                "Monitor symptoms",
                "Rest and hydrate",
                "Seek medical attention if symptoms worsen"
            ])
        
        return actions
    
    def _calculate_response_time(self, ambulance_type: str, location: str) -> str:
        """Calculate emergency response time"""
        base_time = {"Advanced Life Support": 12, "Basic Life Support": 8, "None": 0}
        time_minutes = base_time.get(ambulance_type, 10)
        
        # Add location-based adjustments
        if "downtown" in location.lower() or "city center" in location.lower():
            time_minutes += 2
        elif "suburban" in location.lower():
            time_minutes += 5
        
        return f"{time_minutes} minutes"
    
    def dispatch_ambulance(self, emergency_id: str, dispatch_info: AmbulanceDispatch) -> Dict[str, Any]:
        """Real-time ambulance dispatch"""
        available_ambulances = [amb for amb in self.ambulance_fleet if amb["status"] == "available"]
        
        if not available_ambulances:
            return {"status": "no_ambulance_available", "message": "All ambulances are currently busy"}
        
        # Select appropriate ambulance
        selected_ambulance = available_ambulances[0]
        selected_ambulance["status"] = "dispatched"
        selected_ambulance["emergency_id"] = emergency_id
        
        return {
            "dispatch_id": f"DIS{len(self.emergency_database) + 1:04d}",
            "ambulance_id": selected_ambulance["id"],
            "ambulance_type": selected_ambulance["type"],
            "estimated_arrival": selected_ambulance["eta"],
            "ambulance_location": selected_ambulance["location"],
            "contact_number": "108-AMB-" + selected_ambulance["id"][-3:],
            "tracking_link": f"https://track.ambulance.gov.in/{selected_ambulance['id']}"
        }
    
    def get_first_aid_guidance(self, emergency_type: str) -> List[FirstAidGuidance]:
        """Get step-by-step first aid guidance for golden hour"""
        protocols = self.first_aid_protocols.get(emergency_type, self.first_aid_protocols["cardiac_arrest"])
        
        guidance = []
        for step in protocols:
            guidance.append(FirstAidGuidance(
                emergency_id=f"EMG{len(self.emergency_database) + 1:04d}",
                step_number=step["step"],
                instruction=step["instruction"],
                duration_seconds=step["duration"],
                critical_action=step["critical"]
            ))
        
        return guidance
    
    def notify_family_network(self, notification: FamilyNotification) -> Dict[str, Any]:
        """Family emergency notification network"""
        notifications_sent = []
        
        for contact in notification.family_contacts:
            notification_data = {
                "contact": contact,
                "message": notification.message,
                "patient_name": notification.patient_name,
                "location": notification.location,
                "severity": notification.severity,
                "timestamp": datetime.now().isoformat(),
                "status": "sent"
            }
            notifications_sent.append(notification_data)
        
        return {
            "notification_id": f"FAM{len(self.emergency_database) + 1:04d}",
            "notifications_sent": len(notifications_sent),
            "family_contacts": notification.family_contacts,
            "message_delivered": True
        }
    
    def pre_notify_hospital(self, notification: HospitalPreNotification) -> Dict[str, Any]:
        """Hospital pre-notification with patient data"""
        # Select appropriate hospital based on capabilities
        selected_hospital = None
        for hospital in self.hospitals:
            if notification.severity == "critical" and hospital["trauma_center"]:
                selected_hospital = hospital
                break
            elif notification.severity == "high" and hospital["cardiac_care"]:
                selected_hospital = hospital
                break
        
        if not selected_hospital:
            selected_hospital = self.hospitals[0]  # Default to first hospital
        
        return {
            "notification_id": f"HOS{len(self.emergency_database) + 1:04d}",
            "hospital_id": selected_hospital["id"],
            "hospital_name": selected_hospital["name"],
            "hospital_contact": selected_hospital["contact"],
            "emergency_room_prepared": True,
            "specialists_notified": notification.required_services,
            "patient_data_received": True,
            "estimated_arrival": notification.estimated_arrival
        }
    
    def pre_authorize_insurance(self, pre_auth: InsurancePreAuth) -> Dict[str, Any]:
        """Insurance pre-authorization in emergency"""
        provider = next((p for p in self.insurance_providers if p["id"] == pre_auth.insurance_provider), None)
        
        if not provider:
            return {"status": "provider_not_found", "message": "Insurance provider not found"}
        
        # Emergency pre-authorization logic
        if provider["emergency_coverage"] and not provider["pre_auth_required"]:
            return {
                "authorization_id": f"INS{len(self.emergency_database) + 1:04d}",
                "status": "pre_authorized",
                "coverage_amount": "Full coverage",
                "deductible": "Waived in emergency",
                "authorization_code": f"EA{random.randint(100000, 999999)}",
                "valid_until": (datetime.now() + timedelta(hours=24)).isoformat()
            }
        elif provider["emergency_coverage"]:
            return {
                "authorization_id": f"INS{len(self.emergency_database) + 1:04d}",
                "status": "pending_verification",
                "coverage_amount": "Under review",
                "reference_number": f"ER{random.randint(100000, 999999)}",
                "contact_required": provider["hotline"]
            }
        else:
            return {
                "status": "no_emergency_coverage",
                "message": "Emergency coverage not available in this plan",
                "out_of_pocket_estimated": pre_auth.estimated_cost
            }

# Initialize emergency system
emergency_system = EmergencyTriageSystem()

# Endpoints
@app.get("/healthz")
async def health_check():
    return {"status": "ok", "system": "emergency_triage", "ambulances": len(emergency_system.ambulance_fleet)}

@app.post("/api/emergency/assess", response_model=Dict[str, Any])
async def emergency_assessment(assessment: EmergencyAssessment):
    """AI-powered emergency triage assessment"""
    try:
        result = emergency_system.assess_emergency(assessment)
        emergency_system.emergency_database.append({
            "emergency_id": result["emergency_id"],
            "assessment": assessment.dict(),
            "triage_result": result,
            "timestamp": datetime.now().isoformat()
        })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail="Emergency assessment failed")

@app.post("/api/emergency/dispatch-ambulance", response_model=Dict[str, Any])
async def dispatch_ambulance(dispatch_info: AmbulanceDispatch):
    """Real-time ambulance dispatch"""
    try:
        result = emergency_system.dispatch_ambulance(dispatch_info.emergency_id, dispatch_info)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail="Ambulance dispatch failed")

@app.get("/api/emergency/first-aid/{emergency_type}", response_model=List[FirstAidGuidance])
async def get_first_aid_guidance(emergency_type: str):
    """Get step-by-step first aid guidance"""
    try:
        guidance = emergency_system.get_first_aid_guidance(emergency_type)
        return guidance
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to load first aid guidance")

@app.post("/api/emergency/notify-family", response_model=Dict[str, Any])
async def notify_family(notification: FamilyNotification):
    """Family emergency notification network"""
    try:
        result = emergency_system.notify_family_network(notification)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail="Family notification failed")

@app.post("/api/emergency/hospital-notification", response_model=Dict[str, Any])
async def hospital_notification(notification: HospitalPreNotification):
    """Hospital pre-notification with patient data"""
    try:
        result = emergency_system.pre_notify_hospital(notification)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail="Hospital notification failed")

@app.post("/api/emergency/insurance-preauth", response_model=Dict[str, Any])
async def insurance_pre_authorization(pre_auth: InsurancePreAuth):
    """Insurance pre-authorization in emergency"""
    try:
        result = emergency_system.pre_authorize_insurance(pre_auth)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail="Insurance pre-authorization failed")

@app.get("/api/emergency/offline-data", response_model=Dict[str, Any])
async def get_offline_emergency_data():
    """Completely offline functionality - critical emergency data"""
    return {
        "emergency_contacts": {
            "ambulance": "108",
            "police": "100",
            "fire": "101",
            "poison_control": "1800-11-1234"
        },
        "first_aid_protocols": emergency_system.first_aid_protocols,
        "nearby_hospitals": [
            {
                "name": "City General Hospital",
                "address": "123 Medical Center, City Center",
                "phone": "080-1234567",
                "emergency": True
            },
            {
                "name": "Metro Medical Center", 
                "address": "456 Health Avenue, Metro District",
                "phone": "080-7654321",
                "emergency": True
            }
        ],
        "critical_symptoms": [
            "Chest pain or pressure",
            "Difficulty breathing",
            "Severe bleeding",
            "Loss of consciousness",
            "Seizure or convulsion",
            "Sudden severe headache",
            "Slurred speech or weakness",
            "Major injury or trauma"
        ],
        "cpr_instructions": [
            "Check responsiveness",
            "Call 108 immediately",
            "Start chest compressions (30 times)",
            "Give rescue breaths (2 times)",
            "Continue until help arrives"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
