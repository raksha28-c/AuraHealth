"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, VolumeX, Eye, EyeOff, Type, AlertCircle, Settings, Phone, Heart } from "lucide-react";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export default function AccessibilityTypingConsultation() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{
    id: number;
    sender: "user" | "assistant";
    text: string;
    time: string;
    isEmergency?: boolean;
  }>>([]);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [fontSize, setFontSize] = useState("medium");
  const [highContrast, setHighContrast] = useState(false);
  const [userConsent, setUserConsent] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickResponses = [
    "I have chest pain and need help",
    "I can't breathe properly",
    "I have a severe headache",
    "I feel dizzy",
    "I need to schedule an appointment",
    "I have a question about my medication",
    "I need a prescription refill"
  ];

  const emergencyKeywords = ["chest pain", "can't breathe", "emergency", "help immediately", "severe pain", "dying", "unconscious"];

  const speakText = (text: string) => {
    if ('speechSynthesis' in window && autoSpeak) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const detectEmergency = (text: string) => {
    const lowerText = text.toLowerCase();
    return emergencyKeywords.some(keyword => lowerText.includes(keyword));
  };

  const handleVoiceInput = () => {
    startVoiceRecognition();
  };

  const handleSendMessage = async () => {
    if (message.trim()) {
      const isEmergencyMessage = detectEmergency(message);
      const userMessage = {
        id: messages.length + 1,
        sender: "user" as const,
        text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEmergency: isEmergencyMessage
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      if (autoSpeak) {
        speakText(message);
      }
      
      // Get AI response
      try {
        const response = await fetch(`${backendUrl}/v1/router`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: 'accessibility_user',
            transcript: message,
            consent_to_save: userConsent
          })
        });
        
        const data = await response.json();
        
        const assistantMessage = {
          id: messages.length + 2,
          sender: "assistant" as const,
          text: data.answer_text || "I understand your concern. Let me help you with that.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isEmergency: data.emergency ? true : false
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        if (autoSpeak) {
          speakText(assistantMessage.text);
        }
        
        // Emergency handling
        if (data.emergency) {
          setTimeout(() => {
            speakText("This appears to be an emergency. Please call emergency services immediately or go to the nearest hospital.");
          }, 2000);
        }
        
      } catch (error) {
        const errorMessage = {
          id: messages.length + 2,
          sender: "assistant" as const,
          text: "I'm having trouble connecting right now. Please try again or call emergency services if this is urgent.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, errorMessage]);
        
        if (autoSpeak) {
          speakText(errorMessage.text);
        }
      }
      
      setMessage("");
    }
  };

  const startVoiceRecognition = () => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    } else {
      alert("Voice recognition is not supported in your browser. Please use the typing interface.");
    }
  };

  const stopVoiceRecognition = () => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      // Note: Stopping recognition requires keeping the recognition instance reference
      setIsListening(false);
    }
  };

  const handleQuickResponse = (response: string) => {
    setMessage(response);
    if (autoSpeak) {
      speakText(response);
    }
  };

  const getTheme = () => {
    if (highContrast) {
      return {
        background: '#000000',
        color: '#FFFFFF',
        cardBg: '#1a1a1a',
        border: '#FFFFFF',
        buttonBg: '#FFFFFF',
        buttonColor: '#000000'
      };
    }
    return {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#FFFFFF',
      cardBg: 'rgba(255,255,255,0.1)',
      border: 'rgba(255,255,255,0.2)',
      buttonBg: 'rgba(255,255,255,0.2)',
      buttonColor: '#FFFFFF'
    };
  };

  const getFontSize = () => {
    switch(fontSize) {
      case 'small': return '14px';
      case 'medium': return '16px';
      case 'large': return '20px';
      case 'xlarge': return '24px';
      default: return '16px';
    }
  };

  const theme = getTheme();
  const currentFontSize = getFontSize();

  useEffect(() => {
    if (messagesEndRef.current) {
      (messagesEndRef.current as any).scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '1200px', 
      margin: '0 auto',
      background: theme.background,
      color: theme.color,
      height: '100vh',
      paddingBottom: '100px',
      overflowY: 'scroll',
      overflowX: 'hidden',
      scrollBehavior: 'smooth'
    }}>
      {/* Accessibility Header */}
      <div style={{
        background: theme.cardBg,
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
        border: `2px solid ${theme.border}`,
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.8rem', fontWeight: '800' }}>
          ♿ Accessibility-Enabled Medical Assistant
        </h2>
        <p style={{ marginBottom: '1.5rem', fontSize: currentFontSize }}>
          Voice-enabled medical consultation with emergency detection and accessibility features
        </p>
        
        {/* Accessibility Controls */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            style={{
              padding: '0.8rem',
              background: autoSpeak ? theme.buttonBg : 'rgba(255,255,255,0.1)',
              color: autoSpeak ? theme.buttonColor : theme.color,
              border: `2px solid ${theme.border}`,
              borderRadius: '12px',
              fontSize: currentFontSize,
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {autoSpeak ? <Volume2 size={20} /> : <VolumeX size={20} />}
            {autoSpeak ? 'Auto-Speak ON' : 'Auto-Speak OFF'}
          </button>
          
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            style={{
              padding: '0.8rem',
              background: theme.cardBg,
              color: theme.color,
              border: `2px solid ${theme.border}`,
              borderRadius: '12px',
              fontSize: currentFontSize,
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <option value="small">Small Font</option>
            <option value="medium">Medium Font</option>
            <option value="large">Large Font</option>
            <option value="xlarge">Extra Large Font</option>
          </select>
          
          <button
            onClick={() => setHighContrast(!highContrast)}
            style={{
              padding: '0.8rem',
              background: highContrast ? theme.buttonBg : 'rgba(255,255,255,0.1)',
              color: highContrast ? theme.buttonColor : theme.color,
              border: `2px solid ${theme.border}`,
              borderRadius: '12px',
              fontSize: currentFontSize,
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {highContrast ? <Eye size={20} /> : <EyeOff size={20} />}
            {highContrast ? 'High Contrast ON' : 'High Contrast OFF'}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        background: theme.cardBg,
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
        border: `2px solid ${theme.border}`,
        height: '400px',
        overflowY: 'auto'
      }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', fontSize: currentFontSize }}>
            <Heart size={48} style={{ marginBottom: '1rem', opacity: 0.7 }} />
            <p>I'm here to help you with your health concerns. You can type or speak to me.</p>
            <p style={{ marginTop: '0.5rem', opacity: 0.7 }}>If this is an emergency, please call emergency services immediately.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              borderRadius: '12px',
              background: msg.sender === 'user' 
                ? 'rgba(34, 197, 94, 0.2)' 
                : msg.isEmergency 
                  ? 'rgba(239, 68, 68, 0.3)' 
                  : 'rgba(59, 130, 246, 0.2)',
              border: msg.isEmergency ? '2px solid #ef4444' : `1px solid ${theme.border}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '700', fontSize: currentFontSize }}>
                  {msg.sender === 'user' ? 'You' : 'Assistant'}
                </span>
                <span style={{ fontSize: currentFontSize, opacity: 0.7 }}>{msg.time}</span>
              </div>
              <p style={{ fontSize: currentFontSize, margin: 0 }}>
                {msg.text}
              </p>
              {msg.isEmergency && (
                <div style={{ 
                  marginTop: '0.5rem', 
                  padding: '0.5rem', 
                  background: 'rgba(239, 68, 68, 0.2)', 
                  borderRadius: '8px',
                  fontSize: currentFontSize
                }}>
                  <AlertCircle size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                  Emergency detected - Please seek immediate medical help
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Emergency Responses */}
      <div style={{
        background: theme.cardBg,
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
        border: `2px solid ${theme.border}`
      }}>
        <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '700', color: '#ef4444' }}>
          🚨 Quick Emergency Responses
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.8rem' }}>
          {quickResponses.filter(r => emergencyKeywords.some(kw => r.toLowerCase().includes(kw))).map((emergencyMsg) => (
            <button
              key={emergencyMsg}
              onClick={() => handleQuickResponse(emergencyMsg)}
              style={{
                padding: '0.8rem',
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                border: '2px solid #ef4444',
                borderRadius: '12px',
                fontSize: currentFontSize,
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <Phone size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
              {emergencyMsg}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Common Responses */}
      <div style={{
        background: theme.cardBg,
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '2rem',
        border: `2px solid ${theme.border}`
      }}>
        <h4 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '700' }}>
          💬 Quick Responses
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem' }}>
          {quickResponses.filter(r => !emergencyKeywords.some(kw => r.toLowerCase().includes(kw))).map((quickMsg) => (
            <button
              key={quickMsg}
              onClick={() => handleQuickResponse(quickMsg)}
              style={{
                padding: '0.8rem',
                background: theme.buttonBg,
                color: theme.buttonColor,
                border: `2px solid ${theme.border}`,
                borderRadius: '12px',
                fontSize: currentFontSize,
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {quickMsg}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div style={{
        background: theme.cardBg,
        borderRadius: '16px',
        padding: '1.5rem',
        border: `2px solid ${theme.border}`
      }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder="Type your message or use voice input..."
            style={{
              flex: 1,
              padding: '1rem',
              background: theme.background,
              color: theme.color,
              border: `2px solid ${theme.border}`,
              borderRadius: '12px',
              fontSize: currentFontSize,
              outline: 'none'
            }}
          />
          
          <button
            onClick={isListening ? stopVoiceRecognition : handleVoiceInput}
            disabled={isListening}
            style={{
              padding: '1rem',
              background: isListening ? 'rgba(239, 68, 68, 0.8)' : 'rgba(34, 197, 94, 0.8)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: currentFontSize,
              fontWeight: '700',
              cursor: isListening ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              minWidth: '120px'
            }}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            {isListening ? 'Stop' : 'Voice'}
          </button>
          
          <button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            style={{
              padding: '1rem',
              background: message.trim() ? 'rgba(59, 130, 246, 0.8)' : 'rgba(156, 163, 175, 0.5)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: currentFontSize,
              fontWeight: '700',
              cursor: message.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              minWidth: '100px'
            }}
          >
            <Type size={20} />
            Send
          </button>
        </div>
        
        <div style={{ fontSize: currentFontSize, opacity: 0.7, textAlign: 'center' }}>
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button
          onClick={handleVoiceInput}
          disabled={isListening}
          style={{
            padding: '1rem',
            background: isListening ? 'rgba(239, 68, 68, 0.8)' : 'rgba(34, 197, 94, 0.8)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: currentFontSize,
            fontWeight: '700',
            cursor: isListening ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          {isListening ? <MicOff size={24} /> : <Mic size={24} />}
          {isListening ? 'Listening... Click to stop' : 'Click to start voice input'}
        </button>
        
        <div style={{ fontSize: currentFontSize, opacity: 0.7, textAlign: 'center' }}>
          Voice recognition available in Chrome, Edge, and Safari
        </div>
      </div>
    </div>
  );
}
