#!/usr/bin/env python3
"""
Simple test to verify core functionality without Gemini API
"""

import requests
import json

def test_simple_endpoints():
    """Test basic endpoints that should work"""
    base_url = "http://localhost:8000"
    
    print("🔧 Testing Basic Backend Functionality")
    print("=" * 40)
    
    # Test 1: Health Check
    print("\n1. Health Check:")
    try:
        response = requests.get(f"{base_url}/healthz", timeout=5)
        if response.status_code == 200:
            print("✅ PASS - Backend is running")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ FAIL - Status: {response.status_code}")
    except Exception as e:
        print(f"❌ FAIL - Error: {e}")
    
    # Test 2: Memory Endpoint
    print("\n2. Memory Endpoint:")
    try:
        response = requests.get(f"{base_url}/v1/memory/test_user", timeout=10)
        if response.status_code == 200:
            print("✅ PASS - Memory endpoint works")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ FAIL - Status: {response.status_code}")
    except Exception as e:
        print(f"❌ FAIL - Error: {e}")
    
    # Test 3: API Docs
    print("\n3. API Documentation:")
    try:
        response = requests.get(f"{base_url}/docs", timeout=5)
        if response.status_code == 200:
            print("✅ PASS - API docs available")
            print(f"   URL: {base_url}/docs")
        else:
            print(f"❌ FAIL - Status: {response.status_code}")
    except Exception as e:
        print(f"❌ FAIL - Error: {e}")

def test_qdrant_directly():
    """Test Qdrant connection directly"""
    print("\n🗄️ Testing Qdrant Connection:")
    print("-" * 30)
    
    try:
        import sys
        from pathlib import Path
        sys.path.append(str(Path(__file__).parent / "backend"))
        
        from app.settings import settings
        from qdrant_client import AsyncQdrantClient
        import asyncio
        
        async def test_qdrant():
            client = AsyncQdrantClient(
                url=settings.qdrant_url,
                api_key=settings.qdrant_api_key
            )
            
            collections = await client.get_collections()
            print("✅ PASS - Qdrant connected")
            print(f"   Collections: {[col.name for col in collections.collections]}")
            
            # Test medication safety collection
            try:
                collection_info = await client.get_collection("medication_safety")
                print(f"   medication_safety: {collection_info.points_count} items")
                print("✅ PASS - Medical data available")
            except:
                print("❌ FAIL - No medical data")
        
        asyncio.run(test_qdrant())
        
    except Exception as e:
        print(f"❌ FAIL - Error: {e}")

def test_frontend():
    """Test frontend accessibility"""
    print("\n🌐 Testing Frontend:")
    print("-" * 25)
    
    try:
        response = requests.get("http://localhost:3000", timeout=10)
        if response.status_code == 200:
            print("✅ PASS - Frontend is running")
            print(f"   URL: http://localhost:3000")
        else:
            print(f"❌ FAIL - Status: {response.status_code}")
    except Exception as e:
        print(f"❌ FAIL - Error: {e}")

def main():
    """Run all simple tests"""
    print("🧪 Simple Functionality Test")
    print("Testing core components without complex API calls\n")
    
    test_simple_endpoints()
    test_qdrant_directly()
    test_frontend()
    
    print("\n🎯 What This Means:")
    print("✅ If basic tests pass - your app infrastructure is working")
    print("✅ Qdrant connection works - medical knowledge base is available")
    print("✅ Frontend works - UI is accessible")
    print("⚠️  Medical router issues are likely Gemini API formatting problems")
    print("\n🚀 Next Steps:")
    print("1. Open http://localhost:3000")
    print("2. Test the UI components manually")
    print("3. Try typing medical queries in the voice agent")
    print("4. The text-based responses should work even if voice has issues")

if __name__ == "__main__":
    main()
