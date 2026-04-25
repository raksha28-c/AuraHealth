#!/usr/bin/env python3
"""
Simple medical data ingestion - creates collections and populates them
"""

import asyncio
import sys
import os
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent / "backend"))

from app.settings import settings
from qdrant_client import AsyncQdrantClient
from qdrant_client.http.models import Distance, VectorParams

# Sample medical data with pre-defined embeddings (simplified)
MEDICAL_DATA = {
    "medication_safety": [
        {
            "text": "Paracetamol dosage: Adults 500mg-1g every 4-6 hours, max 4g/day. Avoid with liver disease.",
            "category": "pain_relief",
            "warning": "liver_toxicity"
        },
        {
            "text": "Ibuprofen dosage: Adults 200-400mg every 4-6 hours with food. Max 1.2g/day. Avoid with stomach ulcers.",
            "category": "anti_inflammatory", 
            "warning": "gi_bleeding"
        }
    ],
    "ayush_guidelines": [
        {
            "text": "Tulsi tea: 5-10 leaves in hot water for 10 minutes. Helps with cough and cold symptoms.",
            "category": "herbal_remedy",
            "warning": "pregnancy_caution"
        },
        {
            "text": "Turmeric milk: 1/2 tsp turmeric in warm milk with honey. Anti-inflammatory properties.",
            "category": "traditional_remedy",
            "warning": "none"
        }
    ],
    "nutrition": [
        {
            "text": "Iron-rich foods: Spinach, lentils, jaggery. Consume with vitamin C for better absorption.",
            "category": "nutrition",
            "warning": "none"
        },
        {
            "text": "Hydration: Drink 2-3 liters of water daily. Include buttermilk and coconut water.",
            "category": "hydration",
            "warning": "water_quality"
        }
    ]
}

async def create_collections():
    """Create Qdrant collections with dummy vectors"""
    print("🏥 Creating Qdrant collections...")
    
    # Initialize Qdrant client
    client = AsyncQdrantClient(
        url=settings.qdrant_url,
        api_key=settings.qdrant_api_key
    )
    
    # Create collections with dummy vectors (768 dimensions is common)
    collections = [
        "medication_safety",
        "ayush_guidelines", 
        "nutrition",
        "user_memory"
    ]
    
    for collection_name in collections:
        try:
            await client.get_collection(collection_name)
            print(f"✅ Collection {collection_name} already exists")
        except:
            print(f"📝 Creating collection {collection_name}...")
            await client.create_collection(
                collection_name=collection_name,
                vectors_config=VectorParams(size=768, distance=Distance.COSINE)
            )
            
            # Add sample data with dummy vectors
            if collection_name in MEDICAL_DATA:
                points = []
                for i, item in enumerate(MEDICAL_DATA[collection_name]):
                    # Create a dummy vector (768 dimensions)
                    import random
                    vector = [random.random() for _ in range(768)]
                    
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
                print(f"✅ Added {len(points)} items to {collection_name}")
    
    print("\n🎉 Collections created successfully!")
    print("\n📊 Summary:")
    for collection_name in collections:
        try:
            collection_info = await client.get_collection(collection_name)
            count = collection_info.points_count
            print(f"   - {collection_name}: {count} items")
        except:
            print(f"   - {collection_name}: 0 items")

async def main():
    """Main function"""
    print("🔧 Simple Medical Data Setup")
    print("=" * 30)
    
    try:
        await create_collections()
        print("\n🚀 Your medical vault is ready!")
        print("\n🧪 Test the app:")
        print("1. Open http://localhost:3000")
        print("2. Try asking: 'I have a headache, what should I do?'")
        print("3. Check if you get medical responses")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\n🔧 Troubleshooting:")
        print("1. Check your QDRANT_URL and QDRANT_API_KEY in backend/.env")
        print("2. Ensure Qdrant Cloud is accessible")
        print("3. Try running the script again")

if __name__ == "__main__":
    asyncio.run(main())
