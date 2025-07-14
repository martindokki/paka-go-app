import { z } from "zod";
import { publicProcedure } from "../../../create-context";
// Temporarily disable orders service import until it's properly implemented
// import { OrdersService } from "../../services/orders-service";

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
    try {
      console.log('Creating order with input:', input);
      
      // Mock order creation for now
      const orderId = `order_${Math.random().toString(36).substr(2, 9)}`;
      const trackingCode = Math.random().toString(36).substr(2, 8).toUpperCase();
      
      const order = {
        id: orderId,
        ...input,
        status: 'pending' as const,
        trackingCode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('Order created successfully:', order);
      
      return {
        success: true,
        data: {
          orderId,
          trackingCode,
          order
        },
        message: 'Order created successfully'
      };
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create order');
    }
  });