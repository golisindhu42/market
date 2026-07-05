import { useState, useRef, useEffect } from 'react'
import { Send, Zap } from 'lucide-react'
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
    <div className="bg-[#12121e] border border-gray-800 rounded-xl flex flex-col h-[400px]">
      <div className="flex items-center gap-2 p-3 border-b border-gray-800">
        <Zap size={16} className="text-yellow-500" />
        <span className="text-sm font-semibold text-gray-300">AI Market Copilot</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                className="block w-full text-left text-xs text-gray-400 bg-[#1a1a2e] hover:bg-[#25253e] rounded-lg px-3 py-2 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#1a1a2e] text-gray-300'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#1a1a2e] rounded-xl px-3 py-2 flex gap-1">
              <span className="typing-dot w-2 h-2 bg-gray-500 rounded-full inline-block" />
              <span className="typing-dot w-2 h-2 bg-gray-500 rounded-full inline-block" />
              <span className="typing-dot w-2 h-2 bg-gray-500 rounded-full inline-block" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)}
            placeholder="Ask about the market..."
            className="flex-1 bg-[#1a1a2e] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
