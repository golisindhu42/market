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
  const [tickers, setTickers] = useState<string[]>(() => loadFromStorage<string[]>(LS_TICKERS, ['TSLA', 'AAPL', 'NVDA']))
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

  const volumeDeviation = useMemo(() => 0.5, [stockList])

  const alertCount = alerts.length

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-40 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">MP</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                Market<span className="text-gradient">Pulse</span>
              </h1>
              <p className="text-[10px] text-gray-600 -mt-0.5">AI Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full glass">
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]' : reconnecting ? 'bg-yellow-500' : 'bg-red-500'}`} />
              <span className="text-gray-500 font-medium">
                {connected ? 'Live' : 'Offline'}
              </span>
            </div>
            <AlertBell count={alertCount} onClick={() => setShowAlerts(!showAlerts)} />
            {tickers.length >= 2 && (
              <button
                onClick={() => setShowRadar(true)}
                className="text-xs bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg px-3 py-1.5 font-medium transition-all duration-200 shadow-lg shadow-blue-600/20"
              >
                Compare
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <TickerSearch tickers={tickers} onAdd={addTicker} onRemove={removeTicker} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {tickers.map((t, i) => (
                <div key={t} className="fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                  {stockData[t] ? (
                    <StockCard data={stockData[t]} history={history[t] || []} />
                  ) : (
                    <div className="glass-card rounded-xl p-4 animate-pulse">
                      <div className="h-4 bg-white/5 rounded w-16 mb-3" />
                      <div className="h-8 bg-white/5 rounded w-24 mb-2" />
                      <div className="h-3 bg-white/5 rounded w-32" />
                    </div>
                  )}
                </div>
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

      {showAlerts && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-end p-4" onClick={() => setShowAlerts(false)}>
          <div className="glass-card rounded-xl p-4 w-80 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Alerts</h3>
              <span className="text-xs text-gray-500">{alerts.length} total</span>
            </div>
            {alerts.length === 0 && <p className="text-xs text-gray-600">No alerts yet</p>}
            <div className="space-y-2">
              {alerts.map(a => (
                <div key={a.id} className="flex items-start gap-2 bg-white/5 rounded-lg p-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${a.severity === 'high' ? 'bg-red-500' : 'bg-amber-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white">{a.ticker}</p>
                    <p className="text-xs text-gray-400">{a.message}</p>
                  </div>
                  <button onClick={() => dismissAlert(a.id)} className="text-gray-600 hover:text-white text-xs">&times;</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <AlertToast alerts={alerts} onDismiss={dismissAlert} />
      {showRadar && <CompetitorRadar tickers={tickers} onClose={() => setShowRadar(false)} />}
    </div>
  )
}

export default App
