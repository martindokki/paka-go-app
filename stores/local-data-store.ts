import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Mock data for drivers
export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  totalOrders: number;
  totalEarnings: number;
  vehicleInfo: string;
  status: 'online' | 'offline' | 'busy';
  createdAt: string;
  location?: {
    lat: number;
    lng: number;
  };
}

// Mock data for admin stats
export interface AdminStats {
  totalOrders: number;
  totalDrivers: number;
  totalCustomers: number;
  totalRevenue: number;
  activeOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averageRating: number;
  ordersToday: number;
  revenueToday: number;
  newCustomersToday: number;
  activeDrivers: number;
}

interface LocalDataState {
  drivers: Driver[];
  adminStats: AdminStats;
  initializeData: () => void;
  updateDriverStatus: (driverId: string, status: Driver['status']) => void;
  getDriverById: (driverId: string) => Driver | undefined;
  getAvailableDrivers: () => Driver[];
}

const mockDrivers: Driver[] = [
  {
    id: 'driver_1',
    name: 'Peter Mwangi',
    email: 'peter@example.com',
    phone: '+254798765432',
    rating: 4.8,
    totalOrders: 156,
    totalEarnings: 45600,
    vehicleInfo: 'Red Honda CB 150R - KCA 123D',
    status: 'online',
    createdAt: '2024-01-10T08:00:00Z',
    location: { lat: -1.2921, lng: 36.8219 }
  },
  {
    id: 'driver_2',
    name: 'Grace Akinyi',
    email: 'grace@example.com',
    phone: '+254734567890',
    rating: 4.9,
    totalOrders: 203,
    totalEarnings: 67800,
    vehicleInfo: 'Blue Yamaha YBR 125 - KCB 456E',
    status: 'online',
    createdAt: '2024-01-05T09:30:00Z',
    location: { lat: -1.2864, lng: 36.8172 }
  },
  {
    id: 'driver_3',
    name: 'James Kiprotich',
    email: 'james@example.com',
    phone: '+254767890123',
    rating: 4.7,
    totalOrders: 89,
    totalEarnings: 23400,
    vehicleInfo: 'Green Bajaj Boxer - KCC 789F',
    status: 'offline',
    createdAt: '2024-02-01T11:15:00Z',
    location: { lat: -1.3032, lng: 36.8073 }
  }
];

const mockAdminStats: AdminStats = {
  totalOrders: 1247,
  totalDrivers: 45,
  totalCustomers: 892,
  totalRevenue: 456780,
  activeOrders: 23,
  completedOrders: 1198,
  cancelledOrders: 26,
  averageRating: 4.7,
  ordersToday: 34,
  revenueToday: 12450,
  newCustomersToday: 7,
  activeDrivers: 28
};

export const useLocalDataStore = create<LocalDataState>()(
  persist(
    (set, get) => ({
      drivers: [],
      adminStats: mockAdminStats,
      
      initializeData: () => {
        const currentDrivers = get().drivers;
        if (currentDrivers.length === 0) {
          set({ drivers: mockDrivers });
        }
      },
      
      updateDriverStatus: (driverId: string, status: Driver['status']) => {
        set((state) => ({
          drivers: state.drivers.map((driver) =>
            driver.id === driverId ? { ...driver, status } : driver
          ),
        }));
      },
      
      getDriverById: (driverId: string) => {
        return get().drivers.find((driver) => driver.id === driverId);
      },
      
      getAvailableDrivers: () => {
        return get().drivers.filter((driver) => driver.status === 'online');
      },
    }),
    {
      name: 'local-data-storage',
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