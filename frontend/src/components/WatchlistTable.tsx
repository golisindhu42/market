import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Search, ArrowUpDown } from 'lucide-react'
import type { StockData } from '../hooks/useStockWebSocket'

interface Props {
  stockList: StockData[]
}

type SortKey = 'ticker' | 'price' | 'changePercent' | 'volume'
type SortDir = 'asc' | 'desc'

function getAIRecommendation(changePercent: number): { label: string; type: 'buy' | 'hold' | 'sell' } {
  if (changePercent > 3) return { label: 'Strong Buy', type: 'buy' }
  if (changePercent > 1) return { label: 'Buy', type: 'buy' }
  if (changePercent < -3) return { label: 'Strong Sell', type: 'sell' }
  if (changePercent < -1) return { label: 'Sell', type: 'sell' }
  return { label: 'Hold', type: 'hold' }
}

export default function WatchlistTable({ stockList }: Props) {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('ticker')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const sorted = useMemo(() => {
    const filtered = stockList.filter(s =>
      s.ticker.toLowerCase().includes(search.toLowerCase())
    )
    return [...filtered].sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1
      if (sortKey === 'ticker') return a.ticker.localeCompare(b.ticker) * mul
      if (sortKey === 'price') return (a.price - b.price) * mul
      if (sortKey === 'changePercent') return ((a.changePercent || 0) - (b.changePercent || 0)) * mul
      if (sortKey === 'volume') return (a.volume - b.volume) * mul
      return 0
    })
  }, [stockList, search, sortKey, sortDir])

  const SortHeader = ({ label, k }: { label: string; k: SortKey }) => (
    <th onClick={() => toggleSort(k)} style={{
      padding: '8px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700,
      color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px',
      cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
      borderBottom: '1px solid var(--border)',
      transition: 'color 0.15s',
    }}
    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
    >
      {label}
      <ArrowUpDown size={10} style={{ marginLeft: 3, opacity: sortKey === k ? 1 : 0.3, verticalAlign: 'middle' }} />
    </th>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="glass-card"
      style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}
    >
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Watchlist</div>
        <div style={{ position: 'relative' }}>
          <Search size={12} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter..."
            className="input-premium"
            style={{ padding: '4px 8px 4px 24px', fontSize: 11, borderRadius: 6, width: 140 }}
          />
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <SortHeader label="Ticker" k="ticker" />
              <SortHeader label="Price" k="price" />
              <SortHeader label="Change" k="changePercent" />
              <SortHeader label="AI Score" k="changePercent" />
              <SortHeader label="Volume" k="volume" />
              <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>Recommendation</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, i) => {
              const isPositive = (s.changePercent || 0) >= 0
              const rec = getAIRecommendation(s.changePercent || 0)
              return (
                <motion.tr
                  key={s.ticker}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    transition: 'background 0.15s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{s.ticker}</td>
                  <td className="mono" style={{ padding: '10px', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>${s.price.toFixed(2)}</td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {isPositive ? <TrendingUp size={10} style={{ color: 'var(--green)' }} /> : <TrendingDown size={10} style={{ color: 'var(--red)' }} />}
                      <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: isPositive ? 'var(--green)' : 'var(--red)' }}>
                        {s.changePercent >= 0 ? '+' : ''}{s.changePercent?.toFixed(2)}%
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: isPositive ? 'var(--green)' : 'var(--red)' }}>
                      {Math.min(99, Math.abs(s.changePercent || 0) * 15 + 50)}
                    </span>
                  </td>
                  <td className="mono" style={{ padding: '10px', fontSize: 11, color: 'var(--text-muted)' }}>{(s.volume / 1e6).toFixed(1)}M</td>
                  <td style={{ padding: '10px' }}>
                    <span className={`badge badge-${rec.type}`} style={{ fontSize: 9 }}>
                      {rec.label}
                    </span>
                  </td>
                </motion.tr>
              )
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: 24, textAlign: 'center', color: 'var(--text-dim)', fontSize: 12 }}>
                  {stockList.length === 0 ? 'No data available' : 'No results match your search'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-dim)' }}>
        <span>{sorted.length} of {stockList.length} assets</span>
        <span>Click headers to sort</span>
      </div>
    </motion.div>
  )
}
