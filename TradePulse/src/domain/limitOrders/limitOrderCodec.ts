import { MOCK_TICKERS, type MockTicker } from '../../engine';
import type { LimitOrder } from './types';

const SCHEMA_VERSION = 1 as const;

type EncodedOrder = {
  readonly id: string;
  readonly ticker: MockTicker;
  readonly side: 'buy' | 'sell';
  readonly quantityAtoms: string;
  readonly limitUsdCentsPerCoin: string;
  readonly createdAtMs: number;
};

type EncodedBook = {
  readonly v: typeof SCHEMA_VERSION;
  readonly nextOrderId: string;
  readonly orders: readonly EncodedOrder[];
};

function isMockTicker(v: unknown): v is MockTicker {
  return typeof v === 'string' && (MOCK_TICKERS as readonly string[]).includes(v);
}

function isSide(v: unknown): v is 'buy' | 'sell' {
  return v === 'buy' || v === 'sell';
}

function parsePositiveBigInt(raw: unknown): bigint | null {
  if (typeof raw !== 'string' || !/^\d+$/.test(raw)) {
    return null;
  }
  try {
    const n = BigInt(raw);
    if (n <= 0n) {
      return null;
    }
    return n;
  } catch {
    return null;
  }
}

function parseNonNegBigInt(raw: unknown): bigint | null {
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

function decodeOrder(raw: unknown): LimitOrder | null {
  if (raw === null || typeof raw !== 'object') {
    return null;
  }
  const o = raw as Record<string, unknown>;
  const id = o.id;
  const ticker = o.ticker;
  const side = o.side;
  const createdAtMs = o.createdAtMs;
  if (typeof id !== 'string' || id.length === 0) {
    return null;
  }
  if (!isMockTicker(ticker) || !isSide(side)) {
    return null;
  }
  if (typeof createdAtMs !== 'number' || !Number.isFinite(createdAtMs)) {
    return null;
  }
  const quantityAtoms = parsePositiveBigInt(o.quantityAtoms);
  const limitUsdCentsPerCoin = parseNonNegBigInt(o.limitUsdCentsPerCoin);
  if (quantityAtoms === null || limitUsdCentsPerCoin === null) {
    return null;
  }
  if (limitUsdCentsPerCoin === 0n) {
    return null;
  }
  return {
    id,
    ticker,
    side,
    quantityAtoms,
    limitUsdCentsPerCoin,
    createdAtMs,
  };
}

export type LimitOrderBookSnapshot = {
  readonly nextOrderId: bigint;
  readonly orders: readonly LimitOrder[];
};

export function encodeLimitOrderBook(snapshot: LimitOrderBookSnapshot): string {
  const payload: EncodedBook = {
    v: SCHEMA_VERSION,
    nextOrderId: snapshot.nextOrderId.toString(10),
    orders: snapshot.orders.map((o) => ({
      id: o.id,
      ticker: o.ticker,
      side: o.side,
      quantityAtoms: o.quantityAtoms.toString(10),
      limitUsdCentsPerCoin: o.limitUsdCentsPerCoin.toString(10),
      createdAtMs: o.createdAtMs,
    })),
  };
  return JSON.stringify(payload);
}

export function decodeLimitOrderBook(json: string): LimitOrderBookSnapshot | null {
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
  const nextOrderId = parsePositiveBigInt(o.nextOrderId);
  if (nextOrderId === null) {
    return null;
  }
  const rawOrders = o.orders;
  if (!Array.isArray(rawOrders)) {
    return null;
  }
  const orders: LimitOrder[] = [];
  for (const row of rawOrders) {
    const ord = decodeOrder(row);
    if (ord === null) {
      return null;
    }
    orders.push(ord);
  }
  return { nextOrderId, orders };
}

export function emptyLimitOrderBook(): LimitOrderBookSnapshot {
  return { nextOrderId: 1n, orders: [] };
}
