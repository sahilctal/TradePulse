import type { MockTicker, PriceSnapshot } from '../../engine';
import type { LimitOrder } from './types';
import { usdPerCoinNumberToCents } from './priceConversion';

export type TickerLimitAggregates = {
  /** Greatest buy limit on this symbol; null if no buy orders */
  readonly maxBuyLimit: bigint | null;
  /** Smallest sell limit on this symbol; null if no sell orders */
  readonly minSellLimit: bigint | null;
};

type MutableAgg = {
  maxBuyLimit: bigint | null;
  minSellLimit: bigint | null;
};

/**
 * Symbols that appear in the book (max three in this product).
 */
export function collectTickersFromOrders(
  pending: readonly LimitOrder[],
): Set<MockTicker> {
  const s = new Set<MockTicker>();
  for (let i = 0; i < pending.length; i++) {
    s.add(pending[i]!.ticker);
  }
  return s;
}

/**
 * One `usdPerCoinNumberToCents` call per ticker present in the book.
 */
export function buildMarketCentsByTicker(
  prices: PriceSnapshot['prices'],
  tickers: ReadonlySet<MockTicker>,
): Map<MockTicker, bigint> {
  const m = new Map<MockTicker, bigint>();
  for (const t of tickers) {
    const c = usdPerCoinNumberToCents(prices[t]);
    if (c !== null) {
      m.set(t, c);
    }
  }
  return m;
}

/**
 * Per-ticker bounds so we can reject many orders with one comparison per side when the mid is far from limits.
 */
export function buildTickerLimitAggregates(
  pending: readonly LimitOrder[],
): Map<MockTicker, TickerLimitAggregates> {
  const map = new Map<MockTicker, MutableAgg>();
  for (let i = 0; i < pending.length; i++) {
    const o = pending[i]!;
    let agg = map.get(o.ticker);
    if (agg === undefined) {
      agg = { maxBuyLimit: null, minSellLimit: null };
      map.set(o.ticker, agg);
    }
    if (o.side === 'buy') {
      agg.maxBuyLimit =
        agg.maxBuyLimit === null || o.limitUsdCentsPerCoin > agg.maxBuyLimit
          ? o.limitUsdCentsPerCoin
          : agg.maxBuyLimit;
    } else {
      agg.minSellLimit =
        agg.minSellLimit === null || o.limitUsdCentsPerCoin < agg.minSellLimit
          ? o.limitUsdCentsPerCoin
          : agg.minSellLimit;
    }
  }
  return map as Map<MockTicker, TickerLimitAggregates>;
}

/**
 * False ⇒ this order cannot fill on this tick (skip `applyBuy` / `applySell`).
 */
export function isOrderPotentiallyFillable(
  order: LimitOrder,
  marketUsdCentsPerCoin: bigint,
  agg: TickerLimitAggregates | undefined,
): boolean {
  if (order.side === 'buy') {
    if (agg !== undefined && agg.maxBuyLimit !== null) {
      if (marketUsdCentsPerCoin > agg.maxBuyLimit) {
        return false;
      }
    }
    return marketUsdCentsPerCoin <= order.limitUsdCentsPerCoin;
  }
  if (agg !== undefined && agg.minSellLimit !== null) {
    if (marketUsdCentsPerCoin < agg.minSellLimit) {
      return false;
    }
  }
  return marketUsdCentsPerCoin >= order.limitUsdCentsPerCoin;
}
