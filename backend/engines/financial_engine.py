"""
Financial Engine — FIRE, Health Score, Couple Planning
"""
import math
from typing import List
from pydantic import BaseModel


# ── FIRE ──────────────────────────────────────────────────────────────────────
class FIRERequest(BaseModel):
    age: int; retire_age: int; income: float; expenses: float
    savings: float = 0; investments: float = 0
    return_rate: float = 12.0; inflation: float = 6.0


class FIREPhase(BaseModel):
    phase: str; timeline: str; monthly_sip: float
    asset_mix: str; corpus_target: float; status: str


class YearPoint(BaseModel):
    year: int; age: int; corpus: float


class FIREResult(BaseModel):
    fire_corpus: float; years_to_fire: int; monthly_sip: float
    current_net_worth: float; projected_corpus: float; shortfall: float
    on_track: bool; phases: List[FIREPhase]; timeline: List[YearPoint]
    insurance_gap: float; emergency_gap: float


def calculate_fire(req: FIRERequest) -> FIREResult:
    yrs = req.retire_age - req.age
    if yrs <= 0:
        raise ValueError("Retirement age must be greater than current age")

    mr = req.return_rate / 100 / 12
    infl = req.inflation / 100
    future_exp = req.expenses * math.pow(1 + infl, yrs)
    fire_corpus = future_exp * 12 * 25

    net_worth = req.savings + req.investments
    grown = net_worth * math.pow(1 + req.return_rate / 100, yrs)
    gap = max(0.0, fire_corpus - grown)
    months = yrs * 12
    sip = (gap * mr / (math.pow(1 + mr, months) - 1)) if (gap > 0 and mr > 0) else 0.0

    surplus = req.income - req.expenses
    from datetime import datetime
    cur_year = datetime.now().year
    timeline = []
    corpus = net_worth
    for y in range(yrs + 1):
        timeline.append(YearPoint(year=cur_year + y, age=req.age + y, corpus=round(corpus)))
        corpus = corpus * (1 + req.return_rate / 100) + surplus * 12

    projected = timeline[-1].corpus if timeline else 0
    shortfall = max(0, fire_corpus - projected)
    p1 = round(yrs * 0.33)
    p2 = round(yrs * 0.67)

    phases = [
        FIREPhase(phase="Foundation", timeline=f"Age {req.age}–{req.age + p1}", monthly_sip=round(sip * 0.7 / 500) * 500, asset_mix="80% Equity · 15% Debt · 5% Gold", corpus_target=round(fire_corpus * 0.25), status="building"),
        FIREPhase(phase="Acceleration", timeline=f"Age {req.age + p1}–{req.age + p2}", monthly_sip=round(sip / 500) * 500, asset_mix="70% Equity · 20% Debt · 10% Gold", corpus_target=round(fire_corpus * 0.60), status="accelerating"),
        FIREPhase(phase="Coast FIRE", timeline=f"Age {req.age + p2}–{req.retire_age - 2}", monthly_sip=round(sip * 0.5 / 500) * 500, asset_mix="50% Equity · 35% Debt · 15% Gold", corpus_target=round(fire_corpus * 0.85), status="coast"),
        FIREPhase(phase="FIRE", timeline=f"Age {req.retire_age}+", monthly_sip=0, asset_mix="30% Equity · 50% Debt · 20% Gold", corpus_target=round(fire_corpus), status="fire"),
    ]

    return FIREResult(
        fire_corpus=round(fire_corpus), years_to_fire=yrs,
        monthly_sip=round(sip / 500) * 500, current_net_worth=round(net_worth),
        projected_corpus=round(projected), shortfall=round(shortfall),
        on_track=shortfall < fire_corpus * 0.05,
        phases=phases, timeline=timeline,
        insurance_gap=round(req.income * 12 * 15),
        emergency_gap=round(max(0, req.expenses * 6 - req.savings)),
    )


# ── Health Score ──────────────────────────────────────────────────────────────
class HealthRequest(BaseModel):
    income: float; expenses: float; emergency_fund: float
    life_insurance_cover: float; total_investments: float
    debt_emi: float = 0; nps_contribution: float = 0
    age: int = 30; retirement_savings: float = 0


class HealthDimension(BaseModel):
    key: str; label: str; score: int; color: str
    insight: str; action: str


class HealthResult(BaseModel):
    overall: int; grade: str; dimensions: List[HealthDimension]


def calculate_health(req: HealthRequest) -> HealthResult:
    em = min(100, round(req.emergency_fund / max(req.expenses, 1) / 6 * 100))
    ins = min(100, round(req.life_insurance_cover / max(req.income * 12 * 15, 1) * 100))
    inv = min(100, round(req.total_investments / max(req.income * 12, 1) * 25))
    dbt = min(100, max(0, round((1 - req.debt_emi / max(req.income * 0.4, 1)) * 100)))
    tax = min(100, round(req.nps_contribution / 50000 * 40 + 60))
    ret = min(100, round(req.retirement_savings / max(req.income * 12 * max(req.age - 22, 1) * 0.5, 1) * 80))
    overall = round((em + ins + inv + dbt + tax + ret) / 6)
    grade = "Excellent" if overall >= 85 else "Good" if overall >= 70 else "Fair" if overall >= 55 else "Needs Attention"

    dims = [
        HealthDimension(key="emergency", label="Emergency Fund", score=em, color="#059669",
            insight="Adequate" if em >= 80 else "Below 6-month target",
            action=f"Top up by ₹{max(0, round(req.expenses * 6 - req.emergency_fund)):,}"),
        HealthDimension(key="insurance", label="Insurance", score=ins, color="#d97706",
            insight="Good coverage" if ins >= 70 else "Cover is below 15x income",
            action=f"Buy term cover of ₹{round(req.income * 12 * 15 / 100000)}L online"),
        HealthDimension(key="investment", label="Investments", score=inv, color="#1a56db",
            insight="Strong corpus" if inv >= 70 else "Investment corpus is low",
            action="Start SIP of 20% of income in diversified equity funds"),
        HealthDimension(key="debt", label="Debt Health", score=dbt, color="#059669",
            insight="Healthy EMI ratio" if dbt >= 80 else "EMI ratio too high",
            action="Prepay high-interest debt first (credit cards, personal loans)"),
        HealthDimension(key="tax", label="Tax Efficiency", score=tax, color="#dc2626",
            insight="Good tax planning" if tax >= 70 else "Missing deductions",
            action="Max 80C (₹1.5L) + NPS 80CCD(1B) (₹50K) + 80D (₹25K)"),
        HealthDimension(key="retirement", label="Retirement", score=ret, color="#7c3aed",
            insight="On track" if ret >= 70 else "Behind schedule",
            action="Increase NPS/EPF contributions; start retirement SIP"),
    ]
    return HealthResult(overall=overall, grade=grade, dimensions=dims)
