import { z } from 'zod';
import { publicProcedure } from '../../create-context.ts';

export const dashboardProcedure = publicProcedure
  .query(async () => {
    // Mock data - replace with actual database queries
    const stats = {
      totalRevenue: 125000,
      totalOrders: 1250,
      pendingOrders: 45,
      completedOrders: 1100,
      onTransitOrders: 85,
      cancelledOrders: 20,
      totalCustomers: 850,
      totalDrivers: 120,
      activeDrivers: 95,
      averageOrdersPerMinute: 2.5,
      averageETA: 25,
      newUsersDaily: 12,
      newUsersWeekly: 84,
    };

    return {
      success: true,
      data: stats,
    };
  });