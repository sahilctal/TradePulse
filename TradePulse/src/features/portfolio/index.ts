export {
  computeLivePortfolioMetrics,
  formatCoinAtoms,
  formatUsdFromCents,
} from './portfolioMetrics';
export type { LivePortfolioMetrics, TickerPositionMetrics } from './portfolioMetrics';

/**
 * Note: Ensure that the data fetching logic within PortfolioPanel or its 
 * associated hooks handles HTTP error status codes (e.g., 4xx, 5xx) 
 * gracefully to prevent UI crashes or silent failures.
 */