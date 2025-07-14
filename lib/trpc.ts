import { createTRPCReact } from "@trpc/react-query";
import { httpLink, TRPCClientError } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { Platform } from 'react-native';

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }
  
  // Fallback for development
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  return 'http://localhost:8081';
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      fetch: async (url, options) => {
        try {
          console.log('tRPC request to:', url);
          
          // Add timeout to prevent hanging - shorter for web
          const timeoutDuration = Platform.OS === 'web' ? 5000 : 10000;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
          
          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          // Check if response is HTML (likely an error page)
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('text/html')) {
            console.warn('Server returned HTML instead of JSON. Backend may not be available.');
            throw new Error('Server returned HTML instead of JSON. Check if the API server is running.');
          }
          
          if (!response.ok) {
            console.error('tRPC response not ok:', response.status, response.statusText);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          return response;
        } catch (error) {
          if (error.name === 'AbortError') {
            console.error('tRPC request timed out');
            throw new Error('Request timed out. Please check your connection.');
          }
          console.error('tRPC fetch error:', error);
          throw error;
        }
      },
    }),
  ],
});

// Health check function
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout for health check
    
    const response = await fetch(`${getBaseUrl()}/api/`, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      return data.status === 'ok';
    }
    
    return false;
  } catch (error) {
    console.warn('Backend health check failed:', error);
    return false;
  }
}