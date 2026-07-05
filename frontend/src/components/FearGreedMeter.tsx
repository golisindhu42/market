interface Props {
  sentimentAvg: number
  priceChangeAvg: number
  volumeDeviation: number
}

export default function FearGreedMeter({ sentimentAvg, priceChangeAvg, volumeDeviation }: Props) {
  const displayValue = Math.min(100, Math.max(0, sentimentAvg))

  const getBand = (v: number) => {
    if (v < 20) return { label: 'Extreme Fear', color: 'var(--red)' }
    if (v < 40) return { label: 'Fear', color: '#ff9100' }
    if (v < 60) return { label: 'Neutral', color: '#ffc400' }
    if (v < 80) return { label: 'Greed', color: '#69f0ae' }
    return { label: 'Extreme Greed', color: 'var(--green)' }
  }

  const band = getBand(displayValue)
  const radius = 48
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (displayValue / 100) * circumference
  const half = 56

  const metrics = [
    { label: 'Price Δ', value: `${priceChangeAvg >= 0 ? '+' : ''}${priceChangeAvg.toFixed(1)}%`, color: priceChangeAvg >= 0 ? 'var(--green)' : 'var(--red)' },
    { label: 'Volatility', value: `${(volumeDeviation * 100).toFixed(0)}%`, color: 'var(--blue)' },
  ]

  return (
    <div className="terminal-card p-3">
      <div className="text-xs font-semibold text-white mb-3">Fear & Greed</div>

      <div className="flex items-center justify-center mb-3" style={{ position: 'relative' }}>
        <svg width={half * 2} height={half * 2} viewBox={`0 0 ${half * 2} ${half * 2}`}>
          <circle cx={half} cy={half} r={radius} fill="none" stroke="var(--bg-secondary)" strokeWidth={6} />
          <circle
            cx={half} cy={half} r={radius}
            fill="none"
            stroke={band.color}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${half} ${half})`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span className="text-2xl font-bold mono text-white">{Math.round(displayValue)}</span>
          <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: band.color }}>{band.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {metrics.map(m => (
          <div key={m.label} className="text-center p-2 rounded-sm" style={{ background: 'var(--bg-secondary)' }}>
            <div className="text-[9px] text-muted font-semibold uppercase tracking-wider">{m.label}</div>
            <div className="text-sm font-bold mono" style={{ color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
