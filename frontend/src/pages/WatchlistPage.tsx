import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, X, TrendingUp, Star, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDashboard } from '../context/DashboardContext'

const AI_RATINGS: Record<string, { rating: 'Buy' | 'Hold' | 'Sell'; score: number }> = {
  TSLA: { rating: 'Buy', score: 87 },
  AAPL: { rating: 'Hold', score: 72 },
  NVDA: { rating: 'Buy', score: 94 },
  MSFT: { rating: 'Buy', score: 91 },
  AMZN: { rating: 'Hold', score: 78 },
  GOOGL: { rating: 'Buy', score: 85 },
  META: { rating: 'Hold', score: 69 },
  AMD: { rating: 'Buy', score: 82 },
  INTC: { rating: 'Sell', score: 34 },
  TSM: { rating: 'Buy', score: 88 },
}

const ALL_TICKERS = ['TSLA', 'AAPL', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'AMD', 'INTC', 'TSM', 'SPY', 'QQQ', 'DIS', 'NFLX', 'BA', 'IBM', 'V', 'PYPL']

export default function WatchlistPage() {
  const navigate = useNavigate()
  const { tickers, stockData, addTicker, removeTicker, addToast } = useDashboard()
  const [query, setQuery] = useState('')
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('marketpulse_fav') || '["TSLA","NVDA"]') } catch { return ['TSLA', 'NVDA'] }
  })

  const filtered = ALL_TICKERS.filter(t => t.toLowerCase().includes(query.toLowerCase()) && !tickers.includes(t)).slice(0, 8)

  const toggleFav = (t: string) => {
    setFavorites(prev => {
      const next = prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
      localStorage.setItem('marketpulse_fav', JSON.stringify(next))
      return next
    })
    addToast(favorites.includes(t) ? `Removed ${t} from favorites` : `Added ${t} to favorites`, 'success')
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <motion.button whileHover={{ x: -2 }} whileTap={{ scale: 0.97 }} onClick={() => navigate(-1)} title="Go back" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px 0', marginBottom: 16, fontSize: 12 }}>
        <ArrowLeft size={14} /> Back to Dashboard
      </motion.button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, maxWidth: 360, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search tickers..." className="input-premium" style={{ width: '100%', padding: '8px 12px 8px 36px', fontSize: 13, borderRadius: 10 }} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{tickers.length} / 10 tickers</div>
      </div>

      {query && filtered.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="glass-card-elevated" style={{ padding: 4, borderRadius: 12, marginBottom: 20, maxWidth: 360 }}>
          {filtered.map(t => (
            <button key={t} onClick={() => { addTicker(t); setQuery('') }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <TrendingUp size={11} style={{ color: 'var(--text-dim)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>{t}</span>
              <span style={{ marginLeft: 'auto', fontSize: 9, color: 'var(--blue)' }}>Add</span>
            </button>
          ))}
        </motion.div>
      )}

      {tickers.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card" style={{ padding: 40, borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          <TrendingUp size={32} style={{ color: 'var(--text-dim)', marginBottom: 12, opacity: 0.4 }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Empty watchlist</div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Search for tickers above to build your watchlist</div>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {tickers.map((t, i) => {
            const data = stockData[t]
            const ai = AI_RATINGS[t] || { rating: 'Hold', score: 50 }
            return (
              <motion.div
                key={t}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-card gradient-border"
                style={{ padding: 14, borderRadius: 'var(--radius-md)', position: 'relative' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <motion.button whileTap={{ scale: 0.8 }} onClick={() => toggleFav(t)} title={favorites.includes(t) ? 'Remove from favorites' : 'Add to favorites'} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                    <Star size={11} style={{ color: favorites.includes(t) ? 'var(--amber)' : 'var(--text-dim)' }} fill={favorites.includes(t) ? 'var(--amber)' : 'none'} />
                  </motion.button>
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{t}</span>
                  <span className={`badge badge-${ai.rating === 'Buy' ? 'buy' : ai.rating === 'Sell' ? 'sell' : 'hold'}`} style={{ fontSize: 8, marginLeft: 4 }}>
                    {ai.rating} {ai.score}
                  </span>
                  <motion.button whileTap={{ scale: 0.8 }} onClick={() => { removeTicker(t) }} title={`Remove ${t}`} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 2 }}>
                    <X size={12} />
                  </motion.button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                      ${data?.price?.toFixed(2) || '---'}
                    </div>
                    <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: data?.changePercent >= 0 ? 'var(--green)' : 'var(--red)', marginTop: 2 }}>
                      {data?.changePercent >= 0 ? '+' : ''}{data?.changePercent?.toFixed(2) || '---'}%
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>Vol</div>
                    <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {data?.volume ? (data.volume / 1000000).toFixed(1) + 'M' : '---'}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
