# Project structure

High-level map of the TradePulse source tree and how responsibilities are split.

## Root

| Path | Role |
|------|------|
| `index.html` | Vite HTML shell; mounts `#root`. |
| `vite.config.ts` | Vite + `@vitejs/plugin-react`. |
| `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` | TypeScript project references. |
| `package.json` | Scripts: `dev`, `build`, `preview`. |

## `src/`

### Application shell

| Path | Role |
|------|------|
| `main.tsx` | React root, provider order: `EngineProvider` → `PortfolioProvider` → `LimitOrderProvider` → `WatchlistProvider` → `App`. |
| `App.tsx` | Layout: watchlist sidebar + main column (chart + trade column + portfolio). |
| `vite-env.d.ts` | Vite client types. |
| `styles/global.css` | Global layout, shell, grid helpers. |

### `src/engine/` — mock market data (no React)

| File | Role |
|------|------|
| `mock-price-engine.ts` | `MockPriceEngine`: 1 s tick, random walk, per-ticker history, `subscribe` / `subscribeAll`, `start` / `stop`. |
| `types.ts` | `MOCK_TICKERS`, `PricePoint`, `PriceSnapshot`, `TickerPriceSnapshot`, etc. |
| `index.ts` | Public exports. |

### `src/charts/` — pure geometry (SVG path math)

| File | Role |
|------|------|
| `lineChartGeometry.ts` | Domain, content rect, `buildPriceLinePathD` from `PricePoint[]` + pixel size. |

### `src/domain/trading/` — execution & money (pure + persistence)

| File | Role |
|------|------|
| `execution.ts` | `applyBuy` / `applySell`, `initialPortfolioState`. |
| `constants.ts` | Starting balance, `ATOMS_PER_COIN`. |
| `bigintMath.ts` | Integer mul/div helpers. |
| `coinQuantity.ts` | Parse decimal quantity strings → atoms. |
| `types.ts` | `PortfolioState`, `TradeRecord`, `MarketOrderInput`. |
| `portfolioCodec.ts` / `portfolioStorage.ts` | JSON codec + `localStorage` (`tradepulse-portfolio`). |
| `money.ts` | Integer USD helpers. |
| `index.ts` | Barrel exports. |

### `src/domain/limitOrders/` — limit book + engine

| File | Role |
|------|------|
| `limitOrderEngine.ts` | `LimitOrderEngine`: `subscribeAll`, place/cancel, fills via `applyBuy`/`applySell`. |
| `limitOrderEvaluation.ts` | Market map, aggregates, `isOrderPotentiallyFillable`. |
| `limitMatching.ts` | `isLimitFillable` (buy ≤ limit, sell ≥ limit). |
| `priceConversion.ts` | Engine float → USD cents; string trigger parsing. |
| `limitOrderCodec.ts` / `limitOrderStorage.ts` | Persist pending orders (`tradepulse-limit-orders`). |
| `orderBookOrdering.ts` | Sorted insert for pending orders. |
| `types.ts` | `LimitOrder`, `LimitOrderEngineDeps`. |
| `index.ts` | Barrel exports. |

### `src/providers/`

| File | Role |
|------|------|
| `EngineProvider.tsx` | Single `MockPriceEngine` instance; `start`/`stop` on mount/unmount; `usePriceEngine()`. |
| `PortfolioProvider.tsx` | Portfolio state; load/save `tradepulse-portfolio`; `usePortfolio()`. |
| `LimitOrderProvider.tsx` | One `LimitOrderEngine` wired to portfolio + engine; `useLimitOrders()`. |
| `WatchlistProvider.tsx` | Watchlist tickers; load/save watchlist storage; `useWatchlist()`. |

### `src/features/` — UI feature slices

| Folder | Role |
|--------|------|
| `chart/` | `ChartPanel`, `PriceLineChart` (ResizeObserver, memoized path). |
| `watchlist/` | `WatchlistSidebar`, `WatchlistRow`, storage helpers, snapshot selectors. |
| `portfolio/` | `PortfolioPanel`, `TradeHistorySection`, `portfolioMetrics.ts`. |
| `trading/` | `TradingPanel` (market buy/sell at mid). |
| `limitOrders/` | `LimitOrdersPanel` (trigger price, working orders, cancel). |

### Conventions

- **Engine / domain** avoid React imports so logic stays unit-testable.
- **Features** own UI, hooks, and CSS modules; they call providers and domain functions.
- **Persistence keys** are centralized in storage modules to avoid typos.
