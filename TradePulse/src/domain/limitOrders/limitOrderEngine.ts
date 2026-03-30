import type { PriceSnapshot } from '../../engine';
import { MockPriceEngine } from '../../engine';
import { applyBuy, applySell } from '../trading/execution';
import { savePortfolioState } from '../trading/portfolioStorage';
import type { MarketOrderInput, PortfolioState } from '../trading/types';
import {
  buildMarketCentsByTicker,
  buildTickerLimitAggregates,
  collectTickersFromOrders,
  isOrderPotentiallyFillable,
} from './limitOrderEvaluation';
import { insertLimitOrderSorted, sortLimitOrders } from './orderBookOrdering';
import type { LimitOrder, LimitOrderEngineDeps, LimitFillEvent } from './types';
import { loadLimitOrderBook, saveLimitOrderBook } from './limitOrderStorage';

export type PlaceLimitOrderInput = {
  readonly ticker: LimitOrder['ticker'];
  readonly side: LimitOrder['side'];
  readonly quantityAtoms: bigint;
  readonly limitUsdCentsPerCoin: bigint;
  readonly createdAtMs: number;
};

/**
 * Watches `MockPriceEngine` via `subscribeAll`, evaluates pending limits each tick,
 * and applies fills through `applyBuy` / `applySell`. Pending orders persist to localStorage.
 * Each order is removed from the book as soon as it fills successfully — no double fills.
 *
 * Performance: pending stays sorted on insert; each tick converts each quoted symbol at most once,
 * builds per-ticker limit bounds once, and skips trade execution when the mid cannot possibly fill
 * a side (bulk reject) before checking individual limits.
 */
export class LimitOrderEngine {
  private readonly priceEngine: MockPriceEngine;
  private readonly deps: LimitOrderEngineDeps;
  private readonly persistPortfolio: (state: PortfolioState) => void;

  private pending: LimitOrder[] = [];
  private nextOrderId: bigint = 1n;
  private unsubscribe: (() => void) | null = null;

  constructor(priceEngine: MockPriceEngine, deps: LimitOrderEngineDeps) {
    this.priceEngine = priceEngine;
    this.deps = deps;
    this.persistPortfolio = deps.persistPortfolio ?? savePortfolioState;
    const loaded = loadLimitOrderBook();
    this.pending = sortLimitOrders(loaded.orders);
    this.nextOrderId = loaded.nextOrderId;
  }

  getPendingOrders(): readonly LimitOrder[] {
    return this.pending;
  }

  getNextOrderId(): bigint {
    return this.nextOrderId;
  }

  /**
   * Validates input, assigns id, persists. Returns new order id.
   */
  placeLimitOrder(input: PlaceLimitOrderInput): string {
    if (input.quantityAtoms <= 0n) {
      throw new RangeError('quantityAtoms must be positive');
    }
    if (input.limitUsdCentsPerCoin <= 0n) {
      throw new RangeError('limitUsdCentsPerCoin must be positive');
    }
    const id = this.nextOrderId.toString(10);
    this.nextOrderId += 1n;
    const order: LimitOrder = {
      id,
      ticker: input.ticker,
      side: input.side,
      quantityAtoms: input.quantityAtoms,
      limitUsdCentsPerCoin: input.limitUsdCentsPerCoin,
      createdAtMs: input.createdAtMs,
    };
    insertLimitOrderSorted(this.pending, order);
    this.persistBook();
    return id;
  }

  cancelLimitOrder(id: string): boolean {
    const before = this.pending.length;
    this.pending = this.pending.filter((o) => o.id !== id);
    if (this.pending.length === before) {
      return false;
    }
    this.persistBook();
    return true;
  }

  start(): void {
    if (this.unsubscribe !== null) {
      return;
    }
    this.unsubscribe = this.priceEngine.subscribeAll((snapshot) => {
      this.processSnapshot(snapshot);
    });
  }

  stop(): void {
    if (this.unsubscribe === null) {
      return;
    }
    this.unsubscribe();
    this.unsubscribe = null;
  }

  destroy(): void {
    this.stop();
  }

  private persistBook(): void {
    saveLimitOrderBook({
      nextOrderId: this.nextOrderId,
      orders: this.pending,
    });
  }

  private processSnapshot(snapshot: PriceSnapshot): void {
    if (this.pending.length === 0) {
      return;
    }

    const tickers = collectTickersFromOrders(this.pending);
    const marketByTicker = buildMarketCentsByTicker(snapshot.prices, tickers);
    const aggregates = buildTickerLimitAggregates(this.pending);

    let portfolio = this.deps.getPortfolio();
    const remaining: LimitOrder[] = [];
    let bookDirty = false;
    let portfolioDirty = false;

    for (let i = 0; i < this.pending.length; i++) {
      const order = this.pending[i]!;
      const marketCents = marketByTicker.get(order.ticker);
      if (marketCents === undefined) {
        remaining.push(order);
        continue;
      }
      const agg = aggregates.get(order.ticker);
      if (!isOrderPotentiallyFillable(order, marketCents, agg)) {
        remaining.push(order);
        continue;
      }

      const input: MarketOrderInput = {
        ticker: order.ticker,
        quantityAtoms: order.quantityAtoms,
        priceUsdCentsPerCoin: marketCents,
        timestampMs: snapshot.emittedAtMs,
      };
      const result =
        order.side === 'buy'
          ? applyBuy(portfolio, input)
          : applySell(portfolio, input);

      if (result.ok) {
        portfolio = result.state;
        portfolioDirty = true;
        bookDirty = true;
        const event: LimitFillEvent = {
          order,
          trade: result.trade,
          portfolio: result.state,
        };
        this.deps.onFill?.(event);
      } else {
        remaining.push(order);
      }
    }

    if (portfolioDirty) {
      this.deps.setPortfolio(portfolio);
      this.persistPortfolio(portfolio);
    }
    if (bookDirty) {
      this.pending = remaining;
      this.persistBook();
    }
  }
}
