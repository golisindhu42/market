import { LineChart, Line } from 'recharts'

interface Props {
  data: { date: string; price: number }[]
}

export default function SparklineChart({ data }: Props) {
  if (!data || data.length < 2) return null

  const first = data[0].price
  const last = data[data.length - 1].price
  const color = last >= first ? '#22c55e' : '#ef4444'

  return (
    <LineChart width={200} height={60} data={data}>
      <Line type="monotone" dataKey="price" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
    </LineChart>
  )
}
