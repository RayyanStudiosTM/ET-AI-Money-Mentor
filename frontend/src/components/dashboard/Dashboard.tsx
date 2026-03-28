import { TrendingUp, Shield, FileText, Activity, Users, Target, ArrowRight, AlertTriangle } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { Card, Alert, Button, Badge, Stat } from "@/components/ui";
import { fmtINR } from "@/lib/finance";

const TOOLS = [
  {
    id: "fire",
    title: "FIRE Planner",
    desc: "Build a month-by-month roadmap to financial independence and early retirement.",
    icon: TrendingUp,
    accent: "#1a56db",
  },
  {
    id: "tax",
    title: "Tax Wizard",
    desc: "Compare Old vs New regime and discover every deduction you're missing.",
    icon: FileText,
    accent: "#059669",
    badge: "Act by Mar 31",
  },
  {
    id: "portfolio",
    title: "Portfolio X-Ray",
    desc: "Upload your CAMS statement for true XIRR, overlap analysis and rebalancing.",
    icon: Activity,
    accent: "#7c3aed",
  },
  {
    id: "health",
    title: "Health Score",
    desc: "6-dimension financial wellness score with personalised action steps.",
    icon: Shield,
    accent: "#d97706",
  },
  {
    id: "couple",
    title: "Couple Planner",
    desc: "Optimise HRA, NPS and SIPs across both incomes for maximum tax efficiency.",
    icon: Users,
    accent: "#0891b2",
  },
  {
    id: "life",
    title: "Life Events",
    desc: "Marriage, baby, bonus or inheritance — get a personalised financial playbook.",
    icon: Target,
    accent: "#dc2626",
  },
];

const MARKET = [
  { name: "Nifty 50", value: "24,162", change: "+0.8%", up: true },
  { name: "Sensex",   value: "79,490", change: "+0.7%", up: true },
  { name: "Gold",     value: "₹73,240/10g", change: "+0.3%", up: true },
  { name: "Best FD",  value: "8.05%",   change: "p.a.",   up: true },
];

export default function Dashboard() {
  const { setActiveTab, user, profile } = useAppStore();
  const firstName = user?.displayName?.split(" ")[0] || profile.name.split(" ")[0] || "there";

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Hero */}
      <div className="bg-white border border-[#e8e8e8] rounded-xl p-6 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-[#8c8c8c] mb-1">Good {getTimeOfDay()}</p>
            <h1 className="font-display text-2xl text-[#1a1a1a] mb-2">
              Welcome back, {firstName}.
            </h1>
            <p className="text-sm text-[#666666] max-w-lg leading-relaxed">
              Your personalised financial dashboard. Ask Artha any financial question using the chat button below, or explore the tools.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <Button onClick={() => setActiveTab("fire")} size="md">
                Start FIRE Planning
              </Button>
              <Button variant="secondary" onClick={() => setActiveTab("tax")} size="md">
                Check Tax Savings
              </Button>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-center justify-center bg-[#fafafa] border border-[#f0f0f0] rounded-xl p-4 min-w-[120px]">
            <HealthRing score={72} />
            <p className="text-xs text-[#8c8c8c] mt-2 text-center">Financial<br/>Health Score</p>
          </div>
        </div>
      </div>

      {/* Tax alert */}
      <Alert type="warning" title="Tax filing deadline approaching">
        You may be missing up to <strong>₹38,500</strong> in eligible deductions before March 31.{" "}
        <button onClick={() => setActiveTab("tax")} className="underline font-medium">
          Review now
        </button>
      </Alert>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Invested" value={fmtINR(profile.existingInvestments)} color="#1a56db" />
        <Stat label="Emergency Fund" value={fmtINR(profile.emergencyFund)}
          color={profile.emergencyFund >= profile.expenses * 6 ? "#059669" : "#d97706"} />
        <Stat label="Monthly Income" value={fmtINR(profile.income)} color="#1a1a1a" />
        <Stat label="Monthly Surplus" value={fmtINR(Math.max(0, profile.income - profile.expenses))}
          color="#059669" />
      </div>

      {/* Tools grid */}
      <div>
        <h2 className="text-sm font-semibold text-[#1a1a1a] mb-3">Financial Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger">
          {TOOLS.map((t) => {
            const Icon = t.icon;
            return (
              <Card
                key={t.id}
                hover
                onClick={() => setActiveTab(t.id)}
                className="animate-fade-up group"
                padding="p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${t.accent}12` }}>
                    <Icon size={15} style={{ color: t.accent }} />
                  </div>
                  {t.badge && <Badge label={t.badge} color="amber" />}
                </div>
                <h3 className="text-sm font-semibold text-[#1a1a1a] mb-1">{t.title}</h3>
                <p className="text-xs text-[#8c8c8c] leading-relaxed">{t.desc}</p>
                <div className="flex items-center gap-1 mt-3 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: t.accent }}>
                  Open <ArrowRight size={11} />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Market strip */}
      <div>
        <h2 className="text-sm font-semibold text-[#1a1a1a] mb-3">Market Snapshot</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {MARKET.map((m) => (
            <Card key={m.name} padding="p-3">
              <p className="text-xs text-[#8c8c8c] mb-1">{m.name}</p>
              <p className="text-sm font-semibold text-[#1a1a1a]">{m.value}</p>
              <p className={`text-xs font-medium mt-0.5 ${m.up ? "text-[#059669]" : "text-[#dc2626]"}`}>{m.change}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-[#b0b0b0] leading-relaxed border-t border-[#f0f0f0] pt-4">
        <strong className="text-[#8c8c8c]">Disclaimer:</strong> Money Mentor provides educational financial information only. This is not SEBI-registered investment advisory. Consult a qualified advisor for personalised investment decisions. Tax calculations are indicative based on FY 2024-25 rules.
      </p>
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function HealthRing({ score }: { score: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? "#059669" : score >= 55 ? "#d97706" : "#dc2626";
  return (
    <div className="relative w-16 h-16">
      <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="32" cy="32" r={r} fill="none" stroke="#f0f0f0" strokeWidth="5" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-display text-base font-bold" style={{ color }}>{score}</span>
      </div>
    </div>
  );
}
