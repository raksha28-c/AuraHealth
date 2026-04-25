"use client";

import { useState, useEffect } from "react";
import { Activity, Heart, Thermometer, Wind, Plus, TrendingUp, TrendingDown, Minus, X } from "lucide-react";

interface VitalEntry {
  id: string;
  type: "heartRate" | "bloodPressure" | "temperature" | "oxygenSat";
  value: string;
  timestamp: string;
  note?: string;
}

const VITAL_CONFIG = {
  heartRate: {
    label: "Heart Rate",
    unit: "bpm",
    icon: Heart,
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
    normal: "60–100",
    placeholder: "e.g. 72",
    check: (v: number) => v >= 60 && v <= 100,
  },
  bloodPressure: {
    label: "Blood Pressure",
    unit: "mmHg",
    icon: Activity,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
    normal: "120/80",
    placeholder: "e.g. 120/80",
    check: (v: number) => v >= 90 && v <= 140,
  },
  temperature: {
    label: "Temperature",
    unit: "°C",
    icon: Thermometer,
    color: "#f97316",
    bg: "rgba(249,115,22,0.1)",
    normal: "36.1–37.2",
    placeholder: "e.g. 36.6",
    check: (v: number) => v >= 36.1 && v <= 37.2,
  },
  oxygenSat: {
    label: "Oxygen Saturation",
    unit: "%",
    icon: Wind,
    color: "#0b9199",
    bg: "rgba(11,145,153,0.1)",
    normal: "95–100",
    placeholder: "e.g. 98",
    check: (v: number) => v >= 95,
  },
};

const STORAGE_KEY = "aurahealth_vitals";

function getStatus(type: keyof typeof VITAL_CONFIG, value: string) {
  const num = parseFloat(value.split("/")[0]);
  if (isNaN(num)) return "unknown";
  return VITAL_CONFIG[type].check(num) ? "normal" : "abnormal";
}

export default function VitalsTracker({ onClose }: { onClose: () => void }) {
  const [entries, setEntries] = useState<VitalEntry[]>([]);
  const [activeType, setActiveType] = useState<keyof typeof VITAL_CONFIG>("heartRate");
  const [inputValue, setInputValue] = useState("");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setEntries(JSON.parse(stored));
  }, []);

  const saveEntry = () => {
    if (!inputValue.trim()) return;
    const newEntry: VitalEntry = {
      id: Date.now().toString(),
      type: activeType,
      value: inputValue,
      timestamp: new Date().toLocaleString(),
      note: note || undefined,
    };
    const updated = [newEntry, ...entries].slice(0, 50);
    setEntries(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setInputValue("");
    setNote("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const deleteEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const recentByType = (type: keyof typeof VITAL_CONFIG) =>
    entries.filter((e) => e.type === type).slice(0, 5);

  const latestByType = (type: keyof typeof VITAL_CONFIG) =>
    entries.find((e) => e.type === type);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass modal-content" style={{ maxWidth: "900px", padding: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ padding: "0.6rem", borderRadius: "10px", background: "rgba(11,145,153,0.1)" }}>
              <Activity color="var(--primary-light)" size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: "700" }}>Vitals Tracker</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Log and monitor your health metrics</p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: "var(--text-muted)" }}><X size={22} /></button>
        </div>

        {/* Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {(Object.keys(VITAL_CONFIG) as Array<keyof typeof VITAL_CONFIG>).map((type) => {
            const cfg = VITAL_CONFIG[type];
            const Icon = cfg.icon;
            const latest = latestByType(type);
            const status = latest ? getStatus(type, latest.value) : null;
            return (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className="glass card"
                style={{ padding: "1rem", textAlign: "left", border: activeType === type ? `1px solid ${cfg.color}` : "1px solid var(--border-color)", transition: "all 0.2s" }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <Icon color={cfg.color} size={18} />
                  {status && (
                    <span style={{ fontSize: "0.65rem", padding: "0.2rem 0.5rem", borderRadius: "1rem", background: status === "normal" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: status === "normal" ? "#22c55e" : "#ef4444", fontWeight: "600" }}>
                      {status}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>{cfg.label}</p>
                <p style={{ fontSize: "1.1rem", fontWeight: "700", color: cfg.color }}>
                  {latest ? `${latest.value} ${cfg.unit}` : "—"}
                </p>
                <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Normal: {cfg.normal}</p>
              </button>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          {/* Input Panel */}
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem" }}>
              Log {VITAL_CONFIG[activeType].label}
            </h3>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveEntry()}
                placeholder={VITAL_CONFIG[activeType].placeholder}
                style={{
                  flex: 1, padding: "0.85rem 1rem", borderRadius: "0.85rem",
                  background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)",
                  color: "var(--text-main)", fontSize: "1rem", outline: "none",
                }}
              />
              <span style={{ display: "flex", alignItems: "center", padding: "0 0.75rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                {VITAL_CONFIG[activeType].unit}
              </span>
            </div>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note (e.g. after exercise)"
              style={{
                width: "100%", padding: "0.75rem 1rem", borderRadius: "0.85rem",
                background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)",
                color: "var(--text-main)", fontSize: "0.9rem", outline: "none", marginBottom: "1rem",
              }}
            />
            <button
              onClick={saveEntry}
              style={{
                width: "100%", padding: "0.85rem", borderRadius: "0.85rem",
                background: saved ? "#22c55e" : VITAL_CONFIG[activeType].color,
                color: "white", fontWeight: "600", fontSize: "0.95rem",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                transition: "background 0.3s"
              }}
            >
              {saved ? "✓ Saved!" : <><Plus size={18} /> Log Reading</>}
            </button>

            {/* Normal range info */}
            <div className="glass" style={{ padding: "1rem", borderRadius: "0.85rem", marginTop: "1rem" }}>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Normal Range</p>
              <p style={{ fontWeight: "600", color: VITAL_CONFIG[activeType].color }}>
                {VITAL_CONFIG[activeType].normal} {VITAL_CONFIG[activeType].unit}
              </p>
            </div>
          </div>

          {/* History */}
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem" }}>Recent Readings</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", maxHeight: "320px", overflowY: "auto" }}>
              {recentByType(activeType).length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", textAlign: "center", padding: "2rem" }}>No readings yet</p>
              ) : (
                recentByType(activeType).map((entry, i) => {
                  const status = getStatus(entry.type, entry.value);
                  const cfg = VITAL_CONFIG[entry.type];
                  const prev = recentByType(activeType)[i + 1];
                  const trend = prev
                    ? parseFloat(entry.value) > parseFloat(prev.value)
                      ? "up"
                      : parseFloat(entry.value) < parseFloat(prev.value)
                      ? "down"
                      : "same"
                    : null;
                  return (
                    <div key={entry.id} className="glass" style={{ padding: "0.85rem 1rem", borderRadius: "0.85rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ fontWeight: "700", fontSize: "1.1rem", color: cfg.color }}>{entry.value}</span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{cfg.unit}</span>
                          {trend === "up" && <TrendingUp size={14} color="#ef4444" />}
                          {trend === "down" && <TrendingDown size={14} color="#22c55e" />}
                          {trend === "same" && <Minus size={14} color="var(--text-muted)" />}
                        </div>
                        <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{entry.timestamp}</p>
                        {entry.note && <p style={{ fontSize: "0.72rem", color: "var(--primary-light)", marginTop: "0.2rem" }}>{entry.note}</p>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontSize: "0.65rem", padding: "0.2rem 0.5rem", borderRadius: "1rem", background: status === "normal" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: status === "normal" ? "#22c55e" : "#ef4444" }}>
                          {status}
                        </span>
                        <button onClick={() => deleteEntry(entry.id)} style={{ color: "var(--text-muted)", padding: "0.25rem" }}>
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
