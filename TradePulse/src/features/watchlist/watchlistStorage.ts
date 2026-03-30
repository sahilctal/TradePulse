import { MOCK_TICKERS, type MockTicker } from '../../engine';

const STORAGE_KEY = 'tradepulse-watchlist';

function isMockTicker(value: unknown): value is MockTicker {
  return (
    typeof value === 'string' &&
    (MOCK_TICKERS as readonly string[]).includes(value)
  );
}

/**
 * Loads persisted tickers. Invalid or empty payloads fall back to the full universe
 * so first-run UX matches the three default symbols.
 */
export function loadWatchlist(): MockTicker[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return [...MOCK_TICKERS];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [...MOCK_TICKERS];
    }
    const filtered = parsed.filter(isMockTicker);
    const unique: MockTicker[] = [...new Set(filtered)];
    return unique.length > 0 ? unique : [...MOCK_TICKERS];
  } catch {
    return [...MOCK_TICKERS];
  }
}

export function saveWatchlist(tickers: MockTicker[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickers));
  } catch {
    // Private mode, quota, or disabled storage — ignore (session-only watchlist).
  }
}
