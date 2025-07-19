import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Dimensions,
  RefreshControl,
  Alert,
} from "react-native";
import { Package, Clock, MapPin, Star, TrendingUp, Award, Zap, CheckCircle, Truck, Navigation } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "@/constants/colors";
import { useAuthStore } from "@/stores/auth-store-simple";
import { useOrdersStore, OrderStatus } from "@/stores/orders-store";

const { width } = Dimensions.get("window");

export default function DriverOrdersScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month">("today");
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();
  const { orders, getOrdersByDriver, updateOrderStatus, isLoading } = useOrdersStore();
  
  useEffect(() => {
    if (user?.id) {
      getOrdersByDriver(user.id);
    }
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.id) {
      await getOrdersByDriver(user.id);
    }
    setRefreshing(false);
  };

  // Filter orders for this driver
  const driverOrders = orders.filter(order => order.driverId === user?.id);
  
  // Filter by period
  const filterOrdersByPeriod = (orders: any[]) => {
    const now = new Date();
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      switch (selectedPeriod) {
        case "today":
          return orderDate.toDateString() === now.toDateString();
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return orderDate >= weekAgo;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return orderDate >= monthAgo;
        default:
          return true;
      }
    });
  };
  
  const displayOrders = filterOrdersByPeriod(driverOrders);

  const periods = [
    { key: "today", label: "Today", emoji: "📅" },
    { key: "week", label: "This Week", emoji: "📊" },
    { key: "month", label: "This Month", emoji: "📈" },
  ];

  const completedOrders = displayOrders.filter(order => order.status === "delivered");
  const stats = {
    totalOrders: completedOrders.length,
    totalEarnings: completedOrders.reduce((sum, order) => sum + order.price, 0),
    averageRating: completedOrders.length > 0 
      ? completedOrders.reduce((sum, order) => sum + (order.driverInfo?.rating || 4.5), 0) / completedOrders.length 
      : 4.5,
    totalTips: 0, // Tips not implemented yet
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus, {
        name: user?.name || "Driver",
        phone: user?.phone || "",
        rating: 4.5,
      });
      Alert.alert("Success", "Order status updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update order status");
    }
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case "assigned": return "picked_up";
      case "picked_up": return "in_transit";
      case "in_transit": return "delivered";
      default: return null;
    }
  };

  const getStatusActionText = (status: OrderStatus): string => {
    switch (status) {
      case "assigned": return "Mark as Picked Up";
      case "picked_up": return "Mark In Transit";
      case "in_transit": return "Mark as Delivered";
      default: return "";
    }
  };

  const renderStarRating = (rating: number) => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={12}
            color={star <= rating ? colors.warning : colors.border}
            fill={star <= rating ? colors.warning : "transparent"}
          />
        ))}
      </View>
    );
  };

  const renderOrderItem = ({ item }: { item: any }) => {
    const nextStatus = getNextStatus(item.status);
    const canUpdateStatus = nextStatus && !['delivered', 'cancelled'].includes(item.status);
    
    return (
    <TouchableOpacity style={styles.orderCard} onPress={() => {
        // Navigate to order details or tracking
      }}>
      <View style={styles.orderHeader}>
        <View style={styles.orderRoute}>
          <View style={styles.routePoint}>
            <View style={[styles.routeDot, styles.routeDotStart]} />
            <Text style={styles.routeText} numberOfLines={1}>
              {item.from}
            </Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routePoint}>
            <View style={[styles.routeDot, styles.routeDotEnd]} />
            <Text style={styles.routeText} numberOfLines={1}>
              {item.to}
            </Text>
          </View>
        </View>
        <View style={styles.orderMeta}>
          <Text style={styles.orderPrice}>KSh {item.price}</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: getStatusColor(item.status) + "20",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: getStatusColor(item.status),
                },
              ]}
            >
              {getStatusEmoji(item.status)} {getStatusText(item.status)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.customerName}>👤 Customer: {item.customerName || "N/A"}</Text>
        <Text style={styles.packageType}>📦 {item.packageType}</Text>
        <Text style={styles.orderDate}>🕐 {new Date(item.createdAt).toLocaleDateString()}</Text>
        <Text style={styles.recipientInfo}>📞 Recipient: {item.recipientName} ({item.recipientPhone})</Text>
      </View>

      <View style={styles.orderStats}>
        <View style={styles.statItem}>
          <MapPin size={14} color={colors.textMuted} />
          <Text style={styles.statText}>{item.distance || "~8.5 km"}</Text>
        </View>
        <View style={styles.statItem}>
          <Clock size={14} color={colors.textMuted} />
          <Text style={styles.statText}>{item.estimatedTime || "~25 mins"}</Text>
        </View>
        {canUpdateStatus && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => nextStatus && handleStatusUpdate(item.id, nextStatus)}
          >
            <Text style={styles.actionButtonText}>{getStatusActionText(item.status)}</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
    );
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending": return colors.warning;
      case "assigned": return colors.primary;
      case "picked_up":
      case "in_transit": return colors.accent;
      case "delivered": return colors.success;
      case "cancelled": return colors.error;
      default: return colors.textMuted;
    }
  };

  const getStatusEmoji = (status: OrderStatus) => {
    switch (status) {
      case "pending": return "🔍";
      case "assigned": return "👨‍💼";
      case "picked_up": return "📦";
      case "in_transit": return "🚚";
      case "delivered": return "✅";
      case "cancelled": return "❌";
      default: return "📋";
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case "pending": return "Pending";
      case "assigned": return "Assigned";
      case "picked_up": return "Picked Up";
      case "in_transit": return "In Transit";
      case "delivered": return "Delivered";
      case "cancelled": return "Cancelled";
      default: return status;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Order History 📋</Text>
          <Text style={styles.subtitle}>Track your delivery performance</Text>
        </View>
      </LinearGradient>

      <View style={styles.periodSelector}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodButton,
              selectedPeriod === period.key && styles.activePeriodButton,
            ]}
            onPress={() => setSelectedPeriod(period.key as any)}
          >
            <Text style={styles.periodEmoji}>{period.emoji}</Text>
            <Text
              style={[
                styles.periodText,
                selectedPeriod === period.key && styles.activePeriodText,
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <LinearGradient
            colors={[colors.success, "#10B981"]}
            style={styles.statGradient}
          >
            <Package size={20} color={colors.background} />
            <Text style={styles.statNumber}>{stats.totalOrders}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </LinearGradient>
        </View>
        
        <View style={styles.statCard}>
          <LinearGradient
            colors={[colors.warning, "#F59E0B"]}
            style={styles.statGradient}
          >
            <TrendingUp size={20} color={colors.background} />
            <Text style={styles.statNumber}>KSh {stats.totalEarnings.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </LinearGradient>
        </View>
        
        <View style={styles.statCard}>
          <LinearGradient
            colors={[colors.accent, colors.accentDark]}
            style={styles.statGradient}
          >
            <Star size={20} color={colors.background} />
            <Text style={styles.statNumber}>{stats.averageRating.toFixed(1)}⭐</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </LinearGradient>
        </View>
        
        <View style={styles.statCard}>
          <LinearGradient
            colors={[colors.info, "#3B82F6"]}
            style={styles.statGradient}
          >
            <Award size={20} color={colors.background} />
            <Text style={styles.statNumber}>KSh {stats.totalTips}</Text>
            <Text style={styles.statLabel}>Tips Earned</Text>
          </LinearGradient>
        </View>
      </View>

      <FlatList
        data={displayOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.ordersList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Zap size={20} color={colors.primary} />
            <Text style={styles.listHeaderText}>Your Orders</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Package size={48} color={colors.textMuted} />
            <Text style={styles.emptyStateText}>No orders found for this period</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.background,
    marginBottom: 4,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: colors.background + "CC",
    fontWeight: "500",
  },
  periodSelector: {
    flexDirection: "row",
    margin: 20,
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    gap: 4,
  },
  activePeriodButton: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  periodEmoji: {
    fontSize: 16,
  },
  periodText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
  },
  activePeriodText: {
    color: colors.background,
    fontWeight: "700",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 56) / 2,
    borderRadius: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  statGradient: {
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 6,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.background,
  },
  statLabel: {
    fontSize: 11,
    color: colors.background + "CC",
    textAlign: "center",
    fontWeight: "600",
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  listHeaderText: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  ordersList: {
    padding: 20,
    paddingTop: 0,
  },
  orderCard: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  orderHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  orderRoute: {
    flex: 1,
    marginRight: 16,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  routeDotStart: {
    backgroundColor: colors.primary,
  },
  routeDotEnd: {
    backgroundColor: colors.accent,
  },
  routeText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "600",
    flex: 1,
  },
  routeLine: {
    width: 2,
    height: 12,
    backgroundColor: colors.border,
    marginLeft: 3,
    marginVertical: 2,
  },
  orderMeta: {
    alignItems: "flex-end",
    gap: 6,
  },
  orderPrice: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.text,
  },
  tipBadge: {
    backgroundColor: colors.warning + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tipText: {
    fontSize: 10,
    color: colors.warning,
    fontWeight: "700",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  orderDetails: {
    marginBottom: 12,
    gap: 4,
  },
  customerName: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  packageType: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  orderDate: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  orderStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginLeft: "auto",
  },
  starContainer: {
    flexDirection: "row",
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "600",
  },
  recipientInfo: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: "auto",
  },
  actionButtonText: {
    fontSize: 10,
    color: colors.background,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 16,
    textAlign: "center",
  },
});