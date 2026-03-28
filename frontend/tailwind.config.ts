/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Instrument Serif'", "Georgia", "serif"],
        body: ["'Geist'", "-apple-system", "sans-serif"],
        mono: ["'Geist Mono'", "monospace"],
      },
      colors: {
        brand: { DEFAULT: "#1a56db", light: "#eff6ff", dark: "#1240a3" },
        surface: { DEFAULT: "#ffffff", 2: "#fafafa" },
        border: { DEFAULT: "#e8e8e8", strong: "#d4d4d4" },
      },
      boxShadow: {
        card: "0 1px 4px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 16px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.04)",
        modal: "0 20px 60px rgba(0,0,0,0.15)",
        chat: "0 8px 32px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
};
