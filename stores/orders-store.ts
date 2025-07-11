import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type OrderStatus = 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
export type PaymentMethod = 'mpesa' | 'card' | 'cash';
export type PaymentTerm = 'pay_now' | 'pay_on_delivery';
export type PackageType = 'documents' | 'small' | 'medium' | 'electronics' | 'clothing' | 'food';

export interface Order {
  id: string;
  clientId: string;
  driverId?: string;
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
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'paymentStatus'>) => string;
  updateOrderStatus: (orderId: string, status: OrderStatus, driverInfo?: Order['driverInfo']) => void;
  updatePaymentStatus: (orderId: string, paymentStatus: Order['paymentStatus']) => void;
  assignDriver: (orderId: string, driverId: string, driverInfo: Order['driverInfo']) => void;
  cancelOrder: (orderId: string, reason?: string) => void;
  sendSTKPush: (orderId: string) => void;
  getOrdersByClient: (clientId: string) => Order[];
  getOrdersByDriver: (driverId: string) => Order[];
  getPendingOrders: () => Order[];
  getOrderById: (orderId: string) => Order | undefined;
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
    clientId: 'client-1',
    driverId: 'driver-1',
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
    clientId: 'client-1',
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
    clientId: 'client-1',
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
    clientId: 'client-2',
    driverId: 'driver-2',
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
        if (currentOrders.length === 0) {
          set({ orders: sampleOrders });
        }
      },
      
      createOrder: (orderData) => {
        const orderId = `ORD-${Date.now()}`;
        const now = new Date().toISOString();
        
        const order: Order = {
          ...orderData,
          id: orderId,
          createdAt: now,
          updatedAt: now,
          paymentStatus: orderData.paymentTerm === 'pay_now' ? 'pending' : 'pending',
          timeline: createTimeline(orderData.status),
        };
        
        set((state) => ({
          orders: [...state.orders, order],
        }));
        
        return orderId;
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
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);