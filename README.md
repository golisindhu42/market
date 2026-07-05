# MarketPulse AI

**AI-Powered Real-Time Equity Intelligence Platform**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.138-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![WebSocket](https://img.shields.io/badge/WebSocket-Real--Time-764ABC)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
[![Groq](https://img.shields.io/badge/Groq-LLaMA%203.3-FF6B35)](https://groq.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3.14-3776AB?logo=python)](https://www.python.org)

---

## Features

- **Live Multi-Ticker Dashboard** — Track up to 10 tickers simultaneously with real-time price streaming via WebSocket, updating every 2 seconds
- **AI Market Copilot Chat** — Ask natural language questions like "Why is Tesla dropping?" and get intelligent answers powered by Groq LLaMA-3.3-70b
- **Sentiment Score Engine** — Each ticker scored 0-100 based on analysis of 20 news headlines using TextBlob NLP, displayed with color-coded meters
- **Real-Time Anomaly Detection** — Automatic alerts for volume spikes (>200% of average) and price movements (>3% in 5 minutes)
- **Competitor Comparison Radar** — Compare your watchlist across 5 dimensions: momentum, sentiment, volume, volatility, and 52-week performance
- **Fear & Greed Meter** — Visual gauge combining sentiment, momentum, and volatility data into a single 0-100 market mood indicator

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React 19, TypeScript, Vite | Fast HMR, type safety, modern tooling |
| UI Components | Recharts, Lucide React, TailwindCSS | Declarative charts, icon library, utility-first CSS |
| Backend | Python, FastAPI, WebSocket | Async support, auto-docs, real-time streaming |
| Stock Data | Yahoo Finance (yfinance) | Free, no API key required, comprehensive data |
| AI Engine | Groq LLaMA-3.3-70b | Ultra-fast inference, free tier available |
| Sentiment | TextBlob | Lightweight NLP, no GPU required |
| Database | SQLite | Zero-config, file-based, perfect for caching |
| Deployment | Vercel (frontend), Railway (backend) | Free tiers, GitHub integration, zero-config |

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+
- A [Groq API key](https://console.groq.com) (free)
- A [NewsAPI key](https://newsapi.org) (free, 100 req/day)

### Installation

```bash
git clone https://github.com/yourusername/marketpulse-ai.git
cd marketpulse-ai
```

**Backend setup:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Add your API keys
uvicorn main:app --reload
```

**Frontend setup:**
```bash
cd frontend
npm install
cp .env.example .env  # Or create .env with VITE_API_BASE_URL=http://localhost:8000
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and start tracking tickers!

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ StockCard │ │ AI Chat  │ │Sentiment │ │  Radar   │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘   │
│       │             │            │             │          │
│  ┌────┴─────────────┴────────────┴─────────────┴─────┐  │
│  │              useStockWebSocket Hook                │  │
│  └───────────────────┬───────────────────────────────┘  │
└──────────────────────┼──────────────────────────────────┘
                       │ WebSocket + REST
┌──────────────────────┼──────────────────────────────────┐
│              FastAPI Backend                              │
│  ┌───────────────────┴───────────────────────────────┐  │
│  │                  main.py (Router)                  │  │
│  └──┬──────────┬──────────┬──────────┬───────────────┘  │
│     │          │          │          │                    │
│  ┌──┴──┐  ┌───┴───┐  ┌───┴───┐  ┌───┴───┐              │
│  │Stock │  │  AI   │  │Anomaly│  │  DB   │              │
│  │Serv. │  │Service│  │  Serv.│  │ SQLite│              │
│  └──┬───┘  └───┬───┘  └───┬───┘  └───────┘              │
└─────┼──────────┼──────────┼──────────────────────────────┘
      │          │          │
  ┌───┴───┐  ┌───┴───┐  ┌───┴───┐
  │Yahoo  │  │ Groq  │  │NewsAPI│
  │Finance│  │LLaMA  │  │       │
  └───────┘  └───────┘  └───────┘
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `WS` | `/ws/stocks` | Real-time stock data stream |
| `GET` | `/api/stock/{ticker}/history` | 30-day closing prices |
| `GET` | `/api/stock/{ticker}/info` | Company info and stats |
| `GET` | `/api/stock/{ticker}/sentiment` | Sentiment score and headlines |
| `GET` | `/api/tickers/compare?tickers=A,B` | Multi-ticker comparison |
| `POST` | `/api/ai/chat` | Ask the AI market copilot |

## Deployment

**Frontend (Vercel):**
1. Connect your GitHub repo
2. Set root directory to `frontend`
3. Build command: `npm run build`, output: `dist`
4. Add env var: `VITE_API_BASE_URL` → your Railway backend URL

**Backend (Railway):**
1. Connect your GitHub repo
2. Set root directory to `backend`
3. Railway auto-detects Python
4. Add env vars: `GROQ_API_KEY`, `NEWS_API_KEY`

## License

MIT License — see [LICENSE](LICENSE) for details.
