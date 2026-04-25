#!/usr/bin/env python3
"""
Direct test of the medical router endpoint
"""

import requests
import json

def test_medical_router():
    """Test the medical router with various medical queries"""
    base_url = "http://localhost:8000"
    
    test_cases = [
        {
            "name": "Headache Query",
            "payload": {
                "user_id": "test_user",
                "transcript": "I have a headache, what should I do?",
                "consent_to_save": False
            }
        },
        {
            "name": "Fever Query", 
            "payload": {
                "user_id": "test_user",
                "transcript": "What medicine should I take for fever?",
                "consent_to_save": False
            }
        },
        {
            "name": "Emergency Query",
            "payload": {
                "user_id": "test_user", 
                "transcript": "I'm having severe chest pain",
                "consent_to_save": False
            }
        },
        {
            "name": "Hindi Query",
            "payload": {
                "user_id": "test_user",
                "transcript": "मुझे सिर दर्द है",
                "consent_to_save": False
            }
        }
    ]
    
    print("🏥 Testing Medical Router Endpoint")
    print("=" * 50)
    
    for test_case in test_cases:
        print(f"\n🧪 Testing: {test_case['name']}")
        print(f"Query: {test_case['payload']['transcript']}")
        
        try:
            response = requests.post(
                f"{base_url}/v1/router",
                json=test_case['payload'],
                timeout=30
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ SUCCESS")
                print(f"Domain: {result.get('domain', 'N/A')}")
                print(f"Language: {result.get('detected_language', 'N/A')}")
                print(f"Response: {result.get('answer_text', 'N/A')[:200]}...")
                print(f"Guardrail: {result.get('guardrail_triggered', 'N/A')}")
                if result.get('emergency'):
                    print(f"🚨 Emergency: {result['emergency']}")
            else:
                print(f"❌ FAILED")
                print(f"Error: {response.text[:300]}")
                
        except requests.exceptions.Timeout:
            print("⏰ TIMEOUT - Request took too long")
        except requests.exceptions.ConnectionError:
            print("🔌 CONNECTION ERROR - Backend may not be running")
        except Exception as e:
            print(f"❌ ERROR: {str(e)}")
    
    print(f"\n📊 Test Summary:")
    print("If tests are failing, check:")
    print("1. Backend is running on port 8000")
    print("2. Gemini API key is valid")
    print("3. Qdrant Cloud is accessible")

if __name__ == "__main__":
    test_medical_router()
