import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Newspaper } from 'lucide-react'
import axios from 'axios'

interface NewsItem {
  ticker: string
  headline: string
  sentiment: 'positive' | 'negative' | 'neutral'
  source: string
  time: string
}

interface Props {
  tickers: string[]
}

const FALLBACK_NEWS: NewsItem[] = [
  { ticker: 'TSLA', headline: 'Tesla Q2 deliveries beat estimates, stock surges pre-market', sentiment: 'positive', source: 'Reuters', time: '2h ago' },
  { ticker: 'AAPL', headline: 'Apple Intelligence features to roll out in September update', sentiment: 'positive', source: 'Bloomberg', time: '3h ago' },
  { ticker: 'NVDA', headline: 'NVIDIA announces new AI chip partnership with major cloud providers', sentiment: 'positive', source: 'CNBC', time: '5h ago' },
  { ticker: 'MSFT', headline: 'Microsoft Cloud revenue grows 22% in latest quarter', sentiment: 'positive', source: 'WSJ', time: '6h ago' },
  { ticker: 'AMZN', headline: 'Amazon Prime Day expected to generate record $14B in sales', sentiment: 'positive', source: 'Bloomberg', time: '8h ago' },
  { ticker: 'GOOGL', headline: 'Google antitrust ruling could reshape search market dynamics', sentiment: 'negative', source: 'Reuters', time: '10h ago' },
]

export default function NewsFeed({ tickers }: Props) {
  const [news, setNews] = useState<NewsItem[]>(FALLBACK_NEWS)
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    const fetchNews = async () => {
      if (tickers.length === 0) return
      setLoading(true)
      try {
        const base = import.meta.env.VITE_API_BASE_URL || ''
        const items: NewsItem[] = []
        for (const t of tickers) {
          try {
            const res = await axios.get(`${base}/api/stock/${t}/sentiment`)
            if (res.data?.headlines?.length) {
              res.data.headlines.slice(0, 2).forEach((h: string) => {
                items.push({
                  ticker: t,
                  headline: h,
                  sentiment: res.data.score >= 60 ? 'positive' : res.data.score <= 40 ? 'negative' : 'neutral',
                  source: 'AI Summary',
                  time: 'Just now',
                })
              })
            }
          } catch {}
        }
        if (items.length > 0) setNews(items.slice(0, 8))
      } catch {}
      setLoading(false)
    }
    fetchNews()
  }, [tickers])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.4 }}
      className="glass-card"
      style={{ padding: 16, borderRadius: 'var(--radius-md)', maxHeight: 320, overflowY: 'auto' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Newspaper size={14} style={{ color: 'var(--blue)' }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>AI News Feed</span>
        {loading && <span className="typing-dot" style={{ marginLeft: 'auto' }} />}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {news.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => setExpanded(expanded === i ? null : i)}
            style={{
              padding: '8px 10px',
              borderRadius: 8,
              background: expanded === i ? 'var(--bg-card)' : 'transparent',
              cursor: 'pointer', transition: 'background 0.15s',
              border: '1px solid transparent',
              borderColor: expanded === i ? 'var(--border)' : undefined,
            }}
            onMouseEnter={e => { if (expanded !== i) e.currentTarget.style.background = 'var(--bg-card)' }}
            onMouseLeave={e => { if (expanded !== i) e.currentTarget.style.background = 'transparent' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span className={`badge badge-${item.sentiment === 'positive' ? 'positive' : item.sentiment === 'negative' ? 'negative' : 'neutral'}`} style={{ fontSize: 8, padding: '1px 5px', marginTop: 2 }}>
                {item.sentiment === 'positive' ? 'POS' : item.sentiment === 'negative' ? 'NEG' : 'NEU'}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4, ...(expanded !== i ? { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } : {}) }}>
                  {item.headline}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 9, color: 'var(--blue)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{item.ticker}</span>
                  <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>{item.source}</span>
                  <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>·</span>
                  <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>{item.time}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
