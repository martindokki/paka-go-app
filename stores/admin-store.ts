import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  onTransitOrders: number;
  cancelledOrders: number;
  totalCustomers: number;
  totalDrivers: number;
  activeDrivers: number;
  averageOrdersPerMinute: number;
  averageETA: number;
  newUsersDaily: number;
  newUsersWeekly: number;
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'suspended' | 'active';
  rating: number;
  totalDeliveries: number;
  earnings: number;
  vehicleId?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  type: 'motorcycle' | 'bicycle' | 'car' | 'van';
  loadCapacity: number;
  status: 'available' | 'assigned' | 'maintenance';
  driverId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface SupportQuery {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  response?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSettings {
  baseFare: number;
  perKmRate: number;
  minimumCharge: number;
  fragileItemSurcharge: number;
  insuranceSurcharge: number;
  afterHoursSurcharge: number;
  weekendSurcharge: number;
  waitTimeRate: number;
  commissionRate: number;
  maintenanceMode: boolean;
}

export interface ActivityLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

interface AdminState {
  // Data
  stats: AdminStats | null;
  drivers: Driver[];
  vehicles: Vehicle[];
  customers: Customer[];
  supportQueries: SupportQuery[];
  settings: AdminSettings | null;
  activityLogs: ActivityLog[];
  
  // UI State
  isLoading: boolean;
  error: string | null;
  selectedDriver: Driver | null;
  selectedVehicle: Vehicle | null;
  selectedCustomer: Customer | null;
  selectedQuery: SupportQuery | null;
  
  // Actions
  fetchStats: () => Promise<void>;
  fetchDrivers: () => Promise<void>;
  fetchVehicles: () => Promise<void>;
  fetchCustomers: () => Promise<void>;
  fetchSupportQueries: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  fetchActivityLogs: () => Promise<void>;
  
  // Driver Management
  approveDriver: (driverId: string) => Promise<boolean>;
  suspendDriver: (driverId: string) => Promise<boolean>;
  assignVehicleToDriver: (driverId: string, vehicleId: string) => Promise<boolean>;
  
  // Vehicle Management
  createVehicle: (vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  deleteVehicle: (vehicleId: string) => Promise<boolean>;
  
  // Customer Management
  suspendCustomer: (customerId: string) => Promise<boolean>;
  deleteCustomer: (customerId: string) => Promise<boolean>;
  
  // Support Management
  assignQuery: (queryId: string, adminId: string) => Promise<boolean>;
  respondToQuery: (queryId: string, response: string) => Promise<boolean>;
  updateQueryStatus: (queryId: string, status: SupportQuery['status']) => Promise<boolean>;
  
  // Settings
  updateSettings: (settings: Partial<AdminSettings>) => Promise<boolean>;
  
  // Notifications
  sendNotification: (type: 'all_users' | 'all_drivers' | 'specific', message: string, userIds?: string[]) => Promise<boolean>;
  
  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setSelectedDriver: (driver: Driver | null) => void;
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  setSelectedCustomer: (customer: Customer | null) => void;
  setSelectedQuery: (query: SupportQuery | null) => void;
}

export const useAdminStore = create<AdminState>()((set, get) => ({
  // Initial state
  stats: null,
  drivers: [],
  vehicles: [],
  customers: [],
  supportQueries: [],
  settings: null,
  activityLogs: [],
  isLoading: false,
  error: null,
  selectedDriver: null,
  selectedVehicle: null,
  selectedCustomer: null,
  selectedQuery: null,
  
  // Fetch actions
  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      // Mock data for now - replace with actual API call
      const mockStats: AdminStats = {
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
      set({ stats: mockStats, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch stats', isLoading: false });
    }
  },
  
  fetchDrivers: async () => {
    set({ isLoading: true, error: null });
    try {
      // Mock data - replace with actual API call
      const mockDrivers: Driver[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+254712345678',
          status: 'active',
          rating: 4.8,
          totalDeliveries: 150,
          earnings: 45000,
          vehicleId: 'v1',
          location: { latitude: -1.2921, longitude: 36.8219 },
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-20T15:30:00Z',
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+254723456789',
          status: 'pending',
          rating: 0,
          totalDeliveries: 0,
          earnings: 0,
          createdAt: '2024-01-20T09:00:00Z',
          updatedAt: '2024-01-20T09:00:00Z',
        },
      ];
      set({ drivers: mockDrivers, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch drivers', isLoading: false });
    }
  },
  
  fetchVehicles: async () => {
    set({ isLoading: true, error: null });
    try {
      const mockVehicles: Vehicle[] = [
        {
          id: 'v1',
          plateNumber: 'KCA 123A',
          type: 'motorcycle',
          loadCapacity: 50,
          status: 'assigned',
          driverId: '1',
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z',
        },
        {
          id: 'v2',
          plateNumber: 'KCB 456B',
          type: 'bicycle',
          loadCapacity: 20,
          status: 'available',
          createdAt: '2024-01-12T10:00:00Z',
          updatedAt: '2024-01-12T10:00:00Z',
        },
      ];
      set({ vehicles: mockVehicles, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch vehicles', isLoading: false });
    }
  },
  
  fetchCustomers: async () => {
    set({ isLoading: true, error: null });
    try {
      const mockCustomers: Customer[] = [
        {
          id: 'c1',
          name: 'Alice Johnson',
          email: 'alice@example.com',
          phone: '+254734567890',
          totalOrders: 25,
          totalSpent: 7500,
          status: 'active',
          createdAt: '2023-12-01T10:00:00Z',
          updatedAt: '2024-01-20T10:00:00Z',
        },
        {
          id: 'c2',
          name: 'Bob Wilson',
          email: 'bob@example.com',
          phone: '+254745678901',
          totalOrders: 12,
          totalSpent: 3600,
          status: 'active',
          createdAt: '2024-01-05T10:00:00Z',
          updatedAt: '2024-01-18T10:00:00Z',
        },
      ];
      set({ customers: mockCustomers, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch customers', isLoading: false });
    }
  },
  
  fetchSupportQueries: async () => {
    set({ isLoading: true, error: null });
    try {
      const mockQueries: SupportQuery[] = [
        {
          id: 'q1',
          userId: 'c1',
          userName: 'Alice Johnson',
          subject: 'Payment Issue',
          message: 'My payment was deducted but order was not confirmed',
          status: 'open',
          priority: 'high',
          createdAt: '2024-01-20T14:30:00Z',
          updatedAt: '2024-01-20T14:30:00Z',
        },
        {
          id: 'q2',
          userId: 'c2',
          userName: 'Bob Wilson',
          subject: 'Delivery Delay',
          message: 'My order is taking too long to arrive',
          status: 'in_progress',
          priority: 'medium',
          assignedTo: 'admin1',
          createdAt: '2024-01-20T12:00:00Z',
          updatedAt: '2024-01-20T13:00:00Z',
        },
      ];
      set({ supportQueries: mockQueries, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch support queries', isLoading: false });
    }
  },
  
  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const mockSettings: AdminSettings = {
        baseFare: 80,
        perKmRate: 11,
        minimumCharge: 150,
        fragileItemSurcharge: 20,
        insuranceSurcharge: 20,
        afterHoursSurcharge: 10,
        weekendSurcharge: 10,
        waitTimeRate: 5,
        commissionRate: 15,
        maintenanceMode: false,
      };
      set({ settings: mockSettings, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch settings', isLoading: false });
    }
  },
  
  fetchActivityLogs: async () => {
    set({ isLoading: true, error: null });
    try {
      const mockLogs: ActivityLog[] = [
        {
          id: 'l1',
          adminId: 'admin1',
          adminName: 'Admin User',
          action: 'Driver Approved',
          details: 'Approved driver John Doe (ID: 1)',
          ipAddress: '192.168.1.1',
          timestamp: '2024-01-20T15:30:00Z',
        },
        {
          id: 'l2',
          adminId: 'admin1',
          adminName: 'Admin User',
          action: 'Settings Updated',
          details: 'Updated base fare from 75 to 80',
          ipAddress: '192.168.1.1',
          timestamp: '2024-01-20T14:15:00Z',
        },
      ];
      set({ activityLogs: mockLogs, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch activity logs', isLoading: false });
    }
  },
  
  // Driver management
  approveDriver: async (driverId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { drivers } = get();
      const updatedDrivers = drivers.map(driver =>
        driver.id === driverId ? { ...driver, status: 'approved' as const } : driver
      );
      set({ drivers: updatedDrivers, isLoading: false });
      return true;
    } catch (error) {
      set({ error: 'Failed to approve driver', isLoading: false });
      return false;
    }
  },
  
  suspendDriver: async (driverId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { drivers } = get();
      const updatedDrivers = drivers.map(driver =>
        driver.id === driverId ? { ...driver, status: 'suspended' as const } : driver
      );
      set({ drivers: updatedDrivers, isLoading: false });
      return true;
    } catch (error) {
      set({ error: 'Failed to suspend driver', isLoading: false });
      return false;
    }
  },
  
  assignVehicleToDriver: async (driverId: string, vehicleId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { drivers, vehicles } = get();
      const updatedDrivers = drivers.map(driver =>
        driver.id === driverId ? { ...driver, vehicleId } : driver
      );
      const updatedVehicles = vehicles.map(vehicle =>
        vehicle.id === vehicleId ? { ...vehicle, driverId, status: 'assigned' as const } : vehicle
      );
      set({ drivers: updatedDrivers, vehicles: updatedVehicles, isLoading: false });
      return true;
    } catch (error) {
      set({ error: 'Failed to assign vehicle', isLoading: false });
      return false;
    }
  },
  
  // Vehicle management
  createVehicle: async (vehicleData) => {
    set({ isLoading: true, error: null });
    try {
      const { vehicles } = get();
      const newVehicle: Vehicle = {
        ...vehicleData,
        id: `v${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set({ vehicles: [...vehicles, newVehicle], isLoading: false });
      return true;
    } catch (error) {
      set({ error: 'Failed to create vehicle', isLoading: false });
      return false;
    }
  },
  
  deleteVehicle: async (vehicleId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { vehicles } = get();
      const updatedVehicles = vehicles.filter(vehicle => vehicle.id !== vehicleId);
      set({ vehicles: updatedVehicles, isLoading: false });
      return true;
    } catch (error) {
      set({ error: 'Failed to delete vehicle', isLoading: false });
      return false;
    }
  },
  
  // Customer management
  suspendCustomer: async (customerId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { customers } = get();
      const updatedCustomers = customers.map(customer =>
        customer.id === customerId ? { ...customer, status: 'suspended' as const } : customer
      );
      set({ customers: updatedCustomers, isLoading: false });
      return true;
    } catch (error) {
      set({ error: 'Failed to suspend customer', isLoading: false });
      return false;
    }
  },
  
  deleteCustomer: async (customerId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { customers } = get();
      const updatedCustomers = customers.filter(customer => customer.id !== customerId);
      set({ customers: updatedCustomers, isLoading: false });
      return true;
    } catch (error) {
      set({ error: 'Failed to delete customer', isLoading: false });
      return false;
    }
  },
  
  // Support management
  assignQuery: async (queryId: string, adminId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { supportQueries } = get();
      const updatedQueries = supportQueries.map(query =>
        query.id === queryId ? { ...query, assignedTo: adminId, status: 'in_progress' as const } : query
      );
      set({ supportQueries: updatedQueries, isLoading: false });
      return true;
    } catch (error) {
      set({ error: 'Failed to assign query', isLoading: false });
      return false;
    }
  },
  
  respondToQuery: async (queryId: string, response: string) => {
    set({ isLoading: true, error: null });
    try {
      const { supportQueries } = get();
      const updatedQueries = supportQueries.map(query =>
        query.id === queryId ? { ...query, response, status: 'resolved' as const } : query
      );
      set({ supportQueries: updatedQueries, isLoading: false });
      return true;
    } catch (error) {
      set({ error: 'Failed to respond to query', isLoading: false });
      return false;
    }
  },
  
  updateQueryStatus: async (queryId: string, status: SupportQuery['status']) => {
    set({ isLoading: true, error: null });
    try {
      const { supportQueries } = get();
      const updatedQueries = supportQueries.map(query =>
        query.id === queryId ? { ...query, status } : query
      );
      set({ supportQueries: updatedQueries, isLoading: false });
      return true;
    } catch (error) {
      set({ error: 'Failed to update query status', isLoading: false });
      return false;
    }
  },
  
  // Settings
  updateSettings: async (newSettings: Partial<AdminSettings>) => {
    set({ isLoading: true, error: null });
    try {
      const { settings } = get();
      const updatedSettings = { ...settings, ...newSettings } as AdminSettings;
      set({ settings: updatedSettings, isLoading: false });
      return true;
    } catch (error) {
      set({ error: 'Failed to update settings', isLoading: false });
      return false;
    }
  },
  
  // Notifications
  sendNotification: async (type: 'all_users' | 'all_drivers' | 'specific', message: string, userIds?: string[]) => {
    set({ isLoading: true, error: null });
    try {
      // Mock implementation - replace with actual API call
      console.log('Sending notification:', { type, message, userIds });
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ error: 'Failed to send notification', isLoading: false });
      return false;
    }
  },
  
  // Utility actions
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
  setSelectedDriver: (driver: Driver | null) => set({ selectedDriver: driver }),
  setSelectedVehicle: (vehicle: Vehicle | null) => set({ selectedVehicle: vehicle }),
  setSelectedCustomer: (customer: Customer | null) => set({ selectedCustomer: customer }),
  setSelectedQuery: (query: SupportQuery | null) => set({ selectedQuery: query }),
}));