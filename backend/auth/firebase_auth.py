"""
Firebase Admin SDK — verifies Firebase ID tokens on the backend.
Enables server-side user authentication and Firestore access.
"""
import json
import os
import logging
from functools import lru_cache
from typing import Optional

from fastapi import HTTPException, Depends, Header

logger = logging.getLogger(__name__)

_firebase_initialized = False


def init_firebase():
    """Initialize Firebase Admin SDK (call once at startup)."""
    global _firebase_initialized
    if _firebase_initialized:
        return

    try:
        import firebase_admin
        from firebase_admin import credentials
        from config import settings

        if firebase_admin._apps:
            _firebase_initialized = True
            return

        sa_json = settings.FIREBASE_SERVICE_ACCOUNT_JSON
        if sa_json:
            # Try as file path first, then as inline JSON string
            if os.path.isfile(sa_json):
                cred = credentials.Certificate(sa_json)
            else:
                sa_dict = json.loads(sa_json)
                cred = credentials.Certificate(sa_dict)
            firebase_admin.initialize_app(cred)
            logger.info("Firebase Admin SDK initialised from service account")
        elif settings.FIREBASE_PROJECT_ID:
            # Application Default Credentials (works on GCP/Cloud Run)
            firebase_admin.initialize_app(options={"projectId": settings.FIREBASE_PROJECT_ID})
            logger.info("Firebase Admin SDK initialised with ADC")
        else:
            logger.warning("Firebase Admin SDK not configured — token verification disabled")
            return

        _firebase_initialized = True

    except ImportError:
        logger.warning("firebase-admin not installed — token verification disabled")
    except Exception as e:
        logger.error(f"Firebase Admin init failed: {e}")


async def verify_firebase_token(
    authorization: Optional[str] = Header(None),
) -> Optional[dict]:
    """
    FastAPI dependency — verifies Firebase ID token from Authorization header.
    Returns decoded token dict if valid, None if Firebase not configured.
    Raises 401 if token is present but invalid.
    """
    if not authorization:
        return None

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization format")

    token = authorization[7:]

    try:
        from firebase_admin import auth
        decoded = auth.verify_id_token(token)
        return decoded
    except ImportError:
        # Firebase admin not installed — development mode, skip verification
        return {"uid": "dev-user", "email": "dev@example.com"}
    except Exception as e:
        logger.warning(f"Token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")


async def require_auth(token: Optional[dict] = Depends(verify_firebase_token)) -> dict:
    """Strict auth dependency — raises 401 if not authenticated."""
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")
    return token
