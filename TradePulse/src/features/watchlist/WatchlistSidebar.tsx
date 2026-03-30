import {
  memo,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { MOCK_TICKERS, type MockTicker } from '../../engine';
import { useWatchlist } from '../../providers/WatchlistProvider';
import { WatchlistRow } from './WatchlistRow';
import styles from './WatchlistSidebar.module.css';

const AddTickerChips = memo(function AddTickerChips({
  available,
  onAdd,
}: {
  available: readonly MockTicker[];
  onAdd: (ticker: MockTicker) => void;
}): ReactNode {
  if (available.length === 0) {
    return <p className={styles.addHint}>All symbols are on your list.</p>;
  }
  return (
    <div className={styles.addRow} role="group" aria-label="Add symbol">
      {available.map((t) => (
        <button
          key={t}
          type="button"
          className={styles.addChip}
          onClick={() => {
            onAdd(t);
          }}
        >
          + {t}
        </button>
      ))}
    </div>
  );
});

const WatchlistList = memo(function WatchlistList({
  tickers,
  onRemove,
}: {
  tickers: readonly MockTicker[];
  onRemove: (ticker: MockTicker) => void;
}) {
  return (
    <ul className={styles.list}>
      {tickers.map((t) => (
        <WatchlistRow key={t} ticker={t} onRemove={onRemove} />
      ))}
    </ul>
  );
});

export const WatchlistSidebar = memo(function WatchlistSidebar() {
  const { tickers, addTicker, removeTicker } = useWatchlist();

  const handleRemove = useCallback(
    (ticker: MockTicker) => {
      removeTicker(ticker);
    },
    [removeTicker],
  );

  const availableToAdd = useMemo(() => {
    const set = new Set(tickers);
    return MOCK_TICKERS.filter((t) => !set.has(t));
  }, [tickers]);

  return (
    <aside className={styles.sidebar} aria-label="Watchlist">
      <header className={styles.header}>
        <h2 className={styles.title}>Watchlist</h2>
      </header>

      {tickers.length === 0 ? (
        <p className={styles.empty}>No symbols. Add one below.</p>
      ) : (
        <WatchlistList tickers={tickers} onRemove={handleRemove} />
      )}

      <footer className={styles.footer}>
        <span className={styles.footerLabel}>Add</span>
        <AddTickerChips available={availableToAdd} onAdd={addTicker} />
      </footer>
    </aside>
  );
});
