import type { MockTicker } from '../../engine';

export type TradeSide = 'buy' | 'sell';

export type TradeRecord = {
  readonly id: string;
  readonly timestampMs: number;
  readonly side: TradeSide;
  readonly ticker: MockTicker;
  /** Size in 1e-8 coin atoms */
  readonly quantityAtoms: bigint;
  /** Executed price: USD cents for one whole coin */
  readonly priceUsdCentsPerCoin: bigint;
  /** Cash leg in USD cents (buy: paid; sell: received) */
  readonly notionalUsdCents: bigint;
  readonly balanceUsdCentsAfter: bigint;
  readonly holdingsAtomsAfter: Readonly<Record<MockTicker, bigint>>;
};

export type PortfolioState = {
  readonly balanceUsdCents: bigint;
  readonly holdingsAtoms: Readonly<Record<MockTicker, bigint>>;
  readonly trades: readonly TradeRecord[];
  readonly nextTradeId: bigint;
};

export type MarketOrderInput = {
  readonly ticker: MockTicker;
  readonly quantityAtoms: bigint;
  /** Whole-coin price in USD cents (e.g. $3,350.00 => 335000n) */
  readonly priceUsdCentsPerCoin: bigint;
  /** Caller-supplied clock for deterministic tests and stable logs */
  readonly timestampMs: number;
};

export type ExecutionErrorCode =
  | 'INVALID_QUANTITY'
  | 'INVALID_PRICE'
  | 'INSUFFICIENT_BALANCE'
  | 'INSUFFICIENT_HOLDINGS';

export type ExecutionFailure = {
  readonly ok: false;
  readonly error: ExecutionErrorCode;
};

export type ExecutionSuccess = {
  readonly ok: true;
  readonly state: PortfolioState;
  readonly trade: TradeRecord;
};

export type ExecutionResult = ExecutionSuccess | ExecutionFailure;
