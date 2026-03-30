import type { TickerPriceSnapshot } from '../../engine';

/**
 * Returns true when two snapshots would render the same row (price, %, formatting inputs).
 * Used to bail out of React state updates so React skips reconciling this row.
 */
export function isEquivalentTickerRowView(
  prev: TickerPriceSnapshot,
  next: TickerPriceSnapshot,
): boolean {
  if (prev.ticker !== next.ticker) {
    return false;
  }
  if (
    prev.tickSequence !== next.tickSequence ||
    prev.price !== next.price ||
    prev.emittedAtMs !== next.emittedAtMs
  ) {
    return false;
  }
  const n = prev.history.length;
  if (n !== next.history.length) {
    return false;
  }
  if (n === 0) {
    return true;
  }
  const pFirst = prev.history[0];
  const nFirst = next.history[0];
  const pLast = prev.history[n - 1];
  const nLast = next.history[n - 1];
  if (
    pFirst === undefined ||
    nFirst === undefined ||
    pLast === undefined ||
    nLast === undefined
  ) {
    return false;
  }
  return (
    pFirst.price === nFirst.price &&
    pFirst.timestamp === nFirst.timestamp &&
    pLast.price === nLast.price &&
    pLast.timestamp === nLast.timestamp
  );
}

function tickerRowReducer(
  prev: TickerPriceSnapshot,
  next: TickerPriceSnapshot,
): TickerPriceSnapshot {
  return isEquivalentTickerRowView(prev, next) ? prev : next;
}

export { tickerRowReducer };
