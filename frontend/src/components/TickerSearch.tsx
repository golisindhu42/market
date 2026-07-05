import { useState } from 'react'
import { Search, X } from 'lucide-react'

interface Props {
  tickers: string[]
  onAdd: (ticker: string) => void
  onRemove: (ticker: string) => void
}

export default function TickerSearch({ tickers, onAdd, onRemove }: Props) {
  const [input, setInput] = useState('')
  const [warning, setWarning] = useState('')

  const handleAdd = () => {
    const val = input.trim().toUpperCase()
    if (!val) return
    if (val.length < 1 || val.length > 5) {
      setWarning('Ticker must be 1-5 characters')
      return
    }
    if (tickers.includes(val)) {
      setWarning(`${val} is already in your watchlist`)
      return
    }
    if (tickers.length >= 10) {
      setWarning('Maximum 10 tickers allowed')
      return
    }
    onAdd(val)
    setInput('')
    setWarning('')
  }

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            value={input}
            onChange={e => { setInput(e.target.value); setWarning('') }}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Search ticker (e.g. TSLA)"
            className="w-full bg-[#1a1a2e] border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          onClick={handleAdd}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
        >
          Add
        </button>
      </div>
      {warning && <p className="text-amber-400 text-xs mb-2">{warning}</p>}
      <div className="flex flex-wrap gap-2 mb-4">
        {tickers.map(t => (
          <span key={t} className="inline-flex items-center gap-1.5 bg-[#1a1a2e] border border-gray-700 rounded-full px-3 py-1 text-sm text-gray-300">
            {t}
            <button onClick={() => onRemove(t)} className="hover:text-red-400 transition-colors">
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}
