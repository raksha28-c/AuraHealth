"use client";

import { useState } from "react";
import { Download, X, Share2, Clipboard, HeartPulse } from "lucide-react";
import jsPDF from "jspdf";

interface MedicalReportProps {
  data: {
    symptoms: string[];
    duration: string;
    description: string;
    advice: string;
    clinic: string;
    priority: "low" | "medium" | "high" | "emergency";
    timestamp: string;
    profile: string;
  };
  onClose: () => void;
}

export default function MedicalReport({ data, onClose }: MedicalReportProps) {
  const [copied, setCopied] = useState(false);

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(11, 145, 153);
    doc.text("AuraHealth: AI Medical Consultation Report", 20, 25);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${data.timestamp}`, 20, 32);
    doc.text(`Patient Profile: ${data.profile}`, 20, 37);
    
    // Divider
    doc.setDrawColor(200);
    doc.line(20, 42, 190, 42);
    
    // Section: Symptoms
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("Identified Symptoms", 20, 52);
    doc.setFontSize(12);
    doc.text(data.symptoms.join(", ") || "None recorded", 25, 60);
    
    // Section: Description
    doc.setFontSize(16);
    doc.text("Detailed Conversation Summary", 20, 75);
    doc.setFontSize(12);
    const splitDesc = doc.splitTextToSize(data.description, 170);
    doc.text(splitDesc, 20, 83);
    
    // Section: Advice
    const adviceY = 83 + (splitDesc.length * 7);
    doc.setFontSize(16);
    doc.text("Expert AI Guidance", 20, adviceY + 10);
    doc.setFontSize(12);
    const splitAdvice = doc.splitTextToSize(data.advice, 170);
    doc.text(splitAdvice, 20, adviceY + 18);
    
    // Footer Section
    const footerY = adviceY + 18 + (splitAdvice.length * 7) + 15;
    doc.setFillColor(245, 245, 245);
    doc.rect(20, footerY, 170, 30, 'F');
    doc.setFontSize(10);
    doc.text("Suggested Clinic: " + data.clinic, 25, footerY + 10);
    doc.text("Priority Level: " + data.priority.toUpperCase(), 25, footerY + 18);
    doc.text("Please show this report to a licensed medical professional.", 25, footerY + 25);
    
    doc.save(`AuraHealth_Report_${data.profile}.pdf`);
  };

  const copyToClipboard = () => {
    const text = `Symptoms: ${data.symptoms.join(", ")}\nAdvice: ${data.advice}\nClinic: ${data.clinic}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="glass modal-content" style={{ border: data.priority === 'emergency' ? '2px solid #ef4444' : '1px solid var(--border-color)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'var(--text-muted)' }}>
          <X size={24} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'rgba(11, 145, 153, 0.1)' }}>
            <HeartPulse color="var(--primary-light)" size={32} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '700' }}>AI Health Report</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Comprehensive summary for {data.profile}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
          <div>
            <h4 style={{ color: 'var(--primary-light)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Core Symptoms</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {data.symptoms.map(s => (
                <span key={s} className="glass" style={{ padding: '0.35rem 0.75rem', borderRadius: '2rem', fontSize: '0.85rem' }}>{s}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ color: 'var(--primary-light)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Urgency Level</h4>
            <div style={{ padding: '0.35rem 1rem', borderRadius: '2rem', fontSize: '0.85rem', display: 'inline-block', fontWeight: '600', 
                         background: data.priority === 'emergency' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(11, 145, 153, 0.1)',
                         color: data.priority === 'emergency' ? '#ef4444' : 'var(--primary-light)' }}>
              {data.priority.toUpperCase()}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          <h4 style={{ color: 'var(--primary-light)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>AI Consultation Summary</h4>
          <p style={{ lineHeight: '1.7', color: 'rgba(255,255,255,0.9)', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '1rem' }}>
            {data.description}
          </p>
        </div>

        <div style={{ marginBottom: '3rem' }}>
          <h4 style={{ color: 'var(--primary-light)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>Recommended Action Plan</h4>
          <p style={{ lineHeight: '1.7', color: 'rgba(255,255,255,0.9)', background: 'rgba(11, 145, 153, 0.05)', padding: '1.5rem', borderRadius: '1rem', borderLeft: '3px solid var(--primary-color)' }}>
            {data.advice}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={downloadPDF} className="glass" style={{ flex: 1, padding: '1rem', borderRadius: '1rem', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontWeight: '600' }}>
            <Download size={20} />
            Download PDF Report
          </button>
          <button onClick={copyToClipboard} className="glass" style={{ padding: '1rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            {copied ? <Clipboard size={20} color="var(--primary-light)" /> : <Share2 size={20} />}
            {copied ? 'Copied!' : 'Copy Summary'}
          </button>
        </div>
      </div>
    </div>
  );
}
