import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import { useAuthStore } from '@/stores/auth-store';
import { useOrdersStore } from '@/stores/orders-store';

export default function ForceRefreshScreen() {
  const [refreshCount, setRefreshCount] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const { user, isAuthenticated } = useAuthStore();
  const { orders, clearError } = useOrdersStore();

  useEffect(() => {
    // Clear any existing errors
    clearError();
    setLastRefresh(new Date());
  }, []);

  const handleForceRefresh = () => {
    setRefreshCount(prev => prev + 1);
    setLastRefresh(new Date());
    
    // Clear any cached data
    clearError();
    
    Alert.alert(
      'App Refreshed! 🔄',
      `Refresh count: ${refreshCount + 1}\nLast refresh: ${new Date().toLocaleTimeString()}\n\nThe app state has been refreshed. All components should now reflect the latest changes.`,
      [
        {
          text: 'Go to Orders',
          onPress: () => router.push('/(client)/orders'),
        },
        {
          text: 'Go to Booking',
          onPress: () => router.push('/booking'),
        },
        {
          text: 'OK',
          style: 'cancel',
        },
      ]
    );
  };

  const handleClearStorage = async () => {
    Alert.alert(
      'Clear App Data',
      'This will clear all stored data and force a complete app reset. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear auth store
              await useAuthStore.getState().logout();
              
              // Clear orders store
              clearError();
              
              Alert.alert('Success', 'App data cleared successfully!', [
                {
                  text: 'OK',
                  onPress: () => router.replace('/auth'),
                },
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to clear app data');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
      >
        <RefreshCw size={32} color={colors.background} />
        <Text style={styles.title}>Force Refresh</Text>
        <Text style={styles.subtitle}>Debug & Refresh App State</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>App Status</Text>
          
          <View style={styles.statusItem}>
            <CheckCircle size={20} color={isAuthenticated ? colors.success : colors.error} />
            <Text style={styles.statusText}>
              Authentication: {isAuthenticated ? 'Logged In' : 'Not Logged In'}
            </Text>
          </View>
          
          <View style={styles.statusItem}>
            <CheckCircle size={20} color={user ? colors.success : colors.error} />
            <Text style={styles.statusText}>
              User: {user ? `${user.name} (${user.userType})` : 'No User'}
            </Text>
          </View>
          
          <View style={styles.statusItem}>
            <CheckCircle size={20} color={colors.info} />
            <Text style={styles.statusText}>
              Orders: {orders.length} total
            </Text>
          </View>
          
          <View style={styles.statusItem}>
            <AlertCircle size={20} color={colors.warning} />
            <Text style={styles.statusText}>
              Refresh Count: {refreshCount}
            </Text>
          </View>
          
          {lastRefresh && (
            <View style={styles.statusItem}>
              <CheckCircle size={20} color={colors.accent} />
              <Text style={styles.statusText}>
                Last Refresh: {lastRefresh.toLocaleTimeString()}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={handleForceRefresh}>
          <LinearGradient
            colors={[colors.accent, colors.accentDark]}
            style={styles.buttonGradient}
          >
            <RefreshCw size={24} color={colors.background} />
            <Text style={styles.buttonText}>Force Refresh App</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.clearButton} onPress={handleClearStorage}>
          <Text style={styles.clearButtonText}>Clear All App Data</Text>
        </TouchableOpacity>

        <View style={styles.navigationButtons}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => router.push('/(client)/orders')}
          >
            <Text style={styles.navButtonText}>View Orders</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => router.push('/booking')}
          >
            <Text style={styles.navButtonText}>Book Delivery</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    padding: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.background,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.background + 'CC',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  statusText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
  },
  refreshButton: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.background,
  },
  clearButton: {
    backgroundColor: colors.error + '20',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.error + '40',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  navButton: {
    flex: 1,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});