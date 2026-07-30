

So the hot path stays near **O(pending)** with cheap early exits.

## 6. Core Web Vitals (CWV) optimization

- **LCP:** Preload the primary chart data and use `priority` hints for critical assets.
- **CLS:** Reserve fixed aspect-ratio containers for charts and order books to prevent layout shifts during initial data load.
- **INP:** Offload heavy data processing (e.g., historical trade aggregation) to a Web Worker to keep the main thread responsive to user interactions.