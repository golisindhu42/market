import { motion } from 'framer-motion'
import { Gauge } from 'lucide-react'

interface Props {
  sentimentAvg: number
  priceChangeAvg: number
}

export default function FearGreedIndex({ sentimentAvg, priceChangeAvg }: Props) {
  const value = Math.min(100, Math.max(0, sentimentAvg))

  const getBand = (v: number) => {
    if (v < 20) return { label: 'Extreme Fear', color: '#EF4444' }
    if (v < 40) return { label: 'Fear', color: '#F97316' }
    if (v < 60) return { label: 'Neutral', color: '#FACC15' }
    if (v < 80) return { label: 'Greed', color: '#22C55E' }
    return { label: 'Extreme Greed', color: '#10B981' }
  }

  const band = getBand(value)
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.4 }}
      className="glass-card"
      style={{ padding: 16, borderRadius: 'var(--radius-md)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Gauge size={14} style={{ color: 'var(--purple)' }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Fear & Greed Index</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: 12 }}>
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
          <motion.circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke={band.color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 80 80)"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ filter: `drop-shadow(0 0 8px ${band.color}40)` }}
          />
          <motion.circle
            cx="80" cy="80" r={4}
            fill={band.color}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          />
        </svg>
        <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <motion.span
            className="mono"
            style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)' }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          >
            {Math.round(value)}
          </motion.span>
          <span style={{ fontSize: 10, fontWeight: 700, color: band.color, letterSpacing: '0.5px', textTransform: 'uppercase', marginTop: 2 }}>
            {band.label}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ background: 'var(--bg-card)', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 4 }}>Price Δ</div>
          <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: priceChangeAvg >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {priceChangeAvg >= 0 ? '+' : ''}{priceChangeAvg.toFixed(2)}%
          </div>
        </div>
        <div style={{ background: 'var(--bg-card)', borderRadius: 8, padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: 4 }}>Signal</div>
          <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: band.color }}>
            {band.label.split(' ')[0]}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
