import { createTRPCRouter } from "./create-context.js";
import { hiProcedure } from "./routes/example/hi/route";
import { loginProcedure } from "./routes/auth/login/route";
import { registerProcedure } from "./routes/auth/register/route";
import { dashboardProcedure } from "./routes/admin/dashboard/route";
import { getDriversProcedure, approveDriverProcedure, suspendDriverProcedure, assignVehicleProcedure } from "./routes/admin/drivers/route";
import { getOrdersProcedure, assignOrderProcedure, cancelOrderProcedure, sendSTKPushProcedure } from "./routes/admin/orders/route";
import { sendNotificationProcedure } from "./routes/admin/notifications/route";
import { getSettingsProcedure, updateSettingsProcedure } from "./routes/admin/settings/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiProcedure,
  }),
  auth: createTRPCRouter({
    login: loginProcedure,
    register: registerProcedure,
  }),
  admin: createTRPCRouter({
    dashboard: dashboardProcedure,
    drivers: createTRPCRouter({
      getAll: getDriversProcedure,
      approve: approveDriverProcedure,
      suspend: suspendDriverProcedure,
      assignVehicle: assignVehicleProcedure,
    }),
    orders: createTRPCRouter({
      getAll: getOrdersProcedure,
      assign: assignOrderProcedure,
      cancel: cancelOrderProcedure,
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