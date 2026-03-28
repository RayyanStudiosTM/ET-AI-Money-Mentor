"""
Tax Engine — FY 2024-25 Indian Income Tax Calculator
Old vs New regime, all major deductions, HRA exemption
"""
import math
from typing import Optional
from pydantic import BaseModel


class TaxRequest(BaseModel):
    basic_salary: float
    hra: float = 0
    special_allowance: float = 0
    other_income: float = 0
    rent_paid: float = 0
    city_type: str = "metro"
    investments_80c: float = 0
    nps_80ccd: float = 0
    health_insurance_80d: float = 0
    home_loan_interest: float = 0
    education_loan_interest: float = 0
    donations_80g: float = 0


class DeductionLine(BaseModel):
    section: str
    name: str
    claimed: float
    max_allowed: float
    pct_used: int


class MissingDeduction(BaseModel):
    section: str
    name: str
    potential_saving: float
    tip: str


class TaxResult(BaseModel):
    gross_income: float
    old_regime_tax: float
    new_regime_tax: float
    old_deductions: float
    new_deductions: float
    recommendation: str
    saving: float
    effective_old_rate: float
    effective_new_rate: float
    old_taxable_income: float
    new_taxable_income: float
    deduction_breakdown: list[DeductionLine]
    missing_deductions: list[MissingDeduction]


def _hra_exemption(basic: float, hra: float, rent: float, metro: bool) -> float:
    if not hra or not rent:
        return 0.0
    return min(hra, max(0, rent * 12 - basic * 0.1), basic * (0.5 if metro else 0.4))


def _old_slab(income: float) -> float:
    if income <= 250000: return 0
    if income <= 500000: return (income - 250000) * 0.05
    if income <= 1000000: return 12500 + (income - 500000) * 0.20
    return 112500 + (income - 1000000) * 0.30


def _new_slab(income: float) -> float:
    if income <= 300000: return 0
    if income <= 600000: return (income - 300000) * 0.05
    if income <= 900000: return 15000 + (income - 600000) * 0.10
    if income <= 1200000: return 45000 + (income - 900000) * 0.15
    if income <= 1500000: return 90000 + (income - 1200000) * 0.20
    return 150000 + (income - 1500000) * 0.30


def calculate_tax(req: TaxRequest) -> TaxResult:
    gross = req.basic_salary + req.hra + req.special_allowance + req.other_income
    metro = req.city_type == "metro"

    # Old regime
    hra_ex = _hra_exemption(req.basic_salary, req.hra, req.rent_paid, metro)
    std = 50000.0
    c80 = min(req.investments_80c, 150000.0)
    nps = min(req.nps_80ccd, 50000.0)
    d80 = min(req.health_insurance_80d, 25000.0)
    home = min(req.home_loan_interest, 200000.0)
    edu = req.education_loan_interest
    donations = min(req.donations_80g, gross * 0.10)

    old_ded = hra_ex + std + c80 + nps + d80 + home + edu + donations
    old_taxable = max(0.0, gross - old_ded)
    old_tax = _old_slab(old_taxable)
    if old_taxable <= 500000:
        old_tax = 0.0
    old_tax = round(old_tax * 1.04)

    # New regime (FY 2024-25)
    new_std = 75000.0
    new_ded = new_std
    new_taxable = max(0.0, gross - new_ded)
    new_tax = _new_slab(new_taxable)
    if new_taxable <= 700000:
        new_tax = 0.0
    new_tax = round(new_tax * 1.04)

    rec = "old" if old_tax <= new_tax else "new"
    saving = abs(old_tax - new_tax)
    bracket = 0.30 if gross > 1000000 else 0.20 if gross > 500000 else 0.05

    # Deduction breakdown
    breakdown = [
        DeductionLine(section="Std", name="Standard Deduction", claimed=std, max_allowed=50000, pct_used=100),
        DeductionLine(section="HRA", name="HRA Exemption", claimed=round(hra_ex), max_allowed=max(req.hra, 1), pct_used=min(100, round(hra_ex / max(req.hra, 1) * 100))),
        DeductionLine(section="80C", name="PPF / ELSS / PF", claimed=c80, max_allowed=150000, pct_used=round(c80 / 150000 * 100)),
        DeductionLine(section="80CCD(1B)", name="NPS Additional", claimed=nps, max_allowed=50000, pct_used=round(nps / 50000 * 100)),
        DeductionLine(section="80D", name="Health Insurance", claimed=d80, max_allowed=25000, pct_used=round(d80 / 25000 * 100)),
        DeductionLine(section="24(b)", name="Home Loan Interest", claimed=home, max_allowed=200000, pct_used=round(home / 200000 * 100)),
        DeductionLine(section="80E", name="Education Loan Interest", claimed=edu, max_allowed=-1, pct_used=100 if edu > 0 else 0),
    ]

    # Missing deductions
    missing = []
    if c80 < 150000:
        missing.append(MissingDeduction(section="80C", name="PPF / ELSS top-up",
            potential_saving=round((150000 - c80) * bracket),
            tip=f"Invest ₹{int(150000 - c80):,} more in ELSS/PPF to max 80C"))
    if nps == 0:
        missing.append(MissingDeduction(section="80CCD(1B)", name="NPS contribution",
            potential_saving=round(50000 * bracket),
            tip="Open NPS Tier-1 — ₹50,000 extra deduction over 80C limit"))
    if d80 < 25000:
        missing.append(MissingDeduction(section="80D", name="Health insurance gap",
            potential_saving=round((25000 - d80) * bracket),
            tip=f"Increase health cover — ₹{int(25000 - d80):,} more premium qualifies"))

    return TaxResult(
        gross_income=round(gross), old_regime_tax=old_tax, new_regime_tax=new_tax,
        old_deductions=round(old_ded), new_deductions=round(new_ded),
        recommendation=rec, saving=round(saving),
        effective_old_rate=round(old_tax / max(gross, 1) * 1000) / 10,
        effective_new_rate=round(new_tax / max(gross, 1) * 1000) / 10,
        old_taxable_income=round(old_taxable), new_taxable_income=round(new_taxable),
        deduction_breakdown=breakdown, missing_deductions=missing,
    )
