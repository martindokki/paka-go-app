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
  getOrdersByClient: (clientId: string) => Order[];
  fetchOrdersByClient: (clientId: string) => Promise<void>;
  getOrdersByDriver: (driverId: string) => Promise<void>;
  getAllOrders: () => Promise<void>;
  getPendingOrders: () => Order[];
  getOrderById: (orderId: string) => Order | undefined;
  getOrderByTrackingCode: (trackingCode: string) => Order | undefined;

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



export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [], // Production ready - no mock data
      isLoading: false,
      error: null,
      
      clearError: () => set({ error: null }),
      

      
      createOrder: async (orderData) => {
        set({ isLoading: true, error: null });
        try {
          console.log("Creating order with data:", orderData);
          
          // Try to create in Supabase first, but don't fail if it doesn't work
          let supabaseOrderId = null;
          try {
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
            if (parcel && !error) {
              supabaseOrderId = parcel.id;
              console.log("Order created in Supabase with ID:", supabaseOrderId);
            } else {
              console.log("Supabase creation failed, continuing with local order:", error);
            }
          } catch (supabaseError) {
            console.log("Supabase not available, creating local order:", supabaseError);
          }

          // Create local order regardless of Supabase success/failure
          const orderId = supabaseOrderId || orderData.id || `ORD-${Date.now()}`;
          const trackingCode = orderData.trackingCode || `TRK${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
          
          const order: Order = {
            id: orderId,
            trackingCode,
            clientId: orderData.customerId || orderData.clientId,
            from: orderData.pickupAddress || orderData.from,
            to: orderData.deliveryAddress || orderData.to,
            packageType: orderData.packageType || 'documents',
            packageDescription: orderData.packageDescription || '',
            recipientName: orderData.recipientName,
            recipientPhone: orderData.recipientPhone || '',
            specialInstructions: orderData.specialInstructions || '',
            status: 'pending',
            paymentMethod: orderData.paymentMethod || 'mpesa',
            paymentTerm: orderData.paymentTerm || 'pay_now',
            paymentStatus: 'pending',
            price: orderData.price || 0,
            distance: orderData.estimatedDistance ? `${orderData.estimatedDistance.toFixed(1)} km` : undefined,
            estimatedTime: orderData.estimatedDuration ? `${orderData.estimatedDuration}-${orderData.estimatedDuration + 10} mins` : undefined,
            createdAt: orderData.createdAt || new Date().toISOString(),
            updatedAt: orderData.createdAt || new Date().toISOString(),
            timeline: createTimeline('pending'),
          };
          
          set((state) => ({
            orders: [...state.orders, order],
            isLoading: false,
          }));
          
          console.log("Order created successfully with ID:", orderId);
          return orderId;
        } catch (error: any) {
          console.error("Error creating order:", error);
          const errorMessage = error instanceof Error 
            ? error.message 
            : typeof error === 'string' 
            ? error 
            : typeof error === 'object' && error && 'message' in error
            ? String((error as { message: unknown }).message)
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
              ? String((error as { message: unknown }).message)
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
            ? String((error as { message: unknown }).message)
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
            ? String((error as { message: unknown }).message)
            : 'Failed to assign driver';
          set({ error: errorMessage, isLoading: false });
        }
      },
      
      getOrdersByClient: (clientId) => {
        return get().orders.filter((order) => order.clientId === clientId);
      },

      fetchOrdersByClient: async (clientId) => {
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
            price: parcel.price || 500,
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
            price: delivery.parcel.price || 500,
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
              ? String((error as { message: unknown }).message) 
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
            price: parcel.price || 500,
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
            ? String((error as { message: unknown }).message) 
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