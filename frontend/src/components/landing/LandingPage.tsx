// frontend/src/components/landing/LandingPage.tsx
// Full marketing homepage — shown before login
// Replace your AuthPage or add as a route (see integration steps)

import { useState } from "react";

// ── Colourful abstract blob SVGs ────────────────────────────────────────────
const Blob1 = () => (
  <svg viewBox="0 0 200 200" width="420" height="420" style={{ position: "absolute", top: -80, right: -60, opacity: 0.18, pointerEvents: "none" }}>
    <path fill="#1a56db" d="M44.7,-57.1C56.8,-46.2,63.6,-30.1,67.2,-12.9C70.8,4.3,71.2,22.6,63.1,36.3C55,50,38.3,59.2,21,64.5C3.7,69.8,-14.3,71.2,-30.3,65C-46.3,58.8,-60.3,45,-67.2,28.2C-74.1,11.4,-73.9,-8.4,-66.6,-24.8C-59.3,-41.2,-44.9,-54.2,-29.6,-63.9C-14.3,-73.6,1.9,-80,17.2,-76.7C32.5,-73.4,32.6,-68,44.7,-57.1Z" transform="translate(100 100)"/>
  </svg>
);
const Blob2 = () => (
  <svg viewBox="0 0 200 200" width="320" height="320" style={{ position: "absolute", bottom: -60, left: -40, opacity: 0.13, pointerEvents: "none" }}>
    <path fill="#059669" d="M39.9,-51.6C50.7,-41.8,57.8,-28.2,61.8,-13C65.8,2.2,66.7,19,59.8,31.8C52.9,44.6,38.2,53.4,22.6,59.1C7,64.8,-9.5,67.4,-24.8,62.8C-40.1,58.2,-54.2,46.4,-61.3,31.3C-68.4,16.2,-68.5,-2.2,-62.5,-18.1C-56.5,-34,-44.4,-47.4,-30.7,-56.4C-17,-65.4,-1.7,-70,13,-68.7C27.7,-67.4,29.1,-61.4,39.9,-51.6Z" transform="translate(100 100)"/>
  </svg>
);
const Blob3 = () => (
  <svg viewBox="0 0 200 200" width="260" height="260" style={{ position: "absolute", top: "40%", left: -30, opacity: 0.10, pointerEvents: "none" }}>
    <path fill="#d97706" d="M45.3,-58.7C57.5,-48.3,65.5,-33.1,68.8,-16.9C72.1,-0.7,70.7,16.5,63.1,30.3C55.5,44.1,41.7,54.5,26.4,60.7C11.1,66.9,-5.7,68.9,-21.3,64.5C-36.9,60.1,-51.3,49.3,-59.4,35C-67.5,20.7,-69.3,2.9,-65,-13.2C-60.7,-29.3,-50.3,-43.7,-37.3,-53.9C-24.3,-64.1,-8.8,-70.1,6.5,-68.1C21.8,-66.1,33.1,-69.1,45.3,-58.7Z" transform="translate(100 100)"/>
  </svg>
);
const Blob4 = () => (
  <svg viewBox="0 0 200 200" width="200" height="200" style={{ position: "absolute", bottom: 100, right: 60, opacity: 0.12, pointerEvents: "none" }}>
    <path fill="#7c3aed" d="M41.5,-53.1C52.6,-43.3,59.3,-28.9,62.1,-13.5C64.9,1.9,63.8,18.3,56.2,31.1C48.6,43.9,34.5,53.1,19.3,59.1C4.1,65.1,-12.2,67.9,-26.8,63.2C-41.4,58.5,-54.3,46.3,-60.8,31.4C-67.3,16.5,-67.4,-1.1,-61.8,-16.7C-56.2,-32.3,-44.9,-45.9,-31.7,-54.9C-18.5,-63.9,-3.4,-68.3,10.6,-67.4C24.6,-66.5,30.4,-62.9,41.5,-53.1Z" transform="translate(100 100)"/>
  </svg>
);

// ── Feature card data ────────────────────────────────────────────────────────
const FEATURES = [
  {
    accent: "#1a56db",
    bg: "#eff6ff",
    label: "Tax Wizard",
    desc: "Old vs New regime comparison. Find every deduction you're missing. Save up to ₹38,500 per year.",
    stat: "₹38K",
    statLabel: "avg tax saved",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a56db" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3"/>
        <path d="M9 9h6M9 13h4M9 17h2"/>
      </svg>
    ),
  },
  {
    accent: "#059669",
    bg: "#ecfdf5",
    label: "FIRE Planner",
    desc: "Build a month-by-month roadmap to retire early. SIP amounts, asset allocation and corpus targets.",
    stat: "4%",
    statLabel: "withdrawal rule",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
        <polyline points="16 7 22 7 22 13"/>
      </svg>
    ),
  },
  {
    accent: "#7c3aed",
    bg: "#f5f3ff",
    label: "Portfolio X-Ray",
    desc: "Upload your CAMS statement. Get true XIRR, overlap analysis, expense drag and AI rebalancing.",
    stat: "10s",
    statLabel: "full analysis",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        <line x1="11" y1="8" x2="11" y2="14"/>
        <line x1="8" y1="11" x2="14" y2="11"/>
      </svg>
    ),
  },
  {
    accent: "#d97706",
    bg: "#fffbeb",
    label: "Health Score",
    desc: "6-dimension financial wellness — emergency fund, insurance, investments, debt, tax, retirement.",
    stat: "6",
    statLabel: "dimensions",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
  },
  {
    accent: "#0891b2",
    bg: "#ecfeff",
    label: "Couple Planner",
    desc: "Optimise HRA claims, NPS splits and SIPs across both incomes. Save more tax together.",
    stat: "2x",
    statLabel: "deductions",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    accent: "#dc2626",
    bg: "#fef2f2",
    label: "Life Events",
    desc: "Marriage, bonus, baby, inheritance — personalised financial playbook for every milestone.",
    stat: "8",
    statLabel: "life events",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
];

// ── Pricing plans ────────────────────────────────────────────────────────────
const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    accent: "#059669",
    popular: false,
    features: [
      "All 6 financial tools",
      "AI chatbot (Gemini) — 20 msgs/day",
      "Tax Wizard — unlimited",
      "FIRE Planner — unlimited",
      "Portfolio X-Ray — 1 upload/month",
      "Health Score",
      "Firebase secure login",
    ],
    cta: "Get started free",
  },
  {
    name: "Pro",
    price: "₹299",
    period: "/month",
    accent: "#1a56db",
    popular: true,
    features: [
      "Everything in Free",
      "AI chatbot — unlimited messages",
      "Portfolio X-Ray — unlimited uploads",
      "Couple Planner — joint optimisation",
      "Life Events — all 8 playbooks",
      "Priority AI responses",
      "Export reports as PDF",
    ],
    cta: "Start free trial",
  },
  {
    name: "Family",
    price: "₹499",
    period: "/month",
    accent: "#7c3aed",
    popular: false,
    features: [
      "Everything in Pro",
      "Up to 4 family members",
      "Shared health score dashboard",
      "Joint portfolio tracking",
      "Family tax optimisation",
      "Dedicated onboarding call",
      "SEBI-advisor referral network",
    ],
    cta: "Contact us",
  },
];

// ── Stats ────────────────────────────────────────────────────────────────────
const STATS = [
  { value: "95%", label: "Indians without a financial plan" },
  { value: "₹38K", label: "Average tax savings found" },
  { value: "Free", label: "No credit card required" },
  { value: "6", label: "Tools in one platform" },
];

// ── Testimonials ────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: "Priya S.", role: "Software engineer, Bengaluru", text: "Found ₹42,000 in missed deductions in under 5 minutes. The Tax Wizard is genuinely better than my CA at finding gaps.", accent: "#1a56db" },
  { name: "Rahul M.", role: "Product manager, Mumbai", text: "The FIRE planner finally made retirement feel concrete. I have a month-by-month SIP plan. That's all I needed.", accent: "#059669" },
  { name: "Ananya & Dev", role: "Couple, Hyderabad", text: "We saved ₹31,000 extra by reassigning HRA and splitting NPS. The Couple Planner paid for itself in 10 minutes.", accent: "#7c3aed" },
];

// ── FAQ ─────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: "Is Money Mentor SEBI registered?", a: "No. Money Mentor provides educational financial guidance only, not regulated investment advisory under SEBI (Investment Advisers) Regulations 2013. All calculations are indicative. Consult a SEBI-registered advisor for personalised investment decisions." },
  { q: "How accurate are the tax calculations?", a: "Our Tax Wizard uses FY 2024-25 income tax slabs, all major deductions (80C, 80D, HRA, NPS, 24b, 80E, 80G), and the 4% cess. It is indicative — for filing, consult a CA with your actual documents." },
  { q: "Is my financial data safe?", a: "All authentication is handled by Firebase (Google). We do not store your salary, investment or bank details on our servers. Calculations happen locally in your browser." },
  { q: "Can I cancel anytime?", a: "Yes. Pro and Family plans are monthly. Cancel anytime from your account — no lock-in, no cancellation fee." },
  { q: "Does the AI chatbot give real financial advice?", a: "Artha (powered by Gemini) gives educational guidance based on Indian tax law, SEBI regulations and standard financial planning principles. It is not a substitute for a regulated financial advisor." },
];

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════
export default function LandingPage({ onGetStarted }: { onGetStarted?: () => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const go = () => onGetStarted?.();

  return (
    <div style={{ fontFamily: "'Geist', -apple-system, sans-serif", background: "#fff", color: "#111827", WebkitFontSmoothing: "antialiased" }}>

      {/* ── NAV ── */}
      <nav style={{ display: "flex", alignItems: "center", padding: "0 40px", height: 56, borderBottom: "1px solid #e5e7eb", background: "#fff", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
          <div style={{ width: 28, height: 28, background: "#1a56db", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" fill="white" fillOpacity="0.85"/>
              <path d="M7 4L10 5.5V8.5L7 10L4 8.5V5.5L7 4Z" fill="white"/>
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Money Mentor</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {["Features", "Pricing", "FAQ"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ fontSize: 13, color: "#6b7280", textDecoration: "none", padding: "6px 12px", borderRadius: 8, transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>{l}</a>
          ))}
          <button onClick={go} style={{ marginLeft: 8, background: "#1a56db", color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
            Get started
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: "relative", overflow: "hidden", padding: "96px 40px 80px", maxWidth: 1100, margin: "0 auto" }}>
        <Blob1 /><Blob2 />

        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 20, padding: "4px 14px", marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#1a56db", display: "inline-block" }}/>
            <span style={{ fontSize: 12, fontWeight: 500, color: "#1e40af" }}>ET × Avataar.ai AI Hackathon 2026</span>
          </div>

          <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(36px, 6vw, 64px)", lineHeight: 1.1, color: "#111827", marginBottom: 20, maxWidth: 700, margin: "0 auto 20px" }}>
            Financial clarity,<br />
            <span style={{ color: "#1a56db" }}>finally.</span>
          </h1>

          <p style={{ fontSize: "clamp(15px, 2vw, 18px)", color: "#6b7280", maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.7 }}>
            AI-powered financial planning for every Indian. Tax optimisation, FIRE roadmaps, portfolio analysis — expert advice that used to cost ₹25,000 a year, now free.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={go} style={{ background: "#1a56db", color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 14, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(26,86,219,0.25)" }}>
              Start for free
            </button>
            <a href="#features" style={{ background: "#fff", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 10, padding: "12px 28px", fontSize: 14, fontWeight: 500, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
              See features
            </a>
          </div>
        </div>

        {/* Hero dashboard preview */}
        <div style={{ position: "relative", marginTop: 56, maxWidth: 800, margin: "56px auto 0", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.08)" }}>
          {/* Fake browser bar */}
          <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", gap: 5 }}>
              {["#ff5f57","#febc2e","#28c840"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }}/>)}
            </div>
            <div style={{ flex: 1, background: "#f3f4f6", borderRadius: 6, height: 22, display: "flex", alignItems: "center", paddingLeft: 10 }}>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>money-mentor.vercel.app</span>
            </div>
          </div>
          {/* Fake dashboard */}
          <div style={{ padding: "20px 24px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
              {[["₹12L", "Invested", "#1a56db"], ["₹72", "Health Score", "#059669"], ["₹38K", "Tax Saved", "#d97706"], ["50", "Retire Age", "#7c3aed"]].map(([v, l, c]) => (
                <div key={l} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: c as string }}>{v}</div>
                  <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[["Tax Wizard", "#eff6ff", "#1a56db"], ["FIRE Planner", "#ecfdf5", "#059669"], ["Portfolio X-Ray", "#f5f3ff", "#7c3aed"], ["Health Score", "#fffbeb", "#d97706"], ["Couple Planner", "#ecfeff", "#0891b2"], ["Life Events", "#fef2f2", "#dc2626"]].map(([label, bg, accent]) => (
                <div key={label} style={{ background: bg as string, borderRadius: 10, padding: "12px 14px", border: `1px solid ${bg}` }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: accent as string, marginBottom: 8 }}/>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#111827" }}>{label}</div>
                  <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>Open</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section style={{ borderTop: "1px solid #f3f4f6", borderBottom: "1px solid #f3f4f6", background: "#fafafa" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 40px", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 30, color: "#111827" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "80px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Features</div>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 36, color: "#111827", marginBottom: 12 }}>Everything you need to plan your finances</h2>
          <p style={{ fontSize: 15, color: "#6b7280", maxWidth: 480, margin: "0 auto" }}>Six AI-powered tools that work together — no spreadsheets, no jargon.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {FEATURES.map(f => (
            <div key={f.label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "22px 24px", borderTop: `3px solid ${f.accent}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, background: f.bg, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {f.icon}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: f.accent }}>{f.stat}</div>
                  <div style={{ fontSize: 10, color: "#9ca3af" }}>{f.statLabel}</div>
                </div>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#111827", marginBottom: 6 }}>{f.label}</h3>
              <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: "#fafafa", borderTop: "1px solid #f3f4f6", padding: "80px 40px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>How it works</div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 34, color: "#111827" }}>Three steps to financial clarity</h2>
          </div>

          <div style={{ position: "relative" }}>
            {[
              { n: "01", accent: "#1a56db", title: "Sign in with Google", desc: "One click with Firebase Authentication. No forms, no credit card. Your data is secured by Google-grade infrastructure." },
              { n: "02", accent: "#059669", title: "Enter your numbers", desc: "Salary, investments, expenses. Takes 3 minutes. All calculations run locally — we never store your financial data on our servers." },
              { n: "03", accent: "#d97706", title: "Get your action plan", desc: "Tax savings, SIP targets, portfolio gaps, health score. Ask Artha (our Gemini-powered AI) anything about your finances in plain English." },
            ].map((step, i) => (
              <div key={step.n} style={{ display: "flex", gap: 24, marginBottom: i < 2 ? 32 : 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: step.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 600, flexShrink: 0 }}>{step.n}</div>
                  {i < 2 && <div style={{ width: 1, flex: 1, background: "#e5e7eb", marginTop: 8, marginBottom: -8 }}/>}
                </div>
                <div style={{ paddingBottom: 8 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 6 }}>{step.title}</h3>
                  <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.65 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: "80px 40px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>Pricing</div>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 34, color: "#111827", marginBottom: 10 }}>Simple, transparent pricing</h2>
          <p style={{ fontSize: 14, color: "#9ca3af" }}>All core tools free forever. Upgrade for unlimited AI and premium features.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {PLANS.map(plan => (
            <div key={plan.name} style={{
              background: "#fff",
              border: plan.popular ? `2px solid ${plan.accent}` : "1px solid #e5e7eb",
              borderRadius: 16,
              padding: "28px 24px",
              position: "relative",
            }}>
              {plan.popular && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: plan.accent, color: "#fff", fontSize: 11, fontWeight: 600, padding: "3px 14px", borderRadius: 20 }}>
                  Most popular
                </div>
              )}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: plan.accent, marginBottom: 6 }}>{plan.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 36, color: "#111827" }}>{plan.price}</span>
                  <span style={{ fontSize: 13, color: "#9ca3af" }}>{plan.period}</span>
                </div>
              </div>

              <button onClick={go} style={{
                width: "100%",
                background: plan.popular ? plan.accent : "#fff",
                color: plan.popular ? "#fff" : "#374151",
                border: plan.popular ? "none" : "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "9px 0",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                marginBottom: 20,
              }}>{plan.cta}</button>

              <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 16 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10, fontSize: 13, color: "#374151" }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                      <circle cx="8" cy="8" r="7" fill={plan.accent} fillOpacity="0.12"/>
                      <path d="M5 8l2 2 4-4" stroke={plan.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", marginTop: 24 }}>
          All prices in INR. Pro and Family plans billed monthly, cancel anytime. No hidden fees.
        </p>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ background: "#fafafa", borderTop: "1px solid #f3f4f6", padding: "80px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>What users say</div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, color: "#111827" }}>Real results from real people</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "22px 22px", borderLeft: `3px solid ${t.accent}`, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
                <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, marginBottom: 16 }}>"{t.text}"</p>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECH STACK ── */}
      <section style={{ padding: "64px 40px", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 16 }}>Built with</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
          {[["React 18", "#eff6ff", "#1e40af"], ["FastAPI", "#ecfdf5", "#065f46"], ["Firebase Auth", "#fff7ed", "#92400e"], ["Gemini AI", "#f5f3ff", "#4c1d95"], ["LangGraph", "#eff6ff", "#1e40af"], ["Vercel", "#f9fafb", "#374151"], ["Recharts", "#fef2f2", "#7f1d1d"], ["Tailwind CSS", "#ecfeff", "#0c4a6e"]].map(([label, bg, color]) => (
            <span key={label} style={{ background: bg as string, color: color as string, border: `1px solid ${color}30`, borderRadius: 20, padding: "5px 14px", fontSize: 12, fontWeight: 500 }}>{label}</span>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ background: "#fafafa", borderTop: "1px solid #f3f4f6", padding: "80px 40px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>FAQ</div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, color: "#111827" }}>Common questions</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", textAlign: "left", padding: "16px 18px", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>{faq.q}</span>
                  <span style={{ color: "#9ca3af", fontSize: 18, flexShrink: 0, transform: openFaq === i ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: "0 18px 16px", borderTop: "1px solid #f3f4f6" }}>
                    <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7, marginTop: 12 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ padding: "80px 40px", position: "relative", overflow: "hidden" }}>
        <Blob3 /><Blob4 />
        <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 38, color: "#111827", marginBottom: 14, lineHeight: 1.2 }}>
            Start your financial journey today
          </h2>
          <p style={{ fontSize: 15, color: "#6b7280", marginBottom: 32, lineHeight: 1.7 }}>
            Free forever. No credit card. Takes 2 minutes to sign up and see your personalised financial health score.
          </p>
          <button onClick={go} style={{ background: "#1a56db", color: "#fff", border: "none", borderRadius: 10, padding: "13px 32px", fontSize: 15, fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 20px rgba(26,86,219,0.3)" }}>
            Get started free
          </button>
          <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 14 }}>No credit card required. Upgrade anytime.</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid #e5e7eb", background: "#fafafa", padding: "32px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 22, height: 22, background: "#1a56db", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" fill="white" fillOpacity="0.85"/>
              </svg>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>Money Mentor</span>
          </div>
          <p style={{ fontSize: 11, color: "#9ca3af", maxWidth: 420, textAlign: "center" }}>
            Educational financial guidance only. Not SEBI-registered investment advisory. Tax calculations are indicative — consult a CA for filing.
          </p>
          <p style={{ fontSize: 11, color: "#9ca3af" }}>ET × Avataar.ai AI Hackathon 2026</p>
        </div>
      </footer>

    </div>
  );
}