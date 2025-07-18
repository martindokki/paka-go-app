import { createTRPCReact } from "@trpc/react-query";
import { httpLink, TRPCClientError } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { Platform } from 'react-native';

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  // Check for environment variable first
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    console.log('Using EXPO_PUBLIC_RORK_API_BASE_URL:', process.env.EXPO_PUBLIC_RORK_API_BASE_URL);
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }
  
  // For web development
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    console.log('Using window.location.origin:', origin);
    return origin;
  }
  
  // For mobile development - try different localhost variations
  if (Platform.OS !== 'web') {
    // Try to get the dev server URL from Expo constants
    const devServerUrl = 'http://localhost:8081';
    console.log('Using mobile localhost for Platform.OS:', Platform.OS, 'URL:', devServerUrl);
    return devServerUrl;
  }
  
  console.log('Fallback to localhost:8081');
  return 'http://localhost:8081';
};

// Add a simple function to test if backend is reachable
export async function testBackendConnection(): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    const baseUrl = getBaseUrl();
    console.log('Testing backend connection to:', baseUrl);
    
    // First test if we can reach the base URL at all
    const response = await fetch(`${baseUrl}/api/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return {
        success: false,
        message: `Backend returned ${response.status}: ${response.statusText}`,
        details: { status: response.status, statusText: response.statusText }
      };
    }
    
    const data = await response.json();
    return {
      success: true,
      message: 'Backend is reachable',
      details: data
    };
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown connection error',
      details: { error: error instanceof Error ? error.message : String(error) }
    };
  }
}

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      fetch: async (url, options) => {
        try {
          const baseUrl = getBaseUrl();
          console.log('tRPC request to:', url);
          console.log('Base URL:', baseUrl);
          console.log('Request options:', {
            method: options?.method || 'GET',
            headers: options?.headers,
            body: options?.body ? 'Present' : 'None'
          });
          
          // Add timeout to prevent hanging
          const timeoutDuration = Platform.OS === 'web' ? 8000 : 12000;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);
          
          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              ...options?.headers,
            },
          });
          
          clearTimeout(timeoutId);
          
          console.log('Response status:', response.status);
          console.log('Response headers:', Object.fromEntries(response.headers.entries()));
          
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
            let errorText = '';
            try {
              errorText = await response.text();
              console.error('Error response body:', errorText);
            } catch (e) {
              console.error('Could not read error response body');
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
          }
          
          return response;
        } catch (error: unknown) {
          if (error instanceof Error && error.name === 'AbortError') {
            console.error('tRPC request timed out');
            throw new Error('Request timed out. Please check your connection and try again.');
          }
          
          // Handle network errors more gracefully
          if (error instanceof Error) {
            if (error.message.includes('fetch')) {
              console.error('Network error:', error.message);
              throw new Error('Network error. Please check your internet connection and ensure the backend server is running.');
            }
            if (error.message.includes('ECONNREFUSED') || error.message.includes('Failed to fetch')) {
              console.error('Connection refused:', error.message);
              throw new Error('Backend not available. The API server may not be running or the URL may be incorrect.');
            }
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
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Simple ping test
export async function pingBackend(): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const baseUrl = getBaseUrl();
    console.log('Pinging backend at:', `${baseUrl}/api/ping`);
    
    const response = await fetch(`${baseUrl}/api/ping`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Ping successful:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Ping failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}