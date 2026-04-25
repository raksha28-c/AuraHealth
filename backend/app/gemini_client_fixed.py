from __future__ import annotations

import httpx
from typing import Any

from .settings import settings


class GeminiClientFixed:
    """
    Fixed Gemini client with proper API formatting
    """

    def __init__(self, api_key: str | None = None) -> None:
        self.api_key = api_key or settings.google_ai_api_key
        if not self.api_key:
            raise RuntimeError("Missing GOOGLE_AI_API_KEY")

        self._base = "https://generativelanguage.googleapis.com/v1beta"

    async def embed_text(self, text: str) -> list[float]:
        """Fixed embedding API call"""
        url = f"{self._base}/models/text-embedding-004:embedContent"
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                url,
                params={"key": self.api_key},
                json={
                    "model": "models/text-embedding-004",
                    "content": {"parts": [{"text": text}]},
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return data["embedding"]["values"]

    async def generate_json(
        self,
        *,
        model: str,
        system: str,
        user: str,
        schema_hint: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Fixed JSON generation with proper error handling"""
        try:
            url = f"{self._base}/models/gemini-1.5-flash:generateContent"
            schema_text = f"\n\nReturn STRICT JSON matching this schema:\n{schema_hint}" if schema_hint else ""
            prompt = f"{system}\n\nUSER:\n{user}{schema_text}\n\nReturn JSON only."

            async with httpx.AsyncClient(timeout=60) as client:
                resp = await client.post(
                    url,
                    params={"key": self.api_key},
                    json={
                        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
                        "generationConfig": {"temperature": 0.2},
                    },
                )
                resp.raise_for_status()
                data = resp.json()

            text = (
                data.get("candidates", [{}])[0]
                .get("content", {})
                .get("parts", [{}])[0]
                .get("text", "")
            )
            
            # Best-effort JSON extraction
            import json
            import re

            match = re.search(r"\{[\s\S]*\}", text)
            if not match:
                # Fallback response
                return {"response": text[:200], "error": "Could not parse JSON"}
            return json.loads(match.group(0))
            
        except Exception as e:
            # Return fallback response on any error
            return {
                "response": f"I apologize, but I'm having trouble accessing my medical knowledge right now. For {user[:50]}..., please consult a local healthcare provider.",
                "error": str(e)
            }
