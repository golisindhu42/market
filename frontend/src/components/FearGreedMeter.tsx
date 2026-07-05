import { Gauge, TrendingUp, Activity } from 'lucide-react'

interface Props {
  sentimentAvg: number
  priceChangeAvg: number
  volumeDeviation: number
}

export default function FearGreedMeter({ sentimentAvg, priceChangeAvg, volumeDeviation }: Props) {
  const displayValue = Math.min(100, Math.max(0, sentimentAvg))

  const getBand = (v: number) => {
    if (v < 20) return { label: 'Extreme Fear', color: '#ef4444', glow: 'rgba(239,68,68,0.3)' }
    if (v < 40) return { label: 'Fear', color: '#f97316', glow: 'rgba(249,115,22,0.3)' }
    if (v < 60) return { label: 'Neutral', color: '#eab308', glow: 'rgba(234,179,8,0.3)' }
    if (v < 80) return { label: 'Greed', color: '#22c55e', glow: 'rgba(34,197,94,0.3)' }
    return { label: 'Extreme Greed', color: '#16a34a', glow: 'rgba(22,163,74,0.3)' }
  }

  const band = getBand(displayValue)

  const metrics = [
    {
      icon: TrendingUp,
      label: 'Price Δ',
      value: `${priceChangeAvg >= 0 ? '+' : ''}${priceChangeAvg.toFixed(1)}%`,
      color: priceChangeAvg >= 0 ? 'text-green-500' : 'text-red-500',
    },
    {
      icon: Activity,
      label: 'Volatility',
      value: `${(volumeDeviation * 100).toFixed(0)}%`,
      color: 'text-blue-400',
    },
  ]

  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (displayValue / 100) * circumference

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Gauge size={11} className="text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Fear & Greed</h3>
          <p className="text-[9px] text-gray-600 font-medium uppercase tracking-wider leading-none">Market sentiment</p>
        </div>
      </div>

      <div className="flex items-center justify-center mb-4 relative">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="8" />
          <circle
            cx="70" cy="70" r={radius}
            fill="none"
            stroke={band.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 70 70)"
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 6px ${band.glow})` }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-[28px] font-bold text-white tabular-nums leading-none font-['JetBrains_Mono']">{Math.round(displayValue)}</span>
          <span className="text-[9px] font-bold uppercase tracking-widest mt-1" style={{ color: band.color }}>{band.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {metrics.map(m => {
          const Icon = m.icon
          return (
            <div key={m.label} className="bg-white/[0.03] rounded-lg p-2.5 text-center border border-white/[0.04]">
              <Icon size={12} className={`mx-auto mb-1 ${m.color}`} />
              <p className="text-[9px] text-gray-600 font-semibold uppercase tracking-wider">{m.label}</p>
              <p className={`text-sm font-bold tabular-nums font-['JetBrains_Mono'] ${m.color} leading-none mt-0.5`}>{m.value}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
