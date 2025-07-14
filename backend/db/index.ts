import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { eq } from 'drizzle-orm';
import * as schema from './schema';
import path from 'path';

// Create database connection
const sqlite = new Database(path.join(process.cwd(), 'backend/db/paka-go.db'));
sqlite.pragma('journal_mode = WAL');

// Create drizzle instance
export const db = drizzle(sqlite, { schema });

// Initialize database with sample data
export async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Create tables if they don't exist
    await createTables();
    
    // Insert sample data
    await insertSampleData();
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    // Don't throw error to prevent app crash
    return false;
  }
  return true;
}

async function createTables() {
  // The tables are created automatically by Drizzle when we use them
  // But we can run some initial setup here if needed
  console.log('Tables will be created automatically by Drizzle ORM');
}

async function insertSampleData() {
  try {
    // Check if we already have data
    let existingUsers;
    try {
      existingUsers = await db.select().from(schema.users).limit(1);
    } catch (error) {
      console.log('Users table does not exist yet, will create with sample data');
      existingUsers = [];
    }
    
    if (existingUsers.length > 0) {
      console.log('Sample data already exists, skipping insertion');
      return;
    }

    console.log('Inserting sample data...');

    // Insert sample users
    const sampleUsers = [
      {
        id: 'user_1',
        name: 'John Client',
        email: 'client@test.com',
        phone: '+254712345678',
        password: 'password123', // In production, this should be hashed
        userType: 'client' as const,
        status: 'active' as const,
      },
      {
        id: 'user_2',
        name: 'Jane Driver',
        email: 'driver@test.com',
        phone: '+254712345679',
        password: 'password123',
        userType: 'driver' as const,
        status: 'active' as const,
      },
      {
        id: 'user_3',
        name: 'Admin User',
        email: 'admin@test.com',
        phone: '+254712345680',
        password: 'password123',
        userType: 'admin' as const,
        status: 'active' as const,
      },
      {
        id: 'user_4',
        name: 'Peter Mwangi',
        email: 'peter@test.com',
        phone: '+254798765432',
        password: 'password123',
        userType: 'driver' as const,
        status: 'active' as const,
      },
      {
        id: 'user_5',
        name: 'Grace Akinyi',
        email: 'grace@test.com',
        phone: '+254734567890',
        password: 'password123',
        userType: 'driver' as const,
        status: 'active' as const,
      },
    ];

    await db.insert(schema.users).values(sampleUsers);

    // Insert sample customers
    const sampleCustomers = [
      {
        id: 'customer_1',
        userId: 'user_1',
        totalOrders: 3,
        totalSpent: 1270,
        preferredPaymentMethod: 'mpesa' as const,
        loyaltyPoints: 127,
      },
    ];

    await db.insert(schema.customers).values(sampleCustomers);

    // Insert sample drivers
    const sampleDrivers = [
      {
        id: 'driver_1',
        userId: 'user_2',
        licenseNumber: 'DL123456789',
        licenseExpiry: '2025-12-31',
        rating: 4.8,
        totalDeliveries: 150,
        earnings: 45000,
        isOnline: true,
        currentLatitude: -1.2921,
        currentLongitude: 36.8219,
        approvedAt: '2024-01-15T10:00:00Z',
        approvedBy: 'user_3',
      },
      {
        id: 'driver_2',
        userId: 'user_4',
        licenseNumber: 'DL987654321',
        licenseExpiry: '2025-10-15',
        rating: 4.9,
        totalDeliveries: 200,
        earnings: 60000,
        isOnline: true,
        currentLatitude: -1.3032,
        currentLongitude: 36.8073,
        approvedAt: '2024-01-10T10:00:00Z',
        approvedBy: 'user_3',
      },
      {
        id: 'driver_3',
        userId: 'user_5',
        licenseNumber: 'DL456789123',
        licenseExpiry: '2025-08-20',
        rating: 4.7,
        totalDeliveries: 120,
        earnings: 36000,
        isOnline: false,
        currentLatitude: -1.2864,
        currentLongitude: 36.8172,
        approvedAt: '2024-01-20T10:00:00Z',
        approvedBy: 'user_3',
      },
    ];

    await db.insert(schema.drivers).values(sampleDrivers);

    // Insert sample vehicles
    const sampleVehicles = [
      {
        id: 'vehicle_1',
        plateNumber: 'KCA 123D',
        type: 'motorcycle' as const,
        brand: 'Honda',
        model: 'CB 150R',
        year: 2022,
        color: 'Red',
        loadCapacity: 50,
        status: 'assigned' as const,
        driverId: 'driver_2',
        insuranceNumber: 'INS123456',
        insuranceExpiry: '2024-12-31',
        registrationExpiry: '2024-11-30',
      },
      {
        id: 'vehicle_2',
        plateNumber: 'KCB 456E',
        type: 'motorcycle' as const,
        brand: 'Yamaha',
        model: 'YBR 125',
        year: 2021,
        color: 'Blue',
        loadCapacity: 45,
        status: 'assigned' as const,
        driverId: 'driver_3',
        insuranceNumber: 'INS789012',
        insuranceExpiry: '2024-10-31',
        registrationExpiry: '2024-09-30',
      },
      {
        id: 'vehicle_3',
        plateNumber: 'KCC 789F',
        type: 'motorcycle' as const,
        brand: 'Bajaj',
        model: 'Boxer',
        year: 2020,
        color: 'Green',
        loadCapacity: 40,
        status: 'available' as const,
        insuranceNumber: 'INS345678',
        insuranceExpiry: '2024-08-31',
        registrationExpiry: '2024-07-31',
      },
    ];

    await db.insert(schema.vehicles).values(sampleVehicles);

    // Update drivers with vehicle assignments
    await db.update(schema.drivers)
      .set({ vehicleId: 'vehicle_1' })
      .where(eq(schema.drivers.id, 'driver_2'));

    await db.update(schema.drivers)
      .set({ vehicleId: 'vehicle_2' })
      .where(eq(schema.drivers.id, 'driver_3'));

    // Insert sample orders
    const sampleOrders = [
      {
        id: 'order_1',
        customerId: 'customer_1',
        driverId: 'driver_2',
        pickupAddress: 'Westlands Shopping Mall, Nairobi',
        pickupLatitude: -1.2676,
        pickupLongitude: 36.8108,
        deliveryAddress: 'Karen Shopping Centre, Nairobi',
        deliveryLatitude: -1.3197,
        deliveryLongitude: 36.6859,
        recipientName: 'Mary Wanjiku',
        recipientPhone: '+254712345678',
        packageType: 'documents' as const,
        packageDescription: 'Important business documents',
        specialInstructions: 'Call before delivery',
        status: 'in_transit' as const,
        priority: 'normal' as const,
        baseFare: 80,
        distanceFare: 350,
        surcharges: 20,
        totalAmount: 450,
        paymentMethod: 'mpesa' as const,
        paymentTerm: 'pay_now' as const,
        paymentStatus: 'paid' as const,
        paymentReference: 'MPESA123456',
        estimatedDistance: 12.5,
        estimatedDuration: 30,
        trackingCode: 'PKG001',
        actualPickupTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'order_2',
        customerId: 'customer_1',
        pickupAddress: 'CBD - Kencom House, Nairobi',
        pickupLatitude: -1.2921,
        pickupLongitude: 36.8219,
        deliveryAddress: 'Kilimani - Yaya Centre, Nairobi',
        deliveryLatitude: -1.2921,
        deliveryLongitude: 36.7856,
        recipientName: 'John Kamau',
        recipientPhone: '+254723456789',
        packageType: 'small' as const,
        packageDescription: 'Birthday gift',
        status: 'delivered' as const,
        priority: 'normal' as const,
        baseFare: 80,
        distanceFare: 220,
        surcharges: 20,
        totalAmount: 320,
        paymentMethod: 'mpesa' as const,
        paymentTerm: 'pay_now' as const,
        paymentStatus: 'paid' as const,
        paymentReference: 'MPESA789012',
        estimatedDistance: 8.2,
        estimatedDuration: 25,
        trackingCode: 'PKG002',
        actualPickupTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        actualDeliveryTime: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
        customerRating: 5,
        customerFeedback: 'Excellent service, very fast delivery!',
      },
      {
        id: 'order_3',
        customerId: 'customer_1',
        pickupAddress: 'Sarit Centre, Nairobi',
        pickupLatitude: -1.2676,
        pickupLongitude: 36.8108,
        deliveryAddress: 'Lavington Mall, Nairobi',
        deliveryLatitude: -1.2833,
        deliveryLongitude: 36.7833,
        recipientName: 'Sarah Njeri',
        recipientPhone: '+254745678901',
        packageType: 'electronics' as const,
        packageDescription: 'Smartphone',
        specialInstructions: 'Handle with care - fragile',
        status: 'pending' as const,
        priority: 'normal' as const,
        baseFare: 80,
        distanceFare: 400,
        surcharges: 20,
        totalAmount: 500,
        paymentMethod: 'cash' as const,
        paymentTerm: 'pay_on_delivery' as const,
        paymentStatus: 'pending' as const,
        estimatedDistance: 6.8,
        estimatedDuration: 20,
        trackingCode: 'PKG003',
      },
    ];

    await db.insert(schema.orders).values(sampleOrders);

    // Insert order timeline entries
    const timelineEntries = [
      {
        id: 'timeline_1',
        orderId: 'order_1',
        status: 'pending' as const,
        description: 'Order placed and finding driver',
        createdBy: 'user_1',
      },
      {
        id: 'timeline_2',
        orderId: 'order_1',
        status: 'assigned' as const,
        description: 'Driver assigned and heading to pickup',
        createdBy: 'user_2',
      },
      {
        id: 'timeline_3',
        orderId: 'order_1',
        status: 'picked_up' as const,
        description: 'Package picked up from sender',
        createdBy: 'user_2',
      },
      {
        id: 'timeline_4',
        orderId: 'order_1',
        status: 'in_transit' as const,
        description: 'Package is on the way to destination',
        createdBy: 'user_2',
      },
    ];

    await db.insert(schema.orderTimeline).values(timelineEntries);

    // Insert sample settings
    const sampleSettings = [
      {
        id: 'setting_1',
        key: 'base_fare',
        value: '80',
        type: 'number' as const,
        description: 'Base fare for all deliveries',
        category: 'pricing' as const,
        updatedBy: 'user_3',
      },
      {
        id: 'setting_2',
        key: 'per_km_rate',
        value: '11',
        type: 'number' as const,
        description: 'Rate per kilometer',
        category: 'pricing' as const,
        updatedBy: 'user_3',
      },
      {
        id: 'setting_3',
        key: 'minimum_charge',
        value: '150',
        type: 'number' as const,
        description: 'Minimum charge for any delivery',
        category: 'pricing' as const,
        updatedBy: 'user_3',
      },
      {
        id: 'setting_4',
        key: 'commission_rate',
        value: '15',
        type: 'number' as const,
        description: 'Commission rate percentage for drivers',
        category: 'pricing' as const,
        updatedBy: 'user_3',
      },
    ];

    await db.insert(schema.settings).values(sampleSettings);

    // Insert sample support queries
    const sampleQueries = [
      {
        id: 'query_1',
        userId: 'user_1',
        subject: 'Payment Issue',
        message: 'My payment was deducted but order was not confirmed',
        category: 'payment' as const,
        status: 'open' as const,
        priority: 'high' as const,
      },
      {
        id: 'query_2',
        userId: 'user_1',
        orderId: 'order_1',
        subject: 'Delivery Delay',
        message: 'My order is taking too long to arrive',
        category: 'delivery' as const,
        status: 'in_progress' as const,
        priority: 'medium' as const,
        assignedTo: 'user_3',
      },
    ];

    await db.insert(schema.supportQueries).values(sampleQueries);

    // Insert sample notifications
    const sampleNotifications = [
      {
        id: 'notif_1',
        userId: 'user_1',
        title: 'Order Confirmed',
        message: 'Your order PKG001 has been confirmed and a driver is being assigned.',
        type: 'order' as const,
        isRead: false,
      },
      {
        id: 'notif_2',
        userId: 'user_1',
        title: 'Driver Assigned',
        message: 'Peter Mwangi has been assigned to your order PKG001.',
        type: 'order' as const,
        isRead: true,
      },
    ];

    await db.insert(schema.notifications).values(sampleNotifications);

    console.log('Sample data inserted successfully');
  } catch (error) {
    console.error('Error inserting sample data:', error);
    throw error;
  }
}

// Export the database instance and schema
export { schema };
export default db;