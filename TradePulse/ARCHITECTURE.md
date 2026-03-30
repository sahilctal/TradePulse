# Architecture

## Chart rendering: from price array to SVG line

The chart does **not** plot raw numbers in isolation—it maps **time-ordered `PricePoint[]`** (each with `price` and `timestamp`) into pixel coordinates inside a measured SVG box, then emits an SVG **`path`** `d` attribute.

### 1. Measure the drawing area

`PriceLineChart` uses a **ResizeObserver** on a wrapper `div` to read **width × height** in CSS pixels. The `<svg>` uses `width="100%"`, `height="100%"`, and a `viewBox="0 0 width height"` so coordinates in the path match pixel space.

### 2. Padding and content rectangle

`computeChartContentRect` (in `src/charts/lineChartGeometry.ts`) subtracts fixed padding from the SVG width/height so the polyline does not touch the border.

### 3. Vertical domain (auto scale)

`computePriceYDomainFromPoints` scans all **`price`** values in the series to get **min** and **max**. If the series is flat, a small symmetric pad is applied so the line is still drawable. This **normalizes** the Y axis to the visible range of the buffer.

### 4. Map each point to \((x, y)\)

`projectPricePointToXY`:

- **X**: index `i` of `n` points is spread linearly across the content width: left at `i = 0`, right at `i = n - 1` (single point centered).
- **Y**: price is linearly mapped from `[domain.min, domain.max]` to the content height, with **inversion** so **higher price is higher on screen** (SVG Y grows downward, so the formula uses `1 - (price - min) / span`).

### 5. Build the path string

`buildPriceLinePathD` walks the points in order, emitting SVG commands:

- first point: `M x y`
- following points: `L x y`

Coordinates are formatted with a fixed precision helper (`toFixed(2)`) for stable path strings.

### 6. React efficiency

The path string is **`useMemo`**’d from **`history` + measured width/height**, so work repeats only when data or layout changes—not on unrelated parent renders.

---

## Mock price engine: consistent “live” data across components

All UI that shows **live** prices should derive from the **same** `MockPriceEngine` instance. The app guarantees that with:

### Single instance via `EngineProvider`

`EngineProvider` constructs **one** `MockPriceEngine` in a `useRef` and exposes it through React context (`usePriceEngine()`). Every consumer (chart, watchlist rows, trading panel, limit-order engine) resolves the **same** object.

### One clock, one truth per tick

On each timer tick, the engine:

1. Advances **all** tickers (BTC, ETH, SOL) in lockstep.
2. Increments a monotonic **`tickSequence`**.
3. Materializes **immutable snapshots** (`PriceSnapshot` / `TickerPriceSnapshot`) with **copied** price maps and history arrays so subscribers cannot mutate internal buffers.

### Subscription pattern

- **`subscribeAll(listener)`** — every tick, listeners receive the **full** `PriceSnapshot` (all symbols). Used where global evaluation is needed (e.g. **limit order engine** processing multiple tickers in portfolio order).
- **`subscribe(ticker, listener)`** — each tick, listeners for that symbol receive only that symbol’s `TickerPriceSnapshot`. Used to **scope updates** (e.g. a single watchlist row or the chart for the active ticker) so other symbols’ updates do not trigger that component’s state.

### Consistency rules

- No second “shadow” price source in the UI—all mids come from **`getSnapshot()`** or subscription callbacks from that engine.
- **Limit orders** convert the engine’s floating mid to **integer USD cents** with the same rounding policy as other modules (`usdPerCoinNumberToCents` / string parsers), so **comparisons** against stored trigger prices stay aligned with what users typed.

Together, **single engine + immutable snapshots + explicit subscriptions** keeps “live” numbers coherent across the watchlist, chart, manual trade ticket, and automated limit fills.
