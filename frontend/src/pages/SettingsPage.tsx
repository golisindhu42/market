import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Moon, Sun, Bell, Shield, Key, Smartphone, Save, ArrowLeft, Monitor, Palette } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDashboard } from '../context/DashboardContext'

const LS_SETTINGS = 'marketpulse_settings'
const DEFAULT_SETTINGS = {
  darkMode: true,
  language: 'English',
  accent: 'Blue',
  notifications: { price: true, earnings: true, aiSignal: true, system: false },
}

const languages = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Chinese']
const accentColors = [
  { name: 'Blue', color: '#3B82F6' },
  { name: 'Purple', color: '#8B5CF6' },
  { name: 'Emerald', color: '#10B981' },
  { name: 'Amber', color: '#F59E0B' },
  { name: 'Rose', color: '#F43F5E' },
]

function loadSettings() {
  try {
    const s = localStorage.getItem(LS_SETTINGS)
    if (s) return { ...DEFAULT_SETTINGS, ...JSON.parse(s) }
  } catch {}
  return DEFAULT_SETTINGS
}

function applyTheme(dark: boolean) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
}

function applyAccent(name: string) {
  const c = accentColors.find(a => a.name === name)
  if (c) document.documentElement.style.setProperty('--accent', c.color)
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const { addToast } = useDashboard()
  const [darkMode, setDarkMode] = useState(true)
  const [selectedLang, setSelectedLang] = useState('English')
  const [selectedAccent, setSelectedAccent] = useState('Blue')
  const [notifications, setNotifications] = useState({ price: true, earnings: true, aiSignal: true, system: false })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const s = loadSettings()
    setDarkMode(s.darkMode)
    setSelectedLang(s.language)
    setSelectedAccent(s.accent)
    setNotifications(s.notifications)
    applyTheme(s.darkMode)
    applyAccent(s.accent)
  }, [])

  useEffect(() => {
    applyTheme(darkMode)
  }, [darkMode])

  const handleSave = () => {
    setSaving(true)
    const settings = { darkMode, language: selectedLang, accent: selectedAccent, notifications }
    localStorage.setItem(LS_SETTINGS, JSON.stringify(settings))
    applyTheme(darkMode)
    applyAccent(selectedAccent)
    setTimeout(() => {
      setSaving(false)
      addToast('Settings saved successfully', 'success')
    }, 400)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <motion.button whileHover={{ x: -2 }} whileTap={{ scale: 0.97 }} onClick={() => navigate(-1)} title="Go back" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px 0', marginBottom: 16, fontSize: 12 }}>
        <ArrowLeft size={14} /> Back to Dashboard
      </motion.button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card" style={{ padding: 20, borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Palette size={14} style={{ color: 'var(--text-dim)' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Appearance</span>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>Theme</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { mode: true, label: 'Dark Mode', icon: Moon },
                { mode: false, label: 'Light Mode', icon: Sun },
              ].map(item => (
                <motion.button
                  key={item.label}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setDarkMode(item.mode)}
                  style={{
                    flex: 1, padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                    background: darkMode === item.mode ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.02)',
                    border: darkMode === item.mode ? '1px solid rgba(59,130,246,0.3)' : '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 600,
                    color: darkMode === item.mode ? 'var(--blue)' : 'var(--text-secondary)',
                    transition: 'all 0.15s',
                  }}
                >
                  <item.icon size={14} />
                  {item.label}
                </motion.button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>Accent Color</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {accentColors.map(a => (
                <motion.button
                  key={a.name}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedAccent(a.name)}
                  title={a.name}
                  style={{
                    width: 32, height: 32, borderRadius: 8, background: a.color, border: selectedAccent === a.name ? '2px solid white' : '2px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: selectedAccent === a.name ? `0 0 12px ${a.color}40` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8 }}>Language</div>
            <select value={selectedLang} onChange={e => setSelectedLang(e.target.value)}
              className="input-premium"
              style={{ width: '100%', padding: '8px 12px', fontSize: 12, borderRadius: 8, cursor: 'pointer' }}
            >
              {languages.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: 20, borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Bell size={14} style={{ color: 'var(--text-dim)' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Notifications</span>
          </div>
          {[
            { key: 'price' as const, label: 'Price Alerts', desc: 'Notify on significant price movements' },
            { key: 'earnings' as const, label: 'Earnings Reports', desc: 'Upcoming earnings announcements' },
            { key: 'aiSignal' as const, label: 'AI Signals', desc: 'AI-generated buy/sell signals' },
            { key: 'system' as const, label: 'System Updates', desc: 'Platform maintenance and updates' },
          ].map(item => (
            <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div>
                <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 2 }}>{item.desc}</div>
              </div>
              <motion.div
                animate={{ backgroundColor: notifications[item.key] ? 'var(--blue)' : 'rgba(255,255,255,0.06)' }}
                onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                style={{ width: 36, height: 20, borderRadius: 10, padding: 2, cursor: 'pointer', display: 'flex', justifyContent: notifications[item.key] ? 'flex-end' : 'flex-start', transition: 'background 0.15s' }}
              >
                <motion.div layout style={{ width: 16, height: 16, borderRadius: 8, background: 'white' }} />
              </motion.div>
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card" style={{ padding: 20, borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Shield size={14} style={{ color: 'var(--text-dim)' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Security & Privacy</span>
          </div>
          {[
            { label: 'Two-Factor Auth', value: 'Enabled', color: 'var(--green)' },
            { label: 'Session Timeout', value: '30 minutes' },
            { label: 'Data Sharing', value: 'Disabled', color: 'var(--text-dim)' },
            { label: 'Email Notifications', value: 'Enabled', color: 'var(--green)' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item.label}</span>
              <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 600, color: item.color || 'var(--text-primary)' }}>{item.value}</span>
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: 20, borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Smartphone size={14} style={{ color: 'var(--text-dim)' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Connected Devices</span>
          </div>
          {[
            { name: 'Windows PC', icon: Monitor, lastActive: 'Active now' },
            { name: 'iPhone 15 Pro', icon: Smartphone, lastActive: '2 hours ago' },
          ].map(d => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, marginBottom: 6 }}>
              <d.icon size={14} style={{ color: 'var(--text-dim)' }} />
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{d.name}</div>
                <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>{d.lastActive}</div>
              </div>
              <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: d.lastActive === 'Active now' ? 'var(--green)' : 'var(--text-dim)' }} />
            </div>
          ))}
          <motion.button whileTap={{ scale: 0.98 }} onClick={() => { addToast('Revoking all sessions...', 'info') }} className="btn-secondary" style={{ width: '100%', padding: '8px', borderRadius: 8, fontSize: 11, marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Key size={11} /> Revoke All Sessions
          </motion.button>
        </motion.div>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 24 }}>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate(-1)} className="btn-secondary" style={{ padding: '10px 20px', borderRadius: 10, fontSize: 12, fontWeight: 600 }}>
          Cancel
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving} className="btn-primary" style={{ padding: '10px 20px', borderRadius: 10, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, opacity: saving ? 0.6 : 1 }}>
          <Save size={13} /> {saving ? 'Saving...' : 'Save Changes'}
        </motion.button>
      </div>
    </motion.div>
  )
}
