import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download, PieChart as PieChartIcon, ArrowLeft, RefreshCw, Sparkles, FileSpreadsheet, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDashboard } from '../context/DashboardContext'

const holdings = [
  { ticker: 'TSLA', shares: 42, avgPrice: 245.30, currentPrice: 273.48, change: 11.5 },
  { ticker: 'AAPL', shares: 85, avgPrice: 178.20, currentPrice: 192.53, change: 8.0 },
  { ticker: 'NVDA', shares: 15, avgPrice: 124.50, currentPrice: 158.92, change: 27.6 },
  { ticker: 'MSFT', shares: 30, avgPrice: 378.10, currentPrice: 415.35, change: 9.8 },
  { ticker: 'AMZN', shares: 55, avgPrice: 148.75, currentPrice: 161.22, change: 8.4 },
  { ticker: 'GOOGL', shares: 28, avgPrice: 141.30, currentPrice: 152.87, change: 8.2 },
]

const allocation = [
  { label: 'TSLA', value: 28, color: '#3B82F6' },
  { label: 'AAPL', value: 22, color: '#8B5CF6' },
  { label: 'NVDA', value: 18, color: '#10B981' },
  { label: 'MSFT', value: 15, color: '#F59E0B' },
  { label: 'AMZN', value: 10, color: '#EF4444' },
  { label: 'GOOGL', value: 7, color: '#64748B' },
]

export default function PortfolioPage() {
  const navigate = useNavigate()
  const { addToast } = useDashboard()
  const [showExport, setShowExport] = useState(false)
  const [refreshingAI, setRefreshingAI] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setShowExport(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const totalValue = holdings.reduce((sum, h) => sum + h.shares * h.currentPrice, 0)
  const totalCost = holdings.reduce((sum, h) => sum + h.shares * h.avgPrice, 0)

  const handleExportCSV = () => {
    const headers = 'Ticker,Shares,Avg Price,Current Price,Value,Change %'
    const rows = holdings.map(h => `${h.ticker},${h.shares},${h.avgPrice.toFixed(2)},${h.currentPrice.toFixed(2)},$${(h.shares * h.currentPrice).toFixed(2)},${h.change > 0 ? '+' : ''}${h.change.toFixed(1)}%`)
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'portfolio.csv'; a.click()
    URL.revokeObjectURL(url)
    setShowExport(false)
    addToast('CSV exported successfully', 'success')
  }

  const handleExportPDF = () => {
    const text = `Portfolio Summary\n${'='.repeat(40)}\n${holdings.map(h => `${h.ticker}: ${h.shares} shares @ $${h.currentPrice.toFixed(2)} (${h.change > 0 ? '+' : ''}${h.change.toFixed(1)}%)`).join('\n')}\n${'='.repeat(40)}\nTotal: $${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'portfolio.txt'; a.click()
    URL.revokeObjectURL(url)
    setShowExport(false)
    addToast('Report exported (TXT format)', 'success')
  }
  const totalPL = totalValue - totalCost
  const totalPLPercent = ((totalValue / totalCost) - 1) * 100

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <motion.button whileHover={{ x: -2 }} whileTap={{ scale: 0.97 }} onClick={() => navigate(-1)} title="Go back" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px 0', marginBottom: 16, fontSize: 12 }}>
        <ArrowLeft size={14} /> Back to Dashboard
      </motion.button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Total Portfolio Value', value: `$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
          { label: 'Total Cost Basis', value: `$${totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
          { label: 'Total P/L', value: `${totalPL > 0 ? '+' : ''}$${totalPL.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, positive: totalPL > 0 },
          { label: 'Return', value: `${totalPLPercent > 0 ? '+' : ''}${totalPLPercent.toFixed(1)}%`, positive: totalPLPercent > 0 },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card gradient-border" style={{ padding: 16, borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{item.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: item.positive !== undefined ? (item.positive ? 'var(--green)' : 'var(--red)') : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {item.value}
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: 20, borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <PieChartIcon size={14} style={{ color: 'var(--text-dim)' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Holdings</span>
            </div>
            <div ref={exportRef} style={{ position: 'relative' }}>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={() => setShowExport(!showExport)} title="Export" className="btn-secondary" style={{ padding: '4px 10px', borderRadius: 6, fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Download size={10} /> Export
              </motion.button>
              {showExport && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, background: '#111827', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: 4, zIndex: 10, minWidth: 140, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                  {[
                    { icon: FileSpreadsheet, label: 'Export CSV', action: handleExportCSV },
                    { icon: FileText, label: 'Export Report', action: handleExportPDF },
                  ].map(item => (
                    <motion.button key={item.label} whileHover={{ background: 'rgba(255,255,255,0.05)' }} onClick={item.action} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, width: '100%', border: 'none', background: 'transparent', color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer', textAlign: 'left' }}>
                      <item.icon size={12} style={{ color: 'var(--text-dim)' }} /> {item.label}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {holdings.map((h, i) => (
              <motion.div key={h.ticker} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: `var(--blue-dim)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--blue)' }}>{h.ticker}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{h.shares} shares</span>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>${(h.shares * h.currentPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                    <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>Avg ${h.avgPrice.toFixed(2)}</span>
                    <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: h.change > 0 ? 'var(--green)' : 'var(--red)' }}>
                      {h.change > 0 ? '+' : ''}{h.change.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card" style={{ padding: 20, borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <PieChartIcon size={14} style={{ color: 'var(--text-dim)' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Allocation</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {allocation.map(a => (
              <div key={a.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.label}</span>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{a.value}%</span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 2, overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${a.value}%` }} transition={{ duration: 0.6, delay: 0.3 }} style={{ height: '100%', background: a.color, borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: 20, borderRadius: 'var(--radius-md)', marginTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Sparkles size={14} style={{ color: 'var(--purple)' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>AI Portfolio Analysis</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Your portfolio shows strong diversification across tech giants with a <span style={{ color: 'var(--green)', fontWeight: 600 }}>+{totalPLPercent.toFixed(1)}%</span> return. NVDA is the top performer at +27.6%, driven by AI demand tailwinds. Consider rebalancing to reduce TSLA concentration risk. The portfolio beta is approximately 1.2, indicating slightly higher volatility than the broader market. Recommended hedge: add defensive positions (e.g., consumer staples) to reduce drawdown risk.
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={async () => {
            setRefreshingAI(true)
            await new Promise(r => setTimeout(r, 1200))
            setRefreshingAI(false)
            addToast('AI analysis refreshed', 'success')
          }}
          disabled={refreshingAI}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px',
            borderRadius: 8, fontSize: 11, marginTop: 12, cursor: refreshingAI ? 'not-allowed' : 'pointer',
            opacity: refreshingAI ? 0.6 : 1,
            background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', fontWeight: 500, transition: 'all 0.15s',
          }}
        >
          <motion.span animate={refreshingAI ? { rotate: 360 } : {}} transition={refreshingAI ? { repeat: Infinity, duration: 1, ease: 'linear' } : {}} style={{ display: 'inline-flex' }}>
            <RefreshCw size={11} />
          </motion.span>
          {refreshingAI ? 'Refreshing...' : 'Refresh Analysis'}
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
