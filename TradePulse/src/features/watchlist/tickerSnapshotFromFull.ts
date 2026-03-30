import type { MockTicker, PriceSnapshot, TickerPriceSnapshot } from '../../engine';

export function tickerSnapshotFromFull(
  full: PriceSnapshot,
  ticker: MockTicker,
): TickerPriceSnapshot {
  return {
    ticker,
    price: full.prices[ticker],
    history: full.history[ticker],
    tickSequence: full.tickSequence,
    emittedAtMs: full.emittedAtMs,
  };
}
