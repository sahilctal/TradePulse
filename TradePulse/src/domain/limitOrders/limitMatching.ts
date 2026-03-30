/**
 * Buy limit: execute when market is at or below the limit (better or equal for buyer).
 * Sell limit: execute when market is at or above the limit.
 */
export function isLimitFillable(
  side: 'buy' | 'sell',
  marketUsdCentsPerCoin: bigint,
  limitUsdCentsPerCoin: bigint,
): boolean {
  if (side === 'buy') {
    return marketUsdCentsPerCoin <= limitUsdCentsPerCoin;
  }
  return marketUsdCentsPerCoin >= limitUsdCentsPerCoin;
}
