import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/auth-store';
import { useOrdersStore } from '@/stores/orders-store';
import colors from '@/constants/colors';

export default function DebugAuthScreen() {
  const authState = useAuthStore();
  const ordersState = useOrdersStore();

  const handleTestLogin = async () => {
    const success = await authState.login({
      email: 'test@client.com',
      password: 'password123',
      userType: 'client'
    });
    console.log('Test login result:', success);
  };

  const handleClearAuth = () => {
    authState.logout();
  };

  const handleClearOrders = () => {
    useOrdersStore.setState({ orders: [] });
  };

  const handleInitializeOrders = () => {
    ordersState.initializeSampleData();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Debug Authentication</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Auth State</Text>
          <Text style={styles.debugText}>
            isAuthenticated: {authState.isAuthenticated ? 'true' : 'false'}
          </Text>
          <Text style={styles.debugText}>
            isInitialized: {authState.isInitialized ? 'true' : 'false'}
          </Text>
          <Text style={styles.debugText}>
            isLoading: {authState.isLoading ? 'true' : 'false'}
          </Text>
          <Text style={styles.debugText}>
            user: {authState.user ? `${authState.user.email} (${authState.user.userType})` : 'null'}
          </Text>
          <Text style={styles.debugText}>
            error: {authState.error || 'null'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Orders State</Text>
          <Text style={styles.debugText}>
            orders count: {ordersState.orders.length}
          </Text>
          <Text style={styles.debugText}>
            sample orders: {ordersState.orders.map(o => o.id).join(', ')}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.button} onPress={handleTestLogin}>
            <Text style={styles.buttonText}>Test Client Login</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleClearAuth}>
            <Text style={styles.buttonText}>Clear Auth</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleClearOrders}>
            <Text style={styles.buttonText}>Clear Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleInitializeOrders}>
            <Text style={styles.buttonText}>Initialize Sample Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => router.push('/auth')}>
            <Text style={styles.buttonText}>Go to Auth</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => router.push('/booking')}>
            <Text style={styles.buttonText}>Test Booking</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => router.push('/tracking?trackingCode=TRK12345ABC')}>
            <Text style={styles.buttonText}>Test Tracking</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  debugText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  actions: {
    gap: 12,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: colors.textMuted,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
});