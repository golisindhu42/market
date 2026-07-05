import { useState, useEffect } from 'react'
import axios from 'axios'

interface IndexData {
  symbol: string
  price: number
  changePercent: number
}

const DEFAULT_INDICES: IndexData[] = [
  { symbol: 'SPY', price: 0, changePercent: 0 },
  { symbol: 'QQQ', price: 0, changePercent: 0 },
  { symbol: 'DIA', price: 0, changePercent: 0 },
  { symbol: 'IWM', price: 0, changePercent: 0 },
]

export default function MarketTicker() {
  const [indices, setIndices] = useState<IndexData[]>(DEFAULT_INDICES)

  useEffect(() => {
    const fetchIndices = async () => {
      const base = import.meta.env.VITE_API_BASE_URL || ''
      const results = [...DEFAULT_INDICES]
      for (let i = 0; i < results.length; i++) {
        try {
          const res = await axios.get(`${base}/api/stock/${results[i].symbol}`)
          results[i] = {
            symbol: res.data.ticker,
            price: res.data.price,
            changePercent: res.data.changePercent,
          }
        } catch {}
      }
      setIndices(results)
    }
    fetchIndices()
    const interval = setInterval(fetchIndices, 15000)
    return () => clearInterval(interval)
  }, [])

  const tickerItems = [...indices, ...indices]

  return (
    <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-primary)', height: 30, overflow: 'hidden' }}>
      <div style={{
        display: 'inline-flex',
        gap: 32,
        animation: 'tickerScroll 35s linear infinite',
        height: '100%',
        alignItems: 'center',
        paddingLeft: 16,
      }}>
        {tickerItems.map((idx, i) => (
          <div key={`${idx.symbol}-${i}`} className="flex items-center gap-2" style={{ fontSize: 11 }}>
            <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{idx.symbol}</span>
            <span className="font-bold mono text-white">
              {idx.price > 0 ? idx.price.toFixed(2) : '---'}
            </span>
            {idx.price > 0 && (
              <span className={`font-semibold mono ${idx.changePercent >= 0 ? 'text-green' : 'text-red'}`}>
                {idx.changePercent >= 0 ? '+' : ''}{idx.changePercent.toFixed(2)}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
