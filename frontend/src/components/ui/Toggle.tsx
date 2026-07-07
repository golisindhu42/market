import { motion } from 'framer-motion'

interface ToggleProps {
  checked: boolean
  onChange: () => void
  id?: string
  ariaLabel?: string
}

export function Toggle({ checked, onChange, id, ariaLabel }: ToggleProps) {
  return (
    <motion.div
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      tabIndex={0}
      onClick={onChange}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange() } }}
      animate={{ background: checked ? 'var(--accent, var(--blue))' : 'rgba(255,255,255,0.06)' }}
      style={{
        width: 36, height: 20, borderRadius: 10, padding: 2, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: checked ? 'flex-end' : 'flex-start',
        transition: 'background 0.15s', flexShrink: 0, outline: 'none',
      }}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{ width: 16, height: 16, borderRadius: 8, background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
      />
    </motion.div>
  )
}
