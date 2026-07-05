import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, Bot, User, ChevronDown, TrendingUp, Plus, X, Sparkles, Settings, LogOut, Briefcase, PieChart, CreditCard, Bookmark } from 'lucide-react'

interface Props {
  tickers: string[]
  onAdd: (t: string) => void
  onRemove: (t: string) => void
  connected: boolean
  alertCount: number
  onOpenAI: () => void
  onOpenNotifications: () => void
  recentSearches: string[]
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void
}

const RECENT = ['TSLA', 'AAPL', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'META', 'SPY']

const menuItems = [
  { icon: User, label: 'My Profile', shortcut: '⌘P' },
  { icon: PieChart, label: 'Dashboard', shortcut: '⌘D' },
  { icon: Briefcase, label: 'Portfolio', shortcut: '⌘O' },
  { icon: Bookmark, label: 'Watchlist', shortcut: '⌘W' },
  { icon: Settings, label: 'Settings', shortcut: '⌘,' },
  { icon: CreditCard, label: 'Billing', shortcut: null },
  { icon: LogOut, label: 'Logout', shortcut: '⇧⌘Q' },
]

export default function TopNav({ tickers, onAdd, onRemove, connected, alertCount, onOpenAI, onOpenNotifications, recentSearches, addToast }: Props) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = RECENT.filter(t =>
    t.toLowerCase().includes(query.toLowerCase()) && !tickers.includes(t)
  ).slice(0, 5)

  const trending = ['META', 'AMD', 'INTC', 'TSM']

  const handleSelect = (t: string) => {
    if (!tickers.includes(t) && tickers.length < 10) {
      onAdd(t)
      addToast(`Added ${t} to watchlist`, 'success')
    } else if (tickers.includes(t)) {
      addToast(`${t} is already in your watchlist`, 'info')
    }
    setQuery('')
    inputRef.current?.blur()
    setFocused(false)
  }

  const handleMenuItem = (label: string) => {
    setShowProfile(false)
    addToast(`Navigating to ${label}...`, 'info')
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
            {focused && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="glass-card-elevated"
                style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, padding: 4, zIndex: 100, borderRadius: 12 }}
              >
                {query.length > 0 && filtered.length > 0 && (
                  <div style={{ marginBottom: 4 }}>
                    <div style={{ padding: '4px 10px', fontSize: 9, color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Results</div>
                    {filtered.map(t => (
                      <button key={t} onMouseDown={e => { e.preventDefault(); handleSelect(t) }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 10px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500, cursor: 'pointer', borderRadius: 8, transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <TrendingUp size={11} style={{ color: 'var(--text-dim)' }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>{t}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 9, color: 'var(--text-dim)' }}>Add</span>
                      </button>
                    ))}
                  </div>
                )}
                {query.length === 0 && recentSearches.length > 0 && (
                  <div style={{ marginBottom: 4 }}>
                    <div style={{ padding: '4px 10px', fontSize: 9, color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Recent</div>
                    {recentSearches.slice(0, 3).map(t => (
                      <button key={t} onMouseDown={e => { e.preventDefault(); handleSelect(t) }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 10px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500, cursor: 'pointer', borderRadius: 8 }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <TrendingUp size={11} style={{ color: 'var(--text-dim)' }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>{t}</span>
                      </button>
                    ))}
                  </div>
                )}
                {query.length === 0 && recentSearches.length === 0 && (
                  <div style={{ marginBottom: 4 }}>
                    <div style={{ padding: '4px 10px', fontSize: 9, color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Trending</div>
                    {trending.map(t => (
                      <button key={t} onMouseDown={e => { e.preventDefault(); handleSelect(t) }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 10px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500, cursor: 'pointer', borderRadius: 8 }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <TrendingUp size={11} style={{ color: 'var(--blue)' }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>{t}</span>
                        <span style={{ fontSize: 9, color: 'var(--blue)' }}>Trending</span>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ flex: 1 }} />

        <div title={connected ? 'Live data connection active' : 'Connection lost'} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)', fontWeight: 500, cursor: 'default' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: connected ? 'var(--green)' : 'var(--red)', boxShadow: connected ? '0 0 8px rgba(34,197,94,0.4)' : 'none', animation: connected ? 'pulseGlow 2s infinite' : 'none' }} />
          {connected ? 'Live' : 'Offline'}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenAI}
          title="Open AI Copilot (⌘K)"
          className="btn-secondary"
          style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, borderRadius: 10, position: 'relative', overflow: 'hidden' }}
        >
          <Bot size={14} style={{ color: 'var(--purple)' }} />
          AI
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenNotifications}
          title="Open notifications"
          className="btn-secondary"
          style={{ position: 'relative', padding: '6px 8px', borderRadius: 10 }}
        >
          <Bell size={15} />
          {alertCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
              style={{ position: 'absolute', top: -1, right: -1, width: 15, height: 15, borderRadius: '50%', background: 'var(--red)', color: 'white', fontSize: 8, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {alertCount > 9 ? '9+' : alertCount}
            </motion.span>
          )}
        </motion.button>

        <div style={{ position: 'relative' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowProfile(!showProfile)}
            className="btn-secondary"
            title="Profile menu"
            style={{ padding: '4px 8px 4px 4px', display: 'flex', alignItems: 'center', gap: 6, borderRadius: 10, fontSize: 12 }}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg, var(--blue), var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <User size={12} className="text-white" />
            </motion.div>
            <span style={{ fontWeight: 500 }}>Admin</span>
            <motion.div animate={{ rotate: showProfile ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={12} style={{ color: 'var(--text-dim)' }} />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="glass-card-elevated"
                style={{ position: 'absolute', top: '100%', right: 0, marginTop: 6, width: 200, padding: 4, borderRadius: 12, zIndex: 200 }}
              >
                {menuItems.map((item, i) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    onClick={() => handleMenuItem(item.label)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500, cursor: 'pointer', borderRadius: 8, transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <item.icon size={13} style={{ color: item.label === 'Logout' ? 'var(--red)' : 'var(--text-dim)' }} />
                    <span style={{ color: item.label === 'Logout' ? 'var(--red)' : undefined }}>{item.label}</span>
                    {item.shortcut && <span style={{ marginLeft: 'auto', fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{item.shortcut}</span>}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {tickers.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingBottom: 10, paddingLeft: 2 }}>
          {tickers.map((t, i) => (
            <motion.span
              key={t}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}
            >
              {t}
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
                onClick={() => onRemove(t)}
                title={`Remove ${t}`}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 0, display: 'flex' }}
              >
                <X size={10} />
              </motion.button>
            </motion.span>
          ))}
          {tickers.length < 10 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const el = document.querySelector<HTMLInputElement>('[placeholder="Search market, tickers..."]')
                el?.focus()
              }}
              title="Add ticker"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'transparent', border: '1px dashed var(--border)', borderRadius: 6, padding: '3px 10px', fontSize: 11, color: 'var(--text-dim)', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-dim)' }}
            >
              <Plus size={10} />
              Add
            </motion.button>
          )}
        </div>
      )}
    </div>
  )
}
