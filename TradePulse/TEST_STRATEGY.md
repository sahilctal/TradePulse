# Test strategy: limit order trigger logic

The repository currently ships **without** an automated test runner in `package.json`. The limit-order trigger path is **deterministic** and **pure** at the edges, which makes it straightforward to test once Vitest (or Jest) is added.

## What must be tested

1. **Trigger condition (buy)** — fill when **market USD cents ≤ limit USD cents** (mid at or below the buy limit).
2. **Trigger condition (sell)** — fill when **market USD cents ≥ limit USD cents** (mid at or above the sell limit).
3. **No fill** — when the condition is false, **no** `applyBuy` / `applySell` call and **no** portfolio change.
4. **Execution** — `LimitOrderEngine` uses `applyBuy`/`applySell` with `priceUsdCentsPerCoin` = **converted** engine mid at fill time (see `limitOrderEngine.ts` + `priceConversion.ts`).
5. **No double execution** — after a successful fill, the order is **removed** from the pending book; a second snapshot must not re‑execute the same order.

## Recommended layers

### A. Pure functions (unit tests)

| Target | Location | Notes |
|--------|----------|--------|
| `isLimitFillable` | `src/domain/limitOrders/limitMatching.ts` | Table-driven cases for buy/sell vs market/limit. |
| `isOrderPotentiallyFillable` | `src/domain/limitOrders/limitOrderEvaluation.ts` | Bulk reject vs per-order; edge cases with aggregates. |
| `usdPerCoinNumberToCents` | `src/domain/limitOrders/priceConversion.ts` | Known floats → expected cents. |
| `parseUsdPerCoinDecimalStringToCents` | same | Known strings → cents; reject invalid. |
| `applyBuy` / `applySell` | `src/domain/trading/execution.ts` | Already pure; use fixed `PortfolioState` + `MarketOrderInput`. |

These tests are **fast**, **deterministic**, and do not need React or `localStorage`.

### B. Integration-style test (engine + limit book)

**Setup (conceptual):**

1. Construct `MockPriceEngine` with `initialPrices` / `volatility` chosen so the next tick is **predictable**, **or** call internal tick logic indirectly by controlling time (harder with `setInterval`).
2. Simpler approach: **inject** a **fake** price source by **mocking** `subscribeAll` to emit handcrafted `PriceSnapshot`s with specific `prices` and `emittedAtMs`).
3. Instantiate `LimitOrderEngine` with **in-memory** `getPortfolio` / `setPortfolio` (no `localStorage`).
4. Place a limit order with `placeLimitOrder` with known `limitUsdCentsPerCoin`.
5. Emit snapshots with increasing `tickSequence` until the condition flips; assert **one** `setPortfolio` with expected trade + **empty** pending list afterward.

**Assertion:** after fill, `getPendingOrders()` returns **[]** for that order id.

### C. Manual QA (browser)

1. Run `npm run dev`.
2. Place a **buy** limit with trigger **above** current mid → should **not** fill immediately (unless market already satisfies).
3. Place a **buy** limit with trigger **below** current mid → should fill on the next tick where mid ≤ trigger (or immediately if already true).
4. **Cancel** from UI → order disappears from pending list and persists after refresh.
5. **Refresh** page → pending orders reload from `localStorage`; engine still runs.

## Adding a test runner (optional)

```bash
npm add -D vitest @vitest/coverage-v8
```

Add `"test": "vitest"` to `scripts` and colocate `*.test.ts` next to `src/domain/**` for pure functions first.

---

**Summary:** prioritize **pure** matching and conversion tests, then a **single** integration test with **controlled** `PriceSnapshot` emissions, then manual **E2E** in the browser for persistence and UX.
