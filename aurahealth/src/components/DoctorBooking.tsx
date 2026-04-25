"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Star, Phone, Mail, MapPin, Award, Languages, User, CheckCircle, X } from "lucide-react";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  availability: string[];
  consultation_fee: number;
  image_url: string;
  about: string;
  education: string;
  languages: string[];
  achievements: string[];
  specialties: string[];
  consultation_types: string[];
  hospital_affiliations: string[];
  awards: string[];
  publications: string[];
  board_certifications: string[];
  research_interests: string[];
  professional_memberships: string[];
}

interface Appointment {
  id: string;
  doctor_id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  date: string;
  time: string;
  reason: string;
  status: string;
  created_at: string;
}

export default function DoctorBooking() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showBooking, setShowBooking] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    doctor_id: "",
    patient_name: "",
    patient_email: "",
    patient_phone: "",
    date: "",
    time: "",
    reason: ""
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/doctors`);
      const data = await response.json();
      setDoctors(data);
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
    }
  };

  const checkAvailability = async (doctorId: string, date: string) => {
    try {
      const response = await fetch(`${backendUrl}/api/availability/${doctorId}/${date}`);
      const data = await response.json();
      setAvailableSlots(data.available_slots);
    } catch (error) {
      console.error("Failed to check availability:", error);
    }
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setBookingForm(prev => ({ ...prev, doctor_id: doctor.id }));
    setShowBooking(true);
    setAvailableSlots([]);
    setBookingSuccess(false);
  };

  const handleDateChange = (date: string) => {
    setBookingForm(prev => ({ ...prev, date, time: "" }));
    if (selectedDoctor && date) {
      checkAvailability(selectedDoctor.id, date);
    }
  };

  const handleBooking = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/appointments/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingForm)
      });
      
      if (response.ok) {
        const appointment = await response.json();
        setAppointments(prev => [...prev, appointment]);
        setBookingSuccess(true);
        // Reset form
        setBookingForm({
          doctor_id: "",
          patient_name: "",
          patient_email: "",
          patient_phone: "",
          date: "",
          time: "",
          reason: ""
        });
        setShowBooking(false);
        setSelectedDoctor(null);
      }
    } catch (error) {
      console.error("Booking failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSpecializationColor = (specialization: string) => {
    const colors: { [key: string]: string } = {
      "General Physician": "from-blue-400 to-blue-600",
      "Cardiologist": "from-red-400 to-pink-600", 
      "Gynecologist": "from-purple-400 to-purple-600",
      "Orthopedic Surgeon": "from-green-400 to-emerald-600",
      "Pediatrician": "from-yellow-400 to-orange-600",
      "Dermatologist": "from-indigo-400 to-purple-600"
    };
    return colors[specialization] || "from-gray-400 to-gray-600";
  };

  const getSpecializationIcon = (specialization: string) => {
    const icons: { [key: string]: string } = {
      "General Physician": "🩺",
      "Cardiologist": "❤️",
      "Gynecologist": "👩‍⚕️", 
      "Orthopedic Surgeon": "🦴",
      "Pediatrician": "👶",
      "Dermatologist": "🌿"
    };
    return icons[specialization] || "👨‍⚕️";
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
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            color: 'white',
            marginBottom: '1rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}>
            🏥 Book Your Doctor Appointment
          </h1>
          <p style={{ 
            fontSize: '1.2rem', 
            color: 'rgba(255,255,255,0.9)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Connect with experienced doctors across various specializations. Book appointments instantly and secure your health consultation.
          </p>
        </div>

        {/* Success Message */}
        {bookingSuccess && (
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '15px',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <CheckCircle size={24} />
            <div>
              <strong>Appointment Booked Successfully!</strong>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                You will receive a confirmation email shortly.
              </p>
            </div>
            <button 
              onClick={() => setBookingSuccess(false)}
              style={{ 
                background: 'rgba(255,255,255,0.2)', 
                border: 'none', 
                borderRadius: '50%', 
                padding: '0.5rem',
                cursor: 'pointer',
                marginLeft: 'auto'
              }}
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Doctors Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '2rem',
          marginBottom: '3rem'
        }}>
          {doctors.map((doctor) => (
            <div key={doctor.id} style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}>
              {/* Doctor Header */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${getSpecializationColor(doctor.specialization).replace('from-', '').replace(' to ', ', ')})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  color: 'white',
                  marginRight: '1.5rem',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                }}>
                  {getSpecializationIcon(doctor.specialization)}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold', 
                    margin: '0 0 0.5rem 0',
                    color: '#1f2937'
                  }}>
                    {doctor.name}
                  </h3>
                  <div style={{
                    background: `linear-gradient(135deg, ${getSpecializationColor(doctor.specialization)})`,
                    color: 'white',
                    padding: '0.4rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    display: 'inline-block',
                    marginBottom: '0.5rem'
                  }}>
                    {doctor.specialization}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                    <Star size={16} style={{ color: '#fbbf24' }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{doctor.rating} ⭐</span>
                    <span style={{ fontSize: '0.8rem' }}>({doctor.experience} years)</span>
                  </div>
                </div>
              </div>

              {/* Key Info */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: '1rem', 
                marginBottom: '1.5rem' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                  <Phone size={16} />
                  <span style={{ fontSize: '0.9rem' }}>₹{doctor.consultation_fee}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                  <Languages size={16} />
                  <span style={{ fontSize: '0.9rem' }}>{doctor.languages.slice(0, 2).join(', ')}</span>
                </div>
              </div>

              {/* About */}
              <p style={{ 
                fontSize: '0.9rem', 
                color: '#4b5563', 
                marginBottom: '1.5rem',
                lineHeight: '1.4'
              }}>
                {doctor.about}
              </p>

              {/* Education & Certifications */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#1f2937', marginBottom: '0.5rem', fontSize: '0.9rem' }}>🎓 Education</h4>
                <p style={{ color: '#6b7280', fontSize: '0.8rem', margin: '0 0 1rem 0' }}>{doctor.education}</p>
                
                <h4 style={{ color: '#1f2937', marginBottom: '0.5rem', fontSize: '0.9rem' }}>🏆 Key Achievements</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                  {doctor.achievements.slice(0, 2).map((achievement, index) => (
                    <span key={index} style={{
                      background: 'rgba(99, 102, 241, 0.1)',
                      color: '#6366f1',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '15px',
                      fontSize: '0.7rem',
                      fontWeight: '500'
                    }}>
                      {achievement}
                    </span>
                  ))}
                </div>
              </div>

              {/* Specialties */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#1f2937', marginBottom: '0.5rem', fontSize: '0.9rem' }}>🩺 Specialties</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {doctor.specialties.slice(0, 3).map((specialty, index) => (
                    <span key={index} style={{
                      background: 'rgba(34, 197, 94, 0.1)',
                      color: '#22c55e',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '15px',
                      fontSize: '0.7rem',
                      fontWeight: '500'
                    }}>
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hospital Affiliations */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#1f2937', marginBottom: '0.5rem', fontSize: '0.9rem' }}>🏥 Hospitals</h4>
                <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                  {doctor.hospital_affiliations.slice(0, 2).join(', ')}
                </div>
              </div>

              {/* Consultation Types */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#1f2937', marginBottom: '0.5rem', fontSize: '0.9rem' }}>💻 Consultation Types</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {doctor.consultation_types.map((type, index) => (
                    <span key={index} style={{
                      background: 'rgba(245, 158, 11, 0.1)',
                      color: '#f59e0b',
                      padding: '0.3rem 0.8rem',
                      borderRadius: '15px',
                      fontSize: '0.7rem',
                      fontWeight: '500'
                    }}>
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              {/* Awards */}
              {doctor.awards.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ color: '#1f2937', marginBottom: '0.5rem', fontSize: '0.9rem' }}>🥇 Awards</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {doctor.awards.map((award, index) => (
                      <span key={index} style={{
                        background: 'rgba(251, 191, 36, 0.1)',
                        color: '#fbbf24',
                        padding: '0.3rem 0.8rem',
                        borderRadius: '15px',
                        fontSize: '0.7rem',
                        fontWeight: '500'
                      }}>
                        {award}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#1f2937', marginBottom: '0.5rem', fontSize: '0.9rem' }}>📅 Availability</h4>
                <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                  {doctor.availability.slice(0, 2).join(', ')}
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={() => handleDoctorSelect(doctor)}
                style={{
                  width: '100%',
                  padding: '1.2rem',
                  background: `linear-gradient(135deg, ${getSpecializationColor(doctor.specialization)})`,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Book Appointment
              </button>
            </div>
          ))}
        </div>

        {/* Booking Modal */}
        {showBooking && selectedDoctor && (
          <div style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'rgba(0,0,0,0.7)',
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
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, color: '#1f2937' }}>Book Appointment</h2>
                <button 
                  onClick={() => setShowBooking(false)}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    fontSize: '1.5rem', 
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                >
                  ×
                </button>
              </div>

              {/* Doctor Summary */}
              <div style={{
                background: `linear-gradient(135deg, ${getSpecializationColor(selectedDoctor.specialization)})`,
                color: 'white',
                padding: '1rem',
                borderRadius: '12px',
                marginBottom: '1.5rem'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{selectedDoctor.name}</div>
                <div style={{ fontSize: '0.9rem' }}>{selectedDoctor.specialization}</div>
                <div style={{ fontSize: '0.9rem' }}>₹{selectedDoctor.consultation_fee} consultation fee</div>
              </div>

              {/* Booking Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={bookingForm.patient_name}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, patient_name: e.target.value }))}
                  style={{
                    padding: '0.8rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  value={bookingForm.patient_email}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, patient_email: e.target.value }))}
                  style={{
                    padding: '0.8rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
                <input
                  type="tel"
                  placeholder="Your Phone Number"
                  value={bookingForm.patient_phone}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, patient_phone: e.target.value }))}
                  style={{
                    padding: '0.8rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
                <input
                  type="date"
                  value={bookingForm.date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  style={{
                    padding: '0.8rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
                
                {/* Time Slots */}
                {availableSlots.length > 0 && (
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#374151' }}>
                      Available Time Slots
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setBookingForm(prev => ({ ...prev, time: slot }))}
                          style={{
                            padding: '0.5rem',
                            border: bookingForm.time === slot ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                            borderRadius: '6px',
                            background: bookingForm.time === slot ? '#eff6ff' : 'white',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                          }}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <textarea
                  placeholder="Reason for visit (optional)"
                  value={bookingForm.reason}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                  style={{
                    padding: '0.8rem',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />

                <button
                  onClick={handleBooking}
                  disabled={loading || !bookingForm.patient_name || !bookingForm.patient_email || !bookingForm.patient_phone || !bookingForm.date || !bookingForm.time}
                  style={{
                    padding: '1rem',
                    background: loading ? '#9ca3af' : `linear-gradient(135deg, ${getSpecializationColor(selectedDoctor.specialization)})`,
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: (loading || !bookingForm.patient_name || !bookingForm.patient_email || !bookingForm.patient_phone || !bookingForm.date || !bookingForm.time) ? 0.5 : 1
                  }}
                >
                  {loading ? 'Booking...' : 'Confirm Appointment'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
