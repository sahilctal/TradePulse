import { MOCK_TICKERS, type MockTicker } from '../../engine';
import { ZERO_HOLDINGS } from './constants';
import { initialPortfolioState } from './execution';
import type { PortfolioState, TradeRecord, TradeSide } from './types';

const SCHEMA_VERSION = 1 as const;

type EncodedTrade = {
  readonly id: string;
  readonly timestampMs: number;
  readonly side: TradeSide;
  readonly ticker: MockTicker;
  readonly quantityAtoms: string;
  readonly priceUsdCentsPerCoin: string;
  readonly notionalUsdCents: string;
  readonly balanceUsdCentsAfter: string;
  readonly holdingsAtomsAfter: Record<MockTicker, string>;
};

type EncodedPortfolio = {
  readonly v: typeof SCHEMA_VERSION;
  readonly balanceUsdCents: string;
  readonly holdingsAtoms: Record<MockTicker, string>;
  readonly trades: readonly EncodedTrade[];
  readonly nextTradeId: string;
};

function isTradeSide(v: unknown): v is TradeSide {
  return v === 'buy' || v === 'sell';
}

function isMockTicker(v: unknown): v is MockTicker {
  return typeof v === 'string' && (MOCK_TICKERS as readonly string[]).includes(v);
}

function parseNonNegativeBigInt(raw: unknown, field: string): bigint | null {
  if (typeof raw !== 'string' || !/^\d+$/.test(raw)) {
    return null;
  }
  try {
    const n = BigInt(raw);
    if (n < 0n) {
      return null;
    }
    return n;
  } catch {
    return null;
  }
}

function decodeTrade(raw: unknown): TradeRecord | null {
  if (raw === null || typeof raw !== 'object') {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const id = o.id;
  const timestampMs = o.timestampMs;
  const side = o.side;
  const ticker = o.ticker;
  if (typeof id !== 'string' || id.length === 0) {
    return null;
  }
  if (typeof timestampMs !== 'number' || !Number.isFinite(timestampMs)) {
    return null;
  }
  if (!isTradeSide(side) || !isMockTicker(ticker)) {
    return null;
  }
  const quantityAtoms = parseNonNegativeBigInt(o.quantityAtoms, 'quantityAtoms');
  const priceUsdCentsPerCoin = parseNonNegativeBigInt(
    o.priceUsdCentsPerCoin,
    'priceUsdCentsPerCoin',
  );
  const notionalUsdCents = parseNonNegativeBigInt(
    o.notionalUsdCents,
    'notionalUsdCents',
  );
  const balanceUsdCentsAfter = parseNonNegativeBigInt(
    o.balanceUsdCentsAfter,
    'balanceUsdCentsAfter',
  );
  if (
    quantityAtoms === null ||
    priceUsdCentsPerCoin === null ||
    notionalUsdCents === null ||
    balanceUsdCentsAfter === null
  ) {
    return null;
  }
  const ha = o.holdingsAtomsAfter;
  if (ha === null || typeof ha !== 'object') {
    return null;
  }
  const rec = ha as Record<string, unknown>;
  const holdingsAtomsAfter: Record<MockTicker, bigint> = {
    BTC: 0n,
    ETH: 0n,
    SOL: 0n,
  };
  for (const sym of MOCK_TICKERS) {
    const p = parseNonNegativeBigInt(rec[sym], sym);
    if (p === null) {
      return null;
    }
    holdingsAtomsAfter[sym] = p;
  }
  return {
    id,
    timestampMs,
    side,
    ticker,
    quantityAtoms,
    priceUsdCentsPerCoin,
    notionalUsdCents,
    balanceUsdCentsAfter,
    holdingsAtomsAfter,
  };
}

/**
 * JSON-safe representation (bigints as base-10 strings). Pure — use for tests and storage.
 */
export function encodePortfolioState(state: PortfolioState): string {
  const payload: EncodedPortfolio = {
    v: SCHEMA_VERSION,
    balanceUsdCents: state.balanceUsdCents.toString(10),
    holdingsAtoms: {
      BTC: state.holdingsAtoms.BTC.toString(10),
      ETH: state.holdingsAtoms.ETH.toString(10),
      SOL: state.holdingsAtoms.SOL.toString(10),
    },
    trades: state.trades.map((t) => ({
      id: t.id,
      timestampMs: t.timestampMs,
      side: t.side,
      ticker: t.ticker,
      quantityAtoms: t.quantityAtoms.toString(10),
      priceUsdCentsPerCoin: t.priceUsdCentsPerCoin.toString(10),
      notionalUsdCents: t.notionalUsdCents.toString(10),
      balanceUsdCentsAfter: t.balanceUsdCentsAfter.toString(10),
      holdingsAtomsAfter: {
        BTC: t.holdingsAtomsAfter.BTC.toString(10),
        ETH: t.holdingsAtomsAfter.ETH.toString(10),
        SOL: t.holdingsAtomsAfter.SOL.toString(10),
      },
    })),
    nextTradeId: state.nextTradeId.toString(10),
  };
  return JSON.stringify(payload);
}

/**
 * Parses persisted JSON. Returns `null` if malformed or unsafe — callers should fall back to `initialPortfolioState()`.
 */
export function decodePortfolioState(json: string): PortfolioState | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json) as unknown;
  } catch {
    return null;
  }
  if (parsed === null || typeof parsed !== 'object') {
    return null;
  }
  const o = parsed as Record<string, unknown>;
  if (o.v !== SCHEMA_VERSION) {
    return null;
  }
  const balanceUsdCents = parseNonNegativeBigInt(o.balanceUsdCents, 'balance');
  const nextTradeId = parseNonNegativeBigInt(o.nextTradeId, 'nextTradeId');
  if (balanceUsdCents === null || nextTradeId === null || nextTradeId < 1n) {
    return null;
  }
  const holdingsRaw = o.holdingsAtoms;
  if (holdingsRaw === null || typeof holdingsRaw !== 'object') {
    return null;
  }
  const holdingsAtoms: Record<MockTicker, bigint> = { ...ZERO_HOLDINGS };
  for (const sym of MOCK_TICKERS) {
    const p = parseNonNegativeBigInt(
      (holdingsRaw as Record<string, unknown>)[sym],
      sym,
    );
    if (p === null) {
      return null;
    }
    holdingsAtoms[sym] = p;
  }
  const tradesRaw = o.trades;
  if (!Array.isArray(tradesRaw)) {
    return null;
  }
  const trades: TradeRecord[] = [];
  for (const tr of tradesRaw) {
    const decoded = decodeTrade(tr);
    if (decoded === null) {
      return null;
    }
    trades.push(decoded);
  }
  return {
    balanceUsdCents,
    holdingsAtoms,
    trades,
    nextTradeId,
  };
}

export function parsePortfolioStateOrInitial(json: string): PortfolioState {
  const decoded = decodePortfolioState(json);
  if (decoded === null) {
    return initialPortfolioState();
  }
  return decoded;
}
