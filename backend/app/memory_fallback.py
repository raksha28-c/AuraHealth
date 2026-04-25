"""
Fallback memory system that works without complex dependencies
"""

from typing import Any
import asyncio

# Simple in-memory storage for fallback
MEMORY_STORAGE = {}

async def get_user_memory(user_id: str, limit: int = 10) -> list[dict[str, Any]]:
    """Get user memory from fallback storage"""
    try:
        user_memories = MEMORY_STORAGE.get(user_id, [])
        return user_memories[-limit:] if user_memories else []
    except Exception:
        return []

async def save_user_memory(user_id: str, summary: str, raw_text: str, consent: bool, metadata: dict[str, Any] = None) -> bool:
    """Save user memory to fallback storage"""
    try:
        if not consent:
            return False
            
        if user_id not in MEMORY_STORAGE:
            MEMORY_STORAGE[user_id] = []
            
        memory_entry = {
            "payload": {
                "summary": summary,
                "raw_text": raw_text,
                "metadata": metadata or {},
                "timestamp": str(asyncio.get_event_loop().time())
            }
        }
        
        MEMORY_STORAGE[user_id].append(memory_entry)
        
        # Keep only last 50 entries per user
        if len(MEMORY_STORAGE[user_id]) > 50:
            MEMORY_STORAGE[user_id] = MEMORY_STORAGE[user_id][-50:]
            
        return True
    except Exception:
        return False
