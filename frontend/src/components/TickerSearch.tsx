import { useState } from 'react'
import { Search, X, Plus, TrendingUp } from 'lucide-react'

interface Props {
  tickers: string[]
  onAdd: (ticker: string) => void
  onRemove: (ticker: string) => void
}

const PRESETS = ['TSLA', 'AAPL', 'NVDA', 'AMZN', 'GOOGL', 'MSFT', 'META', 'SPY', 'QQQ', 'AMD']

export default function TickerSearch({ tickers, onAdd, onRemove }: Props) {
  const [input, setInput] = useState('')
  const [warning, setWarning] = useState('')

  const handleAdd = (val?: string) => {
    const ticker = (val || input).trim().toUpperCase()
    if (!ticker) return
    if (ticker.length < 1 || ticker.length > 5) {
      setWarning('Ticker must be 1-5 characters')
      return
    }
    if (tickers.includes(ticker)) {
      setWarning(`${ticker} is already in your watchlist`)
      return
    }
    if (tickers.length >= 10) {
      setWarning('Maximum 10 tickers allowed')
      return
    }
    onAdd(ticker)
    setInput('')
    setWarning('')
  }

  const filteredPresets = PRESETS.filter(p => !tickers.includes(p))

  return (
    <div className="mb-6">
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" size={15} />
          <input
            type="text"
            value={input}
            onChange={e => { setInput(e.target.value); setWarning('') }}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Search ticker symbol..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all duration-200"
          />
        </div>
        <button
          onClick={() => handleAdd()}
          disabled={!input.trim()}
          className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-white text-sm font-medium transition-all duration-200 shadow-lg shadow-blue-600/20 flex items-center gap-1.5"
        >
          <Plus size={15} />
          Add
        </button>
      </div>

      {warning && (
        <div className="text-amber-400/90 text-xs mb-3 flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
          {warning}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {tickers.map(t => (
          <span key={t} className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full px-3 py-1 text-xs font-medium text-blue-300 group">
            {t}
            <button onClick={() => onRemove(t)} className="hover:text-red-400 transition-colors ml-0.5">
              <X size={12} />
            </button>
          </span>
        ))}
        {filteredPresets.length > 0 && tickers.length < 10 && (
          <span className="text-gray-600 text-xs mx-1">|</span>
        )}
        {filteredPresets.slice(0, 6).map(p => (
          !tickers.includes(p) && (
            <button
              key={p}
              onClick={() => handleAdd(p)}
              className="text-xs text-gray-600 hover:text-blue-400 bg-white/[0.03] hover:bg-blue-500/10 border border-white/5 hover:border-blue-500/20 rounded-full px-2.5 py-1 transition-all duration-200 flex items-center gap-1"
            >
              <TrendingUp size={10} />
              {p}
            </button>
          )
        ))}
      </div>
    </div>
  )
}
