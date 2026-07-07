import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Mail, Shield, Key, Clock, Edit3, Lock, Copy, Check, ArrowLeft, Trash2, Eye, EyeOff, RefreshCw, Camera, X, Save, AlertTriangle, Smartphone, Monitor, Globe, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDashboard } from '../context/DashboardContext'

interface ApiKey {
  id: string
  name: string
  key: string
  created: string
  lastUsed: string | null
  usage: number
  visible: boolean
}

interface LoginSession {
  id: string
  device: string
  os: string
  browser: string
  ip: string
  country: string
  city: string
  time: string
  current: boolean
}

const DEFAULT_API_KEYS: ApiKey[] = [
  { id: '1', name: 'TradingView API', key: 'tv_a1b2c3d4e5f6g7h8i9j0', created: 'Jun 12, 2026', lastUsed: '2 hours ago', usage: 1424, visible: false },
  { id: '2', name: 'Alpha Vantage', key: 'av_k8l9m0n1o2p3q4r5s6t7', created: 'May 3, 2026', lastUsed: '1 day ago', usage: 892, visible: false },
]

const SESSIONS: LoginSession[] = [
  { id: 's1', device: 'Windows PC', os: 'Windows 11', browser: 'Chrome 128', ip: '192.168.1.42', country: 'United States', city: 'New York', time: 'Active now', current: true },
  { id: 's2', device: 'MacBook Pro', os: 'macOS 15', browser: 'Safari 18', ip: '192.168.1.55', country: 'United States', city: 'New York', time: '3 days ago', current: false },
  { id: 's3', device: 'iPhone 15 Pro', os: 'iOS 19', browser: 'Safari Mobile', ip: '10.0.0.8', country: 'United States', city: 'New York', time: '1 week ago', current: false },
  { id: 's4', device: 'TeslaPulse App', os: 'Android 15', browser: 'WebView', ip: '203.0.113.42', country: 'India', city: 'Mumbai', time: '2 weeks ago', current: false },
]

export default function ProfilePage() {
  const navigate = useNavigate()
  const { addToast } = useDashboard()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatar, setAvatar] = useState<string | null>(null)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [editingKeyId, setEditingKeyId] = useState<string | null>(null)
  const [editingKeyName, setEditingKeyName] = useState('')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(() => {
    try { return JSON.parse(localStorage.getItem('marketpulse_api_keys') || 'null') || DEFAULT_API_KEYS } catch { return DEFAULT_API_KEYS }
  })
  const [generatingKey, setGeneratingKey] = useState(false)
  const [deletingKeyId, setDeletingKeyId] = useState<string | null>(null)
  const [regeneratingKeyId, setRegeneratingKeyId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: 'Alex Rivera', email: 'alex@teslapulse.io', phone: '+1 (555) 123-4567' })
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' })
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [savingProfile, setSavingProfile] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null)

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarLoading(true)
    const reader = new FileReader()
    reader.onload = () => {
      setTimeout(() => {
        setAvatar(reader.result as string)
        setAvatarLoading(false)
        addToast('Avatar updated successfully', 'success')
      }, 600)
    }
    reader.readAsDataURL(file)
  }

  const handleAvatarDelete = () => {
    setAvatar(null)
    addToast('Avatar removed', 'info')
  }

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key).then(() => {
      setCopiedKey(key)
      addToast('API key copied to clipboard', 'success')
      setTimeout(() => setCopiedKey(null), 2000)
    }).catch(() => addToast('Failed to copy', 'error'))
  }

  const handleGenerateKey = () => {
    setGeneratingKey(true)
    setTimeout(() => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
      const newKey = Array.from({ length: 20 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
      const newApiKey: ApiKey = {
        id: Date.now().toString(),
        name: 'New API Key',
        key: `mk_${newKey}`,
        created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        lastUsed: null,
        usage: 0,
        visible: false,
      }
      setApiKeys(prev => {
        const next = [newApiKey, ...prev]
        localStorage.setItem('marketpulse_api_keys', JSON.stringify(next))
        return next
      })
      setGeneratingKey(false)
      addToast('API key generated successfully', 'success')
    }, 1200)
  }

  const handleDeleteKey = (id: string) => {
    setDeletingKeyId(id)
    setTimeout(() => {
      setApiKeys(prev => {
        const next = prev.filter(k => k.id !== id)
        localStorage.setItem('marketpulse_api_keys', JSON.stringify(next))
        return next
      })
      setDeletingKeyId(null)
      addToast('API key deleted', 'success')
    }, 800)
  }

  const handleRegenerateKey = (id: string) => {
    setRegeneratingKeyId(id)
    setTimeout(() => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
      const newKey = Array.from({ length: 20 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
      setApiKeys(prev => {
        const next = prev.map(k => k.id === id ? { ...k, key: `mk_${newKey}`, lastUsed: null, usage: 0 } : k)
        localStorage.setItem('marketpulse_api_keys', JSON.stringify(next))
        return next
      })
      setRegeneratingKeyId(null)
      addToast('API key regenerated', 'success')
    }, 1000)
  }

  const handleRenameKey = (id: string, name: string) => {
    setApiKeys(prev => {
      const next = prev.map(k => k.id === id ? { ...k, name } : k)
      localStorage.setItem('marketpulse_api_keys', JSON.stringify(next))
      return next
    })
    setEditingKeyId(null)
    addToast('API key renamed', 'success')
  }

  const toggleKeyVisibility = (id: string) => {
    setApiKeys(prev => prev.map(k => k.id === id ? { ...k, visible: !k.visible } : k))
  }

  const handleSaveProfile = () => {
    if (!editForm.name.trim() || !editForm.email.trim()) {
      addToast('Name and email are required', 'error')
      return
    }
    if (!editForm.email.includes('@')) {
      addToast('Invalid email address', 'error')
      return
    }
    setSavingProfile(true)
    setTimeout(() => {
      setSavingProfile(false)
      setShowEditModal(false)
      addToast('Profile updated successfully', 'success')
    }, 800)
  }

  const handleChangePassword = () => {
    const errors: string[] = []
    if (passwordForm.current.length < 6) errors.push('Current password must be at least 6 characters')
    if (passwordForm.newPass.length < 8) errors.push('New password must be at least 8 characters')
    if (passwordForm.newPass !== passwordForm.confirm) errors.push('Passwords do not match')
    if (passwordForm.newPass === passwordForm.current) errors.push('New password must be different')
    setPasswordErrors(errors)
    if (errors.length > 0) return
    setSavingPassword(true)
    setTimeout(() => {
      setSavingPassword(false)
      setShowPasswordModal(false)
      setPasswordForm({ current: '', newPass: '', confirm: '' })
      setPasswordErrors([])
      addToast('Password changed successfully', 'success')
    }, 1000)
  }

  const handleDeleteAccount = () => {
    setDeletingAccount(true)
    setTimeout(() => {
      setDeletingAccount(false)
      setShowDeleteModal(false)
      localStorage.clear()
      sessionStorage.clear()
      addToast('Account deleted', 'success')
      navigate('/login')
    }, 1500)
  }

  const handleRevokeSession = (id: string) => {
    setRevokingSessionId(id)
    setTimeout(() => {
      setRevokingSessionId(null)
      addToast('Session revoked successfully', 'success')
    }, 800)
  }

  const handleRevokeAll = () => {
    setRevokingSessionId('all')
    setTimeout(() => {
      setRevokingSessionId(null)
      addToast('All other sessions revoked', 'success')
    }, 1000)
  }

  const modalOverlay = (onClose: () => void) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 200 }} />
  )

  const modalBox = (children: React.ReactNode) => (
    <motion.div initial={{ opacity: 0, scale: 0.95, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -8 }} transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }} className="glass-card-elevated" style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 201, width: 400, maxWidth: '90vw', maxHeight: '80vh', overflowY: 'auto', padding: 24, borderRadius: 16 }}>
      {children}
    </motion.div>
  )

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <motion.button whileHover={{ x: -2 }} whileTap={{ scale: 0.97 }} onClick={() => navigate(-1)} title="Go back" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px 0', marginBottom: 16, fontSize: 12 }}>
        <ArrowLeft size={14} /> Back to Dashboard
      </motion.button>

      <div className="glass-card" style={{ padding: 24, borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
            <motion.div whileHover={{ scale: 1.05 }} style={{ width: 72, height: 72, borderRadius: 18, background: avatar ? `url(${avatar}) center/cover` : 'linear-gradient(135deg, var(--blue), var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px var(--blue-glow)', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()} title="Upload avatar">
              {!avatar && <User size={30} className="text-white" />}
            </motion.div>
            <div style={{ position: 'absolute', bottom: -2, right: -2, display: 'flex', gap: 2 }}>
              <motion.button whileTap={{ scale: 0.85 }} onClick={() => fileInputRef.current?.click()} title="Upload avatar" style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}><Camera size={10} /></motion.button>
              {avatar && <motion.button whileTap={{ scale: 0.85 }} onClick={handleAvatarDelete} title="Remove avatar" style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--red)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}><Trash2 size={10} /></motion.button>}
            </div>
            {avatarLoading && <div style={{ position: 'absolute', inset: 0, borderRadius: 18, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RefreshCw size={16} className="text-white" style={{ animation: 'spin 1s linear infinite' }} /></div>}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{editForm.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Administrator</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              <div className="badge badge-buy" style={{ fontSize: 9 }}>Active</div>
              <div className="badge badge-neutral" style={{ fontSize: 9 }}>Pro Plan</div>
              {twoFAEnabled && <div className="badge badge-buy" style={{ fontSize: 9 }}>2FA Enabled</div>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowEditModal(true)} className="btn-primary" style={{ padding: '8px 16px', borderRadius: 10, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Edit3 size={13} /> Edit Profile
            </motion.button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card" style={{ padding: 20, borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Mail size={14} style={{ color: 'var(--text-dim)' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Account Info</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Email', value: editForm.email, icon: Mail },
              { label: 'Phone', value: editForm.phone, icon: Smartphone },
              { label: 'Role', value: 'Administrator', icon: Shield },
              { label: '2FA', value: twoFAEnabled ? 'Enabled' : 'Disabled', icon: Lock, action: () => setShow2FAModal(true), actionLabel: 'Manage' },
              { label: 'Member Since', value: 'January 2026', icon: Clock },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                <item.icon size={12} style={{ color: 'var(--text-dim)' }} />
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item.label}</div>
                <div style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {item.value}
                  {item.action && <motion.button whileTap={{ scale: 0.9 }} onClick={item.action} style={{ background: 'none', border: 'none', color: 'var(--blue)', cursor: 'pointer', fontSize: 10, fontWeight: 600 }}>{item.actionLabel}</motion.button>}
                </div>
              </div>
            ))}
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowPasswordModal(true)} className="btn-secondary" style={{ width: '100%', padding: '8px', borderRadius: 8, fontSize: 11, marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Lock size={11} /> Change Password
          </motion.button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card" style={{ padding: 20, borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Key size={14} style={{ color: 'var(--text-dim)' }} />
            <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>API Keys</div>
            <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>{apiKeys.length} keys</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {apiKeys.map(k => (
              <div key={k.id} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  {editingKeyId === k.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
                      <input value={editingKeyName} onChange={e => setEditingKeyName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleRenameKey(k.id, editingKeyName)} autoFocus className="input-premium" style={{ flex: 1, fontSize: 11, padding: '3px 6px', borderRadius: 4 }} />
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleRenameKey(k.id, editingKeyName)} title="Save" style={{ background: 'none', border: 'none', color: 'var(--green)', cursor: 'pointer', padding: 2 }}><Check size={11} /></motion.button>
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => setEditingKeyId(null)} title="Cancel" style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 2 }}><X size={11} /></motion.button>
                    </div>
                  ) : (
                    <>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{k.name}</span>
                      <motion.button whileTap={{ scale: 0.85 }} onClick={() => { setEditingKeyId(k.id); setEditingKeyName(k.name) }} title="Rename" style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 2 }}><Edit3 size={9} /></motion.button>
                    </>
                  )}
                  <span style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
                    <motion.button whileTap={{ scale: 0.85 }} onClick={() => toggleKeyVisibility(k.id)} title={k.visible ? 'Hide key' : 'Show key'} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 3 }}>
                      {k.visible ? <EyeOff size={10} /> : <Eye size={10} />}
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.85 }} onClick={() => handleCopyKey(k.key)} title="Copy key" style={{ background: 'none', border: 'none', color: copiedKey === k.key ? 'var(--green)' : 'var(--text-dim)', cursor: 'pointer', padding: 3 }}>
                      {copiedKey === k.key ? <Check size={10} /> : <Copy size={10} />}
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.85 }} disabled={regeneratingKeyId === k.id} onClick={() => handleRegenerateKey(k.id)} title="Regenerate" style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 3, opacity: regeneratingKeyId === k.id ? 0.4 : 1 }}>
                      {regeneratingKeyId === k.id ? <RefreshCw size={10} className="spin" /> : <RefreshCw size={10} />}
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.85 }} disabled={deletingKeyId === k.id} onClick={() => handleDeleteKey(k.id)} title="Delete" style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: 3, opacity: deletingKeyId === k.id ? 0.4 : 1 }}>
                      {deletingKeyId === k.id ? <RefreshCw size={10} className="spin" /> : <Trash2 size={10} />}
                    </motion.button>
                  </span>
                </div>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'flex', gap: 4, alignItems: 'center' }}>
                  {k.visible ? k.key : k.key.slice(0, 4) + '•••••••••••••••' + k.key.slice(-4)}
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 9, color: 'var(--text-dim)' }}>
                  <span>Created {k.created}</span>
                  {k.lastUsed && <span>Last used {k.lastUsed}</span>}
                  <span>{k.usage.toLocaleString()} calls</span>
                </div>
              </div>
            ))}
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleGenerateKey} disabled={generatingKey} className="btn-primary" style={{ width: '100%', padding: '8px', borderRadius: 8, fontSize: 11, marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, opacity: generatingKey ? 0.6 : 1 }}>
            {generatingKey ? <><RefreshCw size={11} className="spin" /> Generating...</> : <><Key size={11} /> Generate New Key</>}
          </motion.button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card" style={{ padding: 20, borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Globe size={14} style={{ color: 'var(--text-dim)' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Connected Accounts</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { name: 'GitHub', email: 'alex@github.com', icon: User },
              { name: 'Google', email: 'alex@gmail.com', icon: Mail },
            ].map(a => (
              <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                <a.icon size={14} style={{ color: 'var(--text-secondary)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{a.name}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>{a.email}</div>
                </div>
                <span className="badge badge-buy" style={{ fontSize: 8 }}>Connected</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card" style={{ padding: 20, borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <LogOut size={14} style={{ color: 'var(--text-dim)' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Login Sessions</span>
            </div>
            <motion.button whileTap={{ scale: 0.9 }} disabled={revokingSessionId === 'all'} onClick={handleRevokeAll} title="Revoke all other sessions" style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: revokingSessionId === 'all' ? 'not-allowed' : 'pointer', fontSize: 10, fontWeight: 600, padding: '2px 6px', opacity: revokingSessionId === 'all' ? 0.5 : 1 }}>
              {revokingSessionId === 'all' ? 'Revoking...' : 'Revoke All'}
            </motion.button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {SESSIONS.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px', background: s.current ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.02)', borderRadius: 8, border: s.current ? '1px solid rgba(59,130,246,0.12)' : 'none' }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Monitor size={13} style={{ color: 'var(--text-muted)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{s.device}</span>
                    {s.current && <span className="badge badge-buy" style={{ fontSize: 7, padding: '1px 5px' }}>Current</span>}
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 2, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    <span>{s.os}</span>
                    <span>·</span>
                    <span>{s.browser}</span>
                    <span>·</span>
                    <span>IP: {s.ip}</span>
                    <span>·</span>
                    <span>{s.city}, {s.country}</span>
                    <span>·</span>
                    <span style={{ color: s.current ? 'var(--green)' : 'var(--text-muted)' }}>{s.time}</span>
                  </div>
                </div>
                {!s.current && (
                  <motion.button whileTap={{ scale: 0.85 }} disabled={revokingSessionId === s.id} onClick={() => handleRevokeSession(s.id)} title="Revoke session" style={{ background: 'none', border: 'none', color: 'var(--red-dim)', cursor: revokingSessionId === s.id ? 'not-allowed' : 'pointer', padding: 4, opacity: revokingSessionId === s.id ? 0.5 : 1 }}>
                    {revokingSessionId === s.id ? <RefreshCw size={11} className="spin" /> : <X size={11} />}
                  </motion.button>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div style={{ marginTop: 20, textAlign: 'center', padding: '10px 0' }}>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowDeleteModal(true)} style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: 11, fontWeight: 600, cursor: 'pointer', opacity: 0.7 }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.7'}>
          Delete Account
        </motion.button>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <>
            {modalOverlay(() => setShowEditModal(false))}
            {modalBox(
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Edit Profile</div>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 4 }}><X size={16} /></motion.button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Full Name</label>
                    <input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} className="input-premium" style={{ width: '100%', padding: '8px 12px', fontSize: 12, borderRadius: 8, boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Email</label>
                    <input value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} type="email" className="input-premium" style={{ width: '100%', padding: '8px 12px', fontSize: 12, borderRadius: 8, boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Phone</label>
                    <input value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} className="input-premium" style={{ width: '100%', padding: '8px 12px', fontSize: 12, borderRadius: 8, boxSizing: 'border-box' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowEditModal(false)} className="btn-secondary" style={{ padding: '8px 16px', borderRadius: 8, fontSize: 11 }}>Cancel</motion.button>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleSaveProfile} disabled={savingProfile} className="btn-primary" style={{ padding: '8px 16px', borderRadius: 8, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, opacity: savingProfile ? 0.6 : 1 }}>
                    {savingProfile ? <><RefreshCw size={12} className="spin" /> Saving...</> : <><Save size={12} /> Save</>}
                  </motion.button>
                </div>
              </>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <>
            {modalOverlay(() => setShowPasswordModal(false))}
            {modalBox(
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Change Password</div>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowPasswordModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 4 }}><X size={16} /></motion.button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Current Password</label>
                    <input value={passwordForm.current} onChange={e => setPasswordForm(p => ({ ...p, current: e.target.value }))} type="password" className="input-premium" style={{ width: '100%', padding: '8px 12px', fontSize: 12, borderRadius: 8, boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>New Password</label>
                    <input value={passwordForm.newPass} onChange={e => setPasswordForm(p => ({ ...p, newPass: e.target.value }))} type="password" className="input-premium" style={{ width: '100%', padding: '8px 12px', fontSize: 12, borderRadius: 8, boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>Confirm New Password</label>
                    <input value={passwordForm.confirm} onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))} type="password" className="input-premium" style={{ width: '100%', padding: '8px 12px', fontSize: 12, borderRadius: 8, boxSizing: 'border-box' }} />
                  </div>
                  {passwordErrors.length > 0 && (
                    <div style={{ padding: '8px 10px', background: 'var(--red-dim)', borderRadius: 8 }}>
                      {passwordErrors.map(e => <div key={e} style={{ fontSize: 10, color: 'var(--red)', marginBottom: 2 }}>• {e}</div>)}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setShowPasswordModal(false); setPasswordErrors([]) }} className="btn-secondary" style={{ padding: '8px 16px', borderRadius: 8, fontSize: 11 }}>Cancel</motion.button>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleChangePassword} disabled={savingPassword} className="btn-primary" style={{ padding: '8px 16px', borderRadius: 8, fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, opacity: savingPassword ? 0.6 : 1 }}>
                    {savingPassword ? <><RefreshCw size={12} className="spin" /> Updating...</> : <><Save size={12} /> Update Password</>}
                  </motion.button>
                </div>
              </>
            )}
          </>
        )}
      </AnimatePresence>

      {/* 2FA Modal */}
      <AnimatePresence>
        {show2FAModal && (
          <>
            {modalOverlay(() => setShow2FAModal(false))}
            {modalBox(
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Two-Factor Authentication</div>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShow2FAModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 4 }}><X size={16} /></motion.button>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                  Two-factor authentication adds an extra layer of security to your account. You'll be required to enter a code from your authenticator app when signing in.
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>Authenticator App</div>
                    <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>{twoFAEnabled ? 'Configured and active' : 'Not configured'}</div>
                  </div>
                  <motion.button
                    animate={{ backgroundColor: twoFAEnabled ? 'var(--blue)' : 'rgba(255,255,255,0.06)' }}
                    onClick={() => { setTwoFAEnabled(!twoFAEnabled); addToast(twoFAEnabled ? '2FA disabled' : '2FA enabled', 'success') }}
                    style={{ width: 44, height: 22, borderRadius: 11, padding: 2, cursor: 'pointer', display: 'flex', justifyContent: twoFAEnabled ? 'flex-end' : 'flex-start', border: 'none', transition: 'background 0.15s' }}
                  >
                    <motion.div layout style={{ width: 18, height: 18, borderRadius: 9, background: 'white' }} />
                  </motion.button>
                </div>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShow2FAModal(false)} className="btn-secondary" style={{ width: '100%', padding: '8px', borderRadius: 8, fontSize: 11 }}>Close</motion.button>
              </>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <>
            {modalOverlay(() => setShowDeleteModal(false))}
            {modalBox(
              <>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--red-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <AlertTriangle size={18} style={{ color: 'var(--red)' }} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Delete Account</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
                  This action is permanent and cannot be undone. All your data, portfolio, watchlist, and settings will be deleted immediately.
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowDeleteModal(false)} className="btn-secondary" style={{ flex: 1, padding: '10px', borderRadius: 8, fontSize: 11 }}>Cancel</motion.button>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleDeleteAccount} disabled={deletingAccount} style={{ flex: 1, padding: '10px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: 'var(--red)', color: 'white', border: 'none', cursor: deletingAccount ? 'not-allowed' : 'pointer', opacity: deletingAccount ? 0.6 : 1 }}>
                    {deletingAccount ? 'Deleting...' : 'Delete Account'}
                  </motion.button>
                </div>
              </>
            )}
          </>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        .spin { animation: spin 1s linear infinite }
      `}</style>
    </motion.div>
  )
}
