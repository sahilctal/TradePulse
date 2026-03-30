import {
  decodeLimitOrderBook,
  emptyLimitOrderBook,
  encodeLimitOrderBook,
  type LimitOrderBookSnapshot,
} from './limitOrderCodec';

const STORAGE_KEY = 'tradepulse-limit-orders';

export function loadLimitOrderBook(): LimitOrderBookSnapshot {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null || raw === '') {
      return emptyLimitOrderBook();
    }
    return decodeLimitOrderBook(raw) ?? emptyLimitOrderBook();
  } catch {
    return emptyLimitOrderBook();
  }
}

export function saveLimitOrderBook(snapshot: LimitOrderBookSnapshot): void {
  try {
    localStorage.setItem(STORAGE_KEY, encodeLimitOrderBook(snapshot));
  } catch {
    // Quota / private mode
  }
}
