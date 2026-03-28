// ── Number formatting ──────────────────────────────────────────────────────────
export const fmtINR = (n: number): string => {
  if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  if (Math.abs(n) >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`;
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
};

export const fmtNum = (n: number): string =>
  new Intl.NumberFormat("en-IN").format(Math.round(n));

// ── FIRE Calculator ────────────────────────────────────────────────────────────
export interface FIREInput {
  age: number; retireAge: number;
  income: number; expenses: number;
  savings: number; investments: number;
  returnRate: number; inflation: number;
}

export interface FIREResult {
  fireCorpus: number; yearsToFIRE: number;
  monthlySIP: number; currentNetWorth: number;
  projectedCorpus: number; shortfall: number;
  onTrack: boolean;
  timeline: { year: number; age: number; corpus: number }[];
  phases: { phase: string; timeline: string; sip: number; assetMix: string; target: number; status: string }[];
}

export function calcFIRE(input: FIREInput): FIREResult {
  const yrs = input.retireAge - input.age;
  if (yrs <= 0) throw new Error("Retirement age must be greater than current age");
  const mr = input.returnRate / 100 / 12;
  const infl = input.inflation / 100;
  const futureExp = input.expenses * Math.pow(1 + infl, yrs);
  const fireCorpus = futureExp * 12 * 25;
  const netWorth = input.savings + input.investments;
  const grown = netWorth * Math.pow(1 + input.returnRate / 100, yrs);
  const gap = Math.max(0, fireCorpus - grown);
  const months = yrs * 12;
  const monthlySIP = gap > 0 && mr > 0
    ? (gap * mr) / (Math.pow(1 + mr, months) - 1) : 0;

  const surplus = input.income - input.expenses;
  const timeline = [];
  let corpus = netWorth;
  const yr = new Date().getFullYear();
  for (let y = 0; y <= yrs; y++) {
    timeline.push({ year: yr + y, age: input.age + y, corpus: Math.round(corpus) });
    corpus = corpus * (1 + input.returnRate / 100) + surplus * 12;
  }

  const projected = timeline[timeline.length - 1]?.corpus || 0;
  const shortfall = Math.max(0, fireCorpus - projected);
  const p = Math.floor(yrs * 0.33);
  const p2 = Math.floor(yrs * 0.67);

  return {
    fireCorpus: Math.round(fireCorpus),
    yearsToFIRE: yrs,
    monthlySIP: Math.round(monthlySIP / 500) * 500,
    currentNetWorth: Math.round(netWorth),
    projectedCorpus: Math.round(projected),
    shortfall: Math.round(shortfall),
    onTrack: shortfall < fireCorpus * 0.05,
    timeline,
    phases: [
      { phase: "Foundation", timeline: `${input.age}–${input.age + p} yrs`, sip: Math.round(monthlySIP * 0.7 / 500) * 500, assetMix: "80% Equity · 15% Debt · 5% Gold", target: Math.round(fireCorpus * 0.25), status: "building" },
      { phase: "Acceleration", timeline: `${input.age + p}–${input.age + p2} yrs`, sip: Math.round(monthlySIP / 500) * 500, assetMix: "70% Equity · 20% Debt · 10% Gold", target: Math.round(fireCorpus * 0.60), status: "accelerating" },
      { phase: "Coast FIRE", timeline: `${input.age + p2}–${input.retireAge - 2} yrs`, sip: Math.round(monthlySIP * 0.5 / 500) * 500, assetMix: "50% Equity · 35% Debt · 15% Gold", target: Math.round(fireCorpus * 0.85), status: "coast" },
      { phase: "FIRE", timeline: `Age ${input.retireAge}+`, sip: 0, assetMix: "30% Equity · 50% Debt · 20% Gold", target: Math.round(fireCorpus), status: "fire" },
    ],
  };
}

// ── Tax Calculator ─────────────────────────────────────────────────────────────
export interface TaxInput {
  basicSalary: number; hra: number; specialAllowance: number;
  otherIncome: number; rentPaid: number; cityType: "metro" | "non-metro";
  investments80c: number; nps80ccd: number; healthInsurance80d: number;
  homeLoanInterest: number; educationLoanInterest: number;
}

export interface TaxResult {
  gross: number; oldTax: number; newTax: number;
  oldDeductions: number; newDeductions: number;
  recommendation: "old" | "new"; saving: number;
  effectiveOld: number; effectiveNew: number;
  deductions: { section: string; name: string; claimed: number; max: number; pct: number }[];
  missing: { section: string; name: string; potential: number; tip: string }[];
}

function hraExemption(basic: number, hra: number, rent: number, metro: boolean): number {
  if (!hra || !rent) return 0;
  return Math.min(hra, Math.max(0, rent * 12 - basic * 0.1), basic * (metro ? 0.5 : 0.4));
}

function oldSlab(inc: number): number {
  if (inc <= 250000) return 0;
  if (inc <= 500000) return (inc - 250000) * 0.05;
  if (inc <= 1000000) return 12500 + (inc - 500000) * 0.20;
  return 112500 + (inc - 1000000) * 0.30;
}

function newSlab(inc: number): number {
  if (inc <= 300000) return 0;
  if (inc <= 600000) return (inc - 300000) * 0.05;
  if (inc <= 900000) return 15000 + (inc - 600000) * 0.10;
  if (inc <= 1200000) return 45000 + (inc - 900000) * 0.15;
  if (inc <= 1500000) return 90000 + (inc - 1200000) * 0.20;
  return 150000 + (inc - 1500000) * 0.30;
}

export function calcTax(inp: TaxInput): TaxResult {
  const gross = inp.basicSalary + inp.hra + inp.specialAllowance + inp.otherIncome;
  const hraEx = hraExemption(inp.basicSalary, inp.hra, inp.rentPaid, inp.cityType === "metro");
  const std = 50000;
  const c80 = Math.min(inp.investments80c, 150000);
  const nps = Math.min(inp.nps80ccd, 50000);
  const d80 = Math.min(inp.healthInsurance80d, 25000);
  const home = Math.min(inp.homeLoanInterest, 200000);
  const edu = inp.educationLoanInterest;
  const oldDed = hraEx + std + c80 + nps + d80 + home + edu;
  const oldTaxable = Math.max(0, gross - oldDed);
  let oldTax = oldSlab(oldTaxable);
  if (oldTaxable <= 500000) oldTax = 0;
  oldTax = Math.round(oldTax * 1.04);

  const newDed = 75000;
  const newTaxable = Math.max(0, gross - newDed);
  let newTax = newSlab(newTaxable);
  if (newTaxable <= 700000) newTax = 0;
  newTax = Math.round(newTax * 1.04);

  const rec = oldTax <= newTax ? "old" : "new";
  const bracket = gross > 1000000 ? 0.30 : gross > 500000 ? 0.20 : 0.05;

  const missing = [];
  if (c80 < 150000) missing.push({ section: "80C", name: "PPF / ELSS top-up", potential: Math.round((150000 - c80) * bracket), tip: `Invest ₹${fmtNum(150000 - c80)} more in ELSS or PPF` });
  if (!nps) missing.push({ section: "80CCD(1B)", name: "NPS contribution", potential: Math.round(50000 * bracket), tip: "Open NPS Tier-1 and invest ₹50,000 for extra deduction" });
  if (d80 < 25000) missing.push({ section: "80D", name: "Health insurance", potential: Math.round((25000 - d80) * bracket), tip: "Increase health cover — premium qualifies up to ₹25,000" });

  return {
    gross: Math.round(gross), oldTax, newTax,
    oldDeductions: Math.round(oldDed), newDeductions: newDed,
    recommendation: rec, saving: Math.abs(oldTax - newTax),
    effectiveOld: Math.round(oldTax / Math.max(1, gross) * 1000) / 10,
    effectiveNew: Math.round(newTax / Math.max(1, gross) * 1000) / 10,
    deductions: [
      { section: "Std", name: "Standard Deduction", claimed: std, max: 50000, pct: 100 },
      { section: "HRA", name: "House Rent Allowance", claimed: Math.round(hraEx), max: Math.max(inp.hra, 1), pct: Math.min(100, Math.round(hraEx / Math.max(inp.hra, 1) * 100)) },
      { section: "80C", name: "PPF / ELSS / PF", claimed: c80, max: 150000, pct: Math.round(c80 / 150000 * 100) },
      { section: "80CCD(1B)", name: "NPS Additional", claimed: nps, max: 50000, pct: Math.round(nps / 50000 * 100) },
      { section: "80D", name: "Health Insurance", claimed: d80, max: 25000, pct: Math.round(d80 / 25000 * 100) },
      { section: "24(b)", name: "Home Loan Interest", claimed: home, max: 200000, pct: Math.round(home / 200000 * 100) },
    ],
    missing,
  };
}

// ── Health Score ────────────────────────────────────────────────────────────────
export function calcHealth(d: {
  income: number; expenses: number; emergencyFund: number;
  lifeInsuranceCover: number; totalInvestments: number;
  debtEmi: number; npsContribution: number; age: number; retirementSavings: number;
}) {
  const em = Math.min(100, Math.round((d.emergencyFund / Math.max(d.expenses, 1)) / 6 * 100));
  const ins = Math.min(100, Math.round(d.lifeInsuranceCover / Math.max(d.income * 12 * 15, 1) * 100));
  const inv = Math.min(100, Math.round(d.totalInvestments / Math.max(d.income * 12, 1) * 25));
  const dbt = Math.min(100, Math.max(0, Math.round((1 - d.debtEmi / Math.max(d.income * 0.4, 1)) * 100)));
  const tax = Math.min(100, Math.round((d.npsContribution / 50000) * 40 + 60));
  const ret = Math.min(100, Math.round(d.retirementSavings / Math.max(d.income * 12 * Math.max(d.age - 22, 1) * 0.5, 1) * 80));
  const overall = Math.round((em + ins + inv + dbt + tax + ret) / 6);
  return {
    overall,
    grade: overall >= 85 ? "Excellent" : overall >= 70 ? "Good" : overall >= 55 ? "Fair" : "Needs Attention",
    dimensions: [
      { key: "emergency", label: "Emergency Fund", score: em, color: "#059669" },
      { key: "insurance", label: "Insurance", score: ins, color: "#d97706" },
      { key: "investment", label: "Investments", score: inv, color: "#1a56db" },
      { key: "debt", label: "Debt Health", score: dbt, color: "#059669" },
      { key: "tax", label: "Tax Efficiency", score: tax, color: "#dc2626" },
      { key: "retirement", label: "Retirement", score: ret, color: "#7c3aed" },
    ],
  };
}

// ── XIRR approximation ─────────────────────────────────────────────────────────
export const calcXIRR = (invested: number, current: number, years: number): number =>
  years > 0 && invested > 0
    ? Math.round((Math.pow(current / invested, 1 / years) - 1) * 1000) / 10
    : 0;
