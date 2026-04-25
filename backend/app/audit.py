from __future__ import annotations

from typing import Any
from sqlalchemy.orm import Session

from .models import AuditLog


def log(db: Session, *, actor_user_id: str | None, action: str, target_user_id: str | None, data: dict[str, Any] | None = None) -> None:
    db.add(AuditLog(actor_user_id=actor_user_id, action=action, target_user_id=target_user_id, data=data or {}))

