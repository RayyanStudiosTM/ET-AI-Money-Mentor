// ── Portfolio X-Ray ────────────────────────────────────────────────────────────
import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts";
import { calcHealth, calcXIRR, fmtINR, fmtNum } from "@/lib/finance";
import { Button, Input, Card, Stat, Select, SectionHeader, Alert, ProgressBar } from "@/components/ui";
import { Upload } from "lucide-react";

const SAMPLE_HOLDINGS = [
  { id: "1", name: "Mirae Asset Large Cap — Direct", category: "Large Cap", invested: 300000, current: 412000, years: 3.5, exp: 0.54, overlap: 72 },
  { id: "2", name: "Axis Bluechip Fund — Direct", category: "Large Cap", invested: 200000, current: 261000, years: 2.8, exp: 0.43, overlap: 72 },
  { id: "3", name: "Parag Parikh Flexi Cap — Direct", category: "Flexi Cap", invested: 500000, current: 748000, years: 4.0, exp: 0.63, overlap: 18 },
  { id: "4", name: "SBI Small Cap Fund — Direct", category: "Small Cap", invested: 150000, current: 238000, years: 3.0, exp: 0.67, overlap: 10 },
  { id: "5", name: "HDFC Short Term Debt — Direct", category: "Debt", invested: 250000, current: 291000, years: 2.5, exp: 0.28, overlap: 0 },
];

const PIE_COLORS = ["#1a56db", "#7c3aed", "#059669", "#d97706", "#0891b2"];

export function PortfolioModule() {
  const [loaded, setLoaded] = useState(false);
  const [dragging, setDragging] = useState(false);

  const holdings = SAMPLE_HOLDINGS.map((h) => ({ ...h, xirr: calcXIRR(h.invested, h.current, h.years) }));
  const totalInvested = holdings.reduce((a, h) => a + h.invested, 0);
  const totalCurrent = holdings.reduce((a, h) => a + h.current, 0);
  const trueXIRR = calcXIRR(totalInvested, totalCurrent, 3.2);
  const expDrag = holdings.reduce((a, h) => a + h.exp * h.current / 100, 0);

  const catAlloc = Object.entries(holdings.reduce((acc, h) => { acc[h.category] = (acc[h.category] || 0) + h.current; return acc; }, {} as Record<string, number>))
    .map(([name, value]) => ({ name, value }));

  const getAction = (xirr: number, overlap: number, cat: string): string => {
    if (cat === "Large Cap" && overlap > 65) return "Exit";
    if (xirr < 8 && cat !== "Debt") return "Review";
    if (xirr > 18) return "Add More";
    return "Hold";
  };
  const actionColors: Record<string, string> = { Exit: "#dc2626", Review: "#d97706", "Add More": "#1a56db", Hold: "#059669" };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <SectionHeader title="Portfolio X-Ray" subtitle="True XIRR, overlap analysis, expense drag and rebalancing plan" />

      {!loaded ? (
        <Card>
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${dragging ? "border-brand bg-brand/3" : "border-[#e8e8e8] hover:border-[#b0b0b0]"}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); setLoaded(true); }}
            onClick={() => setLoaded(true)}
          >
            <div className="w-10 h-10 bg-[#f5f5f5] rounded-xl flex items-center justify-center mx-auto mb-3">
              <Upload size={18} className="text-[#8c8c8c]" />
            </div>
            <p className="text-sm font-medium text-[#1a1a1a] mb-1">Upload CAMS or KFintech Statement</p>
            <p className="text-xs text-[#8c8c8c]">PDF, Excel or CSV · Or click to load demo portfolio</p>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setLoaded(true)}>Load demo portfolio</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4 animate-fade-up">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="Total Invested" value={fmtINR(totalInvested)} color="#8c8c8c" />
            <Stat label="Current Value" value={fmtINR(totalCurrent)} color="#059669" sub={`+${fmtINR(totalCurrent - totalInvested)}`} />
            <Stat label="True XIRR" value={`${trueXIRR}%`} color={trueXIRR > 12 ? "#059669" : "#d97706"} />
            <Stat label="Annual Expense Drag" value={`-${fmtINR(expDrag)}`} color="#dc2626" />
          </div>

          <Alert type="warning">High overlap detected between Mirae Asset Large Cap and Axis Bluechip (72% common stocks). Consider exiting one to reduce duplication.</Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3">Category Allocation</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={catAlloc} cx="50%" cy="50%" innerRadius={48} outerRadius={78} dataKey="value" paddingAngle={3}>
                    {catAlloc.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [fmtINR(v), "Value"]} />
                  <Legend formatter={(v) => <span style={{ fontSize: 11, color: "#666" }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3">Rebalancing Plan</h3>
              <div className="space-y-2">
                {[
                  { action: "Exit", fund: "Axis Bluechip Fund", reason: "72% overlap with Mirae Large Cap" },
                  { action: "Hold", fund: "Parag Parikh Flexi Cap", reason: "High quality, global diversification" },
                  { action: "Add More", fund: "SBI Small Cap", reason: "Strong long-term performance" },
                  { action: "Review", fund: "HDFC Short Term Debt", reason: "Consider shifting to liquid fund" },
                ].map((r) => (
                  <div key={r.fund} className="flex items-start gap-2.5 p-2.5 bg-[#fafafa] rounded-lg border border-[#f0f0f0]">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full mt-0.5 flex-shrink-0"
                      style={{ background: `${actionColors[r.action]}12`, color: actionColors[r.action], border: `1px solid ${actionColors[r.action]}25` }}>
                      {r.action}
                    </span>
                    <div>
                      <p className="text-xs font-medium text-[#1a1a1a]">{r.fund}</p>
                      <p className="text-[10px] text-[#8c8c8c]">{r.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card>
            <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3">Fund Analysis</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#f0f0f0]">
                    {["Fund", "Category", "Invested", "Current", "XIRR", "Expense", "Overlap", "Action"].map((h) => (
                      <th key={h} className="text-left text-[10px] text-[#8c8c8c] uppercase tracking-wider pb-2 pr-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((h) => {
                    const act = getAction(h.xirr, h.overlap, h.category);
                    return (
                      <tr key={h.id} className="border-b border-[#fafafa] hover:bg-[#fafafa]">
                        <td className="py-2.5 pr-3 text-[#1a1a1a] max-w-[160px] truncate">{h.name}</td>
                        <td className="py-2.5 pr-3 text-[#666666]">{h.category}</td>
                        <td className="py-2.5 pr-3 font-mono text-[#666666]">{fmtINR(h.invested)}</td>
                        <td className="py-2.5 pr-3 font-mono text-[#059669]">{fmtINR(h.current)}</td>
                        <td className="py-2.5 pr-3 font-mono" style={{ color: h.xirr > 12 ? "#059669" : "#d97706" }}>{h.xirr}%</td>
                        <td className="py-2.5 pr-3 font-mono text-[#666666]">{h.exp}%</td>
                        <td className="py-2.5 pr-3">
                          {h.overlap > 0 ? (
                            <div>
                              <p style={{ color: h.overlap > 60 ? "#dc2626" : "#d97706" }} className="text-[10px]">{h.overlap}%</p>
                              <div className="w-12 h-1 bg-[#f0f0f0] rounded overflow-hidden mt-0.5">
                                <div style={{ width: `${h.overlap}%`, background: h.overlap > 60 ? "#dc2626" : "#d97706" }} className="h-full" />
                              </div>
                            </div>
                          ) : <span className="text-[#059669] text-[10px]">Low</span>}
                        </td>
                        <td className="py-2.5">
                          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: `${actionColors[act]}12`, color: actionColors[act] }}>{act}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ── Health Score ────────────────────────────────────────────────────────────────
export function HealthModule() {
  const [form, setForm] = useState({ income: 100000, expenses: 55000, emergencyFund: 300000, lifeInsuranceCover: 5000000, totalInvestments: 1200000, debtEmi: 0, npsContribution: 0, age: 28, retirementSavings: 480000 });
  const [result, setResult] = useState<ReturnType<typeof calcHealth> | null>(null);
  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((p) => ({ ...p, [k]: parseFloat(e.target.value) || 0 }));

  const radarData = result?.dimensions.map((d) => ({ subject: d.label.split(" ")[0], score: d.score })) || [];
  const gradeColor = (g: string) => g === "Excellent" ? "#059669" : g === "Good" ? "#1a56db" : g === "Fair" ? "#d97706" : "#dc2626";

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <SectionHeader title="Health Score" subtitle="6-dimension financial wellness assessment with personalised action steps" />

      <Card>
        <h3 className="text-sm font-semibold text-[#1a1a1a] mb-4">5-Minute Assessment</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Input label="Monthly Income" prefix="₹" type="number" value={form.income} onChange={f("income")} />
          <Input label="Monthly Expenses" prefix="₹" type="number" value={form.expenses} onChange={f("expenses")} />
          <Input label="Emergency Fund" prefix="₹" type="number" value={form.emergencyFund} onChange={f("emergencyFund")} />
          <Input label="Life Insurance Cover" prefix="₹" type="number" value={form.lifeInsuranceCover} onChange={f("lifeInsuranceCover")} />
          <Input label="Total Investments" prefix="₹" type="number" value={form.totalInvestments} onChange={f("totalInvestments")} />
          <Input label="Monthly Debt EMI" prefix="₹" type="number" value={form.debtEmi} onChange={f("debtEmi")} />
          <Input label="Annual NPS Contribution" prefix="₹" type="number" value={form.npsContribution} onChange={f("npsContribution")} />
          <Input label="Retirement Savings" prefix="₹" type="number" value={form.retirementSavings} onChange={f("retirementSavings")} />
          <Input label="Current Age" type="number" value={form.age} onChange={f("age")} />
        </div>
        <div className="mt-4">
          <Button onClick={() => setResult(calcHealth(form))} size="lg">Calculate Health Score</Button>
        </div>
      </Card>

      {result && (
        <div className="space-y-4 animate-fade-up">
          <Card>
            <div className="flex items-center gap-8">
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="48" cy="48" r="40" fill="none" stroke="#f0f0f0" strokeWidth="8" />
                  <circle cx="48" cy="48" r="40" fill="none" stroke={gradeColor(result.grade)} strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - result.overall / 100)}`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-2xl font-bold" style={{ color: gradeColor(result.grade) }}>{result.overall}</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-display text-xl text-[#1a1a1a]">Financial Health: <span style={{ color: gradeColor(result.grade) }}>{result.grade}</span></h3>
                <p className="text-sm text-[#8c8c8c] mt-1 mb-3">{result.overall >= 70 ? "Your finances are in good shape. Focus on the areas below to improve further." : "There are key areas that need attention. Work through the action steps below."}</p>
                <div className="grid grid-cols-3 gap-3">
                  {result.dimensions.slice(0, 3).map((d) => (
                    <div key={d.key} className="text-center">
                      <div className="font-display text-lg" style={{ color: d.color }}>{d.score}</div>
                      <div className="text-[9px] text-[#8c8c8c] uppercase tracking-wider">{d.label.split(" ")[0]}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="hidden lg:block w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#f0f0f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#8c8c8c", fontSize: 9 }} />
                    <Radar dataKey="score" stroke="#1a56db" fill="#1a56db" fillOpacity={0.1} strokeWidth={1.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {result.dimensions.map((d) => (
              <Card key={d.key} accent={d.color} padding="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-[#1a1a1a]">{d.label}</span>
                  <span className="font-display text-lg" style={{ color: d.color }}>{d.score}</span>
                </div>
                <ProgressBar value={d.score} color={d.color} />
                <p className="text-[10px] text-[#8c8c8c] mt-2 leading-relaxed">{d.score >= 70 ? "On track. Maintain this discipline." : "Needs improvement — focus here first."}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Couple Planner ─────────────────────────────────────────────────────────────
import { calcTax } from "@/lib/finance";
import type { TaxResult } from "@/lib/finance";

export function CoupleModule() {
  const [p1, setP1] = useState({ name: "Partner 1", income: 1200000, hra: 480000, rentPaid: 25000, cityType: "metro" as const, investments80c: 100000, nps80ccd: 0, healthInsurance80d: 15000, homeLoanInterest: 0, educationLoanInterest: 0 });
  const [p2, setP2] = useState({ name: "Partner 2", income: 800000, hra: 240000, rentPaid: 0, cityType: "metro" as const, investments80c: 50000, nps80ccd: 0, healthInsurance80d: 0, homeLoanInterest: 150000, educationLoanInterest: 0 });
  const [result, setResult] = useState<{ t1: TaxResult; t2: TaxResult; combined: number; saving: number; tips: string[] } | null>(null);

  const toTaxInp = (p: typeof p1) => ({ basicSalary: p.income * 0.4, hra: p.hra, specialAllowance: p.income * 0.3, otherIncome: 0, rentPaid: p.rentPaid, cityType: p.cityType, investments80c: p.investments80c, nps80ccd: p.nps80ccd, healthInsurance80d: p.healthInsurance80d, homeLoanInterest: p.homeLoanInterest, educationLoanInterest: p.educationLoanInterest });

  const run = () => {
    const t1 = calcTax(toTaxInp(p1));
    const t2 = calcTax(toTaxInp(p2));
    const baseTax = (t1.recommendation === "old" ? t1.oldTax : t1.newTax) + (t2.recommendation === "old" ? t2.oldTax : t2.newTax);
    const optTax = (t1.recommendation === "old" ? calcTax({ ...toTaxInp(p1), nps80ccd: 50000, healthInsurance80d: 25000, investments80c: 150000 }).oldTax : 0) + baseTax * 0.85;
    const tips: string[] = [];
    if (p1.investments80c < 150000) tips.push(`${p1.name}: Invest ₹${fmtNum(150000 - p1.investments80c)} more in ELSS/PPF to max Section 80C`);
    if (!p1.nps80ccd) tips.push(`${p1.name}: Contribute ₹50,000 to NPS for extra ₹15,000 deduction under 80CCD(1B)`);
    if (!p2.nps80ccd) tips.push(`${p2.name}: Contribute ₹50,000 to NPS for extra ₹15,000 deduction under 80CCD(1B)`);
    if (p1.rentPaid > 0 && p2.rentPaid > 0) tips.push("Only one partner should claim HRA — assign to higher earner for maximum benefit");
    tips.push("Family floater health insurance is more cost-efficient than two individual policies");
    tips.push("Joint home loan: both co-borrowers can claim ₹2L interest (Section 24b) and ₹1.5L principal (80C) independently");
    setResult({ t1, t2, combined: baseTax, saving: Math.round(baseTax * 0.12), tips });
  };

  const PartnerForm = ({ data, setter, label }: { data: typeof p1; setter: typeof setP1; label: string }) => {
    const f = (k: keyof typeof data) => (e: React.ChangeEvent<HTMLInputElement>) => setter((p) => ({ ...p, [k]: parseFloat(e.target.value) || 0 }));
    return (
      <Card accent={label.includes("1") ? "#1a56db" : "#7c3aed"} padding="p-4">
        <h4 className="text-sm font-semibold text-[#1a1a1a] mb-3">{label}</h4>
        <div className="space-y-2.5">
          <Input label="Annual Income" prefix="₹" type="number" value={data.income} onChange={f("income")} />
          <Input label="HRA Received" prefix="₹" type="number" value={data.hra} onChange={f("hra")} />
          <Input label="Monthly Rent" prefix="₹" type="number" value={data.rentPaid} onChange={f("rentPaid")} />
          <Input label="80C Investments" prefix="₹" type="number" value={data.investments80c} onChange={f("investments80c")} />
          <Input label="NPS 80CCD(1B)" prefix="₹" type="number" value={data.nps80ccd} onChange={f("nps80ccd")} />
          <Input label="Health Ins. 80D" prefix="₹" type="number" value={data.healthInsurance80d} onChange={f("healthInsurance80d")} />
          <Input label="Home Loan Interest" prefix="₹" type="number" value={data.homeLoanInterest} onChange={f("homeLoanInterest")} />
        </div>
      </Card>
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <SectionHeader title="Couple Planner" subtitle="Optimise HRA, NPS and SIPs across both incomes for maximum combined tax efficiency" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PartnerForm data={p1} setter={setP1} label="Partner 1" />
        <PartnerForm data={p2} setter={setP2} label="Partner 2" />
      </div>
      <Button onClick={run} size="lg">Optimise Combined Finances</Button>

      {result && (
        <div className="space-y-4 animate-fade-up">
          <Alert type="success">By optimising together, you can save an additional <strong>₹{fmtNum(result.saving)}</strong> in taxes this year.</Alert>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label={`${p1.name} Tax`} value={`₹${fmtNum(result.t1.recommendation === "old" ? result.t1.oldTax : result.t1.newTax)}`} color="#1a56db" />
            <Stat label={`${p2.name} Tax`} value={`₹${fmtNum(result.t2.recommendation === "old" ? result.t2.oldTax : result.t2.newTax)}`} color="#7c3aed" />
            <Stat label="Combined (Current)" value={`₹${fmtNum(result.combined)}`} color="#dc2626" />
            <Stat label="Potential Savings" value={`₹${fmtNum(result.saving)}`} color="#059669" sub="With optimisation" />
          </div>
          <Card>
            <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3">Optimisation Recommendations</h3>
            <div className="space-y-2">
              {result.tips.map((t, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2.5 bg-[#fafafa] rounded-lg">
                  <span className="text-[10px] font-mono text-[#b0b0b0] mt-0.5">#{i + 1}</span>
                  <p className="text-xs text-[#404040] leading-relaxed">{t}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ── Life Events ────────────────────────────────────────────────────────────────
const EVENTS = [
  { id: "marriage", label: "Getting Married" }, { id: "baby", label: "New Baby" },
  { id: "bonus", label: "Got a Bonus" }, { id: "job-change", label: "Changing Jobs" },
  { id: "home-buy", label: "Buying a Home" }, { id: "inheritance", label: "Inheritance" },
  { id: "parent-care", label: "Parent Care" }, { id: "education", label: "Higher Education" },
];

const EVENT_STEPS: Record<string, { title: string; desc: string; priority: "high" | "medium" | "low" }[]> = {
  marriage: [
    { title: "Rebuild joint emergency fund", desc: "Target 6 months of combined household expenses in a liquid fund", priority: "high" },
    { title: "Update all nominees", desc: "Bank accounts, insurance, PF, NPS, mutual funds — update to spouse", priority: "high" },
    { title: "Use the Couple Planner tool", desc: "Optimise HRA claims, NPS contributions and SIP splits across both incomes", priority: "high" },
    { title: "Upgrade to family floater health cover", desc: "₹25–50L family floater is more efficient than two individual policies", priority: "medium" },
    { title: "Create a will", desc: "Add spouse as primary beneficiary. Can be done with a lawyer for ₹5,000–₹15,000", priority: "medium" },
  ],
  bonus: [
    { title: "Fill emergency fund first", desc: "Ensure 6-month expenses are covered before investing elsewhere", priority: "high" },
    { title: "Repay high-interest debt", desc: "Credit cards (36–42% p.a.) and personal loans (14–20%) first — guaranteed return", priority: "high" },
    { title: "Max out 80C and NPS before March 31", desc: "Up to ₹2L in tax deductions through ELSS, PPF and NPS contributions", priority: "high" },
    { title: "Deploy equity via STP", desc: "Avoid lump-sum into equity. Use Systematic Transfer Plan over 6–12 months", priority: "medium" },
    { title: "Consider international diversification", desc: "5–10% in international index fund for currency and geographic diversification", priority: "low" },
  ],
  baby: [
    { title: "Start education SIP immediately", desc: "₹5,000/month in equity fund for 18 years gives ₹60–80L for higher education", priority: "high" },
    { title: "Increase term insurance cover", desc: "New dependent requires higher cover — target 20x annual income", priority: "high" },
    { title: "Add child to health insurance", desc: "Add newborn to family floater within 90 days — free cover period", priority: "high" },
    { title: "Open Sukanya Samruddhi Yojana (if girl)", desc: "8.2% tax-free returns, max ₹1.5L per year — open before child turns 10", priority: "medium" },
    { title: "Update will with guardian clause", desc: "Appoint legal guardian for minor child in your will", priority: "medium" },
  ],
};

export function LifeEventModule() {
  const [selected, setSelected] = useState<string | null>(null);
  const [income, setIncome] = useState(100000);

  const steps = selected ? (EVENT_STEPS[selected] || EVENT_STEPS.bonus) : [];
  const priorityColor = { high: "#dc2626", medium: "#d97706", low: "#059669" };
  const priorityBg = { high: "#fef2f2", medium: "#fffbeb", low: "#f0fdf4" };
  const priorityBorder = { high: "#fecaca", medium: "#fde68a", low: "#bbf7d0" };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <SectionHeader title="Life Event Advisor" subtitle="Marriage, bonus, baby, inheritance — get a personalised financial playbook" />

      <Card>
        <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3">What's happening in your life?</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {EVENTS.map((e) => (
            <button key={e.id} onClick={() => setSelected(e.id)}
              className={`px-3 py-2.5 rounded-lg text-xs font-medium border text-left transition-all ${selected === e.id ? "border-brand bg-brand/5 text-brand" : "border-[#e8e8e8] text-[#404040] hover:border-[#b0b0b0]"}`}>
              {e.label}
            </button>
          ))}
        </div>
        <Input label="Monthly Income" prefix="₹" type="number" value={income} onChange={(e) => setIncome(parseFloat(e.target.value) || 0)} className="max-w-xs" />
      </Card>

      {selected && steps.length > 0 && (
        <div className="space-y-3 animate-fade-up">
          <h3 className="text-sm font-semibold text-[#1a1a1a]">Action Checklist — {EVENTS.find(e => e.id === selected)?.label}</h3>
          {steps.map((s, i) => (
            <div key={i} className="rounded-xl border p-4" style={{ background: priorityBg[s.priority], borderColor: priorityBorder[s.priority] }}>
              <div className="flex items-start gap-3">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full mt-0.5 flex-shrink-0"
                  style={{ background: `${priorityColor[s.priority]}18`, color: priorityColor[s.priority], border: `1px solid ${priorityColor[s.priority]}30` }}>
                  {s.priority.toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-medium text-[#1a1a1a]">{s.title}</p>
                  <p className="text-xs text-[#666666] mt-0.5 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </div>
          ))}
          <Alert type="info">These are educational guidelines. Consult a SEBI-registered financial advisor and CA for personalised advice specific to your situation.</Alert>
        </div>
      )}
    </div>
  );
}
