import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { MockTicker } from '../engine';
import { loadWatchlist, saveWatchlist } from '../features/watchlist/watchlistStorage';

type WatchlistContextValue = {
  readonly tickers: readonly MockTicker[];
  readonly addTicker: (ticker: MockTicker) => void;
  readonly removeTicker: (ticker: MockTicker) => void;
  readonly hasTicker: (ticker: MockTicker) => boolean;
};

const WatchlistContext = createContext<WatchlistContextValue | null>(null);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [tickers, setTickers] = useState<MockTicker[]>(loadWatchlist);

  useEffect(() => {
    saveWatchlist(tickers);
  }, [tickers]);

  const addTicker = useCallback((ticker: MockTicker) => {
    setTickers((prev) => {
      if (prev.includes(ticker)) {
        return prev;
      }
      return [...prev, ticker];
    });
  }, []);

  const removeTicker = useCallback((ticker: MockTicker) => {
    setTickers((prev) => prev.filter((t) => t !== ticker));
  }, []);

  const hasTicker = useCallback(
    (ticker: MockTicker) => tickers.includes(ticker),
    [tickers],
  );

  const value = useMemo(
    () => ({ tickers, addTicker, removeTicker, hasTicker }),
    [tickers, addTicker, removeTicker, hasTicker],
  );

  return (
    <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>
  );
}

export function useWatchlist(): WatchlistContextValue {
  const ctx = useContext(WatchlistContext);
  if (ctx === null) {
    throw new Error('useWatchlist must be used within WatchlistProvider');
  }
  return ctx;
}
