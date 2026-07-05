import { useEffect, useState } from 'react'
import { X, BarChart3, TrendingUp, TrendingDown } from 'lucide-react'
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
        } catch { }
      }
      setData(results)
    }
    fetchAll()
  }, [tickers])

  if (data.length === 0) return null

  const maxPrice = Math.max(...data.map(d => d.price))

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass-card rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-blue-400" />
            <h2 className="text-base font-bold text-white">Competitor Radar</h2>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
            <X size={18} />
          </button>
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
                    <span className="text-[11px] text-gray-600">${d.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isPositive ? <TrendingUp size={13} className="text-green-500" /> : <TrendingDown size={13} className="text-red-500" />}
                    <span className={`text-xs font-bold tabular-nums ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {isPositive ? '+' : ''}{d.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-gray-600">
                  <span>Vol: {(d.volume / 1e6).toFixed(1)}M</span>
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
