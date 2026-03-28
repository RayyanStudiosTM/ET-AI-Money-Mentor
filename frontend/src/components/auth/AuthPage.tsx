import { useState } from "react";
import { Button, Input, Alert, Divider } from "@/components/ui";
import {
  signInWithEmail, signInWithGoogle,
  registerWithEmail, resetPassword,
} from "@/lib/firebase";

type Mode = "login" | "register" | "reset";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const clearError = () => setError("");

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      await signInWithGoogle();
    } catch (e: unknown) {
      const err = e as Error;
      if (!err.message?.includes("popup-closed")) setError("Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await signInWithEmail(email, password);
      } else if (mode === "register") {
        if (!name.trim()) { setError("Please enter your name."); setLoading(false); return; }
        if (password.length < 8) { setError("Password must be at least 8 characters."); setLoading(false); return; }
        await registerWithEmail(name.trim(), email, password);
      } else {
        await resetPassword(email);
        setResetSent(true);
      }
    } catch (e: unknown) {
      const err = e as { code?: string };
      const msgs: Record<string, string> = {
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password.",
        "auth/email-already-in-use": "An account with this email already exists.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/weak-password": "Password must be at least 6 characters.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
        "auth/invalid-credential": "Invalid email or password.",
      };
      setError(msgs[err.code || ""] || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-white border-r border-[#e8e8e8] flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-2.5 mb-16">
            <div className="w-7 h-7 bg-brand rounded-lg flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" fill="white" fillOpacity="0.9"/>
                <path d="M7 4L10 5.5V8.5L7 10L4 8.5V5.5L7 4Z" fill="white"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-[#1a1a1a]">Money Mentor</span>
          </div>

          <div className="max-w-sm">
            <h1 className="font-display text-4xl text-[#1a1a1a] leading-tight mb-4">
              Financial clarity,<br />
              <span className="text-brand">finally.</span>
            </h1>
            <p className="text-[#8c8c8c] text-sm leading-relaxed">
              AI-powered financial planning for every Indian. Tax optimisation, FIRE roadmaps, portfolio analysis — all in one place.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {[
              { stat: "95%", desc: "Indians without a financial plan" },
              { stat: "₹38K", desc: "Average tax savings found per user" },
              { stat: "Free", desc: "No subscription, no hidden fees" },
            ].map((s) => (
              <div key={s.stat} className="flex items-center gap-4">
                <div className="w-12 text-lg font-display text-brand">{s.stat}</div>
                <div className="text-sm text-[#666666]">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-[#b0b0b0]">
          Educational tool only — not SEBI-registered investment advisory.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-6 h-6 bg-brand rounded-md flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" fill="white" fillOpacity="0.9"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-[#1a1a1a]">Money Mentor</span>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-[#1a1a1a]">
              {mode === "login" ? "Welcome back" : mode === "register" ? "Create account" : "Reset password"}
            </h2>
            <p className="text-sm text-[#8c8c8c] mt-1">
              {mode === "login" ? "Sign in to your account" : mode === "register" ? "Start your financial journey" : "We'll send you a reset link"}
            </p>
          </div>

          {/* Error */}
          {error && <div className="mb-4"><Alert type="error">{error}</Alert></div>}
          {resetSent && <div className="mb-4"><Alert type="success">Password reset email sent. Check your inbox.</Alert></div>}

          {/* Google sign-in */}
          {mode !== "reset" && (
            <>
              <Button
                variant="secondary"
                className="w-full mb-4"
                loading={googleLoading}
                onClick={handleGoogle}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                }
              >
                Continue with Google
              </Button>

              <div className="relative my-4">
                <Divider />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#fafafa] px-2 text-xs text-[#b0b0b0]">or</span>
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "register" && (
              <Input label="Full name" type="text" placeholder="Your name" value={name} onChange={(e) => { setName(e.target.value); clearError(); }} required autoFocus />
            )}
            <Input label="Email address" type="email" placeholder="you@example.com" value={email} onChange={(e) => { setEmail(e.target.value); clearError(); }} required autoFocus={mode !== "register"} />
            {mode !== "reset" && (
              <Input label="Password" type="password" placeholder={mode === "register" ? "Min. 8 characters" : "Your password"} value={password} onChange={(e) => { setPassword(e.target.value); clearError(); }} required />
            )}

            {mode === "login" && (
              <div className="text-right">
                <button type="button" onClick={() => { setMode("reset"); clearError(); }} className="text-xs text-brand hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            <Button type="submit" className="w-full mt-4" loading={loading} size="lg">
              {mode === "login" ? "Sign in" : mode === "register" ? "Create account" : "Send reset link"}
            </Button>
          </form>

          {/* Toggle mode */}
          <p className="text-center text-sm text-[#8c8c8c] mt-5">
            {mode === "login" ? (
              <>Don't have an account?{" "}<button onClick={() => { setMode("register"); clearError(); }} className="text-brand font-medium hover:underline">Sign up</button></>
            ) : mode === "register" ? (
              <>Already have an account?{" "}<button onClick={() => { setMode("login"); clearError(); }} className="text-brand font-medium hover:underline">Sign in</button></>
            ) : (
              <button onClick={() => { setMode("login"); clearError(); setResetSent(false); }} className="text-brand font-medium hover:underline">Back to sign in</button>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
