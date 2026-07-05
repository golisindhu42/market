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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 fade-in" onClick={onClose}>
      <div className="glass-card rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto scale-in" onClick={e => e.stopPropagation()} style={{ background: 'rgba(12, 19, 34, 0.96)' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <BarChart3 size={13} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Competitor Radar</h2>
              <p className="text-[10px] text-gray-600 font-medium uppercase tracking-wider">Side-by-side comparison</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-600 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/[0.04]">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-5">
          {data.map((d, i) => {
            const isPositive = d.changePercent >= 0
            const barWidth = (d.price / maxPrice) * 100
            return (
              <div key={d.ticker} className="fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full shadow-lg ${isPositive ? 'bg-green-500 shadow-green-500/40' : 'bg-red-500 shadow-red-500/40'}`} />
                    <span className="text-sm font-bold text-white">{d.ticker}</span>
                    <span className="text-xs text-gray-500 font-mono tabular-nums">${d.price.toFixed(2)}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${isPositive ? 'bg-green-500/10' : 'bg-red-500/10'} rounded-full px-2.5 py-0.5`}>
                    {isPositive ? <TrendingUp size={11} className="text-green-500" /> : <TrendingDown size={11} className="text-red-500" />}
                    <span className={`text-xs font-bold tabular-nums ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {isPositive ? '+' : ''}{d.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5 text-[10px] text-gray-600 font-medium">
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
