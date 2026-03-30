import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { PortfolioState } from '../domain/trading/types';
import { LimitOrderEngine } from '../domain/limitOrders/limitOrderEngine';
import type { PlaceLimitOrderInput } from '../domain/limitOrders/limitOrderEngine';
import type { LimitOrder } from '../domain/limitOrders/types';
import { usePriceEngine } from './EngineProvider';
import { usePortfolio } from './PortfolioProvider';

type LimitOrderContextValue = {
  readonly pendingOrders: readonly LimitOrder[];
  readonly placeLimitOrder: (input: PlaceLimitOrderInput) => string;
  readonly cancelLimitOrder: (id: string) => boolean;
};

const LimitOrderContext = createContext<LimitOrderContextValue | null>(null);

/**
 * Owns one {@link LimitOrderEngine} wired to the mock price feed and portfolio.
 * Pending orders persist via `tradepulse-limit-orders`; fills update portfolio + `tradepulse-portfolio`.
 */
export function LimitOrderProvider({ children }: { children: ReactNode }) {
  const priceEngine = usePriceEngine();
  const { portfolio, setPortfolio } = usePortfolio();
  const portfolioRef = useRef(portfolio);
  portfolioRef.current = portfolio;

  const [orderBookVersion, setOrderBookVersion] = useState(0);
  const bumpOrderBook = useCallback(() => {
    setOrderBookVersion((v) => v + 1);
  }, []);

  const engineRef = useRef<LimitOrderEngine | null>(null);
  if (engineRef.current === null) {
    engineRef.current = new LimitOrderEngine(priceEngine, {
      getPortfolio: () => portfolioRef.current,
      setPortfolio: (next: PortfolioState) => {
        portfolioRef.current = next;
        setPortfolio(next);
        bumpOrderBook();
      },
    });
  }

  useEffect(() => {
    const eng = engineRef.current;
    if (eng === null) {
      return;
    }
    eng.start();
    return () => {
      eng.stop();
    };
  }, []);

  const placeLimitOrder = useCallback(
    (input: PlaceLimitOrderInput) => {
      const id = engineRef.current!.placeLimitOrder(input);
      bumpOrderBook();
      return id;
    },
    [bumpOrderBook],
  );

  const cancelLimitOrder = useCallback(
    (id: string) => {
      const ok = engineRef.current!.cancelLimitOrder(id);
      if (ok) {
        bumpOrderBook();
      }
      return ok;
    },
    [bumpOrderBook],
  );

  const pendingOrders = useMemo(() => {
    return engineRef.current?.getPendingOrders() ?? [];
  }, [orderBookVersion]);

  const value = useMemo(
    () => ({ pendingOrders, placeLimitOrder, cancelLimitOrder }),
    [pendingOrders, placeLimitOrder, cancelLimitOrder],
  );

  return (
    <LimitOrderContext.Provider value={value}>
      {children}
    </LimitOrderContext.Provider>
  );
}

export function useLimitOrders(): LimitOrderContextValue {
  const ctx = useContext(LimitOrderContext);
  if (ctx === null) {
    throw new Error('useLimitOrders must be used within LimitOrderProvider');
  }
  return ctx;
}
