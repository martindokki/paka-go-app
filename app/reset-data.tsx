import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Trash2, RefreshCw, CheckCircle, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { safeColors as colors } from '@/constants/colors';
import { resetAllData, resetOrdersData } from '@/utils/data-reset';
import { useAuthStore } from '@/stores/auth-store-simple';
import { useOrdersStore } from '@/stores/orders-store';

export default function ResetDataScreen() {
  const [isResetting, setIsResetting] = useState(false);
  const { user, logout } = useAuthStore();
  const { orders } = useOrdersStore();

  const handleResetAllData = async () => {
    Alert.alert(
      'Reset All Data',
      'This will clear all user accounts, orders, and settings. The app will be reset to a clean production state. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset All',
          style: 'destructive',
          onPress: async () => {
            setIsResetting(true);
            try {
              await resetAllData();
              await logout();
              Alert.alert(
                'Success',
                'All data has been cleared. The app is now in a clean production state.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      router.replace('/auth');
                    },
                  },
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to reset data. Please try again.');
            } finally {
              setIsResetting(false);
            }
          },
        },
      ]
    );
  };

  const handleResetOrders = async () => {
    Alert.alert(
      'Reset Orders',
      'This will clear all orders but keep user accounts. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Orders',
          style: 'destructive',
          onPress: async () => {
            setIsResetting(true);
            try {
              await resetOrdersData();
              Alert.alert('Success', 'All orders have been cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to reset orders. Please try again.');
            } finally {
              setIsResetting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.error, '#DC2626']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.background} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Data Management</Text>
        <View style={styles.headerRight} />
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Data Status</Text>
          
          <View style={styles.statusCard}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Current User:</Text>
              <Text style={styles.statusValue}>
                {user ? `${user.name} (${user.userType})` : 'Not logged in'}
              </Text>
            </View>
            
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Total Orders:</Text>
              <Text style={styles.statusValue}>{orders.length}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reset Options</Text>
          
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetOrders}
            disabled={isResetting}
          >
            <LinearGradient
              colors={[colors.warning, '#F59E0B']}
              style={styles.resetGradient}
            >
              <RefreshCw size={20} color={colors.background} />
              <Text style={styles.resetButtonText}>Reset Orders Only</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetAllData}
            disabled={isResetting}
          >
            <LinearGradient
              colors={[colors.error, '#DC2626']}
              style={styles.resetGradient}
            >
              <Trash2 size={20} color={colors.background} />
              <Text style={styles.resetButtonText}>
                {isResetting ? 'Resetting...' : 'Reset All Data'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Production Ready</Text>
          
          <View style={styles.infoCard}>
            <CheckCircle size={24} color={colors.success} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Clean State</Text>
              <Text style={styles.infoText}>
                After resetting, the app will be in a clean production state with no mock data.
                Users can register fresh accounts and create real orders.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: colors.background,
    textAlign: 'center',
    marginLeft: -32,
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  statusCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  resetButton: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  resetGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.background,
  },
  infoCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoContent: {
    flex: 1,
    marginLeft: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    fontWeight: '500',
  },
});