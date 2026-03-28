import { useState } from "react";
import { Menu, X, LogOut, User, ChevronDown } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { logOut } from "@/lib/firebase";
import { clsx } from "clsx";

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "fire",      label: "FIRE Planner" },
  { id: "tax",       label: "Tax Wizard" },
  { id: "portfolio", label: "Portfolio" },
  { id: "health",    label: "Health Score" },
  { id: "couple",    label: "Couple Planner" },
  { id: "life",      label: "Life Events" },
];

export default function TopNav() {
  const { activeTab, setActiveTab, user } = useAppStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Account";
  const initials = displayName.slice(0, 2).toUpperCase();
  const photoURL = user?.photoURL;

  return (
    <header className="bg-white border-b border-[#e8e8e8] sticky top-0 z-30">
      <div className="flex items-center h-12 px-4 gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-2 flex-shrink-0">
          <div className="w-6 h-6 bg-brand rounded-md flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" fill="white" fillOpacity="0.8"/>
              <path d="M7 4L10 5.5V8.5L7 10L4 8.5V5.5L7 4Z" fill="white"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-[#1a1a1a] hidden sm:block">Money Mentor</span>
        </div>

        {/* Desktop tabs */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={clsx(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                activeTab === t.id
                  ? "bg-brand/8 text-brand"
                  : "text-[#666666] hover:text-[#1a1a1a] hover:bg-[#f5f5f5]"
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* Right: user menu */}
        <div className="ml-auto flex items-center gap-2 relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#f5f5f5] transition-colors"
          >
            {photoURL ? (
              <img src={photoURL} alt="" className="w-6 h-6 rounded-full" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-brand/10 flex items-center justify-center">
                <span className="text-[9px] font-semibold text-brand">{initials}</span>
              </div>
            )}
            <span className="text-xs text-[#404040] hidden sm:block max-w-[100px] truncate">{displayName}</span>
            <ChevronDown size={12} className="text-[#b0b0b0] hidden sm:block" />
          </button>

          {/* Profile dropdown */}
          {profileOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 top-9 z-20 w-48 bg-white border border-[#e8e8e8] rounded-xl shadow-card-hover py-1">
                <div className="px-3 py-2 border-b border-[#f0f0f0]">
                  <p className="text-xs font-medium text-[#1a1a1a] truncate">{displayName}</p>
                  <p className="text-[10px] text-[#b0b0b0] truncate">{user?.email}</p>
                </div>
                <button
                  onClick={() => { setActiveTab("dashboard"); setProfileOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#404040] hover:bg-[#f5f5f5] transition-colors"
                >
                  <User size={13} /> Profile Settings
                </button>
                <button
                  onClick={() => logOut()}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#dc2626] hover:bg-[#fef2f2] transition-colors"
                >
                  <LogOut size={13} /> Sign out
                </button>
              </div>
            </>
          )}

          {/* Mobile menu */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg text-[#666666] hover:bg-[#f5f5f5] md:hidden"
          >
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#f0f0f0] bg-white px-3 py-2 space-y-0.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setMenuOpen(false); }}
              className={clsx(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                activeTab === t.id ? "bg-brand/8 text-brand font-medium" : "text-[#404040] hover:bg-[#f5f5f5]"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
