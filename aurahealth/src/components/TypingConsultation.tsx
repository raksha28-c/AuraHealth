"use client";

import { useState } from "react";
import { Send, Clock, Calendar, User, FileText, Phone, Video, MessageSquare } from "lucide-react";

export default function TypingConsultation() {
  const [message, setMessage] = useState("");
  const [consultationType, setConsultationType] = useState("typing");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [consultationNotes, setConsultationNotes] = useState("");

  const doctors = [
    { id: "1", name: "Dr. Sarah Johnson", specialty: "General Physician", available: true, rating: 4.9, experience: "15 years" },
    { id: "2", name: "Dr. Michael Chen", specialty: "Cardiologist", available: true, rating: 4.8, experience: "12 years" },
    { id: "3", name: "Dr. Emily Davis", specialty: "Pediatrician", available: false, rating: 4.9, experience: "10 years" },
    { id: "4", name: "Dr. James Wilson", specialty: "Orthopedic", available: true, rating: 4.7, experience: "18 years" }
  ];

  const timeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM"
  ];

  const preRecords = [
    { date: "2024-01-15", type: "Consultation", doctor: "Dr. Sarah Johnson", diagnosis: "Seasonal Allergies", prescription: "Antihistamines" },
    { date: "2024-02-20", type: "Lab Test", doctor: "Dr. Michael Chen", diagnosis: "Vitamin D Deficiency", prescription: "Vitamin D3 Supplements" },
    { date: "2024-03-10", type: "Emergency", doctor: "Dr. Emily Davis", diagnosis: "Food Poisoning", prescription: "IV Fluids & Medication" }
  ];

  const [messages, setMessages] = useState([
    { id: 1, sender: "doctor", text: "Hello! I'm Dr. Sarah Johnson. How can I help you today?", time: "10:00 AM" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = () => {
    if (message.trim()) {
      // Add user message
      const userMessage = {
        id: messages.length + 1,
        sender: "user",
        text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, userMessage]);
      setMessage("");
      
      // Simulate doctor typing
      setIsTyping(true);
      
      // Simulate doctor response
      setTimeout(() => {
        const doctorResponses = [
          "I understand your concern. Can you tell me more about your symptoms?",
          "Based on what you've described, I recommend we schedule a consultation.",
          "That sounds like something we should investigate further. Have you experienced this before?",
          "I can help you with that. Let me ask a few questions to better understand your situation."
        ];
        const randomResponse = doctorResponses[Math.floor(Math.random() * doctorResponses.length)];
        
        const doctorMessage = {
          id: messages.length + 2,
          sender: "doctor",
          text: randomResponse,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, doctorMessage]);
        setIsTyping(false);
      }, 1500);
    }
  };

  const handleBookAppointment = () => {
    try {
      if (!selectedDoctor || !selectedDate || !selectedTime) {
        alert("❌ Please fill in all required fields: Doctor, Date, and Time");
        return;
      }

      // Get doctor name
      const doctor = doctors.find(d => d.id === selectedDoctor);
      const doctorName = doctor ? doctor.name : "Selected Doctor";
      
      // Validate date is not in the past
      const selectedDateObj = new Date(selectedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDateObj < today) {
        alert("❌ Please select a future date for your appointment");
        return;
      }

      // Create appointment details
      const appointmentDetails = {
        id: Date.now().toString(),
        doctor: doctorName,
        date: selectedDate,
        time: selectedTime,
        notes: consultationNotes,
        type: consultationType,
        timestamp: new Date().toISOString(),
        status: "confirmed"
      };
      
      // Save to localStorage for persistence
      const existingAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      existingAppointments.push(appointmentDetails);
      localStorage.setItem('appointments', JSON.stringify(existingAppointments));
      
      // Show success message
      alert(`✅ Appointment booked successfully!\n\n📅 Date: ${selectedDate}\n⏰ Time: ${selectedTime}\n👨‍⚕️ Doctor: ${doctorName}\n📹 Type: ${consultationType === 'video' ? 'Video Consultation' : 'In-Person Visit'}\n📝 Notes: ${consultationNotes || 'None'}\n\nAppointment ID: ${appointmentDetails.id}\n\nYou will receive a confirmation email shortly.`);
      
      // Reset form
      setSelectedDoctor("");
      setSelectedDate("");
      setSelectedTime("");
      setConsultationNotes("");
      
      // Switch to booking tab to see the appointment
      setTimeout(() => {
        window.location.href = '#booking';
      }, 1000);
      
    } catch (error) {
      console.error("Booking error:", error);
      alert("❌ An error occurred while booking. Please try again.");
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
      <h2 style={{ color: '#1e293b', fontSize: '2rem', marginBottom: '2rem', fontWeight: '800' }}>
        💬 Typing Consultation & Appointment Booking
      </h2>

      {/* Pre-Records Section */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ color: '#1e293b', fontSize: '1.3rem', marginBottom: '1.5rem', fontWeight: '700' }}>
          📋 Your Medical Pre-Records
        </h3>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {preRecords.map((record, index) => (
            <div key={index} style={{
              background: '#f8fafc',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <FileText size={16} style={{ color: '#2563eb' }} />
                  <span style={{ fontWeight: '600', color: '#1e293b' }}>{record.type}</span>
                  <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{record.date}</span>
                </div>
                <p style={{ color: '#374151', marginBottom: '0.3rem' }}>
                  <strong>Doctor:</strong> {record.doctor}
                </p>
                <p style={{ color: '#374151', marginBottom: '0.3rem' }}>
                  <strong>Diagnosis:</strong> {record.diagnosis}
                </p>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  <strong>Prescription:</strong> {record.prescription}
                </p>
              </div>
              <button style={{
                padding: '0.5rem 1rem',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}>
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Consultation Type Selection */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{ color: '#1e293b', fontSize: '1.3rem', marginBottom: '1.5rem', fontWeight: '700' }}>
          🏥 Choose Consultation Type
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          <button
            onClick={() => setConsultationType("typing")}
            style={{
              padding: '1.5rem',
              background: consultationType === "typing" ? '#2563eb' : '#f8fafc',
              color: consultationType === "typing" ? 'white' : '#1e293b',
              border: consultationType === "typing" ? 'none' : '1px solid #e2e8f0',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <MessageSquare size={32} />
            <span style={{ fontWeight: '600' }}>Typing Consultation</span>
            <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Chat with doctor via text</span>
          </button>
          
          <button
            onClick={() => setConsultationType("video")}
            style={{
              padding: '1.5rem',
              background: consultationType === "video" ? '#2563eb' : '#f8fafc',
              color: consultationType === "video" ? 'white' : '#1e293b',
              border: consultationType === "video" ? 'none' : '1px solid #e2e8f0',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Video size={32} />
            <span style={{ fontWeight: '600' }}>Video Consultation</span>
            <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Face-to-face video call</span>
          </button>
          
          <button
            onClick={() => setConsultationType("appointment")}
            style={{
              padding: '1.5rem',
              background: consultationType === "appointment" ? '#2563eb' : '#f8fafc',
              color: consultationType === "appointment" ? 'white' : '#1e293b',
              border: consultationType === "appointment" ? 'none' : '1px solid #e2e8f0',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Calendar size={32} />
            <span style={{ fontWeight: '600' }}>Book Appointment</span>
            <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Schedule in-person visit</span>
          </button>
        </div>
      </div>

      {/* Typing Consultation */}
      {consultationType === "typing" && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ color: '#1e293b', fontSize: '1.3rem', marginBottom: '1.5rem', fontWeight: '700' }}>
            💬 Live Typing Consultation
          </h3>
          
          {/* Chat Messages */}
          <div style={{ 
            background: '#f8fafc', 
            borderRadius: '12px', 
            padding: '1.5rem', 
            marginBottom: '1rem',
            minHeight: '300px',
            maxHeight: '400px',
            overflowY: 'auto',
            border: '1px solid #e2e8f0'
          }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{
                marginBottom: '1rem',
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '70%',
                  padding: '0.8rem 1.2rem',
                  borderRadius: '12px',
                  background: msg.sender === 'user' ? '#2563eb' : '#e2e8f0',
                  color: msg.sender === 'user' ? 'white' : '#1e293b'
                }}>
                  <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem' }}>
                    {msg.text}
                  </p>
                  <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                    {msg.sender === 'doctor' ? 'Dr. Johnson' : 'You'} • {msg.time}
                  </span>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#64748b', animation: 'pulse 1s infinite' }} />
                <span style={{ fontSize: '0.9rem' }}>Dr. Johnson is typing...</span>
              </div>
            )}
          </div>
          
          {/* Quick Response Options */}
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Quick responses:</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {["I have a headache", "I feel feverish", "I need a checkup", "Emergency help"].map((quickMsg) => (
                <button
                  key={quickMsg}
                  onClick={() => setMessage(quickMsg)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    background: '#f1f5f9',
                    border: '1px solid #e2e8f0',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {quickMsg}
                </button>
              ))}
            </div>
          </div>
          
          {/* Message Input */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your medical question or symptoms..."
              style={{
                flex: 1,
                padding: '1rem',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '1rem',
                outline: 'none'
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              style={{
                padding: '1rem 1.5rem',
                background: message.trim() ? '#2563eb' : '#94a3b8',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: message.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease'
              }}
            >
              <Send size={20} />
              Send
            </button>
          </div>
        </div>
      )}

      {/* Doctor Selection & Appointment Booking */}
      {(consultationType === "video" || consultationType === "appointment") && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{ color: '#1e293b', fontSize: '1.3rem', marginBottom: '1.5rem', fontWeight: '700' }}>
            👨‍⚕️ Select Doctor & Book {consultationType === "video" ? "Video" : "In-Person"} Consultation
          </h3>
          
          {/* Doctor Selection */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
              Select Doctor
            </label>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  onClick={() => doctor.available && setSelectedDoctor(doctor.id)}
                  style={{
                    padding: '1.5rem',
                    border: selectedDoctor === doctor.id ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    cursor: doctor.available ? 'pointer' : 'not-allowed',
                    background: selectedDoctor === doctor.id ? '#f0f9ff' : 'white',
                    opacity: doctor.available ? 1 : 0.6,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>{doctor.name}</h4>
                      <p style={{ color: '#64748b', marginBottom: '0.3rem' }}>{doctor.specialty}</p>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.3rem' }}>
                        ⭐ {doctor.rating} • {doctor.experience}
                      </p>
                      <span style={{
                        padding: '0.3rem 0.8rem',
                        background: doctor.available ? '#dcfce7' : '#fee2e2',
                        color: doctor.available ? '#16a34a' : '#dc2626',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        {doctor.available ? '✅ Available' : '🔴 Unavailable'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {consultationType === "video" && <Video size={20} style={{ color: '#2563eb' }} />}
                      <Phone size={20} style={{ color: '#2563eb' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Date & Time Selection */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                Select Time
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              >
                <option value="">Select time</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Consultation Notes */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
              Consultation Notes (Optional)
            </label>
            <textarea
              value={consultationNotes}
              onChange={(e) => setConsultationNotes(e.target.value)}
              placeholder="Describe your symptoms or reason for consultation..."
              style={{
                width: '100%',
                padding: '1rem',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem',
                minHeight: '100px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Book Button */}
          <button
            onClick={handleBookAppointment}
            disabled={!selectedDoctor || !selectedDate || !selectedTime}
            style={{
              padding: '1rem 2rem',
              background: (selectedDoctor && selectedDate && selectedTime) ? '#2563eb' : '#94a3b8',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: (selectedDoctor && selectedDate && selectedTime) ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Calendar size={20} />
            Book {consultationType === "video" ? "Video" : "In-Person"} Consultation
          </button>
        </div>
      )}
    </div>
  );
}
