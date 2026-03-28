import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useAppStore } from "@/store/appStore";
import { onAuthChange } from "@/lib/firebase";
import AuthPage from "@/components/auth/AuthPage";
import TopNav from "@/components/TopNav";
import FloatingChat from "@/components/chat/FloatingChat";
import Dashboard from "@/components/dashboard/Dashboard";
import FIREModule from "@/components/fire/FIREModule";
import TaxModule from "@/components/tax/TaxModule";
import { PortfolioModule, HealthModule, CoupleModule, LifeEventModule } from "@/components/modules/AllModules";

const VIEWS: Record<string, React.FC> = {
  dashboard: Dashboard,
  fire:       FIREModule,
  tax:        TaxModule,
  portfolio:  PortfolioModule,
  health:     HealthModule,
  couple:     CoupleModule,
  life:       LifeEventModule,
};

export default function App() {
  const { user, authLoading, setUser, setAuthLoading, activeTab } = useAppStore();

  useEffect(() => {
    const unsub = onAuthChange((u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // Loading screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" fill="white" fillOpacity="0.8"/>
              <path d="M7 4L10 5.5V8.5L7 10L4 8.5V5.5L7 4Z" fill="white"/>
            </svg>
          </div>
          <div className="w-4 h-4 border-2 border-[#e8e8e8] border-t-brand rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) return <AuthPage />;

  // Logged in — render app
  const ActiveView = VIEWS[activeTab] || Dashboard;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "white",
            color: "#1a1a1a",
            border: "1px solid #e8e8e8",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            fontFamily: "'Geist', sans-serif",
            fontSize: "13px",
          },
        }}
      />

      <TopNav />

      <main className="overflow-auto" style={{ minHeight: "calc(100vh - 48px)" }}>
        <ActiveView />
      </main>

      {/* Floating AI Chatbot */}
      <FloatingChat />
    </div>
  );
}
