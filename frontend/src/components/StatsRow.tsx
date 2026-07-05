import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Activity,BrainCircuit } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'

interface Props {
  totalValue: number
  totalChange: number
  sentimentAvg: number
  aiConfidence: number
  stockCount: number
}

function AnimatedNumber({ value, prefix = '', decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [display, setDisplay] = useState(value)
  const displayRef = useRef(display)
  displayRef.current = display
  useEffect(() => {
    const start = displayRef.current
    const diff = value - start
    if (Math.abs(diff) < 0.01) { setDisplay(value); return }
    const duration = 800
    const startTime = Date.now()
    let frame: number
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(start + diff * eased)
      if (progress < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [value])
  return (
    <span>{prefix}{display.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</span>
  )
}

const sparkData = Array.from({ length: 30 }, (_, i) => ({ v: 50 + Math.sin(i * 0.5) * 15 + Math.random() * 10 }))

const cards = [
  { key: 'value', label: 'Portfolio Value', gradient: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.1))', borderColor: 'var(--blue)' },
  { key: 'change', label: "Today's P&L", gradient: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(59,130,246,0.1))', borderColor: 'var(--emerald)' },
  { key: 'sentiment', label: 'Market Sentiment', gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.1))', borderColor: 'var(--amber)' },
  { key: 'confidence', label: 'AI Confidence', gradient: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(59,130,246,0.1))', borderColor: 'var(--purple)' },
]

export default function StatsRow({ totalValue, totalChange, sentimentAvg, aiConfidence, stockCount }: Props) {
  const stats = {
    value: { value: totalValue, prefix: '$', decimals: 0 },
    change: { value: totalChange, prefix: '', suffix: '%', decimals: 2 },
    sentiment: { value: sentimentAvg, prefix: '', decimals: 0 },
    confidence: { value: aiConfidence, prefix: '', suffix: '%', decimals: 0 },
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
      {cards.map((card, i) => {
        const s = stats[card.key as keyof typeof stats]
        const isPositive = card.key === 'change' ? totalChange >= 0 : sentimentAvg >= 50
        const isConfidence = card.key === 'confidence'

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="gradient-border"
            style={{
              background: card.gradient,
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: 16,
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.25s ease, transform 0.2s ease',
            }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.3px', textTransform: 'uppercase', marginBottom: 4 }}>{card.label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', letterSpacing: '-0.5px' }}>
                  <AnimatedNumber {...s} />
                </div>
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: isConfidence ? 'var(--purple-dim)' : isPositive ? 'var(--emerald-dim)' : 'var(--red-dim)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {card.key === 'value' && <TrendingUp size={16} style={{ color: 'var(--blue)' }} />}
                {card.key === 'change' && (totalChange >= 0 ? <TrendingUp size={16} style={{ color: 'var(--green)' }} /> : <TrendingDown size={16} style={{ color: 'var(--red)' }} />)}
                {card.key === 'sentiment' && <Activity size={16} style={{ color: 'var(--amber)' }} />}
                {card.key === 'confidence' && <BrainCircuit size={16} style={{ color: 'var(--purple)' }} />}
              </div>
            </div>

            <div style={{ height: 40, marginTop: -4 }}>
              <ResponsiveContainer width="100%" height={40}>
                <AreaChart data={sparkData}>
                  <defs>
                    <linearGradient id={`spark-${card.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={card.borderColor} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={card.borderColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke={card.borderColor} strokeWidth={1.5} fill={`url(#spark-${card.key})`} dot={false} isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>
              {stockCount} assets tracked
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
