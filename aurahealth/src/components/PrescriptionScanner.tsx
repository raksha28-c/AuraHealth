"use client";

import { useMemo, useState } from "react";
import { Upload, FileImage, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";

type ScanResult = {
  medicines: Array<{ name?: string; dose?: string; frequency?: string; duration?: string }>;
  warnings: string[];
  raw_text?: string | null;
};

export default function PrescriptionScanner() {
  const backendUrl = useMemo(
    () => process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000",
    []
  );

  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);

  const onPick = (f: File | null) => {
    setFile(f);
    setError(null);
    setResult(null);
  };

  const scan = async () => {
    if (!file) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const r = await fetch(`${backendUrl}/v1/prescription/scan`, {
        method: "POST",
        body: form,
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.detail || "Scan failed");
      setResult(data);
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="glass" style={{ padding: "1.25rem", borderRadius: "1rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>Prescription Scanner</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Drag & drop an image to extract medicines and warnings (Gemini 1.5 Flash).
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <label
            className="glass"
            style={{
              padding: "0.55rem 0.85rem",
              borderRadius: "0.9rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Upload size={16} />
            Choose file
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onPick(e.target.files?.[0] || null)}
              style={{ display: "none" }}
            />
          </label>
          <button
            onClick={scan}
            disabled={!file || busy}
            style={{
              padding: "0.55rem 0.9rem",
              borderRadius: "0.9rem",
              background: "var(--primary-color)",
              color: "white",
              border: "none",
              cursor: !file || busy ? "not-allowed" : "pointer",
              opacity: !file || busy ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontWeight: 700,
            }}
          >
            {busy ? <Loader2 size={16} className="spin" /> : <FileImage size={16} />}
            Scan
          </button>
        </div>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const f = e.dataTransfer.files?.[0];
          if (f) onPick(f);
        }}
        style={{
          marginTop: "1rem",
          border: "1px dashed var(--border-color)",
          borderRadius: "1rem",
          padding: "1.25rem",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.85rem" }}>
          {file ? (
            <>
              <b style={{ color: "var(--text-main)" }}>{file.name}</b> ({Math.round(file.size / 1024)} KB)
            </>
          ) : (
            "Drop prescription image here (jpg/png/webp)."
          )}
        </p>
      </div>

      {error && (
        <div style={{ marginTop: "1rem", color: "#ef4444", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#22c55e", fontWeight: 700 }}>
            <CheckCircle2 size={16} /> Extracted
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.75rem", marginTop: "0.75rem" }}>
            <div className="glass" style={{ padding: "0.9rem", borderRadius: "0.9rem" }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9rem" }}>Medicines</p>
              <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {(result.medicines || []).length === 0 ? (
                  <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.85rem" }}>No medicines detected.</p>
                ) : (
                  result.medicines.map((m, i) => (
                    <div key={i} style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.9)" }}>
                      <b>{m.name || "Unknown"}</b>
                      {m.dose ? ` — ${m.dose}` : ""}
                      {m.frequency ? `, ${m.frequency}` : ""}
                      {m.duration ? `, ${m.duration}` : ""}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="glass" style={{ padding: "0.9rem", borderRadius: "0.9rem" }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9rem" }}>Warnings</p>
              <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {(result.warnings || []).length === 0 ? (
                  <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.85rem" }}>No warnings detected.</p>
                ) : (
                  result.warnings.map((w, i) => (
                    <p key={i} style={{ margin: 0, color: "#f97316", fontSize: "0.85rem" }}>
                      - {w}
                    </p>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

