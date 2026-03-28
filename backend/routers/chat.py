from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
import logging

from auth.firebase_auth import verify_firebase_token
from agents.pipeline import get_agent, AgentState
from langchain_core.messages import HumanMessage, AIMessage

router = APIRouter()
logger = logging.getLogger(__name__)


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: List[Message] = []
    context: Optional[dict] = None


class ChatResponse(BaseModel):
    reply: str
    follow_ups: List[str] = []
    intent: Optional[str] = None


@router.post("", response_model=ChatResponse)
async def chat(
    req: ChatRequest,
    token: Optional[dict] = Depends(verify_firebase_token),
):
    """Main chat endpoint — runs through LangGraph agent pipeline."""
    try:
        agent = get_agent()

        history = []
        for m in req.history[-8:]:
            if m.role == "user":
                history.append(HumanMessage(content=m.content))
            else:
                history.append(AIMessage(content=m.content))
        history.append(HumanMessage(content=req.message))

        state: AgentState = {
            "messages": history,
            "user_context": req.context or {},
            "intent": None,
            "enriched_data": None,
            "final_response": None,
            "follow_ups": None,
        }

        result = await agent.ainvoke(state)

        return ChatResponse(
            reply=result.get("final_response") or "I couldn't process that request. Please try again.",
            follow_ups=result.get("follow_ups") or [],
            intent=result.get("intent"),
        )

    except Exception as e:
        logger.error(f"Chat error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/quick", response_model=ChatResponse)
async def chat_quick(req: ChatRequest):
    """Lightweight direct OpenAI call — bypasses LangGraph for simple Q&A."""
    from config import settings
    from openai import AsyncOpenAI

    try:
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

        history = [
            {"role": m.role if m.role != "model" else "assistant", "content": m.content}
            for m in req.history[-6:]
        ]
        messages = [
            {"role": "system", "content": "You are Artha, a concise AI financial advisor for Indian users. Use Indian number format (₹1.5L, ₹1Cr). Keep answers brief and actionable."},
            *history,
            {"role": "user", "content": req.message},
        ]

        resp = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=512,
            temperature=0.3,
        )
        return ChatResponse(reply=resp.choices[0].message.content)

    except Exception as e:
        logger.error(f"Quick chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
