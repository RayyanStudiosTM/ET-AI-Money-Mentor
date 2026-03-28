import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { calcTax, fmtINR, fmtNum, type TaxResult } from "@/lib/finance";
import { Button, Input, Select, Card, Alert, SectionHeader, ProgressBar } from "@/components/ui";
import { CheckCircle } from "lucide-react";

type TaxForm = { basicSalary: number; hra: number; specialAllowance: number; otherIncome: number; rentPaid: number; cityType: "metro" | "non-metro"; investments80c: number; nps80ccd: number; healthInsurance80d: number; homeLoanInterest: number; educationLoanInterest: number; };

const DEFAULT: TaxForm = { basicSalary: 600000, hra: 240000, specialAllowance: 360000, otherIncome: 50000, rentPaid: 20000, cityType: "metro", investments80c: 80000, nps80ccd: 0, healthInsurance80d: 15000, homeLoanInterest: 0, educationLoanInterest: 0 };

export default function TaxModule() {
  const [form, setForm] = useState<TaxForm>(DEFAULT);
  const [result, setResult] = useState<TaxResult | null>(null);

  const f = (k: keyof TaxForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: k === "cityType" ? e.target.value : (parseFloat(e.target.value) || 0) }));

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <SectionHeader title="Tax Wizard" subtitle="Old vs New regime comparison · FY 2024-25 · Find every deduction you're missing" />

      <Card>
        <h3 className="text-sm font-semibold text-[#1a1a1a] mb-4">Salary Structure</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <Input label="Basic Salary (Annual)" prefix="₹" type="number" value={form.basicSalary} onChange={f("basicSalary")} />
          <Input label="HRA Received (Annual)" prefix="₹" type="number" value={form.hra} onChange={f("hra")} />
          <Input label="Special Allowance (Annual)" prefix="₹" type="number" value={form.specialAllowance} onChange={f("specialAllowance")} />
          <Input label="Other Income" prefix="₹" type="number" value={form.otherIncome} onChange={f("otherIncome")} />
          <Input label="Monthly Rent Paid" prefix="₹" type="number" value={form.rentPaid} onChange={f("rentPaid")} />
          <Select label="City Type" value={form.cityType} onChange={f("cityType")} options={[{ value: "metro", label: "Metro — 50% HRA" }, { value: "non-metro", label: "Non-Metro — 40% HRA" }]} />
        </div>
        <div className="border-t border-[#f0f0f0] pt-4">
          <h4 className="text-xs font-semibold text-[#404040] uppercase tracking-wider mb-3">Deductions & Investments</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Input label="Section 80C" prefix="₹" type="number" value={form.investments80c} onChange={f("investments80c")} hint="PPF, ELSS, LIC, PF — max ₹1.5L" />
            <Input label="NPS 80CCD(1B)" prefix="₹" type="number" value={form.nps80ccd} onChange={f("nps80ccd")} hint="Additional NPS — max ₹50K" />
            <Input label="Health Insurance 80D" prefix="₹" type="number" value={form.healthInsurance80d} onChange={f("healthInsurance80d")} hint="Premium paid — max ₹25K" />
            <Input label="Home Loan Interest 24(b)" prefix="₹" type="number" value={form.homeLoanInterest} onChange={f("homeLoanInterest")} hint="Max ₹2L after possession" />
            <Input label="Education Loan 80E" prefix="₹" type="number" value={form.educationLoanInterest} onChange={f("educationLoanInterest")} hint="No upper limit" />
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={() => setResult(calcTax(form))} size="lg">Analyse Tax Regimes</Button>
        </div>
      </Card>

      {result && (
        <div className="space-y-4 animate-fade-up">
          <Alert type={result.recommendation === "old" ? "success" : "info"}>
            <strong>{result.recommendation === "old" ? "Old Regime" : "New Regime"} saves you ₹{fmtNum(result.saving)}</strong> this year. Effective tax rate:{" "}
            {result.recommendation === "old" ? result.effectiveOld : result.effectiveNew}% vs{" "}
            {result.recommendation === "old" ? result.effectiveNew : result.effectiveOld}%.
          </Alert>

          {/* Regime cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(["old", "new"] as const).map((regime) => {
              const isRec = result.recommendation === regime;
              const tax = regime === "old" ? result.oldTax : result.newTax;
              const ded = regime === "old" ? result.oldDeductions : result.newDeductions;
              const rate = regime === "old" ? result.effectiveOld : result.effectiveNew;
              return (
                <div key={regime} className={`rounded-xl border-2 p-5 transition-all ${isRec ? "border-[#059669] bg-[#f0fdf4]" : "border-[#e8e8e8] bg-white"}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-[#1a1a1a]">{regime === "old" ? "Old Regime" : "New Regime"}</h4>
                    {isRec && <span className="flex items-center gap-1 text-[10px] font-semibold text-[#059669] bg-[#dcfce7] border border-[#bbf7d0] px-2 py-0.5 rounded-full"><CheckCircle size={10} /> Recommended</span>}
                  </div>
                  <div className="font-display text-2xl text-[#1a1a1a] mb-1">₹{fmtNum(tax)}</div>
                  <div className="text-xs text-[#8c8c8c]">Effective rate: {rate}% · Deductions: ₹{fmtNum(ded)}</div>
                  <div className="mt-3 space-y-1.5 text-xs border-t border-[#e8e8e8] pt-3">
                    <div className="flex justify-between text-[#666666]"><span>Gross income</span><span className="font-mono">₹{fmtNum(result.gross)}</span></div>
                    <div className="flex justify-between text-[#059669]"><span>Deductions</span><span className="font-mono">– ₹{fmtNum(ded)}</span></div>
                    <div className="flex justify-between text-[#1a1a1a] font-medium border-t border-[#e8e8e8] pt-1.5"><span>Tax + 4% cess</span><span className="font-mono">₹{fmtNum(tax)}</span></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bar chart */}
          <Card>
            <h3 className="text-sm font-semibold text-[#1a1a1a] mb-4">Visual Comparison</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={[{ name: "Old Regime", tax: result.oldTax }, { name: "New Regime", tax: result.newTax }]} barSize={56}>
                <XAxis dataKey="name" tick={{ fill: "#8c8c8c", fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(v) => fmtINR(v)} tick={{ fill: "#8c8c8c", fontSize: 10 }} tickLine={false} axisLine={false} width={70} />
                <Tooltip formatter={(v: number) => [`₹${fmtNum(v)}`, "Tax"]} />
                <Bar dataKey="tax" radius={[6, 6, 0, 0]}>
                  <Cell fill={result.recommendation === "old" ? "#059669" : "#dc2626"} />
                  <Cell fill={result.recommendation === "new" ? "#059669" : "#dc2626"} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Deductions breakdown */}
          <Card>
            <h3 className="text-sm font-semibold text-[#1a1a1a] mb-4">Deduction Utilisation</h3>
            <div className="space-y-3">
              {result.deductions.map((d) => (
                <div key={d.section}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#404040]"><span className="font-mono text-[10px] text-[#b0b0b0] mr-1.5">{d.section}</span>{d.name}</span>
                    <span className="font-mono text-[#1a1a1a]">₹{fmtNum(d.claimed)} <span className="text-[#b0b0b0] font-normal">/ ₹{fmtNum(d.max)}</span></span>
                  </div>
                  <ProgressBar value={d.pct} color={d.pct === 100 ? "#059669" : d.pct >= 70 ? "#d97706" : "#dc2626"} />
                </div>
              ))}
            </div>
          </Card>

          {/* Missing deductions */}
          {result.missing.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3">Untapped Deductions</h3>
              <div className="space-y-2">
                {result.missing.map((m) => (
                  <div key={m.section} className="flex items-start gap-3 p-3 bg-[#fafafa] rounded-lg border border-[#f0f0f0]">
                    <div className="text-right min-w-[60px]">
                      <p className="text-[10px] font-mono text-[#8c8c8c]">{m.section}</p>
                      <p className="text-xs font-semibold text-[#059669]">+₹{fmtNum(m.potential)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#1a1a1a]">{m.name}</p>
                      <p className="text-[11px] text-[#8c8c8c] mt-0.5">{m.tip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
