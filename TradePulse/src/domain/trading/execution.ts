import type { MockTicker } from '../../engine';
import { ATOMS_PER_COIN, STARTING_BALANCE_USD_CENTS, ZERO_HOLDINGS } from './constants';
import { mulDivCeil, mulDivFloor } from './bigintMath';
import type {
  ExecutionResult,
  MarketOrderInput,
  PortfolioState,
  TradeRecord,
} from './types';

function cloneHoldings(
  h: Readonly<Record<MockTicker, bigint>>,
): Record<MockTicker, bigint> {
  return { BTC: h.BTC, ETH: h.ETH, SOL: h.SOL };
}

export function initialPortfolioState(): PortfolioState {
  return {
    balanceUsdCents: STARTING_BALANCE_USD_CENTS,
    holdingsAtoms: { ...ZERO_HOLDINGS },
    trades: [],
    nextTradeId: 1n,
  };
}

function validateOrderBase(input: MarketOrderInput): ExecutionResult | null {
  if (input.quantityAtoms <= 0n) {
    return { ok: false, error: 'INVALID_QUANTITY' };
  }
  if (input.priceUsdCentsPerCoin <= 0n) {
    return { ok: false, error: 'INVALID_PRICE' };
  }
  return null;
}

/**
 * Deterministic, pure: debit USD (ceil) and credit coin atoms. Fails if cash insufficient.
 */
export function applyBuy(
  state: PortfolioState,
  input: MarketOrderInput,
): ExecutionResult {
  const bad = validateOrderBase(input);
  if (bad !== null) {
    return bad;
  }
  const costUsdCents = mulDivCeil(
    input.quantityAtoms,
    input.priceUsdCentsPerCoin,
    ATOMS_PER_COIN,
  );
  if (costUsdCents > state.balanceUsdCents) {
    return { ok: false, error: 'INSUFFICIENT_BALANCE' };
  }
  const holdings = cloneHoldings(state.holdingsAtoms);
  holdings[input.ticker] += input.quantityAtoms;
  const balanceUsdCents = state.balanceUsdCents - costUsdCents;
  const trade: TradeRecord = {
    id: state.nextTradeId.toString(10),
    timestampMs: input.timestampMs,
    side: 'buy',
    ticker: input.ticker,
    quantityAtoms: input.quantityAtoms,
    priceUsdCentsPerCoin: input.priceUsdCentsPerCoin,
    notionalUsdCents: costUsdCents,
    balanceUsdCentsAfter: balanceUsdCents,
    holdingsAtomsAfter: { ...holdings },
  };
  const next: PortfolioState = {
    balanceUsdCents,
    holdingsAtoms: holdings,
    trades: [...state.trades, trade],
    nextTradeId: state.nextTradeId + 1n,
  };
  return { ok: true, state: next, trade };
}

/**
 * Deterministic, pure: credit USD (floor) and debit coin atoms. Fails if inventory insufficient.
 */
export function applySell(
  state: PortfolioState,
  input: MarketOrderInput,
): ExecutionResult {
  const bad = validateOrderBase(input);
  if (bad !== null) {
    return bad;
  }
  const held = state.holdingsAtoms[input.ticker];
  if (held < input.quantityAtoms) {
    return { ok: false, error: 'INSUFFICIENT_HOLDINGS' };
  }
  const proceedsUsdCents = mulDivFloor(
    input.quantityAtoms,
    input.priceUsdCentsPerCoin,
    ATOMS_PER_COIN,
  );
  const holdings = cloneHoldings(state.holdingsAtoms);
  holdings[input.ticker] -= input.quantityAtoms;
  const balanceUsdCents = state.balanceUsdCents + proceedsUsdCents;
  const trade: TradeRecord = {
    id: state.nextTradeId.toString(10),
    timestampMs: input.timestampMs,
    side: 'sell',
    ticker: input.ticker,
    quantityAtoms: input.quantityAtoms,
    priceUsdCentsPerCoin: input.priceUsdCentsPerCoin,
    notionalUsdCents: proceedsUsdCents,
    balanceUsdCentsAfter: balanceUsdCents,
    holdingsAtomsAfter: { ...holdings },
  };
  const next: PortfolioState = {
    balanceUsdCents,
    holdingsAtoms: holdings,
    trades: [...state.trades, trade],
    nextTradeId: state.nextTradeId + 1n,
  };
  return { ok: true, state: next, trade };
}
