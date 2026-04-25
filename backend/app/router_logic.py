from __future__ import annotations

from .domain import Domain


def classify_domain_simple(transcript: str) -> Domain:
    """
    Deterministic first-pass router.
    In production you'd use Gemini classification; this keeps the skeleton reliable.
    """
    t = (transcript or "").lower()

    emergency_terms = [
        "chest pain",
        "difficulty breathing",
        "not breathing",
        "unconscious",
        "severe bleeding",
        "fits",
        "seizure",
        "stroke",
        "heart attack",
        "suicide",
        "poison",
        "snake bite",
        "accident",
        "burn",
    ]
    if any(k in t for k in emergency_terms):
        return Domain.EMERGENCY

    ayurveda_terms = ["ayurveda", "ayurvedic", "ayush", "kadha", "churna", "arjuna", "triphala"]
    if any(k in t for k in ayurveda_terms):
        return Domain.AYURVEDA

    nutrition_terms = ["diet", "nutrition", "protein", "calorie", "weight", "diabetes diet", "bp diet", "food"]
    if any(k in t for k in nutrition_terms):
        return Domain.NUTRITION

    return Domain.ALLOPATHY

