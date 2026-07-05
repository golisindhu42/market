import { memo, useEffect, useRef, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import type { StockData } from '../hooks/useStockWebSocket'
import SparklineChart from './SparklineChart'

interface Props {
  data: StockData
  history: { date: string; price: number }[]
}

export default memo(function StockCard({ data, history }: Props) {
  const [flashUp, setFlashUp] = useState(false)
  const [flashDown, setFlashDown] = useState(false)
  const prevPrice = useRef(data.price)

  useEffect(() => {
    if (data.price > prevPrice.current) {
      setFlashUp(true)
    } else if (data.price < prevPrice.current) {
      setFlashDown(true)
    }
    prevPrice.current = data.price
    const t = setTimeout(() => { setFlashUp(false); setFlashDown(false) }, 400)
    return () => clearTimeout(t)
  }, [data.price])

  const isPositive = data.changePercent >= 0
  const changeDollar = data.price - data.prevClose
  const isAnomaly = data.anomaly?.type === 'price_spike' || data.anomaly?.type === 'volume_spike'

  return (
    <div
      className="terminal-card"
      style={{
        borderLeft: `3px solid ${isPositive ? 'var(--green)' : 'var(--red)'}`,
        borderRadius: '0 var(--radius-md) var(--radius-md) 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {(flashUp || flashDown) && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: flashUp ? 'rgba(0,200,83,0.04)' : 'rgba(255,23,68,0.04)',
            pointerEvents: 'none',
            animation: 'priceFlash 0.4s ease-out',
          }}
        />
      )}

      {isAnomaly && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            background: 'linear-gradient(135deg, #ff8f00, #ff6d00)',
            color: 'white',
            fontSize: 9,
            fontWeight: 700,
            padding: '1px 8px',
            borderBottomLeftRadius: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            zIndex: 2,
          }}
        >
          <AlertTriangle size={8} />
          ALERT
        </div>
      )}

      <div className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: isPositive ? 'var(--green)' : 'var(--red)',
                boxShadow: `0 0 6px ${isPositive ? 'var(--green-glow)' : 'var(--red-glow)'}`,
              }}
            />
            <div>
              <div className="text-sm font-bold text-white tracking-tight">{data.ticker}</div>
              <div className="text-[10px] text-muted leading-none mt-0.5 truncate" style={{ maxWidth: 120 }}>{data.companyName}</div>
            </div>
          </div>
          <div
            className="text-[11px] font-semibold mono px-1.5 py-0.5 rounded-sm"
            style={{
              background: isPositive ? 'var(--green-dim)' : 'var(--red-dim)',
              color: isPositive ? 'var(--green)' : 'var(--red)',
            }}
          >
            {isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-2.5">
          <span className="text-xl font-bold mono text-white" style={{ letterSpacing: '-0.5px' }}>
            ${data.price.toFixed(2)}
          </span>
          <span className={`text-xs mono ${isPositive ? 'text-green' : 'text-red'}`}>
            {isPositive ? '+' : ''}{changeDollar.toFixed(2)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-2.5 text-[10px]">
          <div className="flex justify-between">
            <span className="text-muted">Open</span>
            <span className="mono text-secondary">${data.open.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Prev Close</span>
            <span className="mono text-secondary">${data.prevClose.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">High</span>
            <span className="mono text-secondary">${data.high.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Low</span>
            <span className="mono text-secondary">${data.low.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Volume</span>
            <span className="mono text-secondary">{(data.volume / 1e6).toFixed(1)}M</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Range</span>
            <span className="mono text-secondary">${(data.high - data.low).toFixed(2)}</span>
          </div>
        </div>

        {history.length >= 2 && (
          <div style={{ marginTop: 4, paddingTop: 8, borderTop: '1px solid var(--border-primary)' }}>
            <SparklineChart data={history} />
          </div>
        )}
      </div>
    </div>
  )
})
