import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Monitor, Smartphone, Key } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useStore } from '../lib/store'
import { ACCENT_COLORS, applyAccent, applyTheme } from '../lib/theme'
import { applyLanguage, LANGUAGE_OPTIONS } from '../lib/i18n'
import { Button } from '../components/ui/Button'
import { Toggle } from '../components/ui/Toggle'

const settingsSchema = z.object({
  darkMode: z.boolean(),
  language: z.string(),
  notifications: z.object({
    price: z.boolean(), earnings: z.boolean(), aiSignal: z.boolean(), system: z.boolean(),
  }),
  security: z.object({
    twoFactor: z.boolean(), sessionTimeout: z.number().min(5).max(120), dataSharing: z.boolean(),
  }),
})

type SettingsForm = z.infer<typeof settingsSchema>

const devices = [
  { name: 'Windows PC', icon: Monitor, lastActive: 'Active now', online: true },
  { name: 'iPhone 15 Pro', icon: Smartphone, lastActive: '2 hours ago', online: false },
]

export default function SettingsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const store = useStore()
  const [saving, setSaving] = useState(false)

  const { handleSubmit, watch, setValue, reset, formState: { isDirty } } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      darkMode: store.darkMode,
      language: store.language,
      notifications: { ...store.notifications },
      security: { ...store.security },
    },
  })

  const values = watch()
  const isDirtyRef = useRef(isDirty)
  isDirtyRef.current = isDirty

  useEffect(() => { store.setDarkMode(values.darkMode); applyTheme(values.darkMode) }, [values.darkMode])
  useEffect(() => { store.setLanguage(values.language); applyLanguage(values.language) }, [values.language])

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { if (isDirtyRef.current) { e.preventDefault(); e.returnValue = '' } }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  const onSubmit = useCallback(async (data: SettingsForm) => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 600))
    try {
      localStorage.setItem('marketpulse_store', JSON.stringify({
        state: { ...store, darkMode: data.darkMode, language: data.language, notifications: data.notifications, security: data.security },
      }))
      store.setDarkMode(data.darkMode)
      store.setLanguage(data.language)
      store.setNotifications(data.notifications)
      store.setSecurity(data.security)
      applyTheme(data.darkMode)
      applyLanguage(data.language)
      toast.success(t('settings.saved'))
      reset(data)
    } catch {
      toast.error('Failed to save settings')
    }
    setSaving(false)
  }, [store, t, reset])

  const handleCancel = useCallback(() => {
    const defaults = { darkMode: store.darkMode, language: store.language, notifications: { ...store.notifications }, security: { ...store.security } }
    reset(defaults)
    applyTheme(defaults.darkMode)
    applyLanguage(defaults.language)
  }, [store, reset])

  const handleAccentClick = (name: string) => {
    store.setAccentColor(name)
    applyAccent(name)
    const s = JSON.parse(localStorage.getItem('marketpulse_store') || '{}')
    if (s.state) { s.state.accentColor = name; localStorage.setItem('marketpulse_store', JSON.stringify(s)) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <motion.button whileHover={{ x: -2 }} whileTap={{ scale: 0.97 }} onClick={() => navigate(-1)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px 0', marginBottom: 16, fontSize: 12 }}
        aria-label="Go back"
      >
        <ArrowLeft size={14} /> {t('nav.dashboard')}
      </motion.button>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="glass-card" style={{ padding: 20, borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>{t('settings.appearance')}</h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>{t('settings.theme')}</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { value: true, label: t('settings.dark') },
                  { value: false, label: t('settings.light') },
                ].map(item => (
                  <motion.button
                    key={String(item.value)}
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setValue('darkMode', item.value, { shouldDirty: true })}
                    style={{
                      flex: 1, padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                      background: values.darkMode === item.value ? 'var(--accent-dim)' : 'rgba(255,255,255,0.02)',
                      border: values.darkMode === item.value ? '1px solid var(--accent)' : '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 600,
                      color: values.darkMode === item.value ? 'var(--accent)' : 'var(--text-secondary)',
                      transition: 'all 0.15s',
                    }}
                  >
                    {item.label}
                  </motion.button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>{t('settings.accent')}</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {ACCENT_COLORS.map(a => {
                  const isActive = store.accentColor === a.name
                  return (
                    <motion.button
                      key={a.name}
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleAccentClick(a.name)}
                      title={a.name}
                      aria-label={`Set accent color to ${a.name}`}
                      style={{
                        width: 32, height: 32, borderRadius: 8, background: a.color,
                        border: isActive ? '2px solid white' : '2px solid transparent',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: isActive ? `0 0 12px ${a.color}40` : 'none',
                        transition: 'all 0.15s',
                      }}
                    >
                      {isActive && (
                        <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </motion.svg>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>{t('settings.language')}</label>
              <select
                value={values.language}
                onChange={e => setValue('language', e.target.value, { shouldDirty: true })}
                className="input-premium"
                style={{ width: '100%', padding: '8px 12px', fontSize: 12, borderRadius: 8, cursor: 'pointer' }}
                aria-label={t('settings.language')}
              >
                {LANGUAGE_OPTIONS.map(l => <option key={l.value} value={l.label}>{l.label}</option>)}
              </select>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-card" style={{ padding: 20, borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>{t('settings.notifications')}</h3>
            {[
              { key: 'price' as const, label: t('settings.priceAlerts'), desc: t('settings.priceAlertsDesc') },
              { key: 'earnings' as const, label: t('settings.earnings'), desc: t('settings.earningsDesc') },
              { key: 'aiSignal' as const, label: t('settings.aiSignal'), desc: t('settings.aiSignalDesc') },
              { key: 'system' as const, label: t('settings.system'), desc: t('settings.systemDesc') },
            ].map(item => (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 2 }}>{item.desc}</div>
                </div>
                <Toggle
                  checked={values.notifications[item.key]}
                  onChange={() => setValue(`notifications.${item.key}`, !values.notifications[item.key], { shouldDirty: true })}
                  ariaLabel={item.label}
                />
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="glass-card" style={{ padding: 20, borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>{t('settings.security')}</h3>
            {[
              { key: 'twoFactor' as const, label: t('settings.twoFactor'), value: values.security.twoFactor, type: 'toggle' as const },
              { key: 'sessionTimeout' as const, label: t('settings.sessionTimeout'), value: `${values.security.sessionTimeout} min`, type: 'text' as const },
              { key: 'dataSharing' as const, label: t('settings.dataSharing'), value: values.security.dataSharing, type: 'toggle' as const },
            ].map(item => (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{item.label}</span>
                <span style={{ marginLeft: 'auto' }}>
                  {item.type === 'toggle' ? (
                    <Toggle
                      checked={!!item.value}
                      onChange={() => setValue(`security.${item.key}`, !item.value, { shouldDirty: true })}
                      ariaLabel={item.label}
                    />
                  ) : (
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</span>
                  )}
                </span>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-card" style={{ padding: 20, borderRadius: 'var(--radius-md)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>{t('settings.devices')}</h3>
            {devices.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, marginBottom: 6 }}>
                <d.icon size={14} style={{ color: 'var(--text-dim)' }} />
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{d.name}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>{d.lastActive}</div>
                </div>
                <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: d.online ? 'var(--green)' : 'var(--text-dim)' }} />
              </div>
            ))}
            <Button variant="secondary" size="sm" onClick={() => toast('Revoking all sessions...')} style={{ width: '100%', marginTop: 6 }}>
              <Key size={11} /> {t('settings.revokeAll')}
            </Button>
          </motion.div>
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 24 }}>
          <Button variant="secondary" size="md" onClick={handleCancel} type="button">
            {t('settings.cancel')}
          </Button>
          <Button variant="primary" size="md" loading={saving} type="submit" disabled={!isDirty}>
            <Save size={13} /> {saving ? t('settings.saving') : t('settings.save')}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
