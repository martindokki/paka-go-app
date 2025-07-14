import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { OrdersService } from "../../../services/orders-service";

export const createOrderProcedure = publicProcedure
  .input(z.object({
    customerId: z.string(),
    pickupAddress: z.string().min(5),
    pickupLatitude: z.number().optional(),
    pickupLongitude: z.number().optional(),
    deliveryAddress: z.string().min(5),
    deliveryLatitude: z.number().optional(),
    deliveryLongitude: z.number().optional(),
    recipientName: z.string().min(2),
    recipientPhone: z.string().regex(/^\+254[0-9]{9}$/),
    packageType: z.enum(['documents', 'small', 'medium', 'electronics', 'clothing', 'food', 'fragile']),
    packageDescription: z.string().optional(),
    packageWeight: z.number().positive().optional(),
    packageValue: z.number().positive().optional(),
    specialInstructions: z.string().optional(),
    priority: z.enum(['normal', 'urgent', 'express']).default('normal'),
    paymentMethod: z.enum(['mpesa', 'card', 'cash']),
    paymentTerm: z.enum(['pay_now', 'pay_on_delivery']),
    estimatedDistance: z.number().positive().optional(),
    estimatedDuration: z.number().positive().optional(),
    scheduledPickupTime: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    const result = await OrdersService.createOrder(input);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create order');
    }
    
    return result;
  });