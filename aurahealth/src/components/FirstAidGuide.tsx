"use client";

import { useState } from "react";
import { AlertTriangle, ChevronRight, ChevronLeft, CheckCircle, Heart, Wind, Droplets, Flame, Zap, Bone, Eye, X } from "lucide-react";

const FIRST_AID_DATA = [
  {
    id: "cpr",
    title: "CPR",
    subtitle: "Cardiac Arrest",
    icon: Heart,
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
    steps: [
      "Call emergency services (112) immediately.",
      "Lay the person flat on their back on a firm surface.",
      "Place heel of hand on center of chest (lower half of breastbone).",
      "Push hard and fast — at least 2 inches deep, 100–120 compressions/min.",
      "After 30 compressions, give 2 rescue breaths (tilt head, lift chin, seal mouth).",
      "Continue 30:2 cycle until help arrives or person recovers.",
    ],
    warning: "Only perform rescue breaths if trained. Hands-only CPR is still effective.",
  },
  {
    id: "choking",
    title: "Choking",
    subtitle: "Airway Obstruction",
    icon: Wind,
    color: "#f97316",
    bg: "rgba(249,115,22,0.1)",
    steps: [
      "Ask 'Are you choking?' — if they can't speak/cough, act immediately.",
      "Stand behind the person, lean them slightly forward.",
      "Give 5 firm back blows between shoulder blades with heel of hand.",
      "Give 5 abdominal thrusts (Heimlich): fist above navel, pull sharply inward-upward.",
      "Alternate 5 back blows and 5 abdominal thrusts.",
      "If unconscious, begin CPR and look for object before rescue breaths.",
    ],
    warning: "For infants under 1 year, use 2 fingers for chest thrusts — never abdominal thrusts.",
  },
  {
    id: "bleeding",
    title: "Severe Bleeding",
    subtitle: "Wound Control",
    icon: Droplets,
    color: "#dc2626",
    bg: "rgba(220,38,38,0.1)",
    steps: [
      "Protect yourself — wear gloves if available.",
      "Apply firm, direct pressure with a clean cloth or bandage.",
      "Do NOT remove the cloth — add more on top if soaked.",
      "Elevate the injured limb above heart level if possible.",
      "Apply a tourniquet 2–3 inches above wound if bleeding is life-threatening.",
      "Note the time tourniquet was applied and call 112.",
    ],
    warning: "Never remove an embedded object. Stabilize it in place.",
  },
  {
    id: "burns",
    title: "Burns",
    subtitle: "Thermal Injury",
    icon: Flame,
    color: "#ea580c",
    bg: "rgba(234,88,12,0.1)",
    steps: [
      "Remove from heat source. Ensure your own safety first.",
      "Cool the burn under cool (not cold/ice) running water for 20 minutes.",
      "Remove jewelry/clothing near the burn — unless stuck to skin.",
      "Cover loosely with a clean non-fluffy material (cling film is ideal).",
      "Do NOT apply butter, toothpaste, or ice.",
      "Seek medical help for burns larger than 3cm or on face/hands/genitals.",
    ],
    warning: "Chemical burns: brush off dry chemical first, then flush with water for 20+ minutes.",
  },
  {
    id: "shock",
    title: "Shock",
    subtitle: "Circulatory Failure",
    icon: Zap,
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.1)",
    steps: [
      "Call 112 immediately — shock is life-threatening.",
      "Lay the person down and elevate legs 12 inches (unless head/spine injury).",
      "Keep them warm with a blanket.",
      "Do NOT give food or water.",
      "Loosen tight clothing around neck and waist.",
      "Monitor breathing and pulse. Begin CPR if they stop breathing.",
    ],
    warning: "Signs: pale/cold/clammy skin, rapid weak pulse, confusion, rapid breathing.",
  },
  {
    id: "fracture",
    title: "Fractures",
    subtitle: "Broken Bones",
    icon: Bone,
    color: "#0891b2",
    bg: "rgba(8,145,178,0.1)",
    steps: [
      "Do NOT try to straighten the bone.",
      "Immobilize the injured area using a splint or padding.",
      "Apply ice pack wrapped in cloth to reduce swelling.",
      "Elevate the limb if possible.",
      "For open fractures (bone visible), cover with clean dressing — do not push bone in.",
      "Seek immediate medical attention.",
    ],
    warning: "Suspected spinal injury: do NOT move the person unless in immediate danger.",
  },
  {
    id: "eye",
    title: "Eye Injury",
    subtitle: "Ocular Emergency",
    icon: Eye,
    color: "#0b9199",
    bg: "rgba(11,145,153,0.1)",
    steps: [
      "Do NOT rub the eye.",
      "For chemical splash: flush with clean water for 15–20 minutes continuously.",
      "For foreign object: try blinking or flushing with water — do not remove with fingers.",
      "For embedded object: do NOT remove. Cover both eyes with clean cloth.",
      "For a black eye: apply cold compress for 15 min intervals.",
      "Seek medical attention for any serious eye injury.",
    ],
    warning: "Always cover BOTH eyes — they move together. Moving one moves the other.",
  },
];

export default function FirstAidGuide({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<typeof FIRST_AID_DATA[0] | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const handleSelect = (item: typeof FIRST_AID_DATA[0]) => {
    setSelected(item);
    setCurrentStep(0);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="glass modal-content" style={{ maxWidth: "900px", padding: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ padding: "0.6rem", borderRadius: "10px", background: "rgba(239,68,68,0.1)" }}>
              <AlertTriangle color="#ef4444" size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: "700" }}>First Aid Guide</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Step-by-step emergency instructions</p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: "var(--text-muted)", padding: "0.5rem" }}>
            <X size={22} />
          </button>
        </div>

        {!selected ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
            {FIRST_AID_DATA.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="glass card"
                  style={{ padding: "1.25rem", textAlign: "left", cursor: "pointer", border: `1px solid ${item.color}22`, transition: "all 0.2s" }}
                >
                  <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem" }}>
                    <Icon color={item.color} size={20} />
                  </div>
                  <p style={{ fontWeight: "600", marginBottom: "0.25rem" }}>{item.title}</p>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{item.subtitle}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.75rem", color: item.color, fontSize: "0.8rem" }}>
                    <span>{item.steps.length} steps</span>
                    <ChevronRight size={14} />
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div>
            <button
              onClick={() => setSelected(null)}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.9rem" }}
            >
              <ChevronLeft size={16} /> Back to all guides
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
              <div style={{ width: "50px", height: "50px", borderRadius: "12px", background: selected.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <selected.icon color={selected.color} size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.3rem", fontWeight: "700" }}>{selected.title}</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{selected.subtitle}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ display: "flex", gap: "0.4rem", marginBottom: "2rem" }}>
              {selected.steps.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  style={{
                    flex: 1, height: "4px", borderRadius: "2px", cursor: "pointer",
                    background: i <= currentStep ? selected.color : "rgba(255,255,255,0.1)",
                    transition: "background 0.3s"
                  }}
                />
              ))}
            </div>

            {/* Current step */}
            <div className="glass" style={{ padding: "2rem", borderRadius: "1.25rem", marginBottom: "1.5rem", borderLeft: `4px solid ${selected.color}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                <div style={{ minWidth: "36px", height: "36px", borderRadius: "50%", background: selected.bg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", color: selected.color, fontSize: "0.9rem" }}>
                  {currentStep + 1}
                </div>
                <p style={{ fontSize: "1.05rem", lineHeight: "1.7", paddingTop: "0.4rem" }}>{selected.steps[currentStep]}</p>
              </div>
            </div>

            {/* All steps mini list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem" }}>
              {selected.steps.map((step, i) => (
                <div
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0.75rem",
                    borderRadius: "0.75rem", cursor: "pointer",
                    background: i === currentStep ? `${selected.color}15` : "transparent",
                    opacity: i < currentStep ? 0.5 : 1,
                    transition: "all 0.2s"
                  }}
                >
                  {i < currentStep ? (
                    <CheckCircle size={16} color={selected.color} />
                  ) : (
                    <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: `2px solid ${i === currentStep ? selected.color : "rgba(255,255,255,0.2)"}` }} />
                  )}
                  <span style={{ fontSize: "0.85rem", color: i === currentStep ? "var(--text-main)" : "var(--text-muted)" }}>{step}</span>
                </div>
              ))}
            </div>

            {/* Warning */}
            <div style={{ padding: "1rem 1.25rem", borderRadius: "0.75rem", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", marginBottom: "1.5rem", display: "flex", gap: "0.75rem" }}>
              <AlertTriangle size={16} color="#fbbf24" style={{ flexShrink: 0, marginTop: "2px" }} />
              <p style={{ fontSize: "0.85rem", color: "#fbbf24", lineHeight: "1.5" }}>{selected.warning}</p>
            </div>

            {/* Navigation */}
            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="glass"
                style={{ flex: 1, padding: "0.85rem", borderRadius: "0.85rem", opacity: currentStep === 0 ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
              >
                <ChevronLeft size={18} /> Previous
              </button>
              {currentStep < selected.steps.length - 1 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  style={{ flex: 1, padding: "0.85rem", borderRadius: "0.85rem", background: selected.color, color: "white", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                >
                  Next Step <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  onClick={() => setSelected(null)}
                  style={{ flex: 1, padding: "0.85rem", borderRadius: "0.85rem", background: selected.color, color: "white", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                >
                  <CheckCircle size={18} /> Done
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
