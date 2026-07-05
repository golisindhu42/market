import { useState, useEffect } from 'react'
import { RefreshCw, Newspaper, TrendingUp, TrendingDown, Minus } from 'lucide-react'
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

  const getScoreInfo = (score: number) => {
    if (score < 30) return { color: 'from-red-500 to-red-600', bg: 'bg-red-500', text: 'text-red-400', label: 'Bearish', icon: TrendingDown }
    if (score < 45) return { color: 'from-orange-500 to-red-500', bg: 'bg-orange-500', text: 'text-orange-400', label: 'Slightly Bearish', icon: TrendingDown }
    if (score < 55) return { color: 'from-yellow-500 to-yellow-600', bg: 'bg-yellow-500', text: 'text-yellow-400', label: 'Neutral', icon: Minus }
    if (score < 70) return { color: 'from-lime-500 to-green-500', bg: 'bg-lime-500', text: 'text-lime-400', label: 'Slightly Bullish', icon: TrendingUp }
    return { color: 'from-green-500 to-emerald-600', bg: 'bg-green-500', text: 'text-green-400', label: 'Bullish', icon: TrendingUp }
  }

  const lastTicker = tickers[tickers.length - 1]
  const lastSentiment = lastTicker ? sentiments[lastTicker] : null

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Newspaper size={14} className="text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Sentiment</h3>
        </div>
        <button onClick={fetchSentiments} disabled={loading} className="text-gray-600 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && <p className="text-red-400 text-xs mb-3 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

      {loading && Object.keys(sentiments).length === 0 && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      <div className="space-y-3 mb-4">
        {tickers.map(t => {
          const s = sentiments[t]
          const info = s ? getScoreInfo(s.score) : null
          const Icon = info?.icon || Minus
          return (
            <div key={t} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-300">{t}</span>
                  {info && <Icon size={10} className={info.text} />}
                </div>
                <span className={`text-[11px] font-medium ${info?.text || 'text-gray-600'}`}>
                  {s ? `${s.score} · ${info?.label || s.label}` : '---'}
                </span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${info?.bg || 'bg-gray-700'}`}
                  style={{ width: `${s ? s.score : 0}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {lastSentiment && lastSentiment.headlines.length > 0 && (
        <div className="pt-3 border-t border-white/5">
          <h4 className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider mb-3">Latest Headlines</h4>
          <div className="space-y-2">
            {lastSentiment.headlines.slice(0, 3).map((h, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-gray-500 bg-white/[0.03] rounded-lg p-2.5 leading-relaxed">
                <span className="w-1 h-1 rounded-full bg-blue-500/50 mt-1.5 shrink-0" />
                <span className="line-clamp-2">{h}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
