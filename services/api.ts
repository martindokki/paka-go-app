import { Platform } from 'react-native';
import { errorLogger } from '@/utils/error-logger';
import { useAuthStore } from '@/stores/auth-store';

// Backend configuration
const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? 'http://localhost:3000/api' 
    : 'https://your-production-api.com/api',
  TIMEOUT: 10000,
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
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const { user } = useAuthStore.getState();
      
      const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // Add auth token if user is logged in
      if (user) {
        defaultHeaders['Authorization'] = `Bearer ${user.id}`; // Replace with actual token
      }

      const config: RequestInit = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        timeout: API_CONFIG.TIMEOUT,
      };

      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await errorLogger.error(error as Error, {
        endpoint,
        method: options.method || 'GET',
        source: 'api_service',
      });

      return {
        success: false,
        error: errorMessage,
        message: 'Request failed. Please try again.',
      };
    }
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<{ user: any; token: string }>> {
    // For now, simulate API call with mock data
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Mock successful login
      const mockUser = {
        id: `${credentials.userType}-${Date.now()}`,
        name: credentials.userType === 'client' ? 'John Doe' : 
              credentials.userType === 'driver' ? 'Jane Smith' : 'Admin User',
        email: credentials.email,
        phone: '+254700000000',
        userType: credentials.userType,
      };

      const mockToken = `mock_token_${Date.now()}`;

      await errorLogger.info('User login successful', { 
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
    } catch (error) {
      return {
        success: false,
        error: 'Login failed',
        message: 'Invalid credentials. Please try again.',
      };
    }

    // TODO: Replace with actual API call
    // return this.makeRequest<{ user: any; token: string }>('/auth/login', {
    //   method: 'POST',
    //   body: JSON.stringify(credentials),
    // });
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<{ user: any; token: string }>> {
    // For now, simulate API call with mock data
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    try {
      const mockUser = {
        id: `${userData.userType}-${Date.now()}`,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        userType: userData.userType,
      };

      const mockToken = `mock_token_${Date.now()}`;

      await errorLogger.info('User registration successful', { 
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
    } catch (error) {
      return {
        success: false,
        error: 'Registration failed',
        message: 'Unable to create account. Please try again.',
      };
    }

    // TODO: Replace with actual API call
    // return this.makeRequest<{ user: any; token: string }>('/auth/register', {
    //   method: 'POST',
    //   body: JSON.stringify(userData),
    // });
  }

  async logout(): Promise<ApiResponse> {
    try {
      await errorLogger.info('User logout');
      
      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Logout failed',
      };
    }

    // TODO: Replace with actual API call
    // return this.makeRequest('/auth/logout', {
    //   method: 'POST',
    // });
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    // TODO: Implement token refresh
    return {
      success: false,
      error: 'Token refresh not implemented',
    };
  }

  // User profile endpoints
  async getProfile(): Promise<ApiResponse<any>> {
    return this.makeRequest('/user/profile');
  }

  async updateProfile(profileData: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async deleteAccount(): Promise<ApiResponse> {
    return this.makeRequest('/user/delete', {
      method: 'DELETE',
    });
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
    return this.makeRequest('/health');
  }
}

export const apiService = ApiService.getInstance();