#!/usr/bin/env python3
"""
Medical data ingestion script for Qdrant collections
Populates the vector database with sample medical knowledge
"""

import asyncio
import sys
import os
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent / "backend"))

from app.gemini_client import GeminiClient
from app.medical_vault import MedicalVault
from qdrant_client import AsyncQdrantClient
from qdrant_client.http.models import Distance, VectorParams

# Sample medical data
MEDICATION_SAFETY_DATA = [
    {
        "text": "Paracetamol (acetaminophen) dosage: Adults 500mg-1g every 4-6 hours, max 4g/day. Avoid with liver disease. Do not exceed recommended dose.",
        "category": "pain_relief",
        "warning": "liver_toxicity"
    },
    {
        "text": "Ibuprofen dosage: Adults 200-400mg every 4-6 hours with food. Max 1.2g/day. Avoid with stomach ulcers, asthma, or kidney disease.",
        "category": "anti_inflammatory",
        "warning": "gi_bleeding"
    },
    {
        "text": "Amoxicillin dosage: Adults 250-500mg every 8 hours for 5-7 days. Complete full course. Watch for allergic reactions.",
        "category": "antibiotic",
        "warning": "allergy"
    },
    {
        "text": "ORS (Oral Rehydration Solution): Mix 1 packet in 1 liter clean water. Give small sips frequently. Essential for diarrhea dehydration.",
        "category": "rehydration",
        "warning": "proper_mixing"
    }
]

AYUSH_GUIDELINES_DATA = [
    {
        "text": "Tulsi (Holy Basil) tea: 5-10 leaves in hot water for 10 minutes. Helps with cough, cold, and respiratory issues. Avoid in pregnancy.",
        "category": "herbal_remedy",
        "warning": "pregnancy_caution"
    },
    {
        "text": "Turmeric milk: 1/2 tsp turmeric in warm milk with honey. Anti-inflammatory properties. Good for joint pain and immunity.",
        "category": "traditional_remedy",
        "warning": "none"
    },
    {
        "text": "Ginger tea: 1-inch ginger piece in hot water. Helps with nausea, digestion, and cold symptoms. Avoid in excess with blood thinners.",
        "category": "digestive_aid",
        "warning": "blood_thinner_interaction"
    },
    {
        "text": "Yoga for stress: 10 minutes of deep breathing and gentle stretching. Helps reduce anxiety and improve sleep quality.",
        "category": "lifestyle",
        "warning": "proper_technique"
    }
]

NUTRITION_DATA = [
    {
        "text": "Iron-rich foods: Spinach, lentils, jaggery, and dates. Consume with vitamin C (lemon, amla) for better absorption. Essential for anemia prevention.",
        "category": "nutrition",
        "warning": "none"
    },
    {
        "text": "Hydration: Drink 2-3 liters of water daily. More in hot weather or during illness. Include buttermilk and coconut water.",
        "category": "hydration",
        "warning": "water_quality"
    },
    {
        "text": "Pregnancy nutrition: Increase folic acid, iron, and calcium. Include green vegetables, fruits, and dairy. Avoid raw papaya and excessive vitamin A.",
        "category": "special_population",
        "warning": "pregnancy_specific"
    },
    {
        "text": "Elderly nutrition: Soft, easily digestible foods. Include protein (dal, paneer), calcium (milk, curd), and fiber (vegetables, whole grains).",
        "category": "special_population",
        "warning": "choking_risk"
    }
]

async def ingest_collection(client: AsyncQdrantClient, gemini: GeminiClient, collection_name: str, data: list):
    """Ingest data into a specific collection"""
    print(f"\n📥 Ingesting data into {collection_name}...")
    
    vault = MedicalVault(client, gemini)
    
    # Create collection if it doesn't exist
    try:
        await client.get_collection(collection_name)
        print(f"✅ Collection {collection_name} already exists")
    except:
        # Get sample embedding to determine vector size
        sample_text = data[0]["text"]
        sample_vector = await gemini.embed_text(sample_text)
        
        await client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=len(sample_vector), distance=Distance.COSINE)
        )
        print(f"✅ Created collection {collection_name}")
    
    # Ingest data
    points = []
    for i, item in enumerate(data):
        vector = await gemini.embed_text(item["text"])
        
        point_id = i + 1
        payload = {
            "text": item["text"],
            "category": item["category"],
            "warning": item.get("warning", "none"),
            "source": "hackblr1_initial_data"
        }
        
        points.append({
            "id": point_id,
            "vector": vector,
            "payload": payload
        })
    
    await client.upsert(collection_name=collection_name, points=points)
    print(f"✅ Ingested {len(points)} items into {collection_name}")

async def main():
    """Main ingestion function"""
    print("🏥 Starting Medical Data Ingestion")
    print("=" * 40)
    
    # Load environment
    from dotenv import load_dotenv
    load_dotenv("backend/.env")
    
    # Initialize clients
    try:
        gemini = GeminiClient()
        print("✅ Gemini client initialized")
    except Exception as e:
        print(f"❌ Gemini client error: {e}")
        print("Please check your GOOGLE_AI_API_KEY in backend/.env")
        return
    
    # Try to connect to Qdrant
    qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
    qdrant_api_key = os.getenv("QDRANT_API_KEY")
    
    try:
        client = AsyncQdrantClient(url=qdrant_url, api_key=qdrant_api_key)
        await client.get_collections()
        print(f"✅ Connected to Qdrant at {qdrant_url}")
    except Exception as e:
        print(f"❌ Qdrant connection error: {e}")
        print("Please ensure Qdrant is running or use Qdrant Cloud")
        return
    
    # Ingest all collections
    await ingest_collection(client, gemini, "medication_safety", MEDICATION_SAFETY_DATA)
    await ingest_collection(client, gemini, "ayush_guidelines", AYUSH_GUIDELINES_DATA)
    await ingest_collection(client, gemini, "nutrition", NUTRITION_DATA)
    
    print("\n🎉 Medical data ingestion completed!")
    print("\n📊 Summary:")
    print(f"   - {len(MEDICATION_SAFETY_DATA)} medication safety items")
    print(f"   - {len(AYUSH_GUIDELINES_DATA)} AYUSH guideline items")
    print(f"   - {len(NUTRITION_DATA)} nutrition items")
    print("\n🚀 Your medical vault is ready!")

if __name__ == "__main__":
    asyncio.run(main())
