import { useState, useEffect } from 'react'
import { RefreshCw, ExternalLink } from 'lucide-react'
import axios from 'axios'

interface SentimentData {
  ticker: string
  score: number
  headlines: string[]
  label: string
}

interface Props {
  tickers: string[]
}

export default function SentimentPanel({ tickers }: Props) {
  const [sentiments, setSentiments] = useState<Record<string, SentimentData>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchSentiments = async () => {
    if (tickers.length === 0) return
    setLoading(true)
    setError('')
    try {
      const base = import.meta.env.VITE_API_BASE_URL || ''
      const results: Record<string, SentimentData> = {}
      for (const t of tickers) {
        const res = await axios.get(`${base}/api/stock/${t}/sentiment`)
        results[t] = res.data
      }
      setSentiments(results)
    } catch {
      setError('Failed to fetch sentiment data')
    }
    setLoading(false)
  }

  useEffect(() => { fetchSentiments() }, [tickers])

  const getBarColor = (score: number) => {
    if (score < 40) return 'bg-red-500'
    if (score < 60) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const lastTicker = tickers[tickers.length - 1]
  const lastSentiment = lastTicker ? sentiments[lastTicker] : null

  return (
    <div className="bg-[#12121e] border border-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-400">Sentiment Scores</h3>
        <button onClick={fetchSentiments} disabled={loading} className="text-gray-500 hover:text-white transition-colors">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
      {loading && Object.keys(sentiments).length === 0 && (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-6 bg-[#1a1a2e] rounded animate-pulse" />
          ))}
        </div>
      )}
      <div className="space-y-2 mb-3">
        {tickers.map(t => {
          const s = sentiments[t]
          return (
            <div key={t}>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{t}</span>
                <span>{s ? `${s.score} - ${s.label}` : '---'}</span>
              </div>
              <div className="h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${s ? getBarColor(s.score) : 'bg-gray-700'}`}
                  style={{ width: `${s ? s.score : 0}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      {lastSentiment && lastSentiment.headlines.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 mb-2">Latest Headlines</h4>
          <div className="space-y-1">
            {lastSentiment.headlines.slice(0, 3).map((h, i) => (
              <div key={i} className="flex items-start gap-1.5 text-xs text-gray-400">
                <ExternalLink size={10} className="mt-0.5 shrink-0" />
                <span className="line-clamp-2">{h}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
