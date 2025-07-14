import { useContext, createContext } from 'react';

interface TrpcContextType {
  isAvailable: boolean;
}

export const TrpcContext = createContext<TrpcContextType>({ isAvailable: true });

export const useTrpcWithFallback = () => {
  const context = useContext(TrpcContext);
  return context;
};