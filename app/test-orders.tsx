import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { Package, User, Truck, Settings } from 'lucide-react-native';
import colors from '@/constants/colors';
import { useOrdersStore } from '@/stores/orders-store';
import { useAuthStore } from '@/stores/auth-store-simple';

export default function TestOrdersScreen() {
  const { orders, getAllOrders, isLoading, error } = useOrdersStore();
  const { user } = useAuthStore();

  useEffect(() => {
    getAllOrders();
  }, []);

  const clientOrders = orders.filter(order => order.clientId === user?.id);
  const driverOrders = orders.filter(order => order.driverId === user?.id);
  const pendingOrders = orders.filter(order => order.status === 'pending' && !order.driverId);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Orders Test Page</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current User</Text>
          <View style={styles.card}>
            <Text style={styles.cardText}>ID: {user?.id || 'Not logged in'}</Text>
            <Text style={styles.cardText}>Name: {user?.name || 'N/A'}</Text>
            <Text style={styles.cardText}>Type: {user?.userType || 'N/A'}</Text>
            <Text style={styles.cardText}>Email: {user?.email || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Store Status</Text>
          <View style={styles.card}>
            <Text style={styles.cardText}>Loading: {isLoading ? 'Yes' : 'No'}</Text>
            <Text style={styles.cardText}>Error: {error || 'None'}</Text>
            <Text style={styles.cardText}>Total Orders: {orders.length}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Orders ({orders.length})</Text>
          {orders.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.cardText}>No orders found</Text>
            </View>
          ) : (
            orders.map((order, index) => (
              <View key={order.id} style={styles.orderCard}>
                <Text style={styles.orderTitle}>#{order.id}</Text>
                <Text style={styles.cardText}>From: {order.from}</Text>
                <Text style={styles.cardText}>To: {order.to}</Text>
                <Text style={styles.cardText}>Status: {order.status}</Text>
                <Text style={styles.cardText}>Client: {order.clientId}</Text>
                <Text style={styles.cardText}>Driver: {order.driverId || 'Unassigned'}</Text>
                <Text style={styles.cardText}>Price: KSh {order.price}</Text>
                <Text style={styles.cardText}>Created: {new Date(order.createdAt).toLocaleString()}</Text>
              </View>
            ))
          )}
        </View>

        {user?.userType === 'customer' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Orders ({clientOrders.length})</Text>
            {clientOrders.length === 0 ? (
              <View style={styles.card}>
                <Text style={styles.cardText}>No orders for this client</Text>
              </View>
            ) : (
              clientOrders.map((order) => (
                <View key={order.id} style={styles.orderCard}>
                  <Text style={styles.orderTitle}>#{order.id}</Text>
                  <Text style={styles.cardText}>Status: {order.status}</Text>
                  <Text style={styles.cardText}>Price: KSh {order.price}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {user?.userType === 'driver' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>My Assigned Orders ({driverOrders.length})</Text>
              {driverOrders.length === 0 ? (
                <View style={styles.card}>
                  <Text style={styles.cardText}>No orders assigned to this driver</Text>
                </View>
              ) : (
                driverOrders.map((order) => (
                  <View key={order.id} style={styles.orderCard}>
                    <Text style={styles.orderTitle}>#{order.id}</Text>
                    <Text style={styles.cardText}>Status: {order.status}</Text>
                    <Text style={styles.cardText}>Price: KSh {order.price}</Text>
                  </View>
                ))
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Available Orders ({pendingOrders.length})</Text>
              {pendingOrders.length === 0 ? (
                <View style={styles.card}>
                  <Text style={styles.cardText}>No pending orders available</Text>
                </View>
              ) : (
                pendingOrders.map((order) => (
                  <View key={order.id} style={styles.orderCard}>
                    <Text style={styles.orderTitle}>#{order.id}</Text>
                    <Text style={styles.cardText}>From: {order.from}</Text>
                    <Text style={styles.cardText}>To: {order.to}</Text>
                    <Text style={styles.cardText}>Price: KSh {order.price}</Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/booking')}
          >
            <Package size={20} color={colors.background} />
            <Text style={styles.actionText}>Book Delivery</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => getAllOrders()}
          >
            <Settings size={20} color={colors.background} />
            <Text style={styles.actionText}>Refresh</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.back()}
          >
            <Text style={styles.actionText}>Back</Text>
          </TouchableOpacity>
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
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionText: {
    color: colors.background,
    fontWeight: '600',
  },
});