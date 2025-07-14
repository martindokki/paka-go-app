import { eq, and, desc, asc, sql, or } from 'drizzle-orm';
import { db, schema } from '../db';
import type { Order, NewOrder, NewOrderTimeline, OrderTimeline } from '../db/schema';

export class OrdersService {
  // Create a new order
  static async createOrder(orderData: {
    customerId: string;
    pickupAddress: string;
    pickupLatitude?: number;
    pickupLongitude?: number;
    deliveryAddress: string;
    deliveryLatitude?: number;
    deliveryLongitude?: number;
    recipientName: string;
    recipientPhone: string;
    packageType: 'documents' | 'small' | 'medium' | 'electronics' | 'clothing' | 'food' | 'fragile';
    packageDescription?: string;
    packageWeight?: number;
    packageValue?: number;
    specialInstructions?: string;
    priority?: 'normal' | 'urgent' | 'express';
    paymentMethod: 'mpesa' | 'card' | 'cash';
    paymentTerm: 'pay_now' | 'pay_on_delivery';
    estimatedDistance?: number;
    estimatedDuration?: number;
    scheduledPickupTime?: string;
  }) {
    try {
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const trackingCode = `PKG${Date.now().toString().slice(-6)}`;
      
      // Calculate pricing (simplified - in production, use more complex logic)
      const baseFare = 80;
      const distanceFare = (orderData.estimatedDistance || 5) * 11;
      const surcharges = orderData.priority === 'express' ? 50 : orderData.priority === 'urgent' ? 25 : 0;
      const totalAmount = baseFare + distanceFare + surcharges;

      const newOrder: NewOrder = {
        id: orderId,
        customerId: orderData.customerId,
        pickupAddress: orderData.pickupAddress,
        pickupLatitude: orderData.pickupLatitude,
        pickupLongitude: orderData.pickupLongitude,
        deliveryAddress: orderData.deliveryAddress,
        deliveryLatitude: orderData.deliveryLatitude,
        deliveryLongitude: orderData.deliveryLongitude,
        recipientName: orderData.recipientName,
        recipientPhone: orderData.recipientPhone,
        packageType: orderData.packageType,
        packageDescription: orderData.packageDescription,
        packageWeight: orderData.packageWeight,
        packageValue: orderData.packageValue,
        specialInstructions: orderData.specialInstructions,
        priority: orderData.priority || 'normal',
        baseFare,
        distanceFare,
        surcharges,
        totalAmount,
        paymentMethod: orderData.paymentMethod,
        paymentTerm: orderData.paymentTerm,
        estimatedDistance: orderData.estimatedDistance,
        estimatedDuration: orderData.estimatedDuration,
        scheduledPickupTime: orderData.scheduledPickupTime,
        trackingCode,
      };

      await db.insert(schema.orders).values(newOrder);

      // Create initial timeline entry
      const timelineId = `timeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timelineEntry: NewOrderTimeline = {
        id: timelineId,
        orderId,
        status: 'pending',
        description: 'Order placed and finding driver',
        createdBy: orderData.customerId,
      };

      await db.insert(schema.orderTimeline).values(timelineEntry);

      return { success: true, data: { orderId, trackingCode } };
    } catch (error) {
      console.error('Create order error:', error);
      return { success: false, error: 'Failed to create order' };
    }
  }

  // Get orders by customer
  static async getOrdersByCustomer(customerId: string, limit = 50, offset = 0) {
    try {
      const orders = await db
        .select()
        .from(schema.orders)
        .where(eq(schema.orders.customerId, customerId))
        .orderBy(desc(schema.orders.createdAt))
        .limit(limit)
        .offset(offset);

      return { success: true, data: orders };
    } catch (error) {
      console.error('Get orders by customer error:', error);
      return { success: false, error: 'Failed to get orders' };
    }
  }

  // Get orders by driver
  static async getOrdersByDriver(driverId: string, limit = 50, offset = 0) {
    try {
      const orders = await db
        .select()
        .from(schema.orders)
        .where(eq(schema.orders.driverId, driverId))
        .orderBy(desc(schema.orders.createdAt))
        .limit(limit)
        .offset(offset);

      return { success: true, data: orders };
    } catch (error) {
      console.error('Get orders by driver error:', error);
      return { success: false, error: 'Failed to get orders' };
    }
  }

  // Get pending orders (for driver assignment)
  static async getPendingOrders(limit = 50) {
    try {
      const orders = await db
        .select()
        .from(schema.orders)
        .where(eq(schema.orders.status, 'pending'))
        .orderBy(asc(schema.orders.createdAt))
        .limit(limit);

      return { success: true, data: orders };
    } catch (error) {
      console.error('Get pending orders error:', error);
      return { success: false, error: 'Failed to get pending orders' };
    }
  }

  // Get order by ID
  static async getOrderById(orderId: string) {
    try {
      const order = await db
        .select()
        .from(schema.orders)
        .where(eq(schema.orders.id, orderId))
        .limit(1);

      if (order.length === 0) {
        return { success: false, error: 'Order not found' };
      }

      return { success: true, data: order[0] };
    } catch (error) {
      console.error('Get order by ID error:', error);
      return { success: false, error: 'Failed to get order' };
    }
  }

  // Get order by tracking code
  static async getOrderByTrackingCode(trackingCode: string) {
    try {
      const order = await db
        .select()
        .from(schema.orders)
        .where(eq(schema.orders.trackingCode, trackingCode))
        .limit(1);

      if (order.length === 0) {
        return { success: false, error: 'Order not found' };
      }

      return { success: true, data: order[0] };
    } catch (error) {
      console.error('Get order by tracking code error:', error);
      return { success: false, error: 'Failed to get order' };
    }
  }

  // Assign driver to order
  static async assignDriver(orderId: string, driverId: string, adminId?: string) {
    try {
      // Update order
      await db
        .update(schema.orders)
        .set({
          driverId,
          status: 'assigned',
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.orders.id, orderId));

      // Add timeline entry
      const timelineId = `timeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timelineEntry: NewOrderTimeline = {
        id: timelineId,
        orderId,
        status: 'assigned',
        description: 'Driver assigned and heading to pickup',
        createdBy: adminId || driverId,
      };

      await db.insert(schema.orderTimeline).values(timelineEntry);

      return { success: true };
    } catch (error) {
      console.error('Assign driver error:', error);
      return { success: false, error: 'Failed to assign driver' };
    }
  }

  // Update order status
  static async updateOrderStatus(
    orderId: string,
    status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled',
    updatedBy: string,
    description?: string,
    latitude?: number,
    longitude?: number
  ) {
    try {
      const updateData: any = {
        status,
        updatedAt: new Date().toISOString(),
      };

      // Set completion time for delivered orders
      if (status === 'delivered') {
        updateData.completedAt = new Date().toISOString();
        updateData.actualDeliveryTime = new Date().toISOString();
      } else if (status === 'picked_up' && !updateData.actualPickupTime) {
        updateData.actualPickupTime = new Date().toISOString();
      } else if (status === 'cancelled') {
        updateData.cancelledAt = new Date().toISOString();
      }

      await db
        .update(schema.orders)
        .set(updateData)
        .where(eq(schema.orders.id, orderId));

      // Add timeline entry
      const timelineId = `timeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timelineEntry: NewOrderTimeline = {
        id: timelineId,
        orderId,
        status,
        description: description || this.getStatusDescription(status),
        latitude,
        longitude,
        createdBy: updatedBy,
      };

      await db.insert(schema.orderTimeline).values(timelineEntry);

      return { success: true };
    } catch (error) {
      console.error('Update order status error:', error);
      return { success: false, error: 'Failed to update order status' };
    }
  }

  // Cancel order
  static async cancelOrder(orderId: string, reason: string, cancelledBy: string) {
    try {
      await db
        .update(schema.orders)
        .set({
          status: 'cancelled',
          cancelledAt: new Date().toISOString(),
          cancellationReason: reason,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.orders.id, orderId));

      // Add timeline entry
      const timelineId = `timeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const timelineEntry: NewOrderTimeline = {
        id: timelineId,
        orderId,
        status: 'cancelled',
        description: `Order cancelled: ${reason}`,
        createdBy: cancelledBy,
      };

      await db.insert(schema.orderTimeline).values(timelineEntry);

      return { success: true };
    } catch (error) {
      console.error('Cancel order error:', error);
      return { success: false, error: 'Failed to cancel order' };
    }
  }

  // Get order timeline
  static async getOrderTimeline(orderId: string) {
    try {
      const timeline = await db
        .select()
        .from(schema.orderTimeline)
        .where(eq(schema.orderTimeline.orderId, orderId))
        .orderBy(asc(schema.orderTimeline.createdAt));

      return { success: true, data: timeline };
    } catch (error) {
      console.error('Get order timeline error:', error);
      return { success: false, error: 'Failed to get order timeline' };
    }
  }

  // Update payment status
  static async updatePaymentStatus(
    orderId: string,
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded',
    paymentReference?: string
  ) {
    try {
      await db
        .update(schema.orders)
        .set({
          paymentStatus,
          paymentReference,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.orders.id, orderId));

      return { success: true };
    } catch (error) {
      console.error('Update payment status error:', error);
      return { success: false, error: 'Failed to update payment status' };
    }
  }

  // Add rating and feedback
  static async addRatingAndFeedback(
    orderId: string,
    ratingType: 'customer' | 'driver',
    rating: number,
    feedback?: string
  ) {
    try {
      const updateData: any = {
        updatedAt: new Date().toISOString(),
      };

      if (ratingType === 'customer') {
        updateData.customerRating = rating;
        updateData.customerFeedback = feedback;
      } else {
        updateData.driverRating = rating;
        updateData.driverFeedback = feedback;
      }

      await db
        .update(schema.orders)
        .set(updateData)
        .where(eq(schema.orders.id, orderId));

      return { success: true };
    } catch (error) {
      console.error('Add rating and feedback error:', error);
      return { success: false, error: 'Failed to add rating and feedback' };
    }
  }

  // Get all orders (admin)
  static async getAllOrders(
    filters?: {
      status?: string;
      paymentStatus?: string;
      dateFrom?: string;
      dateTo?: string;
    },
    limit = 50,
    offset = 0
  ) {
    try {
      let query = db.select().from(schema.orders);

      // Apply filters
      const conditions = [];
      if (filters?.status) {
        conditions.push(eq(schema.orders.status, filters.status as any));
      }
      if (filters?.paymentStatus) {
        conditions.push(eq(schema.orders.paymentStatus, filters.paymentStatus as any));
      }
      if (filters?.dateFrom) {
        conditions.push(sql`${schema.orders.createdAt} >= ${filters.dateFrom}`);
      }
      if (filters?.dateTo) {
        conditions.push(sql`${schema.orders.createdAt} <= ${filters.dateTo}`);
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }

      const orders = await query
        .orderBy(desc(schema.orders.createdAt))
        .limit(limit)
        .offset(offset);

      return { success: true, data: orders };
    } catch (error) {
      console.error('Get all orders error:', error);
      return { success: false, error: 'Failed to get orders' };
    }
  }

  // Helper method to get status description
  private static getStatusDescription(status: string): string {
    const descriptions = {
      pending: 'Order placed and finding driver',
      assigned: 'Driver assigned and heading to pickup',
      picked_up: 'Package picked up from sender',
      in_transit: 'Package is on the way to destination',
      delivered: 'Package delivered to recipient',
      cancelled: 'Order cancelled',
    };
    return descriptions[status as keyof typeof descriptions] || 'Status updated';
  }
}