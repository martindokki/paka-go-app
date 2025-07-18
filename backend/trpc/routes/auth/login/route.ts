import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { AuthService } from "../../../../services/auth-service";

export const loginProcedure = publicProcedure
  .input(z.object({
    email: z.string().email(),
    password: z.string().min(6),
    userType: z.enum(['client', 'driver', 'admin'])
  }))
  .mutation(async ({ input }) => {
    const result = await AuthService.login(
      input.email,
      input.password,
      input.userType
    );
    
    if (!result.success) {
      throw new Error(result.error || 'Login failed');
    }
    
    return {
      success: true,
      data: result.data
    };
  });