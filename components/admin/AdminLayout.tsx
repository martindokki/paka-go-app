import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  BarChart3, 
  Package, 
  Users, 
  Car, 
  MessageSquare, 
  Settings, 
  Bell, 
  Shield,
  LogOut,
  Menu
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { useAuthStore } from '@/stores/auth-store';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const adminTabs = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'drivers', label: 'Drivers', icon: Users },
  { id: 'vehicles', label: 'Vehicles', icon: Car },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'support', label: 'Support', icon: MessageSquare },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'security', label: 'Security', icon: Shield },
];

export function AdminLayout({ children, activeTab, onTabChange }: AdminLayoutProps) {
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = React.useState(Platform.OS === 'web');

  const handleLogout = async () => {
    await logout();
  };

  const renderSidebar = () => (
    <View style={styles.sidebar}>
      <View style={styles.sidebarHeader}>
        <Text style={styles.logo}>PAKA-Go</Text>
        <Text style={styles.logoSubtitle}>Admin Panel</Text>
      </View>
      
      <ScrollView style={styles.sidebarContent}>
        {adminTabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
              onPress={() => onTabChange(tab.id)}
            >
              <IconComponent 
                size={20} 
                color={isActive ? colors.light.primary : colors.light.textMuted} 
              />
              <Text style={[
                styles.sidebarItemText,
                isActive && styles.sidebarItemTextActive
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      
      <View style={styles.sidebarFooter}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userRole}>Admin</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={colors.light.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {Platform.OS !== 'web' && (
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu size={24} color={colors.light.text} />
        </TouchableOpacity>
      )}
      
      <Text style={styles.headerTitle}>
        {adminTabs.find(tab => tab.id === activeTab)?.label || 'Admin Panel'}
      </Text>
      
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.headerAction}>
          <Bell size={20} color={colors.light.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.webLayout}>
          {renderSidebar()}
          <View style={styles.mainContent}>
            {renderHeader()}
            <View style={styles.content}>
              {children}
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mobileLayout}>
        {renderHeader()}
        {sidebarOpen && (
          <View style={styles.mobileOverlay}>
            <TouchableOpacity 
              style={styles.overlayBackground}
              onPress={() => setSidebarOpen(false)}
            />
            {renderSidebar()}
          </View>
        )}
        <View style={styles.content}>
          {children}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.backgroundSecondary,
  },
  webLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  mobileLayout: {
    flex: 1,
  },
  sidebar: {
    width: Platform.OS === 'web' ? 280 : 280,
    backgroundColor: colors.light.background,
    borderRightWidth: 1,
    borderRightColor: colors.light.border,
    elevation: Platform.OS === 'android' ? 4 : 0,
    shadowColor: Platform.OS === 'ios' ? colors.light.shadow : 'transparent',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sidebarHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.light.primary,
  },
  logoSubtitle: {
    fontSize: 14,
    color: colors.light.textMuted,
    marginTop: 4,
  },
  sidebarContent: {
    flex: 1,
    paddingVertical: 16,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginHorizontal: 12,
    borderRadius: 8,
  },
  sidebarItemActive: {
    backgroundColor: colors.light.primaryLight,
  },
  sidebarItemText: {
    marginLeft: 12,
    fontSize: 16,
    color: colors.light.textMuted,
  },
  sidebarItemTextActive: {
    color: colors.light.primary,
    fontWeight: '600',
  },
  sidebarFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
  },
  userInfo: {
    marginBottom: 16,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.text,
  },
  userRole: {
    fontSize: 14,
    color: colors.light.textMuted,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.light.error,
  },
  mainContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.light.text,
    flex: 1,
    marginLeft: Platform.OS !== 'web' ? 16 : 0,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAction: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  mobileOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    flexDirection: 'row',
  },
  overlayBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});