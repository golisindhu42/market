import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  success?: boolean
  error?: boolean
  type?: 'button' | 'submit'
  className?: string
  style?: React.CSSProperties
  title?: string
  ariaLabel?: string
}

export function Button({
  children, onClick, variant = 'primary', size = 'sm', loading, disabled, success, error,
  type = 'button', className = '', style, title, ariaLabel,
}: ButtonProps) {
  const isDisabled = disabled || loading
  const sizeStyles = size === 'sm' ? { padding: '6px 12px', fontSize: 11 } : size === 'md' ? { padding: '8px 18px', fontSize: 12 } : { padding: '10px 24px', fontSize: 13 }

  const variants: Record<string, React.CSSProperties> = {
    primary: { background: success ? 'var(--green)' : error ? 'var(--red)' : 'linear-gradient(135deg, var(--accent, var(--blue)), var(--purple))', color: 'white', border: 'none' },
    secondary: { background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-secondary)' },
    danger: { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--red)' },
    ghost: { background: 'transparent', border: 'none', color: 'var(--text-secondary)' },
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      title={title}
      aria-label={ariaLabel}
      aria-disabled={isDisabled}
      whileHover={isDisabled ? {} : { scale: 1.02 }}
      whileTap={isDisabled ? {} : { scale: 0.98 }}
      className={className}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        fontWeight: 600, cursor: isDisabled ? 'not-allowed' : 'pointer', borderRadius: 8,
        opacity: isDisabled ? 0.5 : 1,
        transition: 'all 0.15s',
        outline: 'none',
        ...variants[variant],
        ...sizeStyles,
        ...style,
      }}
      onKeyDown={(e) => { if (e.key === 'Enter' && !isDisabled) onClick?.() }}
    >
      {loading ? <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} style={{ display: 'inline-flex' }}><Loader2 size={12} /></motion.span> : null}
      {children}
    </motion.button>
  )
}
