import type { MockTicker } from '../../engine';
import type { PriceSnapshot } from '../../engine';
import { ATOMS_PER_COIN, STARTING_BALANCE_USD_CENTS } from '../../domain/trading/constants';
import { mulDivFloor } from '../../domain/trading/bigintMath';
import type { PortfolioState } from '../../domain/trading/types';
import { usdPerCoinNumberToCents } from '../../domain/limitOrders/priceConversion';

export type LivePortfolioMetrics = {
  readonly cashUsdCents: bigint;
  /** Market value of all open positions (USD cents, floored per leg) */
  readonly positionsMarketUsdCents: bigint;
  /** Cash + positions */
  readonly totalEquityUsdCents: bigint;
  /** Equity minus starting principal ($10,000) */
  readonly plUsdCents: bigint;
  readonly perTicker: Readonly<Record<MockTicker, TickerPositionMetrics>>;
};

export type TickerPositionMetrics = {
  readonly atoms: bigint;
  readonly priceUsdCentsPerCoin: bigint | null;
  readonly marketUsdCents: bigint;
};

/**
 * Pure: combines persisted portfolio with a price snapshot for display and P/L.
 */
export function computeLivePortfolioMetrics(
  portfolio: PortfolioState,
  snapshot: PriceSnapshot,
): LivePortfolioMetrics {
  const cashUsdCents = portfolio.balanceUsdCents;
  const perTicker = {} as Record<MockTicker, TickerPositionMetrics>;
  let positionsMarketUsdCents = 0n;

  const tickers: MockTicker[] = ['BTC', 'ETH', 'SOL'];
  for (const t of tickers) {
    const atoms = portfolio.holdingsAtoms[t];
    const priceUsdCentsPerCoin = usdPerCoinNumberToCents(snapshot.prices[t]);
    let marketUsdCents = 0n;
    if (atoms > 0n && priceUsdCentsPerCoin !== null) {
      marketUsdCents = mulDivFloor(atoms, priceUsdCentsPerCoin, ATOMS_PER_COIN);
    }
    positionsMarketUsdCents += marketUsdCents;
    perTicker[t] = {
      atoms,
      priceUsdCentsPerCoin,
      marketUsdCents,
    };
  }

  const totalEquityUsdCents = cashUsdCents + positionsMarketUsdCents;
  const plUsdCents = totalEquityUsdCents - STARTING_BALANCE_USD_CENTS;

  return {
    cashUsdCents,
    positionsMarketUsdCents,
    totalEquityUsdCents,
    plUsdCents,
    perTicker,
  };
}

export function formatUsdFromCents(cents: bigint, opts?: { maximumFractionDigits?: number }): string {
  const neg = cents < 0n;
  const abs = neg ? -cents : cents;
  const whole = abs / 100n;
  const frac = abs % 100n;
  const fracStr = frac.toString().padStart(2, '0');
  const maxFrac = opts?.maximumFractionDigits ?? 2;
  const num = Number(`${whole}.${fracStr}`);
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: maxFrac,
    minimumFractionDigits: 2,
  }).format(neg ? -num : num);
  return formatted;
}

/**
 * Human-readable coin size from atomic units (8 dp), trimming trailing zeros.
 */
export function formatCoinAtoms(atoms: bigint): string {
  if (atoms === 0n) {
    return '0';
  }
  const whole = atoms / ATOMS_PER_COIN;
  const frac = atoms % ATOMS_PER_COIN;
  const fracStr = frac.toString().padStart(8, '0').replace(/0+$/, '');
  return fracStr.length > 0 ? `${whole.toString()}.${fracStr}` : whole.toString();
}
