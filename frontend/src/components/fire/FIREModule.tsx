import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { calcFIRE, fmtINR, fmtNum, type FIREResult } from "@/lib/finance";
import { useAppStore } from "@/store/appStore";
import { Button, Input, Card, Stat, Alert, SectionHeader } from "@/components/ui";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function FIREModule() {
  const { profile } = useAppStore();
  const [form, setForm] = useState({
    age: profile.age, retireAge: 50,
    income: profile.income, expenses: profile.expenses,
    savings: 500000, investments: profile.existingInvestments,
    returnRate: 12, inflation: 6,
  });
  const [result, setResult] = useState<FIREResult | null>(null);

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: parseFloat(e.target.value) || 0 }));

  const run = () => {
    try { setResult(calcFIRE(form)); } catch (e) { console.error(e); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <SectionHeader title="FIRE Planner" subtitle="Financial Independence, Retire Early — your month-by-month roadmap" />

      <Card>
        <h3 className="text-sm font-semibold text-[#1a1a1a] mb-4">Your Financial Profile</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Input label="Current Age" type="number" value={form.age} onChange={f("age")} />
          <Input label="Retire at Age" type="number" value={form.retireAge} onChange={f("retireAge")} />
          <Input label="Monthly Income" prefix="₹" type="number" value={form.income} onChange={f("income")} />
          <Input label="Monthly Expenses" prefix="₹" type="number" value={form.expenses} onChange={f("expenses")} />
          <Input label="Current Savings" prefix="₹" type="number" value={form.savings} onChange={f("savings")} />
          <Input label="Current Investments" prefix="₹" type="number" value={form.investments} onChange={f("investments")} />
          <Input label="Expected Return (%)" suffix="% p.a." type="number" value={form.returnRate} onChange={f("returnRate")} />
          <Input label="Inflation Rate (%)" suffix="% p.a." type="number" value={form.inflation} onChange={f("inflation")} />
        </div>
        <div className="mt-4">
          <Button onClick={run} size="lg">Calculate FIRE Roadmap</Button>
        </div>
      </Card>

      {result && (
        <div className="space-y-4 animate-fade-up">
          {/* Summary */}
          <Alert type={result.onTrack ? "success" : "warning"}>
            {result.onTrack
              ? `You are on track to FIRE at age ${form.retireAge}. Projected corpus: ${fmtINR(result.projectedCorpus)}.`
              : `You have a ${fmtINR(result.shortfall)} shortfall. Consider increasing your SIP by ${fmtINR(Math.max(0, result.monthlySIP - (form.income - form.expenses)))} per month.`}
          </Alert>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat label="FIRE Corpus Needed" value={fmtINR(result.fireCorpus)} color="#1a56db" />
            <Stat label="Years to FIRE" value={`${result.yearsToFIRE} yrs`} color="#1a1a1a" />
            <Stat label="Monthly SIP Needed" value={fmtINR(result.monthlySIP)} color={result.monthlySIP <= form.income - form.expenses ? "#059669" : "#d97706"} sub={result.monthlySIP <= form.income - form.expenses ? "Within budget" : "Above surplus"} />
            <Stat label="Current Net Worth" value={fmtINR(result.currentNetWorth)} color="#059669" />
          </div>

          {/* Chart */}
          <Card>
            <h3 className="text-sm font-semibold text-[#1a1a1a] mb-4">Corpus Growth Projection</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={result.timeline} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="corpusGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a56db" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1a56db" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="age" tick={{ fill: "#8c8c8c", fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(v) => fmtINR(v)} tick={{ fill: "#8c8c8c", fontSize: 10 }} tickLine={false} axisLine={false} width={72} />
                <Tooltip formatter={(v: number) => [fmtINR(v), "Corpus"]} />
                <ReferenceLine y={result.fireCorpus} stroke="#059669" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="corpus" stroke="#1a56db" strokeWidth={2} fill="url(#corpusGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-[#b0b0b0] mt-1">Green dashed line = FIRE target corpus</p>
          </Card>

          {/* Phase roadmap */}
          <Card>
            <h3 className="text-sm font-semibold text-[#1a1a1a] mb-3">Phase Roadmap</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#f0f0f0]">
                    {["Phase", "Timeline", "Monthly SIP", "Asset Mix", "Target Corpus"].map((h) => (
                      <th key={h} className="text-left text-[10px] text-[#8c8c8c] uppercase tracking-wider pb-2 pr-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.phases.map((p) => (
                    <tr key={p.phase} className="border-b border-[#fafafa] hover:bg-[#fafafa]">
                      <td className="py-2.5 pr-4 font-medium text-[#1a1a1a]">{p.phase}</td>
                      <td className="py-2.5 pr-4 text-[#666666]">{p.timeline}</td>
                      <td className="py-2.5 pr-4 font-mono text-[#1a56db]">{p.sip > 0 ? fmtINR(p.sip) : "—"}</td>
                      <td className="py-2.5 pr-4 text-[#666666]">{p.assetMix}</td>
                      <td className="py-2.5 font-mono text-[#1a1a1a]">{fmtINR(p.target)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Insurance & Emergency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card accent="#dc2626" padding="p-4">
              <h4 className="text-sm font-semibold text-[#1a1a1a] mb-2">Insurance Gap</h4>
              <div className="space-y-1.5 text-xs text-[#666666]">
                <div className="flex justify-between"><span>Recommended term cover (15x income)</span><span className="font-mono text-[#1a1a1a]">{fmtINR(form.income * 12 * 15)}</span></div>
                <div className="flex justify-between"><span>Health cover (minimum)</span><span className="font-mono text-[#1a1a1a]">₹10–25L</span></div>
                <div className="flex justify-between"><span>Critical illness rider</span><span className="text-[#059669] font-medium">Recommended</span></div>
              </div>
            </Card>
            <Card accent="#059669" padding="p-4">
              <h4 className="text-sm font-semibold text-[#1a1a1a] mb-2">Emergency Fund Status</h4>
              <div className="space-y-1.5 text-xs text-[#666666]">
                <div className="flex justify-between"><span>6-month target</span><span className="font-mono text-[#1a1a1a]">{fmtINR(form.expenses * 6)}</span></div>
                <div className="flex justify-between"><span>Current savings</span><span className="font-mono text-[#1a1a1a]">{fmtINR(form.savings)}</span></div>
                <div className="flex justify-between border-t border-[#f0f0f0] pt-1.5">
                  <span className="font-medium">Status</span>
                  <span className={form.savings >= form.expenses * 6 ? "text-[#059669] font-medium flex items-center gap-1" : "text-[#d97706] font-medium flex items-center gap-1"}>
                    {form.savings >= form.expenses * 6 ? <><CheckCircle size={11} /> Adequate</> : <><AlertCircle size={11} /> Needs top-up</>}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
