import { useState, useRef } from 'react'
import { Search, Bell, Bot, User, ChevronDown, TrendingUp, Plus, X, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  tickers: string[]
  onAdd: (t: string) => void
  onRemove: (t: string) => void
  connected: boolean
  alertCount: number
}

const RECENT = ['TSLA', 'AAPL', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'SPY']

export default function TopNav({ tickers, onAdd, onRemove, connected, alertCount }: Props) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = RECENT.filter(t =>
    t.toLowerCase().includes(query.toLowerCase()) && !tickers.includes(t)
  ).slice(0, 5)

  const handleSelect = (t: string) => {
    if (!tickers.includes(t) && tickers.length < 10) {
      onAdd(t)
    }
    setQuery('')
    inputRef.current?.blur()
    setFocused(false)
  }

  return (
    <div className="glass" style={{
      position: 'sticky', top: 0, zIndex: 50,
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
    }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', alignItems: 'center', height: 60, gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--blue), var(--purple))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px var(--blue-glow)',
          }}>
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              Tesla<span className="gradient-text">Pulse</span>
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', marginTop: -1 }}>
              AI Intelligence
            </div>
          </div>
        </div>

        <div style={{ flex: 1, maxWidth: 420, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: focused ? 'var(--blue)' : 'var(--text-dim)', transition: 'color 0.2s' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder="Search market, tickers..."
            className="input-premium"
            style={{ width: '100%', padding: '8px 12px 8px 36px', fontSize: 13, borderRadius: 10 }}
          />
          <AnimatePresence>
            {focused && query.length > 0 && filtered.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="glass-card-elevated"
                style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, padding: 4, zIndex: 100, borderRadius: 12 }}
              >
                {filtered.map(t => (
                  <button
                    key={t}
                    onMouseDown={e => { e.preventDefault(); handleSelect(t) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      width: '100%', padding: '8px 10px',
                      background: 'transparent', border: 'none',
                      color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500,
                      cursor: 'pointer', borderRadius: 8,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <TrendingUp size={12} style={{ color: 'var(--text-dim)' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>{t}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-dim)' }}>Add</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: connected ? 'var(--green)' : 'var(--red)', boxShadow: connected ? '0 0 8px rgba(34,197,94,0.4)' : 'none' }} />
          {connected ? 'Live Data' : 'Offline'}
        </div>

        <button className="btn-secondary" style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, borderRadius: 10 }}>
          <Bot size={14} style={{ color: 'var(--purple)' }} />
          AI
        </button>

        <button className="btn-secondary" style={{ position: 'relative', padding: '6px 8px', borderRadius: 10 }}>
          <Bell size={15} />
          {alertCount > 0 && (
            <span style={{
              position: 'absolute', top: -1, right: -1,
              width: 15, height: 15, borderRadius: '50%',
              background: 'var(--red)', color: 'white',
              fontSize: 8, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {alertCount > 9 ? '9+' : alertCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setShowProfile(!showProfile)}
          className="btn-secondary"
          style={{ padding: '4px 8px 4px 4px', display: 'flex', alignItems: 'center', gap: 6, borderRadius: 10, fontSize: 12 }}
        >
          <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg, var(--blue), var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={12} className="text-white" />
          </div>
          <span style={{ fontWeight: 500 }}>Admin</span>
          <ChevronDown size={12} style={{ color: 'var(--text-dim)' }} />
        </button>
      </div>

      {tickers.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingBottom: 10 }}>
          {tickers.map((t, i) => (
            <motion.span
              key={t}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'rgba(59,130,246,0.08)',
                border: '1px solid rgba(59,130,246,0.15)',
                borderRadius: 6, padding: '3px 10px',
                fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {t}
              <button onClick={() => onRemove(t)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                <X size={10} />
              </button>
            </motion.span>
          ))}
          {tickers.length < 10 && (
            <button onClick={() => {
              const el = document.querySelector<HTMLInputElement>('[placeholder="Search ticker (e.g. TSLA, AAPL)..."]')
              el?.focus()
            }} style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'transparent', border: '1px dashed var(--border)',
              borderRadius: 6, padding: '3px 10px',
              fontSize: 11, color: 'var(--text-dim)', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-dim)' }}
            >
              <Plus size={10} />
              Add
            </button>
          )}
        </div>
      )}
    </div>
  )
}
