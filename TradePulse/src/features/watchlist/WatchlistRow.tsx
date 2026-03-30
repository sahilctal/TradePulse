import { memo, useEffect, useMemo, useReducer } from 'react';
import type { MockTicker } from '../../engine';
import { usePriceEngine } from '../../providers/EngineProvider';
import { simulated24hPercentChange } from './simulated24hChange';
import { tickerRowReducer } from './tickerRowSnapshotSelector';
import { tickerSnapshotFromFull } from './tickerSnapshotFromFull';
import styles from './WatchlistSidebar.module.css';

/**
 * Performance: each row subscribes only to its symbol via the engine’s per-ticker channel,
 * so a tick never schedules updates on rows for other symbols. The reducer + selector
 * bail out when a redundant snapshot is emitted (same tickSequence / price / history edges),
 * so React keeps the previous state reference and skips reconciliation for that row.
 */

const priceFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const pctFmt = new Intl.NumberFormat('en-US', {
  signDisplay: 'exceptZero',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export type WatchlistRowProps = {
  ticker: MockTicker;
  onRemove: (ticker: MockTicker) => void;
};

export const WatchlistRow = memo(function WatchlistRow({
  ticker,
  onRemove,
}: WatchlistRowProps) {
  const engine = usePriceEngine();

  const [update, dispatch] = useReducer(
    tickerRowReducer,
    engine,
    (eng) => tickerSnapshotFromFull(eng.getSnapshot(), ticker),
  );

  useEffect(() => {
    dispatch(tickerSnapshotFromFull(engine.getSnapshot(), ticker));
    return engine.subscribe(ticker, dispatch);
  }, [engine, ticker]);

  const pct24hSim = useMemo(
    () => simulated24hPercentChange(update.history, update.price),
    [update.history, update.price],
  );

  const pctClass =
    pct24hSim > 0
      ? styles.changePos
      : pct24hSim < 0
        ? styles.changeNeg
        : styles.changeFlat;

  return (
    <li className={styles.row}>
      <div className={styles.rowMain}>
        <span className={styles.symbol}>{ticker}</span>
        <span className={styles.price}>{priceFmt.format(update.price)}</span>
      </div>
      <div className={styles.rowMeta}>
        <span
          className={pctClass}
          title="Mock daily-style %: change from oldest price in the rolling history buffer (not a real 24h market stat)."
        >
          {pctFmt.format(pct24hSim)}%
        </span>
        <span className={styles.metaHint}>24h sim</span>
        <button
          type="button"
          className={styles.removeBtn}
          aria-label={`Remove ${ticker} from watchlist`}
          onClick={() => {
            onRemove(ticker);
          }}
        >
          ×
        </button>
      </div>
    </li>
  );
});
