"use client";

import { useState } from "react";

interface SimpleChatAgentProps {
  activeProfile: string;
  isIncognito: boolean;
  consentToSave: boolean;
  onEmergency: (active: boolean) => void;
  onCallEnd: (report: any) => void;
}

export default function SimpleChatAgent({ activeProfile, isIncognito, consentToSave }: SimpleChatAgentProps) {
  const [message, setMessage] = useState("");
  const [responses, setResponses] = useState<Array<{query: string, response: string, domain: string, emergency?: any}>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;
    
    setIsLoading(true);
    const userMessage = message;
    setMessage("");
    
    try {
      const response = await fetch('http://localhost:8000/v1/router', {
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
        emergency: result.emergency
      }]);
      
      if (result.emergency) {
        onEmergency(true);
      }
      
    } catch (error) {
      setResponses(prev => [...prev, {
        query: userMessage,
        response: "Sorry, I'm having trouble connecting. Please try again.",
        domain: "ERROR"
      }]);
    }
    
    setIsLoading(false);
  };

  const getDomainColor = (domain: string) => {
    switch(domain) {
      case 'EMERGENCY': return '#dc3545';
      case 'AYURVEDA': return '#28a745';
      case 'NUTRITION': return '#ffc107';
      default: return '#007bff';
    }
  };

  const getDomainIcon = (domain: string) => {
    switch(domain) {
      case 'EMERGENCY': return '🚨';
      case 'AYURVEDA': return '🌿';
      case 'NUTRITION': return '🥗';
      default: return '💊';
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        borderRadius: '20px', 
        padding: '30px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <h3 style={{ 
          textAlign: 'center', 
          marginBottom: '20px', 
          color: 'white',
          fontSize: '1.5rem'
        }}>
          💬 Medical Assistant - Type Your Questions
        </h3>
        
        {/* Quick Test Buttons */}
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
            Headache Test
          </button>
          <button 
            onClick={() => setMessage("I have a headache again")}
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
            Different Response
          </button>
          <button 
            onClick={() => setMessage("I'm having severe chest pain")}
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
            Emergency Test
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
            Ayurveda Test
          </button>
          <button 
            onClick={() => setMessage("Nutrition advice for my child")}
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
            Nutrition Test
          </button>
        </div>
        
        {/* Input Area */}
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
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
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
        
        {/* Responses */}
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
                <strong style={{ color: 'white' }}>You:</strong> {item.query}
              </div>
              
              {/* Bot Response */}
              <div style={{ 
                background: `rgba(${item.domain === 'EMERGENCY' ? '220,53,69' : item.domain === 'AYURVEDA' ? '40,167,69' : item.domain === 'NUTRITION' ? '255,193,7' : '0,123,255'},0.2)`, 
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
        
        {responses.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            color: 'rgba(255,255,255,0.6)',
            padding: '40px'
          }}>
            <p>👋 Hi {activeProfile}! Try asking about:</p>
            <p style={{ fontSize: '14px', marginTop: '10px' }}>
              • Headache, fever, cough<br/>
              • Ayurvedic remedies<br/>
              • Nutrition advice<br/>
              • Emergency symptoms
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
