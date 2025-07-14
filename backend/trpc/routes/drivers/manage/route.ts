import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { DriversService } from "../../../../services/drivers-service";

export const getAllDriversProcedure = publicProcedure
  .input(z.object({
    limit: z.number().default(50),
    offset: z.number().default(0),
  }))
  .query(async ({ input }) => {
    const result = await DriversService.getAllDrivers(input.limit, input.offset);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to get drivers');
    }
    
    return result;
  });

export const getDriverByIdProcedure = publicProcedure
  .input(z.object({
    driverId: z.string(),
  }))
  .query(async ({ input }) => {
    const result = await DriversService.getDriverById(input.driverId);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to get driver');
    }
    
    return result;
  });

export const getDriverByUserIdProcedure = publicProcedure
  .input(z.object({
    userId: z.string(),
  }))
  .query(async ({ input }) => {
    const result = await DriversService.getDriverByUserId(input.userId);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to get driver');
    }
    
    return result;
  });

export const approveDriverProcedure = publicProcedure
  .input(z.object({
    driverId: z.string(),
    approvedBy: z.string(),
  }))
  .mutation(async ({ input }) => {
    const result = await DriversService.approveDriver(input.driverId, input.approvedBy);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to approve driver');
    }
    
    return result;
  });

export const suspendDriverProcedure = publicProcedure
  .input(z.object({
    driverId: z.string(),
    reason: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    const result = await DriversService.suspendDriver(input.driverId, input.reason);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to suspend driver');
    }
    
    return result;
  });

export const assignVehicleProcedure = publicProcedure
  .input(z.object({
    driverId: z.string(),
    vehicleId: z.string(),
  }))
  .mutation(async ({ input }) => {
    const result = await DriversService.assignVehicle(input.driverId, input.vehicleId);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to assign vehicle');
    }
    
    return result;
  });

export const updateDriverLocationProcedure = publicProcedure
  .input(z.object({
    driverId: z.string(),
    latitude: z.number(),
    longitude: z.number(),
  }))
  .mutation(async ({ input }) => {
    const result = await DriversService.updateLocation(
      input.driverId,
      input.latitude,
      input.longitude
    );
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update location');
    }
    
    return result;
  });

export const setDriverOnlineStatusProcedure = publicProcedure
  .input(z.object({
    driverId: z.string(),
    isOnline: z.boolean(),
  }))
  .mutation(async ({ input }) => {
    const result = await DriversService.setOnlineStatus(input.driverId, input.isOnline);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update online status');
    }
    
    return result;
  });

export const updateDriverProfileProcedure = publicProcedure
  .input(z.object({
    driverId: z.string(),
    licenseNumber: z.string().optional(),
    licenseExpiry: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    const { driverId, ...updates } = input;
    const result = await DriversService.updateProfile(driverId, updates);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update driver profile');
    }
    
    return result;
  });

export const getAvailableDriversProcedure = publicProcedure
  .input(z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    radius: z.number().default(10),
  }))
  .query(async ({ input }) => {
    const result = await DriversService.getAvailableDrivers(
      input.latitude,
      input.longitude,
      input.radius
    );
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to get available drivers');
    }
    
    return result;
  });

export const updateDriverEarningsProcedure = publicProcedure
  .input(z.object({
    driverId: z.string(),
    amount: z.number().positive(),
  }))
  .mutation(async ({ input }) => {
    const result = await DriversService.updateEarnings(input.driverId, input.amount);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update earnings');
    }
    
    return result;
  });

export const updateDriverRatingProcedure = publicProcedure
  .input(z.object({
    driverId: z.string(),
    rating: z.number().min(1).max(5),
  }))
  .mutation(async ({ input }) => {
    const result = await DriversService.updateRating(input.driverId, input.rating);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update rating');
    }
    
    return result;
  });

export const getDriverStatsProcedure = publicProcedure
  .input(z.object({
    driverId: z.string(),
  }))
  .query(async ({ input }) => {
    const result = await DriversService.getDriverStats(input.driverId);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to get driver stats');
    }
    
    return result;
  });