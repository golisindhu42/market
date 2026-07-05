import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Shield, Key, Clock, Edit3, Lock, Copy, Check, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDashboard } from '../context/DashboardContext'

const apiKeys = [
  { name: 'TradingView API', key: 'tv_xxxxxxxxxxxxx', created: 'Jun 12, 2026' },
  { name: 'Alpha Vantage', key: 'av_yyyyyyyyyyyyy', created: 'May 3, 2026' },
]

const loginHistory = [
  { device: 'Chrome on Windows', ip: '192.168.1.42', time: '2 hours ago', current: true },
  { device: 'Safari on macOS', ip: '192.168.1.55', time: '3 days ago', current: false },
  { device: 'TeslaPulse App', ip: '10.0.0.8', time: '1 week ago', current: false },
]

export default function ProfilePage() {
  const navigate = useNavigate()
  const { addToast } = useDashboard()
  const [copied, setCopied] = useState<string | null>(null)

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopied(key)
    addToast('API key copied to clipboard', 'success')
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <motion.button whileHover={{ x: -2 }} whileTap={{ scale: 0.97 }} onClick={() => navigate(-1)} title="Go back" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px 0', marginBottom: 16, fontSize: 12 }}>
        <ArrowLeft size={14} /> Back to Dashboard
      </motion.button>

      <div className="glass-card" style={{ padding: 24, borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <motion.div whileHover={{ scale: 1.05 }} style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, var(--blue), var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px var(--blue-glow)' }}>
            <User size={28} className="text-white" />
          </motion.div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Alex Rivera</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Administrator</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <div className="badge badge-buy" style={{ fontSize: 9 }}>Active</div>
              <div className="badge badge-neutral" style={{ fontSize: 9 }}>Pro Plan</div>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { addToast('Profile edit coming soon', 'info') }} className="btn-primary" style={{ padding: '8px 16px', borderRadius: 10, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Edit3 size={13} /> Edit Profile
          </motion.button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card" style={{ padding: 20, borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Mail size={14} style={{ color: 'var(--text-dim)' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Account Info</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Email', value: 'alex@teslapulse.io', icon: Mail },
              { label: 'Role', value: 'Administrator', icon: Shield },
              { label: '2FA', value: 'Enabled', icon: Lock },
              { label: 'Member Since', value: 'January 2026', icon: Clock },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                <item.icon size={12} style={{ color: 'var(--text-dim)' }} />
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item.label}</div>
                <div style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: 20, borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Key size={14} style={{ color: 'var(--text-dim)' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>API Keys</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {apiKeys.map(k => (
              <div key={k.name} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{k.name}</span>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => copyKey(k.key)} title="Copy API key" style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === k.key ? 'var(--green)' : 'var(--text-dim)' }}>
                    {copied === k.key ? <Check size={12} /> : <Copy size={12} />}
                  </motion.button>
                </div>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{k.key}</div>
                <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 4 }}>Created {k.created}</div>
              </div>
            ))}
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { addToast('Generate new key', 'info') }} className="btn-secondary" style={{ width: '100%', padding: '8px', borderRadius: 8, fontSize: 11, marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Key size={11} /> Generate New Key
          </motion.button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card" style={{ padding: 20, borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <User size={14} style={{ color: 'var(--text-dim)' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Connected Accounts</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { name: 'GitHub', icon: User, connected: true, email: 'alex@github.com' },
              { name: 'Google', icon: Mail, connected: true, email: 'alex@gmail.com' },
            ].map(a => (
              <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                <a.icon size={14} style={{ color: 'var(--text-secondary)' }} />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{a.name}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>{a.email}</div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <span className="badge badge-buy" style={{ fontSize: 8 }}>Connected</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: 20, borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Clock size={14} style={{ color: 'var(--text-dim)' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Login History</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {loginHistory.map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: h.current ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: h.current ? 'var(--green)' : 'var(--text-dim)' }} />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-primary)' }}>{h.device}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>{h.ip}</div>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: 9, color: 'var(--text-muted)' }}>{h.time}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
