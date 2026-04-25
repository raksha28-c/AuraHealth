"use client";

import { useState, useEffect } from "react";
import { Pill, Plus, Trash2, Bell, BellOff, X, Clock, CheckCircle } from "lucide-react";

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  times: string[];
  days: string[];
  notes?: string;
  taken: Record<string, boolean>;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const STORAGE_KEY = "aurahealth_medicines";

const todayKey = () => new Date().toISOString().split("T")[0];
const todayDay = () => DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

export default function MedicineReminder({ onClose }: { onClose: () => void }) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [time, setTime] = useState("08:00");
  const [selectedDays, setSelectedDays] = useState<string[]>(DAYS);
  const [notes, setNotes] = useState("");
  const [view, setView] = useState<"today" | "all" | "add">("today");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setMedicines(JSON.parse(stored));
  }, []);

  const save = (updated: Medicine[]) => {
    setMedicines(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addMedicine = () => {
    if (!name.trim() || !dosage.trim()) return;
    const med: Medicine = {
      id: Date.now().toString(),
      name, dosage,
      times: [time],
      days: selectedDays,
      notes: notes || undefined,
      taken: {},
    };
    save([...medicines, med]);
    setName(""); setDosage(""); setTime("08:00"); setSelectedDays(DAYS); setNotes("");
    setView("today");
  };

  const toggleTaken = (id: string) => {
    const key = `${todayKey()}_${id}`;
    const updated = medicines.map((m) =>
      m.id === id ? { ...m, taken: { ...m.taken, [key]: !m.taken[key] } } : m
    );
    save(updated);
  };

  const deleteMed = (id: string) => save(medicines.filter((m) => m.id !== id));

  const todayMeds = medicines.filter((m) => m.days.includes(todayDay()));
  const takenCount = todayMeds.filter((m) => m.taken[`${todayKey()}_${m.id}`]).length;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass modal-content" style={{ maxWidth: "700px", padding: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ padding: "0.6rem", borderRadius: "10px", background: "rgba(168,85,247,0.1)" }}>
              <Pill color="#a855f7" size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: "700" }}>Medicine Reminders</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Track your daily medications</p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: "var(--text-muted)" }}><X size={22} /></button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", background: "rgba(255,255,255,0.03)", padding: "0.35rem", borderRadius: "0.85rem" }}>
          {(["today", "all", "add"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              style={{
                flex: 1, padding: "0.6rem", borderRadius: "0.65rem", fontSize: "0.85rem", fontWeight: "600",
                background: view === tab ? "var(--primary-color)" : "transparent",
                color: view === tab ? "white" : "var(--text-muted)",
                transition: "all 0.2s",
              }}
            >
              {tab === "today" ? "Today" : tab === "all" ? "All Meds" : "+ Add New"}
            </button>
          ))}
        </div>

        {view === "today" && (
          <div>
            {/* Progress */}
            <div className="glass" style={{ padding: "1rem 1.25rem", borderRadius: "1rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Today's Progress</p>
                <p style={{ fontWeight: "700", fontSize: "1.1rem" }}>{takenCount} / {todayMeds.length} taken</p>
              </div>
              <div style={{ width: "80px", height: "80px", position: "relative" }}>
                <svg viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}>
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke="#a855f7" strokeWidth="3"
                    strokeDasharray={`${todayMeds.length > 0 ? (takenCount / todayMeds.length) * 100 : 0} 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: "0.85rem", fontWeight: "700", color: "#a855f7" }}>
                  {todayMeds.length > 0 ? Math.round((takenCount / todayMeds.length) * 100) : 0}%
                </span>
              </div>
            </div>

            {todayMeds.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
                <Pill size={40} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
                <p>No medicines scheduled for today.</p>
                <button onClick={() => setView("add")} style={{ marginTop: "1rem", color: "var(--primary-light)", fontSize: "0.9rem" }}>+ Add your first medicine</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {todayMeds.map((med) => {
                  const key = `${todayKey()}_${med.id}`;
                  const taken = !!med.taken[key];
                  return (
                    <div key={med.id} className="glass" style={{ padding: "1rem 1.25rem", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", opacity: taken ? 0.6 : 1, transition: "opacity 0.3s" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: taken ? "rgba(34,197,94,0.1)" : "rgba(168,85,247,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {taken ? <CheckCircle color="#22c55e" size={20} /> : <Pill color="#a855f7" size={20} />}
                        </div>
                        <div>
                          <p style={{ fontWeight: "600", textDecoration: taken ? "line-through" : "none" }}>{med.name}</p>
                          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{med.dosage} · {med.times.join(", ")}</p>
                          {med.notes && <p style={{ fontSize: "0.75rem", color: "var(--primary-light)" }}>{med.notes}</p>}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleTaken(med.id)}
                        style={{
                          padding: "0.5rem 1rem", borderRadius: "2rem", fontSize: "0.8rem", fontWeight: "600",
                          background: taken ? "rgba(34,197,94,0.1)" : "rgba(168,85,247,0.15)",
                          color: taken ? "#22c55e" : "#a855f7",
                          border: `1px solid ${taken ? "rgba(34,197,94,0.3)" : "rgba(168,85,247,0.3)"}`,
                        }}
                      >
                        {taken ? "Taken ✓" : "Mark Taken"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {view === "all" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {medicines.length === 0 ? (
              <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem" }}>No medicines added yet.</p>
            ) : (
              medicines.map((med) => (
                <div key={med.id} className="glass" style={{ padding: "1rem 1.25rem", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontWeight: "600" }}>{med.name} <span style={{ color: "var(--text-muted)", fontWeight: "400", fontSize: "0.85rem" }}>— {med.dosage}</span></p>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{med.days.join(", ")} · {med.times.join(", ")}</p>
                  </div>
                  <button onClick={() => deleteMed(med.id)} style={{ color: "#ef4444", padding: "0.4rem" }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {view === "add" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              { label: "Medicine Name", val: name, set: setName, ph: "e.g. Paracetamol 500mg" },
              { label: "Dosage", val: dosage, set: setDosage, ph: "e.g. 1 tablet" },
            ].map((f) => (
              <div key={f.label}>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>{f.label}</label>
                <input
                  value={f.val}
                  onChange={(e) => f.set(e.target.value)}
                  placeholder={f.ph}
                  style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "0.85rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "var(--text-main)", fontSize: "0.95rem", outline: "none" }}
                />
              </div>
            ))}

            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={{ padding: "0.85rem 1rem", borderRadius: "0.85rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "var(--text-main)", fontSize: "0.95rem", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>Days</label>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {DAYS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d])}
                    style={{
                      padding: "0.4rem 0.75rem", borderRadius: "2rem", fontSize: "0.8rem", fontWeight: "600",
                      background: selectedDays.includes(d) ? "#a855f7" : "rgba(255,255,255,0.05)",
                      color: selectedDays.includes(d) ? "white" : "var(--text-muted)",
                      border: `1px solid ${selectedDays.includes(d) ? "#a855f7" : "var(--border-color)"}`,
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>Notes (optional)</label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Take after food"
                style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "0.85rem", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "var(--text-main)", fontSize: "0.95rem", outline: "none" }}
              />
            </div>

            <button
              onClick={addMedicine}
              style={{ padding: "0.9rem", borderRadius: "0.85rem", background: "#a855f7", color: "white", fontWeight: "700", fontSize: "0.95rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
            >
              <Plus size={18} /> Add Medicine
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
