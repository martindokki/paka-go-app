import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { AuthService } from "../../../services/auth-service";

export const getProfileProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
  }))
  .query(async ({ input }) => {
    const result = await AuthService.getUserById(input.userId);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to get profile');
    }
    
    return result;
  });

export const updateProfileProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
    name: z.string().min(2).optional(),
    phone: z.string().regex(/^\+254[0-9]{9}$/).optional(),
    profileImage: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    const { userId, ...updates } = input;
    const result = await AuthService.updateProfile(userId, updates);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update profile');
    }
    
    return result;
  });

export const changePasswordProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6),
  }))
  .mutation(async ({ input }) => {
    const result = await AuthService.changePassword(
      input.userId,
      input.currentPassword,
      input.newPassword
    );
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to change password');
    }
    
    return result;
  });

export const deleteAccountProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
  }))
  .mutation(async ({ input }) => {
    const result = await AuthService.deleteAccount(input.userId);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete account');
    }
    
    return result;
  });