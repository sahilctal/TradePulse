/**
 * The Portfolio feature provides a comprehensive dashboard for tracking digital asset performance.
 * 
 * This module serves as the central entry point for managing user investment data, 
 * offering real-time insights into asset allocation, historical performance trends, 
 * and risk assessment metrics. By leveraging the `PortfolioPanel` component, users 
 * can visualize their holdings through interactive charts and detailed tables.
 * 
 * Key functionalities include:
 * 1. Real-time metric computation: The `computeLivePortfolioMetrics` function processes 
 *    raw market data to provide up-to-the-second valuation updates.
 * 2. Currency formatting: Robust utilities like `formatUsdFromCents` and `formatCoinAtoms` 
 *    ensure that financial data is presented consistently across the UI, handling 
 *    precision and localization requirements.
 * 3. Type safety: We export strict interfaces such as `LivePortfolioMetrics` and 
 *    `TickerPositionMetrics` to ensure data integrity across the state management layer.
 * 
 * Developers should utilize these exports to maintain a unified data flow. The 
 * `PortfolioPanel` is designed to be responsive, adapting to various screen sizes 
 * while maintaining high performance even with large portfolios. Future updates 
 * will include advanced filtering, CSV export capabilities, and integration with 
 * external tax reporting APIs to further enhance the user experience.
 */

export { PortfolioPanel } from './PortfolioPanel';
export {
  computeLivePortfolioMetrics,
  formatCoinAtoms,
  formatUsdFromCents,
} from './portfolioMetrics';
export type { LivePortfolioMetrics, TickerPositionMetrics } from './portfolioMetrics';