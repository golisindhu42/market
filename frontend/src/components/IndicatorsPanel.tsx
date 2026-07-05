import { motion } from 'framer-motion'
import { X, TrendingUp, Activity, BarChart3, LineChart, Waves, Circle } from 'lucide-react'

interface Props {
  config: { rsi: boolean; macd: boolean; ema: boolean; sma: boolean; vwap: boolean; bb: boolean }
  onToggle: (key: string) => void
  onClose: () => void
}

const indicators = [
  { key: 'rsi' as const, label: 'RSI', description: 'Relative Strength Index', icon: Activity, color: 'var(--purple)', precision: '14 period' },
  { key: 'macd' as const, label: 'MACD', description: 'Moving Average Convergence Divergence', icon: LineChart, color: 'var(--blue)', precision: '12, 26, 9' },
  { key: 'ema' as const, label: 'EMA', description: 'Exponential Moving Average', icon: TrendingUp, color: 'var(--emerald)', precision: '20 period' },
  { key: 'sma' as const, label: 'SMA', description: 'Simple Moving Average', icon: BarChart3, color: 'var(--amber)', precision: '50 period' },
  { key: 'vwap' as const, label: 'VWAP', description: 'Volume Weighted Average Price', icon: Waves, color: 'var(--text-muted)', precision: '1 day' },
  { key: 'bb' as const, label: 'Bollinger Bands', description: 'Volatility bands', icon: Circle, color: 'var(--purple)', precision: '20, 2' },
]

export default function IndicatorsPanel({ config, onToggle, onClose }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card-elevated"
      style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        zIndex: 70, width: 340, padding: 6, borderRadius: 16,
      }}
    >
      <div style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Chart Indicators</div>
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} title="Close (ESC)" style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 4 }}>
          <X size={16} />
        </motion.button>
      </div>

      <div style={{ padding: '0 4px' }}>
        {indicators.map((ind, i) => {
          const isActive = config[ind.key]
          const Icon = ind.icon
          return (
            <motion.button
              key={ind.key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onToggle(ind.key)}
              title={`Toggle ${ind.label}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '8px 8px',
                background: isActive ? 'rgba(59,130,246,0.06)' : 'transparent',
                border: 'none', borderRadius: 8, cursor: 'pointer',
                transition: 'background 0.15s',
                marginBottom: 2,
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{ width: 28, height: 28, borderRadius: 6, background: `${ind.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={13} style={{ color: ind.color }} />
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{ind.label}</div>
                <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>{ind.description}</div>
              </div>
              <div style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginRight: 4 }}>{ind.precision}</div>
              <motion.div
                animate={{ backgroundColor: isActive ? ind.color : 'rgba(255,255,255,0.06)' }}
                style={{ width: 28, height: 16, borderRadius: 8, padding: 2, display: 'flex', justifyContent: isActive ? 'flex-end' : 'flex-start' }}
              >
                <motion.div layout style={{ width: 12, height: 12, borderRadius: 6, background: 'white' }} />
              </motion.div>
            </motion.button>
          )
        })}
      </div>

      <div style={{ padding: '8px 10px', borderTop: '1px solid var(--border)', marginTop: 4, fontSize: 9, color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
        <span>Enabled: {Object.values(config).filter(Boolean).length}</span>
        <span>ESC to close</span>
      </div>
    </motion.div>
  )
}
