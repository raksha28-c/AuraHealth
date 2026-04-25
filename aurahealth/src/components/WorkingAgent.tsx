"use client";

import { useState } from "react";
import { Mic, Square, Type } from "lucide-react";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface WorkingAgentProps {
  activeProfile: string;
  isIncognito: boolean;
  consentToSave: boolean;
  onEmergency: (active: boolean) => void;
  onCallEnd: (report: any) => void;
}

export default function WorkingAgent({ 
  activeProfile, 
  isIncognito, 
  consentToSave, 
  onEmergency, 
  onCallEnd 
}: WorkingAgentProps) {
  const [mode, setMode] = useState<"typing" | "voice">("typing");
  const [message, setMessage] = useState("");
  const [responses, setResponses] = useState<Array<{
    query: string; 
    response: string; 
    domain: string; 
    mode: "typing" | "voice";
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [callStatus, setCallStatus] = useState<"inactive" | "loading" | "active">("inactive");
  const [errorMsg, setErrorMsg] = useState("");

  // Typing mode - send to backend
  const sendMessage = async () => {
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
          consent_to_save: consentToSave && !isIncognito
        })
      });
      
      const result = await response.json();
      
      setResponses(prev => [...prev, {
        query: userMessage,
        response: result.answer_text,
        domain: result.domain,
        mode: "typing"
      }]);
      
      if (result.emergency) {
        onEmergency(true);
      }
      
    } catch (error) {
      setResponses(prev => [...prev, {
        query: userMessage,
        response: "Connection error. Please try again.",
        domain: "ERROR",
        mode: "typing"
      }]);
    }
    
    setIsLoading(false);
  };

  // Voice mode - simple placeholder
  const startVoice = async () => {
    setCallStatus("active");
    
    try {
      // Simulate Vapi voice processing
      const response = await fetch(`${backendUrl}/vapi/tools/medicalvault`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: "Voice consultation about my health",
          user_id: "voice_user"
        })
      });
      
      const data = await response.json();
      
      setCallStatus("inactive");
      setResponses(prev => [...prev, {
        query: "Voice consultation",
        response: data.results[0]?.result || "Voice processing completed. How can I help with your health concerns?",
        domain: data.results[0]?.domain || "VOICE",
        mode: "voice"
      }]);
    } catch (error) {
      setCallStatus("inactive");
      setResponses(prev => [...prev, {
        query: "Voice consultation",
        response: "Voice assistant activated! I can help you with medical advice through voice. Please describe your symptoms.",
        domain: "VOICE",
        mode: "voice"
      }]);
    }
  };

  const stopVoice = () => {
    setCallStatus("inactive");
  };

  const getDomainColor = (domain: string) => {
    switch(domain) {
      case 'EMERGENCY': return '#dc3545';
      case 'AYURVEDA': return '#28a745';
      case 'NUTRITION': return '#ffc107';
      case 'VOICE': return '#6f42c1';
      default: return '#007bff';
    }
  };

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '1200px', 
      margin: '0 auto',
      height: '100vh',
      overflowY: 'scroll',
      overflowX: 'hidden',
      scrollBehavior: 'smooth'
    }}>
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        borderRadius: '20px', 
        padding: '30px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        {/* Mode Selection */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '20px', 
          marginBottom: '30px'
        }}>
          <button
            onClick={() => setMode("typing")}
            style={{
              padding: '12px 24px',
              borderRadius: '25px',
              background: mode === "typing" ? '#007bff' : 'rgba(255,255,255,0.1)',
              color: 'white',
              border: mode === "typing" ? '2px solid #007bff' : '1px solid rgba(255,255,255,0.3)',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Type size={20} />
            Type Question
          </button>
          <button
            onClick={() => setMode("voice")}
            style={{
              padding: '12px 24px',
              borderRadius: '25px',
              background: mode === "voice" ? '#6f42c1' : 'rgba(255,255,255,0.1)',
              color: 'white',
              border: mode === "voice" ? '2px solid #6f42c1' : '1px solid rgba(255,255,255,0.3)',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Mic size={20} />
            Speak Question
          </button>
        </div>

        {/* Typing Mode */}
        {mode === "typing" && (
          <div>
            <h3 style={{ 
              textAlign: 'center', 
              marginBottom: '20px', 
              color: 'white',
              fontSize: '1.2rem'
            }}>
              💬 Type Your Medical Question
            </h3>
            
            {/* Quick Buttons */}
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '10px', 
              marginBottom: '20px',
              justifyContent: 'center'
            }}>
              <button 
                onClick={() => setMessage("I have a headache")}
                style={{
                  padding: '8px 15px',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Headache
              </button>
              <button 
                onClick={() => setMessage("I have a fever")}
                style={{
                  padding: '8px 15px',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Fever
              </button>
              <button 
                onClick={() => setMessage("I have chest pain")}
                style={{
                  padding: '8px 15px',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Emergency
              </button>
              <button 
                onClick={() => setMessage("Ayurvedic remedy for cough")}
                style={{
                  padding: '8px 15px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Ayurveda
              </button>
            </div>
            
            {/* Input */}
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              marginBottom: '20px'
            }}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your medical question..."
                style={{
                  flex: 1,
                  padding: '15px',
                  borderRadius: '25px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading}
                style={{
                  padding: '15px 25px',
                  borderRadius: '25px',
                  background: isLoading ? '#6c757d' : '#007bff',
                  color: 'white',
                  border: 'none',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                {isLoading ? '...' : 'Send'}
              </button>
            </div>
          </div>
        )}

        {/* Voice Mode */}
        {mode === "voice" && (
          <div>
            <h3 style={{ 
              textAlign: 'center', 
              marginBottom: '20px', 
              color: 'white',
              fontSize: '1.2rem'
            }}>
              🎤 Speak Your Medical Question
            </h3>
            
            <div style={{ textAlign: 'center' }}>
              <div 
                style={{ 
                  width: '100px', 
                  height: '100px', 
                  borderRadius: '50%',
                  background: callStatus === "active" ? '#6f42c1' : 'rgba(111,66,193,0.2)',
                  border: '2px solid #6f42c1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  margin: '0 auto'
                }}
                onClick={callStatus === "active" ? stopVoice : startVoice}
              >
                {callStatus === "active" ? <Square color="white" size={40} /> : <Mic color="white" size={40} />}
              </div>
              
              <div style={{ marginTop: '1rem', color: 'white' }}>
                {callStatus === "inactive" && "Tap to speak"}
                {callStatus === "loading" && "Connecting..."}
                {callStatus === "active" && "Listening..."}
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {errorMsg && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '15px', 
            borderRadius: '15px', 
            background: 'rgba(220,53,69,0.2)', 
            border: '1px solid rgba(220,53,69,0.5)',
            color: '#fff',
            textAlign: 'center'
          }}>
            {errorMsg}
          </div>
        )}

        {/* Responses */}
        <div style={{ marginTop: '30px' }}>
          <h4 style={{ color: 'white', marginBottom: '15px', textAlign: 'center' }}>
            Conversation
          </h4>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {responses.map((item, index) => (
              <div key={index} style={{ marginBottom: '20px' }}>
                {/* User */}
                <div style={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  padding: '15px', 
                  borderRadius: '15px',
                  marginBottom: '10px',
                  textAlign: 'right'
                }}>
                  <strong style={{ color: 'white' }}>
                    {item.mode === "voice" ? "🎤 You:" : "💬 You:"}
                  </strong> {item.query}
                </div>
                
                {/* Bot */}
                <div style={{ 
                  background: `${getDomainColor(item.domain)}20`, 
                  padding: '15px', 
                  borderRadius: '15px',
                  borderLeft: `4px solid ${getDomainColor(item.domain)}`
                }}>
                  <div style={{ 
                    fontSize: '12px', 
                    color: getDomainColor(item.domain),
                    marginBottom: '5px',
                    fontWeight: 'bold'
                  }}>
                    {item.domain}
                  </div>
                  <div style={{ 
                    color: 'white',
                    lineHeight: '1.5'
                  }}>
                    {item.response}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {responses.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            color: 'rgba(255,255,255,0.6)',
            padding: '40px'
          }}>
            <p>👋 Hi {activeProfile}! Choose how to ask your question:</p>
            <p style={{ fontSize: '14px', marginTop: '10px' }}>
              💬 Type for instant responses<br/>
              🎤 Speak for voice conversations
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
