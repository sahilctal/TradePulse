import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { MockPriceEngine } from '../engine';

const EngineContext = createContext<MockPriceEngine | null>(null);

export function EngineProvider({ children }: { children: ReactNode }) {
  const engineRef = useRef<MockPriceEngine | null>(null);
  if (engineRef.current === null) {
    engineRef.current = new MockPriceEngine();
  }
  const engine = engineRef.current;

  useEffect(() => {
    engine.start();
    return () => {
      engine.stop();
    };
  }, [engine]);

  const value = useMemo(() => engine, [engine]);

  return (
    <EngineContext.Provider value={value}>{children}</EngineContext.Provider>
  );
}

export function usePriceEngine(): MockPriceEngine {
  const ctx = useContext(EngineContext);
  if (ctx === null) {
    throw new Error('usePriceEngine must be used within EngineProvider');
  }
  return ctx;
}
