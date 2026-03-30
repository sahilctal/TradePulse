import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { PortfolioState } from '../domain/trading/types';
import {
  loadPortfolioState,
  savePortfolioState,
} from '../domain/trading/portfolioStorage';

type PortfolioContextValue = {
  readonly portfolio: PortfolioState;
  readonly setPortfolio: React.Dispatch<React.SetStateAction<PortfolioState>>;
};

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [portfolio, setPortfolio] = useState<PortfolioState>(loadPortfolioState);

  useEffect(() => {
    savePortfolioState(portfolio);
  }, [portfolio]);

  const value = useMemo(
    () => ({ portfolio, setPortfolio }),
    [portfolio, setPortfolio],
  );

  return (
    <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>
  );
}

export function usePortfolio(): PortfolioContextValue {
  const ctx = useContext(PortfolioContext);
  if (ctx === null) {
    throw new Error('usePortfolio must be used within PortfolioProvider');
  }
  return ctx;
}
