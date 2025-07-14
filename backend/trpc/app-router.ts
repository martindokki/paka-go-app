import { createTRPCRouter } from "./create-context";
import { hiProcedure } from "./routes/example/hi/route";

// Auth routes
import { loginProcedure } from "./routes/auth/login/route";
import { registerProcedure } from "./routes/auth/register/route";
import { getProfileProcedure, updateProfileProcedure, changePasswordProcedure, deleteAccountProcedure } from "./routes/auth/profile/route";

// Order routes
import { createOrderProcedure } from "./routes/orders/create/route";
import {
  getOrdersByCustomerProcedure,
  getOrdersByDriverProcedure,
  getPendingOrdersProcedure,
  getOrderByIdProcedure,
  getOrderByTrackingCodeProcedure,
  assignDriverProcedure,
  updateOrderStatusProcedure,
  cancelOrderProcedure as ordersCancelOrderProcedure,
  getOrderTimelineProcedure,
  updatePaymentStatusProcedure,
  addRatingAndFeedbackProcedure,
  getAllOrdersProcedure,
} from "./routes/orders/manage/route";

// Driver routes
import {
  getAllDriversProcedure,
  getDriverByIdProcedure,
  getDriverByUserIdProcedure,
  approveDriverProcedure,
  suspendDriverProcedure,
  assignVehicleProcedure,
  updateDriverLocationProcedure,
  setDriverOnlineStatusProcedure,
  updateDriverProfileProcedure,
  getAvailableDriversProcedure,
  updateDriverEarningsProcedure,
  updateDriverRatingProcedure,
  getDriverStatsProcedure,
} from "./routes/drivers/manage/route";

// Admin routes (keeping existing ones for now)
import { dashboardProcedure } from "./routes/admin/dashboard/route";
import { getDriversProcedure, assignVehicleProcedure as adminAssignVehicleProcedure } from "./routes/admin/drivers/route";
import { getOrdersProcedure, assignOrderProcedure, cancelOrderProcedure as adminCancelOrderProcedure, sendSTKPushProcedure } from "./routes/admin/orders/route";
import { sendNotificationProcedure } from "./routes/admin/notifications/route";
import { getSettingsProcedure, updateSettingsProcedure } from "./routes/admin/settings/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiProcedure,
  }),
  auth: createTRPCRouter({
    login: loginProcedure,
    register: registerProcedure,
    profile: createTRPCRouter({
      get: getProfileProcedure,
      update: updateProfileProcedure,
      changePassword: changePasswordProcedure,
      delete: deleteAccountProcedure,
    }),
  }),
  orders: createTRPCRouter({
    create: createOrderProcedure,
    getByCustomer: getOrdersByCustomerProcedure,
    getByDriver: getOrdersByDriverProcedure,
    getPending: getPendingOrdersProcedure,
    getById: getOrderByIdProcedure,
    getByTrackingCode: getOrderByTrackingCodeProcedure,
    assignDriver: assignDriverProcedure,
    updateStatus: updateOrderStatusProcedure,
    cancel: ordersCancelOrderProcedure,
    getTimeline: getOrderTimelineProcedure,
    updatePaymentStatus: updatePaymentStatusProcedure,
    addRatingAndFeedback: addRatingAndFeedbackProcedure,
    getAll: getAllOrdersProcedure,
  }),
  drivers: createTRPCRouter({
    getAll: getAllDriversProcedure,
    getById: getDriverByIdProcedure,
    getByUserId: getDriverByUserIdProcedure,
    approve: approveDriverProcedure,
    suspend: suspendDriverProcedure,
    assignVehicle: assignVehicleProcedure,
    updateLocation: updateDriverLocationProcedure,
    setOnlineStatus: setDriverOnlineStatusProcedure,
    updateProfile: updateDriverProfileProcedure,
    getAvailable: getAvailableDriversProcedure,
    updateEarnings: updateDriverEarningsProcedure,
    updateRating: updateDriverRatingProcedure,
    getStats: getDriverStatsProcedure,
  }),
  admin: createTRPCRouter({
    dashboard: dashboardProcedure,
    drivers: createTRPCRouter({
      getAll: getDriversProcedure,
      assignVehicle: adminAssignVehicleProcedure,
    }),
    orders: createTRPCRouter({
      getAll: getOrdersProcedure,
      assign: assignOrderProcedure,
      cancel: adminCancelOrderProcedure,
      sendSTKPush: sendSTKPushProcedure,
    }),
    notifications: createTRPCRouter({
      send: sendNotificationProcedure,
    }),
    settings: createTRPCRouter({
      get: getSettingsProcedure,
      update: updateSettingsProcedure,
    }),
  }),
});

export type AppRouter = typeof appRouter;