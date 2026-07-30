export {
  computeLivePortfolioMetrics,
  formatCoinAtoms,
  formatUsdFromCents,
} from './portfolioMetrics';
export type { LivePortfolioMetrics, TickerPositionMetrics } from './portfolioMetrics';

export const portfolioSchema = {
  '@context': 'https://schema.org',
  '@type': 'FinancialService',
  'name': 'TradePulse Portfolio',
  'description': 'Real-time portfolio tracking and metrics dashboard.',
};