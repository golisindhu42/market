import { Gauge, TrendingUp, Activity } from 'lucide-react'

interface Props {
  sentimentAvg: number
  priceChangeAvg: number
  volumeDeviation: number
}

export default function FearGreedMeter({ sentimentAvg, priceChangeAvg, volumeDeviation }: Props) {
  const displayValue = Math.min(100, Math.max(0, sentimentAvg))
  const getBand = (v: number) => {
    if (v < 20) return { label: 'Extreme Fear', color: '#ef4444', bar: 'bg-red-500' }
    if (v < 40) return { label: 'Fear', color: '#f97316', bar: 'bg-orange-500' }
    if (v < 60) return { label: 'Neutral', color: '#eab308', bar: 'bg-yellow-500' }
    if (v < 80) return { label: 'Greed', color: '#22c55e', bar: 'bg-green-500' }
    return { label: 'Extreme Greed', color: '#16a34a', bar: 'bg-emerald-500' }
  }
  const band = getBand(displayValue)

  const metrics = [
    { icon: TrendingUp, label: 'Price Δ', value: `${priceChangeAvg >= 0 ? '+' : ''}${priceChangeAvg.toFixed(1)}%`, color: priceChangeAvg >= 0 ? 'text-green-500' : 'text-red-500' },
    { icon: Activity, label: 'Volatility', value: `${(volumeDeviation * 100).toFixed(0)}%`, color: 'text-blue-400' },
  ]

  const radius = 60
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (displayValue / 100) * circumference

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Gauge size={14} className="text-blue-400" />
        <h3 className="text-sm font-semibold text-white">Fear & Greed Index</h3>
      </div>

      <div className="flex items-center justify-center mb-4 relative">
        <svg width="150" height="150" viewBox="0 0 150 150">
          <circle cx="75" cy="75" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
          <circle
            cx="75" cy="75" r={radius}
            fill="none"
            stroke={band.color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 75 75)"
            className="transition-all duration-1000 ease-out"
            style={{ filter: `drop-shadow(0 0 8px ${band.color}40)` }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-3xl font-bold text-white tabular-nums">{Math.round(displayValue)}</span>
          <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: band.color }}>{band.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {metrics.map(m => {
          const Icon = m.icon
          return (
            <div key={m.label} className="bg-white/[0.03] rounded-lg p-2.5 text-center border border-white/5">
              <Icon size={13} className={`mx-auto mb-1 ${m.color}`} />
              <p className="text-[10px] text-gray-600 font-medium uppercase tracking-wider">{m.label}</p>
              <p className={`text-sm font-bold ${m.color} tabular-nums`}>{m.value}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
