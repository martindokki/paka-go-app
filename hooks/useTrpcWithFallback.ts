import { useState, useEffect } from 'react';
import { trpc, checkBackendHealth } from '@/lib/trpc';

export function useTrpcWithFallback() {
  const [isBackendAvailable, setIsBackendAvailable] = useState<boolean | null>(null);
  const [lastCheck, setLastCheck] = useState<number>(0);
  const [isChecking, setIsChecking] = useState(false);

  const checkBackend = async () => {
    if (isChecking) return isBackendAvailable;
    
    setIsChecking(true);
    try {
      console.log('Checking backend health...');
      const isHealthy = await checkBackendHealth();
      console.log('Backend health check result:', isHealthy);
      setIsBackendAvailable(isHealthy);
      setLastCheck(Date.now());
      return isHealthy;
    } catch (error) {
      console.warn('Backend health check failed:', error);
      setIsBackendAvailable(false);
      setLastCheck(Date.now());
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Check backend health on mount
    checkBackend();
    
    // Set up periodic health checks every 60 seconds
    const interval = setInterval(() => {
      // Only check if it's been more than 60 seconds since last check
      if (Date.now() - lastCheck > 60000) {
        checkBackend();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [lastCheck]);

  return {
    isBackendAvailable,
    isChecking,
    checkBackend,
    trpc: isBackendAvailable ? trpc : null,
  };
}