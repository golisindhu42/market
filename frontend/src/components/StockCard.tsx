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
  const priceEl = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (data.price > prevPrice.current) {
      setFlash('green')
    } else if (data.price < prevPrice.current) {
      setFlash('red')
    }
    prevPrice.current = data.price
    const t = setTimeout(() => setFlash(null), 600)
    return () => clearTimeout(t)
  }, [data.price])

  const isPositive = data.changePercent >= 0
  const changeColor = isPositive ? 'text-green-500' : 'text-red-500'
  const changeBg = isPositive ? 'bg-green-500/10' : 'bg-red-500/10'
  return (
    <div
      className="glass-card rounded-xl p-4 relative overflow-hidden group"
      style={{
        background: flash
          ? `linear-gradient(135deg, rgba(255,255,255,0.03), ${flash === 'green' ? 'rgba(34,197,94,0.04)' : 'rgba(239,68,68,0.04)'})`
          : undefined,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {data.anomaly && (
        <div className="absolute top-0 right-0 flex items-center gap-1 bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg shadow-lg z-10">
          <AlertTriangle size={9} />
          ANOMALY
        </div>
      )}

      <div className="flex items-start justify-between mb-3 relative z-0">
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full shadow-lg ${isPositive ? 'bg-green-500 shadow-green-500/40' : 'bg-red-500 shadow-red-500/40'}`} />
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight leading-none">{data.ticker}</h3>
            <p className="text-[10px] text-gray-500 font-medium mt-0.5 truncate max-w-[140px]">{data.companyName}</p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 ${changeBg} rounded-full px-2 py-0.5`}>
          {isPositive ? <TrendingUp size={11} className="text-green-500" /> : <TrendingDown size={11} className="text-red-500" />}
          <span className={`text-[11px] font-bold tabular-nums ${changeColor}`}>
            {isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-3">
        <span
          ref={priceEl}
          className="text-2xl font-bold text-white tracking-tight tabular-nums font-['JetBrains_Mono']"
          style={{
            animation: flash ? 'numberChange 0.3s ease-out' : undefined,
            color: flash === 'green' ? '#22c55e' : flash === 'red' ? '#ef4444' : undefined,
            transition: 'color 0.3s ease',
          }}
        >
          ${data.price.toFixed(2)}
        </span>
        <span className={`text-xs font-medium ${changeColor}`}>
          {isPositive ? '▲' : '▼'} ${Math.abs(data.changePercent * data.price / 100).toFixed(2)}
        </span>
      </div>

      <div className="flex items-center gap-3 text-[10px] text-gray-500 font-medium mb-3">
        <span className="flex items-center gap-1">
          <BarChart3 size={10} />
          Vol {(data.volume / 1e6).toFixed(1)}M
        </span>
        <span>O ${data.open.toFixed(2)}</span>
        <span>H ${data.high.toFixed(2)}</span>
        <span>L ${data.low.toFixed(2)}</span>
      </div>

      <div className="relative pt-2.5 border-t border-white/[0.04]">
        <SparklineChart data={history} />
      </div>
    </div>
  )
})
