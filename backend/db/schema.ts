import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core';

// Users table - handles all user types (client, driver, admin)
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull(),
  password: text('password').notNull(), // In production, this should be hashed
  userType: text('user_type', { enum: ['client', 'driver', 'admin'] }).notNull(),
  status: text('status', { enum: ['active', 'suspended', 'pending'] }).default('active'),
  profileImage: text('profile_image'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Drivers table - additional driver-specific information
export const drivers = sqliteTable('drivers', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  licenseNumber: text('license_number'),
  licenseExpiry: text('license_expiry'),
  rating: real('rating').default(0),
  totalDeliveries: integer('total_deliveries').default(0),
  earnings: real('earnings').default(0),
  vehicleId: text('vehicle_id'),
  isOnline: integer('is_online', { mode: 'boolean' }).default(false),
  currentLatitude: real('current_latitude'),
  currentLongitude: real('current_longitude'),
  lastLocationUpdate: text('last_location_update'),
  approvedAt: text('approved_at'),
  approvedBy: text('approved_by').references(() => users.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Vehicles table
export const vehicles = sqliteTable('vehicles', {
  id: text('id').primaryKey(),
  plateNumber: text('plate_number').notNull().unique(),
  type: text('type', { enum: ['motorcycle', 'bicycle', 'car', 'van'] }).notNull(),
  brand: text('brand'),
  model: text('model'),
  year: integer('year'),
  color: text('color'),
  loadCapacity: integer('load_capacity').notNull(), // in kg
  status: text('status', { enum: ['available', 'assigned', 'maintenance', 'retired'] }).default('available'),
  driverId: text('driver_id').references(() => drivers.id),
  insuranceNumber: text('insurance_number'),
  insuranceExpiry: text('insurance_expiry'),
  registrationExpiry: text('registration_expiry'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Customers table - additional customer-specific information
export const customers = sqliteTable('customers', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  totalOrders: integer('total_orders').default(0),
  totalSpent: real('total_spent').default(0),
  preferredPaymentMethod: text('preferred_payment_method', { enum: ['mpesa', 'card', 'cash'] }),
  loyaltyPoints: integer('loyalty_points').default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Orders table
export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull().references(() => customers.id),
  driverId: text('driver_id').references(() => drivers.id),
  
  // Pickup information
  pickupAddress: text('pickup_address').notNull(),
  pickupLatitude: real('pickup_latitude'),
  pickupLongitude: real('pickup_longitude'),
  pickupContactName: text('pickup_contact_name'),
  pickupContactPhone: text('pickup_contact_phone'),
  
  // Delivery information
  deliveryAddress: text('delivery_address').notNull(),
  deliveryLatitude: real('delivery_latitude'),
  deliveryLongitude: real('delivery_longitude'),
  recipientName: text('recipient_name').notNull(),
  recipientPhone: text('recipient_phone').notNull(),
  
  // Package information
  packageType: text('package_type', { enum: ['documents', 'small', 'medium', 'electronics', 'clothing', 'food', 'fragile'] }).notNull(),
  packageDescription: text('package_description'),
  packageWeight: real('package_weight'), // in kg
  packageValue: real('package_value'), // for insurance
  specialInstructions: text('special_instructions'),
  
  // Order details
  status: text('status', { enum: ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'] }).default('pending'),
  priority: text('priority', { enum: ['normal', 'urgent', 'express'] }).default('normal'),
  
  // Pricing
  baseFare: real('base_fare').notNull(),
  distanceFare: real('distance_fare').notNull(),
  surcharges: real('surcharges').default(0),
  totalAmount: real('total_amount').notNull(),
  
  // Payment
  paymentMethod: text('payment_method', { enum: ['mpesa', 'card', 'cash'] }).notNull(),
  paymentTerm: text('payment_term', { enum: ['pay_now', 'pay_on_delivery'] }).notNull(),
  paymentStatus: text('payment_status', { enum: ['pending', 'paid', 'failed', 'refunded'] }).default('pending'),
  paymentReference: text('payment_reference'),
  
  // Timing
  estimatedDistance: real('estimated_distance'), // in km
  estimatedDuration: integer('estimated_duration'), // in minutes
  scheduledPickupTime: text('scheduled_pickup_time'),
  actualPickupTime: text('actual_pickup_time'),
  actualDeliveryTime: text('actual_delivery_time'),
  
  // Tracking
  trackingCode: text('tracking_code').unique(),
  
  // Ratings and feedback
  customerRating: integer('customer_rating'), // 1-5
  driverRating: integer('driver_rating'), // 1-5
  customerFeedback: text('customer_feedback'),
  driverFeedback: text('driver_feedback'),
  
  // Metadata
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
  completedAt: text('completed_at'),
  cancelledAt: text('cancelled_at'),
  cancellationReason: text('cancellation_reason'),
});

// Order timeline/status history
export const orderTimeline = sqliteTable('order_timeline', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  status: text('status', { enum: ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'] }).notNull(),
  description: text('description').notNull(),
  latitude: real('latitude'),
  longitude: real('longitude'),
  createdBy: text('created_by').references(() => users.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Support queries/tickets
export const supportQueries = sqliteTable('support_queries', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  orderId: text('order_id').references(() => orders.id),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  category: text('category', { enum: ['payment', 'delivery', 'technical', 'general', 'complaint'] }).notNull(),
  status: text('status', { enum: ['open', 'in_progress', 'resolved', 'closed'] }).default('open'),
  priority: text('priority', { enum: ['low', 'medium', 'high', 'urgent'] }).default('medium'),
  assignedTo: text('assigned_to').references(() => users.id),
  response: text('response'),
  responseAt: text('response_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Notifications
export const notifications = sqliteTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type', { enum: ['order', 'payment', 'system', 'promotion', 'support'] }).notNull(),
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  data: text('data'), // JSON string for additional data
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// System settings
export const settings = sqliteTable('settings', {
  id: text('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  type: text('type', { enum: ['string', 'number', 'boolean', 'json'] }).default('string'),
  description: text('description'),
  category: text('category', { enum: ['pricing', 'system', 'payment', 'notification'] }).notNull(),
  updatedBy: text('updated_by').references(() => users.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Activity logs for admin actions
export const activityLogs = sqliteTable('activity_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  action: text('action').notNull(),
  resource: text('resource').notNull(), // e.g., 'user', 'order', 'vehicle'
  resourceId: text('resource_id'),
  details: text('details'), // JSON string
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Payment transactions
export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id),
  customerId: text('customer_id').notNull().references(() => customers.id),
  amount: real('amount').notNull(),
  method: text('method', { enum: ['mpesa', 'card', 'cash'] }).notNull(),
  status: text('status', { enum: ['pending', 'completed', 'failed', 'cancelled', 'refunded'] }).default('pending'),
  reference: text('reference').unique(),
  externalReference: text('external_reference'), // M-Pesa transaction ID, etc.
  metadata: text('metadata'), // JSON string for additional payment data
  processedAt: text('processed_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Driver earnings and payouts
export const driverEarnings = sqliteTable('driver_earnings', {
  id: text('id').primaryKey(),
  driverId: text('driver_id').notNull().references(() => drivers.id),
  orderId: text('order_id').notNull().references(() => orders.id),
  grossAmount: real('gross_amount').notNull(),
  commission: real('commission').notNull(),
  netAmount: real('net_amount').notNull(),
  status: text('status', { enum: ['pending', 'paid', 'withheld'] }).default('pending'),
  paidAt: text('paid_at'),
  paymentMethod: text('payment_method', { enum: ['mpesa', 'bank_transfer'] }),
  paymentReference: text('payment_reference'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Promotional codes and discounts
export const promotions = sqliteTable('promotions', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type', { enum: ['percentage', 'fixed_amount', 'free_delivery'] }).notNull(),
  value: real('value').notNull(),
  minimumOrderAmount: real('minimum_order_amount'),
  maxDiscountAmount: real('max_discount_amount'),
  usageLimit: integer('usage_limit'),
  usedCount: integer('used_count').default(0),
  validFrom: text('valid_from').notNull(),
  validUntil: text('valid_until').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdBy: text('created_by').references(() => users.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Promotion usage tracking
export const promotionUsage = sqliteTable('promotion_usage', {
  id: text('id').primaryKey(),
  promotionId: text('promotion_id').notNull().references(() => promotions.id),
  customerId: text('customer_id').notNull().references(() => customers.id),
  orderId: text('order_id').notNull().references(() => orders.id),
  discountAmount: real('discount_amount').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Export types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Driver = typeof drivers.$inferSelect;
export type NewDriver = typeof drivers.$inferInsert;
export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderTimeline = typeof orderTimeline.$inferSelect;
export type NewOrderTimeline = typeof orderTimeline.$inferInsert;
export type SupportQuery = typeof supportQueries.$inferSelect;
export type NewSupportQuery = typeof supportQueries.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type DriverEarning = typeof driverEarnings.$inferSelect;
export type NewDriverEarning = typeof driverEarnings.$inferInsert;
export type Promotion = typeof promotions.$inferSelect;
export type NewPromotion = typeof promotions.$inferInsert;
export type PromotionUsage = typeof promotionUsage.$inferSelect;
export type NewPromotionUsage = typeof promotionUsage.$inferInsert;

// Add foreign key relationships after table definitions to avoid circular references
// Note: These are handled by the database constraints defined above