import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const profile = searchParams.get('profile') || 'Self';

  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    const r = await fetch(`${backendUrl}/v1/memory/${encodeURIComponent(profile)}`);
    const data = await r.json();
    if (!r.ok) return NextResponse.json({ history: [] });

    // keep old shape expected by existing UI: { history: [{payload: ...}, ...] }
    return NextResponse.json({ history: (data.last || []).map((p: any) => ({ payload: p })) });
  } catch (error: any) {
    return NextResponse.json({ history: [] }); // Fail gracefully for demo
  }
}

export async function POST(req: Request) {
  try {
    const report = await req.json();
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

    const payload = {
      user_id: report.profile,
      summary: report.description || report.summary || "Consultation summary",
      raw_text: report.description || null,
      consent_to_save: Boolean(report.consentToSave),
      metadata: {
        symptoms: report.symptoms || [],
        priority: report.priority || "medium",
      }
    };

    const r = await fetch(`${backendUrl}/v1/memory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Memory Storage Error:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
