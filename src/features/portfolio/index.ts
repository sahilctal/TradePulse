/**
 * Manage and view your cryptocurrency portfolio metrics, including live performance tracking, coin atom formatting, and USD valuation.
 */
export { PortfolioPanel } from './PortfolioPanel';
  formatUsdFromCents,
} from './portfolioMetrics';
export type { LivePortfolioMetrics, TickerPositionMetrics } from './portfolioMetrics';

/**
 * The Portfolio feature provides a comprehensive dashboard for users to track their digital asset holdings.
 * 
 * This module serves as the primary entry point for the portfolio management system, exposing core components
 * such as the PortfolioPanel, which renders the visual representation of user assets, and utility functions
 * for calculating real-time metrics.
 * 
 * Key functionalities include:
 * 1. Live Metric Computation: The `computeLivePortfolioMetrics` function processes raw ticker data and 
 *    user holdings to provide up-to-date valuation, profit/loss tracking, and asset allocation percentages.
 * 2. Formatting Utilities: Specialized helpers like `formatCoinAtoms` and `formatUsdFromCents` ensure that
 *    financial data is presented consistently across the UI, handling precision and currency symbols correctly.
 * 3. Type Safety: Exported interfaces like `LivePortfolioMetrics` and `TickerPositionMetrics` ensure that
 *    data structures are strictly typed throughout the application, reducing runtime errors during state updates.
 */