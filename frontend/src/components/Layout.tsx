import { useState, useCallback } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import TopNav from './TopNav'
import AICopilot from './AICopilot'
import NotificationDrawer from './NotificationDrawer'
import IndicatorsPanel from './IndicatorsPanel'
import AlertToast from './AlertToast'
import LogoutModal from './LogoutModal'
import { useDashboard } from '../context/DashboardContext'

export default function Layout() {
  const navigate = useNavigate()
  const {
    tickers, addTicker, removeTicker, connected, alerts, dismissAlert, addToast,
    recentSearches, showAISidebar, setShowAISidebar,
    showNotifications, setShowNotifications,
    showIndicators, setShowIndicators,
    isFullscreen, setIsFullscreen,
    indicatorConfig, setIndicatorConfig,
    toasts, markAllAlertsRead,
  } = useDashboard()

  const [showLogout, setShowLogout] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)

  const handleLogout = useCallback(() => {
    setLogoutLoading(true)
    setTimeout(() => {
      localStorage.clear()
      sessionStorage.clear()
      setLogoutLoading(false)
      setShowLogout(false)
      addToast('Logged out successfully', 'success')
      navigate('/login')
    }, 800)
  }, [navigate, addToast])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <TopNav
        tickers={tickers}
        onAdd={addTicker}
        onRemove={removeTicker}
        connected={connected}
        alertCount={alerts.length}
        onOpenAI={() => setShowAISidebar(true)}
        onOpenNotifications={() => setShowNotifications(true)}
        recentSearches={recentSearches}
        addToast={addToast}
        onNavigate={navigate}
        onLogout={() => setShowLogout(true)}
      />

      <main style={{ maxWidth: isFullscreen ? '100%' : 1440, margin: '0 auto', padding: isFullscreen ? 0 : '20px 24px 40px', transition: 'max-width 0.3s, padding 0.3s' }}>
        <Outlet context={{ isFullscreen, setIsFullscreen }} />
      </main>

      <AnimatePresence>
        {showAISidebar && (
          <AICopilot tickers={tickers} isOpen={showAISidebar} onClose={() => setShowAISidebar(false)} sidebar />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNotifications && (
          <NotificationDrawer alerts={alerts} onDismiss={dismissAlert} onMarkAllRead={markAllAlertsRead} onClose={() => setShowNotifications(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showIndicators && (
          <IndicatorsPanel config={indicatorConfig} onToggle={(key: string) => setIndicatorConfig(prev => ({ ...prev, [key as keyof typeof prev]: !prev[key as keyof typeof prev] }))} onClose={() => setShowIndicators(false)} />
        )}
      </AnimatePresence>

      <AlertToast alerts={alerts} onDismiss={dismissAlert} />

      <div style={{ position: 'fixed', bottom: 16, left: 16, zIndex: 100, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {toasts.filter(t => t.id).slice(-3).map(t => (
          <div key={t.id} className="slide-up" style={{
            background: t.type === 'success' ? 'rgba(16,185,129,0.9)' : t.type === 'error' ? 'rgba(239,68,68,0.9)' : 'rgba(59,130,246,0.9)',
            backdropFilter: 'blur(12px)', color: 'white', padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600,
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
          }}>
            {t.message}
          </div>
        ))}
      </div>

      <LogoutModal isOpen={showLogout} onClose={() => setShowLogout(false)} onConfirm={handleLogout} loading={logoutLoading} />
    </div>
  )
}
