import { motion, AnimatePresence } from 'framer-motion'
import { User, PieChart, Briefcase, Bookmark, Settings, CreditCard, LogOut, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'

const menuItems = [
  { icon: User, label: 'My Profile', shortcut: '⌘P', path: '/profile', color: 'var(--blue)' },
  { icon: PieChart, label: 'Dashboard', shortcut: '⌘D', path: '/', color: 'var(--purple)' },
  { icon: Briefcase, label: 'Portfolio', shortcut: '⌘O', path: '/portfolio', color: 'var(--emerald)' },
  { icon: Bookmark, label: 'Watchlist', shortcut: '⌘W', path: '/watchlist', color: 'var(--amber)' },
  { icon: Settings, label: 'Settings', shortcut: '⌘,', path: '/settings', color: 'var(--text-muted)' },
  { icon: CreditCard, label: 'Billing', shortcut: null, path: '/billing', color: 'var(--red)' },
  { icon: LogOut, label: 'Logout', shortcut: '⇧⌘Q', action: 'logout', color: 'var(--red)' },
]

interface Props {
  onNavigate?: (path: string) => void
  onLogout?: () => void
  triggerRef?: React.RefObject<HTMLButtonElement | null>
}

export default function ProfileDropdown({ onNavigate, onLogout, triggerRef }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && triggerRef?.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [triggerRef])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleMenuClick = async (item: typeof menuItems[0]) => {
    setIsOpen(false)
    if (item.action === 'logout') {
      if (onLogout) onLogout()
      else {
        localStorage.clear()
        sessionStorage.clear()
        navigate('/login')
      }
      return
    }
    if (item.path) {
      if (onNavigate) onNavigate(item.path)
      else navigate(item.path)
    }
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        title="Profile menu"
        className="btn-secondary"
        style={{ padding: '4px 8px 4px 4px', display: 'flex', alignItems: 'center', gap: 6, borderRadius: 10, fontSize: 12 }}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <motion.div whileHover={{ scale: 1.1 }} style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg, var(--blue), var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={12} className="text-white" />
        </motion.div>
        <span style={{ fontWeight: 500 }}>Admin</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={12} style={{ color: 'var(--text-dim)' }} />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card-elevated"
            style={{ position: 'absolute', top: '100%', right: 0, marginTop: 6, width: 220, padding: 4, borderRadius: 12, zIndex: 200 }}
          >
            {menuItems.map((item, i) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => handleMenuClick(item)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500, cursor: 'pointer', borderRadius: 8, transition: 'background 0.15s' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
                onMouseDown={(e) => e.preventDefault()}
                title={item.label}
              >
                <item.icon size={13} style={{ color: item.color }} />
                <span style={{ color: item.label === 'Logout' ? item.color : undefined }}>{item.label}</span>
                {item.shortcut && <span style={{ marginLeft: 'auto', fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{item.shortcut}</span>}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}