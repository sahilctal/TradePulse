import type { MockTicker } from '../../engine';

/** $10,000.00 starting cash balance, in USD cents (integer). */
export const STARTING_BALANCE_USD_CENTS = 10_000n * 100n;

/**
 * One “whole” coin is represented as this many integer atoms (fixed 8 dp),
 * e.g. 1 BTC === 100_000_000n atoms. All three mock tickers use the same scale.
 */
export const ATOMS_PER_COIN = 100_000_000n;

export const ZERO_HOLDINGS: Readonly<Record<MockTicker, bigint>> = {
  BTC: 0n,
  ETH: 0n,
  SOL: 0n,
};
