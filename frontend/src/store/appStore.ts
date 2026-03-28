import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "./firebase";

export interface UserProfile {
  name: string; age: number; income: number; expenses: number;
  city: "metro" | "non-metro"; riskProfile: "conservative" | "moderate" | "aggressive";
  existingInvestments: number; emergencyFund: number;
}

export interface ChatMessage {
  id: string; role: "user" | "model"; content: string; timestamp: Date;
}

interface AppState {
  // Auth
  user: User | null;
  authLoading: boolean;
  setUser: (u: User | null) => void;
  setAuthLoading: (v: boolean) => void;

  // Navigation
  activeTab: string;
  setActiveTab: (t: string) => void;

  // Profile
  profile: UserProfile;
  updateProfile: (u: Partial<UserProfile>) => void;

  // Chat messages (floating chatbot)
  chatMessages: ChatMessage[];
  addChatMessage: (m: ChatMessage) => void;
  clearChat: () => void;
  chatOpen: boolean;
  setChatOpen: (v: boolean) => void;
  chatTyping: boolean;
  setChatTyping: (v: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      authLoading: true,
      setUser: (user) => set({ user }),
      setAuthLoading: (authLoading) => set({ authLoading }),

      activeTab: "dashboard",
      setActiveTab: (activeTab) => set({ activeTab }),

      profile: {
        name: "User", age: 28, income: 100000, expenses: 55000,
        city: "metro", riskProfile: "moderate",
        existingInvestments: 500000, emergencyFund: 200000,
      },
      updateProfile: (updates) =>
        set((s) => ({ profile: { ...s.profile, ...updates } })),

      chatMessages: [],
      addChatMessage: (m) => set((s) => ({ chatMessages: [...s.chatMessages, m] })),
      clearChat: () => set({ chatMessages: [] }),
      chatOpen: false,
      setChatOpen: (chatOpen) => set({ chatOpen }),
      chatTyping: false,
      setChatTyping: (chatTyping) => set({ chatTyping }),
    }),
    {
      name: "money-mentor-v2",
      partialize: (s) => ({ profile: s.profile, activeTab: s.activeTab }),
    }
  )
);
