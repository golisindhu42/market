import { motion } from 'framer-motion'
import { useDashboard } from '../context/DashboardContext'
import StatsRow from '../components/StatsRow'
import MainChart from '../components/MainChart'
import StockCardGrid from '../components/StockCardGrid'
import AICopilot from '../components/AICopilot'
import FearGreedIndex from '../components/FearGreedIndex'
import MarketSentiment from '../components/MarketSentiment'
import NewsFeed from '../components/NewsFeed'
import WatchlistTable from '../components/WatchlistTable'
import MarketOverview from '../components/MarketOverview'

export default function DashboardPage() {
  const {
    tickers, activeTicker, handleTickerClick,
    timeframe, handleTimeframeChange,
    isFullscreen, setIsFullscreen,
    chartZoom, setChartZoom, chartLoading,
    indicatorConfig, setIndicatorConfig, setShowIndicators,
    stockData, history, addToast,
    stockList, totalChange, totalValue, sentimentAvg, aiConfidence, chartData,
  } = useDashboard()

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
      {!isFullscreen && (
        <>
          <StatsRow totalValue={totalValue} totalChange={totalChange} sentimentAvg={sentimentAvg} aiConfidence={aiConfidence} stockCount={stockList.length} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, marginBottom: 24 }}>
            <MainChart
              data={chartData}
              ticker={activeTicker}
              tickers={tickers}
              onTickerClick={handleTickerClick}
              timeframe={timeframe}
              onTimeframeChange={handleTimeframeChange}
              loading={chartLoading}
              isFullscreen={isFullscreen}
              onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
              zoom={chartZoom}
              onZoomIn={() => setChartZoom((z: number) => Math.min(z * 1.5, 10))}
              onZoomOut={() => setChartZoom((z: number) => Math.max(z / 1.5, 0.1))}
              onRefresh={() => { handleTimeframeChange(timeframe); addToast('Chart data refreshed', 'success') }}
              onOpenIndicators={() => setShowIndicators(true)}
              indicatorConfig={indicatorConfig}
              onToggleIndicator={(key: string) => setIndicatorConfig(prev => ({ ...prev, [key as keyof typeof prev]: !prev[key as keyof typeof prev] }))}
              addToast={addToast}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <AICopilot tickers={tickers} />
            </div>
          </div>

          <StockCardGrid tickers={tickers} stockData={stockData} history={history} onSelect={handleTickerClick} activeTicker={activeTicker} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 24 }}>
            <FearGreedIndex sentimentAvg={sentimentAvg} priceChangeAvg={totalChange / Math.max(stockList.length, 1)} />
            <MarketSentiment sentiments={stockList.map((s: any) => ({ ticker: s.ticker, score: Math.abs(s.changePercent || 0) * 10 + 50 }))} />
            <NewsFeed tickers={tickers} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
            <WatchlistTable stockList={stockList} addToast={addToast} />
            <MarketOverview stockList={stockList} />
          </div>
        </>
      )}

      {isFullscreen && (
        <MainChart
          data={chartData}
          ticker={activeTicker}
          tickers={tickers}
          onTickerClick={handleTickerClick}
          timeframe={timeframe}
          onTimeframeChange={handleTimeframeChange}
          loading={chartLoading}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen(false)}
          zoom={chartZoom}
          onZoomIn={() => setChartZoom((z: number) => Math.min(z * 1.5, 10))}
          onZoomOut={() => setChartZoom((z: number) => Math.max(z / 1.5, 0.1))}
          onRefresh={() => { handleTimeframeChange(timeframe); addToast('Chart refreshed', 'success') }}
          onOpenIndicators={() => setShowIndicators(true)}
          indicatorConfig={indicatorConfig}
          onToggleIndicator={(key: string) => setIndicatorConfig(prev => ({ ...prev, [key as keyof typeof prev]: !prev[key as keyof typeof prev] }))}
          addToast={addToast}
        />
      )}
    </motion.div>
  )
}
