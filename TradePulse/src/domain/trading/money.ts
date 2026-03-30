/**
 * Converts whole USD (integer dollars) to USD cents without floating point.
 * @example usdDollarsToCents(10_000n) === 1_000_000n
 */
export function usdDollarsToCents(wholeUsd: bigint): bigint {
  return wholeUsd * 100n;
}

/**
 * Builds USD cents from integer dollars and 0–99 fractional cents.
 * @example usdToCentsParts(98500n, 12n) // $98,500.12
 */
export function usdToCentsParts(wholeUsd: bigint, subCents: bigint): bigint {
  if (subCents < 0n || subCents > 99n) {
    throw new RangeError('subCents must be 0..99');
  }
  return wholeUsd * 100n + subCents;
}

/**
 * Whole coins (integer) to atomic units (8 decimal places), no floats.
 */
export function wholeCoinsToAtoms(wholeCoins: bigint): bigint {
  if (wholeCoins < 0n) {
    throw new RangeError('wholeCoins must be non-negative');
  }
  return wholeCoins * 100_000_000n;
}
