from __future__ import annotations

from enum import Enum


class Domain(str, Enum):
    EMERGENCY = "EMERGENCY"
    ALLOPATHY = "ALLOPATHY"
    AYURVEDA = "AYURVEDA"
    NUTRITION = "NUTRITION"

