import type { PricePoint } from '../../engine';

/**
 * Mock “24h %” stand-in: percent move from the oldest point in the engine’s rolling
 * history to the latest price. The buffer is shorter than 24h (see engine cap), so this
 * is a visual proxy only — not an exchange-style day change.
 */
export function simulated24hPercentChange(
  history: readonly PricePoint[],
  currentPrice: number,
): number {
  if (history.length < 2) {
    return 0;
  }
  const oldest = history[0];
  if (oldest === undefined) {
    return 0;
  }
  const open = oldest.price;
  if (open === 0) {
    return 0;
  }
  return ((currentPrice - open) / open) * 100;
}
