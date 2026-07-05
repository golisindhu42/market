import { motion } from 'framer-motion'
import { CreditCard, Download, ArrowLeft, Check, Zap, Sparkles, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDashboard } from '../context/DashboardContext'

const invoices = [
  { id: 'INV-2026-06', date: 'Jun 1, 2026', amount: 49.00, status: 'Paid' },
  { id: 'INV-2026-05', date: 'May 1, 2026', amount: 49.00, status: 'Paid' },
  { id: 'INV-2026-04', date: 'Apr 1, 2026', amount: 49.00, status: 'Paid' },
  { id: 'INV-2026-03', date: 'Mar 1, 2026', amount: 29.00, status: 'Paid' },
]

const plans = [
  {
    name: 'Starter', price: 0, features: ['3 tickers', 'Basic chart', '1-day delay', 'Standard alerts'],
    current: false,
  },
  {
    name: 'Pro', price: 49, features: ['Unlimited tickers', 'Real-time data', 'AI signals', 'Advanced charts', 'Priority support'],
    current: true,
    popular: true,
  },
  {
    name: 'Enterprise', price: 199, features: ['Everything in Pro', 'API access', 'Custom indicators', 'Dedicated support', 'SLA guarantee', 'Team accounts'],
    current: false,
  },
]

export default function BillingPage() {
  const navigate = useNavigate()
  const { addToast } = useDashboard()

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <motion.button whileHover={{ x: -2 }} whileTap={{ scale: 0.97 }} onClick={() => navigate(-1)} title="Go back" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px 0', marginBottom: 16, fontSize: 12 }}>
        <ArrowLeft size={14} /> Back to Dashboard
      </motion.button>

      <div className="glass-card" style={{ padding: 20, borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Current Plan</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>Pro</span>
              <span className="badge badge-buy" style={{ fontSize: 9 }}>Active</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Your subscription renews on July 1, 2026</div>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { addToast('Manage subscription opened', 'info') }} className="btn-secondary" style={{ padding: '8px 16px', borderRadius: 10, fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CreditCard size={13} /> Manage
          </motion.button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`glass-card ${plan.popular ? 'gradient-border gradient-border-blue' : ''}`}
            style={{ padding: 20, borderRadius: 'var(--radius-md)', position: 'relative' }}
          >
            {plan.popular && (
              <div style={{ position: 'absolute', top: -8, right: 12, fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '2px 10px', borderRadius: 4, background: 'linear-gradient(135deg, var(--blue), var(--purple))', color: 'white' }}>
                Current Plan
              </div>
            )}
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{plan.name}</div>
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>${plan.price}</span>
              <span style={{ fontSize: 11, color: 'var(--text-dim)', marginLeft: 4 }}>/ month</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
              {plan.features.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
                  <Check size={11} style={{ color: 'var(--green)', flexShrink: 0 }} />
                  {f}
                </div>
              ))}
            </div>
            {!plan.current && (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { addToast(`Upgrade to ${plan.name} initiated`, 'success') }}
                className={plan.name === 'Enterprise' ? 'btn-secondary' : 'btn-primary'}
                style={{ width: '100%', padding: '8px', borderRadius: 8, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
              >
                {plan.name === 'Enterprise' ? <Sparkles size={11} /> : <Zap size={11} />}
                {plan.name === 'Enterprise' ? 'Contact Sales' : `Upgrade to ${plan.name}`}
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: 20, borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <FileText size={14} style={{ color: 'var(--text-dim)' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Invoices</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {invoices.map(inv => (
            <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{inv.id}</div>
                <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>{inv.date}</div>
              </div>
              <span className={`badge ${inv.status === 'Paid' ? 'badge-buy' : 'badge-neutral'}`} style={{ fontSize: 8 }}>{inv.status}</span>
              <div style={{ marginLeft: 'auto', fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>${inv.amount.toFixed(2)}</div>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => { addToast(`Downloading ${inv.id}...`, 'success') }} title="Download invoice" style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 4 }}>
                <Download size={12} />
              </motion.button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
