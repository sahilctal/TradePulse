import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { EngineProvider } from './providers/EngineProvider';
import { PortfolioProvider } from './providers/PortfolioProvider';
import { LimitOrderProvider } from './providers/LimitOrderProvider';
import { WatchlistProvider } from './providers/WatchlistProvider';
import './styles/global.css';

const el = document.getElementById('root');
if (el === null) {
  throw new Error('Root element #root not found');
}

createRoot(el).render(
  <StrictMode>
    <EngineProvider>
      <PortfolioProvider>
        <LimitOrderProvider>
          <WatchlistProvider>
            <App />
          </WatchlistProvider>
        </LimitOrderProvider>
      </PortfolioProvider>
    </EngineProvider>
  </StrictMode>,
);
