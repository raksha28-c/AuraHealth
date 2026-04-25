"use client";

import { useState, useEffect } from "react";
import Vapi from "@vapi-ai/web";
import { Mic, Square, Type, MessageSquare, Volume2, VolumeX, Languages, Globe } from "lucide-react";
import styles from "./VoiceAgent.module.css";

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

export default function DualModeAgent({ 
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
    timestamp: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [callStatus, setCallStatus] = useState<"inactive" | "loading" | "active">("inactive");
  const [transcription, setTranscription] = useState("");
  const [liveTranslation, setLiveTranslation] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [activeLang, setActiveLang] = useState({ id: 'en', name: 'English', native: 'English' });

  const SUPPORTED_LANGUAGES = [
    { id: 'en', name: 'English', native: 'English' },
    { id: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { id: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { id: 'te', name: 'Telugu', native: 'తెలుగు' },
    { id: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { id: 'mr', name: 'Marathi', native: 'मराठी' },
    { id: 'tulu', name: 'Tulu', native: 'ತುಳು (Fallback)' },
  ];

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
        mode: "typing",
        timestamp: Date.now()
      }]);
      
      if (result.emergency) {
        onEmergency(true);
      }
      
    } catch (error) {
      setResponses(prev => [...prev, {
        query: userMessage,
        response: "Sorry, I'm having trouble connecting. Please try again.",
        domain: "ERROR",
        mode: "typing",
        timestamp: Date.now()
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
        transcriber: { provider: "deepgram", model: "nova-2", language: activeLang.id },
        voice: {
          provider: "elevenlabs",
          voiceId: "rachel",
          model: "eleven_multilingual_v2"
        },
        model: {
          provider: "openai",
          model: "gpt-4-turbo",
          messages: [
            {
              role: "system",
              content: `You are "Didi," a virtual health worker. Start with "Namaste," be empathetic, and never hallucinate medical dosages.
              Always check the Qdrant vault before answering. Ask for user consent before saving health data to comply with India's DPDP Act.
              
              PERSONALITY:
              - Warm, reassuring, and human. Never say "As an AI...".
              - Use phrases like "I understand," "I'm sorry you're feeling this way," "Let's figure this out together."
              - When speaking in ${activeLang.name}, use local nuances and natural speech.
              
              CORE BEHAVIORS:
              1. EMERGENCIES: If the user mentions chest pain, severe bleeding, or difficulty breathing, IMMEDIATELY call the 'triggerEmergency' tool and tell them to stay calm while you help them.
              2. MEMORY: ${isIncognito ? "INCOGNITO MODE ACTIVE. Do not reference past history and do not attempt to save new entries." : "Use conversation history to provide context."}. Use this to provide context (e.g., "I see you've had a similar cough before"). Do NOT save new memory unless user consent is confirmed (UI consent controls this).
              3. MULTILINGUAL: You are fluent in ${activeLang.name}. If the user mixes languages (e.g., "Fever ide 2 days"), respond naturally in ${activeLang.name}.
              4. ROUTER+RAG: Use the 'medicalVault' tool to fetch safe, domain-specific info before giving advice.
              
              Current Patient: ${activeProfile}. Current Language: ${activeLang.name}. 
              ${isIncognito ? "PRIVACY NOTICE: This session is private." : ""}`
            }
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "getLocation",
                description: "Get user coordinates for mapping clinics.",
                parameters: { type: "object", properties: {} }
              }
            },
            {
              type: "function",
              function: {
                name: "triggerEmergency",
                description: "Call this immediately if an emergency (e.g. heart attack, trauma) is detected.",
                parameters: { type: "object", properties: {} }
              }
            },
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

      const config = {
        assistant: assistant,
        analysisPlan: {
          structuredDataPlan: {
            schema: {
              type: "object",
              properties: {
                symptoms: { type: "array", items: { type: "string" } },
                priority: { type: "string", enum: ["low", "medium", "high", "emergency"] },
                advice: { type: "string" },
                duration: { type: "string" }
              }
            }
          } as any
        }
      };

      await vapi.start(config);
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
          mode: "voice",
          timestamp: Date.now()
        }]);
      }
    }
  };

  useEffect(() => {
    if (!vapi) return;

    const onCallStart = () => {
      setCallStatus("active");
      setTranscription("");
      setLiveTranslation("");
      setErrorMsg("");
    };

    const handleCallEnd = () => {
      setCallStatus("inactive");
      setTranscription("");
      setLiveTranslation("");
      if (onCallEnd) {
        onCallEnd({ summary: liveTranslation, timestamp: Date.now() } as any);
      }
    };

    const onTranscript = (transcript: any) => {
      setTranscription(transcript.text);
    };

    const onMessage = (message: any) => {
      if (message.type === "transcript") {
        setTranscription(message.transcript);
      } else if (message.type === "tool-call") {
        if (message.toolCall.name === "triggerEmergency") {
          onEmergency(true);
        }
      }
    };

    const onSpeechStart = () => {
      // User started speaking
    };

    const onSpeechEnd = () => {
      // User stopped speaking
    };

    const onVolumeLevel = (volume: number) => {
      // Volume level for UI feedback
    };

    const onAnalysisComplete = (analysis: any) => {
      // Process analysis results
      if (analysis?.symptoms?.length > 0) {
        const summary = `Symptoms: ${analysis.symptoms.join(", ")}. Priority: ${analysis.priority}`;
        setLiveTranslation(summary);
      }
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", handleCallEnd);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
    };
  }, [vapi, onEmergency, onCallEnd, activeLang]);

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
            
            {/* Language Selection */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '10px', 
              marginBottom: '20px',
              flexWrap: 'wrap'
            }}>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setActiveLang(lang)}
                  style={{
                    padding: '8px 15px',
                    borderRadius: '20px',
                    background: activeLang.id === lang.id ? '#6f42c1' : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: activeLang.id === lang.id ? '2px solid #6f42c1' : '1px solid rgba(255,255,255,0.3)',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {lang.native}
                </button>
              ))}
            </div>
            
            {/* Voice Interface */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                <div className={`${styles.orb} ${callStatus === "active" ? styles.active : ""}`} 
                     style={{ width: '120px', height: '120px', cursor: 'pointer' }}
                     onClick={callStatus === "active" ? stopVoiceCall : startVoiceCall}>
                  {callStatus === "active" ? <Square color="white" size={40} /> : <Mic color="white" size={40} />}
                </div>
                
                {callStatus === "active" && (
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    style={{
                      padding: '10px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.2)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      cursor: 'pointer'
                    }}
                  >
                    {isMuted ? <VolumeX color="white" size={20} /> : <Volume2 color="white" size={20} />}
                  </button>
                )}
              </div>
              
              <div style={{ marginTop: '1rem', color: 'white' }}>
                {callStatus === "inactive" && `Tap to speak in ${activeLang.name}`}
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
              <div className="glass" style={{ marginTop: '1rem', padding: '15px', borderRadius: '15px' }}>
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
