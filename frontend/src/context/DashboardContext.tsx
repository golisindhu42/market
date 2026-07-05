import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react'
import axios from 'axios'
import { useStockWebSocket } from '../hooks/useStockWebSocket'

const LS_TICKERS = 'marketpulse_tickers'
const LS_HISTORY = 'marketpulse_history'
const LS_RECENT = 'marketpulse_recent'

function loadFrom<T>(key: string, fallback: T): T {
  try { const s = localStorage.getItem(key); if (s) return JSON.parse(s) as T } catch {}
  return fallback
}

const DEFAULT_TICKERS = ['TSLA', 'AAPL', 'NVDA', 'MSFT', 'AMZN', 'GOOGL']

interface DashboardContextType {
  tickers: string[]
  setTickers: React.Dispatch<React.SetStateAction<string[]>>
  addTicker: (t: string) => void
  removeTicker: (t: string) => void
  recentSearches: string[]
  activeTicker: string
  setActiveTicker: React.Dispatch<React.SetStateAction<string>>
  handleTickerClick: (t: string) => void
  timeframe: string
  setTimeframe: React.Dispatch<React.SetStateAction<string>>
  handleTimeframeChange: (tf: string) => Promise<void>
  showAISidebar: boolean
  setShowAISidebar: React.Dispatch<React.SetStateAction<boolean>>
  showNotifications: boolean
  setShowNotifications: React.Dispatch<React.SetStateAction<boolean>>
  showIndicators: boolean
  setShowIndicators: React.Dispatch<React.SetStateAction<boolean>>
  isFullscreen: boolean
  setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>>
  chartZoom: number
  setChartZoom: React.Dispatch<React.SetStateAction<number>>
  chartLoading: boolean
  indicatorConfig: { rsi: boolean; macd: boolean; ema: boolean; sma: boolean; vwap: boolean; bb: boolean }
  setIndicatorConfig: React.Dispatch<React.SetStateAction<{ rsi: boolean; macd: boolean; ema: boolean; sma: boolean; vwap: boolean; bb: boolean }>> 
  stockData: Record<string, any>
  history: Record<string, { date: string; price: number }[]>
  connected: boolean
  alerts: any[]
  dismissAlert: (id: string) => void
  toasts: { id: string; message: string; type: 'success' | 'error' | 'info' }[]
  addToast: (message: string, type: 'success' | 'error' | 'info') => void
  stockList: any[]
  totalChange: number
  totalValue: number
  sentimentAvg: number
  aiConfidence: number
  chartData: any[]
  markAllAlertsRead: () => void
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}

const DashboardContext = createContext<DashboardContextType | null>(null)

export function DashboardProvider({ children }: { children: ReactNode }) {
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
  const totalChange = useMemo(() => stockList.reduce((sum: number, s: any) => sum + (s.changePercent || 0), 0), [stockList])
  const totalValue = useMemo(() => stockList.reduce((sum: number, s: any) => sum + s.price, 0), [stockList])
  const sentimentAvg = useMemo(() => stockList.length > 0
    ? stockList.reduce((sum: number, s: any) => sum + Math.abs(s.changePercent || 0), 0) / stockList.length * 10 + 50
    : 50, [stockList])
  const aiConfidence = useMemo(() => Math.min(95, Math.max(30, stockList.length > 0
    ? stockList.reduce((sum: number, s: any) => sum + Math.abs(s.changePercent || 0), 0) / stockList.length * 15 + 60
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
    alerts.forEach((a: any) => dismissAlert(a.id))
    addToast('All notifications marked as read', 'success')
  }, [alerts, dismissAlert, addToast])

  return (
    <DashboardContext.Provider value={{
      tickers, setTickers, addTicker, removeTicker, recentSearches,
      activeTicker, setActiveTicker, handleTickerClick,
      timeframe, setTimeframe, handleTimeframeChange,
      showAISidebar, setShowAISidebar,
      showNotifications, setShowNotifications,
      showIndicators, setShowIndicators,
      isFullscreen, setIsFullscreen,
      chartZoom, setChartZoom, chartLoading,
      indicatorConfig, setIndicatorConfig,
      stockData, history, connected, alerts, dismissAlert,
      toasts, addToast, stockList, totalChange, totalValue, sentimentAvg, aiConfidence, chartData, markAllAlertsRead,
    }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider')
  return ctx
}
