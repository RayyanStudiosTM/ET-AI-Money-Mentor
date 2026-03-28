"""
LangGraph Agent Pipeline — OpenAI-powered financial advisor
4-node graph: classify → enrich → respond → followups
"""
from typing import TypedDict, Annotated, Sequence, Optional
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
import operator
import json
import logging

from config import settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are Artha, an expert AI financial advisor for Indian users on Money Mentor.

EXPERTISE:
- Indian tax law (FY 2024-25): Old vs New regime, 80C/80D/HRA/NPS/24b/80E/80G
- Mutual funds: SIP, ELSS, Direct vs Regular, XIRR, portfolio rebalancing
- FIRE planning: 4% withdrawal rule, inflation-adjusted corpus calculation
- Insurance: Term life (15x income rule), health insurance, critical illness
- Instruments: Equity, Debt, Gold ETF, PPF, NPS, EPF, FD, SGBs, REITs
- Regulations: SEBI, AMFI, IRDAI, EPFO, RBI

RULES:
1. Use Indian number format: ₹1.5L (not ₹150,000), ₹1.2Cr (not ₹12,000,000)
2. Always cite relevant sections (80C, 24b, etc.) when discussing tax
3. Never recommend specific stocks or time the market
4. Add this disclaimer when giving investment guidance:
   "Note: Educational guidance only. Not SEBI-registered investment advisory."
5. Be concise — prefer bullet points over long paragraphs
6. Personalise answers using the user's profile data when provided"""


def get_llm(temperature: float = 0.2):
    return ChatOpenAI(
        model="gpt-4o-mini",
        api_key=settings.OPENAI_API_KEY,
        temperature=temperature,
        max_tokens=1024,
    )


class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]
    user_context: dict
    intent: Optional[str]
    enriched_data: Optional[dict]
    final_response: Optional[str]
    follow_ups: Optional[list]


# ── Node 1: Intent Classification ──────────────────────────────────────────────
async def classify_intent(state: AgentState) -> AgentState:
    llm = get_llm(temperature=0.0)
    last = state["messages"][-1].content if state["messages"] else ""

    prompt = f"""Classify this financial query into ONE category:
TAX | FIRE | INVESTMENT | INSURANCE | DEBT | GOAL | GENERAL

Query: "{last}"
Respond with ONLY the category name."""

    resp = await llm.ainvoke([HumanMessage(content=prompt)])
    intent = resp.content.strip().upper()
    valid = {"TAX", "FIRE", "INVESTMENT", "INSURANCE", "DEBT", "GOAL", "GENERAL"}
    return {**state, "intent": intent if intent in valid else "GENERAL"}


# ── Node 2: Context Enrichment ─────────────────────────────────────────────────
async def enrich_context(state: AgentState) -> AgentState:
    """Add pre-calculated financial data based on intent + user profile."""
    ctx = state.get("user_context", {})
    intent = state.get("intent", "GENERAL")
    enriched = {}

    income = ctx.get("income", 0)
    expenses = ctx.get("expenses", 0)
    age = ctx.get("age", 30)

    if intent == "FIRE" and income > 0:
        monthly_surplus = max(0, income - expenses)
        fire_corpus = expenses * 12 * 25
        enriched["fire"] = {
            "fire_corpus_needed": fire_corpus,
            "monthly_surplus": monthly_surplus,
            "suggested_sip": round(monthly_surplus * 0.7 / 500) * 500,
        }
    elif intent == "TAX" and income > 0:
        annual = income * 12
        enriched["tax"] = {
            "annual_income": annual,
            "likely_bracket": "30%" if annual > 1000000 else "20%" if annual > 500000 else "5%",
            "potential_80c_saving": min(150000, annual * 0.15),
            "nps_saving": 50000 * (0.30 if annual > 1000000 else 0.20),
        }

    return {**state, "enriched_data": enriched}


# ── Node 3: Response Generation ────────────────────────────────────────────────
async def generate_response(state: AgentState) -> AgentState:
    llm = get_llm(temperature=0.3)
    ctx = state.get("user_context", {})
    enriched = state.get("enriched_data", {})

    context_str = ""
    if ctx.get("income"):
        context_str = (
            f"\n\nUser profile: Age {ctx.get('age', '?')}, "
            f"Monthly income ₹{ctx.get('income', 0)/1000:.0f}K, "
            f"Expenses ₹{ctx.get('expenses', 0)/1000:.0f}K, "
            f"Risk: {ctx.get('risk_profile', 'moderate')}."
        )
    if enriched:
        context_str += f"\n\nPre-calculated data: {json.dumps(enriched, indent=2)}"

    system = SYSTEM_PROMPT + context_str
    messages = [SystemMessage(content=system)] + list(state["messages"])
    resp = await llm.ainvoke(messages)
    return {**state, "final_response": resp.content}


# ── Node 4: Follow-up Suggestions ─────────────────────────────────────────────
async def generate_followups(state: AgentState) -> AgentState:
    llm = get_llm(temperature=0.5)
    last = state["messages"][-1].content if state["messages"] else ""
    intent = state.get("intent", "GENERAL")

    prompt = f"""Based on this financial query: "{last}" (intent: {intent})

Generate 3 short follow-up questions an Indian investor might ask next.
Return ONLY a JSON array, e.g.: ["Q1?", "Q2?", "Q3?"]
Keep each under 55 characters."""

    resp = await llm.ainvoke([HumanMessage(content=prompt)])
    try:
        text = resp.content
        start, end = text.find("["), text.rfind("]") + 1
        fups = json.loads(text[start:end]) if start >= 0 and end > start else []
    except Exception:
        fups = []

    return {**state, "follow_ups": fups}


# ── Routing ───────────────────────────────────────────────────────────────────
def needs_enrichment(state: AgentState) -> str:
    ctx = state.get("user_context", {})
    intent = state.get("intent", "GENERAL")
    return "enrich" if ctx.get("income") and intent in {"TAX", "FIRE", "INVESTMENT"} else "respond"


# ── Build graph ────────────────────────────────────────────────────────────────
def build_agent():
    g = StateGraph(AgentState)
    g.add_node("classify", classify_intent)
    g.add_node("enrich", enrich_context)
    g.add_node("respond", generate_response)
    g.add_node("followups", generate_followups)
    g.set_entry_point("classify")
    g.add_conditional_edges("classify", needs_enrichment, {"enrich": "enrich", "respond": "respond"})
    g.add_edge("enrich", "respond")
    g.add_edge("respond", "followups")
    g.add_edge("followups", END)
    return g.compile()


_agent = None

def get_agent():
    global _agent
    if _agent is None:
        _agent = build_agent()
    return _agent
