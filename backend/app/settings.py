from __future__ import annotations

from pydantic import BaseModel
from dotenv import load_dotenv
import os

load_dotenv()


class Settings(BaseModel):
    # Core integrations
    vapi_private_key: str | None = os.getenv("VAPI_PRIVATE_KEY")
    qdrant_url: str = os.getenv("QDRANT_URL", "http://localhost:6333")
    qdrant_api_key: str | None = os.getenv("QDRANT_API_KEY")
    google_ai_api_key: str | None = os.getenv("GOOGLE_AI_API_KEY")

    # Database
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql+psycopg://hackblr1:hackblr1_dev_password@localhost:5432/hackblr1",
    )

    # Auth
    jwt_secret: str = os.getenv("JWT_SECRET", "change_me_in_production")
    jwt_issuer: str = os.getenv("JWT_ISSUER", "hackblr1")

    # Collections
    collection_medication_safety: str = os.getenv("QDRANT_COLLECTION_MEDICATION_SAFETY", "medication_safety")
    collection_ayush_guidelines: str = os.getenv("QDRANT_COLLECTION_AYUSH_GUIDELINES", "ayush_guidelines")
    collection_user_memory: str = os.getenv("QDRANT_COLLECTION_USER_MEMORY", "user_memory")

    # Guardrails
    rag_similarity_threshold: float = float(os.getenv("RAG_SIMILARITY_THRESHOLD", "0.75"))

    # Optional: emergency + comms
    phc_locator_webhook_url: str | None = os.getenv("PHC_LOCATOR_WEBHOOK_URL")
    whatsapp_webhook_url: str | None = os.getenv("WHATSAPP_WEBHOOK_URL")

    # CORS
    cors_allow_origins: list[str] = os.getenv("CORS_ALLOW_ORIGINS", "http://localhost:3000").split(",")


settings = Settings()

