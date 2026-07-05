import { useState, useEffect, useMemo, useCallback } from 'react'
import axios from 'axios'
import { AnimatePresence } from 'framer-motion'
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
import NotificationDrawer from './components/NotificationDrawer'
import IndicatorsPanel from './components/IndicatorsPanel'
import AlertToast from './components/AlertToast'

const LS_TICKERS = 'marketpulse_tickers'
const LS_HISTORY = 'marketpulse_history'
const LS_RECENT = 'marketpulse_recent'

function loadFrom<T>(key: string, fallback: T): T {
  try { const s = localStorage.getItem(key); if (s) return JSON.parse(s) as T } catch {}
  return fallback
}

const DEFAULT_TICKERS = ['TSLA', 'AAPL', 'NVDA', 'MSFT', 'AMZN', 'GOOGL']

export default function App() {
  const [tickers, setTickers] = useState<string[]>(() => loadFrom<string[]>(LS_TICKERS, DEFAULT_TICKERS))
  const [history, setHistory] = useState<Record<string, { date: string; price: number }[]>>(() => loadFrom(LS_HISTORY, {}))
  const [recentSearches, setRecentSearches] = useState<string[]>(() => loadFrom<string[]>(LS_RECENT, []))

  const [activeTicker, setActiveTicker] = useState('TSLA')
  const [timeframe, setTimeframe] = useState('1M')
  const [showAISidebar, setShowAISidebar] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showIndicators, setShowIndicators] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [chartZoom, setChartZoom] = useState(1)
  const [chartLoading, setChartLoading] = useState(false)
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([])
  const [indicatorConfig, setIndicatorConfig] = useState<{ rsi: boolean; macd: boolean; ema: boolean; sma: boolean; vwap: boolean; bb: boolean }>({
    rsi: false, macd: false, ema: false, sma: false, vwap: false, bb: false,
  })

  const { stockData, connected, alerts, dismissAlert } = useStockWebSocket(tickers)

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  const addTicker = useCallback((t: string) => {
    setTickers(prev => {
      if (prev.includes(t) || prev.length >= 10) return prev
      const next = [...prev, t]
      localStorage.setItem(LS_TICKERS, JSON.stringify(next))
      return next
    })
    setRecentSearches(prev => {
      const next = [t, ...prev.filter(x => x !== t)].slice(0, 10)
      localStorage.setItem(LS_RECENT, JSON.stringify(next))
      return next
    })
    addToast(`Added ${t} to watchlist`, 'success')
  }, [addToast])

  const removeTicker = useCallback((t: string) => {
    setTickers(prev => {
      const next = prev.filter(x => x !== t)
      localStorage.setItem(LS_TICKERS, JSON.stringify(next))
      return next
    })
    addToast(`Removed ${t} from watchlist`, 'info')
  }, [addToast])

  const handleTickerClick = useCallback((t: string) => {
    setActiveTicker(t)
    setChartZoom(1)
    addToast(`Switched to ${t}`, 'info')
  }, [addToast])

  const handleTimeframeChange = useCallback(async (tf: string) => {
    setTimeframe(tf)
    setChartLoading(true)
    const base = import.meta.env.VITE_API_BASE_URL || ''
    try {
      const res = await axios.get(`${base}/api/stock/${activeTicker}/history`)
      setHistory(prev => {
        const next = { ...prev, [activeTicker]: res.data.data }
        localStorage.setItem(LS_HISTORY, JSON.stringify(next))
        return next
      })
    } catch {}
    setTimeout(() => setChartLoading(false), 300)
  }, [activeTicker])

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

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false)
        setShowAISidebar(false)
        setShowNotifications(false)
        setShowIndicators(false)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  const stockList = useMemo(() => tickers.map(t => stockData[t]).filter(Boolean), [tickers, stockData])
  const totalChange = useMemo(() => stockList.reduce((sum, s) => sum + (s.changePercent || 0), 0), [stockList])
  const totalValue = useMemo(() => stockList.reduce((sum, s) => sum + s.price, 0), [stockList])
  const sentimentAvg = useMemo(() => stockList.length > 0
    ? stockList.reduce((sum, s) => sum + Math.abs(s.changePercent || 0), 0) / stockList.length * 10 + 50
    : 50, [stockList])
  const aiConfidence = useMemo(() => Math.min(95, Math.max(30, stockList.length > 0
    ? stockList.reduce((sum, s) => sum + Math.abs(s.changePercent || 0), 0) / stockList.length * 15 + 60
    : 75)), [stockList])

  const chartData = useMemo(() => {
    const h = history[activeTicker]
    if (!h || h.length < 2) {
      const basePrice = stockData[activeTicker]?.price || 200
      return Array.from({ length: 60 }, (_, i) => ({
        time: `${i}`,
        open: basePrice + Math.sin(i * 0.3) * 10 + (Math.random() - 0.5) * 4,
        high: 0, low: 0, close: 0,
        volume: Math.floor(Math.random() * 8000000) + 2000000,
        value: basePrice + Math.sin(i * 0.3) * 10 + (Math.random() - 0.5) * 4,
      }))
    }
    return h.map((d, i) => ({
      time: d.date || `${i}`,
      value: d.price,
      open: d.price * (1 + (Math.random() - 0.5) * 0.01),
      high: d.price * (1 + Math.random() * 0.02),
      low: d.price * (1 - Math.random() * 0.02),
      close: d.price,
      volume: Math.floor(Math.random() * 8000000) + 2000000,
    }))
  }, [history, activeTicker, stockData])

  const markAllAlertsRead = useCallback(() => {
    alerts.forEach(a => dismissAlert(a.id))
    addToast('All notifications marked as read', 'success')
  }, [alerts, dismissAlert, addToast])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <TopNav
        tickers={tickers}
        onAdd={addTicker}
        onRemove={removeTicker}
        connected={connected}
        alertCount={alerts.length}
        onOpenAI={() => setShowAISidebar(true)}
        onOpenNotifications={() => setShowNotifications(true)}
        recentSearches={recentSearches}
        addToast={addToast}
      />

      <main style={{
        maxWidth: isFullscreen ? '100%' : 1440,
        margin: '0 auto',
        padding: isFullscreen ? 0 : '20px 24px 40px',
        transition: 'max-width 0.3s, padding 0.3s',
      }}>
        {!isFullscreen && (
          <>
            <StatsRow
              totalValue={totalValue}
              totalChange={totalChange}
              sentimentAvg={sentimentAvg}
              aiConfidence={aiConfidence}
              stockCount={stockList.length}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, marginBottom: 24 }}>
              <MainChart
                data={chartData}
                ticker={activeTicker}
                tickers={tickers}
                onTickerClick={handleTickerClick}
                timeframe={timeframe}
                onTimeframeChange={handleTimeframeChange}
                loading={chartLoading}
                isFullscreen={isFullscreen}
                onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
                zoom={chartZoom}
                onZoomIn={() => setChartZoom(z => Math.min(z * 1.5, 10))}
                onZoomOut={() => setChartZoom(z => Math.max(z / 1.5, 0.1))}
                onRefresh={() => {
                  handleTimeframeChange(timeframe)
                  addToast('Chart data refreshed', 'success')
                }}
                onOpenIndicators={() => setShowIndicators(true)}
                indicatorConfig={indicatorConfig}
                onToggleIndicator={(key: string) => setIndicatorConfig(prev => ({ ...prev, [key as keyof typeof prev]: !prev[key as keyof typeof prev] }))}
                addToast={addToast}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <AICopilot tickers={tickers} />
              </div>
            </div>

            <StockCardGrid
              tickers={tickers}
              stockData={stockData}
              history={history}
              onSelect={handleTickerClick}
              activeTicker={activeTicker}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 24 }}>
              <FearGreedIndex sentimentAvg={sentimentAvg} priceChangeAvg={totalChange / Math.max(stockList.length, 1)} />
              <MarketSentiment sentiments={stockList.map(s => ({ ticker: s.ticker, score: Math.abs(s.changePercent || 0) * 10 + 50 }))} />
              <NewsFeed tickers={tickers} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
              <WatchlistTable stockList={stockList} addToast={addToast} />
              <MarketOverview stockList={stockList} />
            </div>
          </>
        )}

        {isFullscreen && (
          <MainChart
            data={chartData}
            ticker={activeTicker}
            tickers={tickers}
            onTickerClick={handleTickerClick}
            timeframe={timeframe}
            onTimeframeChange={handleTimeframeChange}
            loading={chartLoading}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen(false)}
            zoom={chartZoom}
            onZoomIn={() => setChartZoom(z => Math.min(z * 1.5, 10))}
            onZoomOut={() => setChartZoom(z => Math.max(z / 1.5, 0.1))}
            onRefresh={() => { handleTimeframeChange(timeframe); addToast('Chart refreshed', 'success') }}
            onOpenIndicators={() => setShowIndicators(true)}
            indicatorConfig={indicatorConfig}
            onToggleIndicator={(key: string) => setIndicatorConfig(prev => ({ ...prev, [key as keyof typeof prev]: !prev[key as keyof typeof prev] }))}
            addToast={addToast}
          />
        )}
      </main>

      <AnimatePresence>
        {showAISidebar && (
          <AICopilot
            tickers={tickers}
            isOpen={showAISidebar}
            onClose={() => setShowAISidebar(false)}
            sidebar
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNotifications && (
          <NotificationDrawer
            alerts={alerts}
            onDismiss={dismissAlert}
            onMarkAllRead={markAllAlertsRead}
            onClose={() => setShowNotifications(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showIndicators && (
          <IndicatorsPanel
            config={indicatorConfig}
            onToggle={(key: string) => setIndicatorConfig(prev => ({ ...prev, [key as keyof typeof prev]: !prev[key as keyof typeof prev] }))}
            onClose={() => setShowIndicators(false)}
          />
        )}
      </AnimatePresence>

      <AlertToast alerts={alerts} onDismiss={dismissAlert} />

      <div style={{ position: 'fixed', bottom: 16, left: 16, zIndex: 100, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {toasts.filter(t => t.id).slice(-3).map(t => (
          <div key={t.id} className="slide-up" style={{
            background: t.type === 'success' ? 'rgba(16,185,129,0.9)' : t.type === 'error' ? 'rgba(239,68,68,0.9)' : 'rgba(59,130,246,0.9)',
            backdropFilter: 'blur(12px)',
            color: 'white', padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600,
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          }}>
            {t.message}
          </div>
        ))}
      </div>
    </div>
  )
}
