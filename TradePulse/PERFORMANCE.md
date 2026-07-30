## 6. Main thread and Web Workers

To ensure the UI remains fluid during high-frequency updates or complex order matching, the mock engine and limit order processing are offloaded to a **Web Worker**. This prevents CPU-intensive calculations (like order book sorting or price aggregation) from blocking the main thread, ensuring the **Interaction to Next Paint (INP)** remains low and the UI thread is dedicated solely to rendering.

## 7. Resource Prioritization

- **Font Loading:** Use `font-display: swap` to ensure text remains visible during web font loads.
- **Image Optimization:** All assets are served via modern formats (WebP/AVIF) with `loading="lazy"` for off-screen elements to improve **Largest Contentful Paint (LCP)**.
- **Bundle Splitting:** The trade history and chart components are loaded via `React.lazy` and `Suspense` to reduce the initial JavaScript payload.