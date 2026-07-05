import { AreaChart, Area, ResponsiveContainer } from 'recharts'

interface Props {
  data: { date: string; price: number }[]
}

export default function SparklineChart({ data }: Props) {
  if (!data || data.length < 2) return null

  const first = data[0].price
  const last = data[data.length - 1].price
  const isUp = last >= first
  const color = isUp ? '#22c55e' : '#ef4444'

  return (
    <ResponsiveContainer width="100%" height={48}>
      <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`grad-${isUp ? 'up' : 'down'}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.2} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="price"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#grad-${isUp ? 'up' : 'down'})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
