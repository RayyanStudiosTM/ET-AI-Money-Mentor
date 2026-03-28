from fastapi import APIRouter, HTTPException, UploadFile, File
from engines.tax_engine import TaxRequest, calculate_tax
from engines.financial_engine import FIRERequest, HealthRequest, calculate_fire, calculate_health
import logging, math

# ── Tax Router ─────────────────────────────────────────────────────────────────
tax_router = APIRouter()
logger = logging.getLogger(__name__)


@tax_router.post("/analyze")
async def analyze_tax(req: TaxRequest):
    try:
        return calculate_tax(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@tax_router.post("/form16")
async def upload_form16(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=422, detail="Only PDF files supported")
    try:
        import pdfplumber, io, re
        content = await file.read()
        text = ""
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""

        def extract(pattern):
            m = re.search(pattern, text, re.IGNORECASE)
            if m:
                try: return float(m.group(1).replace(",", ""))
                except: return 0.0
            return 0.0

        return {
            "status": "parsed",
            "data": {
                "basic_salary": extract(r"basic\s+salary[:\s]+([0-9,]+)"),
                "hra": extract(r"house\s+rent[:\s]+([0-9,]+)"),
                "gross": extract(r"gross\s+salary[:\s]+([0-9,]+)"),
                "tds": extract(r"tax\s+deducted[:\s]+([0-9,]+)"),
            }
        }
    except Exception as e:
        logger.error(f"Form 16 parse error: {e}")
        raise HTTPException(status_code=500, detail=f"Could not parse Form 16: {str(e)}")


# ── Finance Router ─────────────────────────────────────────────────────────────
finance_router = APIRouter()


@finance_router.post("/fire")
async def fire(req: FIRERequest):
    try:
        return calculate_fire(req)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@finance_router.post("/health-score")
async def health_score(req: HealthRequest):
    try:
        return calculate_health(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ── Portfolio Router ───────────────────────────────────────────────────────────
portfolio_router = APIRouter()

SAMPLE = [
    {"id": "1", "name": "Mirae Asset Large Cap — Direct", "category": "Large Cap", "invested": 300000, "current": 412000, "years": 3.5, "expense_ratio": 0.54, "overlap_pct": 72},
    {"id": "2", "name": "Axis Bluechip Fund — Direct", "category": "Large Cap", "invested": 200000, "current": 261000, "years": 2.8, "expense_ratio": 0.43, "overlap_pct": 72},
    {"id": "3", "name": "Parag Parikh Flexi Cap — Direct", "category": "Flexi Cap", "invested": 500000, "current": 748000, "years": 4.0, "expense_ratio": 0.63, "overlap_pct": 18},
    {"id": "4", "name": "SBI Small Cap Fund — Direct", "category": "Small Cap", "invested": 150000, "current": 238000, "years": 3.0, "expense_ratio": 0.67, "overlap_pct": 10},
    {"id": "5", "name": "HDFC Short Term Debt — Direct", "category": "Debt", "invested": 250000, "current": 291000, "years": 2.5, "expense_ratio": 0.28, "overlap_pct": 0},
]


def xirr(invested, current, years):
    if invested <= 0 or years <= 0: return 0.0
    return round((math.pow(current / invested, 1 / years) - 1) * 100, 2)


def analyze(holdings):
    total_inv = sum(h["invested"] for h in holdings)
    total_cur = sum(h["current"] for h in holdings)
    true_xirr = xirr(total_inv, total_cur, 3.2)
    exp_drag = sum(h["expense_ratio"] * h["current"] / 100 for h in holdings)

    processed = []
    for h in holdings:
        xi = xirr(h["invested"], h["current"], h.get("years", 2))
        act = "exit" if (h["category"] == "Large Cap" and h["overlap_pct"] > 65) else \
              "review" if (xi < 8 and h["category"] != "Debt") else \
              "buy-more" if xi > 18 else "hold"
        processed.append({**h, "xirr": xi, "action": act})

    return {
        "total_invested": round(total_inv),
        "total_current": round(total_cur),
        "total_gain": round(total_cur - total_inv),
        "true_xirr": true_xirr,
        "expense_drag_annual": round(exp_drag),
        "holdings": processed,
        "rebalance_plan": [
            "Exit Axis Bluechip Fund — 72% overlap with Mirae Large Cap",
            "Increase Parag Parikh Flexi Cap allocation — high quality, global diversification",
            "Add mid-cap exposure — currently no allocation in mid-cap segment",
            "Switch any Regular plan to Direct — saves 0.5–1% annually",
        ],
    }


@portfolio_router.get("/sample")
async def sample():
    return analyze(SAMPLE)


@portfolio_router.post("/upload")
async def upload(file: UploadFile = File(...)):
    allowed = [".pdf", ".xlsx", ".xls", ".csv"]
    ext = "." + file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in allowed:
        raise HTTPException(status_code=422, detail=f"Unsupported file type. Allowed: {allowed}")
    # In production: parse the actual file
    # For now, return sample data
    return analyze(SAMPLE)
