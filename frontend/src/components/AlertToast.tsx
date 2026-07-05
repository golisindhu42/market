import { useEffect, useState, useRef } from 'react'
import { Bell } from 'lucide-react'
import type { AlertData } from '../hooks/useStockWebSocket'

interface Props {
  alerts: AlertData[]
  onDismiss: (id: string) => void
}

interface BellProps {
  count: number
  onClick: () => void
}

export function AlertBell({ count, onClick }: BellProps) {
  return (
    <button onClick={onClick} className="terminal-btn-outline" style={{ position: 'relative', padding: '4px 8px', fontSize: 12 }}>
      <Bell size={13} />
      {count > 0 && (
        <span
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: 'var(--red)',
            color: 'white',
            fontSize: 9,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  )
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
    <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 50, display: 'flex', flexDirection: 'column', gap: 6, pointerEvents: 'none' }}>
      {latest.filter(a => visible.includes(a.id)).map(a => (
        <div
          key={a.id}
          className="slide-up"
          style={{
            pointerEvents: 'auto',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: 6,
            padding: '8px 10px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            minWidth: 260,
            maxWidth: 320,
            boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              flexShrink: 0,
              marginTop: 4,
              background: a.severity === 'high' ? 'var(--red)' : 'var(--amber)',
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="text-xs font-semibold text-white">{a.ticker}</div>
            <div className="text-[11px] text-muted leading-relaxed">{a.message}</div>
          </div>
          <button onClick={() => onDismiss(a.id)} className="text-muted hover:text-white" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, padding: 2 }}>&times;</button>
        </div>
      ))}
    </div>
  )
}
