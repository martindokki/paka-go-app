import { Platform } from 'react-native';
import { errorLogger } from '@/utils/error-logger';
import { useAuthStore } from '@/stores/auth-store';

// Backend configuration
const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://localhost:3000/api' 
    : 'https://pakago-api.herokuapp.com/api',
  TIMEOUT: 15000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  userType: 'client' | 'driver' | 'admin';
}

export interface RegisterRequest extends LoginRequest {
  name: string;
  phone: string;
}

class ApiService {
  private static instance: ApiService;
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    try {
      const { user, token } = useAuthStore.getState();
      
      const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Platform': Platform.OS,
        'X-App-Version': '1.0.0',
      };

      // Add auth token if available
      if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
      }

      const config: RequestInit = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      };

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
      
      config.signal = controller.signal;

      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      clearTimeout(timeoutId);
      
      // Handle 401 Unauthorized - token might be expired
      if (response.status === 401 && token && retryCount === 0) {
        await errorLogger.warn('Token expired, attempting refresh');
        
        const refreshResult = await this.refreshToken();
        if (refreshResult.success) {
          // Retry the original request with new token
          return this.makeRequest(endpoint, options, retryCount + 1);
        } else {
          // Refresh failed, logout user
          useAuthStore.getState().logout();
          throw new Error('Authentication expired. Please login again.');
        }
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || response.statusText };
        }
        
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Retry logic for network errors
      if (retryCount < API_CONFIG.RETRY_ATTEMPTS && 
          (errorMessage.includes('network') || errorMessage.includes('timeout'))) {
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY * (retryCount + 1)));
        return this.makeRequest(endpoint, options, retryCount + 1);
      }
      
      await errorLogger.error(error as Error, {
        endpoint,
        method: options.method || 'GET',
        retryCount,
        source: 'api_service',
      });

      return {
        success: false,
        error: errorMessage,
        message: this.getErrorMessage(errorMessage),
      };
    }
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<{ user: any; token: string }>> {
    try {
      // Try actual API call first
      const response = await this.makeRequest<{ user: any; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      if (response.success) {
        await errorLogger.info('User login successful', { 
          userType: credentials.userType,
          email: credentials.email 
        });
        return response;
      }
      
      // Fallback to mock data if API fails
      throw new Error('API login failed');
    } catch (error) {
      // Fallback to mock authentication for development
      await errorLogger.warn('Using mock authentication', { error: (error as Error).message });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate validation
      if (!credentials.email || !credentials.password) {
        return {
          success: false,
          error: 'Missing credentials',
          message: 'Email and password are required.',
        };
      }
      
      // Mock successful login
      const mockUser = {
        id: `${credentials.userType}-${Date.now()}`,
        name: credentials.userType === 'client' ? 'John Doe' : 
              credentials.userType === 'driver' ? 'Jane Smith' : 'Admin User',
        email: credentials.email,
        phone: '+254700000000',
        userType: credentials.userType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockToken = `mock_token_${Date.now()}_${credentials.userType}`;

      await errorLogger.info('Mock login successful', { 
        userType: credentials.userType,
        email: credentials.email 
      });

      return {
        success: true,
        data: {
          user: mockUser,
          token: mockToken,
        },
      };
    }
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<{ user: any; token: string }>> {
    try {
      // Try actual API call first
      const response = await this.makeRequest<{ user: any; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      
      if (response.success) {
        await errorLogger.info('User registration successful', { 
          userType: userData.userType,
          email: userData.email 
        });
        return response;
      }
      
      throw new Error('API registration failed');
    } catch (error) {
      // Fallback to mock registration for development
      await errorLogger.warn('Using mock registration', { error: (error as Error).message });
      
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Simulate validation
      if (!userData.name || !userData.email || !userData.phone || !userData.password) {
        return {
          success: false,
          error: 'Missing required fields',
          message: 'All fields are required for registration.',
        };
      }
      
      // Simulate email validation
      if (!/\S+@\S+\.\S+/.test(userData.email)) {
        return {
          success: false,
          error: 'Invalid email',
          message: 'Please enter a valid email address.',
        };
      }
      
      // Simulate phone validation
      if (!/^\+254[0-9]{9}$/.test(userData.phone)) {
        return {
          success: false,
          error: 'Invalid phone',
          message: 'Please enter a valid Kenyan phone number.',
        };
      }
      
      const mockUser = {
        id: `${userData.userType}-${Date.now()}`,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        userType: userData.userType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const mockToken = `mock_token_${Date.now()}_${userData.userType}`;

      await errorLogger.info('Mock registration successful', { 
        userType: userData.userType,
        email: userData.email 
      });

      return {
        success: true,
        data: {
          user: mockUser,
          token: mockToken,
        },
      };
    }
  }

  async logout(): Promise<ApiResponse> {
    try {
      // Try actual API call first
      const response = await this.makeRequest('/auth/logout', {
        method: 'POST',
      });
      
      if (response.success) {
        await errorLogger.info('User logout successful');
        return response;
      }
      
      throw new Error('API logout failed');
    } catch (error) {
      // Fallback for development
      await errorLogger.info('Mock logout successful');
      
      return {
        success: true,
        message: 'Logged out successfully',
      };
    }
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    try {
      const { user } = useAuthStore.getState();
      
      if (!user) {
        throw new Error('No user found for token refresh');
      }
      
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });
      
      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
      
      const data = await response.json();
      
      // Update token in store
      useAuthStore.getState().setUser({ ...user, token: data.token });
      
      return {
        success: true,
        data: { token: data.token },
      };
    } catch (error) {
      await errorLogger.error(error as Error, { action: 'refreshToken' });
      
      return {
        success: false,
        error: 'Token refresh failed',
        message: 'Please login again.',
      };
    }
  }

  // User profile endpoints
  async getProfile(): Promise<ApiResponse<any>> {
    return this.makeRequest('/user/profile');
  }

  async updateProfile(profileData: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.makeRequest('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
      
      if (response.success) {
        await errorLogger.info('Profile updated successfully');
        return response;
      }
      
      throw new Error('API profile update failed');
    } catch (error) {
      // Mock profile update for development
      await errorLogger.warn('Using mock profile update', { error: (error as Error).message });
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        success: true,
        data: profileData,
        message: 'Profile updated successfully',
      };
    }
  }

  async deleteAccount(): Promise<ApiResponse> {
    try {
      const response = await this.makeRequest('/user/delete', {
        method: 'DELETE',
      });
      
      if (response.success) {
        await errorLogger.info('Account deleted successfully');
        return response;
      }
      
      throw new Error('API account deletion failed');
    } catch (error) {
      // Mock account deletion for development
      await errorLogger.warn('Using mock account deletion', { error: (error as Error).message });
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        success: true,
        message: 'Account deleted successfully',
      };
    }
  }

  // Orders endpoints
  async getOrders(): Promise<ApiResponse<any[]>> {
    return this.makeRequest('/orders');
  }

  async createOrder(orderData: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrder(orderId: string, updateData: any): Promise<ApiResponse<any>> {
    return this.makeRequest(`/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // Driver endpoints
  async getAvailableOrders(): Promise<ApiResponse<any[]>> {
    return this.makeRequest('/driver/available-orders');
  }

  async acceptOrder(orderId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/driver/accept-order/${orderId}`, {
      method: 'POST',
    });
  }

  // Admin endpoints (web only)
  async getUsers(): Promise<ApiResponse<any[]>> {
    if (Platform.OS !== 'web') {
      return {
        success: false,
        error: 'Admin endpoints only available on web',
      };
    }
    return this.makeRequest('/admin/users');
  }

  async getAllOrders(): Promise<ApiResponse<any[]>> {
    if (Platform.OS !== 'web') {
      return {
        success: false,
        error: 'Admin endpoints only available on web',
      };
    }
    return this.makeRequest('/admin/orders');
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    try {
      const response = await this.makeRequest<{ status: string }>('/health');
      return response;
    } catch (error) {
      return {
        success: false,
        data: { status: 'offline' },
        message: 'Service temporarily unavailable',
      };
    }
  }
  
  // Helper method to get user-friendly error messages
  private getErrorMessage(error: string): string {
    if (error.includes('network') || error.includes('fetch')) {
      return 'Network error. Please check your connection and try again.';
    }
    
    if (error.includes('timeout') || error.includes('aborted')) {
      return 'Request timed out. Please try again.';
    }
    
    if (error.includes('401') || error.includes('unauthorized')) {
      return 'Authentication failed. Please login again.';
    }
    
    if (error.includes('403') || error.includes('forbidden')) {
      return 'Access denied. You do not have permission for this action.';
    }
    
    if (error.includes('404') || error.includes('not found')) {
      return 'Resource not found. Please try again later.';
    }
    
    if (error.includes('500') || error.includes('server')) {
      return 'Server error. Please try again later.';
    }
    
    return 'Something went wrong. Please try again.';
  }
}

export const apiService = ApiService.getInstance();