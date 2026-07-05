import { motion } from 'framer-motion'
import { Bell, AlertTriangle, Info, CheckCheck, X, TrendingUp, Calendar } from 'lucide-react'
import type { AlertData } from '../hooks/useStockWebSocket'

interface Props {
  alerts: AlertData[]
  onDismiss: (id: string) => void
  onMarkAllRead: () => void
  onClose: () => void
}

export default function NotificationDrawer({ alerts, onDismiss, onMarkAllRead, onClose }: Props) {
  return (
    <motion.aside
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="glass-card-elevated"
      style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, zIndex: 55,
        width: 380, display: 'flex', flexDirection: 'column',
        borderRadius: 0, borderTopLeftRadius: 0, borderBottomLeftRadius: 0,
      }}
    >
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Bell size={16} style={{ color: 'var(--blue)' }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Notifications</div>
          <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 500 }}>{alerts.length} unread</div>
        </div>
        <div style={{ flex: 1 }} />
        {alerts.length > 0 && (
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={onMarkAllRead} title="Mark all as read" className="btn-secondary" style={{ padding: '4px 8px', fontSize: 10, borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCheck size={11} />
            Mark all read
          </motion.button>
        )}
        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} title="Close (ESC)" style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 4 }}>
          <X size={16} />
        </motion.button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
        {alerts.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10 }}>
            <Bell size={32} style={{ color: 'var(--text-dim)', opacity: 0.3 }} />
            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>No notifications yet</div>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', opacity: 0.6 }}>Alerts will appear here in real-time</div>
          </div>
        )}

        {alerts.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', padding: '4px 8px', marginBottom: 4 }}>
              Real-time alerts
            </div>
            {alerts.map((a) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                layout
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '8px 10px', borderRadius: 8, marginBottom: 4,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{
                  width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: a.severity === 'high' ? 'var(--red-dim)' : 'var(--amber-dim)',
                }}>
                  {a.severity === 'high' ? <AlertTriangle size={11} style={{ color: 'var(--red)' }} /> : <Info size={11} style={{ color: 'var(--amber)' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>{a.ticker}</span>
                    <span style={{ fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 3, textTransform: 'uppercase', background: a.severity === 'high' ? 'var(--red-dim)' : 'var(--amber-dim)', color: a.severity === 'high' ? 'var(--red)' : 'var(--amber)' }}>
                      {a.severity}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{a.message}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                    {new Date(a.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }} onClick={() => onDismiss(a.id)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 2, flexShrink: 0 }}>
                  <X size={12} />
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}

        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', padding: '4px 8px', marginBottom: 4 }}>
            Alerts
          </div>
          {[
            { icon: TrendingUp, label: 'Price alerts', desc: 'TSLA above $350', time: '2h ago', color: 'var(--blue)' },
            { icon: Calendar, label: 'Earnings', desc: 'AAPL earnings Aug 1', time: '1d ago', color: 'var(--purple)' },
            { icon: TrendingUp, label: 'AI Signal', desc: 'NVDA bullish crossover', time: '3h ago', color: 'var(--emerald)' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px', borderRadius: 8, marginBottom: 2, cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ width: 24, height: 24, borderRadius: 6, background: `rgba(${item.color === 'var(--blue)' ? '59,130,246' : item.color === 'var(--purple)' ? '139,92,246' : '16,185,129'}, 0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <item.icon size={11} style={{ color: item.color }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{item.desc}</div>
              </div>
              <span style={{ fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{item.time}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.aside>
  )
}
