import { z } from "zod";
import { publicProcedure } from "../../../create-context";
// Temporarily disable auth service import until it's properly implemented
// import { AuthService } from "../../../services/auth-service";

export const registerProcedure = publicProcedure
  .input(z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().regex(/^\+254[0-9]{9}$/),
    password: z.string().min(6),
    userType: z.enum(['client', 'driver', 'admin'])
  }))
  .mutation(async ({ input }) => {
    // Mock registration for now
    const result = {
      success: true,
      user: { id: '1', email: input.email, name: input.name, phone: input.phone, role: input.userType },
      token: 'mock-jwt-token'
    };
    
    if (!result.success) {
      throw new Error(result.error || 'Registration failed');
    }
    
    return result;
  });