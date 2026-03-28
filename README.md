# Money Mentor v2 — AI Financial Planning

> Clean white dashboard · Firebase authentication · Gemini AI · Floating chatbot

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS |
| State | Zustand |
| Charts | Recharts |
| Auth | Firebase Authentication (Email + Google OAuth) |
| AI Chatbot | Google Gemini 1.5 Flash (`@google/generative-ai`) |
| AI Agent | LangGraph + `langchain-google-genai` |
| Backend | FastAPI (Python 3.11) |
| Auth Verification | Firebase Admin SDK |
| Database | Supabase (optional) |
| Deploy | Vercel (frontend) + Render (backend) |

---

## Quick Start

### 1. Get API Keys

| Key | Where to get |
|-----|-------------|
| Firebase config | [console.firebase.google.com](https://console.firebase.google.com) → Project Settings → Your Apps |
| Gemini API key | [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) |
| Firebase service account | Firebase Console → Project Settings → Service Accounts → Generate new private key |

### 2. Firebase setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a project → Add a Web App → copy config values
3. Go to **Authentication** → **Sign-in method** → Enable **Email/Password** and **Google**
4. Go to **Project Settings** → **Service accounts** → **Generate new private key** → save as `serviceAccountKey.json`

### 3. Environment files

**Frontend** (`frontend/.env`):
```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:...:web:...
VITE_GEMINI_API_KEY=AIzaSy...
VITE_API_URL=http://localhost:8000/api
```

**Backend** (`backend/.env`):
```
GEMINI_API_KEY=AIzaSy...
FIREBASE_SERVICE_ACCOUNT_JSON=/path/to/serviceAccountKey.json
FIREBASE_PROJECT_ID=your-project-id
ENVIRONMENT=development
```

### 4. Run locally

```bash
# Backend
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in values
uvicorn main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env   # fill in values (rename to .env)
npm run dev
# → http://localhost:5173
```

### 5. Docker (one command)

```bash
# Ensure both backend/.env and frontend/.env are filled in
docker-compose up --build
```

---

## Deployment

### Frontend → Vercel
1. Push to GitHub
2. Import at vercel.com → Root Directory: `frontend`
3. Add all `VITE_*` env vars in Vercel dashboard
4. Deploy

### Backend → Render
1. New Web Service → connect repo
2. Root Directory: `backend`
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add `GEMINI_API_KEY`, `FIREBASE_SERVICE_ACCOUNT_JSON`, `FIREBASE_PROJECT_ID`

---

## Features

- **Firebase Auth** — Email/password + Google sign-in, protected routes
- **Floating AI Chatbot** — Gemini 1.5 Flash, bottom-right popup, context-aware
- **FIRE Planner** — Corpus projection chart, 4-phase roadmap
- **Tax Wizard** — Old vs New regime, deduction utilisation, missing deductions
- **Portfolio X-Ray** — XIRR, overlap detection, rebalancing plan
- **Health Score** — 6-dimension radar chart
- **Couple Planner** — Joint income optimisation
- **Life Events** — Marriage, baby, bonus, home, inheritance playbooks

---

## SEBI Disclaimer

Money Mentor provides educational financial information only. This is not SEBI-registered investment advisory under SEBI (Investment Advisers) Regulations 2013. All calculations are indicative. Consult a SEBI-registered advisor for personalised investment decisions.
