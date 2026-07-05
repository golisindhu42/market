import { useState, useEffect, useMemo, useCallback } from 'react'
import axios from 'axios'
import TickerSearch from './components/TickerSearch'
import StockCard from './components/StockCard'
import AIChatPanel from './components/AIChatPanel'
import SentimentPanel from './components/SentimentPanel'
import FearGreedMeter from './components/FearGreedMeter'
import CompetitorRadar from './components/CompetitorRadar'
import AlertToast, { AlertBell } from './components/AlertToast'
import { useStockWebSocket } from './hooks/useStockWebSocket'

const LS_TICKERS = 'marketpulse_tickers'
const LS_HISTORY = 'marketpulse_history'

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key)
    if (saved) return JSON.parse(saved) as T
  } catch { }
  return fallback
}

function App() {
  const [tickers, setTickers] = useState<string[]>(() => loadFromStorage<string[]>(LS_TICKERS, ['TSLA']))
  const [history, setHistory] = useState<Record<string, { date: string; price: number }[]>>(
    () => loadFromStorage(LS_HISTORY, {})
  )
  const [showRadar, setShowRadar] = useState(false)
  const [showAlerts, setShowAlerts] = useState(false)

  const { stockData, connected, reconnecting, alerts, dismissAlert } = useStockWebSocket(tickers)

  const addTicker = useCallback((t: string) => {
    setTickers(prev => {
      const next = [...prev, t]
      localStorage.setItem(LS_TICKERS, JSON.stringify(next))
      return next
    })
  }, [])

  const removeTicker = useCallback((t: string) => {
    setTickers(prev => {
      const next = prev.filter(x => x !== t)
      localStorage.setItem(LS_TICKERS, JSON.stringify(next))
      return next
    })
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
      } catch { }
    })
  }, [tickers])

  const stockList = useMemo(() =>
    tickers.map(t => stockData[t]).filter(Boolean),
    [tickers, stockData]
  )

  const sentimentAvg = useMemo(() => {
    if (stockList.length === 0) return 50
    return stockList.reduce((sum, s) => sum + Math.abs(s.changePercent || 0), 0) / stockList.length * 10 + 50
  }, [stockList])

  const priceChangeAvg = useMemo(() => {
    if (stockList.length === 0) return 0
    return stockList.reduce((sum, s) => sum + (s.changePercent || 0), 0) / stockList.length
  }, [stockList])

  const volumeDeviation = useMemo(() => {
    if (stockList.length === 0) return 0.5
    return 0.5
  }, [stockList])

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <nav className="sticky top-0 z-40 bg-[#0a0a0f]/90 backdrop-blur border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">
            Market<span className="text-blue-500">Pulse</span> AI
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs">
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : reconnecting ? 'bg-yellow-500' : 'bg-red-500'}`} />
              <span className="text-gray-500">
                {connected ? 'Live' : reconnecting ? 'Reconnecting...' : 'Disconnected'}
              </span>
            </div>
            <AlertBell count={alerts.length} onClick={() => setShowAlerts(!showAlerts)} />
            {tickers.length >= 2 && (
              <button
                onClick={() => setShowRadar(true)}
                className="text-xs bg-[#1a1a2e] hover:bg-[#25253e] border border-gray-700 rounded-lg px-3 py-1.5 text-gray-300 transition-colors"
              >
                Compare Tickers
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <TickerSearch tickers={tickers} onAdd={addTicker} onRemove={removeTicker} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {tickers.map(t => (
                stockData[t] ? (
                  <StockCard key={t} data={stockData[t]} history={history[t] || []} />
                ) : (
                  <div key={t} className="bg-[#12121e] border border-gray-800 rounded-xl p-4 animate-pulse">
                    <div className="h-4 bg-[#1a1a2e] rounded w-16 mb-3" />
                    <div className="h-8 bg-[#1a1a2e] rounded w-24 mb-2" />
                    <div className="h-3 bg-[#1a1a2e] rounded w-32" />
                  </div>
                )
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <AIChatPanel tickers={tickers} />
            <SentimentPanel tickers={tickers} />
            <FearGreedMeter
              sentimentAvg={sentimentAvg}
              priceChangeAvg={priceChangeAvg}
              volumeDeviation={volumeDeviation}
            />
          </div>
        </div>
      </main>

      <AlertToast alerts={alerts} onDismiss={dismissAlert} />
      {showRadar && <CompetitorRadar tickers={tickers} onClose={() => setShowRadar(false)} />}
    </div>
  )
}

export default App
