import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, CreditCard, Download, FileText, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useStore } from '../lib/store'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'

const PLANS = [
  { id: 'starter', name: 'Starter', price: 0, popular: false, features: ['3 watchlist slots', 'Basic charting', 'Daily market snapshot', 'Email alerts', 'Community access'], cta: 'Get Started' },
  { id: 'pro', name: 'Pro', price: 49, popular: true, features: ['Unlimited watchlists', 'Advanced charting + indicators', 'AI trade signals', 'Real-time WebSocket data', 'API access (1k req/day)', 'Priority support', 'Export CSV/PDF'], cta: 'Subscribe' },
  { id: 'enterprise', name: 'Enterprise', price: 199, popular: false, features: ['Everything in Pro', 'Unlimited API access', 'Custom AI models', 'Dedicated account manager', 'SSO/SAML', 'SLA guarantee', 'Custom integrations', 'On-premise deployment'], cta: 'Contact Sales' },
]

const PLAN_LABELS: Record<string, string> = { starter: 'Starter', pro: 'Pro', enterprise: 'Enterprise' }

export default function BillingPage() {
  const navigate = useNavigate()
  const store = useStore()
  const sub = store.subscription
  const [showManage, setShowManage] = useState(false)
  const [showConfirm, setShowConfirm] = useState<{ type: 'upgrade' | 'downgrade' | 'cancel' | 'reactivate'; plan?: string } | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)

  const isCurrentPlan = (planId: string) => sub.plan === planId
  const isCanceled = sub.status === 'canceled'

  const handleUpgrade = async (planId: string) => {
    setShowConfirm({ type: isCurrentPlan(planId) && isCanceled ? 'reactivate' : 'upgrade', plan: planId })
  }

  const handleConfirm = async () => {
    if (!showConfirm) return
    setProcessing(showConfirm.plan || showConfirm.type)
    await new Promise(r => setTimeout(r, 1200))
    if (showConfirm.type === 'cancel') {
      store.setSubscription({ status: 'canceled', autoRenew: false })
      toast.success('Subscription canceled. You still have access until the end of the billing period.')
    } else if (showConfirm.type === 'reactivate' && showConfirm.plan) {
      store.setSubscription({ plan: showConfirm.plan as any, status: 'active', autoRenew: true })
      toast.success(`Reactivated ${PLAN_LABELS[showConfirm.plan]} plan!`)
    } else if (showConfirm.plan) {
      store.setSubscription({ plan: showConfirm.plan as any, status: 'active', autoRenew: true })
      toast.success(`Upgraded to ${PLAN_LABELS[showConfirm.plan]}!`)
    }
    setProcessing(null)
    setShowConfirm(null)
    setShowManage(false)
  }

  const handleAutoRenew = () => {
    const next = !sub.autoRenew
    store.setSubscription({ autoRenew: next })
    toast.success(next ? 'Auto-renewal enabled' : 'Auto-renewal disabled')
  }

  const handleDownloadInvoice = (id: string) => {
    toast.success(`Downloading invoice ${id}...`)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <motion.button whileHover={{ x: -2 }} whileTap={{ scale: 0.97 }} onClick={() => navigate(-1)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px 0', marginBottom: 16, fontSize: 12 }}
        aria-label="Go back"
      >
        <ArrowLeft size={14} /> Back to Dashboard
      </motion.button>

      <div className="glass-card gradient-border gradient-border-blue" style={{ padding: 20, borderRadius: 'var(--radius-md)', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Current Plan</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {sub.status === 'canceled' ? `${PLAN_LABELS[sub.plan]} (Canceled)` : PLAN_LABELS[sub.plan]}
            </span>
            <span className={`badge ${sub.status === 'active' ? 'badge-positive' : sub.status === 'canceled' ? 'badge-negative' : 'badge-neutral'}`}>
              {sub.status === 'active' ? 'Active' : sub.status === 'canceled' ? 'Canceled' : sub.status}
            </span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            {sub.status === 'active' ? `Renews on ${sub.renewsAt}` : sub.status === 'canceled' ? 'Access until end of billing period' : ''}
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setShowManage(true)} ariaLabel="Manage subscription">
          Manage
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
        {PLANS.map((plan, i) => {
          const current = isCurrentPlan(plan.id) && sub.status === 'active'
          const canceled = isCurrentPlan(plan.id) && sub.status === 'canceled'
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card"
              style={{
                padding: 20, borderRadius: 'var(--radius-md)', position: 'relative',
                borderColor: plan.popular ? 'var(--accent)' : 'var(--border)',
                ...(current ? { boxShadow: '0 0 20px var(--accent-glow)' } : {}),
              }}
            >
              {plan.popular && (
                <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, var(--accent, var(--blue)), var(--purple))', color: 'white', fontSize: 9, fontWeight: 700, padding: '2px 12px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Most Popular
                </div>
              )}
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{plan.name}</div>
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>${plan.price}</span>
                {plan.price > 0 && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 2 }}>/month</span>}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
                    <Check size={10} style={{ color: 'var(--green)', flexShrink: 0 }} /> {f}
                  </li>
                ))}
              </ul>
              {current ? (
                <div style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--accent-dim)', color: 'var(--accent)', fontSize: 11, fontWeight: 600, textAlign: 'center' }}>
                  Current Plan
                </div>
              ) : (
                <Button
                  variant={plan.id === 'enterprise' ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => handleUpgrade(plan.id)}
                  loading={processing === plan.id}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {canceled && isCurrentPlan(plan.id) ? 'Reactivate' : plan.cta}
                </Button>
              )}
            </motion.div>
          )
        })}
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="glass-card" style={{ padding: 20, borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <FileText size={14} style={{ color: 'var(--text-dim)' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Invoices</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sub.invoices.map(inv => (
            <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{inv.id}</div>
                <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>{inv.date}</div>
              </div>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>${inv.amount.toFixed(2)}</span>
              <span className={`badge ${inv.status === 'paid' ? 'badge-positive' : inv.status === 'pending' ? 'badge-neutral' : 'badge-negative'}`}>{inv.status}</span>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleDownloadInvoice(inv.id)}
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex' }}
                aria-label={`Download invoice ${inv.id}`}
              >
                <Download size={12} />
              </motion.button>
            </div>
          ))}
        </div>
      </motion.div>

      <Modal isOpen={showManage} onClose={() => setShowManage(false)} title="Manage Subscription" maxWidth={440}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <ManageRow icon={CreditCard} label="Payment Method" value={`${sub.paymentMethod.brand} •••• ${sub.paymentMethod.last4}`} onClick={() => toast('Change payment method')} />
          <ManageRow icon={RefreshCw} label="Auto Renewal" value={sub.autoRenew ? 'Enabled' : 'Disabled'} onClick={handleAutoRenew} toggle />
          <ManageRow icon={FileText} label="Billing History" onClick={() => { setShowManage(false); toast('Billing history') }} />
          <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8 }}>
            <Button variant="danger" size="sm" onClick={() => { setShowManage(false); setShowConfirm({ type: 'cancel' }) }}
              style={{ width: '100%', justifyContent: 'center' }}>
              Cancel Subscription
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!showConfirm} onClose={() => { if (!processing) setShowConfirm(null) }} title="Confirm" maxWidth={380}>
        {showConfirm?.type === 'cancel' ? (
          <>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
              Are you sure you want to cancel your {PLAN_LABELS[sub.plan]} subscription? You'll still have access until the end of the current billing period.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="secondary" size="sm" onClick={() => setShowConfirm(null)} disabled={!!processing}>Keep Plan</Button>
              <Button variant="danger" size="sm" onClick={handleConfirm} loading={!!processing}>Confirm Cancel</Button>
            </div>
          </>
        ) : showConfirm?.plan ? (
          <>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
              {showConfirm.type === 'reactivate' ? 'Reactivate your plan? Billing will resume.' : `Upgrade to ${PLAN_LABELS[showConfirm.plan]}? Your plan will change immediately.`}
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="secondary" size="sm" onClick={() => setShowConfirm(null)} disabled={!!processing}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleConfirm} loading={!!processing}>Confirm</Button>
            </div>
          </>
        ) : null}
      </Modal>
    </motion.div>
  )
}

function ManageRow({ icon: Icon, label, value, onClick, toggle }: { icon: any; label: string; value?: string; onClick: () => void; toggle?: boolean }) {
  return (
    <motion.button whileHover={{ background: 'rgba(255,255,255,0.03)' }} onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-primary)' }}>
      <Icon size={14} style={{ color: 'var(--text-dim)' }} />
      <span style={{ fontSize: 11, fontWeight: 500, flex: 1, textAlign: 'left' }}>{label}</span>
      {toggle ? (
        <span style={{ fontSize: 10, fontWeight: 600, color: value === 'Enabled' ? 'var(--green)' : 'var(--text-dim)' }}>{value}</span>
      ) : value ? (
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{value}</span>
      ) : null}
    </motion.button>
  )
}
