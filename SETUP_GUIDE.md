# AuraHealth - Quick Setup Guide

## 🚀 What You Need to Do Manually

### 1. **Set Up Your Gemini API Key** ⭐ REQUIRED
```bash
# Edit backend/.env
GOOGLE_AI_API_KEY=your_actual_gemini_api_key_here

# Edit aurahealth/.env.local  
GOOGLE_AI_API_KEY=your_actual_gemini_api_key_here
```

### 2. **Set Up Qdrant Vector Database** ⭐ REQUIRED

**Option A: Qdrant Cloud (Recommended)**
1. Go to https://cloud.qdrant.io/
2. Create free account and cluster
3. Get API key and cluster URL
4. Update .env files:
   ```
   QDRANT_URL=https://your-cluster.qdrant.io
   QDRANT_API_KEY=your-api-key
   ```

**Option B: Local Docker**
1. Install Docker Desktop
2. Run: `docker run -p 6333:6333 qdrant/qdrant`

### 3. **Set Up Vapi for Voice** (Optional for voice features)
1. Go to https://vapi.ai/
2. Get API keys
3. Update .env files:
   ```
   NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key
   VAPI_PRIVATE_KEY=your_vapi_private_key
   ```

## 🏃‍♂️ Quick Start Commands

```bash
# 1. Install dependencies
cd backend && pip install -r requirements.txt
cd ../aurahealth && npm install

# 2. Start backend (in one terminal)
cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# 3. Start frontend (in another terminal)  
cd aurahealth && npm run dev

# 4. Ingest medical data (third terminal)
python ingest_medical_data.py
```

## 🌐 Access Your App

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🧪 Test Everything Works

1. Open http://localhost:3000
2. Try the health assistant (type medical questions)
3. Test prescription scanner
4. Check emergency SOS features

## 📱 Features Ready

✅ **Voice Agent** - Multi-language medical assistant  
✅ **Prescription Scanner** - OCR for medicine labels  
✅ **Emergency SOS** - One-tap emergency alerts  
✅ **Vitals Tracker** - Health metrics logging  
✅ **Medicine Reminders** - Daily medication tracking  
✅ **First Aid Guide** - Emergency instructions  
✅ **Clinic Map** - Nearby healthcare facilities  
✅ **Family Profiles** - Multi-user health management  

## 🔧 Troubleshooting

**Backend won't start?**
- Check your Gemini API key is valid
- Ensure Qdrant is accessible

**Frontend errors?**
- Check NEXT_PUBLIC_BACKEND_URL is correct
- Verify backend is running on port 8000

**No medical responses?**
- Run `python ingest_medical_data.py` to populate database
- Check Qdrant connection

## 🎯 Next Steps

1. Get your Gemini API key from https://aistudio.google.com/
2. Choose Qdrant setup (Cloud recommended)
3. Update the .env files with your keys
4. Run the ingestion script to populate medical data
5. Start testing the full application!

## 📞 Need Help?

- Check the README.md in each folder
- Look at the API docs at http://localhost:8000/docs
- All components are modular - can be used independently
