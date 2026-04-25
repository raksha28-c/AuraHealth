"use client";

import { useState } from "react";
import { Heart, Stethoscope, Calendar, Clock, Phone, Mail, Star, Users, Award, TrendingUp, Shield, Activity, Droplets, Brain, Eye, Video, Monitor, Smartphone, Zap } from "lucide-react";
import DoctorBooking from "./DoctorBooking";
import WorkingAgent from "./WorkingAgent";
import EnhancedWorkingAgent from "./EnhancedWorkingAgent";
import EmergencySystem from "./EmergencySystem";
import TypingConsultation from "./TypingConsultation";
import AccessibilityTypingConsultation from "./AccessibilityTypingConsultation";
import MedicalDomains from "./MedicalDomains";

export default function BeautifulHomePage() {
  const [activeTab, setActiveTab] = useState("home");
  const [userConsent, setUserConsent] = useState(true);
  const [dataPrivacy, setDataPrivacy] = useState("enhanced");

  const medicalHistory = [
    { date: "2024-01-15", type: "Consultation", doctor: "Dr. Sarah Johnson", diagnosis: "Seasonal Allergies", prescription: "Antihistamines" },
    { date: "2024-02-20", type: "Lab Test", doctor: "Dr. Michael Chen", diagnosis: "Vitamin D Deficiency", prescription: "Vitamin D3 Supplements" },
    { date: "2024-03-10", type: "Emergency", doctor: "Dr. Emily Davis", diagnosis: "Food Poisoning", prescription: "IV Fluids & Medication" },
    { date: "2024-04-05", type: "Follow-up", doctor: "Dr. Sarah Johnson", diagnosis: "Allergies Under Control", prescription: "Continue Antihistamines" }
  ];

  const features = [
    {
      icon: <Stethoscope size={48} />,
      title: "🧠 AI-Powered Diagnosis",
      description: "Advanced AI analysis of symptoms with 95% accuracy and instant specialist matching",
      color: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%)",
      bgColor: "rgba(59, 130, 246, 0.1)"
    },
    {
      icon: <Calendar size={48} />,
      title: "📅 Smart Booking",
      description: "Intelligent appointment scheduling with real-time doctor availability and AI recommendations",
      color: "linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)",
      bgColor: "rgba(16, 185, 129, 0.1)"
    },
    {
      icon: <Phone size={48} />,
      title: "📹 Video Consultations",
      description: "HD video calls with screen sharing and prescription generation",
      color: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)",
      bgColor: "rgba(139, 92, 246, 0.1)"
    },
    {
      icon: <Shield size={48} />,
      title: "🔒 Blockchain Security",
      description: "Military-grade encryption with blockchain-protected medical records",
      color: "linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)",
      bgColor: "rgba(239, 68, 68, 0.1)"
    },
    {
      icon: <Activity size={48} />,
      title: "📊 Real-Time Monitoring",
      description: "Wearable integration with continuous vitals tracking and AI health alerts",
      color: "linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)",
      bgColor: "rgba(99, 102, 241, 0.1)"
    },
    {
      icon: <Award size={48} />,
      title: "🏆 Premium Rewards",
      description: "Exclusive health benefits, insurance partnerships, and loyalty rewards program",
      color: "linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)",
      bgColor: "rgba(245, 158, 11, 0.1)"
    }
  ];

  const stats = [
    { number: "1000+", label: "Expert Doctors", icon: <Users size={24} /> },
    { number: "100K+", label: "Happy Patients", icon: <Heart size={24} /> },
    { number: "99.9%", label: "Success Rate", icon: <TrendingUp size={24} /> },
    { number: "24/7", label: "AI Support", icon: <Clock size={24} /> },
    { number: "50+", label: "Countries", icon: <Shield size={24} /> }
  ];

  const specialties = [
    { name: "AI Diagnosis", icon: "🤖", count: 250 },
    { name: "Telemedicine", icon: "💻", count: 180 },
    { name: "General Physician", icon: "🩺", count: 120 },
    { name: "Cardiologist", icon: "❤️", count: 45 },
    { name: "Neurosurgeon", icon: "🧠", count: 28 },
    { name: "Pediatrician", icon: "👶", count: 67 },
    { name: "Dermatologist", icon: "🌿", count: 29 },
    { name: "Orthopedic", icon: "🦴", count: 52 },
    { name: "Gynecologist", icon: "👩‍⚕️", count: 38 },
    { name: "Psychiatrist", icon: "🧠", count: 41 }
  ];

  const healthTips = [
    { icon: <Droplets size={20} />, tip: "Drink 8 glasses of water daily" },
    { icon: <Activity size={20} />, tip: "Exercise for 30 minutes every day" },
    { icon: <Brain size={20} />, tip: "Practice meditation for mental health" },
    { icon: <Eye size={20} />, tip: "Take regular screen breaks" },
    { icon: <Shield size={20} />, tip: "Get annual health checkups" },
    { icon: <Award size={20} />, tip: "Maintain vaccination schedule" },
    { icon: <TrendingUp size={20} />, tip: "Track health metrics with AI insights" }
  ];

  if (activeTab === "booking") {
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setActiveTab("home")}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            padding: '0.8rem 1.5rem',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            fontSize: '1rem',
            fontWeight: '700',
            cursor: 'pointer',
            zIndex: 1000,
            boxShadow: '0 8px 32px rgba(14, 165, 233, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ← Back to Home
        </button>
        <DoctorBooking />
      </div>
    );
  }

  if (activeTab === "ai") {
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setActiveTab("home")}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            padding: '0.8rem 1.5rem',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            fontSize: '1rem',
            fontWeight: '700',
            cursor: 'pointer',
            zIndex: 1000,
            boxShadow: '0 8px 32px rgba(14, 165, 233, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ← Back to Home
        </button>
        <EnhancedWorkingAgent activeProfile="default" isIncognito={false} consentToSave={userConsent} onEmergency={() => {}} onCallEnd={() => {}} />
      </div>
    );
  }

  if (activeTab === "emergency") {
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setActiveTab("home")}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            padding: '0.8rem 1.5rem',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            fontSize: '1rem',
            fontWeight: '700',
            cursor: 'pointer',
            zIndex: 1000,
            boxShadow: '0 8px 32px rgba(14, 165, 233, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ← Back to Home
        </button>
        <EmergencySystem />
      </div>
    );
  }

  if (activeTab === "typing") {
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setActiveTab("home")}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            padding: '0.8rem 1.5rem',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            fontSize: '1rem',
            fontWeight: '700',
            cursor: 'pointer',
            zIndex: 1000,
            boxShadow: '0 8px 32px rgba(14, 165, 233, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ← Back to Home
        </button>
        <TypingConsultation />
      </div>
    );
  }

  if (activeTab === "domains") {
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setActiveTab("home")}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            padding: '0.8rem 1.5rem',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            fontSize: '1rem',
            fontWeight: '700',
            cursor: 'pointer',
            zIndex: 1000,
            boxShadow: '0 8px 32px rgba(14, 165, 233, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ← Back to Home
        </button>
        <MedicalDomains />
      </div>
    );
  }

  if (activeTab === "accessibility") {
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setActiveTab("home")}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            padding: '0.8rem 1.5rem',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            fontSize: '1rem',
            fontWeight: '700',
            cursor: 'pointer',
            zIndex: 1000,
            boxShadow: '0 8px 32px rgba(14, 165, 233, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ← Back to Home
        </button>
        <AccessibilityTypingConsultation />
      </div>
    );
  }

  if (activeTab === "monitoring") {
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setActiveTab("home")}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            padding: '0.8rem 1.5rem',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            fontSize: '1rem',
            fontWeight: '700',
            cursor: 'pointer',
            zIndex: 1000,
            boxShadow: '0 8px 32px rgba(14, 165, 233, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ← Back to Home
        </button>
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', height: '100vh', overflowY: 'scroll', overflowX: 'hidden', scrollBehavior: 'smooth' }}>
          <h2 style={{ color: 'white', fontSize: '2rem', marginBottom: '2rem' }}>
            📊 Real-Time Health Monitoring
          </h2>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '2rem',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
              <div style={{
                background: 'rgba(99, 102, 241, 0.1)',
                padding: '1.5rem',
                borderRadius: '15px',
                textAlign: 'center'
              }}>
                <h3 style={{ color: 'white', marginBottom: '1rem' }}>Heart Rate</h3>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#ef4444' }}>72</div>
                <p style={{ color: 'rgba(255,255,255,0.8)' }}>BPM - Normal</p>
              </div>
              <div style={{
                background: 'rgba(34, 197, 94, 0.1)',
                padding: '1.5rem',
                borderRadius: '15px',
                textAlign: 'center'
              }}>
                <h3 style={{ color: 'white', marginBottom: '1rem' }}>Blood Pressure</h3>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#22c55e' }}>120/80</div>
                <p style={{ color: 'rgba(255,255,255,0.8)' }}>mmHg - Optimal</p>
              </div>
              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                padding: '1.5rem',
                borderRadius: '15px',
                textAlign: 'center'
              }}>
                <h3 style={{ color: 'white', marginBottom: '1rem' }}>Oxygen Level</h3>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#f59e0b' }}>98%</div>
                <p style={{ color: 'rgba(255,255,255,0.8)' }}>SpO2 - Excellent</p>
              </div>
              <div style={{
                background: 'rgba(168, 85, 247, 0.1)',
                padding: '1.5rem',
                borderRadius: '15px',
                textAlign: 'center'
              }}>
                <h3 style={{ color: 'white', marginBottom: '1rem' }}>Sleep Quality</h3>
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#a855f7' }}>85%</div>
                <p style={{ color: 'rgba(255,255,255,0.8)' }}>REM Sleep - Good</p>
              </div>
            </div>
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button style={{
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
              }}>
                📱 Connect Wearable Device
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "history") {
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setActiveTab("home")}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            padding: '0.8rem 1.5rem',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            fontSize: '1rem',
            fontWeight: '700',
            cursor: 'pointer',
            zIndex: 1000,
            boxShadow: '0 8px 32px rgba(14, 165, 233, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ← Back to Home
        </button>
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', height: '100vh', overflowY: 'scroll', overflowX: 'hidden', scrollBehavior: 'smooth' }}>
          <h2 style={{ color: 'white', fontSize: '2rem', marginBottom: '2rem' }}>
            📋 Medical History & Records
          </h2>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '2rem',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {medicalHistory.map((record, index) => (
                <div key={index} style={{
                  background: 'rgba(255,255,255,0.95)',
                  borderRadius: '15px',
                  padding: '1.5rem',
                  border: '1px solid rgba(255,255,255,0.2)',
                  transition: 'transform 0.3s ease'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ 
                      background: record.type === "Emergency" ? 'rgba(239, 68, 68, 0.2)' : 
                                 record.type === "Lab Test" ? 'rgba(245, 158, 11, 0.2)' : 
                                 'rgba(34, 197, 94, 0.2)',
                      color: record.type === "Emergency" ? '#ef4444' : 
                             record.type === "Lab Test" ? '#f59e0b' : 
                             '#22c55e',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}>
                      {record.type}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                      {record.date}
                    </span>
                  </div>
                  <h3 style={{ color: '#1f2937', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                    {record.doctor}
                  </h3>
                  <p style={{ color: '#374151', marginBottom: '0.5rem', fontWeight: '500' }}>
                    <strong>Diagnosis:</strong> {record.diagnosis}
                  </p>
                  <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                    <strong>Prescription:</strong> {record.prescription}
                  </p>
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button style={{
                      padding: '0.4rem 0.8rem',
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}>
                      📄 Download Report
                    </button>
                    <button style={{
                      padding: '0.4rem 0.8rem',
                      background: 'rgba(34, 197, 94, 0.1)',
                      color: '#22c55e',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}>
                      📧 Share with Doctor
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button style={{
                padding: '1rem 2rem',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
              }}>
                📤 Export Full Medical History
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      height: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)', 
      overflowY: 'scroll',
      overflowX: 'hidden',
      scrollBehavior: 'smooth'
    }}>
      {/* Privacy Header */}
      <div style={{
        background: 'linear-gradient(90deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)',
        padding: '1.2rem 2rem',
        borderBottom: '2px solid #0ea5e9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 8px 32px rgba(14, 165, 233, 0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Shield size={22} style={{ color: 'white' }} />
          <span style={{ color: 'white', fontSize: '0.95rem', fontWeight: '600' }}>
            Data Privacy: {dataPrivacy === "enhanced" ? "Enhanced Protection" : "Basic"}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <button
            onClick={() => setDataPrivacy(dataPrivacy === "enhanced" ? "basic" : "enhanced")}
            style={{
              padding: '0.5rem 1.2rem',
              background: dataPrivacy === "enhanced" ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)',
              border: dataPrivacy === "enhanced" ? '1px solid rgba(34, 197, 94, 0.6)' : '1px solid rgba(239, 68, 68, 0.6)',
              color: dataPrivacy === "enhanced" ? '#16a34a' : '#dc2626',
              borderRadius: '30px',
              fontSize: '0.9rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            {dataPrivacy === "enhanced" ? "🔒 Enhanced" : "🔓 Basic"}
          </button>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'white', fontSize: '0.95rem', cursor: 'pointer', fontWeight: '600' }}>
            <input
              type="checkbox"
              checked={userConsent}
              onChange={(e) => setUserConsent(e.target.checked)}
              style={{ width: '16px', height: '16px' }}
            />
            I consent to data processing
          </label>
        </div>
      </div>

      {/* Navigation Bar */}
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        padding: '1rem 2rem',
        borderBottom: '1px solid rgba(14, 165, 233, 0.3)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '15px',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(14, 165, 233, 0.4)',
              border: '2px solid rgba(14, 165, 233, 0.3)',
              animation: 'pulse 2s infinite'
            }}>
              <Heart size={28} style={{ color: 'white' }} />
            </div>
            <span style={{ fontSize: '2.2rem', fontWeight: '900', color: '#f8fafc', letterSpacing: '-1px', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>AuraHealth</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.8)', padding: '0.6rem', borderRadius: '20px', border: '1px solid rgba(14, 165, 233, 0.3)' }}>
            {[
              { id: "home", label: "Home", icon: "🏠" },
              { id: "domains", label: "Domains", icon: "🏥" },
              { id: "booking", label: "Booking", icon: "📅" },
              { id: "ai", label: "AI", icon: "🤖" },
              { id: "typing", label: "Typing", icon: "💬" },
              { id: "accessibility", label: "♿ Access", icon: "♿" },
              { id: "emergency", label: "Emergency", icon: "🚨" },
              { id: "monitoring", label: "Monitor", icon: "📊" },
              { id: "history", label: "History", icon: "📋" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.8rem 1.2rem',
                  background: activeTab === tab.id 
                    ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' 
                    : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#94a3b8',
                  border: activeTab === tab.id 
                    ? '2px solid #0ea5e9' 
                    : '1px solid rgba(14, 165, 233, 0.2)',
                  borderRadius: '15px',
                  fontSize: '0.9rem',
                  fontWeight: activeTab === tab.id ? '700' : '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: activeTab === tab.id 
                    ? '0 4px 16px rgba(14, 165, 233, 0.3)' 
                    : 'none',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                <span style={{ marginRight: '0.5rem' }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div style={{
        padding: '4rem 2rem',
        margin: '0 2rem 3rem 2rem',
        borderRadius: '32px',
        border: '1px solid rgba(14, 165, 233, 0.3)',
        background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(2, 132, 199, 0.1) 100%)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '300px',
          height: '300px',
          background: 'rgba(14, 165, 233, 0.1)',
          borderRadius: '50%',
          filter: 'blur(40px)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-150px',
          left: '-100px',
          width: '400px',
          height: '400px',
          background: 'rgba(2, 132, 199, 0.1)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          right: '10%',
          width: '250px',
          height: '250px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '50%',
          filter: 'blur(30px)'
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.2)',
            padding: '0.5rem 1.5rem',
            borderRadius: '30px',
            marginBottom: '2rem',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}>
            <span style={{ color: 'white', fontSize: '0.9rem', fontWeight: '600' }}>🏆 Trusted by 100K+ Patients</span>
          </div>
          <h1 style={{
            fontSize: '4rem',
            fontWeight: '900',
            color: 'white',
            marginBottom: '1.5rem',
            lineHeight: '1.1',
            textShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            Your Health,<br />Our Priority
          </h1>
          <p style={{
            fontSize: '1.4rem',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '3rem',
            maxWidth: '600px',
            margin: '0 auto 3rem auto',
            lineHeight: '1.6',
            fontWeight: '400'
          }}>
            Experience world-class healthcare with our comprehensive medical services. From expert consultations to AI-powered health assistance.
          </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab("booking")}
            style={{
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '50px',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            📅 Book Appointment
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            style={{
              padding: '1rem 2rem',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '50px',
              fontSize: '1.1rem',
              fontWeight: '700',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease'
            }}
          >
            🤖 Try AI Assistant
          </button>
        </div>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        padding: '3rem 2rem',
        margin: '0 2rem 3rem 2rem',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', color: 'white', fontSize: '2rem', marginBottom: '2rem' }}>
            Trusted by Thousands
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '2rem' 
          }}>
            {stats.map((stat, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ color: 'white' }}>{stat.icon}</div>
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white' }}>
                  {stat.number}
                </div>
                <div style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ padding: '0 2rem 3rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', color: 'white', fontSize: '2.5rem', marginBottom: '1rem', fontWeight: '900' }}>
          🌟 Why Choose AuraHealth?
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem', marginBottom: '3rem', maxWidth: '800px', margin: '0 auto 3rem auto' }}>
          Experience the future of healthcare with our award-winning platform designed for your health and convenience
        </p>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
          gap: '2rem' 
        }}>
          {features.map((feature, index) => (
            <div key={index} style={{
              background: feature.bgColor,
              borderRadius: '24px',
              padding: '2.5rem',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              backdropFilter: 'blur(10px)',
              border: `2px solid ${feature.color}`,
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 30px 60px rgba(0,0,0,0.25)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)';
            }}
            >
              <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                height: '6px',
                background: feature.color
              }} />
              <div style={{
                background: feature.color,
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 2rem auto',
                color: 'white',
                boxShadow: '0 15px 30px rgba(0,0,0,0.3)',
                border: '3px solid rgba(255,255,255,0.2)'
              }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#1f2937', marginBottom: '1rem' }}>
                {feature.title}
              </h3>
              <p style={{ color: '#374151', lineHeight: '1.7', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
                {feature.description}
              </p>
              <button style={{
                marginTop: '1.5rem',
                padding: '1rem 2rem',
                background: feature.color,
                color: 'white',
                border: 'none',
                borderRadius: '30px',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
              }}
              >
                Explore Feature
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Specialties Section */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        padding: '3rem 2rem',
        margin: '0 2rem 3rem 2rem',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', color: 'white', fontSize: '2rem', marginBottom: '3rem' }}>
            🏥 Medical Specialties
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {specialties.map((specialty, index) => (
              <div key={index} style={{
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '15px',
                padding: '1.5rem',
                textAlign: 'center',
                transition: 'transform 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{specialty.icon}</div>
                <h3 style={{ color: '#1f2937', fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  {specialty.name}
                </h3>
                <p style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                  {specialty.count} doctors
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Health Tips Section */}
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        padding: '3rem 2rem',
        margin: '0 2rem 3rem 2rem',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', color: 'white', fontSize: '2rem', marginBottom: '3rem' }}>
            💡 Daily Health Tips
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '2rem' 
          }}>
            {healthTips.map((tip, index) => (
              <div key={index} style={{
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '15px',
                padding: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                transition: 'transform 0.3s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  {tip.icon}
                </div>
                <span style={{ color: '#4b5563', fontWeight: '500' }}>
                  {tip.tip}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        background: 'rgba(0,0,0,0.3)',
        color: 'white',
        padding: '2rem',
        textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <div>
              <h4 style={{ marginBottom: '1rem' }}>Quick Links</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button onClick={() => setActiveTab("booking")} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>Book Appointment</button>
                <button onClick={() => setActiveTab("ai")} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>AI Assistant</button>
              </div>
            </div>
            <div>
              <h4 style={{ marginBottom: '1rem' }}>Contact</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div>📞 Emergency: 108</div>
                <div>📧 Support: care@aurahealth.com</div>
                <div>📍 Available 24/7</div>
              </div>
            </div>
            <div>
              <h4 style={{ marginBottom: '1rem' }}>Follow Us</h4>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>f</div>
                <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>t</div>
                <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>in</div>
              </div>
            </div>
          </div>
          <div style={{ paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <p>© 2024 AuraHealth. All rights reserved. Your health, our commitment.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
