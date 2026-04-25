from __future__ import annotations

from pydantic import BaseModel, Field
from typing import Any, Literal

from .domain import Domain


class RouterRequest(BaseModel):
    user_id: str = Field(..., description="Stable user identifier (phone/profile id)")
    transcript: str
    consent_to_save: bool = False


class RouterResponse(BaseModel):
    domain: Domain
    detected_language: str
    answer_text: str
    guardrail_triggered: bool = False
    sources: list[dict[str, Any]] = []
    memory_context: list[dict[str, Any]] = []
    emergency: dict[str, Any] | None = None


class MemoryUpsertRequest(BaseModel):
    user_id: str
    summary: str
    raw_text: str | None = None
    consent_to_save: bool = False
    metadata: dict[str, Any] | None = None


class MemoryGetResponse(BaseModel):
    user_id: str
    last: list[dict[str, Any]]


class PrescriptionScanResponse(BaseModel):
    medicines: list[dict[str, Any]] = []
    warnings: list[str] = []
    raw_text: str | None = None


class VapiToolCall(BaseModel):
    """
    Minimal subset of Vapi tool-call payload.
    We support either:
    - direct { query: "...", user_id: "..." }
    - or OpenAI-style toolCalls in message.toolCalls[0].function.arguments
    """

    query: str | None = None
    user_id: str | None = None
    message: dict[str, Any] | None = None


class AuthRegisterRequest(BaseModel):
    username: str
    password: str
    role: Literal["patient", "worker", "admin"] = "patient"


class AuthLoginRequest(BaseModel):
    username: str
    password: str


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class EmergencyTriggerRequest(BaseModel):
    user_id: str
    lat: float | None = None
    lng: float | None = None
    caregiver_contacts: list[dict[str, Any]] = []


class EmergencyTriggerResponse(BaseModel):
    emergency_id: str
    phc: dict[str, Any]
    whatsapp: dict[str, Any]


class PrescriptionUpsertRequest(BaseModel):
    user_id: str
    consent_to_save: bool = False
    extracted: dict[str, Any]
    raw_text: str | None = None


class PrescriptionListResponse(BaseModel):
    user_id: str
    prescriptions: list[dict[str, Any]]

