import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
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
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "@/constants/colors";
import { useOrdersStore, OrderStatus } from "@/stores/orders-store";
import { useAuthStore } from "@/stores/auth-store";

export default function OrdersScreen() {
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [refreshing, setRefreshing] = useState(false);
  
  const { user } = useAuthStore();
  const { getOrdersByClient, initializeSampleData } = useOrdersStore();

  // Initialize sample data on component mount
  React.useEffect(() => {
    initializeSampleData();
  }, []);

  const allOrders = user ? getOrdersByClient(user.id) : [];
  const activeOrders = allOrders.filter(order => 
    !["delivered", "cancelled"].includes(order.status)
  );
  const completedOrders = allOrders.filter(order => 
    ["delivered", "cancelled"].includes(order.status)
  );

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return colors.warning;
      case "assigned":
        return colors.primary;
      case "picked_up":
      case "in_transit":
        return colors.accent;
      case "delivered":
        return colors.success;
      case "cancelled":
        return colors.error;
      default:
        return colors.textMuted;
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "Finding Driver";
      case "assigned":
        return "Driver Assigned";
      case "picked_up":
        return "Package Picked Up";
      case "in_transit":
        return "In Transit";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getStatusEmoji = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "🔍";
      case "assigned":
        return "👨‍💼";
      case "picked_up":
        return "📦";
      case "in_transit":
        return "🚚";
      case "delivered":
        return "✅";
      case "cancelled":
        return "❌";
      default:
        return "📋";
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "mpesa":
        return Smartphone;
      case "card":
        return CreditCard;
      case "cash":
        return DollarSign;
      default:
        return Wallet;
    }
  };

  const getPaymentTermIcon = (term: string) => {
    switch (term) {
      case "pay_now":
        return Zap;
      case "pay_on_delivery":
        return Timer;
      default:
        return Wallet;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return colors.success;
      case "pending":
        return colors.warning;
      case "failed":
        return colors.error;
      default:
        return colors.textMuted;
    }
  };

  const renderOrderCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => router.push(`/tracking?orderId=${item.id}`)}
    >
      <LinearGradient
        colors={[colors.background, colors.backgroundSecondary]}
        style={styles.orderCardGradient}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderIdContainer}>
            <Text style={styles.orderId}>{item.id}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + "20" }]}>
              <Text style={styles.statusEmoji}>{getStatusEmoji(item.status)}</Text>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {getStatusText(item.status)}
              </Text>
            </View>
          </View>
          <View style={styles.orderMeta}>
            <Text style={styles.orderPrice}>KSh {item.price}</Text>
            <Text style={styles.orderTime}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

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

        <View style={styles.orderDetails}>
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
          
          <View style={styles.paymentInfo}>
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
          </View>
        </View>

        <View style={styles.paymentStatusRow}>
          <Text style={styles.paymentStatusLabel}>Payment:</Text>
          <View style={[styles.paymentStatusBadge, { backgroundColor: getPaymentStatusColor(item.paymentStatus) + "20" }]}>
            <Text style={[styles.paymentStatusText, { color: getPaymentStatusColor(item.paymentStatus) }]}>
              {item.paymentStatus === "paid" ? "✅ Paid" : 
               item.paymentStatus === "pending" ? "⏳ Pending" : "❌ Failed"}
            </Text>
          </View>
        </View>

        {item.driverInfo && (
          <View style={styles.driverInfo}>
            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>Driver: {item.driverInfo.name}</Text>
              <View style={styles.driverRating}>
                <Star size={12} color={colors.warning} fill={colors.warning} />
                <Text style={styles.ratingText}>{item.driverInfo.rating}</Text>
              </View>
            </View>
            <View style={styles.driverActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push(`/chat?orderId=${item.id}`)}
              >
                <MessageCircle size={16} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  console.log("Call driver:", item.driverInfo.phone);
                }}
              >
                <Phone size={16} color={colors.accent} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.orderFooter}>
          <Text style={styles.recipientInfo}>
            To: {item.recipientName} • {item.recipientPhone}
          </Text>
          <TouchableOpacity 
            style={styles.trackButton}
            onPress={() => router.push(`/tracking?orderId=${item.id}`)}
          >
            <Zap size={14} color={colors.primary} />
            <Text style={styles.trackButtonText}>Track</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const EmptyState = ({ isActive }: { isActive: boolean }) => (
    <View style={styles.emptyState}>
      <LinearGradient
        colors={[colors.primaryLight, colors.backgroundSecondary]}
        style={styles.emptyStateGradient}
      >
        <Text style={styles.emptyStateEmoji}>
          {isActive ? "📦" : "✅"}
        </Text>
        <Text style={styles.emptyStateTitle}>
          {isActive ? "No Active Orders" : "No Completed Orders"}
        </Text>
        <Text style={styles.emptyStateSubtitle}>
          {isActive 
            ? "Ready to send your first package? Tap the button below to get started!" 
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
        <Text style={styles.subtitle}>Track and manage your deliveries</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "active" && styles.activeTab]}
          onPress={() => setActiveTab("active")}
        >
          <LinearGradient
            colors={activeTab === "active" ? [colors.primary, colors.primaryDark] : ["transparent", "transparent"]}
            style={styles.tabGradient}
          >
            <Text
              style={[styles.tabText, activeTab === "active" && styles.activeTabText]}
            >
              Active ({activeOrders.length})
            </Text>
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
            <Text
              style={[styles.tabText, activeTab === "completed" && styles.activeTabText]}
            >
              Completed ({completedOrders.length})
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    padding: 20,
    paddingBottom: 0,
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
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
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
  },
  orderId: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    alignSelf: "flex-start",
  },
  statusEmoji: {
    fontSize: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  orderMeta: {
    alignItems: "flex-end",
  },
  orderPrice: {
    fontSize: 20,
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
  routePoint: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  routeDotStart: {
    backgroundColor: colors.primary,
  },
  routeDotEnd: {
    backgroundColor: colors.accent,
  },
  routeText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: "600",
    flex: 1,
  },
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: colors.border,
    marginLeft: 4,
    marginVertical: 2,
  },
  orderDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
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
  paymentInfo: {
    flexDirection: "row",
    gap: 8,
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
  paymentStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  paymentStatusLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
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
  driverInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "600",
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
    backgroundColor: colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recipientInfo: {
    fontSize: 12,
    color: colors.textMuted,
    flex: 1,
    fontWeight: "500",
  },
  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  trackButtonText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "700",
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
    paddingVertical: 40,
    borderRadius: 24,
    maxWidth: 320,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 20,
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
    marginBottom: 24,
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
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.background,
  },
});