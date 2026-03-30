import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react';
import { MOCK_TICKERS, type MockTicker, type TickerPriceSnapshot } from '../../engine';
import {
  applyBuy,
  applySell,
  parseCoinQuantityToAtoms,
} from '../../domain/trading';
import type { ExecutionErrorCode } from '../../domain/trading/types';
import { usdPerCoinNumberToCents } from '../../domain/limitOrders/priceConversion';
import { usePriceEngine } from '../../providers/EngineProvider';
import { usePortfolio } from '../../providers/PortfolioProvider';
import { useWatchlist } from '../../providers/WatchlistProvider';
import { tickerSnapshotFromFull } from '../watchlist/tickerSnapshotFromFull';
import { formatUsdFromCents } from '../portfolio/portfolioMetrics';
import styles from './TradingPanel.module.css';

function errorMessage(code: ExecutionErrorCode): string {
  switch (code) {
    case 'INSUFFICIENT_BALANCE':
      return 'Not enough USD cash for this buy.';
    case 'INSUFFICIENT_HOLDINGS':
      return 'Not enough coin to sell.';
    case 'INVALID_PRICE':
      return 'Invalid price.';
    case 'INVALID_QUANTITY':
      return 'Enter a quantity greater than zero (up to 8 decimal places).';
    default:
      return 'Order rejected.';
  }
}

export type TradingPanelProps = {
  readonly ticker: MockTicker;
  readonly onTickerChange: (ticker: MockTicker) => void;
};

export const TradingPanel = memo(function TradingPanel({
  ticker,
  onTickerChange,
}: TradingPanelProps) {
  const engine = usePriceEngine();
  const { portfolio, setPortfolio } = usePortfolio();
  const { addTicker, hasTicker } = useWatchlist();

  const [update, setUpdate] = useState<TickerPriceSnapshot>(() =>
    tickerSnapshotFromFull(engine.getSnapshot(), ticker),
  );
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [qtyRaw, setQtyRaw] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setUpdate(tickerSnapshotFromFull(engine.getSnapshot(), ticker));
    return engine.subscribe(ticker, setUpdate);
  }, [engine, ticker]);

  const midCents = useMemo(
    () => usdPerCoinNumberToCents(update.price),
    [update.price],
  );

  const onSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      const atoms = parseCoinQuantityToAtoms(qtyRaw);
      if (atoms === null || atoms <= 0n) {
        setError(
          'Use a positive amount like 0.1 or 1 (max 8 digits after the decimal).',
        );
        return;
      }
      if (midCents === null) {
        setError('Price unavailable — try again.');
        return;
      }
      const input = {
        ticker,
        quantityAtoms: atoms,
        priceUsdCentsPerCoin: midCents,
        timestampMs: update.emittedAtMs,
      };
      const result =
        side === 'buy' ? applyBuy(portfolio, input) : applySell(portfolio, input);
      if (result.ok) {
        setPortfolio(result.state);
        setQtyRaw('');
      } else {
        setError(errorMessage(result.error));
      }
    },
    [
      qtyRaw,
      midCents,
      portfolio,
      setPortfolio,
      side,
      ticker,
      update.emittedAtMs,
    ],
  );

  const onWatchlist = useCallback(() => {
    addTicker(ticker);
  }, [addTicker, ticker]);

  const watchlisted = hasTicker(ticker);

  return (
    <section className={styles.panel} aria-labelledby="trade-title">
      <h2 id="trade-title" className={styles.title}>
        Trade
      </h2>
      <p className={styles.help}>
        Choose a symbol, buy or sell, and size in whole coins (e.g.{' '}
        <code className={styles.code}>0.25</code>). Orders fill at the latest
        mid price from the simulator.
      </p>

      <form className={styles.form} onSubmit={onSubmit}>
        <div className={styles.row}>
          <label className={styles.label} htmlFor="trade-ticker">
            Ticker
          </label>
          <select
            id="trade-ticker"
            className={styles.select}
            value={ticker}
            onChange={(ev) => {
              onTickerChange(ev.target.value as MockTicker);
            }}
          >
            {MOCK_TICKERS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.row} role="group" aria-label="Side">
          <span className={styles.label}>Side</span>
          <div className={styles.seg}>
            <button
              type="button"
              className={side === 'buy' ? styles.segActive : styles.segBtn}
              onClick={() => {
                setSide('buy');
              }}
            >
              Buy
            </button>
            <button
              type="button"
              className={side === 'sell' ? styles.segActive : styles.segBtn}
              onClick={() => {
                setSide('sell');
              }}
            >
              Sell
            </button>
          </div>
        </div>

        <div className={styles.row}>
          <label className={styles.label} htmlFor="trade-qty">
            Size (coins)
          </label>
          <input
            id="trade-qty"
            className={styles.input}
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.0"
            value={qtyRaw}
            onChange={(ev) => {
              setQtyRaw(ev.target.value);
            }}
          />
        </div>

        <div className={styles.mid}>
          <span className={styles.midLabel}>Mid (sim)</span>
          <span className={styles.midValue}>
            {midCents === null ? '—' : formatUsdFromCents(midCents)}
          </span>
        </div>

        {error !== null ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" className={styles.submit}>
          {side === 'buy' ? 'Buy' : 'Sell'} {ticker}
        </button>
      </form>

      <div className={styles.watchRow}>
        {watchlisted ? (
          <span className={styles.watchNote}>{ticker} is on your watchlist.</span>
        ) : (
          <button
            type="button"
            className={styles.watchBtn}
            onClick={onWatchlist}
          >
            Add {ticker} to watchlist
          </button>
        )}
      </div>
    </section>
  );
});
