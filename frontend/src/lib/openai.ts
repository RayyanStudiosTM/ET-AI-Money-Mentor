// ── OpenAI API via direct fetch (no SDK needed, works in all browsers) ─────────

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY ?? "";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export const SYSTEM_PROMPT = `You are Artha, an expert AI financial advisor for Indian users on the Money Mentor platform.

EXPERTISE:
- Indian Income Tax: Old vs New regime (FY 2024-25), all deductions (80C, 80D, HRA, NPS, 80E, 24b, 80G)
- Mutual Funds: Direct vs Regular plans, SIP, ELSS, Debt, Hybrid, Index funds, XIRR
- FIRE Planning: Financial Independence, Retire Early — 4% withdrawal rule
- Goal-based investing: home purchase, child education, marriage, retirement
- Insurance: Term life (15x income), health insurance, ULIP vs term+MF analysis
- Market instruments: Equity, Debt, Gold ETF, FD, PPF, NPS, EPF, SGBs, REITs
- Regulations: SEBI, RBI, IRDAI, EPFO, AMFI

RULES:
1. Always use Indian number format: ₹1.5L (not ₹1,50,000), ₹1.2Cr (not ₹1,20,00,000)
2. Be concise — use bullet points for multi-step answers
3. Cite tax sections when relevant (Section 80C, 24b, etc.)
4. Recommend SEBI-registered advisors for personalised regulated advice
5. Never recommend specific stocks; avoid market timing predictions
6. Factor in inflation for all long-term projections
7. End investment-related answers with: "Note: Educational guidance only. Not SEBI-registered advisory."`;

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

// ── Core function — calls OpenAI REST API directly ────────────────────────────
export async function generateResponse(
  message: string,
  history: ChatTurn[] = [],
  financialContext = ""
): Promise<string> {
  // Guard: key must be present
  if (!OPENAI_API_KEY || OPENAI_API_KEY.length < 10) {
    throw new Error(
      "VITE_OPENAI_API_KEY is missing or invalid. Add it to your frontend/.env file and restart the dev server."
    );
  }

  const systemContent = SYSTEM_PROMPT + (financialContext ? `\n\n${financialContext}` : "");

  const messages = [
    { role: "system", content: systemContent },
    ...history,
    { role: "user", content: message },
  ];

  const body = {
    model: "gpt-4o-mini",
    messages,
    temperature: 0.3,
    max_tokens: 1024,
  };

  const res = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    const status = res.status;

    if (status === 400) throw new Error(`OpenAI API error 400: ${errJson?.error?.message ?? "Bad request"}`);
    if (status === 401) throw new Error("OpenAI API key is invalid. Check VITE_OPENAI_API_KEY.");
    if (status === 429) throw new Error("OpenAI rate limit hit. Please wait a moment and try again.");
    throw new Error(`OpenAI API returned status ${status}: ${errJson?.error?.message ?? "Unknown error"}`);
  }

  const data = await res.json();
  const text: string | undefined = data?.choices?.[0]?.message?.content;

  if (!text) {
    const reason = data?.choices?.[0]?.finish_reason;
    if (reason === "content_filter") throw new Error("Response blocked by content filter. Please rephrase your question.");
    throw new Error("Empty response from OpenAI. Please try again.");
  }

  return text;
}

// ── Financial context helper ───────────────────────────────────────────────────
export function buildFinancialContext(profile: {
  age?: number;
  income?: number;
  expenses?: number;
  riskProfile?: string;
}): string {
  if (!profile?.income) return "";
  return [
    `User profile:`,
    `- Age: ${profile.age ?? "unknown"}`,
    `- Monthly income: ₹${((profile.income ?? 0) / 1000).toFixed(0)}K`,
    `- Monthly expenses: ₹${((profile.expenses ?? 0) / 1000).toFixed(0)}K`,
    `- Risk appetite: ${profile.riskProfile ?? "moderate"}`,
  ].join("\n");
}
