import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { Package, MapPin, Clock, Plus, Bell, Star, Zap, Send, TrendingUp, User } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "@/constants/colors";
import { useOrdersStore } from "@/stores/orders-store";
import { useAuthStore } from "@/stores/auth-store";

const { width } = Dimensions.get("window");

export default function ClientHomeScreen() {
  const { user } = useAuthStore();
  const { getOrdersByClient, initializeSampleData } = useOrdersStore();
  const [refreshing, setRefreshing] = React.useState(false);

  // Initialize sample data on component mount
  React.useEffect(() => {
    initializeSampleData();
  }, []);

  const userOrders = user ? getOrdersByClient(user.id) : [];
  const recentOrders = userOrders.slice(0, 3);
  const totalOrders = userOrders.length;
  const totalSpent = userOrders.reduce((sum, order) => sum + order.price, 0);
  const avgRating = 4.8; // Could be calculated from actual ratings

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const quickActions = [
    {
      id: "book",
      title: "Send Package",
      subtitle: "Quick & reliable delivery",
      icon: Send,
      gradient: [colors.primary, colors.primaryDark] as const,
      onPress: () => router.push("/booking/"),
    },
    {
      id: "track",
      title: "Track Order",
      subtitle: "Real-time tracking",
      icon: MapPin,
      gradient: [colors.accent, colors.accentDark] as const,
      onPress: () => router.push("/(client)/orders"),
    },
    {
      id: "map",
      title: "Map View",
      subtitle: "Explore delivery areas",
      icon: MapPin,
      gradient: [colors.success, colors.successDark] as const,
      onPress: () => router.push("/map"),
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return colors.success;
      case "in_transit":
      case "assigned":
      case "picked_up":
        return colors.primary;
      case "pending":
        return colors.warning;
      default:
        return colors.textMuted;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "delivered":
        return "Delivered";
      case "in_transit":
        return "In Transit";
      case "assigned":
        return "Driver Assigned";
      case "picked_up":
        return "Picked Up";
      case "pending":
        return "Finding Driver";
      default:
        return status;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Jambo! 👋</Text>
            <Text style={styles.userName}>{user?.name || "User"}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={22} color={colors.text} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.statsCard}
        >
          <View style={styles.statItem}>
            <Zap size={24} color={colors.background} />
            <Text style={styles.statNumber}>{totalOrders}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Star size={24} color={colors.background} />
            <Text style={styles.statNumber}>{avgRating}</Text>
            <Text style={styles.statLabel}>Your Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <TrendingUp size={24} color={colors.background} />
            <Text style={styles.statNumber}>KSh {(totalSpent / 1000).toFixed(1)}K</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
        </LinearGradient>

        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                onPress={action.onPress}
              >
                <LinearGradient
                  colors={action.gradient}
                  style={styles.quickActionGradient}
                >
                  <View style={styles.quickActionIcon}>
                    <action.icon size={32} color={colors.background} />
                  </View>
                  <View style={styles.quickActionContent}>
                    <Text style={styles.quickActionTitle}>{action.title}</Text>
                    <Text style={styles.quickActionSubtitle}>{action.subtitle}</Text>
                  </View>
                  <View style={styles.quickActionArrow}>
                    <Plus size={20} color={colors.background} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.recentOrdersContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => router.push("/(client)/orders")}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recentOrders.length > 0 ? (
            <View style={styles.recentOrders}>
              {recentOrders.map((order) => (
                <TouchableOpacity 
                  key={order.id} 
                  style={styles.orderCard}
                  onPress={() => router.push(`/tracking?orderId=${order.id}`)}
                >
                  <View style={styles.orderHeader}>
                    <View style={styles.orderRoute}>
                      <View style={styles.routePoint}>
                        <View style={[styles.routeDot, styles.routeDotStart]} />
                        <Text style={styles.routeText} numberOfLines={1}>{order.from}</Text>
                      </View>
                      <View style={styles.routeLine} />
                      <View style={styles.routePoint}>
                        <View style={[styles.routeDot, styles.routeDotEnd]} />
                        <Text style={styles.routeText} numberOfLines={1}>{order.to}</Text>
                      </View>
                    </View>
                    <View style={styles.orderMeta}>
                      <Text style={styles.orderPrice}>KSh {order.price}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(order.status) + "20" },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            { color: getStatusColor(order.status) },
                          ]}
                        >
                          {getStatusText(order.status)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.orderFooter}>
                    <Text style={styles.orderTime}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </Text>
                    <View style={styles.orderRating}>
                      <Package size={14} color={colors.textMuted} />
                      <Text style={styles.packageText}>{order.packageType}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyOrders}>
              <LinearGradient
                colors={[colors.primaryLight, colors.backgroundSecondary]}
                style={styles.emptyOrdersGradient}
              >
                <Package size={48} color={colors.primary} />
                <Text style={styles.emptyOrdersTitle}>No Orders Yet</Text>
                <Text style={styles.emptyOrdersSubtitle}>
                  Ready to send your first package? Tap below to get started!
                </Text>
                <TouchableOpacity 
                  style={styles.emptyOrdersButton}
                  onPress={() => router.push("/booking/")}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    style={styles.emptyOrdersButtonGradient}
                  >
                    <Send size={20} color={colors.background} />
                    <Text style={styles.emptyOrdersButtonText}>Book First Delivery</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}
        </View>

        <View style={styles.mpesaPromo}>
          <LinearGradient
            colors={[colors.mpesa, "#00B85C"]}
            style={styles.mpesaCard}
          >
            <View style={styles.mpesaContent}>
              <Text style={styles.mpesaTitle}>Pay with M-Pesa</Text>
              <Text style={styles.mpesaSubtitle}>
                Fast, secure payments with your mobile money
              </Text>
            </View>
            <View style={styles.mpesaIcon}>
              <Text style={styles.mpesaText}>M-PESA</Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.profileSection}>
          <TouchableOpacity 
            style={styles.profileCard}
            onPress={() => router.push("/(client)/profile")}
          >
            <LinearGradient
              colors={[colors.accent, colors.accentDark]}
              style={styles.profileGradient}
            >
              <View style={styles.profileIcon}>
                <User size={24} color={colors.background} />
              </View>
              <View style={styles.profileContent}>
                <Text style={styles.profileTitle}>Complete Your Profile</Text>
                <Text style={styles.profileSubtitle}>
                  Add more details for better delivery experience
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.floatingButton} onPress={() => router.push("/booking/")}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.floatingButtonGradient}
        >
          <Send size={28} color={colors.background} />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  userName: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.text,
    marginTop: 4,
    letterSpacing: -1,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  notificationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    position: "absolute",
    top: 12,
    right: 12,
  },
  statsCard: {
    flexDirection: "row",
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.background,
  },
  statLabel: {
    fontSize: 12,
    color: colors.background + "CC",
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.background + "40",
    marginHorizontal: 16,
  },
  quickActionsContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  quickActions: {
    gap: 16,
  },
  quickActionCard: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  quickActionGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.background,
    marginBottom: 6,
  },
  quickActionSubtitle: {
    fontSize: 14,
    color: colors.background + "CC",
    fontWeight: "500",
  },
  quickActionArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  recentOrdersContainer: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "700",
  },
  recentOrders: {
    gap: 16,
  },
  orderCard: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  orderRoute: {
    flex: 1,
    marginRight: 16,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
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
  orderMeta: {
    alignItems: "flex-end",
    gap: 8,
  },
  orderPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderTime: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  orderRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  packageText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  emptyOrders: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyOrdersGradient: {
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 40,
    borderRadius: 24,
    maxWidth: 320,
  },
  emptyOrdersTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyOrdersSubtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
    fontWeight: "500",
  },
  emptyOrdersButton: {
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyOrdersButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  emptyOrdersButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.background,
  },
  mpesaPromo: {
    marginBottom: 32,
  },
  mpesaCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    padding: 20,
    shadowColor: colors.mpesa,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  mpesaContent: {
    flex: 1,
  },
  mpesaTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.background,
    marginBottom: 4,
  },
  mpesaSubtitle: {
    fontSize: 14,
    color: colors.background + "CC",
    fontWeight: "500",
  },
  mpesaIcon: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  mpesaText: {
    fontSize: 12,
    fontWeight: "900",
    color: colors.background,
    letterSpacing: 1,
  },
  profileSection: {
    marginBottom: 20,
  },
  profileCard: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  profileGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  profileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  profileContent: {
    flex: 1,
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.background,
    marginBottom: 4,
  },
  profileSubtitle: {
    fontSize: 14,
    color: colors.background + "CC",
    fontWeight: "500",
  },
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    borderRadius: 32,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  floatingButtonGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
});