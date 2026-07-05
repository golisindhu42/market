import { useState, useEffect } from 'react'
import axios from 'axios'

interface IndexData {
  symbol: string
  price: number
  change: number
  changePercent: number
}

const DEFAULT_INDICES: IndexData[] = [
  { symbol: 'SPY', price: 0, change: 0, changePercent: 0 },
  { symbol: 'QQQ', price: 0, change: 0, changePercent: 0 },
  { symbol: 'DIA', price: 0, change: 0, changePercent: 0 },
  { symbol: 'IWM', price: 0, change: 0, changePercent: 0 },
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
            change: res.data.changePercent,
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
    <div className="ticker-tape bg-white/[0.015] border-b border-white/[0.04] h-8">
      <div className="ticker-tape-inner h-full items-center">
        {tickerItems.map((idx, i) => (
          <div key={`${idx.symbol}-${i}`} className="flex items-center gap-2.5 text-[11px]">
            <span className="font-semibold text-gray-400">{idx.symbol}</span>
            <span className="font-bold text-white font-['JetBrains_Mono'] tabular-nums">
              {idx.price > 0 ? idx.price.toFixed(2) : '---'}
            </span>
            {idx.price > 0 && (
              <span className={`font-semibold tabular-nums ${idx.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {idx.change >= 0 ? '+' : ''}{idx.changePercent.toFixed(2)}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
