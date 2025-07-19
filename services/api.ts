import { Platform } from 'react-native';
import { errorLogger } from '@/utils/error-logger';

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

// Mock users for testing
const MOCK_USERS = [
  {
    id: '1',
    name: 'John Client',
    email: 'client@test.com',
    phone: '+254712345678',
    userType: 'client' as const,
    password: 'password123',
  },
  {
    id: '2',
    name: 'Jane Driver',
    email: 'driver@test.com',
    phone: '+254712345679',
    userType: 'driver' as const,
    password: 'password123',
  },
  {
    id: '3',
    name: 'Admin User',
    email: 'admin@test.com',
    phone: '+254712345680',
    userType: 'admin' as const,
    password: 'password123',
  },
];

class ApiService {
  private static instance: ApiService;
  private mockDelay = 1000; // Simulate network delay

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async simulateNetworkDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, this.mockDelay));
  }

  // Mock login method
  async login(credentials: LoginRequest): Promise<ApiResponse<{ user: any; token: string }>> {
    await this.simulateNetworkDelay();
    
    try {
      const user = MOCK_USERS.find(
        u => u.email === credentials.email && 
             u.password === credentials.password &&
             u.userType === credentials.userType
      );

      if (!user) {
        return {
          success: false,
          error: 'Invalid email, password, or user type',
        };
      }

      const { password, ...userWithoutPassword } = user;
      const token = `mock_token_${user.id}_${Date.now()}`;

      return {
        success: true,
        data: {
          user: userWithoutPassword,
          token,
        },
      };
    } catch (error) {
      await errorLogger.error(error as Error, { action: 'mock_login' });
      return {
        success: false,
        error: 'Login failed. Please try again.',
      };
    }
  }

  // Mock register method
  async register(userData: RegisterRequest): Promise<ApiResponse<{ user: any; token: string }>> {
    await this.simulateNetworkDelay();
    
    try {
      // Check if user already exists with same email and user type
      const existingUserSameType = MOCK_USERS.find(u => u.email === userData.email && u.userType === userData.userType);
      if (existingUserSameType) {
        return {
          success: false,
          error: `A ${userData.userType} account with this email already exists. Please use a different email or try logging in.`,
        };
      }
      
      // Check if user exists with same email but different user type
      const existingUserDifferentType = MOCK_USERS.find(u => u.email === userData.email && u.userType !== userData.userType);
      if (existingUserDifferentType) {
        return {
          success: false,
          error: `This email is already registered as a ${existingUserDifferentType.userType}. Please use a different email or sign in with the correct account type.`,
        };
      }

      // Create new user
      const newUser = {
        id: (MOCK_USERS.length + 1).toString(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        userType: userData.userType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add to mock users (in real app, this would be saved to database)
      MOCK_USERS.push({ ...newUser, password: userData.password });

      const token = `mock_token_${newUser.id}_${Date.now()}`;

      return {
        success: true,
        data: {
          user: newUser,
          token,
        },
      };
    } catch (error) {
      await errorLogger.error(error as Error, { action: 'mock_register' });
      return {
        success: false,
        error: 'Registration failed. Please try again.',
      };
    }
  }

  // Mock logout method
  async logout(): Promise<ApiResponse<{ status: string }>> {
    await this.simulateNetworkDelay();
    
    return {
      success: true,
      data: { status: 'logged_out' },
    };
  }

  // Mock profile update method
  async updateProfile(profileData: any): Promise<ApiResponse<any>> {
    await this.simulateNetworkDelay();
    
    try {
      // In a real app, this would update the user in the database
      return {
        success: true,
        data: profileData,
      };
    } catch (error) {
      await errorLogger.error(error as Error, { action: 'mock_update_profile' });
      return {
        success: false,
        error: 'Profile update failed. Please try again.',
      };
    }
  }

  // Mock delete account method
  async deleteAccount(): Promise<ApiResponse<{ status: string }>> {
    await this.simulateNetworkDelay();
    
    try {
      // In a real app, this would delete the user from the database
      return {
        success: true,
        data: { status: 'account_deleted' },
      };
    } catch (error) {
      await errorLogger.error(error as Error, { action: 'mock_delete_account' });
      return {
        success: false,
        error: 'Account deletion failed. Please try again.',
      };
    }
  }
}

export const apiService = ApiService.getInstance();