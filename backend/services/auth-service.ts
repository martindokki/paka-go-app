import { eq, and } from 'drizzle-orm';
import { db, schema } from '../db';
import type { User, NewUser, Driver, NewDriver, Customer, NewCustomer } from '../db/schema';

export class AuthService {
  // User authentication
  static async login(email: string, password: string, userType: 'client' | 'driver' | 'admin') {
    try {
      const user = await db
        .select()
        .from(schema.users)
        .where(
          and(
            eq(schema.users.email, email),
            eq(schema.users.password, password), // In production, compare hashed passwords
            eq(schema.users.userType, userType),
            eq(schema.users.status, 'active')
          )
        )
        .limit(1);

      if (user.length === 0) {
        return { success: false, error: 'Invalid credentials or user type' };
      }

      const userData = user[0];
      const token = `token_${userData.id}_${Date.now()}`;

      // Update last login time
      await db
        .update(schema.users)
        .set({ updatedAt: new Date().toISOString() })
        .where(eq(schema.users.id, userData.id));

      return {
        success: true,
        data: {
          user: {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            userType: userData.userType,
            status: userData.status,
            profileImage: userData.profileImage,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt,
          },
          token,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  }

  // User registration
  static async register(userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    userType: 'client' | 'driver' | 'admin';
  }) {
    try {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, userData.email))
        .limit(1);

      if (existingUser.length > 0) {
        return { success: false, error: 'User with this email already exists' };
      }

      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create user
      const newUser: NewUser = {
        id: userId,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password, // In production, hash this password
        userType: userData.userType,
        status: userData.userType === 'driver' ? 'pending' : 'active',
      };

      await db.insert(schema.users).values(newUser);

      // Create additional records based on user type
      if (userData.userType === 'client') {
        const customerId = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newCustomer: NewCustomer = {
          id: customerId,
          userId: userId,
        };
        await db.insert(schema.customers).values(newCustomer);
      } else if (userData.userType === 'driver') {
        const driverId = `driver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newDriver: NewDriver = {
          id: driverId,
          userId: userId,
        };
        await db.insert(schema.drivers).values(newDriver);
      }

      const token = `token_${userId}_${Date.now()}`;

      return {
        success: true,
        data: {
          user: {
            id: userId,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            userType: userData.userType,
            status: newUser.status,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt,
          },
          token,
        },
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  // Get user by ID
  static async getUserById(userId: string) {
    try {
      const user = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, userId))
        .limit(1);

      if (user.length === 0) {
        return { success: false, error: 'User not found' };
      }

      const userData = user[0];
      return {
        success: true,
        data: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          userType: userData.userType,
          status: userData.status,
          profileImage: userData.profileImage,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
        },
      };
    } catch (error) {
      console.error('Get user error:', error);
      return { success: false, error: 'Failed to get user' };
    }
  }

  // Update user profile
  static async updateProfile(userId: string, updates: Partial<Pick<User, 'name' | 'phone' | 'profileImage'>>) {
    try {
      await db
        .update(schema.users)
        .set({
          ...updates,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.users.id, userId));

      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  }

  // Delete user account
  static async deleteAccount(userId: string) {
    try {
      // Delete user (cascade will handle related records)
      await db
        .delete(schema.users)
        .where(eq(schema.users.id, userId));

      return { success: true };
    } catch (error) {
      console.error('Delete account error:', error);
      return { success: false, error: 'Failed to delete account' };
    }
  }

  // Change password
  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    try {
      // Verify current password
      const user = await db
        .select()
        .from(schema.users)
        .where(
          and(
            eq(schema.users.id, userId),
            eq(schema.users.password, currentPassword) // In production, compare hashed passwords
          )
        )
        .limit(1);

      if (user.length === 0) {
        return { success: false, error: 'Current password is incorrect' };
      }

      // Update password
      await db
        .update(schema.users)
        .set({
          password: newPassword, // In production, hash this password
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.users.id, userId));

      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error: 'Failed to change password' };
    }
  }
}