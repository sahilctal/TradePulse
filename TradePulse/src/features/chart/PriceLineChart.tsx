import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import type { PricePoint } from '../../engine';
import { buildPriceLinePathD } from '../../charts/lineChartGeometry';
import styles from './PriceLineChart.module.css';

export type PriceLineChartProps = {
  /** Newest point should be last; path spans full plot width by index. */
  readonly history: readonly PricePoint[];
  readonly stroke?: string;
  readonly strokeWidth?: number;
  readonly className?: string;
  readonly style?: CSSProperties;
};

/**
 * Responsive SVG line chart: measures its container, normalizes Y from data min/max,
 * and memoizes the path so work runs only when size or series changes.
 */
export function PriceLineChart({
  history,
  stroke = '#5b8def',
  strokeWidth = 1.75,
  className,
  style,
}: PriceLineChartProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (el === null) {
      return;
    }
    const apply = (w: number, h: number) => {
      const width = Math.max(0, Math.floor(w));
      const height = Math.max(0, Math.floor(h));
      setSize((prev) =>
        prev.width === width && prev.height === height ? prev : { width, height },
      );
    };
    const rect = el.getBoundingClientRect();
    apply(rect.width, rect.height);
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry === undefined) {
        return;
      }
      const { width, height } = entry.contentRect;
      apply(width, height);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, []);

  const pathD = useMemo(
    () => buildPriceLinePathD(history, size.width, size.height),
    [history, size.width, size.height],
  );

  const showPath = pathD.length > 0 && size.width > 0 && size.height > 0;

  return (
    <div
      ref={wrapRef}
      className={[styles.wrap, className].filter(Boolean).join(' ')}
      style={style}
    >
      {showPath ? (
        <svg
          className={styles.svg}
          width="100%"
          height="100%"
          viewBox={`0 0 ${size.width} ${size.height}`}
          preserveAspectRatio="none"
          role="img"
          aria-label="Price chart"
        >
          <path
            d={pathD}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      ) : null}
    </div>
  );
}
