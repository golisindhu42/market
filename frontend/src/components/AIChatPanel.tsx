import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Bot, User } from 'lucide-react'
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
    const userMsg: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const base = import.meta.env.VITE_API_BASE_URL || ''
      const res = await axios.post(`${base}/api/ai/chat`, {
        question: text,
        tickers,
      })
      const aiMsg: Message = { role: 'assistant', content: res.data.answer }
      setMessages(prev => [...prev, aiMsg])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'AI service unavailable. Ensure the backend is running.' }])
    }
    setLoading(false)
  }

  return (
    <div className="glass-card rounded-xl flex flex-col h-[420px] overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/[0.04]">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Sparkles size={11} className="text-white" />
        </div>
        <div>
          <span className="text-sm font-semibold text-white">AI Copilot</span>
          <p className="text-[9px] text-gray-600 font-medium uppercase tracking-wider leading-none">Powered by Groq</p>
        </div>
        <span className="ml-auto text-[10px] text-gray-700 font-medium bg-white/[0.03] px-2 py-0.5 rounded-full">beta</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-[10px] text-gray-600 font-semibold uppercase tracking-wider mb-3">Quick actions</p>
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                className="block w-full text-left text-xs text-gray-400 bg-white/[0.03] hover:bg-white/[0.06] rounded-lg px-3 py-2.5 transition-all duration-200 border border-white/[0.04] hover:border-blue-500/20 group"
              >
                <span className="text-blue-400/40 group-hover:text-blue-400 transition-colors mr-2 font-mono">&gt;</span>
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} fade-in`}>
            <div className="flex items-start gap-2.5 max-w-[88%]">
              {m.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 mt-0.5 shadow-lg shadow-blue-500/20">
                  <Bot size={11} className="text-white" />
                </div>
              )}
              <div
                className={`rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-white/[0.04] text-gray-300 border border-white/[0.04]'
                }`}
              >
                {m.content}
              </div>
              {m.role === 'user' && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User size={11} className="text-white" />
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start fade-in">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                <Bot size={11} className="text-white" />
              </div>
              <div className="bg-white/[0.04] rounded-xl px-4 py-3 flex gap-1.5 border border-white/[0.04]">
                <span className="typing-dot w-1.5 h-1.5 bg-gray-500 rounded-full inline-block" />
                <span className="typing-dot w-1.5 h-1.5 bg-gray-500 rounded-full inline-block" />
                <span className="typing-dot w-1.5 h-1.5 bg-gray-500 rounded-full inline-block" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-white/[0.04]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)}
            placeholder="Ask about the market..."
            className="flex-1 input-glass rounded-lg px-3.5 py-2.5 text-sm"
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            className="p-2.5 btn-primary rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send size={14} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
