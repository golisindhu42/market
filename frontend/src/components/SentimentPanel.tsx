import { useState, useEffect, useCallback } from 'react'
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

  const fetchSentiments = useCallback(async () => {
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
      setError('Failed to fetch sentiment')
    }
    setLoading(false)
  }, [tickers])

  useEffect(() => { fetchSentiments() }, [fetchSentiments])

  const getScoreInfo = (score: number) => {
    if (score < 25) return { color: 'text-red-500', bar: 'bg-red-500', label: 'Bearish', icon: TrendingDown }
    if (score < 45) return { color: 'text-orange-400', bar: 'bg-orange-500', label: 'Slightly Bearish', icon: TrendingDown }
    if (score < 55) return { color: 'text-yellow-400', bar: 'bg-yellow-500', label: 'Neutral', icon: Minus }
    if (score < 75) return { color: 'text-lime-400', bar: 'bg-lime-500', label: 'Slightly Bullish', icon: TrendingUp }
    return { color: 'text-green-500', bar: 'bg-green-500', label: 'Bullish', icon: TrendingUp }
  }

  const lastTicker = tickers[tickers.length - 1]
  const lastSentiment = lastTicker ? sentiments[lastTicker] : null

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Newspaper size={11} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Sentiment</h3>
            <p className="text-[9px] text-gray-600 font-medium uppercase tracking-wider leading-none">News analysis</p>
          </div>
        </div>
        <button onClick={fetchSentiments} disabled={loading} className="text-gray-600 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/[0.04]">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && <p className="text-red-400 text-[11px] mb-3 bg-red-500/8 border border-red-500/15 rounded-lg px-3 py-2">{error}</p>}

      <div className="space-y-3 mb-4">
        {tickers.map((t, i) => {
          const s = sentiments[t]
          const info = s ? getScoreInfo(s.score) : null
          const Icon = info?.icon || Minus
          return (
            <div key={t} className="fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Icon size={10} className={info?.color || 'text-gray-600'} />
                  <span className="text-xs font-semibold text-gray-300">{t}</span>
                </div>
                <span className={`text-[10px] font-semibold ${info?.color || 'text-gray-600'}`}>
                  {s ? `${s.score}` : '---'}
                  {info && <span className="font-normal text-gray-600 ml-1">{info.label}</span>}
                </span>
              </div>
              <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${info?.bar || 'bg-gray-700'}`}
                  style={{ width: `${s ? s.score : 0}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {lastSentiment && lastSentiment.headlines.length > 0 && (
        <div className="pt-3.5 border-t border-white/[0.04]">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="w-0.5 h-3 rounded-full bg-blue-500/50" />
            <h4 className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Latest headlines</h4>
          </div>
          <div className="space-y-2">
            {lastSentiment.headlines.slice(0, 3).map((h, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-gray-500 bg-white/[0.02] rounded-lg p-2.5 leading-relaxed border border-white/[0.03]">
                <span className="w-0.5 h-0.5 rounded-full bg-blue-400/60 mt-2 shrink-0" />
                <span className="line-clamp-2">{h}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
