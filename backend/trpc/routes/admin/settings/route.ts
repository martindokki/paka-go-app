import { z } from 'zod';
import { protectedProcedure } from '@/backend/trpc/create-context';

const settingsSchema = z.object({
  baseFare: z.number().min(0),
  perKmRate: z.number().min(0),
  minimumCharge: z.number().min(0),
  fragileItemSurcharge: z.number().min(0),
  insuranceSurcharge: z.number().min(0),
  afterHoursSurcharge: z.number().min(0),
  weekendSurcharge: z.number().min(0),
  waitTimeRate: z.number().min(0),
  commissionRate: z.number().min(0).max(100),
  maintenanceMode: z.boolean(),
});

export const getSettingsProcedure = protectedProcedure
  .query(async () => {
    // Mock data - replace with actual database queries
    const settings = {
      baseFare: 80,
      perKmRate: 11,
      minimumCharge: 150,
      fragileItemSurcharge: 20,
      insuranceSurcharge: 20,
      afterHoursSurcharge: 10,
      weekendSurcharge: 10,
      waitTimeRate: 5,
      commissionRate: 15,
      maintenanceMode: false,
    };

    return {
      success: true,
      data: settings,
    };
  });

export const updateSettingsProcedure = protectedProcedure
  .input(settingsSchema.partial())
  .mutation(async ({ input }: { input: Partial<{ baseFare: number; perKmRate: number; minimumCharge: number; fragileItemSurcharge: number; insuranceSurcharge: number; afterHoursSurcharge: number; weekendSurcharge: number; waitTimeRate: number; commissionRate: number; maintenanceMode: boolean }> }) => {
    // Mock implementation - replace with actual database update
    console.log('Updating settings:', input);
    
    return {
      success: true,
      message: 'Settings updated successfully',
      data: input,
    };
  });