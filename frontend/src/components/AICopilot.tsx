import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Mic, Sparkles, Bot, User, X } from 'lucide-react'
import axios from 'axios'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  tickers: string[]
  isOpen?: boolean
  onClose?: () => void
  sidebar?: boolean
}

const SUGGESTIONS = [
  'Analyze TSLA price action today',
  'Compare NVDA vs AMD outlook',
  'What is the market sentiment?',
  'Summarize recent news for AAPL',
]

export default function AICopilot({ tickers, isOpen, onClose, sidebar }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your AI market copilot. Ask me anything about your watchlist." }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setInput('')
    setLoading(true)
    try {
      const base = import.meta.env.VITE_API_BASE_URL || ''
      const res = await axios.post(`${base}/api/ai/chat`, { question: text, tickers })
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'AI service unavailable. Please ensure the backend is running.' }])
    }
    setLoading(false)
  }

  const handleVoice = () => {
    setIsListening(!isListening)
    if (!isListening) {
      setTimeout(() => setIsListening(false), 2000)
    }
  }

  const panelContent = (
    <>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, var(--purple), var(--blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px var(--purple-glow)' }}>
          <Sparkles size={13} className="text-white" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>AI Copilot</div>
          <div style={{ fontSize: 9, color: 'var(--text-dim)', fontWeight: 500 }}>Powered by Groq</div>
        </div>
        {sidebar && <span style={{ marginLeft: 'auto', fontSize: 9, color: 'var(--text-dim)', background: 'var(--bg-card)', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>⌘K</span>}
        {sidebar && <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} title="Close (ESC)" style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 4 }}><X size={16} /></motion.button>}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}
          >
            <div style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: m.role === 'assistant' ? 'linear-gradient(135deg, var(--purple), var(--blue))' : 'var(--bg-card)', border: m.role === 'user' ? '1px solid var(--border)' : 'none' }}>
              {m.role === 'assistant' ? <Bot size={11} className="text-white" /> : <User size={11} style={{ color: 'var(--text-muted)' }} />}
            </div>
            <div style={{ flex: 1, fontSize: 12, lineHeight: 1.6, color: m.role === 'user' ? 'var(--text-secondary)' : 'var(--text-primary)', padding: m.role === 'user' ? '4px 0' : undefined }}>
              {m.content}
            </div>
          </motion.div>
        ))}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg, var(--purple), var(--blue))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={11} className="text-white" />
            </div>
            <div style={{ display: 'flex', gap: 3, padding: '8px 0' }}>
              <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0 }} className="typing-dot" />
              <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="typing-dot" />
              <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="typing-dot" />
            </div>
          </motion.div>
        )}
        {messages.length === 1 && !loading && (
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontSize: 10, color: 'var(--text-dim)', fontWeight: 600, marginBottom: 4, letterSpacing: '0.3px', textTransform: 'uppercase' }}>Suggested</div>
            {SUGGESTIONS.map(s => (
              <motion.button
                key={s}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => send(s)}
                style={{ textAlign: 'left', padding: '8px 10px', borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer', transition: 'all 0.15s' }}
              >
                <span style={{ color: 'var(--blue)', fontFamily: 'var(--font-mono)', marginRight: 6 }}>&gt;</span>
                {s}
              </motion.button>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={handleVoice} title="Voice input" className="btn-secondary" style={{ padding: '6px', borderRadius: 8, background: isListening ? 'var(--red-dim)' : undefined, borderColor: isListening ? 'rgba(239,68,68,0.3)' : undefined }}>
            <Mic size={14} style={{ color: isListening ? 'var(--red)' : undefined }} />
          </motion.button>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)}
            placeholder="Ask about the market..."
            className="input-premium"
            style={{ flex: 1, padding: '7px 10px', fontSize: 12, borderRadius: 8 }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            title="Send"
            className="btn-primary"
            style={{ padding: '6px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, opacity: loading || !input.trim() ? 0.4 : 1 }}
          >
            <Send size={13} />
          </motion.button>
        </div>
      </div>
    </>
  )

  if (sidebar) {
    return (
      <motion.aside
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: isOpen ? 0 : '100%', opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="glass-card-elevated"
        style={{ position: 'fixed', right: 0, top: 0, bottom: 0, zIndex: 60, width: 400, display: 'flex', flexDirection: 'column', borderRadius: 0, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
      >
        {panelContent}
      </motion.aside>
    )
  }

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: 500, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      {panelContent}
    </div>
  )
}
