import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'

export interface StockData {
  ticker: string
  price: number
  changePercent: number
  volume: number
  open: number
  high: number
  low: number
  prevClose: number
  companyName: string
  timestamp: string
  anomaly?: {
    type: string
    severity: string
    message: string
  }
}

export interface AlertData {
  id: string
  ticker: string
  message: string
  severity: string
  timestamp: Date
}

const LS_STOCKS = 'marketpulse_stocks'

function loadCachedStocks(): Record<string, StockData> {
  try {
    const saved = localStorage.getItem(LS_STOCKS)
    if (saved) return JSON.parse(saved)
  } catch { }
  return {}
}

export function useStockWebSocket(tickers: string[]) {
  const [stockData, setStockData] = useState<Record<string, StockData>>(loadCachedStocks)
  const [connected, setConnected] = useState(false)
  const [reconnecting] = useState(false)
  const [alerts, setAlerts] = useState<AlertData[]>([])

  const addAlert = useCallback((ticker: string, message: string, severity: string) => {
    const newAlert: AlertData = {
      id: Date.now().toString() + Math.random(),
      ticker,
      message,
      severity,
      timestamp: new Date(),
    }
    setAlerts(prev => [newAlert, ...prev].slice(0, 20))
  }, [])

  const dismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }, [])

  useEffect(() => {
    if (tickers.length === 0) return
    const base = import.meta.env.VITE_API_BASE_URL || ''
    let cancelled = false

    const poll = async () => {
      try {
        const res = await axios.post(`${base}/api/stock/poll`, { tickers })
        const msg = res.data
        if (msg.type === 'stock_update' && Array.isArray(msg.data)) {
          const update: Record<string, StockData> = {}
          for (const item of msg.data) {
            update[item.ticker] = item
            if (item.anomaly) {
              addAlert(item.ticker, item.anomaly.message, item.anomaly.severity)
            }
          }
          if (!cancelled) {
            setStockData(prev => {
              const next = { ...prev, ...update }
              localStorage.setItem(LS_STOCKS, JSON.stringify(next))
              return next
            })
            setConnected(true)
          }
        }
      } catch {
        if (!cancelled) setConnected(false)
      }
    }

    poll()
    const interval = setInterval(poll, 2000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [tickers, addAlert])

  return { stockData, connected, reconnecting, alerts, addAlert, dismissAlert }
}
