"use client";

import { useState } from "react";
import { Heart, Brain, Eye, Bone, Baby, Stethoscope, Smile, Droplet, Wind, Activity, Ear, ChevronRight, Star, Clock, Users, Award } from "lucide-react";

export default function MedicalDomains() {
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");

  const medicalDomains = [
    {
      id: "cardiology",
      name: "Cardiology",
      icon: <Heart size={32} />,
      color: "from-red-500 to-pink-600",
      description: "Heart and cardiovascular system care",
      specialties: [
        { name: "Interventional Cardiology", doctors: 12, avgRating: 4.8 },
        { name: "Electrophysiology", doctors: 8, avgRating: 4.9 },
        { name: "Heart Failure", doctors: 15, avgRating: 4.7 },
        { name: "Pediatric Cardiology", doctors: 6, avgRating: 4.9 }
      ]
    },
    {
      id: "neurology",
      name: "Neurology",
      icon: <Brain size={32} />,
      color: "from-purple-500 to-indigo-600",
      description: "Brain and nervous system disorders",
      specialties: [
        { name: "Stroke Neurology", doctors: 18, avgRating: 4.8 },
        { name: "Epilepsy", doctors: 10, avgRating: 4.7 },
        { name: "Movement Disorders", doctors: 9, avgRating: 4.9 },
        { name: "Neuromuscular", doctors: 7, avgRating: 4.8 }
      ]
    },
    {
      id: "ophthalmology",
      name: "Ophthalmology",
      icon: <Eye size={32} />,
      color: "from-blue-500 to-cyan-600",
      description: "Eye care and vision health",
      specialties: [
        { name: "Retina Surgery", doctors: 14, avgRating: 4.9 },
        { name: "Glaucoma", doctors: 11, avgRating: 4.7 },
        { name: "Pediatric Ophthalmology", doctors: 8, avgRating: 4.8 },
        { name: "Cornea", doctors: 9, avgRating: 4.8 }
      ]
    },
    {
      id: "orthopedics",
      name: "Orthopedics",
      icon: <Bone size={32} />,
      color: "from-green-500 to-emerald-600",
      description: "Bones, joints, and musculoskeletal system",
      specialties: [
        { name: "Joint Replacement", doctors: 22, avgRating: 4.8 },
        { name: "Spine Surgery", doctors: 16, avgRating: 4.9 },
        { name: "Sports Medicine", doctors: 13, avgRating: 4.7 },
        { name: "Hand Surgery", doctors: 10, avgRating: 4.8 }
      ]
    },
    {
      id: "pediatrics",
      name: "Pediatrics",
      icon: <Baby size={32} />,
      color: "from-yellow-500 to-orange-600",
      description: "Children's health and development",
      specialties: [
        { name: "Neonatology", doctors: 15, avgRating: 4.9 },
        { name: "Pediatric ICU", doctors: 12, avgRating: 4.8 },
        { name: "Developmental Pediatrics", doctors: 9, avgRating: 4.7 },
        { name: "Adolescent Medicine", doctors: 8, avgRating: 4.8 }
      ]
    },
    {
      id: "internal",
      name: "Internal Medicine",
      icon: <Stethoscope size={32} />,
      color: "from-teal-500 to-blue-600",
      description: "Adult primary care and complex diseases",
      specialties: [
        { name: "Primary Care", doctors: 35, avgRating: 4.7 },
        { name: "Hospital Medicine", doctors: 20, avgRating: 4.6 },
        { name: "Geriatrics", doctors: 14, avgRating: 4.8 },
        { name: "Preventive Medicine", doctors: 11, avgRating: 4.9 }
      ]
    },
    {
      id: "dentistry",
      name: "Dentistry",
      icon: <Smile size={32} />,
      color: "from-indigo-500 to-purple-600",
      description: "Oral health and dental care",
      specialties: [
        { name: "Oral Surgery", doctors: 18, avgRating: 4.8 },
        { name: "Orthodontics", doctors: 15, avgRating: 4.7 },
        { name: "Periodontics", doctors: 12, avgRating: 4.8 },
        { name: "Endodontics", doctors: 10, avgRating: 4.9 }
      ]
    },
    {
      id: "nephrology",
      name: "Nephrology",
      icon: <Droplet size={32} />,
      color: "from-rose-500 to-pink-600",
      description: "Kidney health and dialysis",
      specialties: [
        { name: "Dialysis", doctors: 14, avgRating: 4.7 },
        { name: "Transplant", doctors: 9, avgRating: 4.9 },
        { name: "Interventional Nephrology", doctors: 8, avgRating: 4.8 },
        { name: "Pediatric Nephrology", doctors: 6, avgRating: 4.9 }
      ]
    },
    {
      id: "pulmonology",
      name: "Pulmonology",
      icon: <Wind size={32} />,
      color: "from-sky-500 to-blue-600",
      description: "Lung health and respiratory care",
      specialties: [
        { name: "Critical Care", doctors: 20, avgRating: 4.8 },
        { name: "Sleep Medicine", doctors: 12, avgRating: 4.7 },
        { name: "Interventional Pulmonology", doctors: 8, avgRating: 4.9 },
        { name: "Cystic Fibrosis", doctors: 7, avgRating: 4.8 }
      ]
    },
    {
      id: "podiatry",
      name: "Podiatry",
      icon: <Activity size={32} />,
      color: "from-amber-500 to-orange-600",
      description: "Foot and ankle care",
      specialties: [
        { name: "Diabetic Foot Care", doctors: 16, avgRating: 4.8 },
        { name: "Sports Podiatry", doctors: 11, avgRating: 4.7 },
        { name: "Surgical Podiatry", doctors: 13, avgRating: 4.8 },
        { name: "Pediatric Podiatry", doctors: 7, avgRating: 4.9 }
      ]
    },
    {
      id: "ent",
      name: "ENT (Otolaryngology)",
      icon: <Ear size={32} />,
      color: "from-violet-500 to-purple-600",
      description: "Ear, nose, and throat care",
      specialties: [
        { name: "Head & Neck Surgery", doctors: 14, avgRating: 4.9 },
        { name: "Rhinology", doctors: 10, avgRating: 4.8 },
        { name: "Otology", doctors: 9, avgRating: 4.8 },
        { name: "Laryngology", doctors: 7, avgRating: 4.7 }
      ]
    },
    {
      id: "radiology",
      name: "Radiology",
      icon: <Activity size={32} />,
      color: "from-cyan-500 to-blue-600",
      description: "Medical imaging and diagnostics",
      specialties: [
        { name: "Diagnostic Radiology", doctors: 25, avgRating: 4.7 },
        { name: "Interventional Radiology", doctors: 12, avgRating: 4.8 },
        { name: "Neuroradiology", doctors: 10, avgRating: 4.9 },
        { name: "Pediatric Radiology", doctors: 8, avgRating: 4.8 }
      ]
    }
  ];

  const selectedDomainData = medicalDomains.find(d => d.id === selectedDomain);

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '1400px', 
      margin: '0 auto',
      height: '100vh',
      overflowY: 'scroll',
      overflowX: 'hidden',
      scrollBehavior: 'smooth'
    }}>
      <h2 style={{ 
        color: '#f8fafc', 
        fontSize: '2.5rem', 
        marginBottom: '1rem', 
        fontWeight: '900',
        textAlign: 'center',
        textShadow: '0 2px 8px rgba(0,0,0,0.3)'
      }}>
        🏥 Medical Domains & Specialties
      </h2>
      <p style={{ 
        color: '#94a3b8', 
        fontSize: '1.2rem', 
        marginBottom: '3rem', 
        textAlign: 'center',
        maxWidth: '800px',
        margin: '0 auto 3rem auto'
      }}>
        Explore our comprehensive medical domains with expert specialists across all fields of medicine
      </p>

      {/* Domain Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
        gap: '2rem',
        marginBottom: '3rem'
      }}>
        {medicalDomains.map((domain) => (
          <div
            key={domain.id}
            onClick={() => setSelectedDomain(domain.id)}
            style={{
              background: selectedDomain === domain.id 
                ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' 
                : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              borderRadius: '24px',
              padding: '2rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: selectedDomain === domain.id 
                ? '2px solid #0ea5e9' 
                : '1px solid rgba(14, 165, 233, 0.2)',
              boxShadow: selectedDomain === domain.id
                ? '0 16px 48px rgba(14, 165, 233, 0.3)'
                : '0 8px 32px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              height: '4px',
              background: `linear-gradient(90deg, ${domain.color.split(' ')[0]} ${domain.color.split(' ')[1]})`
            }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                background: `linear-gradient(135deg, ${domain.color.split(' ')[0]} ${domain.color.split(' ')[1]})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
              }}>
                <div style={{ color: 'white' }}>{domain.icon}</div>
              </div>
              <div>
                <h3 style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.3rem' }}>
                  {domain.name}
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
                  {domain.description}
                </p>
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginTop: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={16} style={{ color: '#0ea5e9' }} />
                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  {domain.specialties.length} specialties
                </span>
              </div>
              <ChevronRight 
                size={20} 
                style={{ 
                  color: selectedDomain === domain.id ? '#0ea5e9' : '#64748b',
                  transition: 'transform 0.3s ease',
                  transform: selectedDomain === domain.id ? 'rotate(90deg)' : 'rotate(0deg)'
                }} 
              />
            </div>
          </div>
        ))}
      </div>

      {/* Specialties Section */}
      {selectedDomainData && (
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          borderRadius: '32px',
          padding: '3rem',
          border: '2px solid rgba(14, 165, 233, 0.3)',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.3)'
        }}>
          <h3 style={{ 
            color: '#f8fafc', 
            fontSize: '2rem', 
            marginBottom: '2rem', 
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${selectedDomainData.color.split(' ')[0]} ${selectedDomainData.color.split(' ')[1]})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ color: 'white' }}>{selectedDomainData.icon}</div>
            </div>
            {selectedDomainData.name} Specialties
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {selectedDomainData.specialties.map((specialty, index) => (
              <div
                key={index}
                onClick={() => setSelectedSpecialty(specialty.name)}
                style={{
                  background: selectedSpecialty === specialty.name
                    ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                    : 'rgba(15, 23, 42, 0.5)',
                  borderRadius: '20px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: selectedSpecialty === specialty.name
                    ? '2px solid #0ea5e9'
                    : '1px solid rgba(14, 165, 233, 0.2)',
                  position: 'relative'
                }}
              >
                <h4 style={{ color: '#f8fafc', fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem' }}>
                  {specialty.name}
                </h4>
                
                <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={16} style={{ color: '#0ea5e9' }} />
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                      {specialty.doctors} doctors
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Star size={16} style={{ color: '#fbbf24' }} />
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                      {specialty.avgRating} rating
                    </span>
                  </div>
                </div>
                
                <button style={{
                  width: '100%',
                  padding: '0.8rem',
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}>
                  View Doctors
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
        marginTop: '3rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          borderRadius: '20px',
          padding: '2rem',
          textAlign: 'center',
          border: '1px solid rgba(14, 165, 233, 0.2)'
        }}>
          <div style={{ fontSize: '3rem', fontWeight: '900', color: '#0ea5e9', marginBottom: '0.5rem' }}>
            12
          </div>
          <div style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
            Medical Domains
          </div>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          borderRadius: '20px',
          padding: '2rem',
          textAlign: 'center',
          border: '1px solid rgba(14, 165, 233, 0.2)'
        }}>
          <div style={{ fontSize: '3rem', fontWeight: '900', color: '#0ea5e9', marginBottom: '0.5rem' }}>
            48
          </div>
          <div style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
            Specialties
          </div>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          borderRadius: '20px',
          padding: '2rem',
          textAlign: 'center',
          border: '1px solid rgba(14, 165, 233, 0.2)'
        }}>
          <div style={{ fontSize: '3rem', fontWeight: '900', color: '#0ea5e9', marginBottom: '0.5rem' }}>
            500+
          </div>
          <div style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
            Expert Doctors
          </div>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          borderRadius: '20px',
          padding: '2rem',
          textAlign: 'center',
          border: '1px solid rgba(14, 165, 233, 0.2)'
        }}>
          <div style={{ fontSize: '3rem', fontWeight: '900', color: '#0ea5e9', marginBottom: '0.5rem' }}>
            4.8
          </div>
          <div style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
            Average Rating
          </div>
        </div>
      </div>
    </div>
  );
}
