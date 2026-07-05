import { memo, useEffect, useRef, useState } from 'react'
import { TrendingUp, TrendingDown, AlertTriangle, BarChart3 } from 'lucide-react'
import type { StockData } from '../hooks/useStockWebSocket'
import SparklineChart from './SparklineChart'

interface Props {
  data: StockData
  history: { date: string; price: number }[]
}

export default memo(function StockCard({ data, history }: Props) {
  const [flash, setFlash] = useState<'green' | 'red' | null>(null)
  const prevPrice = useRef(data.price)

  useEffect(() => {
    if (data.price > prevPrice.current) setFlash('green')
    else if (data.price < prevPrice.current) setFlash('red')
    prevPrice.current = data.price
    const t = setTimeout(() => setFlash(null), 500)
    return () => clearTimeout(t)
  }, [data.price])

  const isPositive = data.changePercent >= 0
  const flashBg = flash === 'green' ? 'rgba(34,197,94,0.08)' : flash === 'red' ? 'rgba(239,68,68,0.08)' : ''

  return (
    <div
      className="glass-card rounded-xl p-4 relative overflow-hidden group"
      style={{ backgroundColor: flashBg || undefined }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/5 to-transparent rounded-bl-full pointer-events-none" />

      {data.anomaly && (
        <div className="absolute -top-1 -right-1 flex items-center gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-lg shadow-lg z-10">
          <AlertTriangle size={10} />
          ALERT
        </div>
      )}

      <div className="flex items-start justify-between mb-3 relative z-0">
        <div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'} shadow-[0_0_6px_${isPositive ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'}]`} />
            <h3 className="text-base font-bold text-white tracking-tight">{data.ticker}</h3>
          </div>
          <p className="text-[11px] text-gray-600 truncate max-w-[160px] ml-4">{data.companyName}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {isPositive ? (
            <TrendingUp size={16} className="text-green-500" />
          ) : (
            <TrendingDown size={16} className="text-red-500" />
          )}
          <span className={`text-sm font-bold tabular-nums ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="flex items-baseline gap-1.5 mb-3">
        <span className="text-2xl font-bold text-white tracking-tight tabular-nums">
          ${data.price.toFixed(2)}
        </span>
        <span className={`text-xs font-medium ${isPositive ? 'text-green-500/70' : 'text-red-500/70'}`}>
          {isPositive ? '▲' : '▼'}
        </span>
      </div>

      <div className="flex items-center gap-3 text-[11px] text-gray-600 mb-3 font-medium">
        <span className="flex items-center gap-1">
          <BarChart3 size={11} />
          Vol {data.volume.toLocaleString()}
        </span>
        <span>H ${data.high.toFixed(2)}</span>
        <span>L ${data.low.toFixed(2)}</span>
      </div>

      <div className="pt-2 border-t border-white/5">
        <SparklineChart data={history} />
      </div>
    </div>
  )
})
