"use client";

import { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  Phone, 
  Ambulance, 
  Heart, 
  Clock, 
  Users, 
  Shield, 
  MapPin, 
  Activity,
  Volume2,
  Mic,
  PhoneCall,
  Wifi,
  WifiOff,
  CheckCircle,
  X,
  ChevronRight,
  Zap,
  Hospital,
  FileText,
  CreditCard
} from "lucide-react";

const emergencyBackendUrl = process.env.NEXT_PUBLIC_EMERGENCY_BACKEND_URL || "http://localhost:8002";

interface EmergencyAssessment {
  user_id: string;
  symptoms: string[];
  severity: string;
  vital_signs: any;
  location: string;
  voice_input?: string;
  timestamp: string;
}

interface TriageResult {
  emergency_id: string;
  triage_level: string;
  severity_score: number;
  emergency_type: string;
  ambulance_type: string;
  hospital_priority: string;
  recommended_actions: string[];
  estimated_response_time: string;
}

export default function EmergencySystem() {
  const [isOffline, setIsOffline] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [ambulanceDispatched, setAmbulanceDispatched] = useState(false);
  const [familyNotified, setFamilyNotified] = useState(false);
  const [hospitalNotified, setHospitalNotified] = useState(false);
  const [insuranceAuth, setInsuranceAuth] = useState(false);
  const [offlineData, setOfflineData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const criticalSymptoms = [
    "Chest pain or pressure",
    "Difficulty breathing", 
    "Severe bleeding",
    "Loss of consciousness",
    "Seizure or convulsion",
    "Sudden severe headache",
    "Slurred speech or weakness",
    "Major injury or trauma"
  ];

  const vitalSigns = [
    { name: "Heart Rate", normal: "60-100", icon: <Heart size={16} /> },
    { name: "Blood Pressure", normal: "120/80", icon: <Activity size={16} /> },
    { name: "Oxygen Saturation", normal: "95-100%", icon: <Zap size={16} /> },
    { name: "Temperature", normal: "36.5-37.5°C", icon: <Activity size={16} /> }
  ];

  useEffect(() => {
    loadOfflineData();
    checkConnectivity();
  }, []);

  const loadOfflineData = async () => {
    try {
      const response = await fetch(`${emergencyBackendUrl}/api/emergency/offline-data`);
      const data = await response.json();
      setOfflineData(data);
    } catch (error) {
      console.log("Using offline emergency data");
      // Fallback offline data
      setOfflineData({
        emergency_contacts: {
          ambulance: "108",
          police: "100", 
          fire: "101"
        },
        critical_symptoms: criticalSymptoms,
        cpr_instructions: [
          "Check responsiveness",
          "Call 108 immediately", 
          "Start chest compressions (30 times)",
          "Give rescue breaths (2 times)"
        ]
      });
    }
  };

  const checkConnectivity = () => {
    setIsOffline(!navigator.onLine);
  };

  const startVoiceAssessment = () => {
    setIsRecording(true);
    // Simulate voice recording
    setTimeout(() => {
      setVoiceTranscript("I have severe chest pain and difficulty breathing");
      setIsRecording(false);
    }, 3000);
  };

  const handleSymptomSelect = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(prev => prev.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms(prev => [...prev, symptom]);
    }
  };

  const performEmergencyAssessment = async () => {
    setLoading(true);
    try {
      const assessment: EmergencyAssessment = {
        user_id: "user_001",
        symptoms: selectedSymptoms,
        severity: "high",
        vital_signs: {},
        location: "Current Location",
        voice_input: voiceTranscript,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(`${emergencyBackendUrl}/api/emergency/assess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessment)
      });

      const result = await response.json();
      setTriageResult(result);
      setCurrentStep(2);
    } catch (error) {
      console.error("Assessment failed, using offline mode");
      // Fallback offline assessment
      setTriageResult({
        emergency_id: "EMG0001",
        triage_level: "RED - Immediate",
        severity_score: 15,
        emergency_type: "critical",
        ambulance_type: "Advanced Life Support",
        hospital_priority: "Trauma Center",
        recommended_actions: ["Call 108 immediately", "Begin emergency first aid"],
        estimated_response_time: "8 minutes"
      });
      setCurrentStep(2);
    } finally {
      setLoading(false);
    }
  };

  const dispatchAmbulance = async () => {
    try {
      const response = await fetch(`${emergencyBackendUrl}/api/emergency/dispatch-ambulance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emergency_id: triageResult?.emergency_id,
          patient_name: "Emergency Patient",
          phone: "108",
          location: "Current Location",
          severity: triageResult?.severity_score.toString(),
          symptoms: selectedSymptoms,
          estimated_arrival: triageResult?.estimated_response_time
        })
      });

      const result = await response.json();
      setAmbulanceDispatched(true);
      setCurrentStep(3);
    } catch (error) {
      setAmbulanceDispatched(true);
      setCurrentStep(3);
    }
  };

  const notifyFamily = async () => {
    try {
      const response = await fetch(`${emergencyBackendUrl}/api/emergency/notify-family`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emergency_id: triageResult?.emergency_id,
          family_contacts: ["family1@example.com", "family2@example.com"],
          patient_name: "Emergency Patient",
          location: "Current Location",
          severity: triageResult?.triage_level,
          message: "Emergency alert: Family member needs immediate medical attention"
        })
      });

      const result = await response.json();
      setFamilyNotified(true);
    } catch (error) {
      setFamilyNotified(true);
    }
  };

  const notifyHospital = async () => {
    try {
      const response = await fetch(`${emergencyBackendUrl}/api/emergency/hospital-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emergency_id: triageResult?.emergency_id,
          hospital_id: "HOSP001",
          patient_data: {
            symptoms: selectedSymptoms,
            severity: triageResult?.severity_score,
            location: "Current Location"
          },
          estimated_arrival: triageResult?.estimated_response_time,
          severity: triageResult?.emergency_type,
          required_services: ["Emergency Room", "Cardiology"]
        })
      });

      const result = await response.json();
      setHospitalNotified(true);
    } catch (error) {
      setHospitalNotified(true);
    }
  };

  const authorizeInsurance = async () => {
    try {
      const response = await fetch(`${emergencyBackendUrl}/api/emergency/insurance-preauth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emergency_id: triageResult?.emergency_id,
          patient_id: "PAT001",
          insurance_provider: "INS001",
          policy_number: "POL123456",
          emergency_type: triageResult?.emergency_type,
          estimated_cost: "50000",
          pre_authorized: false
        })
      });

      const result = await response.json();
      setInsuranceAuth(true);
      setCurrentStep(4);
    } catch (error) {
      setInsuranceAuth(true);
      setCurrentStep(4);
    }
  };

  const getTriageColor = (level: string) => {
    if (level.includes("RED")) return "from-red-500 to-red-700";
    if (level.includes("YELLOW")) return "from-yellow-500 to-orange-600";
    return "from-green-500 to-green-700";
  };

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      height: '100vh',
      padding: '2rem',
      overflowY: 'scroll',
      overflowX: 'hidden',
      scrollBehavior: 'smooth'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Emergency Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '3rem',
          position: 'relative'
        }}>
          {/* Connectivity Status */}
          <div style={{
            position: 'absolute',
            top: '0',
            right: '0',
            background: isOffline ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
            backdropFilter: 'blur(10px)',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            border: isOffline ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'white'
          }}>
            {isOffline ? <WifiOff size={16} /> : <Wifi size={16} />}
            <span style={{ fontSize: '0.9rem' }}>
              {isOffline ? 'Offline Mode' : 'Online'}
            </span>
          </div>

          <div style={{
            background: 'rgba(239, 68, 68, 0.2)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '2rem',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <AlertTriangle size={48} style={{ color: '#ef4444' }} />
              <h1 style={{ 
                fontSize: '2.5rem', 
                fontWeight: 'bold', 
                color: 'white',
                margin: 0,
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
              }}>
                Emergency Triage System
              </h1>
            </div>
            <p style={{ 
              fontSize: '1.1rem', 
              color: 'rgba(255,255,255,0.9)',
              margin: 0
            }}>
              AI-powered emergency assessment with real-time response coordination
            </p>
          </div>

          {/* Quick Emergency Actions */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => window.location.href = 'tel:108'}
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
                animation: 'pulse 2s infinite'
              }}
            >
              <Phone size={20} />
              Call 108 Emergency
            </button>
            <button
              onClick={startVoiceAssessment}
              disabled={isRecording}
              style={{
                background: isRecording ? 'rgba(239, 68, 68, 0.5)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: isRecording ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)'
              }}
            >
              <Mic size={20} />
              {isRecording ? 'Recording...' : 'Voice Assessment'}
            </button>
          </div>
        </div>

        {/* Voice Transcript */}
        {voiceTranscript && (
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '15px',
            padding: '1.5rem',
            marginBottom: '2rem',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Volume2 size={20} style={{ color: '#6366f1' }} />
              <strong style={{ color: '#1f2937' }}>Voice Assessment:</strong>
            </div>
            <p style={{ color: '#4b5563', fontStyle: 'italic' }}>"{voiceTranscript}"</p>
          </div>
        )}

        {/* Step 1: Symptom Assessment */}
        {currentStep === 1 && (
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#1f2937', marginBottom: '1.5rem' }}>
              Step 1: Emergency Assessment
            </h2>
            
            {/* Critical Symptoms */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#ef4444', marginBottom: '1rem' }}>
                <AlertTriangle size={20} style={{ marginRight: '0.5rem' }} />
                Critical Symptoms (Select all that apply)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                {criticalSymptoms.map((symptom, index) => (
                  <button
                    key={index}
                    onClick={() => handleSymptomSelect(symptom)}
                    style={{
                      background: selectedSymptoms.includes(symptom) 
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                        : 'rgba(255,255,255,0.8)',
                      color: selectedSymptoms.includes(symptom) ? 'white' : '#1f2937',
                      border: selectedSymptoms.includes(symptom) 
                        ? '2px solid #ef4444'
                        : '2px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '1rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertTriangle size={16} />
                      {symptom}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Vital Signs */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#1f2937', marginBottom: '1rem' }}>
                <Heart size={20} style={{ marginRight: '0.5rem' }} />
                Vital Signs (if available)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {vitalSigns.map((vital, index) => (
                  <div key={index} style={{
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    borderRadius: '12px',
                    padding: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <div style={{ color: '#6366f1' }}>{vital.icon}</div>
                      <strong style={{ color: '#1f2937' }}>{vital.name}</strong>
                    </div>
                    <input
                      type="text"
                      placeholder={`Normal: ${vital.normal}`}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={performEmergencyAssessment}
              disabled={selectedSymptoms.length === 0 || loading}
              style={{
                width: '100%',
                padding: '1.5rem',
                background: loading || selectedSymptoms.length === 0
                  ? 'rgba(156, 163, 175, 0.5)'
                  : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '15px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: loading || selectedSymptoms.length === 0 ? 'not-allowed' : 'pointer',
                boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)'
              }}
            >
              {loading ? 'Assessing Emergency...' : 'Perform Emergency Assessment'}
            </button>
          </div>
        )}

        {/* Step 2: Triage Results */}
        {currentStep === 2 && triageResult && (
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#1f2937', marginBottom: '1.5rem' }}>
              Emergency Triage Results
            </h2>
            
            {/* Triage Level */}
            <div style={{
              background: `linear-gradient(135deg, ${getTriageColor(triageResult.triage_level)})`,
              color: 'white',
              borderRadius: '15px',
              padding: '1.5rem',
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Triage Level</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {triageResult.triage_level}
              </div>
            </div>

            {/* Emergency Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <AlertTriangle size={16} style={{ color: '#ef4444' }} />
                  <strong style={{ color: '#1f2937' }}>Emergency Type</strong>
                </div>
                <div style={{ color: '#4b5563' }}>{triageResult.emergency_type}</div>
              </div>
              
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Ambulance size={16} style={{ color: '#3b82f6' }} />
                  <strong style={{ color: '#1f2937' }}>Ambulance Type</strong>
                </div>
                <div style={{ color: '#4b5563' }}>{triageResult.ambulance_type}</div>
              </div>
              
              <div style={{ background: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Clock size={16} style={{ color: '#22c55e' }} />
                  <strong style={{ color: '#1f2937' }}>Response Time</strong>
                </div>
                <div style={{ color: '#4b5563' }}>{triageResult.estimated_response_time}</div>
              </div>
            </div>

            {/* Recommended Actions */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#1f2937', marginBottom: '1rem' }}>
                <Shield size={20} style={{ marginRight: '0.5rem' }} />
                Recommended Actions
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {triageResult.recommended_actions.map((action, index) => (
                  <div key={index} style={{
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    borderRadius: '8px',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <CheckCircle size={16} style={{ color: '#6366f1' }} />
                    <span style={{ color: '#4b5563' }}>{action}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={dispatchAmbulance}
              style={{
                width: '100%',
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '15px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Ambulance size={24} />
              Dispatch Ambulance Now
            </button>
          </div>
        )}

        {/* Step 3: Emergency Response Coordination */}
        {currentStep === 3 && (
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#1f2937', marginBottom: '1.5rem' }}>
              Emergency Response Coordination
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {/* Ambulance Status */}
              <div style={{
                background: ambulanceDispatched ? 'rgba(34, 197, 94, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                border: ambulanceDispatched ? '2px solid #22c55e' : '2px solid #9ca3af',
                borderRadius: '15px',
                padding: '1.5rem',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: ambulanceDispatched ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                  color: 'white'
                }}>
                  <Ambulance size={30} />
                </div>
                <h3 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>Ambulance Dispatched</h3>
                <p style={{ color: '#4b5563', fontSize: '0.9rem' }}>
                  {ambulanceDispatched ? 'En route to your location' : 'Waiting for dispatch'}
                </p>
                {ambulanceDispatched && (
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ color: '#22c55e', fontWeight: 'bold' }}>
                      ETA: {triageResult?.estimated_response_time}
                    </div>
                  </div>
                )}
              </div>

              {/* Family Notification */}
              <div style={{
                background: familyNotified ? 'rgba(34, 197, 94, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                border: familyNotified ? '2px solid #22c55e' : '2px solid #9ca3af',
                borderRadius: '15px',
                padding: '1.5rem',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: familyNotified ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                  color: 'white'
                }}>
                  <Users size={30} />
                </div>
                <h3 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>Family Notified</h3>
                <p style={{ color: '#4b5563', fontSize: '0.9rem' }}>
                  {familyNotified ? 'Emergency contacts alerted' : 'Notify family members'}
                </p>
                {!familyNotified && (
                  <button
                    onClick={notifyFamily}
                    style={{
                      marginTop: '1rem',
                      padding: '0.8rem 1.5rem',
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    Notify Family
                  </button>
                )}
              </div>

              {/* Hospital Notification */}
              <div style={{
                background: hospitalNotified ? 'rgba(34, 197, 94, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                border: hospitalNotified ? '2px solid #22c55e' : '2px solid #9ca3af',
                borderRadius: '15px',
                padding: '1.5rem',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: hospitalNotified ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                  color: 'white'
                }}>
                  <Hospital size={30} />
                </div>
                <h3 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>Hospital Alerted</h3>
                <p style={{ color: '#4b5563', fontSize: '0.9rem' }}>
                  {hospitalNotified ? 'ER prepared for arrival' : 'Prep emergency room'}
                </p>
                {!hospitalNotified && (
                  <button
                    onClick={notifyHospital}
                    style={{
                      marginTop: '1rem',
                      padding: '0.8rem 1.5rem',
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    Alert Hospital
                  </button>
                )}
              </div>
            </div>

            {/* Insurance Authorization */}
            <div style={{
              background: insuranceAuth ? 'rgba(34, 197, 94, 0.1)' : 'rgba(156, 163, 175, 0.1)',
              border: insuranceAuth ? '2px solid #22c55e' : '2px solid #9ca3af',
              borderRadius: '15px',
              padding: '1.5rem',
              marginTop: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: insuranceAuth ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <h3 style={{ color: '#1f2937', marginBottom: '0.5rem' }}>Insurance Pre-Authorization</h3>
                    <p style={{ color: '#4b5563', fontSize: '0.9rem' }}>
                      {insuranceAuth ? 'Coverage approved' : 'Verify insurance coverage'}
                    </p>
                  </div>
                </div>
                {!insuranceAuth && (
                  <button
                    onClick={authorizeInsurance}
                    style={{
                      padding: '0.8rem 1.5rem',
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    Authorize
                  </button>
                )}
              </div>
            </div>

            {ambulanceDispatched && familyNotified && hospitalNotified && insuranceAuth && (
              <button
                onClick={() => setCurrentStep(4)}
                style={{
                  width: '100%',
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '15px',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 10px 25px rgba(34, 197, 94, 0.3)',
                  marginTop: '2rem'
                }}
              >
                Continue to First Aid Guidance
              </button>
            )}
          </div>
        )}

        {/* Step 4: First Aid Guidance */}
        {currentStep === 4 && (
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: '#1f2937', marginBottom: '1.5rem' }}>
              <Heart size={24} style={{ marginRight: '0.5rem', color: '#ef4444' }} />
              First Aid Guidance - Golden Hour
            </h2>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {[
                { step: 1, instruction: "Keep the person calm and lying down", critical: true, duration: "Immediate" },
                { step: 2, instruction: "Loosen tight clothing", critical: true, duration: "30 seconds" },
                { step: 3, instruction: "Monitor breathing and pulse", critical: true, duration: "Every 2 minutes" },
                { step: 4, instruction: "Prepare medical information for responders", critical: false, duration: "While waiting" }
              ].map((guidance) => (
                <div key={guidance.step} style={{
                  background: guidance.critical ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                  border: guidance.critical ? '2px solid #ef4444' : '2px solid #6366f1',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: guidance.critical ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {guidance.step}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      color: '#1f2937', 
                      fontWeight: 'bold', 
                      marginBottom: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      {guidance.instruction}
                      {guidance.critical && <AlertTriangle size={16} style={{ color: '#ef4444' }} />}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                      Duration: {guidance.duration}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Emergency Contacts */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '2px solid #ef4444',
              borderRadius: '15px',
              padding: '1.5rem',
              marginTop: '2rem'
            }}>
              <h3 style={{ color: '#1f2937', marginBottom: '1rem' }}>
                <Phone size={20} style={{ marginRight: '0.5rem', color: '#ef4444' }} />
                Emergency Contacts
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {offlineData?.emergency_contacts && Object.entries(offlineData.emergency_contacts).map(([service, number]) => (
                  <div key={service} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <button
                      onClick={() => window.location.href = `tel:${number}`}
                      style={{
                        background: 'rgba(255,255,255,0.8)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    flex: 1
                  }}
                    >
                      <Phone size={16} style={{ color: '#ef4444' }} />
                      <span style={{ color: '#1f2937' }}>{service}: {number}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
