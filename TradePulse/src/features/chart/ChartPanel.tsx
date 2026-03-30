import { useEffect, useState } from 'react';
import type { MockTicker, TickerPriceSnapshot } from '../../engine';
import { usePriceEngine } from '../../providers/EngineProvider';
import { tickerSnapshotFromFull } from '../watchlist/tickerSnapshotFromFull';
import { PriceLineChart } from './PriceLineChart';
import styles from './ChartPanel.module.css';

export type ChartPanelProps = {
  readonly ticker?: MockTicker;
};

export function ChartPanel({ ticker = 'BTC' }: ChartPanelProps) {
  const engine = usePriceEngine();
  const [update, setUpdate] = useState<TickerPriceSnapshot>(() =>
    tickerSnapshotFromFull(engine.getSnapshot(), ticker),
  );

  useEffect(() => {
    setUpdate(tickerSnapshotFromFull(engine.getSnapshot(), ticker));
    return engine.subscribe(ticker, setUpdate);
  }, [engine, ticker]);

  return (
    <section className={styles.panel} aria-labelledby="chart-panel-title">
      <h2 id="chart-panel-title" className={styles.title}>
        {ticker} — live
      </h2>
      <PriceLineChart history={update.history} className={styles.chart} />
    </section>
  );
}
