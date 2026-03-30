import {
  memo,
  useCallback,
  useState,
  type FormEvent,
} from 'react';
import { MOCK_TICKERS, type MockTicker } from '../../engine';
import { parseCoinQuantityToAtoms } from '../../domain/trading';
import { parseUsdPerCoinDecimalStringToCents } from '../../domain/limitOrders/priceConversion';
import { useLimitOrders } from '../../providers/LimitOrderProvider';
import { formatCoinAtoms, formatUsdFromCents } from '../portfolio/portfolioMetrics';
import styles from './LimitOrdersPanel.module.css';

const timeFmt = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'short',
  timeStyle: 'short',
});

export type LimitOrdersPanelProps = {
  readonly ticker: MockTicker;
  readonly onTickerChange: (ticker: MockTicker) => void;
};

export const LimitOrdersPanel = memo(function LimitOrdersPanel({
  ticker,
  onTickerChange,
}: LimitOrdersPanelProps) {
  const { pendingOrders, placeLimitOrder, cancelLimitOrder } = useLimitOrders();

  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [qtyRaw, setQtyRaw] = useState('');
  const [triggerRaw, setTriggerRaw] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      const atoms = parseCoinQuantityToAtoms(qtyRaw);
      if (atoms === null || atoms <= 0n) {
        setError(
          'Enter a positive size (e.g. 0.1), up to 8 decimal places.',
        );
        return;
      }
      const triggerCents = parseUsdPerCoinDecimalStringToCents(triggerRaw);
      if (triggerCents === null || triggerCents <= 0n) {
        setError(
          'Enter a trigger price in USD per coin (e.g. 98500 or 3500.50), up to 4 decimal places.',
        );
        return;
      }
      try {
        placeLimitOrder({
          ticker,
          side,
          quantityAtoms: atoms,
          limitUsdCentsPerCoin: triggerCents,
          createdAtMs: Date.now(),
        });
        setQtyRaw('');
        setTriggerRaw('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not place order.');
      }
    },
    [placeLimitOrder, qtyRaw, side, ticker, triggerRaw],
  );

  return (
    <section className={styles.panel} aria-labelledby="limit-orders-title">
      <h2 id="limit-orders-title" className={styles.title}>
        Limit orders
      </h2>
      <p className={styles.help}>
        Set a <strong>trigger price</strong> (USD per whole coin). When the
        simulated mid crosses it, the order runs automatically:{' '}
        <strong>buys</strong> fill when mid ≤ trigger; <strong>sells</strong>{' '}
        when mid ≥ trigger. Fills use the current mid at execution.
      </p>

      <form className={styles.form} onSubmit={onSubmit}>
        <div className={styles.row}>
          <label className={styles.label} htmlFor="limit-ticker">
            Ticker
          </label>
          <select
            id="limit-ticker"
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
          <label className={styles.label} htmlFor="limit-qty">
            Size (coins)
          </label>
          <input
            id="limit-qty"
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

        <div className={styles.row}>
          <label className={styles.label} htmlFor="limit-trigger">
            Trigger price (USD / coin)
          </label>
          <input
            id="limit-trigger"
            className={styles.input}
            inputMode="decimal"
            autoComplete="off"
            placeholder="e.g. 98500.50"
            value={triggerRaw}
            onChange={(ev) => {
              setTriggerRaw(ev.target.value);
            }}
          />
        </div>

        {error !== null ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" className={styles.submit}>
          Place limit order
        </button>
      </form>

      <div className={styles.listSection}>
        <h3 className={styles.listTitle}>Working orders</h3>
        {pendingOrders.length === 0 ? (
          <p className={styles.muted}>No open limit orders.</p>
        ) : (
          <ul className={styles.orderList}>
            {pendingOrders.map((o) => (
              <li key={o.id} className={styles.orderItem}>
                <div className={styles.orderMain}>
                  <span
                    className={
                      o.side === 'buy' ? styles.sideBuy : styles.sideSell
                    }
                  >
                    {o.side.toUpperCase()}
                  </span>
                  <span className={styles.sym}>{o.ticker}</span>
                  <span className={styles.mono}>
                    {formatCoinAtoms(o.quantityAtoms)} · trigger{' '}
                    {o.side === 'buy' ? '≤' : '≥'}{' '}
                    {formatUsdFromCents(o.limitUsdCentsPerCoin)}
                  </span>
                </div>
                <div className={styles.orderMeta}>
                  <span className={styles.time}>
                    {timeFmt.format(o.createdAtMs)}
                  </span>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => {
                      cancelLimitOrder(o.id);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
});
