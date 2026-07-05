import { useEffect, useState } from 'react'
import { X, AlertTriangle, Bell } from 'lucide-react'
import type { AlertData } from '../hooks/useStockWebSocket'

interface Props {
  alerts: AlertData[]
  onDismiss: (id: string) => void
}

export default function AlertToast({ alerts, onDismiss }: Props) {
  const visible = alerts.slice(0, 3)

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {visible.map((alert) => (
        <ToastItem key={alert.id} alert={alert} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastItem({ alert, onDismiss }: { alert: AlertData; onDismiss: (id: string) => void }) {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => {
      setExiting(true)
      setTimeout(() => onDismiss(alert.id), 300)
    }, 8000)
    return () => clearTimeout(t)
  }, [alert.id, onDismiss])

  const borderColor = alert.severity === 'high' ? 'border-red-500' : 'border-amber-500'

  return (
    <div
      className={`bg-[#1a1a2e] border-l-4 ${borderColor} border-gray-700 rounded-lg p-3 shadow-lg flex items-start gap-2 transition-all duration-300 ${
        exiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}
    >
      <AlertTriangle size={16} className={alert.severity === 'high' ? 'text-red-500 mt-0.5' : 'text-amber-500 mt-0.5'} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{alert.ticker}</p>
        <p className="text-xs text-gray-400 truncate">{alert.message}</p>
      </div>
      <button onClick={() => onDismiss(alert.id)} className="text-gray-500 hover:text-white shrink-0">
        <X size={14} />
      </button>
    </div>
  )
}

export function AlertBell({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button onClick={onClick} className="relative text-gray-400 hover:text-white transition-colors">
      <Bell size={18} />
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  )
}
