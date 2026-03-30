import type { LimitOrder } from './types';

export function compareLimitOrders(a: LimitOrder, b: LimitOrder): number {
  if (a.createdAtMs !== b.createdAtMs) {
    return a.createdAtMs - b.createdAtMs;
  }
  return a.id.localeCompare(b.id, 'en');
}

export function sortLimitOrders(orders: readonly LimitOrder[]): LimitOrder[] {
  return [...orders].sort(compareLimitOrders);
}

/**
 * Inserts keeping ascending (createdAtMs, id) order without resorting the whole book.
 */
export function insertLimitOrderSorted(list: LimitOrder[], order: LimitOrder): void {
  let lo = 0;
  let hi = list.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (compareLimitOrders(list[mid]!, order) <= 0) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  list.splice(lo, 0, order);
}
