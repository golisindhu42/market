import { useState } from 'react'
import { motion } from 'framer-motion'
import { Maximize2, TrendingUp, ZoomIn, ZoomOut, RefreshCw, BarChart3 } from 'lucide-react'
import { Area, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, ComposedChart } from 'recharts'

interface Props {
  data: { time: string; value: number; volume: number }[]
  ticker: string
  onTickerChange: (t: string) => void
  tickers: string[]
}

const RANGES = ['1D', '1W', '1M', '3M', '1Y', 'ALL']

export default function MainChart({ data, ticker, onTickerChange, tickers }: Props) {
  const [range, setRange] = useState('1M')
  const [showVolume, setShowVolume] = useState(true)

  const isUp = data.length >= 2 && data[data.length - 1].value >= data[0].value
  const color = isUp ? 'var(--green)' : 'var(--red)'

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="glass-card-elevated" style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{payload[0]?.payload?.time}</div>
        <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
          ${payload[0]?.value?.toFixed(2)}
        </div>
        {payload[1] && (
          <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
            Vol: {(payload[1].value / 1e6).toFixed(1)}M
          </div>
        )}
      </div>
    )
  }

  const firstVal = data[0]?.value || 0
  const lastVal = data[data.length - 1]?.value || 0
  const changePercent = firstVal > 0 ? ((lastVal - firstVal) / firstVal * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      className="glass-card-elevated"
      style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}
    >
      <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {tickers.slice(0, 6).map(t => (
                <button
                  key={t}
                  onClick={() => onTickerChange(t)}
                  style={{
                    padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                    fontFamily: 'var(--font-mono)',
                    background: ticker === t ? 'var(--blue-dim)' : 'transparent',
                    border: ticker === t ? '1px solid rgba(59,130,246,0.3)' : '1px solid var(--border)',
                    color: ticker === t ? 'var(--blue)' : 'var(--text-muted)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (ticker !== t) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-secondary)' } }}
                  onMouseLeave={e => { if (ticker !== t) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' } }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button onClick={() => setShowVolume(!showVolume)} className="btn-secondary" style={{ padding: '4px 6px', borderRadius: 6 }}>
              <BarChart3 size={12} />
            </button>
            <button className="btn-secondary" style={{ padding: '4px 6px', borderRadius: 6 }}>
              <Maximize2 size={12} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            ${lastVal.toFixed(2)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <TrendingUp size={14} style={{ color: isUp ? 'var(--green)' : 'var(--red)' }} />
            <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-mono)', color: isUp ? 'var(--green)' : 'var(--red)' }}>
              {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
            </span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{ticker}</span>
        </div>

        <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
          {RANGES.map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                padding: '2px 10px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                background: range === r ? 'rgba(255,255,255,0.08)' : 'transparent',
                border: 'none',
                color: range === r ? 'var(--text-primary)' : 'var(--text-dim)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (range !== r) e.currentTarget.style.color = 'var(--text-secondary)' }}
              onMouseLeave={e => { if (range !== r) e.currentTarget.style.color = 'var(--text-dim)' }}
            >
              {r}
            </button>
          ))}
          <span style={{ flex: 1 }} />
          <button className="btn-secondary" style={{ padding: '2px 6px', borderRadius: 4 }}>
            <ZoomIn size={11} />
          </button>
          <button className="btn-secondary" style={{ padding: '2px 6px', borderRadius: 4 }}>
            <ZoomOut size={11} />
          </button>
          <button className="btn-secondary" style={{ padding: '2px 6px', borderRadius: 4 }}>
            <RefreshCw size={11} />
          </button>
        </div>
      </div>

      <div style={{ padding: '0 4px 4px', height: 340 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 16, right: 16, bottom: 8, left: 8 }}>
            <defs>
              <linearGradient id="mainChartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.15} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="time" hide />
            <YAxis yAxisId="price" domain={['dataMin - 5', 'dataMax + 5']} hide />
            <YAxis yAxisId="volume" orientation="right" hide />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
            {showVolume && (
              <Bar yAxisId="volume" dataKey="volume" fill="rgba(255,255,255,0.04)" barSize={data.length > 50 ? 2 : 4} />
            )}
            <Area
              yAxisId="price"
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill="url(#mainChartGrad)"
              dot={false}
              isAnimationActive={false}
              style={{ filter: 'url(#glow)' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}
