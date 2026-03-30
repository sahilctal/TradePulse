import {
  decodePortfolioState,
  encodePortfolioState,
  parsePortfolioStateOrInitial,
} from './portfolioCodec';
import { initialPortfolioState } from './execution';
import type { PortfolioState } from './types';

const STORAGE_KEY = 'tradepulse-portfolio';

/**
 * Reads and validates persisted portfolio. Falls back to fresh $10k state if missing or corrupt.
 */
export function loadPortfolioState(): PortfolioState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null || raw === '') {
      return initialPortfolioState();
    }
    return parsePortfolioStateOrInitial(raw);
  } catch {
    return initialPortfolioState();
  }
}

/**
 * Persists portfolio as JSON with bigints encoded as base-10 strings.
 */
export function savePortfolioState(state: PortfolioState): void {
  try {
    const encoded = encodePortfolioState(state);
    localStorage.setItem(STORAGE_KEY, encoded);
  } catch {
    // Quota / private mode — ignore per secure handling rules.
  }
}

/**
 * Pure validation helper: returns whether a string round-trips without loss.
 * Useful in tests; does not touch storage.
 */
export function isRoundTripPortfolioState(state: PortfolioState): boolean {
  const json = encodePortfolioState(state);
  const back = decodePortfolioState(json);
  if (back === null) {
    return false;
  }
  return (
    back.balanceUsdCents === state.balanceUsdCents &&
    back.nextTradeId === state.nextTradeId &&
    back.holdingsAtoms.BTC === state.holdingsAtoms.BTC &&
    back.holdingsAtoms.ETH === state.holdingsAtoms.ETH &&
    back.holdingsAtoms.SOL === state.holdingsAtoms.SOL &&
    back.trades.length === state.trades.length
  );
}
