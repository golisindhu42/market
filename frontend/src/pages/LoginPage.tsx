import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDashboard } from '../context/DashboardContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { addToast } = useDashboard()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (location.state?.message) addToast(location.state.message, 'info')
  }, [location.state, addToast])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const credentials = new FormData(e.target as HTMLFormElement)
      const username = credentials.get('username') as string
      const password = credentials.get('password') as string

      if (username === 'admin' && password === 'admin') {
        localStorage.setItem('isAuthenticated', 'true')
        addToast('Welcome back, Admin!', 'success')
        const from = location.state?.from?.pathname || '/'
        navigate(from, { replace: true })
      } else {
        addToast('Invalid credentials', 'error')
      }
    } catch {
      addToast('Login failed', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const forgotPassword = () => {
    addToast('Password reset link sent to admin@teslapulse.io', 'success')
  }

  const openSupport = () => {
    window.open('mailto:support@teslapulse.io?subject=Login Issue', '_blank')
  }

  const skipLogin = () => {
    localStorage.setItem('isAuthenticated', 'true')
    addToast('Skipped login - demo mode enabled', 'info')
    navigate('/', { replace: true })
  }

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated')
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [navigate])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #070B14 0%, #0B1120 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(59,130,246,0.06), transparent 70%)' }} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card-elevated"
        style={{
          width: '100%',
          maxWidth: 420,
          padding: 32,
          borderRadius: 20,
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={{ marginBottom: 16 }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                margin: '0 auto',
                borderRadius: 16,
                background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(59,130,246,0.3)',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4-2.4V7z" fill="white" />
              </svg>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#F8FAFC', marginBottom: 6 }}>Welcome Back</h1>
            <p style={{ fontSize: 12, color: '#94A3B8' }}>Sign in to your TeslaPulse account</p>
          </motion.div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          onSubmit={handleLogin}
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <div>
            <label
              htmlFor="username"
              style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#E2E8F0', marginBottom: 6 }}
            >
              Username
            </label>
            <motion.input
              whileFocus={{ scale: 1.02, borderColor: 'rgba(59,130,246,0.4)' }}
              type="text"
              id="username"
              name="username"
              required
              placeholder="Enter your username"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10,
                fontSize: 13,
                color: '#F8FAFC',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#E2E8F0', marginBottom: 6 }}
            >
              Password
            </label>
            <motion.input
              whileFocus={{ scale: 1.02, borderColor: 'rgba(59,130,246,0.4)' }}
              type="password"
              id="password"
              name="password"
              required
              placeholder="Enter your password"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10,
                fontSize: 13,
                color: '#F8FAFC',
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.6 : 1,
              transition: 'all 0.2s',
              marginTop: 8,
            }}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </motion.button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          style={{ marginTop: 20, textAlign: 'center' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={forgotPassword}
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                fontSize: 10,
                cursor: 'pointer',
                textDecoration: 'underline',
                textUnderlineOffset: 2,
              }}
            >
              Forgot password?
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openSupport}
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                fontSize: 10,
                cursor: 'pointer',
                textDecoration: 'underline',
                textUnderlineOffset: 2,
              }}
            >
              Need help?
            </motion.button>
          </div>

          <div
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: '1px solid rgba(255,255,255,0.06)',
              textAlign: 'center',
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              style={{ marginBottom: 8 }}
            >
              <span style={{ fontSize: 10, color: '#64748B' }}>Demo Credentials:</span>
              <br />
              <span style={{ fontSize: 9, color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>admin / admin</span>
            </motion.div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={skipLogin}
              style={{
                background: 'none',
                border: '1px solid rgba(59,130,246,0.2)',
                color: '#94A3B8',
                fontSize: 10,
                padding: '6px 12px',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Skip login (demo)
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}