import { useState, useEffect, useMemo, useCallback } from 'react'
import axios from 'axios'
import TickerSearch from './components/TickerSearch'
import StockCard from './components/StockCard'
import AIChatPanel from './components/AIChatPanel'
import SentimentPanel from './components/SentimentPanel'
import FearGreedMeter from './components/FearGreedMeter'
import CompetitorRadar from './components/CompetitorRadar'
import AlertToast, { AlertBell } from './components/AlertToast'
import MarketTicker from './components/MarketTicker'
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

  const totalChange = useMemo(() => {
    return stockList.reduce((sum, s) => sum + (s.changePercent || 0), 0)
  }, [stockList])

  const totalValue = useMemo(() => {
    return stockList.reduce((sum, s) => sum + s.price, 0)
  }, [stockList])

  const alertCount = alerts.length

  return (
    <div className="min-h-screen">
      <MarketTicker />

      <div className="sticky top-0 z-40 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <span className="text-white font-bold text-[10px] tracking-tight">MP</span>
                </div>
                <div>
                  <h1 className="text-sm font-bold text-white tracking-tight leading-none">
                    Market<span className="text-gradient">Pulse</span>
                  </h1>
                  <p className="text-[9px] text-gray-600 font-medium tracking-wider uppercase leading-none mt-0.5">AI Intelligence</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-1.5 text-[11px] pl-4 border-l border-white/[0.06]">
                <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]' : reconnecting ? 'bg-amber-500' : 'bg-red-500'}`} />
                <span className="text-gray-500 font-medium">{connected ? 'Live' : reconnecting ? 'Reconnecting...' : 'Offline'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {tickers.length >= 2 && (
                <button
                  onClick={() => setShowRadar(true)}
                  className="text-[11px] font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-gray-300 hover:text-white rounded-lg px-3 py-1.5 transition-all duration-200 border border-white/[0.06]"
                >
                  Radar
                </button>
              )}
              <AlertBell count={alertCount} onClick={() => setShowAlerts(!showAlerts)} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <TickerSearch tickers={tickers} onAdd={addTicker} onRemove={removeTicker} />

        {stockList.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="glass-card rounded-xl px-4 py-3">
              <p className="text-[10px] text-gray-600 font-medium uppercase tracking-wider mb-1">Watchlist</p>
              <p className="text-lg font-bold text-white tabular-nums">{stockList.length}</p>
            </div>
            <div className="glass-card rounded-xl px-4 py-3">
              <p className="text-[10px] text-gray-600 font-medium uppercase tracking-wider mb-1">Total Value</p>
              <p className="text-lg font-bold text-white tabular-nums">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
            </div>
            <div className="glass-card rounded-xl px-4 py-3">
              <p className="text-[10px] text-gray-600 font-medium uppercase tracking-wider mb-1">Day Change</p>
              <p className={`text-lg font-bold tabular-nums ${totalChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}%
              </p>
            </div>
            <div className="glass-card rounded-xl px-4 py-3">
              <p className="text-[10px] text-gray-600 font-medium uppercase tracking-wider mb-1">Sentiment</p>
              <p className={`text-lg font-bold tabular-nums ${sentimentAvg >= 60 ? 'text-green-500' : sentimentAvg >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                {Math.round(sentimentAvg)}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {tickers.map((t, i) => (
                <div key={t} className="fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                  {stockData[t] ? (
                    <StockCard data={stockData[t]} history={history[t] || []} />
                  ) : (
                    <div className="glass-card rounded-xl p-4 shimmer">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-white/5" />
                        <div className="h-4 bg-white/5 rounded w-16" />
                      </div>
                      <div className="h-8 bg-white/5 rounded w-24 mb-2" />
                      <div className="h-3 bg-white/5 rounded w-full" />
                      <div className="h-12 bg-white/5 rounded w-full mt-3" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <AIChatPanel tickers={tickers} />
            <SentimentPanel tickers={tickers} />
            <FearGreedMeter
              sentimentAvg={sentimentAvg}
              priceChangeAvg={priceChangeAvg}
              volumeDeviation={0.5}
            />
          </div>
        </div>
      </div>

      {showAlerts && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-end p-4 fade-in" onClick={() => setShowAlerts(false)}>
          <div className="glass-card rounded-xl p-4 w-80 max-h-[80vh] overflow-y-auto scale-in" onClick={e => e.stopPropagation()} style={{ background: 'rgba(12, 19, 34, 0.95)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              <span className="text-[11px] text-gray-500 font-medium">{alerts.length} total</span>
            </div>
            {alerts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-xs text-gray-600">No alerts yet</p>
              </div>
            )}
            <div className="space-y-2">
              {alerts.map((a, i) => (
                <div key={a.id} className="fade-in-up" style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="flex items-start gap-3 bg-white/[0.03] rounded-lg p-3 border border-white/[0.04]">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 shadow-lg ${a.severity === 'high' ? 'bg-red-500 shadow-red-500/30' : 'bg-amber-500 shadow-amber-500/30'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white">{a.ticker}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5 leading-relaxed">{a.message}</p>
                    </div>
                    <button onClick={() => dismissAlert(a.id)} className="text-gray-600 hover:text-white transition-colors text-xs p-1">&times;</button>
                  </div>
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
