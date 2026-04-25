# 🧪 Manual Testing Guide - Check Everything Works

## ✅ **Current Status Summary**
- ✅ Backend API: Running on http://localhost:8000
- ✅ Frontend App: Running on http://localhost:3000  
- ✅ Qdrant Cloud: Connected with medical data (6 items)
- ⚠️ Gemini API: Needs manual verification
- ✅ Database: SQLite with all tables
- ✅ Environment: All variables configured

## 🔧 **Step-by-Step Manual Tests**

### **1. Test Backend API Health**
Open your browser and go to:
```
http://localhost:8000/healthz
```
**Expected:** `{"status": "ok"}`

### **2. Test Frontend Loading**
Open your browser and go to:
```
http://localhost:3000
```
**Expected:** AuraHealth dashboard loads with all UI components

### **3. Test Medical Router (Text)**
Open Postman or use curl:
```bash
curl -X POST http://localhost:8000/v1/router \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user",
    "transcript": "I have a headache",
    "consent_to_save": false
  }'
```
**Expected:** JSON response with medical advice

### **4. Test Memory Endpoint**
```bash
curl http://localhost:8000/v1/memory/test_user
```
**Expected:** JSON with user memory (may be empty initially)

### **5. Test Frontend UI Components**

#### **A. Voice Agent Test**
1. Open http://localhost:3000
2. Click the microphone button
3. Type: "I have a headache, what should I do?"
4. Press Enter
**Expected:** Medical response text appears

#### **B. Prescription Scanner Test**
1. Click "Tools" tab
2. Click "Prescription Scanner"
3. Upload any image
**Expected:** Attempts to process with OCR

#### **C. Emergency SOS Test**
1. Click the red SOS button
2. Fill emergency form
**Expected:** Emergency alert interface appears

#### **D. Health Tools Test**
1. Click "Tools" tab
2. Try each tool:
   - First Aid Guide
   - Vitals Tracker  
   - Medicine Reminders
**Expected:** Each tool opens its modal/interface

## 🧠 **Test Gemini AI Integration**

### **Manual API Test**
```bash
curl -X POST http://localhost:8000/v1/router \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user", 
    "transcript": "What is paracetamol used for?",
    "consent_to_save": false
  }'
```

### **Check Gemini API Key**
1. Go to https://aistudio.google.com/
2. Verify your API key is active
3. Check usage limits

## 🗄️ **Test Qdrant Medical Database**

Your Qdrant Cloud has:
- ✅ medication_safety: 2 items
- ✅ ayush_guidelines: 2 items  
- ✅ nutrition: 2 items
- ✅ user_memory: 0 items (empty initially)

## 🎯 **Quick Functionality Test**

### **Test 1: Basic Medical Query**
1. Open http://localhost:3000
2. In voice agent, type: "I have fever"
3. Check if you get medical advice

### **Test 2: Emergency Detection**
1. Type: "I'm having chest pain"
2. Should trigger emergency response

### **Test 3: Multi-language**
1. Type: "मुझे सिर दर्द है" (Hindi)
2. Should detect language and respond appropriately

## 📊 **Test Results Checklist**

Mark each test as ✅ PASS or ❌ FAIL:

```
[ ] Backend health check
[ ] Frontend loads correctly
[ ] Medical router responds
[ ] Memory endpoint works
[ ] Voice agent text input
[ ] Prescription scanner opens
[ ] Emergency SOS interface
[ ] All health tools open
[ ] Medical knowledge base queries
[ ] Emergency detection
[ ] Multi-language support
```

## 🚨 **Troubleshooting**

### **If Backend Fails:**
- Check if port 8000 is free
- Restart backend: `cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload`

### **If Frontend Fails:**
- Check if port 3000 is free
- Restart frontend: `cd aurahealth && npm run dev`

### **If Gemini API Fails:**
- Verify API key from https://aistudio.google.com/
- Check your Gemini API usage/billing

### **If No Medical Responses:**
- Check Qdrant Cloud connection
- Verify medical data was ingested

## 🎉 **Success Criteria**

Your app is working perfectly when:
- ✅ All backend endpoints respond
- ✅ Frontend loads all components
- ✅ Medical queries return helpful advice
- ✅ Emergency detection works
- ✅ All UI tools are functional

## 📞 **Next Steps After Testing**

1. **Add Vapi Public Key** for voice features
2. **Test voice conversations** 
3. **Deploy or share** your medical assistant

**🏥 Your Integrative Health Orchestrator is ready for rural India healthcare!**
