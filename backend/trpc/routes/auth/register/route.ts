import { z } from "zod";
import { publicProcedure } from "../../create-context.js";

// Mock users storage (in real app, this would be a database)
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

export const registerProcedure = publicProcedure
  .input(z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().regex(/^\+254[0-9]{9}$/),
    password: z.string().min(6),
    userType: z.enum(['client', 'driver', 'admin'])
  }))
  .mutation(async ({ input }: { input: { name: string; email: string; phone: string; password: string; userType: 'client' | 'driver' | 'admin' } }) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists with same email and user type
    const existingUserSameType = MOCK_USERS.find(u => u.email === input.email && u.userType === input.userType);
    if (existingUserSameType) {
      throw new Error(`A ${input.userType} account with this email already exists. Please use a different email or try logging in.`);
    }
    
    // Check if user exists with same email but different user type
    const existingUserDifferentType = MOCK_USERS.find(u => u.email === input.email && u.userType !== input.userType);
    if (existingUserDifferentType) {
      throw new Error(`This email is already registered as a ${existingUserDifferentType.userType}. Please use a different email or sign in with the correct account type.`);
    }

    // Create new user
    const newUser = {
      id: (MOCK_USERS.length + 1).toString(),
      name: input.name,
      email: input.email,
      phone: input.phone,
      userType: input.userType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add to mock users (in real app, this would be saved to database)
    MOCK_USERS.push({ ...newUser, password: input.password });

    const token = `mock_token_${newUser.id}_${Date.now()}`;

    return {
      success: true,
      data: {
        user: newUser,
        token,
      },
    };
  });