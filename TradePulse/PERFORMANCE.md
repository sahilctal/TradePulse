# Performance: 1-second updates and UI responsiveness

The mock engine emits **one global tick per second** (configurable `intervalMs`). The UI stays responsive by **scoping work** and **avoiding unnecessary React reconciliation**.

## 1. Scoped subscriptions

Components that only need **one symbol** use `engine.subscribe(ticker, …)` rather than lifting all prices into a parent state on every tick. Examples:

- **Watchlist rows** — each row updates only when **its** ticker’s snapshot changes.
- **Chart panel** — subscribes to the **active** ticker only.

This reduces redundant renders and keeps work proportional to what the user is looking at.

## 2. Memoization and stable trade history

- **Portfolio** state updates only when **trades** or **balances** change (manual trade, limit fill), not every second.
- **Trade history** is wrapped in **`React.memo`** with **`trades`** as props—while prices tick, the **trades array reference** stays stable, so **history does not re-render**.

## 3. Memoized chart path

The SVG **`d`** string is computed in **`useMemo`** from **`history` + container size**. Recomputing the polyline is **O(n)** in the number of points (capped by engine history length), which is small (default ~100).

## 4. ResizeObserver vs layout thrash

The chart measures its container with **ResizeObserver** and batches size updates to state only when width/height actually change—avoiding redundant path recomputation on unrelated renders.

## 5. Limit order engine (CPU)

The limit engine runs on the **same tick** as the mock feed. It:

- Converts each **quoted** symbol’s mid to cents **at most once** per tick.
- Builds **per-ticker** min/max limit aggregates to **skip** orders that cannot possibly fill before calling `applyBuy` / `applySell`.
- Keeps pending orders **sorted** on insert instead of re-sorting the whole book every second.

So the hot path stays near **O(pending)** with cheap early exits.

## 6. Main thread / event loop

All logic is **single-threaded JavaScript**. The 1 s interval is **cooperative**—no long synchronous loops. Heavy work is split: chart path math is bounded; portfolio uses **bigint** integer math for money.

## 7. What still re-renders every second

When the user holds **positions** or views **live P/L**, the **portfolio overview** subscribes to **`subscribeAll`** so equity can be recomputed from **all** mids. That section **intentionally** updates once per second; it is isolated from **trade history** (see §2).

---

**Summary:** responsiveness comes from **narrow subscriptions**, **memoized expensive derivations**, **stable props** where data does not change, and **bounded** chart/limit algorithms—not from blocking the main thread.
