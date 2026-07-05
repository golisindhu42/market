import { useState, useEffect, useMemo, useCallback } from 'react'
import axios from 'axios'
import { useStockWebSocket } from './hooks/useStockWebSocket'
import TopNav from './components/TopNav'
import StatsRow from './components/StatsRow'
import MainChart from './components/MainChart'
import StockCardGrid from './components/StockCardGrid'
import AICopilot from './components/AICopilot'
import FearGreedIndex from './components/FearGreedIndex'
import MarketSentiment from './components/MarketSentiment'
import NewsFeed from './components/NewsFeed'
import WatchlistTable from './components/WatchlistTable'
import MarketOverview from './components/MarketOverview'
import AlertToast from './components/AlertToast'

const LS_TICKERS = 'marketpulse_tickers'
const LS_HISTORY = 'marketpulse_history'

function loadFromStorage<T>(key: string, fallback: T): T {
  try { const s = localStorage.getItem(key); if (s) return JSON.parse(s) as T } catch {}
  return fallback
}

const DEFAULT_TICKERS = ['TSLA', 'AAPL', 'NVDA', 'MSFT', 'AMZN', 'GOOGL']

function App() {
  const [tickers, setTickers] = useState<string[]>(() => loadFromStorage<string[]>(LS_TICKERS, DEFAULT_TICKERS))
  const [history, setHistory] = useState<Record<string, { date: string; price: number }[]>>(() => loadFromStorage(LS_HISTORY, {}))
  const [activeTicker, setActiveTicker] = useState('TSLA')

  const { stockData, connected, alerts, dismissAlert } = useStockWebSocket(tickers)

  const addTicker = useCallback((t: string) => {
    setTickers(prev => { const next = [...prev, t]; localStorage.setItem(LS_TICKERS, JSON.stringify(next)); return next })
  }, [])
  const removeTicker = useCallback((t: string) => {
    setTickers(prev => { const next = prev.filter(x => x !== t); localStorage.setItem(LS_TICKERS, JSON.stringify(next)); return next })
  }, [])

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE_URL || ''
    tickers.forEach(async (t) => {
      try {
        const res = await axios.get(`${base}/api/stock/${t}/history`)
        setHistory(prev => {
          const next = { ...prev, [t]: res.data.data }
          localStorage.setItem(LS_HISTORY, JSON.stringify(next))
          return next
        })
      } catch {}
    })
  }, [tickers])

  const stockList = useMemo(() => tickers.map(t => stockData[t]).filter(Boolean), [tickers, stockData])
  const totalChange = stockList.reduce((sum, s) => sum + (s.changePercent || 0), 0)
  const totalValue = stockList.reduce((sum, s) => sum + s.price, 0)
  const sentimentAvg = stockList.length > 0
    ? stockList.reduce((sum, s) => sum + Math.abs(s.changePercent || 0), 0) / stockList.length * 10 + 50
    : 50
  const aiConfidence = Math.min(95, Math.max(30, stockList.length > 0
    ? stockList.reduce((sum, s) => sum + Math.abs(s.changePercent || 0), 0) / stockList.length * 15 + 60
    : 75
  ))

  const chartData = useMemo(() => {
    const h = history[activeTicker]
    if (!h || h.length < 2) return Array.from({ length: 50 }, (_, i) => ({
      time: `${i}`,
      value: 200 + Math.sin(i * 0.3) * 20 + Math.random() * 5,
      volume: Math.floor(Math.random() * 10000000) + 5000000,
    }))
    return h.map(d => ({ time: d.date, value: d.price, volume: Math.floor(Math.random() * 10000000) + 5000000 }))
  }, [history, activeTicker])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <TopNav
        tickers={tickers}
        onAdd={addTicker}
        onRemove={removeTicker}
        connected={connected}
        alertCount={alerts.length}
      />

      <main style={{ maxWidth: 1440, margin: '0 auto', padding: '20px 24px 40px' }}>
        <StatsRow
          totalValue={totalValue}
          totalChange={totalChange}
          sentimentAvg={sentimentAvg}
          aiConfidence={aiConfidence}
          stockCount={stockList.length}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, marginBottom: 24 }}>
          <MainChart data={chartData} ticker={activeTicker} onTickerChange={setActiveTicker} tickers={tickers} />
          <AICopilot tickers={tickers} />
        </div>

        <StockCardGrid
          tickers={tickers}
          stockData={stockData}
          history={history}
          onSelect={setActiveTicker}
          activeTicker={activeTicker}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 24 }}>
          <FearGreedIndex sentimentAvg={sentimentAvg} priceChangeAvg={totalChange / Math.max(stockList.length, 1)} />
          <MarketSentiment sentiments={stockList.map(s => ({ ticker: s.ticker, score: Math.abs(s.changePercent || 0) * 10 + 50 }))} />
          <NewsFeed tickers={tickers} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
          <WatchlistTable stockList={stockList} />
          <MarketOverview stockList={stockList} />
        </div>
      </main>

      <AlertToast alerts={alerts} onDismiss={dismissAlert} />
    </div>
  )
}

export default App
