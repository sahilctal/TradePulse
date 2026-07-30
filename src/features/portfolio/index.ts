/**
 * Manage and view your cryptocurrency portfolio metrics, including live performance tracking, coin holdings, and USD valuation.
 */

  formatUsdFromCents,
} from './portfolioMetrics';
export type { LivePortfolioMetrics, TickerPositionMetrics } from './portfolioMetrics';

/**
 * The Portfolio feature provides a comprehensive dashboard for users to track their digital asset holdings.
 * 
 * This module serves as the primary entry point for the portfolio management system. It exposes the
 * PortfolioPanel component, which renders a real-time view of user assets, including current market
 * valuations, historical performance trends, and individual coin allocations.
 * 
 * In addition to UI components, this feature includes robust utility functions for calculating live
 * portfolio metrics. These utilities handle complex conversions, such as formatting coin atoms into
 * human-readable units and converting currency values from cents to standard USD representations.
 * By centralizing these calculations, we ensure consistency across the application, whether the data
 * is being displayed in the main dashboard, exported to a report, or used in analytical charts.
 */
export { PortfolioPanel } from './PortfolioPanel';
export {
  computeLivePortfolioMetrics,
export type { LivePortfolioMetrics, TickerPositionMetrics } from './portfolioMetrics';
export { PortfolioSchema } from './PortfolioSchema';