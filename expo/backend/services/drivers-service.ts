import { eq, and, desc, sql } from 'drizzle-orm';
import { db, schema } from '../db';
import type { Driver, NewDriver, User } from '../db/schema';

export class DriversService {
  // Get all drivers (admin)
  static async getAllDrivers(limit = 50, offset = 0) {
    try {
      const drivers = await db
        .select({
          id: schema.drivers.id,
          userId: schema.drivers.userId,
          name: schema.users.name,
          email: schema.users.email,
          phone: schema.users.phone,
          status: schema.users.status,
          licenseNumber: schema.drivers.licenseNumber,
          licenseExpiry: schema.drivers.licenseExpiry,
          rating: schema.drivers.rating,
          totalDeliveries: schema.drivers.totalDeliveries,
          earnings: schema.drivers.earnings,
          vehicleId: schema.drivers.vehicleId,
          isOnline: schema.drivers.isOnline,
          currentLatitude: schema.drivers.currentLatitude,
          currentLongitude: schema.drivers.currentLongitude,
          lastLocationUpdate: schema.drivers.lastLocationUpdate,
          approvedAt: schema.drivers.approvedAt,
          approvedBy: schema.drivers.approvedBy,
          createdAt: schema.drivers.createdAt,
          updatedAt: schema.drivers.updatedAt,
        })
        .from(schema.drivers)
        .innerJoin(schema.users, eq(schema.drivers.userId, schema.users.id))
        .orderBy(desc(schema.drivers.createdAt))
        .limit(limit)
        .offset(offset);

      return { success: true, data: drivers };
    } catch (error) {
      console.error('Get all drivers error:', error);
      return { success: false, error: 'Failed to get drivers' };
    }
  }

  // Get driver by ID
  static async getDriverById(driverId: string) {
    try {
      const driver = await db
        .select({
          id: schema.drivers.id,
          userId: schema.drivers.userId,
          name: schema.users.name,
          email: schema.users.email,
          phone: schema.users.phone,
          status: schema.users.status,
          licenseNumber: schema.drivers.licenseNumber,
          licenseExpiry: schema.drivers.licenseExpiry,
          rating: schema.drivers.rating,
          totalDeliveries: schema.drivers.totalDeliveries,
          earnings: schema.drivers.earnings,
          vehicleId: schema.drivers.vehicleId,
          isOnline: schema.drivers.isOnline,
          currentLatitude: schema.drivers.currentLatitude,
          currentLongitude: schema.drivers.currentLongitude,
          lastLocationUpdate: schema.drivers.lastLocationUpdate,
          approvedAt: schema.drivers.approvedAt,
          approvedBy: schema.drivers.approvedBy,
          createdAt: schema.drivers.createdAt,
          updatedAt: schema.drivers.updatedAt,
        })
        .from(schema.drivers)
        .innerJoin(schema.users, eq(schema.drivers.userId, schema.users.id))
        .where(eq(schema.drivers.id, driverId))
        .limit(1);

      if (driver.length === 0) {
        return { success: false, error: 'Driver not found' };
      }

      return { success: true, data: driver[0] };
    } catch (error) {
      console.error('Get driver by ID error:', error);
      return { success: false, error: 'Failed to get driver' };
    }
  }

  // Get driver by user ID
  static async getDriverByUserId(userId: string) {
    try {
      const driver = await db
        .select()
        .from(schema.drivers)
        .where(eq(schema.drivers.userId, userId))
        .limit(1);

      if (driver.length === 0) {
        return { success: false, error: 'Driver not found' };
      }

      return { success: true, data: driver[0] };
    } catch (error) {
      console.error('Get driver by user ID error:', error);
      return { success: false, error: 'Failed to get driver' };
    }
  }

  // Approve driver
  static async approveDriver(driverId: string, approvedBy: string) {
    try {
      // Update driver approval
      await db
        .update(schema.drivers)
        .set({
          approvedAt: new Date().toISOString(),
          approvedBy,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.drivers.id, driverId));

      // Update user status
      const driver = await db
        .select({ userId: schema.drivers.userId })
        .from(schema.drivers)
        .where(eq(schema.drivers.id, driverId))
        .limit(1);

      if (driver.length > 0) {
        await db
          .update(schema.users)
          .set({
            status: 'active',
            updatedAt: new Date().toISOString(),
          })
          .where(eq(schema.users.id, driver[0].userId));
      }

      return { success: true };
    } catch (error) {
      console.error('Approve driver error:', error);
      return { success: false, error: 'Failed to approve driver' };
    }
  }

  // Suspend driver
  static async suspendDriver(driverId: string, reason?: string) {
    try {
      // Update driver status
      await db
        .update(schema.drivers)
        .set({
          isOnline: false,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.drivers.id, driverId));

      // Update user status
      const driver = await db
        .select({ userId: schema.drivers.userId })
        .from(schema.drivers)
        .where(eq(schema.drivers.id, driverId))
        .limit(1);

      if (driver.length > 0) {
        await db
          .update(schema.users)
          .set({
            status: 'suspended',
            updatedAt: new Date().toISOString(),
          })
          .where(eq(schema.users.id, driver[0].userId));
      }

      return { success: true };
    } catch (error) {
      console.error('Suspend driver error:', error);
      return { success: false, error: 'Failed to suspend driver' };
    }
  }

  // Assign vehicle to driver
  static async assignVehicle(driverId: string, vehicleId: string) {
    try {
      // Update driver with vehicle
      await db
        .update(schema.drivers)
        .set({
          vehicleId,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.drivers.id, driverId));

      // Update vehicle status
      await db
        .update(schema.vehicles)
        .set({
          status: 'assigned',
          driverId,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.vehicles.id, vehicleId));

      return { success: true };
    } catch (error) {
      console.error('Assign vehicle error:', error);
      return { success: false, error: 'Failed to assign vehicle' };
    }
  }

  // Update driver location
  static async updateLocation(driverId: string, latitude: number, longitude: number) {
    try {
      await db
        .update(schema.drivers)
        .set({
          currentLatitude: latitude,
          currentLongitude: longitude,
          lastLocationUpdate: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.drivers.id, driverId));

      return { success: true };
    } catch (error) {
      console.error('Update driver location error:', error);
      return { success: false, error: 'Failed to update location' };
    }
  }

  // Set driver online/offline status
  static async setOnlineStatus(driverId: string, isOnline: boolean) {
    try {
      await db
        .update(schema.drivers)
        .set({
          isOnline,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.drivers.id, driverId));

      return { success: true };
    } catch (error) {
      console.error('Set online status error:', error);
      return { success: false, error: 'Failed to update online status' };
    }
  }

  // Update driver profile
  static async updateProfile(driverId: string, updates: {
    licenseNumber?: string;
    licenseExpiry?: string;
  }) {
    try {
      await db
        .update(schema.drivers)
        .set({
          ...updates,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.drivers.id, driverId));

      return { success: true };
    } catch (error) {
      console.error('Update driver profile error:', error);
      return { success: false, error: 'Failed to update driver profile' };
    }
  }

  // Get available drivers (for order assignment)
  static async getAvailableDrivers(latitude?: number, longitude?: number, radius = 10) {
    try {
      let query = db
        .select({
          id: schema.drivers.id,
          userId: schema.drivers.userId,
          name: schema.users.name,
          phone: schema.users.phone,
          rating: schema.drivers.rating,
          totalDeliveries: schema.drivers.totalDeliveries,
          currentLatitude: schema.drivers.currentLatitude,
          currentLongitude: schema.drivers.currentLongitude,
          vehicleId: schema.drivers.vehicleId,
        })
        .from(schema.drivers)
        .innerJoin(schema.users, eq(schema.drivers.userId, schema.users.id))
        .where(
          and(
            eq(schema.drivers.isOnline, true),
            eq(schema.users.status, 'active')
          )
        );

      // If location is provided, we could add distance filtering here
      // For now, just return all available drivers
      const drivers = await query.orderBy(desc(schema.drivers.rating));

      return { success: true, data: drivers };
    } catch (error) {
      console.error('Get available drivers error:', error);
      return { success: false, error: 'Failed to get available drivers' };
    }
  }

  // Update driver earnings after completed delivery
  static async updateEarnings(driverId: string, amount: number) {
    try {
      await db
        .update(schema.drivers)
        .set({
          earnings: sql`${schema.drivers.earnings} + ${amount}`,
          totalDeliveries: sql`${schema.drivers.totalDeliveries} + 1`,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.drivers.id, driverId));

      return { success: true };
    } catch (error) {
      console.error('Update driver earnings error:', error);
      return { success: false, error: 'Failed to update earnings' };
    }
  }

  // Update driver rating
  static async updateRating(driverId: string, newRating: number) {
    try {
      // Get current rating and delivery count
      const driver = await db
        .select({
          rating: schema.drivers.rating,
          totalDeliveries: schema.drivers.totalDeliveries,
        })
        .from(schema.drivers)
        .where(eq(schema.drivers.id, driverId))
        .limit(1);

      if (driver.length === 0) {
        return { success: false, error: 'Driver not found' };
      }

      const currentRating = driver[0].rating || 0;
      const totalDeliveries = driver[0].totalDeliveries || 0;

      // Calculate new average rating
      const updatedRating = totalDeliveries > 0 
        ? ((currentRating * totalDeliveries) + newRating) / (totalDeliveries + 1)
        : newRating;

      await db
        .update(schema.drivers)
        .set({
          rating: Math.round(updatedRating * 10) / 10, // Round to 1 decimal place
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.drivers.id, driverId));

      return { success: true };
    } catch (error) {
      console.error('Update driver rating error:', error);
      return { success: false, error: 'Failed to update rating' };
    }
  }

  // Get driver statistics
  static async getDriverStats(driverId: string) {
    try {
      const driver = await db
        .select({
          totalDeliveries: schema.drivers.totalDeliveries,
          earnings: schema.drivers.earnings,
          rating: schema.drivers.rating,
        })
        .from(schema.drivers)
        .where(eq(schema.drivers.id, driverId))
        .limit(1);

      if (driver.length === 0) {
        return { success: false, error: 'Driver not found' };
      }

      // Get additional stats from orders
      const orderStats = await db
        .select({
          completedOrders: sql<number>`COUNT(CASE WHEN ${schema.orders.status} = 'delivered' THEN 1 END)`,
          cancelledOrders: sql<number>`COUNT(CASE WHEN ${schema.orders.status} = 'cancelled' THEN 1 END)`,
          totalRevenue: sql<number>`SUM(CASE WHEN ${schema.orders.status} = 'delivered' THEN ${schema.orders.totalAmount} ELSE 0 END)`,
        })
        .from(schema.orders)
        .where(eq(schema.orders.driverId, driverId));

      const stats = {
        ...driver[0],
        completedOrders: orderStats[0]?.completedOrders || 0,
        cancelledOrders: orderStats[0]?.cancelledOrders || 0,
        totalRevenue: orderStats[0]?.totalRevenue || 0,
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Get driver stats error:', error);
      return { success: false, error: 'Failed to get driver stats' };
    }
  }
}