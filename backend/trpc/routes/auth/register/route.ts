import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { AuthService } from "../../../services/auth-service";

export const registerProcedure = publicProcedure
  .input(z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().regex(/^\+254[0-9]{9}$/),
    password: z.string().min(6),
    userType: z.enum(['client', 'driver', 'admin'])
  }))
  .mutation(async ({ input }) => {
    const result = await AuthService.register(input);
    
    if (!result.success) {
      throw new Error(result.error || 'Registration failed');
    }
    
    return result;
  });