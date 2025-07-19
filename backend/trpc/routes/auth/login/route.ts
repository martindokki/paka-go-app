import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { AuthService } from "../../../../services/auth-service";

export const loginProcedure = publicProcedure
  .input(z.object({
    email: z.string().email(),
    password: z.string().min(6),
    userType: z.enum(['client', 'driver', 'admin']).optional()
  }))
  .mutation(async ({ input }) => {
    const result = await AuthService.signIn(
      input.email,
      input.password
    );
    
    if (result.error || !result.user) {
      throw new Error(result.error?.message || 'Login failed');
    }
    
    return {
      success: true,
      data: {
        user: result.user
      }
    };
  });