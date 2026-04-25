# 🎯 VAPI + QDRANT SETUP GUIDE

Your app is now properly configured to use Vapi and Qdrant! Here's how to set them up:

## 📋 WHAT'S CONFIGURED:

### ✅ VAPI INTEGRATION:
- VoiceAgent uses Vapi for voice conversations
- `medicalVault` function connects to backend
- Voice conversations use Qdrant for medical knowledge

### ✅ QDRANT INTEGRATION:
- Backend searches medical collections: `medication_safety`, `ayush_guidelines`, `nutrition`
- User memory stored in `user_memory` collection
- Vector embeddings for semantic search

### ✅ BACKEND ENDPOINTS:
- `/v1/router` - Medical routing with Qdrant
- `/vapi/tools/medicalvault` - Vapi tool endpoint
- `/v1/memory/{user_id}` - User memory retrieval

## 🔧 SETUP YOUR API KEYS:

### 1. QDRANT SETUP:
```bash
# Get your Qdrant Cloud details:
# 1. Go to https://cloud.qdrant.io
# 2. Create a cluster
# 3. Get your URL and API key
```

### 2. GEMINI API SETUP:
```bash
# Get your Gemini API key:
# 1. Go to https://makersuite.google.com/app/apikey
# 2. Create a new API key
# 3. Copy the key
```

### 3. VAPI SETUP:
```bash
# Get your Vapi public key:
# 1. Go to https://vapi.ai
# 2. Create an account
# 3. Get your public key
```

## 📝 ENVIRONMENT VARIABLES:

Create/update these files:

### Backend (c:\Users\raksh\OneDrive\Desktop\HackBlr 1\backend\app\.env):
```env
QDRANT_URL=https://your-actual-qdrant-url.qdrant.io
QDRANT_API_KEY=your-actual-qdrant-api-key
GEMINI_API_KEY=your-actual-gemini-api-key
JWT_SECRET=your-jwt-secret
DATABASE_URL=sqlite:///./test.db
```

### Frontend (c:\Users\raksh\OneDrive\Desktop\HackBlr 1\aurahealth\.env.local):
```env
NEXT_PUBLIC_VAPI_PUBLIC_KEY=vapi_your-actual-public-key
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

## 🚀 TEST YOUR SETUP:

### 1. Start Backend:
```bash
cd "c:\Users\raksh\OneDrive\Desktop\HackBlr 1\backend\app"
python main.py
```

### 2. Start Frontend:
```bash
cd "c:\Users\raksh\OneDrive\Desktop\HackBlr 1\aurahealth"
npm run dev
```

### 3. Test Integration:
```bash
# Test Vapi tool endpoint:
curl -X POST http://localhost:8000/vapi/tools/medicalvault \
  -H "Content-Type: application/json" \
  -d '{"query": "I have a headache", "user_id": "test"}'
```

## 🎯 HOW IT WORKS:

### VOICE FLOW:
1. User speaks → Vapi processes speech
2. Vapi calls `medicalVault` tool → Backend
3. Backend searches Qdrant collections → Medical knowledge
4. Backend generates response → Vapi speaks to user

### TEXT FLOW:
1. User types text → Frontend
2. Frontend calls `/v1/router` → Backend
3. Backend searches Qdrant → Medical knowledge
4. Backend returns response → Frontend displays

### MEMORY FLOW:
1. User conversation → Backend
2. Backend creates embedding → Gemini
3. Backend stores in Qdrant `user_memory` collection
4. Future searches find relevant context

## 🔍 TESTING YOUR SETUP:

### Test 1: Voice Conversation
1. Open http://localhost:3000
2. Click microphone button
3. Say: "I have a headache"
4. Should get voice response using Qdrant knowledge

### Test 2: Text Conversation  
1. Type: "What ayurvedic remedy for cough?"
2. Should get AYURVEDA domain response
3. Response should use Qdrant ayush_guidelines collection

### Test 3: Emergency Detection
1. Type: "I have severe chest pain"
2. Should trigger EMERGENCY domain
3. Should call emergency protocols

### Test 4: Memory Context
1. Ask about headache twice
2. Second response should reference previous context
3. Memory stored in Qdrant user_memory collection

## 🎉 ONCE CONFIGURED:

Your app will have:
- ✅ Voice conversations with Vapi
- ✅ Medical knowledge from Qdrant
- ✅ Contextual memory
- ✅ Emergency detection
- ✅ Multi-domain expertise (Allopathy, Ayurveda, Nutrition)

## 🚨 IMPORTANT:

- Replace placeholder API keys with real ones
- Ensure Qdrant collections are populated with medical data
- Test each integration step by step
- Check browser console for any errors

**Your app is ready for Vapi + Qdrant integration!** 🏥✨
