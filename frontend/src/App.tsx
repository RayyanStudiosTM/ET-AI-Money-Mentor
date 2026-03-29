// frontend/src/App.tsx
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { useAppStore } from "@/store/appStore";
import { onAuthChange } from "@/lib/firebase";
import LandingPage from "@/components/landing/LandingPage";
import AuthPage from "@/components/auth/AuthPage";
import TopNav from "@/components/TopNav";
import FloatingChat from "@/components/chat/FloatingChat";
import Dashboard from "@/components/dashboard/Dashboard";
import FIREModule from "@/components/fire/FIREModule";
import TaxModule from "@/components/tax/TaxModule";
import { PortfolioModule, HealthModule, CoupleModule, LifeEventModule } from "@/components/modules/AllModules";

const VIEWS: Record<string, React.FC> = {
  dashboard: Dashboard,
  fire:      FIREModule,
  tax:       TaxModule,
  portfolio: PortfolioModule,
  health:    HealthModule,
  couple:    CoupleModule,
  life:      LifeEventModule,
};

export default function App() {
  const { user, authLoading, setUser, setAuthLoading, activeTab } = useAppStore();
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const unsub = onAuthChange((u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, background: "#1a56db", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" fill="white" fillOpacity="0.8"/>
              <path d="M7 4L10 5.5V8.5L7 10L4 8.5V5.5L7 4Z" fill="white"/>
            </svg>
          </div>
          <div style={{ width: 18, height: 18, border: "2px solid #e5e7eb", borderTopColor: "#1a56db", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // ── Logged in ──────────────────────────────────────────────────────────────
  if (user) {
    const ActiveView = VIEWS[activeTab] || Dashboard;
    return (
      <div style={{ minHeight: "100vh", background: "#fafafa" }}>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "white",
              color: "#1a1a1a",
              border: "1px solid #e8e8e8",
              fontFamily: "'Geist', sans-serif",
              fontSize: "13px",
            },
          }}
        />
        <TopNav />
        <main style={{ minHeight: "calc(100vh - 48px)" }}>
          <ActiveView />
        </main>
        <FloatingChat />
      </div>
    );
  }

  // ── Auth screen ────────────────────────────────────────────────────────────
  if (showAuth) return <AuthPage />;

  // ── Landing page ───────────────────────────────────────────────────────────
  return <LandingPage onGetStarted={() => setShowAuth(true)} />;
}