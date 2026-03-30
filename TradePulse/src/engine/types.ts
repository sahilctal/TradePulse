/**
 * Built-in symbols simulated by the mock engine.
 * Extend the engine if you add more tickers; keep this list the single source of truth for defaults.
 */
export const MOCK_TICKERS = ['BTC', 'ETH', 'SOL'] as const;

export type MockTicker = (typeof MOCK_TICKERS)[number];

/**
 * One recorded observation in the append-only series for a ticker.
 */
export interface PricePoint {
  readonly ticker: MockTicker;
  /** Mid price after volatility step, rounded per ticker decimals */
  readonly price: number;
  /** Unix epoch milliseconds when this point was recorded */
  readonly timestamp: number;
}

/**
 * Immutable view of the entire market state at a single engine tick.
 * Listeners receive a fresh object graph each emission so consumers can rely on referential inequality for memoization.
 */
export interface PriceSnapshot {
  readonly prices: Readonly<Record<MockTicker, number>>;
  readonly history: Readonly<Record<MockTicker, readonly PricePoint[]>>;
  /** Increments once per engine tick (including the initial seed), monotonic for the lifetime of the instance */
  readonly tickSequence: number;
  /** `Date.now()` when this snapshot was materialized */
  readonly emittedAtMs: number;
}

/**
 * Narrow snapshot for a single symbol — use with `subscribe(ticker, …)` to avoid holding cross-ticker state in UI layers.
 */
export interface TickerPriceSnapshot {
  readonly ticker: MockTicker;
  readonly price: number;
  /** Up to `maxHistoryPerTicker` points for this ticker only, oldest → newest */
  readonly history: readonly PricePoint[];
  readonly tickSequence: number;
  readonly emittedAtMs: number;
}

/**
 * Invoked for every tick with the full multi-ticker snapshot (`subscribeAll`).
 */
export type PriceUpdateListener = (snapshot: PriceSnapshot) => void;

/**
 * Invoked on each global tick with data for one ticker only (`subscribe`).
 */
export type TickerPriceListener = (update: TickerPriceSnapshot) => void;
