import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts'

interface Props {
  data: { date: string; price: number }[]
}

export default function SparklineChart({ data }: Props) {
  if (!data || data.length < 2) return null

  const first = data[0].price
  const last = data[data.length - 1].price
  const isUp = last >= first
  const color = isUp ? '#22c55e' : '#ef4444'
  const min = Math.min(...data.map(d => d.price))
  const max = Math.max(...data.map(d => d.price))
  const padding = (max - min) * 0.15 || 1

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={44}>
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`spark-grad-${isUp ? 'up' : 'down'}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis domain={[min - padding, max + padding]} hide />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#spark-grad-${isUp ? 'up' : 'down'})`}
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
