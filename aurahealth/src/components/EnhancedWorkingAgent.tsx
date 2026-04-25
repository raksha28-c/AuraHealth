"use client";

import { useState, useEffect } from "react";
import { Mic, Square, Type, Globe, AlertTriangle, Brain, Heart, Phone, Clock, User, FileText } from "lucide-react";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface EnhancedWorkingAgentProps {
  activeProfile: string;
  isIncognito: boolean;
  consentToSave: boolean;
  onEmergency: (active: boolean) => void;
  onCallEnd: (report: any) => void;
}

interface EnhancedResponse {
  query: string;
  response: string;
  domain: string;
  mode: "typing" | "voice";
  detectedLanguage?: string;
  symptomRouting?: any;
  prescriptionAnalysis?: any;
  emergencyAlert?: any;
  patientMemory?: any;
  timestamp: string;
}

export default function EnhancedWorkingAgent({ 
  activeProfile, 
  isIncognito, 
  consentToSave, 
  onEmergency, 
  onCallEnd 
}: EnhancedWorkingAgentProps) {
  const [mode, setMode] = useState<"typing" | "voice">("typing");
  const [message, setMessage] = useState("");
  const [responses, setResponses] = useState<EnhancedResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [callStatus, setCallStatus] = useState<"inactive" | "loading" | "active">("inactive");
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [showPatientMemory, setShowPatientMemory] = useState(false);
  const [patientMemory, setPatientMemory] = useState<any>(null);
  const [showPrescriptionUpload, setShowPrescriptionUpload] = useState(false);
  const [prescriptionText, setPrescriptionText] = useState("");

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
    { code: "bn", name: "বাংলা", flag: "🇧🇩" },
    { code: "te", name: "తెలుగు", flag: "🇮🇳" },
    { code: "ta", name: "தமிழ்", flag: "🇮🇳" },
    { code: "mr", name: "मराठी", flag: "🇮🇳" },
    { code: "gu", name: "ગુજરાતી", flag: "🇮🇳" },
    { code: "kn", name: "ಕನ್ನಡ", flag: "🇮🇳" },
    { code: "ml", name: "മലയാളം", flag: "🇮🇳" },
    { code: "pa", name: "ਪੰਜਾਬੀ", flag: "🇮🇳" }
  ];

  // Enhanced typing mode with all features
  const sendEnhancedMessage = async () => {
    if (!message.trim()) return;
    
    setIsLoading(true);
    const userMessage = message;
    setMessage("");
    
    try {
      const response = await fetch(`${backendUrl}/v1/router`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: activeProfile.toLowerCase(),
          transcript: userMessage,
          consent_to_save: consentToSave && !isIncognito,
          language: selectedLanguage,
          voice_mode: false
        })
      });
      
      const data = await response.json();
      
      const enhancedResponse: EnhancedResponse = {
        query: userMessage,
        response: data.answer_text || "I recommend consulting a healthcare provider for proper medical advice.",
        domain: data.domain || "GENERAL",
        mode: "typing",
        detectedLanguage: data.detected_language || selectedLanguage,
        symptomRouting: data.symptom_routing,
        prescriptionAnalysis: data.prescription_analysis,
        emergencyAlert: data.emergency,
        patientMemory: data.memory_context,
        timestamp: new Date().toISOString()
      };
      
      setResponses(prev => [...prev, enhancedResponse]);
      
      // Handle emergency alerts
      if (data.emergency) {
        onEmergency(true);
        setTimeout(() => onEmergency(false), 5000);
      }
      
      // Handle symptom routing
      if (data.symptom_routing && data.symptom_routing.routing_decision === "emergency") {
        onEmergency(true);
      }
      
    } catch (error) {
      setResponses(prev => [...prev, {
        query: userMessage,
        response: "Connection error. Please try again.",
        domain: "ERROR",
        mode: "typing",
        timestamp: new Date().toISOString()
      }]);
    }
    
    setIsLoading(false);
  };

  // Enhanced voice mode with all features
  const startEnhancedVoice = async () => {
    setCallStatus("loading");
    
    try {
      const response = await fetch(`${backendUrl}/v1/voice/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: activeProfile.toLowerCase(),
          transcript: "Voice consultation started",
          consent_to_save: consentToSave && !isIncognito,
          language: selectedLanguage,
          voice_mode: true
        })
      });
      
      const data = await response.json();
      
      setCallStatus("active");
      setResponses(prev => [...prev, {
        query: "Voice consultation",
        response: data.voice_result?.response || "Voice assistant activated! I can help you with medical advice through voice. Please describe your symptoms.",
        domain: data.voice_result?.intent?.toUpperCase() || "VOICE",
        mode: "voice",
        detectedLanguage: selectedLanguage,
        symptomRouting: data.symptom_routing,
        emergencyAlert: data.emergency,
        timestamp: new Date().toISOString()
      }]);
      
      // Simulate voice interaction
      setTimeout(() => {
        setCallStatus("inactive");
        if (data.voice_result?.intent === "emergency") {
          onEmergency(true);
        }
      }, 3000);
      
    } catch (error) {
      setCallStatus("inactive");
      setResponses(prev => [...prev, {
        query: "Voice consultation",
        response: "Voice assistant activated! I can help you with medical advice through voice. Please describe your symptoms.",
        domain: "VOICE",
        mode: "voice",
        timestamp: new Date().toISOString()
      }]);
    }
  };

  // Prescription analysis
  const analyzePrescription = async () => {
    if (!prescriptionText.trim()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${backendUrl}/v1/prescription/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: activeProfile.toLowerCase(),
          prescription_text: prescriptionText
        })
      });
      
      const data = await response.json();
      
      if (data.status === "success") {
        setResponses(prev => [...prev, {
          query: "Prescription Analysis",
          response: `I've analyzed your prescription. Found ${data.analysis.medications.length} medications with ${data.analysis.safety_warnings.length} safety considerations.`,
          domain: "PRESCRIPTION",
          mode: "typing",
          prescriptionAnalysis: data.analysis,
          timestamp: new Date().toISOString()
        }]);
      }
      
      setPrescriptionText("");
      setShowPrescriptionUpload(false);
      
    } catch (error) {
      setResponses(prev => [...prev, {
        query: "Prescription Analysis",
        response: "Unable to analyze prescription. Please try again.",
        domain: "ERROR",
        mode: "typing",
        timestamp: new Date().toISOString()
      }]);
    }
    
    setIsLoading(false);
  };

  // Load patient memory
  const loadPatientMemory = async () => {
    try {
      const response = await fetch(`${backendUrl}/v1/memory/${activeProfile.toLowerCase()}`);
      const data = await response.json();
      
      if (data.status === "success") {
        setPatientMemory(data.memory);
        setShowPatientMemory(true);
      }
    } catch (error) {
      console.error("Failed to load patient memory:", error);
    }
  };

  // Emergency alert
  const sendEmergencyAlert = async () => {
    try {
      const response = await fetch(`${backendUrl}/v1/emergency/alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: activeProfile.toLowerCase(),
          emergency_type: "medical_emergency",
          severity: "critical",
          contact_info: "Emergency contact"
        })
      });
      
      const data = await response.json();
      
      if (data.status === "success") {
        setResponses(prev => [...prev, {
          query: "Emergency Alert",
          response: "Emergency alert sent! Help is on the way. Please stay calm and follow emergency protocols.",
          domain: "EMERGENCY",
          mode: "typing",
          emergencyAlert: data.alert,
          timestamp: new Date().toISOString()
        }]);
        
        onEmergency(true);
        setTimeout(() => onEmergency(false), 5000);
      }
      
    } catch (error) {
      setResponses(prev => [...prev, {
        query: "Emergency Alert",
        response: "Failed to send emergency alert. Please call emergency services directly.",
        domain: "ERROR",
        mode: "typing",
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const getDomainColor = (domain: string) => {
    switch(domain) {
      case 'EMERGENCY': return '#dc3545';
      case 'CARDIOLOGY': return '#e74c3c';
      case 'NEUROLOGY': return '#9b59b6';
      case 'GASTROENTEROLOGY': return '#f39c12';
      case 'DERMATOLOGY': return '#27ae60';
      case 'PRESCRIPTION': return '#3498db';
      case 'VOICE': return '#17a2b8';
      default: return '#007bff';
    }
  };

  const getDomainIcon = (domain: string) => {
    switch(domain) {
      case 'EMERGENCY': return <AlertTriangle size={16} />;
      case 'PRESCRIPTION': return <FileText size={16} />;
      case 'VOICE': return <Mic size={16} />;
      default: return <Heart size={16} />;
    }
  };

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '1200px', 
      margin: '0 auto',
      height: '100vh',
      overflowY: 'scroll',
      scrollBehavior: 'smooth'
    }}>
      {/* Enhanced Header with All Features */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        padding: '2rem',
        marginBottom: '2rem',
        color: 'white',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '2rem', fontWeight: '800' }}>
          🏥 Enhanced AuraHealth AI Assistant
        </h2>
        <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem', opacity: 0.9 }}>
          Complete healthcare solution with voice interaction, smart routing, patient memory, prescription analysis, and emergency alerts
        </p>
        
        {/* Feature Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {[
            { icon: <Mic size={14} />, text: "Voice Interaction" },
            { icon: <Brain size={14} />, text: "Smart Routing" },
            { icon: <User size={14} />, text: "Patient Memory" },
            { icon: <FileText size={14} />, text: "Prescription Analysis" },
            { icon: <Phone size={14} />, text: "Emergency Alerts" },
            { icon: <Globe size={14} />, text: "Multilingual" }
          ].map((feature, index) => (
            <div key={index} style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {feature.icon}
              {feature.text}
            </div>
          ))}
        </div>
        
        {/* Multilingual Support */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <Globe size={20} />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              border: 'none',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code} style={{ color: '#333' }}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <button
          onClick={() => setShowPrescriptionUpload(true)}
          style={{
            padding: '1rem',
            background: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '15px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s ease'
          }}
        >
          <FileText size={20} />
          Analyze Prescription
        </button>
        
        <button
          onClick={loadPatientMemory}
          style={{
            padding: '1rem',
            background: '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '15px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s ease'
          }}
        >
          <User size={20} />
          View Patient Memory
        </button>
        
        <button
          onClick={sendEmergencyAlert}
          style={{
            padding: '1rem',
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '15px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s ease'
          }}
        >
          <Phone size={20} />
          Emergency Alert
        </button>
      </div>

      {/* Mode Selection */}
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem', fontWeight: '700' }}>
          Choose Interaction Mode
        </h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setMode("typing")}
            style={{
              flex: 1,
              padding: '1rem',
              background: mode === "typing" ? '#007bff' : '#f8f9fa',
              color: mode === "typing" ? 'white' : '#333',
              border: `2px solid ${mode === "typing" ? '#007bff' : '#dee2e6'}`,
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}
          >
            <Type size={20} />
            Typing Mode
          </button>
          
          <button
            onClick={() => setMode("voice")}
            style={{
              flex: 1,
              padding: '1rem',
              background: mode === "voice" ? '#28a745' : '#f8f9fa',
              color: mode === "voice" ? 'white' : '#333',
              border: `2px solid ${mode === "voice" ? '#28a745' : '#dee2e6'}`,
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}
          >
            <Mic size={20} />
            Voice Mode
          </button>
        </div>
      </div>

      {/* Prescription Upload Modal */}
      {showPrescriptionUpload && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '700' }}>
              📋 Prescription Analysis
            </h3>
            <textarea
              value={prescriptionText}
              onChange={(e) => setPrescriptionText(e.target.value)}
              placeholder="Enter prescription text or medication names..."
              style={{
                width: '100%',
                height: '150px',
                padding: '1rem',
                border: '2px solid #dee2e6',
                borderRadius: '10px',
                fontSize: '1rem',
                resize: 'vertical',
                marginBottom: '1rem'
              }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={analyzePrescription}
                disabled={!prescriptionText.trim() || isLoading}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: prescriptionText.trim() && !isLoading ? '#007bff' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: prescriptionText.trim() && !isLoading ? 'pointer' : 'not-allowed'
                }}
              >
                {isLoading ? 'Analyzing...' : 'Analyze'}
              </button>
              <button
                onClick={() => {
                  setShowPrescriptionUpload(false);
                  setPrescriptionText("");
                }}
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Memory Modal */}
      {showPatientMemory && patientMemory && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: '700' }}>
              🧠 Patient Memory
            </h3>
            <div style={{ marginBottom: '1rem' }}>
              <p><strong>Last Updated:</strong> {patientMemory.last_updated || 'No data'}</p>
              <p><strong>Medications:</strong> {patientMemory.medications?.length || 0} items</p>
              <p><strong>Allergies:</strong> {patientMemory.allergies?.length || 0} items</p>
              <p><strong>Symptoms:</strong> {patientMemory.symptoms?.length || 0} records</p>
            </div>
            <button
              onClick={() => setShowPatientMemory(false)}
              style={{
                width: '100%',
                padding: '1rem',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '1.5rem',
        marginBottom: '2rem',
        boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
      }}>
        {mode === "typing" ? (
          <div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendEnhancedMessage()}
              placeholder="Describe your symptoms, ask about medications, or discuss health concerns..."
              style={{
                width: '100%',
                height: '120px',
                padding: '1rem',
                border: '2px solid #dee2e6',
                borderRadius: '10px',
                fontSize: '1rem',
                resize: 'vertical',
                marginBottom: '1rem',
                outline: 'none',
                borderColor: '#007bff'
              }}
            />
            <button
              onClick={sendEnhancedMessage}
              disabled={!message.trim() || isLoading}
              style={{
                width: '100%',
                padding: '1rem',
                background: message.trim() && !isLoading ? '#007bff' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1.1rem',
                fontWeight: '700',
                cursor: message.trim() && !isLoading ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease'
              }}
            >
              <Type size={20} />
              {isLoading ? 'Processing...' : 'Send Message'}
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={startEnhancedVoice}
              disabled={callStatus !== "inactive"}
              style={{
                padding: '2rem',
                background: callStatus === "active" ? '#28a745' : callStatus === "loading" ? '#ffc107' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '15px',
                fontSize: '1.2rem',
                fontWeight: '700',
                cursor: callStatus === "inactive" ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                transition: 'all 0.3s ease',
                margin: '0 auto'
              }}
            >
              <Mic size={30} />
              {callStatus === "loading" ? "Connecting..." : callStatus === "active" ? "Listening... Click to stop" : "Start Voice Consultation"}
            </button>
            <p style={{ marginTop: '1rem', color: '#6c757d' }}>
              Speak naturally about your health concerns. I'll understand and help you.
            </p>
          </div>
        )}
      </div>

      {/* Enhanced Responses Display */}
      <div style={{
        background: 'white',
        borderRadius: '15px',
        padding: '1.5rem',
        boxShadow: '0 5px 20px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.3rem', fontWeight: '700' }}>
          💬 Consultation History
        </h3>
        
        {responses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
            <Heart size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>Start a consultation to see your health journey here</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {responses.map((response, index) => (
              <div key={index} style={{
                padding: '1.5rem',
                borderRadius: '15px',
                background: response.mode === 'voice' ? '#e8f5e8' : '#f8f9fa',
                border: `2px solid ${getDomainColor(response.domain)}`,
                borderLeft: `5px solid ${getDomainColor(response.domain)}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {getDomainIcon(response.domain)}
                    <span style={{ fontWeight: '700', color: getDomainColor(response.domain) }}>
                      {response.domain}
                    </span>
                    {response.detectedLanguage && response.detectedLanguage !== "en" && (
                      <span style={{ 
                        background: '#007bff', 
                        color: 'white', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '10px', 
                        fontSize: '0.8rem' 
                      }}>
                        {languages.find(l => l.code === response.detectedLanguage)?.flag || '🌐'}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6c757d' }}>
                    <Clock size={14} />
                    <span style={{ fontSize: '0.9rem' }}>
                      {new Date(response.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>You:</p>
                  <p style={{ color: '#495057', background: 'white', padding: '0.8rem', borderRadius: '8px' }}>
                    {response.query}
                  </p>
                </div>
                
                <div>
                  <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Assistant:</p>
                  <p style={{ color: '#495057', lineHeight: '1.6' }}>
                    {response.response}
                  </p>
                </div>
                
                {/* Enhanced Features Display */}
                {response.symptomRouting && (
                  <div style={{ 
                    marginTop: '1rem', 
                    padding: '0.8rem', 
                    background: '#fff3cd', 
                    borderRadius: '8px',
                    fontSize: '0.9rem'
                  }}>
                    <p style={{ fontWeight: '600', marginBottom: '0.3rem' }}>
                      🧠 Smart Routing: {response.symptomRouting.recommended_specialist}
                    </p>
                    <p style={{ color: '#856404' }}>
                      {response.symptomRouting.reason} | Urgency: {response.symptomRouting.urgency}
                    </p>
                  </div>
                )}
                
                {response.prescriptionAnalysis && (
                  <div style={{ 
                    marginTop: '1rem', 
                    padding: '0.8rem', 
                    background: '#d1ecf1', 
                    borderRadius: '8px',
                    fontSize: '0.9rem'
                  }}>
                    <p style={{ fontWeight: '600', marginBottom: '0.3rem' }}>
                      💊 Prescription Analysis: {response.prescriptionAnalysis.medications.length} medications
                    </p>
                    <p style={{ color: '#0c5460' }}>
                      {response.prescriptionAnalysis.safety_warnings.length} safety considerations found
                    </p>
                  </div>
                )}
                
                {response.emergencyAlert && (
                  <div style={{ 
                    marginTop: '1rem', 
                    padding: '0.8rem', 
                    background: '#f8d7da', 
                    borderRadius: '8px',
                    fontSize: '0.9rem'
                  }}>
                    <p style={{ fontWeight: '600', marginBottom: '0.3rem', color: '#721c24' }}>
                      🚨 Emergency Alert Sent
                    </p>
                    <p style={{ color: '#721c24' }}>
                      Alert ID: {response.emergencyAlert.alert_id} | Contacts notified: {response.emergencyAlert.contacts_notified}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
