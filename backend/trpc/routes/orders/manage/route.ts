import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { OrdersService } from "../../../../services/orders-service";

export const getOrdersByCustomerProcedure = publicProcedure
  .input(z.object({
    customerId: z.string(),
    limit: z.number().default(50),
    offset: z.number().default(0),
  }))
  .query(async ({ input }) => {
    const result = await OrdersService.getOrdersByCustomer(input.customerId, input.limit, input.offset);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to get orders');
    }
    
    return {
      success: true,
      orders: result.data || [],
      total: result.data?.length || 0
    };
  });

export const getOrdersByDriverProcedure = publicProcedure
  .input(z.object({
    driverId: z.string(),
    limit: z.number().default(50),
    offset: z.number().default(0),
  }))
  .query(async ({ input }) => {
    const result = await OrdersService.getOrdersByDriver(input.driverId, input.limit, input.offset);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to get orders');
    }
    
    return {
      success: true,
      orders: result.data || [],
      total: result.data?.length || 0
    };
  });

export const getPendingOrdersProcedure = publicProcedure
  .input(z.object({
    limit: z.number().default(50),
  }))
  .query(async ({ input }) => {
    const result = await OrdersService.getPendingOrders(input.limit);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to get pending orders');
    }
    
    return {
      success: true,
      orders: result.data || []
    };
  });

export const getOrderByIdProcedure = publicProcedure
  .input(z.object({
    orderId: z.string(),
  }))
  .query(async ({ input }) => {
    const result = await OrdersService.getOrderById(input.orderId);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to get order');
    }
    
    return {
      success: true,
      order: result.data || null
    };
  });

export const getOrderByTrackingCodeProcedure = publicProcedure
  .input(z.object({
    trackingCode: z.string(),
  }))
  .query(async ({ input }) => {
    const result = await OrdersService.getOrderByTrackingCode(input.trackingCode);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to get order');
    }
    
    return {
      success: true,
      order: result.data || null
    };
  });

export const assignDriverProcedure = publicProcedure
  .input(z.object({
    orderId: z.string(),
    driverId: z.string(),
    adminId: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    const result = await OrdersService.assignDriver(input.orderId, input.driverId, input.adminId);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to assign driver');
    }
    
    return result;
  });

export const updateOrderStatusProcedure = publicProcedure
  .input(z.object({
    orderId: z.string(),
    status: z.enum(['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled']),
    updatedBy: z.string(),
    description: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }))
  .mutation(async ({ input }) => {
    const result = await OrdersService.updateOrderStatus(
      input.orderId,
      input.status,
      input.updatedBy,
      input.description,
      input.latitude,
      input.longitude
    );
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update order status');
    }
    
    return result;
  });

export const cancelOrderProcedure = publicProcedure
  .input(z.object({
    orderId: z.string(),
    reason: z.string().min(5),
    cancelledBy: z.string(),
  }))
  .mutation(async ({ input }) => {
    const result = await OrdersService.cancelOrder(input.orderId, input.reason, input.cancelledBy);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to cancel order');
    }
    
    return result;
  });

export const getOrderTimelineProcedure = publicProcedure
  .input(z.object({
    orderId: z.string(),
  }))
  .query(async ({ input }) => {
    const result = await OrdersService.getOrderTimeline(input.orderId);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to get order timeline');
    }
    
    return {
      success: true,
      timeline: result.data || []
    };
  });

export const updatePaymentStatusProcedure = publicProcedure
  .input(z.object({
    orderId: z.string(),
    paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']),
    paymentReference: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    const result = await OrdersService.updatePaymentStatus(
      input.orderId,
      input.paymentStatus,
      input.paymentReference
    );
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update payment status');
    }
    
    return result;
  });

export const addRatingAndFeedbackProcedure = publicProcedure
  .input(z.object({
    orderId: z.string(),
    ratingType: z.enum(['customer', 'driver']),
    rating: z.number().min(1).max(5),
    feedback: z.string().optional(),
  }))
  .mutation(async ({ input }) => {
    const result = await OrdersService.addRatingAndFeedback(
      input.orderId,
      input.ratingType,
      input.rating,
      input.feedback
    );
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to add rating and feedback');
    }
    
    return result;
  });

export const getAllOrdersProcedure = publicProcedure
  .input(z.object({
    filters: z.object({
      status: z.string().optional(),
      paymentStatus: z.string().optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
    }).optional(),
    limit: z.number().default(50),
    offset: z.number().default(0),
  }))
  .query(async ({ input }) => {
    const result = await OrdersService.getAllOrders(input.filters, input.limit, input.offset);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to get orders');
    }
    
    return {
      success: true,
      orders: result.data || [],
      total: result.data?.length || 0
    };
  });