import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Info, X } from 'lucide-react'
import type { AlertData } from '../hooks/useStockWebSocket'

interface Props {
  alerts: AlertData[]
  onDismiss: (id: string) => void
}

export default function AlertToast({ alerts, onDismiss }: Props) {
  const [visible, setVisible] = useState<string[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    alerts.forEach(a => {
      if (!visible.includes(a.id)) {
        setVisible(prev => [...prev, a.id])
        const t = setTimeout(() => {
          setVisible(prev => prev.filter(id => id !== a.id))
          timers.current.delete(a.id)
        }, 5000)
        timers.current.set(a.id, t)
      }
    })
  }, [alerts, visible])

  useEffect(() => {
    const current = timers.current
    return () => current.forEach(t => clearTimeout(t))
  }, [])

  const latest = alerts.slice(-3)

  return (
    <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 100, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
      <AnimatePresence>
        {latest.filter(a => visible.includes(a.id)).map(a => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              pointerEvents: 'auto',
              background: 'rgba(17, 24, 39, 0.9)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              minWidth: 280,
              maxWidth: 340,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{
              width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: a.severity === 'high' ? 'var(--red-dim)' : 'var(--amber-dim)',
            }}>
              {a.severity === 'high' ? <AlertTriangle size={11} style={{ color: 'var(--red)' }} /> : <Info size={11} style={{ color: 'var(--amber)' }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>{a.ticker}</span>
                <span style={{
                  fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 3, textTransform: 'uppercase',
                  background: a.severity === 'high' ? 'var(--red-dim)' : 'var(--amber-dim)',
                  color: a.severity === 'high' ? 'var(--red)' : 'var(--amber)',
                }}>
                  {a.severity}
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{a.message}</div>
            </div>
            <button
              onClick={() => onDismiss(a.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', padding: 2, flexShrink: 0 }}
            >
              <X size={12} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
