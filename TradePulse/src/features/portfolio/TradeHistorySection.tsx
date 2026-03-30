import { memo } from 'react';
import type { TradeRecord } from '../../domain/trading/types';
import { formatCoinAtoms, formatUsdFromCents } from './portfolioMetrics';
import styles from './PortfolioPanel.module.css';

const timeFmt = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'short',
  timeStyle: 'medium',
});

export type TradeHistorySectionProps = {
  readonly trades: readonly TradeRecord[];
};

const TradeRow = memo(function TradeRow({ trade }: { trade: TradeRecord }) {
  const sideClass =
    trade.side === 'buy' ? styles.tradeBuy : styles.tradeSell;
  return (
    <tr>
      <td className={styles.tradeTime}>
        {timeFmt.format(trade.timestampMs)}
      </td>
      <td className={sideClass}>{trade.side.toUpperCase()}</td>
      <td>{trade.ticker}</td>
      <td className={styles.mono}>{formatCoinAtoms(trade.quantityAtoms)} @</td>
      <td className={styles.mono}>
        {formatUsdFromCents(trade.priceUsdCentsPerCoin)}
      </td>
      <td className={styles.mono}>
        {formatUsdFromCents(trade.notionalUsdCents)}
      </td>
    </tr>
  );
});

/**
 * Isolated from live quotes — only rerenders when the `trades` array reference changes.
 */
export const TradeHistorySection = memo(function TradeHistorySection({
  trades,
}: TradeHistorySectionProps) {
  const rows = [...trades].reverse();
  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>Trade history</h3>
      {rows.length === 0 ? (
        <p className={styles.muted}>No trades yet.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Time</th>
                <th>Side</th>
                <th>Symbol</th>
                <th colSpan={2}>Qty / price</th>
                <th>Notional</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <TradeRow key={t.id} trade={t} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});
