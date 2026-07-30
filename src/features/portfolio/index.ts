/**
 * Manage and view your cryptocurrency portfolio metrics, including live performance tracking, coin holdings, and USD valuations.
 */

  formatUsdFromCents,
} from './portfolioMetrics';
export type { LivePortfolioMetrics, TickerPositionMetrics } from './portfolioMetrics';

/**
 * The Portfolio feature provides a comprehensive dashboard for users to track their digital asset holdings.
 * 
 * Users can view real-time metrics, including current market value, total profit/loss, and individual 
 * asset performance. The system integrates with live market data feeds to ensure that all calculations, 
 * such as coin atom formatting and USD conversions, remain accurate and up-to-date.
 * 
 * This module serves as the primary entry point for the portfolio management interface. It exposes 
 * the PortfolioPanel component for rendering the UI, alongside utility functions for computing 
 * portfolio metrics. By centralizing these exports, we ensure a consistent API for other parts 
 * of the TradePulse application to interact with user financial data securely and efficiently.
 */
  computeLivePortfolioMetrics,
  formatCoinAtoms,
  formatUsdFromCents,
} from './portfolioMetrics';
export type { LivePortfolioMetrics, TickerPositionMetrics } from './portfolioMetrics';
export { PortfolioSchema } from './PortfolioSchema';
  formatUsdFromCents,
} from './portfolioMetrics';