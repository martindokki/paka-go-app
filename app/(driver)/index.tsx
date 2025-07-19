import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { router } from "expo-router";
import { Package, Truck, DollarSign, Star, TrendingUp } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "@/constants/colors";
import { useAuthStore } from "@/stores/auth-store-simple";
import { useOrdersStore } from "@/stores/orders-store";

export default function DriverHomeScreen() {
  const { user } = useAuthStore();
  const { orders, getOrdersByDriver, getAllOrders, isLoading } = useOrdersStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      getOrdersByDriver(user.id);
      getAllOrders(); // Also get available orders
    }
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.id) {
      await getOrdersByDriver(user.id);
      await getAllOrders();
    }
    setRefreshing(false);
  };

  const driverOrders = orders.filter(order => order.driverId === user?.id);
  const availableOrders = orders.filter(order => order.status === 'pending' && !order.driverId);
  const activeOrders = driverOrders.filter(order => 
    !['delivered', 'cancelled'].includes(order.status)
  );
  const completedOrders = driverOrders.filter(order => order.status === 'delivered');
  const totalEarnings = completedOrders.reduce((sum, order) => sum + order.price, 0);
  const averageRating = completedOrders.length > 0 
    ? completedOrders.reduce((sum, order) => sum + (order.driverInfo?.rating || 4.5), 0) / completedOrders.length 
    : 4.5;

  const stats = [
    {
      label: "Available Orders",
      value: availableOrders.length,
      icon: Package,
      color: colors.warning,
      gradient: [colors.warning, "#F59E0B"] as const,
      onPress: () => router.push("/(driver)/available-orders")
    },
    {
      label: "Active Orders",
      value: activeOrders.length,
      icon: Truck,
      color: colors.primary,
      gradient: [colors.primary, colors.primaryDark] as const,
      onPress: () => router.push("/(driver)/orders")
    },
    {
      label: "Today's Earnings",
      value: `KSh ${completedOrders.filter(order => {
        const today = new Date().toDateString();
        return new Date(order.updatedAt).toDateString() === today;
      }).reduce((sum, order) => sum + order.price, 0).toLocaleString()}`,
      icon: DollarSign,
      color: colors.success,
      gradient: [colors.success, "#10B981"] as const,
      onPress: () => router.push("/(driver)/earnings")
    },
    {
      label: "Your Rating",
      value: `${averageRating.toFixed(1)}⭐`,
      icon: Star,
      color: colors.accent,
      gradient: [colors.accent, colors.accentDark] as const,
      onPress: () => router.push("/(driver)/profile")
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || "D"}
            </Text>
          </View>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Welcome back!</Text>
            <Text style={styles.userName}>{user?.name || "Driver"}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Stats */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <TouchableOpacity key={index} style={styles.statCard} onPress={stat.onPress}>
              <LinearGradient
                colors={stat.gradient}
                style={styles.statGradient}
              >
                <View style={styles.statIcon}>
                  <stat.icon size={20} color={colors.background} />
                </View>
                <Text style={styles.statValue}>
                  {typeof stat.value === 'string' ? stat.value : stat.value.toString()}
                </Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push("/(driver)/available-orders")}
          >
            <LinearGradient
              colors={[colors.warning, "#F59E0B"]}
              style={styles.actionGradient}
            >
              <Package size={24} color={colors.background} />
              <Text style={styles.actionText}>Find New Orders ({availableOrders.length})</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push("/(driver)/orders")}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.actionGradient}
            >
              <Truck size={24} color={colors.background} />
              <Text style={styles.actionText}>My Active Orders</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push("/(driver)/earnings")}
          >
            <LinearGradient
              colors={[colors.accent, colors.accentDark]}
              style={styles.actionGradient}
            >
              <TrendingUp size={24} color={colors.background} />
              <Text style={styles.actionText}>View Earnings</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Recent Orders */}
        {activeOrders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Orders</Text>
            {activeOrders.slice(0, 3).map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => router.push(`/tracking?orderId=${order.id}`)}
              >
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>#{order.id}</Text>
                  <Text style={styles.orderPrice}>KSh {order.price}</Text>
                </View>
                <Text style={styles.orderRoute}>
                  {order.from} → {order.to}
                </Text>
                <View style={styles.orderFooter}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(order.status) + "20" }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(order.status) }
                    ]}>
                      {getStatusText(order.status)}
                    </Text>
                  </View>
                  <Text style={styles.orderTime}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStatusColor = (status: string) => {
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

const getStatusText = (status: string) => {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.background,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: colors.background + "CC",
    fontWeight: "500",
    marginBottom: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.background,
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    borderRadius: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  statGradient: {
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    minHeight: 100,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.background,
    marginBottom: 4,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 12,
    color: colors.background + "CC",
    fontWeight: "600",
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  actionButton: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  actionGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.background,
  },
  orderCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderId: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.text,
  },
  orderRoute: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "600",
    marginBottom: 12,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  orderTime: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
});