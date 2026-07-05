import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Award, BarChart3 } from 'lucide-react'
import type { StockData } from '../hooks/useStockWebSocket'

interface Props {
  stockList: StockData[]
}

function StatBox({ icon, label, value, color, sub }: { icon: React.ReactNode; label: string; value: string; color: string; sub?: string }) {
  return (
    <div style={{
      background: 'var(--bg-card)', borderRadius: 8, padding: 12,
      border: '1px solid var(--border)', transition: 'all 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        {icon}
        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{label}</span>
      </div>
      <div className="mono" style={{ fontSize: 15, fontWeight: 700, color }}>{value}</div>
      {sub && <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

export default function MarketOverview({ stockList }: Props) {
  const sortedByChange = useMemo(() =>
    [...stockList].sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0)),
    [stockList]
  )

  const topGainer = sortedByChange[0]
  const topLoser = sortedByChange[sortedByChange.length - 1]

  const mostActive = useMemo(() =>
    [...stockList].sort((a, b) => b.volume - a.volume)[0],
    [stockList]
  )

  const avgChange = stockList.reduce((sum, s) => sum + (s.changePercent || 0), 0) / Math.max(stockList.length, 1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.4 }}
      className="glass-card"
      style={{ padding: 16, borderRadius: 'var(--radius-md)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <BarChart3 size={14} style={{ color: 'var(--blue)' }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Market Overview</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <StatBox
          icon={<Award size={13} style={{ color: 'var(--green)' }} />}
          label="Top Gainer"
          value={topGainer ? `${topGainer.ticker} ${topGainer.changePercent >= 0 ? '+' : ''}${topGainer.changePercent?.toFixed(2)}%` : '---'}
          color="var(--green)"
          sub={topGainer ? `$${topGainer.price.toFixed(2)}` : undefined}
        />
        <StatBox
          icon={<TrendingDown size={13} style={{ color: 'var(--red)' }} />}
          label="Top Loser"
          value={topLoser ? `${topLoser.ticker} ${topLoser.changePercent >= 0 ? '+' : ''}${topLoser.changePercent?.toFixed(2)}%` : '---'}
          color="var(--red)"
          sub={topLoser ? `$${topLoser.price.toFixed(2)}` : undefined}
        />
        <StatBox
          icon={<BarChart3 size={13} style={{ color: 'var(--blue)' }} />}
          label="Most Active"
          value={mostActive ? `${mostActive.ticker} · ${(mostActive.volume / 1e6).toFixed(1)}M` : '---'}
          color="var(--blue)"
          sub={mostActive ? `$${mostActive.price.toFixed(2)}` : undefined}
        />
        <StatBox
          icon={<TrendingUp size={13} style={{ color: avgChange >= 0 ? 'var(--green)' : 'var(--red)' }} />}
          label="Market Average"
          value={`${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(2)}%`}
          color={avgChange >= 0 ? 'var(--green)' : 'var(--red)'}
          sub={`${stockList.length} assets`}
        />
      </div>
    </motion.div>
  )
}
