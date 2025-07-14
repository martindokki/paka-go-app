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
  
  // For web development
  if (typeof window !== 'undefined') {
    // Use the current origin for web
    return window.location.origin;
  }
  
  // For mobile development - use the Expo dev server URL
  if (Platform.OS !== 'web') {
    // This will be the Expo dev server URL
    return 'http://localhost:8081';
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
          
          // Add timeout to prevent hanging - shorter timeout for faster feedback
          const timeoutDuration = Platform.OS === 'web' ? 10000 : 15000;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
          
          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
              ...options?.headers,
            },
          });
          
          clearTimeout(timeoutId);
          
          // Check if response is HTML (likely an error page)
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('text/html')) {
            console.warn('Server returned HTML instead of JSON. Backend may not be available.');
            const text = await response.text();
            console.log('HTML response preview:', text.substring(0, 200));
            throw new Error('Backend not available. The API server may not be running or the URL may be incorrect.');
          }
          
          if (!response.ok) {
            console.error('tRPC response not ok:', response.status, response.statusText);
            const text = await response.text();
            console.error('Error response body:', text);
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          return response;
        } catch (error: unknown) {
          if (error instanceof Error && error.name === 'AbortError') {
            console.error('tRPC request timed out');
            throw new Error('Request timed out. Please check your connection and try again.');
          }
          console.error('tRPC fetch error:', error);
          throw error instanceof Error ? error : new Error('Unknown error occurred');
        }
      },
    }),
  ],
});

// Health check function
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for health check
    
    console.log('Checking backend health at:', `${getBaseUrl()}/api/`);
    
    const response = await fetch(`${getBaseUrl()}/api/`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    
    console.log('Health check response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Health check response data:', data);
      return data.status === 'ok';
    }
    
    return false;
  } catch (error: unknown) {
    console.warn('Backend health check failed:', error);
    return false;
  }
}

// Test tRPC connection
export async function testTrpcConnection() {
  try {
    console.log('Testing tRPC connection...');
    const result = await trpcClient.example.hi.query();
    console.log('tRPC test result:', result);
    return { success: true, data: result };
  } catch (error) {
    console.error('tRPC test failed:', error);
    return { success: false, error };
  }
}