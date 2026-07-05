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
  'Why is TSLA moving today',
  'Compare my watchlist',
  'What is the market sentiment today',
  'Any anomalies I should know about',
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
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I could not reach the AI service. Make sure the backend is running.' }])
    }
    setLoading(false)
  }

  return (
    <div className="glass-card rounded-xl flex flex-col h-[400px] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
          <Sparkles size={12} className="text-white" />
        </div>
        <span className="text-sm font-semibold text-white">AI Copilot</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-[11px] text-gray-600 font-medium uppercase tracking-wider mb-3">Suggested</p>
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                className="block w-full text-left text-xs text-gray-400 bg-white/5 hover:bg-white/10 rounded-lg px-3 py-2.5 transition-all duration-200 border border-white/5 hover:border-blue-500/20"
              >
                <span className="text-blue-400/60 mr-1.5">→</span>
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} fade-in`}>
            <div className="flex items-start gap-2 max-w-[85%]">
              {m.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={12} className="text-white" />
                </div>
              )}
              <div
                className={`rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-white/5 text-gray-300 border border-white/5'
                }`}
              >
                {m.content}
              </div>
              {m.role === 'user' && (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User size={12} className="text-white" />
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                <Bot size={12} className="text-white" />
              </div>
              <div className="bg-white/5 rounded-xl px-3.5 py-3 flex gap-1 border border-white/5">
                <span className="typing-dot w-1.5 h-1.5 bg-gray-500 rounded-full inline-block" />
                <span className="typing-dot w-1.5 h-1.5 bg-gray-500 rounded-full inline-block" />
                <span className="typing-dot w-1.5 h-1.5 bg-gray-500 rounded-full inline-block" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-3 border-t border-white/5">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)}
            placeholder="Ask about the market..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all duration-200"
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            className="p-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-all duration-200 shadow-lg shadow-blue-600/20"
          >
            <Send size={15} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
