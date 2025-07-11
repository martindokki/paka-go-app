import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  Modal
} from 'react-native';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  User, 
  Phone,
  DollarSign,
  Package,
  Truck,
  X,
  CheckCircle,
  XCircle
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { useOrdersStore, Order } from '@/stores/orders-store';

interface OrderCardProps {
  order: Order;
  onAssignDriver: (orderId: string) => void;
  onCancelOrder: (orderId: string) => void;
  onSendSTKPush: (orderId: string) => void;
}

function OrderCard({ order, onAssignDriver, onCancelOrder, onSendSTKPush }: OrderCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return colors.light.warning;
      case 'assigned': return colors.light.info;
      case 'picked_up': return colors.light.secondary;
      case 'in_transit': return colors.light.info;
      case 'delivered': return colors.light.success;
      case 'cancelled': return colors.light.error;
      default: return colors.light.textMuted;
    }
  };

  const getStatusText = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>#{order.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
              {getStatusText(order.status)}
            </Text>
          </View>
        </View>
        <Text style={styles.orderDate}>
          {new Date(order.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.locationInfo}>
          <View style={styles.locationRow}>
            <MapPin size={16} color={colors.light.success} />
            <Text style={styles.locationText}>From: {order.from}</Text>
          </View>
          <View style={styles.locationRow}>
            <MapPin size={16} color={colors.light.error} />
            <Text style={styles.locationText}>To: {order.to}</Text>
          </View>
        </View>

        <View style={styles.orderMeta}>
          <View style={styles.metaRow}>
            <User size={16} color={colors.light.textMuted} />
            <Text style={styles.metaText}>{order.recipientName}</Text>
          </View>
          <View style={styles.metaRow}>
            <Phone size={16} color={colors.light.textMuted} />
            <Text style={styles.metaText}>{order.recipientPhone}</Text>
          </View>
          <View style={styles.metaRow}>
            <Package size={16} color={colors.light.textMuted} />
            <Text style={styles.metaText}>{order.packageType}</Text>
          </View>
          <View style={styles.metaRow}>
            <DollarSign size={16} color={colors.light.textMuted} />
            <Text style={styles.metaText}>KES {order.price}</Text>
          </View>
          {order.driverInfo?.name && (
            <View style={styles.metaRow}>
              <Truck size={16} color={colors.light.textMuted} />
              <Text style={styles.metaText}>Driver: {order.driverInfo.name}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.orderActions}>
        {order.status === 'pending' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.assignButton]}
            onPress={() => onAssignDriver(order.id)}
          >
            <Text style={styles.assignButtonText}>Assign Driver</Text>
          </TouchableOpacity>
        )}
        
        {order.status === 'delivered' && order.paymentStatus === 'pending' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.stkButton]}
            onPress={() => onSendSTKPush(order.id)}
          >
            <Text style={styles.stkButtonText}>Send STK Push</Text>
          </TouchableOpacity>
        )}
        
        {order.status !== 'delivered' && order.status !== 'cancelled' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => onCancelOrder(order.id)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export function OrdersManagement() {
  const { orders, assignDriver, cancelOrder, sendSTKPush } = useOrdersStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.to.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleAssignDriver = (orderId: string) => {
    Alert.alert(
      'Assign Driver',
      'Select a driver for this order',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Assign', 
          onPress: () => {
            // In a real app, you'd show a driver selection modal
            assignDriver(orderId, 'driver1', {
              name: 'John Doe',
              phone: '+254700000000',
              rating: 4.5,
              vehicleInfo: 'Honda CB 150R - KCA 123A'
            });
          }
        }
      ]
    );
  };

  const handleCancelOrder = (orderId: string) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          style: 'destructive',
          onPress: () => cancelOrder(orderId, 'Cancelled by admin')
        }
      ]
    );
  };

  const handleSendSTKPush = (orderId: string) => {
    Alert.alert(
      'Send STK Push',
      'Send payment request to customer?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send', 
          onPress: () => {
            sendSTKPush(orderId);
            Alert.alert('Success', 'STK Push sent to customer');
          }
        }
      ]
    );
  };

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'picked_up', label: 'Picked Up' },
    { value: 'in_transit', label: 'In Transit' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.light.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search orders..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.light.textMuted}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={colors.light.primary} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterChip,
                  statusFilter === option.value && styles.filterChipActive
                ]}
                onPress={() => setStatusFilter(option.value)}
              >
                <Text style={[
                  styles.filterChipText,
                  statusFilter === option.value && styles.filterChipTextActive
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView style={styles.ordersList} showsVerticalScrollIndicator={false}>
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Package size={48} color={colors.light.textMuted} />
            <Text style={styles.emptyStateText}>No orders found</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Orders will appear here when customers place them'
              }
            </Text>
          </View>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onAssignDriver={handleAssignDriver}
              onCancelOrder={handleCancelOrder}
              onSendSTKPush={handleSendSTKPush}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.light.text,
  },
  filterButton: {
    padding: 12,
    backgroundColor: colors.light.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.light.background,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  filterChipActive: {
    backgroundColor: colors.light.primary,
    borderColor: colors.light.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: colors.light.textMuted,
  },
  filterChipTextActive: {
    color: colors.light.background,
    fontWeight: '600',
  },
  ordersList: {
    flex: 1,
  },
  orderCard: {
    backgroundColor: colors.light.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.light.border,
    shadowColor: colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.light.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 14,
    color: colors.light.textMuted,
  },
  orderDetails: {
    marginBottom: 16,
  },
  locationInfo: {
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.light.text,
    flex: 1,
  },
  orderMeta: {
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.light.textMuted,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
  },
  assignButton: {
    backgroundColor: colors.light.primary,
  },
  assignButtonText: {
    color: colors.light.background,
    fontWeight: '600',
    fontSize: 14,
  },
  stkButton: {
    backgroundColor: colors.light.success,
  },
  stkButtonText: {
    color: colors.light.background,
    fontWeight: '600',
    fontSize: 14,
  },
  cancelButton: {
    backgroundColor: colors.light.error,
  },
  cancelButtonText: {
    color: colors.light.background,
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.light.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.light.textMuted,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
});