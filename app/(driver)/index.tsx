import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, RefreshControl, Switch, Alert } from "react-native";
import { router } from "expo-router";
import { Package, Truck, DollarSign, Star, TrendingUp, Zap, Power, Clock, MapPin, User } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { safeColors as colors } from "@/constants/colors";
import { useAuthStore } from "@/stores/auth-store-simple";
import { useOrdersStore } from "@/stores/orders-store";

export default function DriverHomeScreen() {
  const { user } = useAuthStore();
  const { orders, getOrdersByDriver, getAllOrders, isLoading } = useOrdersStore();
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [todayStats, setTodayStats] = useState({
    ordersCompleted: 0,
    earnings: 0,
    hoursWorked: 0,
    averageRating: 4.8
  });

  useEffect(() => {
    if (user?.id) {
      getOrdersByDriver(user.id);
      if (isOnline) {
        getAllOrders(); // Only get available orders when online
      }
      calculateTodayStats();
    }
  }, [user?.id, isOnline]);

  const calculateTodayStats = () => {
    const today = new Date().toDateString();
    const todayOrders = driverOrders.filter(order => 
      new Date(order.updatedAt).toDateString() === today && order.status === 'delivered'
    );
    
    setTodayStats({
      ordersCompleted: todayOrders.length,
      earnings: todayOrders.reduce((sum, order) => sum + order.price, 0),
      hoursWorked: Math.max(1, todayOrders.length * 0.5), // Estimate 30 min per order
      averageRating: todayOrders.length > 0 
        ? todayOrders.reduce((sum, order) => sum + (order.driverInfo?.rating || 4.8), 0) / todayOrders.length 
        : 4.8
    });
  };

  const toggleOnlineStatus = () => {
    if (isOnline) {
      Alert.alert(
        "Go Offline?",
        "You won't receive new order notifications while offline.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Go Offline", 
            style: "destructive",
            onPress: () => setIsOnline(false)
          }
        ]
      );
    } else {
      setIsOnline(true);
      if (user?.id) {
        getAllOrders(); // Refresh available orders when going online
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.id) {
      await getOrdersByDriver(user.id);
      if (isOnline) {
        await getAllOrders();
      }
      calculateTodayStats();
    }
    setRefreshing(false);
  };

  const driverOrders = orders.filter(order => order.driverId === user?.id);
  const availableOrders = isOnline ? orders.filter(order => order.status === 'pending' && !order.driverId) : [];
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
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.push("/(driver)/profile")}
          >
            <User size={20} color={colors.background} />
          </TouchableOpacity>
        </View>
        
        {/* Online/Offline Toggle */}
        <View style={styles.statusToggle}>
          <View style={styles.statusInfo}>
            <View style={[
              styles.statusIndicator, 
              { backgroundColor: isOnline ? colors.success : colors.error }
            ]} />
            <Text style={styles.statusText}>
              {isOnline ? "You're Online" : "You're Offline"}
            </Text>
          </View>
          <Switch
            value={isOnline}
            onValueChange={toggleOnlineStatus}
            trackColor={{ false: colors.border, true: colors.success + "40" }}
            thumbColor={isOnline ? colors.success : colors.textMuted}
            ios_backgroundColor={colors.border}
          />
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
        {/* Today's Performance */}
        <View style={styles.performanceSection}>
          <Text style={styles.sectionTitle}>Today's Performance</Text>
          <View style={styles.performanceGrid}>
            <View style={styles.performanceCard}>
              <LinearGradient
                colors={[colors.success, "#10B981"]}
                style={styles.performanceGradient}
              >
                <Package size={24} color={colors.background} />
                <Text style={styles.performanceValue}>{todayStats.ordersCompleted}</Text>
                <Text style={styles.performanceLabel}>Orders</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.performanceCard}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.performanceGradient}
              >
                <DollarSign size={24} color={colors.background} />
                <Text style={styles.performanceValue}>KSh {todayStats.earnings.toLocaleString()}</Text>
                <Text style={styles.performanceLabel}>Earned</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.performanceCard}>
              <LinearGradient
                colors={[colors.accent, colors.accentDark]}
                style={styles.performanceGradient}
              >
                <Clock size={24} color={colors.background} />
                <Text style={styles.performanceValue}>{todayStats.hoursWorked.toFixed(1)}h</Text>
                <Text style={styles.performanceLabel}>Hours</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.performanceCard}>
              <LinearGradient
                colors={[colors.warning, "#F59E0B"]}
                style={styles.performanceGradient}
              >
                <Star size={24} color={colors.background} />
                <Text style={styles.performanceValue}>{todayStats.averageRating.toFixed(1)}</Text>
                <Text style={styles.performanceLabel}>Rating</Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.statCard,
                !isOnline && stat.label === "Available Orders" && styles.disabledCard
              ]} 
              onPress={isOnline || stat.label !== "Available Orders" ? stat.onPress : undefined}
              disabled={!isOnline && stat.label === "Available Orders"}
            >
              <LinearGradient
                colors={!isOnline && stat.label === "Available Orders" 
                  ? [colors.textMuted, colors.border] 
                  : stat.gradient
                }
                style={styles.statGradient}
              >
                <View style={styles.statIcon}>
                  <stat.icon size={20} color={colors.background} />
                </View>
                <Text style={styles.statValue}>
                  {!isOnline && stat.label === "Available Orders" 
                    ? "Offline" 
                    : typeof stat.value === 'string' ? stat.value : stat.value.toString()
                  }
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
            style={[
              styles.actionButton,
              !isOnline && styles.disabledButton
            ]}
            onPress={isOnline ? () => router.push("/(driver)/available-orders") : undefined}
            disabled={!isOnline}
          >
            <LinearGradient
              colors={!isOnline ? [colors.textMuted, colors.border] : [colors.warning, "#F59E0B"]}
              style={styles.actionGradient}
            >
              <Package size={24} color={colors.background} />
              <Text style={styles.actionText}>
                {!isOnline ? "Go Online to Find Orders" : `Find New Orders (${availableOrders.length})`}
              </Text>
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
                      styles.orderStatusText,
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
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  statusToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    marginHorizontal: 20,
  },
  statusInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.background,
  },
  performanceSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  performanceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  performanceCard: {
    flex: 1,
    minWidth: "22%",
    borderRadius: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  performanceGradient: {
    padding: 12,
    borderRadius: 16,
    alignItems: "center",
    minHeight: 80,
    gap: 4,
  },
  performanceValue: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.background,
    textAlign: "center",
  },
  performanceLabel: {
    fontSize: 10,
    color: colors.background + "CC",
    fontWeight: "600",
    textAlign: "center",
  },
  disabledCard: {
    opacity: 0.6,
  },
  disabledButton: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    paddingTop: 24,
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
  orderStatusText: {
    fontSize: 10,
    fontWeight: "700" as const,
  },
  orderTime: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
});