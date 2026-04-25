"use client";

import { useState } from "react";
import Vapi from "@vapi-ai/web";
import { Mic, Square, Type, Volume2, VolumeX } from "lucide-react";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const rawKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
const vapiKey = rawKey || null;
const vapi = rawKey && rawKey !== "your_vapi_public_key" ? new Vapi(rawKey) : null;

interface DualModeAgentProps {
  activeProfile: string;
  isIncognito: boolean;
  consentToSave: boolean;
  onEmergency: (active: boolean) => void;
  onCallEnd: (report: any) => void;
}

export default function DualModeAgentClean({ 
  activeProfile, 
  isIncognito, 
  consentToSave, 
  onEmergency, 
  onCallEnd 
}: DualModeAgentProps) {
  const [mode, setMode] = useState<"typing" | "voice">("typing");
  const [message, setMessage] = useState("");
  const [responses, setResponses] = useState<Array<{
    query: string; 
    response: string; 
    domain: string; 
    emergency?: any;
    mode: "typing" | "voice";
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [callStatus, setCallStatus] = useState<"inactive" | "loading" | "active">("inactive");
  const [transcription, setTranscription] = useState("");
  const [liveTranslation, setLiveTranslation] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Typing mode functions
  const sendTypedMessage = async () => {
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
        emergency: result.emergency,
        mode: "typing"
      }]);
      
      if (result.emergency) {
        onEmergency(true);
      }
      
    } catch (error) {
      setResponses(prev => [...prev, {
        query: userMessage,
        response: "Sorry, I'm having trouble connecting. Please try again.",
        domain: "ERROR",
        mode: "typing"
      }]);
    }
    
    setIsLoading(false);
  };

  // Voice mode functions
  const startVoiceCall = async () => {
    if (!vapi) {
      setErrorMsg("Voice features not available. Please configure Vapi API key.");
      return;
    }

    setCallStatus("loading");
    setTranscription("");
    setLiveTranslation("");
    setErrorMsg("");

    try {
      const assistant = {
        name: "Didi",
        firstMessage: `Namaste ${activeProfile}! I'm Didi, your health assistant. How can I help you today?`,
        transcriber: { provider: "deepgram", model: "nova-2", language: "en" },
        voice: {
          provider: "elevenlabs",
          voiceId: "rachel"
        },
        model: {
          provider: "openai",
          model: "gpt-4-turbo",
          messages: [
            {
              role: "system",
              content: `You are "Didi," a virtual health worker. Start with "Namaste," be empathetic, and never hallucinate medical dosages.
              Always check the Qdrant vault before answering. Ask for user consent before saving health data to comply with India's DPDP Act.
              
              Current Patient: ${activeProfile}. 
              ${isIncognito ? "PRIVACY NOTICE: This session is private." : ""}`
            }
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "medicalVault",
                description: "Fetch verified medical/AYUSH/nutrition guidance from Qdrant via backend router+guardrails.",
                parameters: {
                  type: "object",
                  properties: {
                    query: { type: "string" },
                    user_id: { type: "string" }
                  },
                  required: ["query"]
                }
              }
            }
          ]
        }
      };

      await vapi.start(assistant);
      setCallStatus("active");
    } catch (error) {
      console.error("Failed to start voice call:", error);
      setCallStatus("inactive");
      setErrorMsg("Failed to start voice conversation. Please try again.");
    }
  };

  const stopVoiceCall = async () => {
    if (vapi) {
      await vapi.stop();
      setCallStatus("inactive");
      setTranscription("");
      setLiveTranslation("");
      
      // Add voice conversation to responses
      if (transcription || liveTranslation) {
        setResponses(prev => [...prev, {
          query: transcription || "Voice conversation",
          response: liveTranslation || "Voice response completed",
          domain: "VOICE",
          mode: "voice"
        }]);
      }
    }
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

  const getDomainIcon = (domain: string) => {
    switch(domain) {
      case 'EMERGENCY': return '🚨';
      case 'AYURVEDA': return '🌿';
      case 'NUTRITION': return '🥗';
      case 'VOICE': return '🎤';
      default: return '💊';
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
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
          marginBottom: '30px',
          flexWrap: 'wrap'
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
            Type Your Question
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
            Speak Your Question
          </button>
        </div>

        {/* Typing Mode */}
        {mode === "typing" && (
          <div>
            <h3 style={{ 
              textAlign: 'center', 
              marginBottom: '20px', 
              color: 'white',
              fontSize: '1.3rem'
            }}>
              💬 Type Your Medical Question
            </h3>
            
            {/* Quick Type Buttons */}
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '10px', 
              marginBottom: '20px',
              justifyContent: 'center'
            }}>
              <button 
                onClick={() => setMessage("I have a headache, what should I do?")}
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
                onClick={() => setMessage("I have severe chest pain")}
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
                onClick={() => setMessage("What ayurvedic remedy for cough?")}
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
              <button 
                onClick={() => setMessage("Nutrition advice")}
                style={{
                  padding: '8px 15px',
                  background: '#ffc107',
                  color: 'black',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Nutrition
              </button>
            </div>
            
            {/* Typing Input */}
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              marginBottom: '20px',
              alignItems: 'center'
            }}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendTypedMessage()}
                placeholder="Type your medical question here..."
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
                onClick={sendTypedMessage}
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
              fontSize: '1.3rem'
            }}>
              🎤 Speak Your Medical Question
            </h3>
            
            {/* Voice Interface */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                gap: '20px' 
              }}>
                <div 
                  style={{ 
                    width: '120px', 
                    height: '120px', 
                    borderRadius: '50%',
                    background: callStatus === "active" ? '#6f42c1' : 'rgba(111,66,193,0.2)',
                    border: '2px solid #6f42c1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={callStatus === "active" ? stopVoiceCall : startVoiceCall}
                >
                  {callStatus === "active" ? <Square color="white" size={40} /> : <Mic color="white" size={40} />}
                </div>
              </div>
              
              <div style={{ marginTop: '1rem', color: 'white' }}>
                {callStatus === "inactive" && "Tap to speak"}
                {callStatus === "loading" && "Connecting..."}
                {callStatus === "active" && "Listening..."}
              </div>
            </div>
            
            {/* Voice Transcription */}
            {transcription && (
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontStyle: 'italic' }}>
                  You said: "{transcription}"
                </p>
              </div>
            )}
            
            {/* Voice Response */}
            {liveTranslation && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '15px', 
                borderRadius: '15px', 
                background: 'rgba(111,66,193,0.2)', 
                border: '1px solid rgba(111,66,193,0.5)'
              }}>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "rgba(255,255,255,0.9)", lineHeight: 1.5 }}>
                  {liveTranslation}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
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

        {/* Combined Responses */}
        <div style={{ marginTop: '30px' }}>
          <h4 style={{ color: 'white', marginBottom: '15px', textAlign: 'center' }}>
            Conversation History
          </h4>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {responses.map((item, index) => (
              <div key={index} style={{ marginBottom: '20px' }}>
                {/* User Query */}
                <div style={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  padding: '15px', 
                  borderRadius: '15px',
                  marginBottom: '10px',
                  textAlign: 'right'
                }}>
                  <strong style={{ color: 'white' }}>
                    {item.mode === "voice" ? "🎤 You said:" : "💬 You typed:"}
                  </strong> {item.query}
                </div>
                
                {/* Bot Response */}
                <div style={{ 
                  background: `rgba(${item.domain === 'EMERGENCY' ? '220,53,69' : item.domain === 'AYURVEDA' ? '40,167,69' : item.domain === 'NUTRITION' ? '255,193,7' : item.domain === 'VOICE' ? '111,66,193' : '0,123,255'},0.2)`, 
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
                    {getDomainIcon(item.domain)} {item.domain} {item.emergency && '🚨 EMERGENCY'}
                  </div>
                  <div style={{ 
                    color: 'white',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap'
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
            <p>👋 Hi {activeProfile}! Choose how you'd like to ask your question:</p>
            <p style={{ fontSize: '14px', marginTop: '10px' }}>
              💬 Type if you prefer typing<br/>
              🎤 Speak if you prefer voice<br/>
              Both use the same medical knowledge base
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
