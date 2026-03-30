import type { PricePoint } from '../engine';

/** Insets from the SVG box to the plotting area (device / viewBox units). */
export type ChartPadding = {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
};

export const DEFAULT_CHART_PADDING: ChartPadding = {
  top: 8,
  right: 12,
  bottom: 8,
  left: 12,
};

export type PriceYDomain = {
  readonly min: number;
  readonly max: number;
};

export type ChartContentRect = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

/**
 * Inner plotting rectangle after padding. Width/height floored at 0.
 */
export function computeChartContentRect(
  svgWidth: number,
  svgHeight: number,
  padding: ChartPadding = DEFAULT_CHART_PADDING,
): ChartContentRect {
  const w = Math.max(0, svgWidth - padding.left - padding.right);
  const h = Math.max(0, svgHeight - padding.top - padding.bottom);
  return {
    x: padding.left,
    y: padding.top,
    width: w,
    height: h,
  };
}

/**
 * Min/max over prices for vertical scale. When flat, expands slightly so the line is centered.
 */
export function computePriceYDomain(prices: readonly number[]): PriceYDomain {
  if (prices.length === 0) {
    return { min: 0, max: 1 };
  }
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < prices.length; i++) {
    const v = prices[i];
    if (v === undefined) {
      continue;
    }
    if (v < min) {
      min = v;
    }
    if (v > max) {
      max = v;
    }
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return { min: 0, max: 1 };
  }
  if (min === max) {
    const pad = Math.abs(min) * 0.005 + 0.01;
    return { min: min - pad, max: max + pad };
  }
  return { min, max };
}

export function computePriceYDomainFromPoints(
  points: readonly PricePoint[],
): PriceYDomain {
  if (points.length === 0) {
    return { min: 0, max: 1 };
  }
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < points.length; i++) {
    const v = points[i]?.price;
    if (v === undefined) {
      continue;
    }
    if (v < min) {
      min = v;
    }
    if (v > max) {
      max = v;
    }
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return { min: 0, max: 1 };
  }
  if (min === max) {
    const pad = Math.abs(min) * 0.005 + 0.01;
    return { min: min - pad, max: max + pad };
  }
  return { min, max };
}

/**
 * Maps sample index to X and price to Y inside the content rect. X uses full width; Y inverts so up = higher price.
 */
export function projectPricePointToXY(
  index: number,
  count: number,
  price: number,
  domain: PriceYDomain,
  content: ChartContentRect,
): { x: number; y: number } {
  const span = domain.max - domain.min || 1;
  const x =
    count <= 1
      ? content.x + content.width / 2
      : content.x + (content.width * index) / (count - 1);
  const y = content.y + content.height * (1 - (price - domain.min) / span);
  return { x, y };
}

/**
 * Builds a single SVG subpath (M … L …) from price points. Empty when there is nothing to draw.
 */
export function buildPriceLinePathD(
  points: readonly PricePoint[],
  svgWidth: number,
  svgHeight: number,
  padding: ChartPadding = DEFAULT_CHART_PADDING,
): string {
  const n = points.length;
  if (n === 0 || svgWidth <= 0 || svgHeight <= 0) {
    return '';
  }
  const content = computeChartContentRect(svgWidth, svgHeight, padding);
  if (content.width <= 0 || content.height <= 0) {
    return '';
  }
  const domain = computePriceYDomainFromPoints(points);

  let d = '';
  for (let i = 0; i < n; i++) {
    const p = points[i];
    if (p === undefined) {
      continue;
    }
    const { x, y } = projectPricePointToXY(i, n, p.price, domain, content);
    const cmd = i === 0 ? 'M' : 'L';
    d += `${cmd}${formatCoord(x)} ${formatCoord(y)}`;
  }
  return d;
}

function formatCoord(n: number): string {
  return Number.isFinite(n) ? n.toFixed(2) : '0';
}
