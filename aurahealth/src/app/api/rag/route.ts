import { NextResponse } from "next/server";

// This endpoint is meant to be called by Vapi as a server-side tool
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Vapi sends tool call details in the body
    // The structure depends on how the tool is configured in Vapi.
    // We assume the tool expects a `query` parameter.
    const query = body?.message?.toolCalls?.[0]?.function?.arguments 
      ? JSON.parse(body.message.toolCalls[0].function.arguments).query
      : body.query;

    if (!query) {
      return NextResponse.json({ error: "No query provided" }, { status: 400 });
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    const backendRes = await fetch(`${backendUrl}/vapi/tools/medicalvault`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await backendRes.json();
    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    return NextResponse.json({
      ...data
    });

  } catch (error: any) {
    console.error("Error in RAG endpoint:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
