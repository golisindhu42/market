import { memo, useEffect, useRef, useState } from 'react'
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
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
  const bgFlash = flash === 'green' ? 'rgba(34,197,94,0.15)' : flash === 'red' ? 'rgba(239,68,68,0.15)' : 'transparent'

  return (
    <div
      className="relative bg-[#12121e] border border-gray-800 rounded-xl p-4 transition-colors duration-300"
      style={{ backgroundColor: bgFlash || '#12121e' }}
    >
      {data.anomaly && (
        <div className="absolute -top-2 -right-2 flex items-center gap-1 bg-amber-500 text-black text-xs font-bold px-2 py-0.5 rounded-full animate-pulse-glow">
          <AlertTriangle size={12} />
          ALERT
        </div>
      )}

      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-lg font-bold text-white">{data.ticker}</h3>
          <p className="text-xs text-gray-500 truncate max-w-[180px]">{data.companyName}</p>
        </div>
        <div className="flex items-center gap-1">
          {isPositive ? (
            <TrendingUp size={18} className="text-green-500" />
          ) : (
            <TrendingDown size={18} className="text-red-500" />
          )}
          <span className={`text-sm font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="text-2xl font-bold text-white mb-1">
        ${data.price.toFixed(2)}
      </div>

      <div className="flex gap-4 text-xs text-gray-500 mb-2">
        <span>Vol: {data.volume.toLocaleString()}</span>
        <span>H: ${data.high.toFixed(2)}</span>
        <span>L: ${data.low.toFixed(2)}</span>
      </div>

      <SparklineChart data={history} />
    </div>
  )
})
