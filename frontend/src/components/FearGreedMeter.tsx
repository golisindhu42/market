interface Props {
  sentimentAvg: number
  priceChangeAvg: number
  volumeDeviation: number
}

export default function FearGreedMeter({ sentimentAvg, priceChangeAvg, volumeDeviation }: Props) {
  const score = Math.round(
    (sentimentAvg * 0.4) +
    (Math.min(Math.abs(priceChangeAvg) * 10, 100) * 0.3) +
    (Math.min(volumeDeviation * 50, 100) * 0.3)
  )
  const clamped = Math.max(0, Math.min(100, score))

  const getLabel = (s: number) => {
    if (s <= 20) return { text: 'Extreme Fear', color: '#dc2626' }
    if (s <= 40) return { text: 'Fear', color: '#ea580c' }
    if (s <= 60) return { text: 'Neutral', color: '#eab308' }
    if (s <= 80) return { text: 'Greed', color: '#22c55e' }
    return { text: 'Extreme Greed', color: '#16a34a' }
  }

  const label = getLabel(clamped)
  const angle = (clamped / 100) * 180 - 90

  const toRad = (deg: number) => (deg * Math.PI) / 180
  const cx = 100
  const cy = 100
  const r = 80

  const polarToCart = (deg: number) => ({
    x: cx + r * Math.cos(toRad(deg)),
    y: cy + r * Math.sin(toRad(deg)),
  })

  const zones = [
    { from: -90, to: -54, color: '#dc2626' },
    { from: -54, to: -18, color: '#ea580c' },
    { from: -18, to: 18, color: '#eab308' },
    { from: 18, to: 54, color: '#22c55e' },
    { from: 54, to: 90, color: '#16a34a' },
  ]

  const describeArc = (from: number, to: number) => {
    const f = polarToCart(from)
    const t = polarToCart(to)
    const large = to - from > 180 ? 1 : 0
    return `M ${f.x} ${f.y} A ${r} ${r} 0 ${large} 1 ${t.x} ${t.y}`
  }

  const needleLen = 65
  const needleX = cx + needleLen * Math.cos(toRad(angle))
  const needleY = cy + needleLen * Math.sin(toRad(angle))

  return (
    <div className="bg-[#12121e] border border-gray-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-400 mb-2">Fear & Greed</h3>
      <div className="flex flex-col items-center">
        <svg width="200" height="130" viewBox="0 0 200 130">
          {zones.map((z, i) => (
            <path key={i} d={describeArc(z.from, z.to)} fill="none" stroke={z.color} strokeWidth="12" strokeLinecap="butt" opacity={0.6} />
          ))}
          <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="white" strokeWidth="2" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r="4" fill="white" />
        </svg>
        <div className="text-3xl font-bold text-white -mt-2">{clamped}</div>
        <div className="text-sm font-semibold" style={{ color: label.color }}>{label.text}</div>
      </div>
    </div>
  )
}
