import { useState } from 'react'
import { Search, X, Plus, TrendingUp, Star } from 'lucide-react'

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
      setWarning(`${ticker} is already on your watchlist`)
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
      <div className="flex gap-2.5">
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors duration-200" size={14} />
          <input
            type="text"
            value={input}
            onChange={e => { setInput(e.target.value); setWarning('') }}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Search ticker symbol..."
            className="w-full input-glass rounded-xl pl-10 pr-4 py-2.5 text-sm"
          />
        </div>
        <button
          onClick={() => handleAdd()}
          disabled={!input.trim()}
          className="btn-primary rounded-xl px-5 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Plus size={15} className="inline mr-1" />
          Add
        </button>
      </div>

      {warning && (
        <div className="mt-2 text-amber-400/90 text-[11px] flex items-center gap-1.5 bg-amber-500/8 border border-amber-500/15 rounded-lg px-3 py-2 fade-in">
          <span className="w-1 h-1 rounded-full bg-amber-500 shrink-0" />
          {warning}
        </div>
      )}

      {tickers.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          {tickers.map((t, i) => (
            <span
              key={t}
              className="fade-in inline-flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.08] rounded-full pl-2.5 pr-1 py-1 text-[11px] font-semibold text-gray-300 group/chip"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <Star size={10} className="text-blue-400/60" />
              {t}
              <button
                onClick={() => onRemove(t)}
                className="ml-0.5 p-0.5 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-colors duration-150"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {filteredPresets.length > 0 && tickers.length < 10 && (
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
          <span className="text-[10px] text-gray-600 font-medium uppercase tracking-wider mr-1">Quick add</span>
          {filteredPresets.slice(0, 6).map(p => (
            <button
              key={p}
              onClick={() => handleAdd(p)}
              className="text-[11px] text-gray-500 hover:text-blue-400 bg-white/[0.02] hover:bg-blue-500/8 border border-white/[0.04] hover:border-blue-500/20 rounded-full px-2.5 py-1 transition-all duration-200 flex items-center gap-1"
            >
              <TrendingUp size={9} />
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
