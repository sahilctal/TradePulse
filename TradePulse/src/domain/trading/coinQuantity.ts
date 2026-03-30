import { ATOMS_PER_COIN } from './constants';

/**
 * Parses a non-negative decimal coin amount (up to 8 fractional digits) into atomic units.
 * Rejects scientific notation and unsafe characters — no floating point.
 */
export function parseCoinQuantityToAtoms(raw: string): bigint | null {
  const s = raw.trim().replace(/\s+/g, '');
  if (s === '') {
    return null;
  }
  if (!/^\d+(\.\d+)?$/.test(s)) {
    return null;
  }
  const [w, f = ''] = s.split('.');
  if (f.length > 8) {
    return null;
  }
  const frac = (f + '00000000').slice(0, 8);
  try {
    return BigInt(w || '0') * ATOMS_PER_COIN + BigInt(frac);
  } catch {
    return null;
  }
}
