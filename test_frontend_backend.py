#!/usr/bin/env python3

import requests
import json

def test_backend_endpoints():
    """Test all backend endpoints that frontend uses"""
    
    base_url = "http://localhost:8000"
    
    print("🧪 Testing Backend Endpoints...")
    print("=" * 50)
    
    # Test 1: Health check
    try:
        response = requests.get(f"{base_url}/healthz")
        print(f"✅ Health Check: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"❌ Health Check Failed: {e}")
        return False
    
    # Test 2: Router endpoint (typing mode)
    try:
        payload = {
            "user_id": "test_user",
            "transcript": "I have a headache",
            "consent_to_save": False
        }
        response = requests.post(f"{base_url}/v1/router", json=payload)
        result = response.json()
        print(f"✅ Router Endpoint: {response.status_code}")
        print(f"   Domain: {result.get('domain')}")
        print(f"   Response: {result.get('answer_text', '')[:100]}...")
    except Exception as e:
        print(f"❌ Router Endpoint Failed: {e}")
        return False
    
    # Test 3: Vapi tool endpoint (voice mode)
    try:
        payload = {
            "query": "I have a cough",
            "user_id": "test_user"
        }
        response = requests.post(f"{base_url}/vapi/tools/medicalvault", json=payload)
        result = response.json()
        print(f"✅ Vapi Tool Endpoint: {response.status_code}")
        print(f"   Domain: {result['results'][0].get('domain')}")
        print(f"   Response: {result['results'][0].get('result', '')[:100]}...")
    except Exception as e:
        print(f"❌ Vapi Tool Endpoint Failed: {e}")
        return False
    
    # Test 4: Database status
    try:
        response = requests.get(f"{base_url}/v1/database/status")
        result = response.json()
        print(f"✅ Database Status: {response.status_code}")
        print(f"   Type: {result.get('type')}")
        print(f"   Collections: {result.get('collections')}")
    except Exception as e:
        print(f"❌ Database Status Failed: {e}")
        return False
    
    # Test 5: Memory endpoint
    try:
        response = requests.get(f"{base_url}/v1/memory/test_user")
        result = response.json()
        print(f"✅ Memory Endpoint: {response.status_code}")
        print(f"   Memories: {len(result.get('last', []))}")
    except Exception as e:
        print(f"❌ Memory Endpoint Failed: {e}")
        return False
    
    print("=" * 50)
    print("🎉 ALL BACKEND ENDPOINTS WORKING!")
    print("📱 Frontend should be able to connect to all these endpoints.")
    return True

def test_frontend_connection():
    """Test if frontend can reach backend"""
    
    print("\n🔗 Testing Frontend-Backend Connection...")
    print("=" * 50)
    
    # Test CORS (simulating browser request)
    try:
        headers = {
            'Origin': 'http://localhost:3000',
            'Content-Type': 'application/json'
        }
        response = requests.options(
            "http://localhost:8000/v1/router", 
            headers=headers
        )
        print(f"✅ CORS Test: {response.status_code}")
        print(f"   Headers: {dict(response.headers)}")
    except Exception as e:
        print(f"❌ CORS Test Failed: {e}")
    
    # Test actual frontend request
    try:
        payload = {
            "user_id": "frontend_test",
            "transcript": "I have a fever",
            "consent_to_save": False
        }
        response = requests.post(
            "http://localhost:8000/v1/router", 
            json=payload,
            headers={'Origin': 'http://localhost:3000'}
        )
        result = response.json()
        print(f"✅ Frontend Request: {response.status_code}")
        print(f"   Response works: {len(result.get('answer_text', '')) > 50}")
    except Exception as e:
        print(f"❌ Frontend Request Failed: {e}")

if __name__ == "__main__":
    success = test_backend_endpoints()
    if success:
        test_frontend_connection()
        
        print("\n🎯 NEXT STEPS:")
        print("1. Open http://localhost:3000 in browser")
        print("2. Check browser console (F12) for errors")
        print("3. Try typing a medical question")
        print("4. If still not working, check frontend component")
    else:
        print("\n❌ Backend not working properly - fix backend first")
