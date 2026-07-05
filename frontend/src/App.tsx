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
  } catch {}
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
      } catch {}
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

  const greenCount = stockList.filter(s => (s.changePercent || 0) >= 0).length
  const redCount = stockList.length - greenCount

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <MarketTicker />

      <div className="sticky top-0 z-40" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-primary)' }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2.5">
                <div style={{ background: 'linear-gradient(135deg, #448aff, #7c4dff)', borderRadius: 6, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="text-white font-bold text-[10px]" style={{ fontFamily: 'var(--font-mono)' }}>MP</span>
                </div>
                <span className="text-sm font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-sans)' }}>
                  Market<span style={{ color: 'var(--blue)' }}>Pulse</span>
                </span>
              </div>
              <div className="hidden md:flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500' : reconnecting ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ marginRight: 4 }} />
                {connected ? 'LIVE' : reconnecting ? 'RECONNECTING' : 'OFFLINE'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {tickers.length >= 2 && (
                <button onClick={() => setShowRadar(true)} className="terminal-btn-outline text-xs px-3 py-1.5">Radar</button>
              )}
              <AlertBell count={alerts.length} onClick={() => setShowAlerts(!showAlerts)} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <TickerSearch tickers={tickers} onAdd={addTicker} onRemove={removeTicker} />

        {stockList.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div className="terminal-card p-3">
              <div className="text-[10px] font-semibold tracking-wider uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Watchlist</div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-white mono">{stockList.length}</span>
                {greenCount > 0 && <span className="text-xs mono text-green">{greenCount} ▲</span>}
                {redCount > 0 && <span className="text-xs mono text-red">{redCount} ▼</span>}
              </div>
            </div>
            <div className="terminal-card p-3">
              <div className="text-[10px] font-semibold tracking-wider uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Total Value</div>
              <span className="text-lg font-bold text-white mono">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            </div>
            <div className="terminal-card p-3">
              <div className="text-[10px] font-semibold tracking-wider uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Day Change</div>
              <span className={`text-lg font-bold mono ${totalChange >= 0 ? 'text-green' : 'text-red'}`}>
                {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}%
              </span>
            </div>
            <div className="terminal-card p-3">
              <div className="text-[10px] font-semibold tracking-wider uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Sentiment</div>
              <span className={`text-lg font-bold mono ${sentimentAvg >= 60 ? 'text-green' : sentimentAvg >= 40 ? 'text-amber-500' : 'text-red'}`}>
                {Math.round(sentimentAvg)}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {tickers.map((t, i) => (
                <div key={t} className="fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                  {stockData[t] ? (
                    <StockCard data={stockData[t]} history={history[t] || []} />
                  ) : (
                    <div className="terminal-card p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full" style={{ background: 'var(--text-muted)' }} />
                        <div className="h-3 w-16" style={{ background: 'var(--bg-hover)', borderRadius: 2 }} />
                      </div>
                      <div className="h-7 w-24 mb-2" style={{ background: 'var(--bg-hover)', borderRadius: 2 }} />
                      <div className="h-2.5 w-full" style={{ background: 'var(--bg-hover)', borderRadius: 2 }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-3">
            <AIChatPanel tickers={tickers} />
            <SentimentPanel tickers={tickers} />
            <FearGreedMeter sentimentAvg={sentimentAvg} priceChangeAvg={priceChangeAvg} volumeDeviation={0.5} />
          </div>
        </div>
      </div>

      {showAlerts && (
        <div className="fixed inset-0 z-50 flex items-start justify-end p-4 fade-in" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setShowAlerts(false)}>
          <div className="terminal-card p-4 w-80 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-secondary)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-white">Notifications</span>
              <span className="text-xs text-muted">{alerts.length} total</span>
            </div>
            {alerts.length === 0 && (
              <div className="text-center py-8"><span className="text-xs text-muted">No alerts yet</span></div>
            )}
            <div className="space-y-2">
              {alerts.map((a) => (
                <div key={a.id} className="flex items-start gap-2.5 p-2.5 rounded-md" style={{ background: 'var(--bg-tertiary)' }}>
                  <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${a.severity === 'high' ? 'bg-red-500' : 'bg-amber-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white">{a.ticker}</div>
                    <div className="text-xs text-muted mt-0.5">{a.message}</div>
                  </div>
                  <button onClick={() => dismissAlert(a.id)} className="text-xs text-muted hover:text-white p-0.5">&times;</button>
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
