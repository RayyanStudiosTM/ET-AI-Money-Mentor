// ── Gemini API via direct fetch (no SDK needed, works in all browsers) ─────────
// Using the REST API directly avoids any CORS or module import issues.

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? "";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

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
  role: "user" | "model";
  parts: { text: string }[];
}

// ── Core function — calls Gemini REST API directly ────────────────────────────
export async function generateResponse(
  message: string,
  history: ChatTurn[] = [],
  financialContext = ""
): Promise<string> {
  // Guard: key must be present
  if (!GEMINI_API_KEY || GEMINI_API_KEY.length < 10) {
    throw new Error(
      "VITE_GEMINI_API_KEY is missing or invalid. Add it to your frontend/.env file and restart the dev server."
    );
  }

  // Build the contents array: system prompt as first user turn (Gemini 1.5 approach)
  const systemTurn: ChatTurn = {
    role: "user",
    parts: [{ text: SYSTEM_PROMPT + (financialContext ? `\n\n${financialContext}` : "") }],
  };
  const systemAck: ChatTurn = {
    role: "model",
    parts: [{ text: "Understood. I am Artha, your AI financial advisor. How can I help you today?" }],
  };

  // Filter out any prior system messages in history to avoid duplication
  const cleanHistory = history.filter((h) => h.parts[0]?.text !== SYSTEM_PROMPT);

  const contents: ChatTurn[] = [systemTurn, systemAck, ...cleanHistory, { role: "user", parts: [{ text: message }] }];

  const body = {
    contents,
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1024,
      topP: 0.9,
    },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT",        threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_HATE_SPEECH",        threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",  threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT",  threshold: "BLOCK_ONLY_HIGH" },
    ],
  };

  const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    const status = res.status;

    // Surface useful error messages
    if (status === 400) throw new Error(`Gemini API error 400: ${errJson?.error?.message ?? "Bad request"}`);
    if (status === 403) throw new Error("Gemini API key is invalid or does not have access to this model. Check VITE_GEMINI_API_KEY.");
    if (status === 429) throw new Error("Gemini rate limit hit. Please wait a moment and try again.");
    throw new Error(`Gemini API returned status ${status}: ${errJson?.error?.message ?? "Unknown error"}`);
  }

  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    // Check if content was blocked
    const reason = data?.candidates?.[0]?.finishReason;
    if (reason === "SAFETY") throw new Error("Response blocked by safety filters. Please rephrase your question.");
    throw new Error("Empty response from Gemini. Please try again.");
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
