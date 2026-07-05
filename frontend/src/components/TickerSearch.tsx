import { useState } from 'react'

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
      setWarning(`${ticker} already on watchlist`)
      return
    }
    if (tickers.length >= 10) {
      setWarning('Max 10 tickers')
      return
    }
    onAdd(ticker)
    setInput('')
    setWarning('')
  }

  const filteredPresets = PRESETS.filter(p => !tickers.includes(p))

  return (
    <div className="mb-4">
      <div className="flex gap-2">
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            value={input}
            onChange={e => { setInput(e.target.value); setWarning('') }}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Search ticker (e.g. TSLA, AAPL)..."
            className="terminal-input w-full px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={() => handleAdd()}
          disabled={!input.trim()}
          className="terminal-btn px-4 text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
        >
          + Add
        </button>
      </div>

      {warning && (
        <div className="mt-1.5 text-xs px-2.5 py-1.5 rounded-sm fade-in" style={{ background: 'var(--amber-dim)', color: '#ffab00', border: '1px solid rgba(255,171,0,0.2)' }}>
          {warning}
        </div>
      )}

      {tickers.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
          {tickers.map(t => (
            <span key={t} className="terminal-chip fade-in">
              {t}
              <span className="terminal-chip-remove" onClick={() => onRemove(t)}>&#x2715;</span>
            </span>
          ))}
        </div>
      )}

      {filteredPresets.length > 0 && tickers.length < 10 && (
        <div className="flex flex-wrap items-center gap-1 mt-2">
          <span className="text-[10px] text-muted font-semibold uppercase tracking-wider mr-1">Quick:</span>
          {filteredPresets.slice(0, 6).map(p => (
            <button
              key={p}
              onClick={() => handleAdd(p)}
              className="terminal-btn-outline text-[11px] px-2 py-0.5"
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
