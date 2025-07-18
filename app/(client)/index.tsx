import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  Dimensions,
  Platform,
  StatusBar
} from "react-native";
import { router } from "expo-router";
import { 
  Package, 
  MapPin, 
  Clock, 
  Star, 
  Zap, 
  TrendingUp, 
  Gift, 
  Shield, 
  Smartphone,
  CreditCard,
  DollarSign,
  Plus,
  History,
  Bell,
  User,
  Settings,
  ChevronRight,
  Truck,
  Timer,
  Award
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "@/stores/auth-store";
import { useOrdersStore } from "@/stores/orders-store";
import colors from "@/constants/colors";

const { width, height } = Dimensions.get("window");

export default function ClientHomeScreen() {
  const { user } = useAuthStore();
  const { getOrdersByClient, initializeSampleData } = useOrdersStore();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    // Initialize sample data
    initializeSampleData();
    
    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  const userOrders = user ? getOrdersByClient(user.id) : [];
  const activeOrders = userOrders.filter(order => 
    !["delivered", "cancelled"].includes(order.status)
  );
  const completedOrders = userOrders.filter(order => 
    order.status === "delivered"
  );

  const quickActions = [
    {
      id: "book",
      title: "Book Delivery",
      subtitle: "Send packages anywhere",
      icon: Package,
      gradient: [colors.primary, colors.primaryDark],
      route: "/booking",
      featured: true
    },
    {
      id: "track",
      title: "Track Order",
      subtitle: "Follow your package",
      icon: MapPin,
      gradient: [colors.accent, colors.accentDark],
      route: "/tracking"
    },
    {
      id: "history",
      title: "Order History",
      subtitle: "View past deliveries",
      icon: History,
      gradient: [colors.info, "#3B82F6"],
      route: "/(client)/orders"
    },
    {
      id: "support",
      title: "Get Help",
      subtitle: "24/7 customer support",
      icon: Shield,
      gradient: [colors.success, "#10B981"],
      route: "/chat"
    }
  ];

  const stats = [
    {
      label: "Active Orders",
      value: activeOrders.length,
      icon: Truck,
      color: colors.primary
    },
    {
      label: "Completed",
      value: completedOrders.length,
      icon: Award,
      color: colors.success
    },
    {
      label: "This Month",
      value: userOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        return orderDate.getMonth() === now.getMonth() && 
               orderDate.getFullYear() === now.getFullYear();
      }).length,
      icon: TrendingUp,
      color: colors.accent
    }
  ];

  const recentActivity = userOrders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

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

  const getStatusEmoji = (status: string) => {
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </Text>
            </View>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>{greeting}!</Text>
              <Text style={styles.userName}>{user?.name || "Welcome"}</Text>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.push("/(client)/profile")}
            >
              <Bell size={24} color={colors.background} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => router.push("/(client)/profile")}
            >
              <Settings size={24} color={colors.background} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + "20" }]}>
                <stat.icon size={20} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={action.id}
                style={[
                  styles.quickActionCard,
                  action.featured && styles.featuredCard,
                  index % 2 === 0 ? styles.cardLeft : styles.cardRight
                ]}
                onPress={() => router.push(action.route as any)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={action.gradient}
                  style={[
                    styles.quickActionGradient,
                    action.featured && styles.featuredGradient
                  ]}
                >
                  {action.featured && (
                    <View style={styles.featuredBadge}>
                      <Star size={12} color={colors.warning} fill={colors.warning} />
                      <Text style={styles.featuredText}>POPULAR</Text>
                    </View>
                  )}
                  
                  <View style={styles.actionIconContainer}>
                    <action.icon 
                      size={action.featured ? 32 : 28} 
                      color={colors.background} 
                    />
                  </View>
                  
                  <View style={styles.actionContent}>
                    <Text style={[
                      styles.actionTitle,
                      action.featured && styles.featuredTitle
                    ]}>
                      {action.title}
                    </Text>
                    <Text style={[
                      styles.actionSubtitle,
                      action.featured && styles.featuredSubtitle
                    ]}>
                      {action.subtitle}
                    </Text>
                  </View>
                  
                  <ChevronRight 
                    size={20} 
                    color={colors.background + "80"} 
                    style={styles.actionChevron}
                  />
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Active Orders */}
        {activeOrders.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Orders</Text>
              <TouchableOpacity 
                onPress={() => router.push("/(client)/orders")}
                style={styles.seeAllButton}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <ChevronRight size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.ordersScroll}
            >
              {activeOrders.slice(0, 3).map((order) => (
                <TouchableOpacity
                  key={order.id}
                  style={styles.orderCard}
                  onPress={() => router.push(`/tracking?orderId=${order.id}`)}
                >
                  <View style={styles.orderHeader}>
                    <View style={[
                      styles.orderStatusBadge, 
                      { backgroundColor: getStatusColor(order.status) + "20" }
                    ]}>
                      <Text style={styles.orderStatusEmoji}>
                        {getStatusEmoji(order.status)}
                      </Text>
                      <Text style={[
                        styles.orderStatusText,
                        { color: getStatusColor(order.status) }
                      ]}>
                        {order.status === "pending" ? "Finding Driver" :
                         order.status === "assigned" ? "Driver Assigned" :
                         order.status === "picked_up" ? "Picked Up" :
                         order.status === "in_transit" ? "In Transit" : order.status}
                      </Text>
                    </View>
                    <Text style={styles.orderPrice}>KSh {order.price}</Text>
                  </View>
                  
                  <View style={styles.orderRoute}>
                    <View style={styles.routePoint}>
                      <View style={[styles.routeDot, { backgroundColor: colors.primary }]} />
                      <Text style={styles.routeText} numberOfLines={1}>
                        {order.from}
                      </Text>
                    </View>
                    <View style={styles.routeLine} />
                    <View style={styles.routePoint}>
                      <View style={[styles.routeDot, { backgroundColor: colors.accent }]} />
                      <Text style={styles.routeText} numberOfLines={1}>
                        {order.to}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.orderFooter}>
                    <Text style={styles.orderTime}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </Text>
                    <View style={styles.trackButton}>
                      <Zap size={12} color={colors.primary} />
                      <Text style={styles.trackButtonText}>Track</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityContainer}>
              {recentActivity.map((order, index) => (
                <TouchableOpacity
                  key={order.id}
                  style={[
                    styles.activityItem,
                    index < recentActivity.length - 1 && styles.activityItemBorder
                  ]}
                  onPress={() => router.push(`/tracking?orderId=${order.id}`)}
                >
                  <View style={[
                    styles.activityIcon,
                    { backgroundColor: getStatusColor(order.status) + "20" }
                  ]}>
                    <Text style={styles.activityEmoji}>
                      {getStatusEmoji(order.status)}
                    </Text>
                  </View>
                  
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>
                      Order {order.id}
                    </Text>
                    <Text style={styles.activitySubtitle}>
                      {order.from} → {order.to}
                    </Text>
                    <Text style={styles.activityTime}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  <View style={styles.activityRight}>
                    <Text style={styles.activityPrice}>KSh {order.price}</Text>
                    <View style={[
                      styles.activityStatus,
                      { backgroundColor: getStatusColor(order.status) + "20" }
                    ]}>
                      <Text style={[
                        styles.activityStatusText,
                        { color: getStatusColor(order.status) }
                      ]}>
                        {order.status === "delivered" ? "Delivered" :
                         order.status === "cancelled" ? "Cancelled" :
                         order.status === "in_transit" ? "In Transit" : "Active"}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {userOrders.length === 0 && (
          <View style={styles.emptyState}>
            <LinearGradient
              colors={[colors.primaryLight, colors.backgroundSecondary]}
              style={styles.emptyStateGradient}
            >
              <Text style={styles.emptyStateEmoji}>📦</Text>
              <Text style={styles.emptyStateTitle}>Ready to Send?</Text>
              <Text style={styles.emptyStateSubtitle}>
                Book your first delivery and experience fast, reliable package delivery across Kenya.
              </Text>
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => router.push("/booking")}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.emptyStateButtonGradient}
                >
                  <Plus size={20} color={colors.background} />
                  <Text style={styles.emptyStateButtonText}>Book Your First Delivery</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {/* Promotional Banner */}
        <View style={styles.section}>
          <LinearGradient
            colors={[colors.accent, colors.accentDark]}
            style={styles.promoBanner}
          >
            <View style={styles.promoContent}>
              <View style={styles.promoIcon}>
                <Gift size={32} color={colors.background} />
              </View>
              <View style={styles.promoText}>
                <Text style={styles.promoTitle}>Special Offer! 🎉</Text>
                <Text style={styles.promoSubtitle}>
                  Get 20% off your next 3 deliveries with code PAKA20
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.promoButton}>
              <Text style={styles.promoButtonText}>Claim Now</Text>
            </TouchableOpacity>
          </LinearGradient>
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
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
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
  headerRight: {
    flexDirection: "row",
    gap: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    backdropFilter: "blur(10px)",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.background,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.background + "CC",
    fontWeight: "600",
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 32,
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
    color: colors.text,
    letterSpacing: -0.5,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 16,
  },
  quickActionCard: {
    width: (width - 56) / 2,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  featuredCard: {
    width: width - 40,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  cardLeft: {
    marginRight: 8,
  },
  cardRight: {
    marginLeft: 8,
  },
  quickActionGradient: {
    padding: 20,
    minHeight: 120,
    position: "relative",
  },
  featuredGradient: {
    minHeight: 140,
    padding: 24,
  },
  featuredBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  featuredText: {
    fontSize: 10,
    color: colors.background,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.background,
    marginBottom: 4,
  },
  featuredTitle: {
    fontSize: 18,
  },
  actionSubtitle: {
    fontSize: 12,
    color: colors.background + "CC",
    fontWeight: "500",
  },
  featuredSubtitle: {
    fontSize: 14,
  },
  actionChevron: {
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  ordersScroll: {
    paddingRight: 20,
  },
  orderCard: {
    width: 280,
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  orderStatusEmoji: {
    fontSize: 12,
  },
  orderStatusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.text,
  },
  orderRoute: {
    marginBottom: 12,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 2,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  routeText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: "500",
    flex: 1,
  },
  routeLine: {
    width: 2,
    height: 12,
    backgroundColor: colors.border,
    marginLeft: 3,
    marginVertical: 2,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderTime: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "500",
  },
  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  trackButtonText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: "700",
  },
  activityContainer: {
    backgroundColor: colors.background,
    borderRadius: 16,
    marginTop: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  activityItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityEmoji: {
    fontSize: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "500",
  },
  activityRight: {
    alignItems: "flex-end",
  },
  activityPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 4,
  },
  activityStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activityStatusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  emptyState: {
    marginTop: 32,
    alignItems: "center",
  },
  emptyStateGradient: {
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 48,
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
  promoBanner: {
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  promoContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  promoIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  promoText: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.background,
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 14,
    color: colors.background + "CC",
    fontWeight: "500",
    lineHeight: 20,
  },
  promoButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  promoButtonText: {
    fontSize: 14,
    color: colors.background,
    fontWeight: "700",
  },
});