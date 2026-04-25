# Qdrant Cloud Setup Instructions

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Qdrant Cloud Account
1. Go to https://cloud.qdrant.io/
2. Click "Sign Up" and create a free account
3. Verify your email

### Step 2: Create Your First Cluster
1. Click "Create Cluster"
2. Choose: 
   - **Region**: Asia Pacific (or closest to you)
   - **Plan**: Free tier (1GB storage, enough for testing)
   - **Name**: hackblr1-cluster
3. Click "Create"

### Step 3: Get Your Credentials
1. Once cluster is ready (takes 1-2 minutes)
2. Click on your cluster name
3. Go to "API Keys" tab
4. Copy the **API Key**
5. Go to "Overview" tab and copy the **Cluster URL**

### Step 4: Update Your Environment Files

In `backend/.env`, replace:
```
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your_qdrant_api_key
```

With:
```
QDRANT_URL=https://your-cluster-name.qdrant.io
QDRANT_API_KEY=paste-your-api-key-here
```

In `aurahealth/.env.local`, replace:
```
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your_qdrant_api_key
```

With:
```
QDRANT_URL=https://your-cluster-name.qdrant.io
QDRANT_API_KEY=paste-your-api-key-here
```

### Step 5: Test Connection
```bash
python setup_qdrant.py
```

### Step 6: Populate Medical Data
```bash
python ingest_medical_data.py
```

## ✅ Benefits of Qdrant Cloud
- ✅ No installation required
- ✅ Always available
- ✅ Free tier for development
- ✅ Easy to scale later
- ✅ Built-in monitoring

## 🔧 Alternative: Local Setup
If you prefer local setup, you'll need:
1. Install Docker Desktop
2. Run: `docker run -p 6333:6333 qdrant/qdrant`
3. Keep the current localhost settings

## 📞 Need Help?
- Qdrant documentation: https://qdrant.tech/documentation/
- Support: https://cloud.qdrant.io/support
