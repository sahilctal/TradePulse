import { useState } from 'react';
import type { MockTicker } from './engine';
import { ChartPanel } from './features/chart/ChartPanel';
import { PortfolioPanel } from './features/portfolio/PortfolioPanel';
import { LimitOrdersPanel } from './features/limitOrders/LimitOrdersPanel';
import { TradingPanel } from './features/trading/TradingPanel';
import { WatchlistSidebar } from './features/watchlist/WatchlistSidebar';

export function App() {
  const [activeTicker, setActiveTicker] = useState<MockTicker>('BTC');

  return (
    <div className="app-shell">
      <WatchlistSidebar />
      <main className="app-main" aria-label="Trading workspace">
        <div className="app-stack">
          <div className="app-chart-trade">
            <ChartPanel ticker={activeTicker} />
            <div className="app-trade-column">
              <TradingPanel
                ticker={activeTicker}
                onTickerChange={setActiveTicker}
              />
              <LimitOrdersPanel
                ticker={activeTicker}
                onTickerChange={setActiveTicker}
              />
            </div>
          </div>
          <PortfolioPanel />
        </div>
      </main>
    </div>
  );
}
