import { z } from "zod";
import { publicProcedure } from "../../create-context";

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

export default publicProcedure
  .input(z.object({
    email: z.string().email(),
    password: z.string().min(6),
    userType: z.enum(['client', 'driver', 'admin'])
  }))
  .mutation(async ({ input }) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = MOCK_USERS.find(
      u => u.email === input.email && 
           u.password === input.password &&
           u.userType === input.userType
    );

    if (!user) {
      throw new Error('Invalid email, password, or user type');
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
  });