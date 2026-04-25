# HACKBLR1 — Integrative Health Orchestrator (Voice-first)

Production-minded skeleton for rural India healthcare:
- **Voice**: Vapi WebRTC (frontend)
- **Intelligence**: Gemini 1.5 Flash (OCR + routing + translation loop)
- **Vector DB**: Qdrant (RAG + Patient Memory)
- **UI**: Next.js + Tailwind (mobile responsive)

## What’s implemented

- **Intelligent Router** (`backend/app/main.py`):
  - Classifies transcript into **EMERGENCY / ALLOPATHY / AYURVEDA / NUTRITION**
  - Pulls last **3** patient memories before answering
  - Queries domain-specific Qdrant collections
  - **Guardrail**: if similarity < **0.75** → “I’m not sure, please consult the local PHC.”
  - **Multilingual loop**: detect language → translate to English for RAG → translate response back

- **Patient Memory** (`/v1/memory/*`):
  - Saves only when **consent** is true (DPDP-friendly)

- **Prescription Scanner** (`/v1/prescription/scan`):
  - Skeleton endpoint that extracts medicine names/dosage/warnings via Gemini

- **Frontend wiring** (`aurahealth/`):
  - Existing UI now routes RAG + memory to the backend via `NEXT_PUBLIC_BACKEND_URL`
  - Adds a **Prescription Scanner** tool card section
  - Adds a **consent toggle** (“Save to patient memory”)

## Setup

### 1) Environment variables

- Copy `.env.example` → `.env` (optional for local reference)
- For frontend: `aurahealth/.env.example` → `aurahealth/.env.local`
- For backend: `backend/.env.example` → `backend/.env`

Required:
- `NEXT_PUBLIC_VAPI_PUBLIC_KEY`
- `GOOGLE_AI_API_KEY`
- `QDRANT_URL`
- `QDRANT_API_KEY` (if using Qdrant Cloud)

### 2) Run Qdrant (local)

If you don’t have Qdrant cloud, run locally:

```bash
docker run -p 6333:6333 qdrant/qdrant
```

### 3) Run backend (FastAPI)

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 4) Run frontend (Next.js)

```bash
cd aurahealth
npm install
npm run dev
```

Open `http://localhost:3000`.

## Vapi configuration (tool calling)

Expose a tool in Vapi named `medicalVault` whose server URL points to:
- `POST http://<your-backend>/vapi/tools/medicalvault`

The tool arguments can be:
- `{ "query": "<user question>", "user_id": "<profile>" }`

## Notes / Safety

- Secrets were removed from committed env files. Do not commit real keys.
- The prescription scanner endpoint is a minimal skeleton; upgrade to proper multimodal parts (inlineData) for production.

