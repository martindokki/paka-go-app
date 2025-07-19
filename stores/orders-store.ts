import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { ParcelService } from '@/services/parcel-service';
import { Parcel, Delivery } from '@/services/supabase';

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
  isLoading: boolean;
  error: string | null;
  createOrder: (orderData: any) => Promise<string>;
  updateOrderStatus: (orderId: string, status: OrderStatus, driverInfo?: Order['driverInfo']) => Promise<void>;
  updatePaymentStatus: (orderId: string, paymentStatus: Order['paymentStatus']) => void;
  assignDriver: (orderId: string, driverId: string, driverInfo: Order['driverInfo']) => Promise<void>;
  cancelOrder: (orderId: string, reason?: string) => void;
  sendSTKPush: (orderId: string) => void;
  getOrdersByClient: (clientId: string) => Promise<void>;
  getOrdersByDriver: (driverId: string) => Promise<void>;
  getAllOrders: () => Promise<void>;
  getPendingOrders: () => Order[];
  getOrderById: (orderId: string) => Order | undefined;
  getOrderByTrackingCode: (trackingCode: string) => Order | undefined;
  initializeSampleData: () => void;
  clearError: () => void;
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
      isLoading: false,
      error: null,
      
      clearError: () => set({ error: null }),
      
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
      
      createOrder: async (orderData) => {
        set({ isLoading: true, error: null });
        try {
          console.log("Creating order with data:", orderData);
          
          const parcelData = {
            sender_id: orderData.customerId || orderData.clientId,
            receiver_name: orderData.recipientName,
            receiver_phone: orderData.recipientPhone,
            pickup_address: orderData.pickupAddress || orderData.from,
            dropoff_address: orderData.deliveryAddress || orderData.to,
            parcel_description: orderData.packageDescription,
            weight_kg: orderData.weight || 1,
          };

          const { data: parcel, error } = await ParcelService.createParcel(parcelData);
          
          if (error || !parcel) {
            const errorMessage = error instanceof Error 
              ? error.message 
              : typeof error === 'string' 
              ? error 
              : typeof error === 'object' && error && 'message' in error
              ? (error as any).message
              : 'Failed to create parcel';
            throw new Error(errorMessage);
          }

          // Convert Supabase parcel to local Order format
          const order: Order = {
            id: parcel.id,
            trackingCode: `TRK${parcel.id.slice(-8).toUpperCase()}`,
            clientId: parcel.sender_id,
            from: parcel.pickup_address,
            to: parcel.dropoff_address,
            packageType: orderData.packageType || 'documents',
            packageDescription: parcel.parcel_description || '',
            recipientName: parcel.receiver_name,
            recipientPhone: parcel.receiver_phone || '',
            specialInstructions: orderData.specialInstructions || '',
            status: (parcel.status === 'in_transit' ? 'in_transit' : parcel.status) as OrderStatus,
            paymentMethod: orderData.paymentMethod || 'mpesa',
            paymentTerm: orderData.paymentTerm || 'pay_now',
            paymentStatus: 'pending',
            price: orderData.price || 0,
            distance: orderData.estimatedDistance ? `${orderData.estimatedDistance.toFixed(1)} km` : undefined,
            estimatedTime: orderData.estimatedDuration ? `${orderData.estimatedDuration}-${orderData.estimatedDuration + 10} mins` : undefined,
            createdAt: parcel.created_at,
            updatedAt: parcel.created_at,
            timeline: createTimeline(parcel.status as OrderStatus),
          };
          
          set((state) => ({
            orders: [...state.orders, order],
            isLoading: false,
          }));
          
          console.log("Order created successfully with ID:", parcel.id);
          return parcel.id;
        } catch (error: any) {
          console.error("Error creating order:", error);
          const errorMessage = error instanceof Error 
            ? error.message 
            : typeof error === 'string' 
            ? error 
            : typeof error === 'object' && error && 'message' in error
            ? (error as any).message
            : 'Unknown error';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },
      
      updateOrderStatus: async (orderId, status, driverInfo) => {
        set({ isLoading: true, error: null });
        try {
          const supabaseStatus: 'pending' | 'in_transit' | 'delivered' | 'cancelled' = 
            status === 'assigned' ? 'pending' : 
            status === 'picked_up' ? 'in_transit' : 
            status === 'in_transit' ? 'in_transit' :
            status === 'delivered' ? 'delivered' :
            status === 'cancelled' ? 'cancelled' : 'pending';
          const { data, error } = await ParcelService.updateParcelStatus(orderId, supabaseStatus);
          
          if (error) {
            const errorMessage = error instanceof Error 
              ? error.message 
              : typeof error === 'string' 
              ? error 
              : typeof error === 'object' && error && 'message' in error
              ? (error as any).message
              : 'Failed to update status';
            throw new Error(errorMessage);
          }

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
            isLoading: false,
          }));
        } catch (error: any) {
          console.error("Error updating order status:", error);
          const errorMessage = error instanceof Error 
            ? error.message 
            : typeof error === 'string' 
            ? error 
            : typeof error === 'object' && error && 'message' in error
            ? (error as any).message
            : 'Failed to update order status';
          set({ error: errorMessage, isLoading: false });
        }
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
      
      assignDriver: async (orderId, driverId, driverInfo) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await ParcelService.assignDriverToParcel(orderId, driverId);
          
          if (error) {
            const errorMessage = error instanceof Error 
              ? error.message 
              : typeof error === 'string' 
              ? error 
              : 'Failed to assign driver';
            throw new Error(errorMessage);
          }

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
            isLoading: false,
          }));
        } catch (error: any) {
          console.error("Error assigning driver:", error);
          const errorMessage = error instanceof Error 
            ? error.message 
            : typeof error === 'string' 
            ? error 
            : typeof error === 'object' && error && 'message' in error
            ? (error as any).message
            : 'Failed to assign driver';
          set({ error: errorMessage, isLoading: false });
        }
      },
      
      getOrdersByClient: async (clientId) => {
        set({ isLoading: true, error: null });
        try {
          const { data: parcels, error } = await ParcelService.getUserParcels(clientId);
          
          if (error) {
            const errorMessage = error instanceof Error 
              ? error.message 
              : typeof error === 'string' 
              ? error 
              : 'Failed to fetch user parcels';
            throw new Error(errorMessage);
          }

          const orders: Order[] = (parcels || []).map((parcel: any) => ({
            id: parcel.id,
            trackingCode: `TRK${parcel.id.slice(-8).toUpperCase()}`,
            clientId: parcel.sender_id,
            driverId: parcel.deliveries?.[0]?.driver_id,
            from: parcel.pickup_address,
            to: parcel.dropoff_address,
            packageType: 'documents' as PackageType,
            packageDescription: parcel.parcel_description || '',
            recipientName: parcel.receiver_name,
            recipientPhone: parcel.receiver_phone || '',
            status: parcel.status as OrderStatus,
            paymentMethod: 'mpesa' as PaymentMethod,
            paymentTerm: 'pay_now' as PaymentTerm,
            paymentStatus: 'pending' as Order['paymentStatus'],
            price: 500,
            createdAt: parcel.created_at,
            updatedAt: parcel.created_at,
            timeline: createTimeline(parcel.status as OrderStatus),
            driverInfo: parcel.deliveries?.[0]?.driver ? {
              name: parcel.deliveries[0].driver.full_name,
              phone: parcel.deliveries[0].driver.phone_number || '',
              rating: 4.5,
            } : undefined,
          }));

          set({ orders, isLoading: false });
        } catch (error: any) {
          console.error("Error fetching user orders:", error);
          const errorMessage = error instanceof Error 
            ? error.message 
            : typeof error === 'string' 
            ? error 
            : 'Failed to fetch user orders';
          set({ error: errorMessage, isLoading: false });
        }
      },
      
      getOrdersByDriver: async (driverId) => {
        set({ isLoading: true, error: null });
        try {
          const { data: deliveries, error } = await ParcelService.getDriverDeliveries(driverId);
          
          if (error) {
            const errorMessage = error instanceof Error 
              ? error.message 
              : typeof error === 'string' 
              ? error 
              : 'Failed to fetch driver deliveries';
            throw new Error(errorMessage);
          }

          const orders: Order[] = (deliveries || []).map((delivery: any) => ({
            id: delivery.parcel.id,
            trackingCode: `TRK${delivery.parcel.id.slice(-8).toUpperCase()}`,
            clientId: delivery.parcel.sender_id,
            driverId: delivery.driver_id,
            customerName: delivery.parcel.sender?.full_name,
            customerPhone: delivery.parcel.sender?.phone_number,
            from: delivery.parcel.pickup_address,
            to: delivery.parcel.dropoff_address,
            packageType: 'documents' as PackageType,
            packageDescription: delivery.parcel.parcel_description || '',
            recipientName: delivery.parcel.receiver_name,
            recipientPhone: delivery.parcel.receiver_phone || '',
            status: delivery.parcel.status as OrderStatus,
            paymentMethod: 'mpesa' as PaymentMethod,
            paymentTerm: 'pay_now' as PaymentTerm,
            paymentStatus: 'pending' as Order['paymentStatus'],
            price: 500,
            createdAt: delivery.parcel.created_at,
            updatedAt: delivery.parcel.created_at,
            timeline: createTimeline(delivery.parcel.status as OrderStatus),
          }));

          set({ orders, isLoading: false });
        } catch (error: any) {
          console.error("Error fetching driver orders:", error);
          const errorMessage = error instanceof Error 
            ? error.message 
            : typeof error === 'string' 
            ? error 
            : 'Failed to fetch driver orders';
          set({ error: errorMessage, isLoading: false });
        }
      },

      getAllOrders: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data: parcels, error } = await ParcelService.getAllParcels();
          
          if (error) {
            const errorMessage = error && typeof error === 'object' && 'message' in error 
              ? (error as any).message 
              : 'Failed to fetch all parcels';
            throw new Error(errorMessage);
          }

          const orders: Order[] = (parcels || []).map((parcel: any) => ({
            id: parcel.id,
            trackingCode: `TRK${parcel.id.slice(-8).toUpperCase()}`,
            clientId: parcel.sender_id,
            driverId: parcel.deliveries?.[0]?.driver_id,
            customerName: parcel.sender?.full_name,
            customerPhone: parcel.sender?.phone_number,
            from: parcel.pickup_address,
            to: parcel.dropoff_address,
            packageType: 'documents' as PackageType,
            packageDescription: parcel.parcel_description || '',
            recipientName: parcel.receiver_name,
            recipientPhone: parcel.receiver_phone || '',
            status: parcel.status as OrderStatus,
            paymentMethod: 'mpesa' as PaymentMethod,
            paymentTerm: 'pay_now' as PaymentTerm,
            paymentStatus: 'pending' as Order['paymentStatus'],
            price: 500,
            createdAt: parcel.created_at,
            updatedAt: parcel.created_at,
            timeline: createTimeline(parcel.status as OrderStatus),
            driverInfo: parcel.deliveries?.[0]?.driver ? {
              name: parcel.deliveries[0].driver.full_name,
              phone: parcel.deliveries[0].driver.phone_number || '',
              rating: 4.5,
            } : undefined,
          }));

          set({ orders, isLoading: false });
        } catch (error: any) {
          console.error("Error fetching all orders:", error);
          const errorMessage = error && typeof error === 'object' && 'message' in error 
            ? (error as any).message 
            : 'Failed to fetch all orders';
          set({ error: errorMessage, isLoading: false });
        }
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