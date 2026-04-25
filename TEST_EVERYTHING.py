#!/usr/bin/env python3
"""
Comprehensive testing script for AuraHealth application
Tests all components and provides detailed status report
"""

import asyncio
import sys
import os
import json
import requests
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent / "backend"))

from app.settings import settings
from qdrant_client import AsyncQdrantClient

class HealthCheckTester:
    def __init__(self):
        self.backend_url = "http://localhost:8000"
        self.frontend_url = "http://localhost:3000"
        self.results = {}
        
    async def test_backend_api(self):
        """Test all backend API endpoints"""
        print("🔧 Testing Backend API...")
        tests = {}
        
        # Test health endpoint
        try:
            response = requests.get(f"{self.backend_url}/healthz", timeout=5)
            tests["health_check"] = {
                "status": "✅ PASS" if response.status_code == 200 else "❌ FAIL",
                "response": response.json() if response.status_code == 200 else response.text
            }
        except Exception as e:
            tests["health_check"] = {"status": "❌ FAIL", "error": str(e)}
        
        # Test router endpoint
        try:
            payload = {
                "user_id": "test_user",
                "transcript": "I have a headache",
                "consent_to_save": False
            }
            response = requests.post(f"{self.backend_url}/v1/router", 
                                    json=payload, timeout=30)
            tests["medical_router"] = {
                "status": "✅ PASS" if response.status_code == 200 else "❌ FAIL",
                "response": response.json() if response.status_code == 200 else response.text[:200]
            }
        except Exception as e:
            tests["medical_router"] = {"status": "❌ FAIL", "error": str(e)}
        
        # Test memory endpoint
        try:
            response = requests.get(f"{self.backend_url}/v1/memory/test_user", timeout=10)
            tests["memory_endpoint"] = {
                "status": "✅ PASS" if response.status_code == 200 else "❌ FAIL",
                "response": response.json() if response.status_code == 200 else response.text[:200]
            }
        except Exception as e:
            tests["memory_endpoint"] = {"status": "❌ FAIL", "error": str(e)}
        
        self.results["backend_api"] = tests
        return tests
    
    async def test_qdrant_connection(self):
        """Test Qdrant vector database connection"""
        print("🗄️ Testing Qdrant Connection...")
        
        try:
            client = AsyncQdrantClient(
                url=settings.qdrant_url,
                api_key=settings.qdrant_api_key
            )
            
            collections = await client.get_collections()
            collection_names = [col.name for col in collections.collections]
            
            tests = {
                "connection": {"status": "✅ PASS", "collections": collection_names},
                "medication_safety": {"status": "✅ PASS" if "medication_safety" in collection_names else "❌ FAIL"},
                "ayush_guidelines": {"status": "✅ PASS" if "ayush_guidelines" in collection_names else "❌ FAIL"},
                "nutrition": {"status": "✅ PASS" if "nutrition" in collection_names else "❌ FAIL"},
                "user_memory": {"status": "✅ PASS" if "user_memory" in collection_names else "❌ FAIL"}
            }
            
            # Check data counts
            for collection_name in ["medication_safety", "ayush_guidelines", "nutrition"]:
                try:
                    collection_info = await client.get_collection(collection_name)
                    tests[f"{collection_name}_count"] = {
                        "status": "✅ PASS", 
                        "count": collection_info.points_count
                    }
                except:
                    tests[f"{collection_name}_count"] = {"status": "❌ FAIL", "count": 0}
            
        except Exception as e:
            tests = {"connection": {"status": "❌ FAIL", "error": str(e)}}
        
        self.results["qdrant"] = tests
        return tests
    
    async def test_gemini_integration(self):
        """Test Gemini AI integration"""
        print("🧠 Testing Gemini AI Integration...")
        
        try:
            from app.gemini_client import GeminiClient
            gemini = GeminiClient()
            
            # Test text generation
            response = await gemini.generate_json(
                model="gemini-1.5-flash",
                system="You are a medical assistant. Respond briefly.",
                user="What is paracetamol used for?",
                schema_hint={"response": "string"}
            )
            
            tests = {
                "gemini_client": {"status": "✅ PASS", "response": response.get("response", "")[:100]},
                "api_key": {"status": "✅ PASS", "configured": bool(settings.google_ai_api_key)}
            }
            
        except Exception as e:
            tests = {
                "gemini_client": {"status": "❌ FAIL", "error": str(e)},
                "api_key": {"status": "❌ FAIL", "configured": bool(settings.google_ai_api_key)}
            }
        
        self.results["gemini"] = tests
        return tests
    
    def test_frontend_access(self):
        """Test frontend accessibility"""
        print("🌐 Testing Frontend Access...")
        
        try:
            response = requests.get(self.frontend_url, timeout=10)
            tests = {
                "frontend_loading": {
                    "status": "✅ PASS" if response.status_code == 200 else "❌ FAIL",
                    "status_code": response.status_code
                }
            }
        except Exception as e:
            tests = {"frontend_loading": {"status": "❌ FAIL", "error": str(e)}}
        
        self.results["frontend"] = tests
        return tests
    
    def test_environment_variables(self):
        """Test environment variable configuration"""
        print("⚙️ Testing Environment Variables...")
        
        env_vars = {
            "gemini_api_key": bool(settings.google_ai_api_key),
            "qdrant_url": bool(settings.qdrant_url),
            "qdrant_api_key": bool(settings.qdrant_api_key),
            "jwt_secret": bool(settings.jwt_secret),
            "database_url": bool(settings.database_url)
        }
        
        tests = {}
        for var, configured in env_vars.items():
            tests[var] = {
                "status": "✅ PASS" if configured else "❌ FAIL",
                "configured": configured
            }
        
        self.results["environment"] = tests
        return tests
    
    def generate_report(self):
        """Generate comprehensive test report"""
        print("\n" + "="*60)
        print("🏥 AURAHEALTH COMPREHENSIVE TEST REPORT")
        print("="*60)
        
        total_tests = 0
        passed_tests = 0
        
        for category, tests in self.results.items():
            print(f"\n📋 {category.upper()}:")
            print("-" * 40)
            
            for test_name, result in tests.items():
                total_tests += 1
                status = result.get("status", "❌ UNKNOWN")
                if "✅ PASS" in status:
                    passed_tests += 1
                
                print(f"  {test_name}: {status}")
                
                # Show additional info
                if "response" in result and result["response"]:
                    response = str(result["response"])[:100]
                    print(f"    Response: {response}...")
                elif "error" in result:
                    print(f"    Error: {result['error']}")
                elif "count" in result:
                    print(f"    Count: {result['count']} items")
                elif "collections" in result:
                    print(f"    Collections: {result['collections']}")
        
        # Summary
        print(f"\n📊 SUMMARY:")
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {total_tests - passed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        # Recommendations
        print(f"\n🎯 RECOMMENDATIONS:")
        if passed_tests == total_tests:
            print("🎉 Perfect! Everything is working correctly!")
            print("📱 You can now test the voice features at http://localhost:3000")
        else:
            print("⚠️  Some components need attention:")
            
            if "❌ FAIL" in str(self.results.get("backend_api", {})):
                print("  • Check if backend is running on port 8000")
            
            if "❌ FAIL" in str(self.results.get("qdrant", {})):
                print("  • Verify Qdrant Cloud credentials in .env files")
            
            if "❌ FAIL" in str(self.results.get("gemini", {})):
                print("  • Check Gemini API key configuration")
            
            if "❌ FAIL" in str(self.results.get("frontend", {})):
                print("  • Ensure frontend is running on port 3000")
        
        print(f"\n🚀 NEXT STEPS:")
        print("1. Open http://localhost:3000 in your browser")
        print("2. Try typing: 'I have a headache, what should I do?'")
        print("3. Test voice features (add Vapi public key if needed)")
        print("4. Explore all UI components")

async def main():
    """Run all tests"""
    print("🧪 Starting Comprehensive Health Check...")
    print("This will test all components of your AuraHealth application\n")
    
    tester = HealthCheckTester()
    
    # Run all tests
    await tester.test_backend_api()
    await tester.test_qdrant_connection()
    await tester.test_gemini_integration()
    tester.test_frontend_access()
    tester.test_environment_variables()
    
    # Generate report
    tester.generate_report()
    
    # Save results to file
    with open("test_results.json", "w") as f:
        json.dump(tester.results, f, indent=2)
    
    print(f"\n💾 Detailed results saved to: test_results.json")

if __name__ == "__main__":
    asyncio.run(main())
