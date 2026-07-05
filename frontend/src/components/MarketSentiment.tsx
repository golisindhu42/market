import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface Props {
  sentiments: { ticker: string; score: number }[]
}

export default function MarketSentiment({ sentiments }: Props) {
  const bullish = sentiments.filter(s => s.score >= 60).length
  const bearish = sentiments.filter(s => s.score <= 40).length
  const neutral = sentiments.length - bullish - bearish
  const total = sentiments.length || 1

  const bars = [
    { label: 'Bullish', value: (bullish / total) * 100, count: bullish, color: 'var(--green)', bg: 'var(--green-dim)', icon: TrendingUp },
    { label: 'Neutral', value: (neutral / total) * 100, count: neutral, color: 'var(--amber)', bg: 'var(--amber-dim)', icon: Minus },
    { label: 'Bearish', value: (bearish / total) * 100, count: bearish, color: 'var(--red)', bg: 'var(--red-dim)', icon: TrendingDown },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="glass-card"
      style={{ padding: 16, borderRadius: 'var(--radius-md)' }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>Market Sentiment</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {bars.map((bar, i) => {
          const Icon = bar.icon
          return (
            <div key={bar.label}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon size={11} style={{ color: bar.color }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{bar.label}</span>
                </div>
                <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: bar.color }}>
                  {bar.count} · {Math.round(bar.value)}%
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-card)', overflow: 'hidden' }}>
                <motion.div
                  style={{ height: '100%', borderRadius: 3, background: bar.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${bar.value}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {sentiments.length > 0 && (
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-dim)' }}>
          <span>Total signals: {sentiments.length}</span>
          <span>Updated real-time</span>
        </div>
      )}
    </motion.div>
  )
}
