# Vapi Setup for Voice Agent

## 🎤 Why Vapi is Required

Vapi is essential for the voice agent functionality. Without it:
- ❌ No voice conversations
- ❌ No real-time speech recognition
- ❌ No medical voice assistant
- ❌ Only text-based chat will work

## 🚀 Vapi Setup (5 minutes)

### Step 1: Create Vapi Account
1. Go to https://vapi.ai/
2. Click "Sign Up" and create a free account
3. Verify your email

### Step 2: Get Your API Keys
1. Go to Dashboard → API Keys
2. You'll need two keys:
   - **Public Key** (for frontend)
   - **Private Key** (for backend)

### Step 3: Update Environment Files

**In `backend/.env`:**
```
VAPI_PRIVATE_KEY=your_vapi_private_key_here
```

**In `aurahealth/.env.local`:**
```
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key_here
VAPI_PRIVATE_KEY=your_vapi_private_key_here
```

### Step 4: Configure Vapi Tool
1. In Vapi Dashboard → Tools
2. Create new tool named `medicalVault`
3. Set Server URL to: `http://localhost:8000/vapi/tools/medicalvault`
4. Tool arguments:
   ```json
   {
     "query": "<user question>", 
     "user_id": "<profile>"
   }
   ```

### Step 5: Test Voice Agent
1. Restart both backend and frontend
2. Open http://localhost:3000
3. Click the microphone button
4. Ask: "I have a headache, what should I do?"

## 🔧 What Vapi Enables

✅ **Real-time voice conversations**  
✅ **Multi-language support** (Hindi, Kannada, Tamil, etc.)  
✅ **Medical symptom analysis**  
✅ **Emergency detection**  
✅ **Prescription reading**  
✅ **Family profile switching**  

## 💰 Pricing
- **Free tier**: 100 minutes/month
- **Pay-as-you-go**: $0.05/minute after
- Perfect for development and testing

## 🚨 Without Vapi
The app will still work but with limitations:
- ✅ Text chat works
- ✅ Prescription scanner works
- ✅ Emergency SOS works
- ✅ All UI components work
- ❌ No voice conversations
- ❌ No real-time speech recognition

## 📞 Support
- Vapi docs: https://docs.vapi.ai/
- Discord: https://discord.gg/vapi
