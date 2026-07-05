import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  tickers: string[]
}

const SUGGESTIONS = [
  'Why is TSLA moving today?',
  'Compare my watchlist',
  'What is the market sentiment?',
  'Any anomalies I should know?',
]

export default function AIChatPanel({ tickers }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
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
      setMessages(prev => [...prev, { role: 'assistant', content: 'AI service unavailable. Ensure the backend is running.' }])
    }
    setLoading(false)
  }

  return (
    <div className="terminal-card flex flex-col" style={{ height: 380 }}>
      <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'linear-gradient(135deg, #ff8f00, #ff6d00)' }} />
        <span className="text-sm font-semibold text-white">AI Copilot</span>
        <span className="ml-auto text-[10px] text-muted" style={{ fontFamily: 'var(--font-mono)' }}>GROQ</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {messages.length === 0 && (
          <div className="space-y-1.5">
            <div className="text-[10px] text-muted font-semibold uppercase tracking-wider mb-2">Quick Actions</div>
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                className="block w-full text-left text-xs px-2.5 py-2 rounded-sm"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' }}
              >
                <span style={{ color: 'var(--blue)', fontFamily: 'var(--font-mono)' }} className="mr-2">&gt;</span>
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} fade-in`}>
            <div className="flex items-start gap-2" style={{ maxWidth: '88%' }}>
              {m.role === 'assistant' && (
                <div style={{ width: 20, height: 20, borderRadius: 4, background: 'linear-gradient(135deg, #448aff, #7c4dff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'white', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>AI</div>
              )}
              <div
                className="text-xs leading-relaxed px-3 py-2"
                style={{
                  borderRadius: 6,
                  background: m.role === 'user' ? 'var(--blue)' : 'var(--bg-secondary)',
                  color: m.role === 'user' ? 'white' : 'var(--text-secondary)',
                  border: m.role === 'assistant' ? '1px solid var(--border-primary)' : 'none',
                }}
              >
                {m.content}
              </div>
              {m.role === 'user' && (
                <div style={{ width: 20, height: 20, borderRadius: 4, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>U</div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start fade-in">
            <div className="flex items-start gap-2">
              <div style={{ width: 20, height: 20, borderRadius: 4, background: 'linear-gradient(135deg, #448aff, #7c4dff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'white', fontWeight: 700, flexShrink: 0 }}>AI</div>
              <div className="flex gap-1 px-3 py-2.5 rounded-sm" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
                <span className="w-1 h-1 rounded-full" style={{ background: 'var(--text-muted)', animation: 'pulse 1.4s infinite' }} />
                <span className="w-1 h-1 rounded-full" style={{ background: 'var(--text-muted)', animation: 'pulse 1.4s infinite', animationDelay: '0.2s' }} />
                <span className="w-1 h-1 rounded-full" style={{ background: 'var(--text-muted)', animation: 'pulse 1.4s infinite', animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3" style={{ borderTop: '1px solid var(--border-primary)' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)}
            placeholder="Ask about the market..."
            className="terminal-input flex-1 px-2.5 py-1.5 text-xs"
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            className="terminal-btn px-3 text-xs disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
