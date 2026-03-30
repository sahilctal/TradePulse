import type { MockTicker } from '../../engine';
import type { PortfolioState, TradeRecord } from '../trading/types';

export type LimitOrderSide = 'buy' | 'sell';

/**
 * Open limit order: buy fills when market <= limit; sell fills when market >= limit (mid price).
 */
export type LimitOrder = {
  readonly id: string;
  readonly ticker: MockTicker;
  readonly side: LimitOrderSide;
  readonly quantityAtoms: bigint;
  /** Maximum buy price / minimum sell price, USD cents per whole coin */
  readonly limitUsdCentsPerCoin: bigint;
  readonly createdAtMs: number;
};

export type LimitFillEvent = {
  readonly order: LimitOrder;
  readonly trade: TradeRecord;
  readonly portfolio: PortfolioState;
};

export type LimitOrderEngineDeps = {
  readonly getPortfolio: () => PortfolioState;
  readonly setPortfolio: (next: PortfolioState) => void;
  /** Defaults to `savePortfolioState` from trade module when omitted */
  readonly persistPortfolio?: (state: PortfolioState) => void;
  readonly onFill?: (event: LimitFillEvent) => void;
};
