import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import axios from 'axios'
import type { StockData } from '../hooks/useStockWebSocket'

interface Props {
  tickers: string[]
  onClose: () => void
}

export default function CompetitorRadar({ tickers, onClose }: Props) {
  const [data, setData] = useState<StockData[]>([])

  useEffect(() => {
    const fetchAll = async () => {
      const base = import.meta.env.VITE_API_BASE_URL || ''
      const results: StockData[] = []
      for (const t of tickers) {
        try {
          const res = await axios.get(`${base}/api/stock/${t}`)
          results.push(res.data)
        } catch {}
      }
      setData(results)
    }
    fetchAll()
  }, [tickers])

  if (data.length === 0) return null

  const maxPrice = Math.max(...data.map(d => d.price))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 fade-in" style={{ background: 'rgba(0,0,0,0.65)' }} onClick={onClose}>
      <div className="terminal-card p-5 w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-secondary)' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-base font-bold text-white">Competitor Radar</div>
            <div className="text-xs text-muted">Side-by-side comparison</div>
          </div>
          <button onClick={onClose} className="terminal-btn-outline text-xs px-2 py-1">Close</button>
        </div>

        <div className="space-y-4">
          {data.map(d => {
            const isPositive = d.changePercent >= 0
            const barWidth = (d.price / maxPrice) * 100
            return (
              <div key={d.ticker}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{d.ticker}</span>
                    <span className="text-xs mono text-muted">${d.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {isPositive ? <TrendingUp size={11} className="text-green" /> : <TrendingDown size={11} className="text-red" />}
                    <span className={`text-xs font-bold mono ${isPositive ? 'text-green' : 'text-red'}`}>
                      {isPositive ? '+' : ''}{d.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="h-2 rounded-full" style={{ background: 'var(--bg-primary)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${barWidth}%`, background: isPositive ? 'var(--green)' : 'var(--red)' }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-[10px] mono text-muted">
                  <span>Vol: {(d.volume / 1e6).toFixed(1)}M</span>
                  <span>O: ${d.open.toFixed(2)}</span>
                  <span>H: ${d.high.toFixed(2)}</span>
                  <span>L: ${d.low.toFixed(2)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
