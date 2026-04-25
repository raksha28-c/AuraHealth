import { QdrantClient } from "@qdrant/js-client-rest";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const COLLECTION_NAME = "aurahealth_knowledge";

async function main() {
  const qdrantClient = new QdrantClient({
    url: process.env.QDRANT_URL || "http://localhost:6333",
    apiKey: process.env.QDRANT_API_KEY,
  });

  

  if (!process.env.OPENAI_API_KEY) {
    console.error("Missing OPENAI_API_KEY");
    process.exit(1);
  }

  // 1. Recreate collection
  try {
    const collections = await qdrantClient.getCollections();
    const exists = collections.collections.some(c => c.name === COLLECTION_NAME);
    
    if (exists) {
      await qdrantClient.deleteCollection(COLLECTION_NAME);
      console.log(`Deleted existing collection: ${COLLECTION_NAME}`);
    }

    await qdrantClient.createCollection(COLLECTION_NAME, {
      vectors: {
        size: 768, // text-embedding-004 dimension
        distance: "Cosine",
      },
    });
    console.log(`Created collection: ${COLLECTION_NAME}`);
  } catch (error) {
    console.error("Error setting up collection:", error);
    process.exit(1);
  }

  // 2. Load data
  const dataPath = path.join(__dirname, "medicalData.json");
  const data: Array<{id: number, topic: string, text: string}> = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

  console.log(`Loaded ${data.length} records. Generating embeddings...`);

  const points = [];

  for (const item of data) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${process.env.OPENAI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/embedding-001",
        content: { parts: [{ text: item.text }]}
      })
    });
    const embedRes = await res.json();
    if (!embedRes.embedding) {
      console.error("Gemini Error:", embedRes);
      throw new Error("Failed to generate embedding");
    }
    const vector = embedRes.embedding.values;

    points.push({
      id: uuidv4(),
      vector: vector,
      payload: {
        topic: item.topic,
        text: item.text,
      }
    });
  }

  // 3. Upsert
  await qdrantClient.upsert(COLLECTION_NAME, {
    wait: true,
    points: points,
  });

  console.log("Successfully ingested data into Qdrant!");
}

main().catch(console.error);
