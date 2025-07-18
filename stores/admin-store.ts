import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

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

export interface AdminStats {
  totalOrders: number;
  activeDrivers: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

interface AdminState {
  settings: AdminSettings;
  stats: AdminStats;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  updateSettings: (newSettings: Partial<AdminSettings>) => Promise<boolean>;
  fetchStats: () => Promise<void>;
  clearError: () => void;
  
  // Internal actions
  setSettings: (settings: AdminSettings) => void;
  setStats: (stats: AdminStats) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const defaultSettings: AdminSettings = {
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

const defaultStats: AdminStats = {
  totalOrders: 0,
  activeDrivers: 0,
  totalRevenue: 0,
  pendingOrders: 0,
  completedOrders: 0,
  cancelledOrders: 0,
};

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      stats: defaultStats,
      isLoading: false,
      error: null,
      
      updateSettings: async (newSettings: Partial<AdminSettings>): Promise<boolean> => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const currentSettings = get().settings;
          const updatedSettings = { ...currentSettings, ...newSettings };
          
          set({
            settings: updatedSettings,
            isLoading: false,
            error: null,
          });
          
          console.log('Settings updated successfully', updatedSettings);
          return true;
        } catch (error: any) {
          const errorMsg = 'Failed to update settings. Please try again.';
          set({ error: errorMsg, isLoading: false });
          console.error('Settings update error:', error);
          return false;
        }
      },
      
      fetchStats: async (): Promise<void> => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Mock stats data
          const mockStats: AdminStats = {
            totalOrders: Math.floor(Math.random() * 1000) + 500,
            activeDrivers: Math.floor(Math.random() * 50) + 20,
            totalRevenue: Math.floor(Math.random() * 100000) + 50000,
            pendingOrders: Math.floor(Math.random() * 20) + 5,
            completedOrders: Math.floor(Math.random() * 800) + 400,
            cancelledOrders: Math.floor(Math.random() * 50) + 10,
          };
          
          set({
            stats: mockStats,
            isLoading: false,
            error: null,
          });
          
          console.log('Stats fetched successfully', mockStats);
        } catch (error: any) {
          const errorMsg = 'Failed to fetch stats. Please try again.';
          set({ error: errorMsg, isLoading: false });
          console.error('Stats fetch error:', error);
        }
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      // Internal actions
      setSettings: (settings: AdminSettings) => {
        set({ settings });
      },
      
      setStats: (stats: AdminStats) => {
        set({ stats });
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: 'admin-storage',
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
      partialize: (state) => ({
        settings: state.settings,
      }),
    }
  )
);