import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts'

interface Props {
  data: { date: string; price: number }[]
}

export default function SparklineChart({ data }: Props) {
  if (!data || data.length < 2) return null

  const first = data[0].price
  const last = data[data.length - 1].price
  const isUp = last >= first
  const color = isUp ? 'var(--green)' : 'var(--red)'
  const min = Math.min(...data.map(d => d.price))
  const max = Math.max(...data.map(d => d.price))
  const padding = (max - min) * 0.15 || 1

  return (
    <ResponsiveContainer width="100%" height={36}>
      <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`sg-${isUp ? 'u' : 'd'}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.2} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis domain={[min - padding, max + padding]} hide />
        <Area
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#sg-${isUp ? 'u' : 'd'})`}
          dot={false}
          activeDot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
