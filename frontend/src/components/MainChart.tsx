import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Maximize2, Minimize2, ZoomIn, ZoomOut, RefreshCw, TrendingUp, Activity, Eye, EyeOff } from 'lucide-react'
import { createChart, ColorType, LineStyle, AreaSeries } from 'lightweight-charts'
import type { IChartApi } from 'lightweight-charts'

interface Props {
  data: { time: string; value: number; open: number; high: number; low: number; close: number; volume: number }[]
  ticker: string
  tickers: string[]
  onTickerClick: (t: string) => void
  timeframe: string
  onTimeframeChange: (tf: string) => void
  loading: boolean
  isFullscreen: boolean
  onToggleFullscreen: () => void
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onRefresh: () => void
  onOpenIndicators: () => void
  indicatorConfig: { rsi: boolean; macd: boolean; ema: boolean; sma: boolean; vwap: boolean; bb: boolean }
  onToggleIndicator: (key: string) => void
  addToast: (msg: string, type: 'success' | 'error' | 'info') => void
}

const RANGES = ['1D', '1W', '1M', '3M', '1Y', 'ALL']

export default function MainChart({ data, ticker, tickers, onTickerClick, timeframe, onTimeframeChange, loading, isFullscreen, onToggleFullscreen, onZoomIn, onZoomOut, onRefresh, onOpenIndicators, indicatorConfig, onToggleIndicator }: Props) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<any>(null)
  useEffect(() => {
    if (!chartContainerRef.current) return
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#64748B',
        fontSize: 10,
        fontFamily: 'JetBrains Mono, monospace',
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.03)' },
        horzLines: { color: 'rgba(255,255,255,0.03)' },
      },
      crosshair: {
        mode: 0,
        vertLine: { color: 'rgba(255,255,255,0.1)', width: 1, style: LineStyle.Dashed, labelBackgroundColor: '#3B82F6' },
        horzLine: { color: 'rgba(255,255,255,0.1)', width: 1, style: LineStyle.Dashed, labelBackgroundColor: '#3B82F6' },
      },
      rightPriceScale: {
        borderColor: 'rgba(255,255,255,0.05)',
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      timeScale: {
        borderColor: 'rgba(255,255,255,0.05)',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: { vertTouchDrag: false },
      handleScale: { mouseWheel: true, pinch: true },
    })

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: '#22C55E',
      topColor: 'rgba(34,197,94,0.15)',
      bottomColor: 'rgba(34,197,94,0)',
      lineWidth: 2,
      priceFormat: { type: 'price', precision: 2, minMove: 0.01 },
    })
    seriesRef.current = areaSeries
    chartRef.current = chart

    chart.subscribeCrosshairMove((param) => {
      if (param.point && param.time) {
        chartContainerRef.current?.style.setProperty('cursor', 'crosshair')
      } else {
        chartContainerRef.current?.style.setProperty('cursor', 'default')
      }
    })

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth, height: chartContainerRef.current.clientHeight })
      }
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [])

  useEffect(() => {
    if (!seriesRef.current || data.length === 0) return
    const first = data[0]?.value || 0
    const last = data[data.length - 1]?.value || 0
    const isUp = last >= first
    seriesRef.current.applyOptions({
      lineColor: isUp ? '#22C55E' : '#EF4444',
      topColor: isUp ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
      bottomColor: isUp ? 'rgba(34,197,94,0)' : 'rgba(239,68,68,0)',
    })
    seriesRef.current.setData(data.map(d => ({
      time: d.time as any,
      value: d.value,
    })))
    chartRef.current?.timeScale().fitContent()
  }, [data])

  const isUp = data.length >= 2 ? data[data.length - 1]?.value >= data[0]?.value : true
  const lastVal = data[data.length - 1]?.value || 0
  const firstVal = data[0]?.value || 0
  const changePercent = firstVal > 0 ? ((lastVal - firstVal) / firstVal * 100) : 0

  const indicatorList = [
    { key: 'rsi' as const, label: 'RSI', color: 'var(--purple)' },
    { key: 'macd' as const, label: 'MACD', color: 'var(--blue)' },
    { key: 'ema' as const, label: 'EMA', color: 'var(--emerald)' },
    { key: 'sma' as const, label: 'SMA', color: 'var(--amber)' },
    { key: 'vwap' as const, label: 'VWAP', color: 'var(--text-muted)' },
    { key: 'bb' as const, label: 'Bollinger Bands', color: 'var(--purple)' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.4 }}
      className="glass-card-elevated"
      style={{
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        height: isFullscreen ? '100vh' : 'auto',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {tickers.slice(0, 6).map(t => (
              <motion.button
                key={t}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTickerClick(t)}
                title={`Switch to ${t}`}
                style={{
                  padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  background: ticker === t ? 'linear-gradient(135deg, var(--blue), var(--purple))' : 'transparent',
                  border: ticker === t ? 'none' : '1px solid var(--border)',
                  color: ticker === t ? 'white' : 'var(--text-muted)',
                  cursor: 'pointer', transition: 'all 0.15s',
                  position: 'relative',
                  boxShadow: ticker === t ? '0 4px 12px var(--blue-glow)' : 'none',
                }}
              >
                {t}
                {ticker === t && (
                  <motion.div layoutId="activeTab" style={{ position: 'absolute', bottom: -4, left: '20%', right: '20%', height: 2, borderRadius: 1, background: 'white' }} />
                )}
              </motion.button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={onRefresh} title="Refresh data" className="btn-secondary" style={{ padding: '4px 6px', borderRadius: 6 }}>
              <RefreshCw size={12} />
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={onOpenIndicators} title="Show indicators" className="btn-secondary" style={{ padding: '4px 6px', borderRadius: 6 }}>
              <Activity size={12} />
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={onToggleFullscreen} title={isFullscreen ? 'Exit fullscreen (ESC)' : 'Fullscreen'} className="btn-secondary" style={{ padding: '4px 6px', borderRadius: 6 }}>
              {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            </motion.button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <motion.span
            key={ticker + lastVal}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}
          >
            ${lastVal.toFixed(2)}
          </motion.span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <TrendingUp size={13} style={{ color: isUp ? 'var(--green)' : 'var(--red)' }} />
            <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)', color: isUp ? 'var(--green)' : 'var(--red)' }}>
              {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
            </span>
          </div>
          <span style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{ticker}</span>
        </div>

        <div style={{ display: 'flex', gap: 3, marginTop: 6 }}>
          {RANGES.map(r => (
            <motion.button
              key={r}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTimeframeChange(r)}
              title={`Show ${r} range`}
              style={{
                padding: '2px 10px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                background: timeframe === r ? 'linear-gradient(135deg, var(--blue), var(--purple))' : 'transparent',
                border: 'none',
                color: timeframe === r ? 'white' : 'var(--text-dim)',
                cursor: 'pointer', transition: 'all 0.15s',
                boxShadow: timeframe === r ? '0 2px 8px var(--blue-glow)' : 'none',
              }}
            >
              {r}
            </motion.button>
          ))}
          <span style={{ flex: 1 }} />
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={onZoomIn} title="Zoom in (+)" className="btn-secondary" style={{ padding: '2px 5px', borderRadius: 4 }}>
            <ZoomIn size={10} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={onZoomOut} title="Zoom out (-)" className="btn-secondary" style={{ padding: '2px 5px', borderRadius: 4 }}>
            <ZoomOut size={10} />
          </motion.button>
        </div>

        <AnimatePresence>
          {Object.entries(indicatorConfig).filter(([, v]) => v).length > 0 && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
              <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                {indicatorList.filter(ind => indicatorConfig[ind.key]).map(ind => (
                  <motion.span
                    key={ind.key}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 4, padding: '1px 8px', fontSize: 9, fontWeight: 600, color: ind.color }}
                  >
                    <Eye size={9} />
                    {ind.label}
                    <motion.button whileTap={{ scale: 0.8 }} onClick={() => onToggleIndicator(ind.key)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: 0, display: 'flex', marginLeft: 2 }}><EyeOff size={8} /></motion.button>
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ position: 'relative', flex: 1, minHeight: isFullscreen ? 'calc(100vh - 120px)' : 340 }}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(7,11,20,0.6)', backdropFilter: 'blur(4px)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', gap: 4 }}>
              <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0 }} className="typing-dot" />
              <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="typing-dot" />
              <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={chartContainerRef} style={{ width: '100%', height: '100%', minHeight: isFullscreen ? 'calc(100vh - 120px)' : 340 }} />
      </div>
    </motion.div>
  )
}
