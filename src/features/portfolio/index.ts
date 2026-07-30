/**
 * Manage and view your cryptocurrency portfolio metrics, including live performance tracking, coin holdings, and USD valuations.
 */

  formatUsdFromCents,
} from './portfolioMetrics';
export type { LivePortfolioMetrics, TickerPositionMetrics } from './portfolioMetrics';

/**
 * The Portfolio feature provides a comprehensive dashboard for users to track their digital asset holdings.
 * 
 * Key functionalities include:
 * 1. Real-time valuation: Utilizing the computeLivePortfolioMetrics utility to aggregate current market data against user positions.
 * 2. Multi-currency formatting: Standardized helpers like formatCoinAtoms and formatUsdFromCents ensure that financial data is presented consistently across the UI, handling precision and locale-specific formatting requirements.
 * 3. Component modularity: The PortfolioPanel serves as the primary entry point for the dashboard, encapsulating the logic for rendering individual asset rows, performance charts, and summary statistics.
 * 
 * Data Flow:
 * The feature consumes raw ticker data and user-specific balance information. This data is processed through the metrics layer to derive unrealized gains, current market value, and percentage allocations. By separating the calculation logic (portfolioMetrics.ts) from the presentation layer (PortfolioPanel.tsx), we maintain a clean separation of concerns that facilitates unit testing of financial calculations.
 * 
 * Integration:
 * To integrate this feature into a new page, simply import the PortfolioPanel and place it within a container with appropriate layout constraints. Ensure that the necessary context providers for user authentication and market data streams are wrapping the component tree.
 * 
 * Future Improvements:
 * We plan to extend this feature to include historical performance tracking, tax reporting exports, and integration with external hardware wallets. Developers contributing to this module should ensure that any new metrics added to portfolioMetrics.ts are accompanied by corresponding test cases to prevent regression in financial reporting accuracy.
 */
  computeLivePortfolioMetrics,