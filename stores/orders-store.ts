import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export type OrderStatus = 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
export type PaymentMethod = 'mpesa' | 'card' | 'cash';
export type PaymentTerm = 'pay_now' | 'pay_on_delivery';
export type PackageType = 'documents' | 'small' | 'medium' | 'electronics' | 'clothing' | 'food';

export interface Order {
  id: string;
  trackingCode?: string;
  clientId: string;
  driverId?: string;
  customerName?: string;
  customerPhone?: string;
  driverName?: string;
  from: string;
  to: string;
  fromCoords?: { lat: number; lng: number };
  toCoords?: { lat: number; lng: number };
  packageType: PackageType;
  packageDescription?: string;
  recipientName: string;
  recipientPhone: string;
  specialInstructions?: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentTerm: PaymentTerm;
  paymentStatus: 'pending' | 'paid' | 'failed';
  price: number;
  distance?: string;
  estimatedTime?: string;
  createdAt: string;
  updatedAt: string;
  timeline: {
    status: OrderStatus;
    time: string;
    description: string;
    completed: boolean;
  }[];
  driverInfo?: {
    name: string;
    phone: string;
    rating: number;
    vehicleInfo?: string;
  };
}

interface OrdersState {
  orders: Order[];
  createOrder: (orderData: any) => string;
  updateOrderStatus: (orderId: string, status: OrderStatus, driverInfo?: Order['driverInfo']) => void;
  updatePaymentStatus: (orderId: string, paymentStatus: Order['paymentStatus']) => void;
  assignDriver: (orderId: string, driverId: string, driverInfo: Order['driverInfo']) => void;
  cancelOrder: (orderId: string, reason?: string) => void;
  sendSTKPush: (orderId: string) => void;
  getOrdersByClient: (clientId: string) => Order[];
  getOrdersByDriver: (driverId: string) => Order[];
  getPendingOrders: () => Order[];
  getOrderById: (orderId: string) => Order | undefined;
  getOrderByTrackingCode: (trackingCode: string) => Order | undefined;
  initializeSampleData: () => void;
}

const createTimeline = (status: OrderStatus): Order['timeline'] => {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });

  const baseTimeline = [
    {
      status: 'pending' as OrderStatus,
      time: timeString,
      description: 'Order placed and finding driver',
      completed: true,
    },
  ];

  if (status !== 'pending') {
    baseTimeline.push({
      status: 'assigned' as OrderStatus,
      time: new Date(now.getTime() + 5 * 60000).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      description: 'Driver assigned and heading to pickup',
      completed: status === 'assigned' || status === 'picked_up' || status === 'in_transit' || status === 'delivered',
    });
  }

  baseTimeline.push(
    {
      status: 'picked_up' as OrderStatus,
      time: `Est. ${new Date(now.getTime() + 15 * 60000).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })}`,
      description: 'Package picked up from sender',
      completed: ['picked_up', 'in_transit', 'delivered'].includes(status),
    },
    {
      status: 'in_transit' as OrderStatus,
      time: `Est. ${new Date(now.getTime() + 20 * 60000).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })}`,
      description: 'Package is on the way to destination',
      completed: ['in_transit', 'delivered'].includes(status),
    },
    {
      status: 'delivered' as OrderStatus,
      time: `Est. ${new Date(now.getTime() + 35 * 60000).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })}`,
      description: 'Package delivered to recipient',
      completed: status === 'delivered',
    }
  );

  return baseTimeline;
};

// Sample data for testing
const sampleOrders: Order[] = [
  {
    id: 'ORD-001',
    trackingCode: 'TRK12345ABC',
    clientId: '1',
    driverId: '2',
    from: 'Westlands Shopping Mall',
    to: 'Karen Shopping Centre',
    packageType: 'documents',
    packageDescription: 'Important business documents',
    recipientName: 'Mary Wanjiku',
    recipientPhone: '+254712345678',
    specialInstructions: 'Call before delivery',
    status: 'in_transit',
    paymentMethod: 'mpesa',
    paymentTerm: 'pay_now',
    paymentStatus: 'paid',
    price: 450,
    distance: '12.5 km',
    estimatedTime: '25-35 mins',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    timeline: createTimeline('in_transit'),
    driverInfo: {
      name: 'Peter Mwangi',
      phone: '+254798765432',
      rating: 4.8,
      vehicleInfo: 'Red Honda CB 150R - KCA 123D',
    },
  },
  {
    id: 'ORD-002',
    trackingCode: 'TRK67890DEF',
    clientId: '1',
    from: 'CBD - Kencom House',
    to: 'Kilimani - Yaya Centre',
    packageType: 'small',
    packageDescription: 'Birthday gift',
    recipientName: 'John Kamau',
    recipientPhone: '+254723456789',
    status: 'delivered',
    paymentMethod: 'mpesa',
    paymentTerm: 'pay_now',
    paymentStatus: 'paid',
    price: 320,
    distance: '8.2 km',
    estimatedTime: '20-30 mins',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    timeline: createTimeline('delivered'),
    driverInfo: {
      name: 'Grace Akinyi',
      phone: '+254734567890',
      rating: 4.9,
      vehicleInfo: 'Blue Yamaha YBR 125 - KCB 456E',
    },
  },
  {
    id: 'ORD-003',
    trackingCode: 'TRKABCDE123',
    clientId: '1',
    from: 'Sarit Centre',
    to: 'Lavington Mall',
    packageType: 'electronics',
    packageDescription: 'Smartphone',
    recipientName: 'Sarah Njeri',
    recipientPhone: '+254745678901',
    specialInstructions: 'Handle with care - fragile',
    status: 'pending',
    paymentMethod: 'cash',
    paymentTerm: 'pay_on_delivery',
    paymentStatus: 'pending',
    price: 500,
    distance: '6.8 km',
    estimatedTime: '15-25 mins',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    timeline: createTimeline('pending'),
  },
  {
    id: 'ORD-004',
    trackingCode: 'TRKFGH456IJK',
    clientId: '2',
    driverId: '2',
    from: 'Nakumatt Junction',
    to: 'Gigiri - UN Offices',
    packageType: 'documents',
    packageDescription: 'Legal documents',
    recipientName: 'David Ochieng',
    recipientPhone: '+254756789012',
    status: 'assigned',
    paymentMethod: 'card',
    paymentTerm: 'pay_now',
    paymentStatus: 'paid',
    price: 600,
    distance: '15.3 km',
    estimatedTime: '30-40 mins',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    timeline: createTimeline('assigned'),
    driverInfo: {
      name: 'James Kiprotich',
      phone: '+254767890123',
      rating: 4.7,
      vehicleInfo: 'Green Bajaj Boxer - KCC 789F',
    },
  },
];

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      
      initializeSampleData: () => {
        const currentOrders = get().orders;
        console.log("Initializing sample data. Current orders count:", currentOrders.length);
        if (currentOrders.length === 0) {
          console.log("Adding sample orders");
          set({ orders: sampleOrders });
        } else {
          console.log("Sample data already exists, skipping initialization");
        }
      },
      
      createOrder: (orderData) => {
        try {
          const orderId = orderData.id || `ORD-${Date.now()}`;
          const now = new Date().toISOString();
          
          console.log("Creating order in store with data:", orderData);
          
          const order: Order = {
            id: orderId,
            trackingCode: orderData.trackingCode,
            clientId: orderData.customerId || orderData.clientId || 'unknown_user',
            from: orderData.pickupAddress || orderData.from || '',
            to: orderData.deliveryAddress || orderData.to || '',
            fromCoords: orderData.pickupLatitude && orderData.pickupLongitude ? {
              lat: orderData.pickupLatitude,
              lng: orderData.pickupLongitude
            } : undefined,
            toCoords: orderData.deliveryLatitude && orderData.deliveryLongitude ? {
              lat: orderData.deliveryLatitude,
              lng: orderData.deliveryLongitude
            } : undefined,
            packageType: orderData.packageType || 'documents',
            packageDescription: orderData.packageDescription || '',
            recipientName: orderData.recipientName || '',
            recipientPhone: orderData.recipientPhone || '',
            specialInstructions: orderData.specialInstructions || '',
            status: orderData.status || 'pending',
            paymentMethod: orderData.paymentMethod || 'mpesa',
            paymentTerm: orderData.paymentTerm || 'pay_now',
            paymentStatus: orderData.paymentTerm === 'pay_now' ? 'pending' : 'pending',
            price: orderData.price || 0,
            distance: orderData.estimatedDistance ? `${orderData.estimatedDistance.toFixed(1)} km` : undefined,
            estimatedTime: orderData.estimatedDuration ? `${orderData.estimatedDuration}-${orderData.estimatedDuration + 10} mins` : undefined,
            createdAt: orderData.createdAt || now,
            updatedAt: now,
            timeline: createTimeline(orderData.status || 'pending'),
          };
          
          console.log("Created order object:", order);
          
          set((state) => {
            const newOrders = [...state.orders, order];
            console.log("Updated orders array length:", newOrders.length);
            return { orders: newOrders };
          });
          
          console.log("Order created successfully with ID:", orderId);
          return orderId;
        } catch (error) {
          console.error("Error creating order:", error);
          throw error;
        }
      },
      
      updateOrderStatus: (orderId, status, driverInfo) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status,
                  updatedAt: new Date().toISOString(),
                  timeline: createTimeline(status),
                  ...(driverInfo && { driverInfo }),
                }
              : order
          ),
        }));
      },
      
      updatePaymentStatus: (orderId, paymentStatus) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  paymentStatus,
                  updatedAt: new Date().toISOString(),
                }
              : order
          ),
        }));
      },
      
      assignDriver: (orderId, driverId, driverInfo) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  driverId,
                  driverInfo,
                  status: 'assigned' as OrderStatus,
                  updatedAt: new Date().toISOString(),
                  timeline: createTimeline('assigned'),
                }
              : order
          ),
        }));
      },
      
      getOrdersByClient: (clientId) => {
        return get().orders.filter((order) => order.clientId === clientId);
      },
      
      getOrdersByDriver: (driverId) => {
        return get().orders.filter((order) => order.driverId === driverId);
      },
      
      getPendingOrders: () => {
        return get().orders.filter((order) => order.status === 'pending');
      },
      
      getOrderById: (orderId) => {
        return get().orders.find((order) => order.id === orderId);
      },
      
      getOrderByTrackingCode: (trackingCode) => {
        return get().orders.find((order) => order.trackingCode === trackingCode);
      },
      
      cancelOrder: (orderId, reason) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: 'cancelled' as OrderStatus,
                  updatedAt: new Date().toISOString(),
                  timeline: [...order.timeline, {
                    status: 'cancelled' as OrderStatus,
                    time: new Date().toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    }),
                    description: reason || 'Order cancelled',
                    completed: true,
                  }],
                }
              : order
          ),
        }));
      },
      
      sendSTKPush: (orderId) => {
        // Mock STK push - in real app, this would call M-Pesa API
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  paymentStatus: 'paid' as Order['paymentStatus'],
                  updatedAt: new Date().toISOString(),
                }
              : order
          ),
        }));
      },
    }),
    {
      name: 'orders-storage',
      storage: createJSONStorage(() => {
        if (Platform.OS === 'web') {
          return {
            getItem: (name: string) => {
              try {
                return localStorage.getItem(name);
              } catch {
                return null;
              }
            },
            setItem: (name: string, value: string) => {
              try {
                localStorage.setItem(name, value);
              } catch {
                // Ignore storage errors on web
              }
            },
            removeItem: (name: string) => {
              try {
                localStorage.removeItem(name);
              } catch {
                // Ignore storage errors on web
              }
            },
          };
        }
        return AsyncStorage;
      }),
    }
  )
);