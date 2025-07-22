import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  Dimensions,
  Platform,
  StatusBar,
  Animated,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { 
  Package, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Phone, 
  Star, 
  Zap, 
  CreditCard, 
  Smartphone, 
  DollarSign,
  Timer,
  Wallet,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  Award,
  CheckCircle,
  AlertCircle,
  XCircle,
  Truck,
  Navigation,
  Eye,
  MoreHorizontal
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "@/constants/colors";
import { useOrdersStore, OrderStatus } from "@/stores/orders-store";
import { useAuthStore } from "@/stores/auth-store";
import { AuthGuard } from "@/components/AuthGuard";

const { width } = Dimensions.get("window");

export default function OrdersScreen() {
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [refreshing, setRefreshing] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));
  
  const { user } = useAuthStore();
  const { getOrdersByClient, fetchOrdersByClient } = useOrdersStore();
  
  useEffect(() => {
    // Only fetch orders if user exists, don't trigger auth checks
    if (user?.id) {
      console.log('Orders screen: Fetching orders for user', user.id);
      fetchOrdersByClient(user.id).catch(error => {
        console.error('Failed to fetch orders:', error);
        // Don't throw error to prevent auth issues
      });
    }
    
    // Start animation
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []); // Remove dependencies to prevent frequent re-runs

  // Get orders from local store
  const allOrders = user ? getOrdersByClient(user.id) : [];
  const activeOrders = allOrders.filter(order => 
    !["delivered", "cancelled"].includes(order.status)
  );
  const completedOrders = allOrders.filter(order => 
    ["delivered", "cancelled"].includes(order.status)
  );

  const stats = [
    {
      label: "Active",
      value: activeOrders.length,
      icon: Truck,
      color: colors.primary,
      gradient: [colors.primary, colors.primaryDark] as const
    },
    {
      label: "Completed",
      value: completedOrders.filter(o => o.status === "delivered").length,
      icon: CheckCircle,
      color: colors.success,
      gradient: [colors.success, "#10B981"] as const
    },
    {
      label: "This Month",
      value: allOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        return orderDate.getMonth() === now.getMonth() && 
               orderDate.getFullYear() === now.getFullYear();
      }).length,
      icon: Calendar,
      color: colors.accent,
      gradient: [colors.accent, colors.accentDark] as const
    },
    {
      label: "Total Spent",
      value: `KSh ${allOrders.reduce((sum, order) => sum + Math.round(order.price || 0), 0).toLocaleString()}`,
      icon: DollarSign,
      color: colors.info,
      gradient: [colors.info, "#3B82F6"] as const
    }
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (user?.id) {
        console.log('Refreshing orders for user:', user.id);
        await fetchOrdersByClient(user.id);
      } else {
        console.log('No user ID available for refresh');
      }
    } catch (error) {
      console.error('Failed to refresh orders:', error);
      // Don't throw error to prevent auth issues
    } finally {
      setRefreshing(false);
    }
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

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case "pending": return "Finding Driver";
      case "assigned": return "Driver Assigned";
      case "picked_up": return "Package Picked Up";
      case "in_transit": return "In Transit";
      case "delivered": return "Delivered";
      case "cancelled": return "Cancelled";
      default: return status;
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "pending": return AlertCircle;
      case "assigned": return Truck;
      case "picked_up":
      case "in_transit": return Navigation;
      case "delivered": return CheckCircle;
      case "cancelled": return XCircle;
      default: return Package;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "mpesa": return Smartphone;
      case "card": return CreditCard;
      case "cash": return DollarSign;
      default: return Wallet;
    }
  };

  const getPaymentTermIcon = (term: string) => {
    switch (term) {
      case "pay_now": return Zap;
      case "pay_on_delivery": return Timer;
      default: return Wallet;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid": return colors.success;
      case "pending": return colors.warning;
      case "failed": return colors.error;
      default: return colors.textMuted;
    }
  };

  const renderOrderCard = ({ item, index }: { item: any; index: number }) => (
    <Animated.View
      style={[
        styles.orderCard,
        {
          opacity: animatedValue,
          transform: [{
            translateY: animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          }],
        }
      ]}
    >
      <TouchableOpacity
        onPress={() => router.push(`/tracking?orderId=${item.id}`)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.background, colors.backgroundSecondary]}
          style={styles.orderCardGradient}
        >
          {/* Header */}
          <View style={styles.orderHeader}>
            <View style={styles.orderIdContainer}>
              <View style={styles.orderIdBadge}>
                <Package size={14} color={colors.primary} />
                <Text style={styles.orderId}>{item.id}</Text>
              </View>
              
              <View style={[
                styles.statusBadge, 
                { backgroundColor: getStatusColor(item.status) + "15" }
              ]}>
                {React.createElement(getStatusIcon(item.status), {
                  size: 14,
                  color: getStatusColor(item.status),
                })}
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {getStatusText(item.status)}
                </Text>
              </View>
            </View>
            
            <View style={styles.orderMeta}>
              <Text style={styles.orderPrice}>KSh {Math.round(item.price || 0).toLocaleString()}</Text>
              <Text style={styles.orderTime}>
                {new Date(item.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          </View>

          {/* Route */}
          <View style={styles.orderRoute}>
            <View style={styles.routeContainer}>
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: colors.primary }]} />
                <View style={styles.routeTextContainer}>
                  <Text style={styles.routeLabel}>From</Text>
                  <Text style={styles.routeText} numberOfLines={1}>
                    {item.from}
                  </Text>
                </View>
              </View>
              
              <View style={styles.routeConnector}>
                <View style={styles.routeLine} />
                <View style={styles.routeDistance}>
                  <MapPin size={12} color={colors.textMuted} />
                  <Text style={styles.distanceText}>
                    {item.distance || "~8.5 km"}
                  </Text>
                </View>
              </View>
              
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: colors.accent }]} />
                <View style={styles.routeTextContainer}>
                  <Text style={styles.routeLabel}>To</Text>
                  <Text style={styles.routeText} numberOfLines={1}>
                    {item.to}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Details */}
          <View style={styles.orderDetails}>
            <View style={styles.detailsRow}>
              <View style={styles.packageInfo}>
                <Package size={14} color={colors.textMuted} />
                <Text style={styles.packageType}>{item.packageType}</Text>
              </View>
              
              {item.estimatedTime && (
                <View style={styles.estimatedTime}>
                  <Clock size={14} color={colors.textMuted} />
                  <Text style={styles.estimatedTimeText}>{item.estimatedTime}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.paymentRow}>
              <View style={styles.paymentMethodBadge}>
                {React.createElement(getPaymentMethodIcon(item.paymentMethod), {
                  size: 12,
                  color: colors.primary,
                })}
                <Text style={styles.paymentMethodText}>
                  {item.paymentMethod === "mpesa" ? "M-Pesa" : 
                   item.paymentMethod === "card" ? "Card" : "Cash"}
                </Text>
              </View>
              
              <View style={styles.paymentTermBadge}>
                {React.createElement(getPaymentTermIcon(item.paymentTerm), {
                  size: 12,
                  color: colors.accent,
                })}
                <Text style={styles.paymentTermText}>
                  {item.paymentTerm === "pay_now" ? "Pay Now" : "On Delivery"}
                </Text>
              </View>
              
              <View style={[
                styles.paymentStatusBadge, 
                { backgroundColor: getPaymentStatusColor(item.paymentStatus) + "15" }
              ]}>
                <Text style={[
                  styles.paymentStatusText, 
                  { color: getPaymentStatusColor(item.paymentStatus) }
                ]}>
                  {item.paymentStatus === "paid" ? "✅ Paid" : 
                   item.paymentStatus === "pending" ? "⏳ Pending" : "❌ Failed"}
                </Text>
              </View>
            </View>
          </View>

          {/* Driver Info */}
          {item.driverInfo && (
            <View style={styles.driverSection}>
              <View style={styles.driverInfo}>
                <View style={styles.driverAvatar}>
                  <Text style={styles.driverInitial}>
                    {item.driverInfo.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.driverDetails}>
                  <Text style={styles.driverName}>{item.driverInfo.name}</Text>
                  <View style={styles.driverRating}>
                    <Star size={12} color={colors.warning} fill={colors.warning} />
                    <Text style={styles.ratingText}>{item.driverInfo.rating}</Text>
                    <Text style={styles.driverLabel}>• Your Driver</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.driverActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.primaryLight }]}
                  onPress={() => router.push(`/chat?orderId=${item.id}`)}
                >
                  <MessageCircle size={16} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.accentLight }]}
                  onPress={() => {
                    console.log("Call driver:", item.driverInfo.phone);
                  }}
                >
                  <Phone size={16} color={colors.accent} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Footer */}
          <View style={styles.orderFooter}>
            <View style={styles.recipientInfo}>
              <Text style={styles.recipientLabel}>To:</Text>
              <Text style={styles.recipientText}>
                {item.recipientName} • {item.recipientPhone}
              </Text>
            </View>
            
            <View style={styles.footerActions}>
              <TouchableOpacity 
                style={styles.trackButton}
                onPress={() => router.push(`/tracking?orderId=${item.id}`)}
              >
                <Eye size={14} color={colors.primary} />
                <Text style={styles.trackButtonText}>Track</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.moreButton}>
                <MoreHorizontal size={16} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  const EmptyState = ({ isActive }: { isActive: boolean }) => (
    <View style={styles.emptyState}>
      <LinearGradient
        colors={[colors.primaryLight, colors.backgroundSecondary]}
        style={styles.emptyStateGradient}
      >
        <View style={styles.emptyStateIcon}>
          {isActive ? (
            <Truck size={48} color={colors.primary} />
          ) : (
            <Award size={48} color={colors.success} />
          )}
        </View>
        
        <Text style={styles.emptyStateTitle}>
          {isActive ? "No Active Orders" : "No Completed Orders"}
        </Text>
        
        <Text style={styles.emptyStateSubtitle}>
          {isActive 
            ? "Ready to send your first package? Book a delivery and track it in real-time!" 
            : "Your completed deliveries will appear here once you start using PAKA Go."}
        </Text>
        
        {isActive && (
          <TouchableOpacity 
            style={styles.emptyStateButton}
            onPress={() => router.push("/booking")}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.emptyStateButtonGradient}
            >
              <Package size={20} color={colors.background} />
              <Text style={styles.emptyStateButtonText}>Book Delivery</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </View>
  );

  return (
    <AuthGuard requiredUserType="customer">
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.backgroundSecondary} />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>My Orders</Text>
              <Text style={styles.subtitle}>Track and manage your deliveries</Text>
            </View>
            
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerButton}>
                <Search size={20} color={colors.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <Filter size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Stats */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsScroll}
          >
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
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
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Tab Container */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "active" && styles.activeTab]}
            onPress={() => setActiveTab("active")}
          >
            <LinearGradient
              colors={activeTab === "active" ? [colors.primary, colors.primaryDark] : ["transparent", "transparent"]}
              style={styles.tabGradient}
            >
              <View style={styles.tabContent}>
                <Truck size={16} color={activeTab === "active" ? colors.background : colors.textMuted} />
                <Text
                  style={[styles.tabText, activeTab === "active" && styles.activeTabText]}
                >
                  Active ({activeOrders.length})
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, activeTab === "completed" && styles.activeTab]}
            onPress={() => setActiveTab("completed")}
          >
            <LinearGradient
              colors={activeTab === "completed" ? [colors.primary, colors.primaryDark] : ["transparent", "transparent"]}
              style={styles.tabGradient}
            >
              <View style={styles.tabContent}>
                <CheckCircle size={16} color={activeTab === "completed" ? colors.background : colors.textMuted} />
                <Text
                  style={[styles.tabText, activeTab === "completed" && styles.activeTabText]}
                >
                  Completed ({completedOrders.length})
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Orders List */}
        <FlatList
          data={activeTab === "active" ? activeOrders : completedOrders}
          renderItem={renderOrderCard}
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
          ListEmptyComponent={<EmptyState isActive={activeTab === "active"} />}
        />
      </SafeAreaView>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  statsScroll: {
    paddingRight: 20,
  },
  statCard: {
    width: 120,
    marginRight: 12,
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
  tabContainer: {
    flexDirection: "row",
    margin: 20,
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tab: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  tabGradient: {
    borderRadius: 12,
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: 8,
  },
  activeTab: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textMuted,
  },
  activeTabText: {
    color: colors.background,
  },
  ordersList: {
    padding: 20,
    paddingTop: 0,
    flexGrow: 1,
  },
  orderCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  orderCardGradient: {
    padding: 20,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  orderIdContainer: {
    flex: 1,
    gap: 8,
  },
  orderIdBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    alignSelf: "flex-start",
  },
  orderId: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  orderMeta: {
    alignItems: "flex-end",
  },
  orderPrice: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 4,
  },
  orderTime: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  orderRoute: {
    marginBottom: 16,
  },
  routeContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "center",
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  routeTextContainer: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "600",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  routeText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "600",
  },
  routeConnector: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 6,
    marginVertical: 8,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: colors.border,
    marginRight: 12,
  },
  routeDistance: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  distanceText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "600",
  },
  orderDetails: {
    marginBottom: 16,
    gap: 12,
  },
  detailsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  packageInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  packageType: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  estimatedTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  estimatedTimeText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  paymentMethodBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  paymentMethodText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: "700",
  },
  paymentTermBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  paymentTermText: {
    fontSize: 10,
    color: colors.accent,
    fontWeight: "700",
  },
  paymentStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  paymentStatusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  driverSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  driverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  driverInitial: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.background,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "700",
    marginBottom: 4,
  },
  driverRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "600",
  },
  driverLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  driverActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recipientInfo: {
    flex: 1,
  },
  recipientLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "600",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  recipientText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: "600",
  },
  footerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 4,
  },
  trackButtonText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "700",
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateGradient: {
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 48,
    borderRadius: 24,
    maxWidth: 320,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    fontWeight: "500",
  },
  emptyStateButton: {
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyStateButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.background,
  },
});