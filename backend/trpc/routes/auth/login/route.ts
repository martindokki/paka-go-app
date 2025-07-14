import { z } from "zod";
import { publicProcedure } from "../../../create-context";
// Temporarily disable auth service import until it's properly implemented
// import { AuthService } from "../../../services/auth-service";

export const loginProcedure = publicProcedure
  .input(z.object({
    email: z.string().email(),
    password: z.string().min(6),
    userType: z.enum(['client', 'driver', 'admin'])
  }))
  .mutation(async ({ input }) => {
    // Mock login for now
    const result = {
      success: true,
      user: { id: '1', email: input.email, name: 'Test User', role: input.userType },
      token: 'mock-jwt-token'
    };
    
    if (!result.success) {
      throw new Error('Login failed');
    }
    
    return result;
  });