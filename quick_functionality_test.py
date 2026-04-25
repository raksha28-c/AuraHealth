#!/usr/bin/env python3
"""
Quick functionality test to verify app is working
"""

import requests
import json
import time

def test_app_functionality():
    """Test all core functionality"""
    print("🧪 QUICK FUNCTIONALITY TEST")
    print("=" * 40)
    
    results = {}
    
    # Test 1: Frontend Loading
    print("\n1. Testing Frontend...")
    try:
        response = requests.get("http://localhost:3000", timeout=10)
        results["frontend"] = {
            "status": "✅ PASS" if response.status_code == 200 else "❌ FAIL",
            "status_code": response.status_code
        }
        print(f"   Status: {results['frontend']['status']}")
    except Exception as e:
        results["frontend"] = {"status": "❌ FAIL", "error": str(e)}
        print(f"   Status: ❌ FAIL - {e}")
    
    # Test 2: Backend Health
    print("\n2. Testing Backend...")
    try:
        response = requests.get("http://localhost:8000/healthz", timeout=5)
        results["backend"] = {
            "status": "✅ PASS" if response.status_code == 200 else "❌ FAIL",
            "response": response.json() if response.status_code == 200 else None
        }
        print(f"   Status: {results['backend']['status']}")
    except Exception as e:
        results["backend"] = {"status": "❌ FAIL", "error": str(e)}
        print(f"   Status: ❌ FAIL - {e}")
    
    # Test 3: API Documentation
    print("\n3. Testing API Docs...")
    try:
        response = requests.get("http://localhost:8000/docs", timeout=5)
        results["api_docs"] = {
            "status": "✅ PASS" if response.status_code == 200 else "❌ FAIL"
        }
        print(f"   Status: {results['api_docs']['status']}")
    except Exception as e:
        results["api_docs"] = {"status": "❌ FAIL", "error": str(e)}
        print(f"   Status: ❌ FAIL - {e}")
    
    # Test 4: Medical Router (Basic)
    print("\n4. Testing Medical Router...")
    try:
        payload = {
            "user_id": "test_user",
            "transcript": "I have a headache",
            "consent_to_save": False
        }
        response = requests.post(
            "http://localhost:8000/v1/router",
            json=payload,
            timeout=30
        )
        results["medical_router"] = {
            "status": "✅ PASS" if response.status_code == 200 else "❌ FAIL",
            "status_code": response.status_code
        }
        print(f"   Status: {results['medical_router']['status']}")
        if response.status_code == 200:
            result = response.json()
            print(f"   Domain: {result.get('domain', 'N/A')}")
            print(f"   Response: {result.get('answer_text', 'N/A')[:100]}...")
    except Exception as e:
        results["medical_router"] = {"status": "❌ FAIL", "error": str(e)}
        print(f"   Status: ❌ FAIL - {e}")
    
    # Test 5: Memory Endpoint
    print("\n5. Testing Memory Endpoint...")
    try:
        response = requests.get("http://localhost:8000/v1/memory/test_user", timeout=10)
        results["memory"] = {
            "status": "✅ PASS" if response.status_code == 200 else "❌ FAIL",
            "status_code": response.status_code
        }
        print(f"   Status: {results['memory']['status']}")
    except Exception as e:
        results["memory"] = {"status": "❌ FAIL", "error": str(e)}
        print(f"   Status: ❌ FAIL - {e}")
    
    # Calculate Results
    print("\n" + "=" * 40)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 40)
    
    total_tests = len(results)
    passed_tests = sum(1 for r in results.values() if "✅ PASS" in r["status"])
    
    for test_name, result in results.items():
        print(f"{test_name}: {result['status']}")
        if "error" in result:
            print(f"  Error: {result['error']}")
    
    print(f"\n📈 Overall Score: {passed_tests}/{total_tests} ({(passed_tests/total_tests)*100:.0f}%)")
    
    # Determine Functionality Status
    if passed_tests == total_tests:
        print("\n🎉 FULLY FUNCTIONAL!")
        print("✅ All core features are working perfectly")
        print("🏥 Your app is ready for deployment!")
    elif passed_tests >= 4:
        print("\n⚠️  MOSTLY FUNCTIONAL")
        print("✅ Core features work, some minor issues")
        print("🔧 Check failed tests for improvements")
    else:
        print("\n❌ NEEDS ATTENTION")
        print("🔧 Several components need fixes")
        print("📞 Review failed tests and troubleshoot")
    
    # Next Steps
    print(f"\n🚀 NEXT STEPS:")
    print("1. Open http://localhost:3000 in browser")
    print("2. Test UI components manually")
    print("3. Try medical queries in voice agent")
    print("4. Test emergency detection")
    print("5. Verify all health tools work")
    
    return results

if __name__ == "__main__":
    test_app_functionality()
