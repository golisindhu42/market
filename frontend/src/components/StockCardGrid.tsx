import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer } from 'recharts'
import type { StockData } from '../hooks/useStockWebSocket'

interface Props {
  tickers: string[]
  stockData: Record<string, StockData>
  history: Record<string, { date: string; price: number }[]>
  onSelect: (t: string) => void
  activeTicker: string
}

const LOGOS: Record<string, string> = {
  TSLA: 'TSLA', AAPL: 'AAPL', NVDA: 'NVDA', MSFT: 'MSFT', AMZN: 'AMZN', GOOGL: 'GOOGL',
}

function getRating(changePercent: number): { label: string; type: 'buy' | 'hold' | 'sell' } {
  if (changePercent > 2) return { label: 'BUY', type: 'buy' }
  if (changePercent < -2) return { label: 'SELL', type: 'sell' }
  return { label: 'HOLD', type: 'hold' }
}

export default function StockCardGrid({ tickers, stockData, history, onSelect, activeTicker }: Props) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={16} style={{ color: 'var(--blue)' }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Watchlist</span>
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{tickers.length} assets</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {tickers.map((t, i) => {
          const data = stockData[t]
          const hist = history[t] || []
          const isActive = t === activeTicker
          const isPositive = data ? data.changePercent >= 0 : true
          const rating = data ? getRating(data.changePercent) : { label: 'HOLD', type: 'hold' as const }
          const sparkColor = isPositive ? 'var(--green)' : 'var(--red)'

          return (
            <motion.div
              key={t}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              onClick={() => onSelect(t)}
              className="glass-card"
              style={{
                padding: 14, cursor: 'pointer',
                borderColor: isActive ? 'rgba(59,130,246,0.3)' : undefined,
                background: isActive ? 'rgba(59,130,246,0.04)' : undefined,
                transition: 'all 0.25s ease, transform 0.2s ease',
              }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.08))',
                    border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    {LOGOS[t]?.slice(0, 2) || t.slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{t}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 1, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {data?.companyName || 'Loading...'}
                    </div>
                  </div>
                </div>
                <span className={`badge badge-${rating.type}`} style={{ fontSize: 9 }}>
                  {rating.label}
                </span>
              </div>

              {data ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                      ${data.price.toFixed(2)}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      {isPositive ? <TrendingUp size={11} style={{ color: 'var(--green)' }} /> : <TrendingDown size={11} style={{ color: 'var(--red)' }} />}
                      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: isPositive ? 'var(--green)' : 'var(--red)' }}>
                        {isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--text-dim)', marginBottom: 8 }}>
                    <span>Vol: {(data.volume / 1e6).toFixed(1)}M</span>
                    <span>Cap: ${(data.price * data.volume * 0.00001).toFixed(1)}B</span>
                  </div>

                  {hist.length >= 2 && (
                    <div style={{ height: 36 }}>
                      <ResponsiveContainer width="100%" height={36}>
                        <AreaChart data={hist}>
                          <defs>
                            <linearGradient id={`scg-${t}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={sparkColor} stopOpacity={0.2} />
                              <stop offset="100%" stopColor={sparkColor} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="price" stroke={sparkColor} strokeWidth={1.5} fill={`url(#scg-${t})`} dot={false} isAnimationActive={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </>
              ) : (
                <div className="shimmer" style={{ height: 80, borderRadius: 8 }} />
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
