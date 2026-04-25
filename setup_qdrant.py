#!/usr/bin/env python3
"""
Setup script for Qdrant vector database
Run this to start Qdrant locally without Docker
"""

import subprocess
import sys
import os

def install_qdrant_client():
    """Install Qdrant client if not already installed"""
    try:
        import qdrant_client
        print("✅ Qdrant client already installed")
        return True
    except ImportError:
        print("📦 Installing Qdrant client...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "qdrant-client"])
        print("✅ Qdrant client installed successfully")
        return True

def setup_local_qdrant():
    """Setup instructions for local Qdrant"""
    print("\n🚀 QDRANT SETUP OPTIONS:")
    print("=" * 50)
    print("\nOption 1: Use Qdrant Cloud (Recommended)")
    print("1. Go to https://cloud.qdrant.io/")
    print("2. Create a free account")
    print("3. Create a new cluster")
    print("4. Get your API key and cluster URL")
    print("5. Update your .env file with:")
    print("   QDRANT_URL=https://your-cluster-url.qdrant.io")
    print("   QDRANT_API_KEY=your-api-key")
    
    print("\nOption 2: Run Qdrant locally (requires Docker)")
    print("1. Install Docker Desktop")
    print("2. Run: docker run -p 6333:6333 qdrant/qdrant")
    
    print("\nOption 3: Use Qdrant in-memory mode (for testing only)")
    print("The app will automatically create collections in memory")

def test_qdrant_connection():
    """Test Qdrant connection with current settings"""
    try:
        from qdrant_client import QdrantClient
        from qdrant_client.http.models import Distance, VectorParams
        
        # Try to connect to local Qdrant first
        try:
            client = QdrantClient("localhost", port=6333)
            client.get_collections()
            print("✅ Connected to local Qdrant at localhost:6333")
            return True
        except:
            print("❌ Cannot connect to local Qdrant at localhost:6333")
            print("Please start Qdrant or use Qdrant Cloud")
            return False
            
    except Exception as e:
        print(f"❌ Error testing Qdrant connection: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Qdrant Setup Helper")
    print("=" * 30)
    
    install_qdrant_client()
    setup_local_qdrant()
    
    print("\n🧪 Testing connection...")
    test_qdrant_connection()
    
    print("\n📝 Next Steps:")
    print("1. Choose a Qdrant setup option above")
    print("2. Update your .env files with Qdrant credentials")
    print("3. Restart the backend server")
    print("4. Run the data ingestion script to populate medical data")
