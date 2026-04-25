from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from qdrant_client import AsyncQdrantClient
from qdrant_client.http import models as qm

from .settings import settings
from .gemini_client import GeminiClient


@dataclass
class VaultHit:
    score: float
    payload: dict[str, Any]


class MedicalVault:
    def __init__(self, qdrant: AsyncQdrantClient, gemini: GeminiClient) -> None:
        self.qdrant = qdrant
        self.gemini = gemini

    async def _ensure_collection(self, name: str, vector_size: int) -> None:
        try:
            await self.qdrant.get_collection(name)
        except Exception:
            await self.qdrant.create_collection(
                collection_name=name,
                vectors_config=qm.VectorParams(size=vector_size, distance=qm.Distance.COSINE),
            )

    async def search(self, *, collection: str, query: str, limit: int = 3) -> list[VaultHit]:
        vector = await self.gemini.embed_text(query)
        await self._ensure_collection(collection, vector_size=len(vector))

        results = await self.qdrant.search(
            collection_name=collection,
            query_vector=vector,
            limit=limit,
            with_payload=True,
        )
        return [VaultHit(score=float(r.score), payload=(r.payload or {})) for r in results]

    async def memory_last_n(self, *, user_id: str, n: int = 3) -> list[dict[str, Any]]:
        # We store memories as points with payload.user_id and payload.timestamp (ISO).
        # Qdrant scroll doesn't guarantee ordering unless we sort client-side.
        hits = await self.qdrant.scroll(
            collection_name=settings.collection_user_memory,
            scroll_filter=qm.Filter(
                must=[qm.FieldCondition(key="user_id", match=qm.MatchValue(value=user_id))]
            ),
            limit=50,
            with_payload=True,
            with_vectors=False,
        )
        points = hits[0] if isinstance(hits, tuple) else hits.points  # compat
        payloads = []
        for p in points:
            payloads.append(p.payload or {})
        payloads.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        return payloads[:n]

    async def memory_upsert(
        self,
        *,
        user_id: str,
        summary: str,
        raw_text: str | None,
        consent: bool,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        if not consent:
            return

        vector = await self.gemini.embed_text(summary)
        await self._ensure_collection(settings.collection_user_memory, vector_size=len(vector))

        import time

        payload: dict[str, Any] = {
            "user_id": user_id,
            "summary": summary,
            "raw_text": raw_text,
            "timestamp": __import__("datetime").datetime.utcnow().isoformat() + "Z",
        }
        if metadata:
            payload["metadata"] = metadata

        await self.qdrant.upsert(
            collection_name=settings.collection_user_memory,
            points=[
                qm.PointStruct(
                    id=int(time.time() * 1000),
                    vector=vector,
                    payload=payload,
                )
            ],
        )

