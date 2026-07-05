import { useEffect, useState, useRef } from 'react'
import { Bell, AlertTriangle, Info, X } from 'lucide-react'
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
    <button onClick={onClick} className="relative p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors">
      <Bell size={15} className="text-gray-500" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-to-br from-amber-500 to-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center shadow-lg shadow-amber-500/30">
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
    return () => {
      current.forEach(t => clearTimeout(t))
    }
  }, [])

  const latest = alerts.slice(-3)

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
      {latest.filter(a => visible.includes(a.id)).map((a, i) => (
        <div
          key={a.id}
          className="pointer-events-auto glass-card rounded-xl p-3.5 flex items-start gap-3 shadow-2xl border border-white/[0.08] slide-up"
          style={{
            minWidth: 280,
            maxWidth: 360,
            animationDelay: `${i * 80}ms`,
            background: 'rgba(12, 19, 34, 0.95)',
          }}
        >
          <div className={`p-1 rounded-lg ${a.severity === 'high' ? 'bg-red-500/15' : 'bg-amber-500/15'}`}>
            {a.severity === 'high' ? (
              <AlertTriangle size={13} className="text-red-400" />
            ) : (
              <Info size={13} className="text-amber-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-xs font-bold text-white">{a.ticker}</span>
              <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${a.severity === 'high' ? 'bg-red-500/15 text-red-400' : 'bg-amber-500/15 text-amber-400'}`}>
                {a.severity}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">{a.message}</p>
          </div>
          <button onClick={() => onDismiss(a.id)} className="text-gray-600 hover:text-white shrink-0 mt-0.5 transition-colors p-0.5">
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  )
}
