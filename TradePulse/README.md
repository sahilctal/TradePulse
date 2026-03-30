# TradePulse

Lightweight trading terminal demo: **React + TypeScript + Vite**, mock **1 Hz** price engine, native **SVG** charts, portfolio/trading UI, and **limit orders** backed by `localStorage`.

## Prerequisites

- **Node.js** 18+ (recommended LTS)
- **npm** 9+ (or compatible package manager)

## Install

```bash
cd TradePulse
npm install
```

## Run (development)

```bash
npm run dev
```

Opens the Vite dev server (default **http://localhost:5173**). Hot reload is enabled.

## Build (production bundle)

```bash
npm run build
```

Runs `tsc -b` then `vite build`. Output is written to `dist/`.

## Preview production build locally

```bash
npm run preview
```

Serves the contents of `dist/` for smoke-testing the production bundle.

## Project docs

| File | Purpose |
|------|---------|
| [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | Folder layout and module roles |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Chart pipeline, mock engine consistency |
| [PERFORMANCE.md](./PERFORMANCE.md) | 1-second updates and UI responsiveness |
| [TEST_STRATEGY.md](./TEST_STRATEGY.md) | Limit-order trigger testing approach |
| [CHAT_HISTORY.md](./CHAT_HISTORY.md) | Session / prompt log notes |

## Security note

This is a **local demo**. Do not put real API keys or secrets in source. `localStorage` is used for portfolio, watchlist, and pending limit orders—treat as non-sensitive mock data only.
