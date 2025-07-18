import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { OrdersManagement } from '@/components/admin/OrdersManagement';
import { DriversManagement } from '@/components/admin/DriversManagement';
import { VehiclesManagement } from '@/components/admin/VehiclesManagement';
import { CustomersManagement } from '@/components/admin/CustomersManagement';
import { SupportManagement } from '@/components/admin/SupportManagement';
import { NotificationsManagement } from '@/components/admin/NotificationsManagement';
import { SettingsManagement } from '@/components/admin/SettingsManagement';
import { SecurityManagement } from '@/components/admin/SecurityManagement';
import { useAuthStore } from '@/stores/auth-store';
import { useLocalDataStore } from '@/stores/local-data-store';
import { useOrdersStore } from '@/stores/orders-store';
import { router } from 'expo-router';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, isAuthenticated } = useAuthStore();
  const { adminStats, drivers, initializeData } = useLocalDataStore();
  const { orders, initializeSampleData } = useOrdersStore();
  
  // Provide safe defaults
  const safeAdminStats = adminStats || {
    totalOrders: 0,
    totalDrivers: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    activeOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    averageRating: 0,
    ordersToday: 0,
    revenueToday: 0,
    newCustomersToday: 0,
    activeDrivers: 0
  };
  const safeDrivers = drivers || [];
  const safeOrders = orders || [];

  useEffect(() => {
    // Check if user is authenticated and is admin
    if (!isAuthenticated || user?.userType !== 'admin') {
      router.replace('/auth');
      return;
    }

    // Initialize admin data
    initializeData();
    initializeSampleData();
  }, [isAuthenticated, user]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardStats stats={safeAdminStats} orders={safeOrders} drivers={safeDrivers} />;
      case 'orders':
        return <OrdersManagement orders={safeOrders} />;
      case 'drivers':
        return <DriversManagement drivers={safeDrivers} />;
      case 'vehicles':
        return <VehiclesManagement drivers={safeDrivers} />;
      case 'customers':
        return <CustomersManagement />;
      case 'support':
        return <SupportManagement />;
      case 'notifications':
        return <NotificationsManagement />;
      case 'settings':
        return <SettingsManagement />;
      case 'security':
        return <SecurityManagement />;
      default:
        return <DashboardStats stats={safeAdminStats} orders={safeOrders} drivers={safeDrivers} />;
    }
  };

  if (!isAuthenticated || user?.userType !== 'admin') {
    return null;
  }

  return (
    <View style={styles.container}>
      <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderContent()}
      </AdminLayout>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
});