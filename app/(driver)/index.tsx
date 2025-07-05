import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  Dimensions,
  Animated,
} from "react-native";
import { router } from "expo-router";
import {
  MapPin,
  Clock,
  DollarSign,
  Package,
  Navigation,
  Phone,
  MessageCircle,
  Star,
  TrendingUp,
  Zap,
  Target,
  Award,
  Activity,
  CheckCircle,
  Timer,
  Truck,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";

const { width } = Dimensions.get("window");

interface PendingOrder {
  id: string;
  from: string;
  to: string;
  distance: string;
  estimatedTime: string;
  price: string;
  packageType: string;
  customerName: string;
  customerPhone: string;
  customerRating: number;
  urgency: "normal" | "urgent" | "express";
}

export default function DriverDashboard() {
  const [isOnline, setIsOnline] = useState(true);
  const [currentOrder, setCurrentOrder] = useState<PendingOrder | null>({
    id: "1",
    from: "Westlands Mall",
    to: "Karen Shopping Centre",
    distance: "12.5 km",
    estimatedTime: "25 mins",
    price: "KSh 450",
    packageType: "Documents",
    customerName: "John Doe",
    customerPhone: "+254712345678",
    customerRating: 4.8,
    urgency: "normal",
  });

  const pendingOrders: PendingOrder[] = [
    {
      id: "2",
      from: "CBD Post Office",
      to: "Kilimani Apartments",
      distance: "8.2 km",
      estimatedTime: "18 mins",
      price: "KSh 320",
      packageType: "Small Package",
      customerName: "Mary Smith",
      customerPhone: "+254723456789",
      customerRating: 4.9,
      urgency: "urgent",
    },
    {
      id: "3",
      from: "Sarit Centre",
      to: "Lavington Green",
      distance: "6.8 km",
      estimatedTime: "15 mins",
      price: "KSh 280",
      packageType: "Electronics",
      customerName: "Peter Wilson",
      customerPhone: "+254734567890",
      customerRating: 4.5,
      urgency: "express",
    },
  ];

  const todayStats = {
    ordersCompleted: 8,
    earnings: 2450,
    hoursOnline: 6.5,
    rating: 4.8,
    efficiency: 95,
    streak: 12,
  };

  const handleAcceptOrder = (orderId: string) => {
    const order = pendingOrders.find((o) => o.id === orderId);
    if (order) {
      setCurrentOrder(order);
      console.log("Order accepted:", orderId);
    }
  };

  const handleRejectOrder = (orderId: string) => {
    console.log("Order rejected:", orderId);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "express":
        return Colors.light.error;
      case "urgent":
        return Colors.light.warning;
      default:
        return Colors.light.primary;
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "express":
        return "⚡";
      case "urgent":
        return "🔥";
      default:
        return "📦";
    }
  };

  const renderCurrentOrder = () => {
    if (!currentOrder) return null;

    return (
      <LinearGradient
        colors={[Colors.light.primary, Colors.light.primaryDark]}
        style={styles.currentOrderCard}
      >
        <View style={styles.currentOrderHeader}>
          <View style={styles.orderBadge}>
            <Activity size={16} color={Colors.light.background} />
            <Text style={styles.orderBadgeText}>ACTIVE ORDER</Text>
          </View>
          <View style={styles.orderStatus}>
            <View style={styles.statusPulse}>
              <View style={styles.statusDot} />
            </View>
            <Text style={styles.statusText}>In Progress</Text>
          </View>
        </View>

        <View style={styles.orderRoute}>
          <View style={styles.routePoint}>
            <View style={styles.routeIconContainer}>
              <MapPin size={16} color={Colors.light.background} />
            </View>
            <Text style={styles.routeTextWhite}>{currentOrder.from}</Text>
          </View>
          <View style={styles.routeLineWhite} />
          <View style={styles.routePoint}>
            <View style={styles.routeIconContainer}>
              <Target size={16} color={Colors.light.background} />
            </View>
            <Text style={styles.routeTextWhite}>{currentOrder.to}</Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.orderDetailItem}>
            <MapPin size={16} color={Colors.light.background + "CC"} />
            <Text style={styles.orderDetailTextWhite}>{currentOrder.distance}</Text>
          </View>
          <View style={styles.orderDetailItem}>
            <Timer size={16} color={Colors.light.background + "CC"} />
            <Text style={styles.orderDetailTextWhite}>{currentOrder.estimatedTime}</Text>
          </View>
          <View style={styles.orderDetailItem}>
            <Package size={16} color={Colors.light.background + "CC"} />
            <Text style={styles.orderDetailTextWhite}>{currentOrder.packageType}</Text>
          </View>
        </View>

        <View style={styles.customerInfo}>
          <View style={styles.customerDetails}>
            <Text style={styles.customerNameWhite}>{currentOrder.customerName}</Text>
            <View style={styles.customerRating}>
              <Star size={12} color={Colors.light.warning} fill={Colors.light.warning} />
              <Text style={styles.ratingTextWhite}>{currentOrder.customerRating}</Text>
            </View>
          </View>
          <View style={styles.customerActions}>
            <TouchableOpacity style={styles.actionButtonWhite}>
              <Phone size={16} color={Colors.light.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButtonWhite}>
              <MessageCircle size={16} color={Colors.light.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.currentOrderActions}>
          <TouchableOpacity style={styles.navigationButton}>
            <LinearGradient
              colors={[Colors.light.background, "#FFFFFF"]}
              style={styles.navigationButtonGradient}
            >
              <Navigation size={20} color={Colors.light.primary} />
              <Text style={styles.navigationButtonText}>Navigate</Text>
            </LinearGradient>
          </TouchableOpacity>
          <View style={styles.orderPriceContainer}>
            <Text style={styles.orderPriceWhite}>{currentOrder.price}</Text>
            <Text style={styles.orderPriceLabel}>Earnings</Text>
          </View>
        </View>
      </LinearGradient>
    );
  };

  const renderPendingOrder = (order: PendingOrder) => (
    <View key={order.id} style={styles.pendingOrderCard}>
      <View style={styles.pendingOrderHeader}>
        <View style={styles.urgencyBadge}>
          <Text style={styles.urgencyEmoji}>{getUrgencyIcon(order.urgency)}</Text>
          <Text style={[styles.urgencyText, { color: getUrgencyColor(order.urgency) }]}>
            {order.urgency.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.orderPrice}>{order.price}</Text>
      </View>

      <View style={styles.orderRoute}>
        <View style={styles.routePoint}>
          <View style={[styles.routeDot, styles.routeDotStart]} />
          <Text style={styles.routeText} numberOfLines={1}>
            {order.from}
          </Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routePoint}>
          <View style={[styles.routeDot, styles.routeDotEnd]} />
          <Text style={styles.routeText} numberOfLines={1}>
            {order.to}
          </Text>
        </View>
      </View>

      <View style={styles.orderMeta}>
        <View style={styles.orderDetails}>
          <View style={styles.orderDetailItem}>
            <MapPin size={14} color={Colors.light.textMuted} />
            <Text style={styles.orderDetailTextSmall}>{order.distance}</Text>
          </View>
          <View style={styles.orderDetailItem}>
            <Timer size={14} color={Colors.light.textMuted} />
            <Text style={styles.orderDetailTextSmall}>{order.estimatedTime}</Text>
          </View>
        </View>
        <View style={styles.customerRating}>
          <Star size={12} color={Colors.light.warning} fill={Colors.light.warning} />
          <Text style={styles.ratingText}>{order.customerRating}</Text>
        </View>
      </View>

      <View style={styles.pendingOrderActions}>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => handleRejectOrder(order.id)}
        >
          <Text style={styles.rejectButtonText}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAcceptOrder(order.id)}
        >
          <LinearGradient
            colors={[Colors.light.primary, Colors.light.primaryDark]}
            style={styles.acceptButtonGradient}
          >
            <CheckCircle size={16} color={Colors.light.background} />
            <Text style={styles.acceptButtonText}>Accept</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Good morning! 🌅</Text>
            <Text style={styles.driverName}>Driver Peter</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.onlineToggle}>
              <View style={[styles.onlineIndicator, { backgroundColor: isOnline ? Colors.light.success : Colors.light.textMuted }]}>
                <Activity size={12} color={Colors.light.background} />
              </View>
              <Text style={[styles.onlineText, { color: isOnline ? Colors.light.success : Colors.light.textMuted }]}>
                {isOnline ? "Online" : "Offline"}
              </Text>
              <Switch
                value={isOnline}
                onValueChange={setIsOnline}
                trackColor={{ false: Colors.light.border, true: Colors.light.success + "40" }}
                thumbColor={isOnline ? Colors.light.success : Colors.light.textMuted}
              />
            </View>
          </View>
        </View>

        <LinearGradient
          colors={[Colors.light.accent, Colors.light.accentDark]}
          style={styles.statsCard}
        >
          <View style={styles.statsHeader}>
            <View style={styles.statsIconContainer}>
              <Award size={24} color={Colors.light.background} />
            </View>
            <Text style={styles.statsTitle}>Today's Performance 🚀</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Package size={20} color={Colors.light.background} />
              <Text style={styles.statNumber}>{todayStats.ordersCompleted}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statItem}>
              <DollarSign size={20} color={Colors.light.background} />
              <Text style={styles.statNumber}>KSh {todayStats.earnings.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Earnings</Text>
            </View>
            <View style={styles.statItem}>
              <Star size={20} color={Colors.light.warning} />
              <Text style={styles.statNumber}>{todayStats.rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statItem}>
              <Zap size={20} color={Colors.light.background} />
              <Text style={styles.statNumber}>{todayStats.streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
          
          <View style={styles.efficiencyBar}>
            <Text style={styles.efficiencyLabel}>Efficiency: {todayStats.efficiency}%</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${todayStats.efficiency}%` }]} />
            </View>
          </View>
        </LinearGradient>

        {renderCurrentOrder()}

        {!currentOrder && isOnline && (
          <View style={styles.pendingOrdersContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Available Orders 📦</Text>
              <View style={styles.orderCounter}>
                <Text style={styles.orderCountText}>{pendingOrders.length}</Text>
              </View>
            </View>
            {pendingOrders.map(renderPendingOrder)}
          </View>
        )}

        {!isOnline && (
          <View style={styles.offlineMessage}>
            <LinearGradient
              colors={[Colors.light.backgroundSecondary, Colors.light.borderLight]}
              style={styles.offlineCard}
            >
              <View style={styles.offlineIcon}>
                <Truck size={48} color={Colors.light.textMuted} />
              </View>
              <Text style={styles.offlineTitle}>You're offline 😴</Text>
              <Text style={styles.offlineSubtitle}>
                Turn on online mode to start receiving orders and earn money! 💰
              </Text>
              <TouchableOpacity 
                style={styles.goOnlineButton}
                onPress={() => setIsOnline(true)}
              >
                <LinearGradient
                  colors={[Colors.light.success, "#10B981"]}
                  style={styles.goOnlineGradient}
                >
                  <Zap size={20} color={Colors.light.background} />
                  <Text style={styles.goOnlineText}>Go Online</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions ⚡</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push("/(driver)/earnings")}
            >
              <LinearGradient
                colors={[Colors.light.warning, "#F59E0B"]}
                style={styles.quickActionGradient}
              >
                <TrendingUp size={24} color={Colors.light.background} />
                <Text style={styles.quickActionText}>Earnings</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push("/(driver)/orders")}
            >
              <LinearGradient
                colors={[Colors.light.info, "#3B82F6"]}
                style={styles.quickActionGradient}
              >
                <Clock size={24} color={Colors.light.background} />
                <Text style={styles.quickActionText}>History</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  greeting: {
    fontSize: 18,
    color: Colors.light.textSecondary,
    fontWeight: "500",
  },
  driverName: {
    fontSize: 32,
    fontWeight: "900",
    color: Colors.light.text,
    marginTop: 4,
    letterSpacing: -1,
  },
  onlineToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.light.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  onlineIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  onlineText: {
    fontSize: 14,
    fontWeight: "700",
  },
  statsCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: Colors.light.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  statsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  statsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.light.background,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
    gap: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.light.background,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.background + "CC",
    fontWeight: "600",
  },
  efficiencyBar: {
    gap: 8,
  },
  efficiencyLabel: {
    fontSize: 14,
    color: Colors.light.background + "CC",
    fontWeight: "600",
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.light.background,
    borderRadius: 4,
  },
  currentOrderCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  currentOrderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  orderBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  orderBadgeText: {
    fontSize: 12,
    color: Colors.light.background,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  orderStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusPulse: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.background,
  },
  statusText: {
    fontSize: 14,
    color: Colors.light.background + "CC",
    fontWeight: "600",
  },
  orderRoute: {
    marginBottom: 20,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  routeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  routeDotStart: {
    backgroundColor: Colors.light.primary,
  },
  routeDotEnd: {
    backgroundColor: Colors.light.accent,
  },
  routeText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: "600",
    flex: 1,
  },
  routeTextWhite: {
    fontSize: 16,
    color: Colors.light.background,
    fontWeight: "700",
    flex: 1,
  },
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: Colors.light.border,
    marginLeft: 4,
    marginVertical: 2,
  },
  routeLineWhite: {
    width: 2,
    height: 16,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    marginLeft: 15,
    marginVertical: 2,
  },
  orderDetails: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20,
  },
  orderDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  orderDetailText: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: "500",
  },
  orderDetailTextWhite: {
    fontSize: 12,
    color: Colors.light.background + "CC",
    fontWeight: "600",
  },
  orderDetailTextSmall: {
    fontSize: 11,
    color: Colors.light.textMuted,
    fontWeight: "500",
  },
  customerInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: "600",
    marginBottom: 4,
  },
  customerNameWhite: {
    fontSize: 16,
    color: Colors.light.background,
    fontWeight: "700",
    marginBottom: 4,
  },
  customerRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: "500",
  },
  ratingTextWhite: {
    fontSize: 12,
    color: Colors.light.background + "CC",
    fontWeight: "600",
  },
  customerActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonWhite: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.background,
    justifyContent: "center",
    alignItems: "center",
  },
  currentOrderActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navigationButton: {
    borderRadius: 16,
    shadowColor: Colors.light.background,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  navigationButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  navigationButtonText: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: "800",
  },
  orderPriceContainer: {
    alignItems: "flex-end",
  },
  orderPrice: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.light.text,
  },
  orderPriceWhite: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.light.background,
  },
  orderPriceLabel: {
    fontSize: 12,
    color: Colors.light.background + "CC",
    fontWeight: "600",
    marginTop: 2,
  },
  pendingOrdersContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
  orderCounter: {
    backgroundColor: Colors.light.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  orderCountText: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.light.background,
  },
  pendingOrderCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  pendingOrderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  urgencyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  urgencyEmoji: {
    fontSize: 16,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  orderMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  pendingOrderActions: {
    flexDirection: "row",
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.light.error,
    alignItems: "center",
  },
  rejectButtonText: {
    color: Colors.light.error,
    fontSize: 14,
    fontWeight: "700",
  },
  acceptButton: {
    flex: 1,
    borderRadius: 16,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  acceptButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  acceptButtonText: {
    color: Colors.light.background,
    fontSize: 14,
    fontWeight: "800",
  },
  offlineMessage: {
    marginTop: 40,
    marginBottom: 24,
  },
  offlineCard: {
    borderRadius: 24,
    padding: 40,
    alignItems: "center",
  },
  offlineIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.background,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  offlineTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.light.text,
    marginBottom: 8,
    textAlign: "center",
  },
  offlineSubtitle: {
    fontSize: 16,
    color: Colors.light.textMuted,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
    fontWeight: "500",
  },
  goOnlineButton: {
    borderRadius: 16,
    shadowColor: Colors.light.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  goOnlineGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  goOnlineText: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: "800",
  },
  quickActions: {
    marginBottom: 24,
  },
  actionGrid: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 16,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionGradient: {
    alignItems: "center",
    paddingVertical: 20,
    borderRadius: 16,
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.light.background,
  },
});