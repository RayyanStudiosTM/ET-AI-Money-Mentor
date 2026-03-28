"""
Money Mentor API — FastAPI + OpenAI + Firebase Admin + LangGraph
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from config import settings
from auth.firebase_auth import init_firebase
from routers.chat import router as chat_router
from routers.all_routers import tax_router, finance_router, portfolio_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Money Mentor API...")
    init_firebase()
    logger.info("Ready.")
    yield
    logger.info("Shutting down.")


app = FastAPI(
    title="Money Mentor API",
    description="AI-powered financial planning for India — OpenAI + LangGraph + Firebase",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router,      prefix="/api/chat",      tags=["Chat"])
app.include_router(finance_router,   prefix="/api/finance",   tags=["Finance"])
app.include_router(tax_router,       prefix="/api/tax",       tags=["Tax"])
app.include_router(portfolio_router, prefix="/api/portfolio", tags=["Portfolio"])


@app.get("/api/health")
async def health():
    return {"status": "healthy", "version": "2.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
