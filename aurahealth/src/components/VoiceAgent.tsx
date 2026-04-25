"use client";

import { useEffect, useState, useCallback } from "react";
import Vapi from "@vapi-ai/web";
import { Mic, Square, AlertCircle, Languages, Globe } from "lucide-react";
import styles from "./VoiceAgent.module.css";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const rawKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
const vapiKey = rawKey || null;
const vapi = rawKey && rawKey !== "your_vapi_public_key" ? new Vapi(rawKey) : null;

const SUPPORTED_LANGUAGES = [
  { id: 'en', name: 'English', native: 'English' },
  { id: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { id: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { id: 'te', name: 'Telugu', native: 'తెలుగు' },
  { id: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { id: 'mr', name: 'Marathi', native: 'मराठी' },
  { id: 'tulu', name: 'Tulu', native: 'ತುಳು (Fallback)' },
];

interface VoiceAgentProps {
  activeProfile: string;
  isIncognito: boolean;
  consentToSave: boolean;
  onEmergency: (active: boolean) => void;
  onCallEnd: (report: any) => void;
}

export default function VoiceAgent({ activeProfile, isIncognito, consentToSave, onEmergency, onCallEnd }: VoiceAgentProps) {
  const [callStatus, setCallStatus] = useState<"inactive" | "loading" | "active">("inactive");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState(SUPPORTED_LANGUAGES[0]);
  const [transcription, setTranscription] = useState("");
  const [liveTranslation, setLiveTranslation] = useState<string>("");

  const handleSpeechResult = useCallback((message: any) => {
    if (message.type === 'transcript' && message.transcriptType === 'partial') {
      setTranscription(message.transcript);
    } else if (message.type === 'transcript' && message.transcriptType === 'final') {
      setTranscription("");
    }
  }, []);

  useEffect(() => {
    if (!vapi) {
      setErrorMsg("Voice features require Vapi API key");
      return;
    }

    vapi.on("call-start", () => {
      setCallStatus("active");
      setErrorMsg(null);
    });

    vapi.on("call-end", () => {
      setCallStatus("inactive");
      setTranscription("");
      setLiveTranslation("");
      onEmergency(false); // Reset emergency on end
    });

    vapi.on("message", handleSpeechResult);

    // Extraction helper for the report
    vapi.on("message", (message: any) => {
      if (message.type === 'call-end-report' || message.type === 'analysis') {
        const analysis = message.analysis || {};
        const report = {
          symptoms: analysis.structuredData?.symptoms || [],
          duration: analysis.structuredData?.duration || "Unknown",
          description: analysis.summary || "Conversation summary unavailable.",
          advice: analysis.structuredData?.advice || "No specific guidance provided.",
          clinic: "Recommended Local Facility",
          priority: analysis.structuredData?.priority || "medium",
          timestamp: new Date().toLocaleTimeString(),
          profile: activeProfile
        };
        onCallEnd(report);

        // Save to memory ONLY if not in incognito mode
        if (!isIncognito && consentToSave) {
          fetch('/api/memory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...report, consentToSave: true })
          });
        }
      }
    });

    vapi.on("error", (error) => {
      console.error("Vapi Error Event:", error);
      const detail = error && typeof error === 'object' ? JSON.stringify(error) : String(error);
      setErrorMsg(`Connection Error: ${detail}`);
      setCallStatus("inactive");
    });

    return () => {
      vapi.removeAllListeners();
    };
  }, [handleSpeechResult, activeProfile, onEmergency, onCallEnd]);

  const toggleCall = async () => {
    setErrorMsg(null);
    
    if (!vapi) {
      setErrorMsg("Voice features require Vapi API key in .env.local");
      return;
    }

    if (callStatus === "active") {
      vapi.stop();
    } else {
      setCallStatus("loading");
      try {
        // Fetch Memory
        const memRes = await fetch(`/api/memory?profile=${activeProfile}`);
        const { history } = await memRes.json();
        const historyContext = history.length > 0
          ? `Last consultations for ${activeProfile}: ${history.map((h: any) => h.payload.summary).join('; ')}`
          : "No previous history for this patient.";

        // Map our UI languages
        const vapiLanguageMap: Record<string, string> = {
          en: "en-IN",
          hi: "hi",
          kn: "multi",
          te: "multi",
          ta: "multi",
          mr: "multi",
          tulu: "multi"
        };

        const vapiLanguage = vapiLanguageMap[activeLang.id] || "multi";

        await vapi.start({
          transcriber: {
            provider: "deepgram",
            model: "nova-2",
            language: vapiLanguage as any,
          },
          voice: {
            provider: "11labs",
            voiceId: "pNInz6obpg8nbNo719AF",
            model: "eleven_multilingual_v2",
          },
          analysisPlan: {
            // Vapi SDK typings expect structuredDataPlan, not structuredDataSchema
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
                2. MEMORY: ${isIncognito ? "INCOGNITO MODE ACTIVE. Do not reference past history and do not attempt to save new entries." : historyContext}. Use this to provide context (e.g., "I see you've had a similar cough before"). Do NOT save new memory unless user consent is confirmed (UI consent controls this).
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
        });
      } catch (e: any) {
        setErrorMsg(e.message || "Failed to initiate call.");
        setCallStatus("inactive");
      }
    }
  };

  // Handle server-side tool calls
  useEffect(() => {
    if (!vapi) return;
    
    const handleCallMessage = async (message: any) => {
      if (message.type === "tool-call") {
        const toolName = message.toolCall.function.name;
        
        if (toolName === "getLocation") {
          navigator.geolocation.getCurrentPosition((pos) => {
            (vapi as any)?.send({ type: "tool-call-result", toolCallId: message.toolCall.id, result: `User at: ${pos.coords.latitude}, ${pos.coords.longitude}` });
          });
        }
        
        if (toolName === "triggerEmergency") {
          onEmergency(true);
          (vapi as any)?.send({ type: "tool-call-result", toolCallId: message.toolCall.id, result: "Emergency UI triggered successfully." });
        }

        if (toolName === "medicalVault") {
          try {
            const args = JSON.parse(message.toolCall.function.arguments || "{}");
            const query = args.query || "";
            const user_id = args.user_id || activeProfile;
            const r = await fetch(`${backendUrl}/vapi/tools/medicalvault`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                query,
                user_id,
                message: { toolCalls: [{ id: message.toolCall.id, function: { arguments: JSON.stringify({ query, user_id }) } }] }
              })
            });
            const data = await r.json();
            const resultText = data?.results?.[0]?.result || "No verified info returned.";
            setLiveTranslation(resultText);
            (vapi as any)?.send({ type: "tool-call-result", toolCallId: message.toolCall.id, result: resultText });
          } catch (e: any) {
            (vapi as any)?.send({ type: "tool-call-result", toolCallId: message.toolCall.id, result: "I could not access the medical vault right now." });
          }
        }
      }
    };

    vapi.on("message", handleCallMessage);
    return () => { vapi?.off("message", handleCallMessage); };
  }, [onEmergency, activeProfile]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', width: '100%' }}>
      {/* Language Toggle Bar */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600' }}>
          Select Preferred Language
        </p>
        <div className="glass" style={{ display: 'flex', gap: '0.4rem', padding: '0.4rem', flexWrap: 'wrap', justifyContent: 'center', borderRadius: '3rem' }}>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setActiveLang(lang)}
              className={`language-pill ${activeLang.id === lang.id ? 'active' : ''}`}
            >
              {lang.native}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.container} style={{ padding: 0, minHeight: 'auto' }}>
        <div className={styles.orbContainer} onClick={toggleCall} role="button" aria-label="Toggle Voice AI" style={{ width: '180px', height: '180px' }}>
          <div className={`${styles.orb} ${callStatus === "active" ? styles.active : ""}`} style={{ width: '100px', height: '100px' }}>
            {callStatus === "active" ? <Square color="white" size={32} /> : <Mic color="white" size={32} />}
          </div>
          <div className={styles.ring}></div>
        </div>
        
        <div className={styles.statusText} style={{ marginTop: '1rem' }}>
          {callStatus === "inactive" && `Tap to speak in ${activeLang.name}`}
          {callStatus === "loading" && "Connecting..."}
          {callStatus === "active" && "Listening..."}
        </div>

        {transcription && (
          <p style={{ marginTop: '1rem', color: 'var(--primary-light)', fontStyle: 'italic', fontSize: '0.9rem', textAlign: 'center', maxWidth: '400px' }}>
            "{transcription}"
          </p>
        )}

        {liveTranslation && (
          <div className="glass" style={{ marginTop: '1rem', padding: '0.85rem 1rem', borderRadius: '1rem', maxWidth: '520px' }}>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
              Live Translation / Verified Vault Feed
            </p>
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.9rem", color: "rgba(255,255,255,0.9)", lineHeight: 1.5 }}>
              {liveTranslation}
            </p>
          </div>
        )}

        {errorMsg && (
          <div style={{ marginTop: '1rem', color: '#ff6b6b', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <AlertCircle size={16} />
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
}
