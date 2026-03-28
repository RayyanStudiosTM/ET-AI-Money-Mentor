import { useState, useRef, useEffect } from "react";
import { X, MessageSquare, Send, RotateCcw, ChevronDown } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { generateResponse, buildFinancialContext, ChatTurn } from "@/lib/openai";
import { clsx } from "clsx";

const QUICK_PROMPTS = [
  "How much SIP do I need to retire at 50?",
  "Old vs New tax regime for ₹12 LPA?",
  "How to build a 6-month emergency fund?",
  "Best mutual funds for 10-year horizon?",
];

function formatMessage(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("**") && line.endsWith("**")) {
      return <p key={i} className="font-medium text-[#1a1a1a] mt-2 mb-0.5">{line.slice(2, -2)}</p>;
    }
    if (line.startsWith("• ") || line.startsWith("- ")) {
      return <li key={i} className="ml-3 text-[#404040]">{line.slice(2)}</li>;
    }
    if (line.startsWith("*") && line.endsWith("*") && !line.startsWith("**")) {
      return <p key={i} className="text-[10px] text-[#b0b0b0] italic mt-1">{line.slice(1, -1)}</p>;
    }
    if (!line.trim()) return <br key={i} />;
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <p key={i} className="text-[#404040] leading-relaxed">
        {parts.map((p, j) => j % 2 === 1 ? <strong key={j} className="text-[#1a1a1a] font-medium">{p}</strong> : p)}
      </p>
    );
  });
}

export default function FloatingChat() {
  const { chatOpen, setChatOpen, chatMessages, addChatMessage, clearChat, chatTyping, setChatTyping, profile } = useAppStore();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatTyping]);

  useEffect(() => {
    if (chatOpen && chatMessages.length === 0) {
      addChatMessage({
        id: crypto.randomUUID(),
        role: "model",
        content: `Hello${profile.name !== "User" ? ` ${profile.name.split(" ")[0]}` : ""}! I'm Artha, your AI financial advisor.\n\nI can help with tax planning, SIP calculations, FIRE planning, mutual fund analysis, and more. What would you like to know?`,
        timestamp: new Date(),
      });
    }
    if (chatOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [chatOpen]);

  const sendMessage = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || chatTyping) return;
    setInput("");

    addChatMessage({ id: crypto.randomUUID(), role: "user", content: msg, timestamp: new Date() });
    setChatTyping(true);

    try {
      const history = chatMessages.slice(-10).map((m) => ({
        role: (m.role === "model" ? "assistant" : "user") as "user" | "assistant",
        content: m.content,
      }));
      const context = buildFinancialContext(profile);
      const fullMsg = context ? `${msg}\n\n[Context: ${context}]` : msg;
      const reply = await generateResponse(fullMsg, history);
      addChatMessage({ id: crypto.randomUUID(), role: "model", content: reply, timestamp: new Date() });
    } catch {
      addChatMessage({
        id: crypto.randomUUID(), role: "model",
        content: "I'm having trouble connecting. Please check your VITE_OPENAI_API_KEY in the .env file.",
        timestamp: new Date(),
      });
    } finally {
      setChatTyping(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {chatOpen && <div className="fixed inset-0 z-40 bg-black/5" onClick={() => setChatOpen(false)} />}

      {/* Chat window */}
      <div className={clsx(
        "fixed bottom-20 right-5 z-50 flex flex-col bg-white border border-[#e8e8e8] rounded-2xl shadow-chat",
        "w-[360px] transition-all duration-300 origin-bottom-right",
        chatOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
      )} style={{ height: "520px" }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#e8e8e8]">
          <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" fill="white" fillOpacity="0.8"/>
              <path d="M7 4L10 5.5V8.5L7 10L4 8.5V5.5L7 4Z" fill="white"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#1a1a1a]">Artha</p>
            <p className="text-[10px] text-[#059669] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#059669] inline-block" />
              Powered by GPT-4o
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => { clearChat(); }}
              className="p-1.5 rounded-lg text-[#b0b0b0] hover:text-[#404040] hover:bg-[#f5f5f5] transition-colors"
              title="Clear chat"
            >
              <RotateCcw size={13} />
            </button>
            <button
              onClick={() => setChatOpen(false)}
              className="p-1.5 rounded-lg text-[#b0b0b0] hover:text-[#404040] hover:bg-[#f5f5f5] transition-colors"
            >
              <ChevronDown size={14} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={clsx("flex gap-2 animate-fade-in", msg.role === "user" ? "flex-row-reverse" : "")}
            >
              {msg.role === "model" && (
                <div className="w-6 h-6 bg-brand/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" fill="#1a56db" fillOpacity="0.7"/>
                    <path d="M7 4L10 5.5V8.5L7 10L4 8.5V5.5L7 4Z" fill="#1a56db"/>
                  </svg>
                </div>
              )}
              <div
                className={clsx(
                  "max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed",
                  msg.role === "model"
                    ? "bg-[#fafafa] border border-[#e8e8e8] rounded-tl-sm"
                    : "bg-brand text-white rounded-tr-sm"
                )}
              >
                {msg.role === "model" ? (
                  <div className="space-y-0.5">{formatMessage(msg.content)}</div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {chatTyping && (
            <div className="flex gap-2">
              <div className="w-6 h-6 bg-brand/10 rounded-full flex items-center justify-center flex-shrink-0">
                <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" fill="#1a56db" fillOpacity="0.7"/>
                </svg>
              </div>
              <div className="bg-[#fafafa] border border-[#e8e8e8] rounded-xl rounded-tl-sm px-3 py-2.5 flex gap-1 items-center">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-1.5 h-1.5 bg-[#b0b0b0] rounded-full" style={{ animation: `bounceTyping 1.2s infinite ${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts (only if no messages or just greeting) */}
        {chatMessages.length <= 1 && (
          <div className="px-3 py-2 border-t border-[#f0f0f0] flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-[10px] bg-[#f5f5f5] hover:bg-[#eff6ff] hover:text-brand border border-[#e8e8e8] hover:border-brand/30 text-[#666666] rounded-full px-2.5 py-1 transition-colors leading-none"
              >
                {q.length > 32 ? q.slice(0, 30) + "…" : q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-3 py-3 border-t border-[#e8e8e8]">
          <div className="flex items-center gap-2 bg-[#fafafa] border border-[#e8e8e8] rounded-xl px-3 py-2 focus-within:border-brand/50 focus-within:ring-1 focus-within:ring-brand/10 transition-all">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Ask about your finances..."
              className="flex-1 bg-transparent text-xs text-[#1a1a1a] placeholder:text-[#b0b0b0] outline-none"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || chatTyping}
              className="w-6 h-6 bg-brand rounded-lg flex items-center justify-center flex-shrink-0 disabled:opacity-30 hover:bg-brand-dark transition-colors"
            >
              <Send size={10} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating trigger button */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className={clsx(
          "fixed bottom-5 right-5 z-50 w-12 h-12 rounded-full shadow-chat",
          "flex items-center justify-center transition-all duration-300",
          chatOpen ? "bg-[#f5f5f5] border border-[#e8e8e8] rotate-0" : "bg-brand hover:bg-brand-dark scale-100 hover:scale-105"
        )}
      >
        {chatOpen
          ? <X size={18} className="text-[#404040]" />
          : <MessageSquare size={18} className="text-white" />
        }
        {!chatOpen && chatMessages.length === 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#059669] rounded-full border-2 border-white" />
        )}
      </button>
    </>
  );
}
