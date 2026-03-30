import { memo, useEffect, useMemo, useReducer } from 'react';
import type { PriceSnapshot } from '../../engine';
import { MOCK_TICKERS, type MockTicker } from '../../engine';
import { usePriceEngine } from '../../providers/EngineProvider';
import { usePortfolio } from '../../providers/PortfolioProvider';
import type { PortfolioState } from '../../domain/trading/types';
import {
  computeLivePortfolioMetrics,
  formatCoinAtoms,
  formatUsdFromCents,
  type LivePortfolioMetrics,
} from './portfolioMetrics';
import { TradeHistorySection } from './TradeHistorySection';
import styles from './PortfolioPanel.module.css';

function snapshotTickKey(s: PriceSnapshot): string {
  return `${s.tickSequence}:${s.emittedAtMs}:${s.prices.BTC}:${s.prices.ETH}:${s.prices.SOL}`;
}

function priceReducer(
  prev: PriceSnapshot,
  next: PriceSnapshot,
): PriceSnapshot {
  return snapshotTickKey(prev) === snapshotTickKey(next) ? prev : next;
}

const HoldingRow = memo(function HoldingRow({
  ticker,
  metrics,
}: {
  ticker: MockTicker;
  metrics: LivePortfolioMetrics['perTicker'][MockTicker];
}) {
  if (metrics.atoms === 0n) {
    return null;
  }
  return (
    <tr>
      <td className={styles.symbol}>{ticker}</td>
      <td className={styles.mono}>{formatCoinAtoms(metrics.atoms)}</td>
      <td className={styles.mono}>
        {metrics.priceUsdCentsPerCoin === null
          ? '—'
          : formatUsdFromCents(metrics.priceUsdCentsPerCoin)}
      </td>
      <td className={styles.mono}>
        {formatUsdFromCents(metrics.marketUsdCents)}
      </td>
    </tr>
  );
});

/**
 * Live block: subscribes to `subscribeAll` only while the book holds any crypto.
 */
const PortfolioLiveSection = memo(function PortfolioLiveSection({
  portfolio,
}: {
  portfolio: PortfolioState;
}) {
  const engine = usePriceEngine();
  const hasPositions = MOCK_TICKERS.some(
    (t) => portfolio.holdingsAtoms[t] > 0n,
  );

  const [snapshot, dispatchSnapshot] = useReducer(
    priceReducer,
    engine,
    (eng) => eng.getSnapshot(),
  );

  useEffect(() => {
    if (!hasPositions) {
      dispatchSnapshot(engine.getSnapshot());
      return;
    }
    return engine.subscribeAll(dispatchSnapshot);
  }, [engine, hasPositions]);

  const metrics = useMemo(
    () => computeLivePortfolioMetrics(portfolio, snapshot),
    [portfolio, snapshot],
  );

  const plClass =
    metrics.plUsdCents > 0n
      ? styles.plPos
      : metrics.plUsdCents < 0n
        ? styles.plNeg
        : styles.plFlat;

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>Overview</h3>
      <dl className={styles.stats}>
        <div>
          <dt>Cash</dt>
          <dd>{formatUsdFromCents(metrics.cashUsdCents)}</dd>
        </div>
        <div>
          <dt>Invested value (positions)</dt>
          <dd>{formatUsdFromCents(metrics.positionsMarketUsdCents)}</dd>
        </div>
        <div>
          <dt>Total equity</dt>
          <dd className={styles.emphasis}>
            {formatUsdFromCents(metrics.totalEquityUsdCents)}
          </dd>
        </div>
        <div>
          <dt>Live P/L vs $10k</dt>
          <dd className={plClass}>
            {formatUsdFromCents(metrics.plUsdCents)}
          </dd>
        </div>
      </dl>

      <h4 className={styles.subTitle}>Holdings</h4>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Size</th>
              <th>Last</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_TICKERS.map((t) => (
              <HoldingRow key={t} ticker={t} metrics={metrics.perTicker[t]!} />
            ))}
          </tbody>
        </table>
      </div>
      {!hasPositions ? (
        <p className={styles.muted}>
          No open positions — totals use cash only; quotes resume when you hold
          a balance.
        </p>
      ) : null}
    </div>
  );
});

export const PortfolioPanel = memo(function PortfolioPanel() {
  const { portfolio } = usePortfolio();

  return (
    <section className={styles.panel} aria-labelledby="portfolio-title">
      <h2 id="portfolio-title" className={styles.title}>
        Portfolio
      </h2>
      <div className={styles.grid}>
        <PortfolioLiveSection portfolio={portfolio} />
        <TradeHistorySection trades={portfolio.trades} />
      </div>
    </section>
  );
});
