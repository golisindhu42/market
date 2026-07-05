import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
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
    if (score < 25) return { color: 'var(--red)', bar: 'var(--red)', label: 'Bearish', icon: TrendingDown }
    if (score < 45) return { color: '#ff9100', bar: '#ff9100', label: 'Slightly Bearish', icon: TrendingDown }
    if (score < 55) return { color: '#ffc400', bar: '#ffc400', label: 'Neutral', icon: Minus }
    if (score < 75) return { color: '#69f0ae', bar: '#69f0ae', label: 'Slightly Bullish', icon: TrendingUp }
    return { color: 'var(--green)', bar: 'var(--green)', label: 'Bullish', icon: TrendingUp }
  }

  const lastTicker = tickers[tickers.length - 1]
  const lastSentiment = lastTicker ? sentiments[lastTicker] : null

  return (
    <div className="terminal-card p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="text-xs font-semibold text-white">Sentiment</div>
          <span className="text-[10px] text-muted">News Analysis</span>
        </div>
        <button onClick={fetchSentiments} disabled={loading} className="terminal-btn-outline text-[10px] px-1.5 py-0.5">
          {loading ? '...' : 'Refresh'}
        </button>
      </div>

      {error && <div className="text-xs px-2 py-1.5 rounded-sm mb-2" style={{ background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid rgba(255,23,68,0.2)' }}>{error}</div>}

      <div className="space-y-2.5 mb-3">
        {tickers.map(t => {
          const s = sentiments[t]
          const info = s ? getScoreInfo(s.score) : null
          const Icon = info?.icon || Minus
          return (
            <div key={t}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  {info && <Icon size={9} style={{ color: info.color }} />}
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{t}</span>
                </div>
                <span className="text-[10px] mono font-semibold" style={{ color: info?.color || 'var(--text-muted)' }}>
                  {s ? `${s.score}` : '--'}
                </span>
              </div>
              <div className="h-1 rounded-full" style={{ background: 'var(--bg-secondary)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${s ? s.score : 0}%`, background: info?.bar || 'var(--bg-elevated)' }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {lastSentiment && lastSentiment.headlines.length > 0 && (
        <div style={{ paddingTop: 8, borderTop: '1px solid var(--border-primary)' }}>
          <div className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">Headlines</div>
          <div className="space-y-1.5">
            {lastSentiment.headlines.slice(0, 3).map((h, i) => (
              <div key={i} className="flex items-start gap-2 text-xs px-2 py-1.5 rounded-sm" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--blue)', marginTop: 5, flexShrink: 0 }} />
                <span className="line-clamp-2">{h}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
