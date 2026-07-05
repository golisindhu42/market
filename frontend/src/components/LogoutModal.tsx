import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, X } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}

export default function LogoutModal({ isOpen, onClose, onConfirm, loading }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 200 }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card-elevated"
            style={{
              position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              zIndex: 201, width: 320, padding: 20, borderRadius: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--red-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LogOut size={16} style={{ color: 'var(--red)' }} />
              </div>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} title="Close" style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 4 }}>
                <X size={16} />
              </motion.button>
            </div>

            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Sign out</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 20 }}>
              Are you sure you want to sign out? Your session will be terminated.
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="btn-secondary"
                style={{ flex: 1, padding: '10px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600 }}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                disabled={loading}
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                  background: 'var(--red)', color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? 'Signing out...' : 'Sign out'}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
