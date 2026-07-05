import { useState, useEffect } from 'react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts'
import axios from 'axios'

interface Props {
  tickers: string[]
  onClose: () => void
}

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16']

export default function CompetitorRadar({ tickers, onClose }: Props) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRadar = async () => {
      if (tickers.length < 2) return
      setLoading(true)
      try {
        const base = import.meta.env.VITE_API_BASE_URL || ''
        const res = await axios.get(`${base}/api/tickers/compare?tickers=${tickers.join(',')}`)
        const tickerData = res.data.tickers
        const dimensions = ['Momentum', 'Sentiment', 'Volume Activity', 'Volatility', '52W Performance']
        const rows = dimensions.map(dim => {
          const entry: any = { dimension: dim }
          tickerData.forEach((td: any) => {
            let val = 50
            switch (dim) {
              case 'Momentum':
                val = Math.min(100, Math.max(0, (td.changePercent + 10) * 5))
                break
              case 'Sentiment':
                val = td.sentiment || 50
                break
              case 'Volume Activity':
                val = Math.min(100, (td.volume / 1000000) * 10)
                break
              case 'Volatility':
                val = 80 - Math.min(60, Math.abs(td.changePercent) * 5)
                break
              case '52W Performance':
                val = Math.min(100, Math.max(0, ((td.price - td.low) / (td.high - td.low || 1)) * 100))
                break
            }
            entry[td.ticker] = Math.round(val)
          })
          return entry
        })
        setData(rows)
      } catch {
        setData([])
      }
      setLoading(false)
    }
    fetchRadar()
  }, [tickers])

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-[#12121e] border border-gray-800 rounded-xl p-6" onClick={e => e.stopPropagation()}>
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#12121e] border border-gray-800 rounded-xl p-6 w-[600px] max-w-[90vw]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">Competitor Comparison</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">&times;</button>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={data}>
            <PolarGrid stroke="#333" />
            <PolarAngleAxis dataKey="dimension" tick={{ fill: '#999', fontSize: 11 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#666', fontSize: 10 }} />
            {tickers.map((t, i) => (
              <Radar key={t} name={t} dataKey={t} stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.1} />
            ))}
            <Legend wrapperStyle={{ fontSize: 12, color: '#999' }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
