"use client";

import { useState, useEffect } from "react";
import { Phone, MapPin, AlertTriangle, Plus, Trash2, X, Send, CheckCircle } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

const CONTACTS_KEY = "aurahealth_sos_contacts";
const EMERGENCY_NUMBERS = [
  { label: "Ambulance", number: "108", color: "#ef4444" },
  { label: "Police", number: "100", color: "#3b82f6" },
  { label: "Fire", number: "101", color: "#f97316" },
  { label: "Women Helpline", number: "1091", color: "#a855f7" },
  { label: "Disaster Mgmt", number: "1078", color: "#0b9199" },
];

export default function SOSPanel({ onClose }: { onClose: () => void }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relation, setRelation] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "got" | "error">("idle");
  const [sosSent, setSosSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem(CONTACTS_KEY);
    if (stored) setContacts(JSON.parse(stored));
  }, []);

  const saveContacts = (updated: Contact[]) => {
    setContacts(updated);
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(updated));
  };

  const addContact = () => {
    if (!name.trim() || !phone.trim()) return;
    const newContact: Contact = { id: Date.now().toString(), name, phone, relation };
    saveContacts([...contacts, newContact]);
    setName(""); setPhone(""); setRelation("");
  };

  const removeContact = (id: string) => saveContacts(contacts.filter((c) => c.id !== id));

  const getLocation = () => {
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus("got");
      },
      () => setLocationStatus("error")
    );
  };

  const triggerSOS = () => {
    if (countdown > 0) return;
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          setSosSent(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const locationUrl = location
    ? `https://maps.google.com/?q=${location.lat},${location.lng}`
    : null;

  const smsText = location
    ? `🚨 EMERGENCY! I need help. My location: ${locationUrl}`
    : `🚨 EMERGENCY! I need help. Please call me immediately.`;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass modal-content" style={{ maxWidth: "800px", padding: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ padding: "0.6rem", borderRadius: "10px", background: "rgba(239,68,68,0.1)" }}>
              <AlertTriangle color="#ef4444" size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: "700" }}>SOS Emergency</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Quick access to emergency services</p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: "var(--text-muted)" }}><X size={22} /></button>
        </div>

        {/* SOS Button */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          {sosSent ? (
            <div style={{ padding: "2rem", borderRadius: "1.25rem", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
              <CheckCircle color="#22c55e" size={48} style={{ margin: "0 auto 1rem" }} />
              <p style={{ fontWeight: "700", fontSize: "1.2rem", color: "#22c55e" }}>SOS Alert Sent</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.5rem" }}>
                Emergency contacts have been notified.
              </p>
              {locationUrl && (
                <a href={locationUrl} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: "1rem", color: "var(--primary-light)", fontSize: "0.85rem" }}>
                  View your location on map →
                </a>
              )}
              <button onClick={() => setSosSent(false)} style={{ display: "block", margin: "1rem auto 0", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                Reset
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={triggerSOS}
                style={{
                  width: "140px", height: "140px", borderRadius: "50%",
                  background: countdown > 0 ? "#f97316" : "#ef4444",
                  border: "6px solid rgba(239,68,68,0.3)",
                  color: "white", fontWeight: "800", fontSize: countdown > 0 ? "3rem" : "1.1rem",
                  boxShadow: "0 0 40px rgba(239,68,68,0.4)",
                  transition: "all 0.3s", cursor: "pointer",
                  animation: countdown > 0 ? "none" : "sosPulse 2s infinite",
                }}
              >
                {countdown > 0 ? countdown : "SOS"}
              </button>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "1rem" }}>
                {countdown > 0 ? "Sending in..." : "Hold to send emergency alert to your contacts"}
              </p>
            </>
          )}
        </div>

        {/* Location */}
        <div className="glass" style={{ padding: "1rem 1.25rem", borderRadius: "1rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <MapPin color="var(--primary-light)" size={18} />
            <div>
              <p style={{ fontSize: "0.85rem", fontWeight: "600" }}>Your Location</p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {locationStatus === "got" && location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` :
                  locationStatus === "loading" ? "Getting location..." :
                  locationStatus === "error" ? "Location unavailable" : "Not fetched yet"}
              </p>
            </div>
          </div>
          <button
            onClick={getLocation}
            style={{ padding: "0.5rem 1rem", borderRadius: "0.75rem", background: "rgba(11,145,153,0.15)", color: "var(--primary-light)", fontSize: "0.85rem", fontWeight: "600" }}
          >
            {locationStatus === "got" ? "Refresh" : "Get Location"}
          </button>
        </div>

        {/* Emergency Numbers */}
        <div style={{ marginBottom: "1.5rem" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600", marginBottom: "0.75rem" }}>Quick Dial</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
            {EMERGENCY_NUMBERS.map((n) => (
              <a
                key={n.number}
                href={`tel:${n.number}`}
                style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.6rem 1rem", borderRadius: "2rem",
                  background: `${n.color}15`, border: `1px solid ${n.color}40`,
                  color: n.color, fontWeight: "600", fontSize: "0.85rem", textDecoration: "none",
                }}
              >
                <Phone size={14} /> {n.label} ({n.number})
              </a>
            ))}
          </div>
        </div>

        {/* Emergency Contacts */}
        <div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600", marginBottom: "0.75rem" }}>Emergency Contacts</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem", maxHeight: "160px", overflowY: "auto" }}>
            {contacts.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No contacts added yet.</p>
            ) : (
              contacts.map((c) => (
                <div key={c.id} className="glass" style={{ padding: "0.75rem 1rem", borderRadius: "0.85rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontWeight: "600", fontSize: "0.9rem" }}>{c.name} <span style={{ color: "var(--text-muted)", fontWeight: "400" }}>({c.relation})</span></p>
                    <a href={`tel:${c.phone}`} style={{ color: "var(--primary-light)", fontSize: "0.85rem" }}>{c.phone}</a>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <a href={`sms:${c.phone}?body=${encodeURIComponent(smsText)}`} style={{ padding: "0.4rem", color: "var(--primary-light)" }}>
                      <Send size={16} />
                    </a>
                    <button onClick={() => removeContact(c.id)} style={{ padding: "0.4rem", color: "#ef4444" }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Contact */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "0.5rem" }}>
            {[
              { val: name, set: setName, ph: "Name" },
              { val: phone, set: setPhone, ph: "Phone" },
              { val: relation, set: setRelation, ph: "Relation" },
            ].map((f, i) => (
              <input
                key={i}
                value={f.val}
                onChange={(e) => f.set(e.target.value)}
                placeholder={f.ph}
                style={{
                  padding: "0.7rem 0.85rem", borderRadius: "0.75rem",
                  background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)",
                  color: "var(--text-main)", fontSize: "0.85rem", outline: "none",
                }}
              />
            ))}
            <button
              onClick={addContact}
              style={{ padding: "0.7rem", borderRadius: "0.75rem", background: "var(--primary-color)", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes sosPulse { 0%,100%{box-shadow:0 0 40px rgba(239,68,68,0.4)} 50%{box-shadow:0 0 70px rgba(239,68,68,0.8)} }`}</style>
    </div>
  );
}
