import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import { router } from "expo-router";
import {
  Package,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  MapPin,
  AlertCircle,
  Star,
  Activity,
  LogOut,
  Bell,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";

const { width } = Dimensions.get("window");

export default function AdminDashboard() {
  const stats = {
    totalOrders: 1247,
    activeOrders: 23,
    totalUsers: 856,
    activeDrivers: 45,
    totalRevenue: 125680,
    todayRevenue: 8450,
    avgRating: 4.7,
    completionRate: 94,
  };

  const recentOrders = [
    {
      id: "ORD-001",
      customer: "John Doe",
      driver: "Peter Mwangi",
      from: "Westlands",
      to: "Karen",
      status: "in_transit",
      amount: "KSh 450",
      time: "10 mins ago",
    },
    {
      id: "ORD-002",
      customer: "Mary Smith",
      driver: "Grace Akinyi",
      from: "CBD",
      to: "Kilimani",
      status: "delivered",
      amount: "KSh 320",
      time: "25 mins ago",
    },
    {
      id: "ORD-003",
      customer: "Peter Wilson",
      driver: "Unassigned",
      from: "Sarit Centre",
      to: "Lavington",
      status: "pending",
      amount: "KSh 280",
      time: "1 hour ago",
    },
  ];

  const alerts = [
    {
      id: "1",
      type: "warning",
      message: "3 orders pending driver assignment",
      time: "5 mins ago",
      priority: "high",
    },
    {
      id: "2",
      type: "info",
      message: "New driver registration: James Kiprotich",
      time: "15 mins ago",
      priority: "medium",
    },
    {
      id: "3",
      type: "success",
      message: "Daily revenue target achieved",
      time: "1 hour ago",
      priority: "low",
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout from admin panel?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => router.replace("/auth"),
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return Colors.light.warning;
      case "in_transit":
        return Colors.light.primary;
      case "delivered":
        return Colors.light.success;
      default:
        return Colors.light.textMuted;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "in_transit":
        return "In Transit";
      case "delivered":
        return "Delivered";
      default:
        return status;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning":
        return AlertCircle;
      case "success":
        return TrendingUp;
      default:
        return AlertCircle;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "warning":
        return Colors.light.warning;
      case "success":
        return Colors.light.success;
      default:
        return Colors.light.primary;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Admin Dashboard</Text>
            <Text style={styles.subtitle}>PAKA Go Management Portal</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerButton}>
              <Bell size={20} color={Colors.light.text} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LinearGradient
                colors={[Colors.light.error, "#DC2626"]}
                style={styles.logoutGradient}
              >
                <LogOut size={18} color={Colors.light.background} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.liveStatus}>
          <View style={styles.liveIndicator}>
            <Activity size={16} color={Colors.light.success} />
            <Text style={styles.liveText}>System Online</Text>
          </View>
          <Text style={styles.liveSubtext}>All services operational</Text>
        </View>

        <View style={styles.statsGrid}>
          <LinearGradient
            colors={[Colors.light.primary, Colors.light.primaryDark]}
            style={[styles.statCard, styles.statCardLarge]}
          >
            <View style={styles.statCardHeader}>
              <Package size={24} color={Colors.light.background} />
              <Text style={styles.statNumberWhite}>{stats.totalOrders.toLocaleString()}</Text>
            </View>
            <Text style={styles.statLabelWhite}>Total Orders</Text>
            <Text style={styles.statSubtextWhite}>{stats.activeOrders} active now</Text>
          </LinearGradient>
          
          <LinearGradient
            colors={[Colors.light.success, "#10B981"]}
            style={[styles.statCard, styles.statCardLarge]}
          >
            <View style={styles.statCardHeader}>
              <DollarSign size={24} color={Colors.light.background} />
              <Text style={styles.statNumberWhite}>KSh {(stats.totalRevenue / 1000).toFixed(0)}K</Text>
            </View>
            <Text style={styles.statLabelWhite}>Total Revenue</Text>
            <Text style={styles.statSubtextWhite}>KSh {stats.todayRevenue.toLocaleString()} today</Text>
          </LinearGradient>

          <View style={styles.statCard}>
            <Users size={20} color={Colors.light.accent} />
            <Text style={styles.statNumber}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          
          <View style={styles.statCard}>
            <Star size={20} color={Colors.light.warning} />
            <Text style={styles.statNumber}>{stats.avgRating}</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
          
          <View style={styles.statCard}>
            <TrendingUp size={20} color={Colors.light.info} />
            <Text style={styles.statNumber}>{stats.completionRate}%</Text>
            <Text style={styles.statLabel}>Completion</Text>
          </View>
          
          <View style={styles.statCard}>
            <Activity size={20} color={Colors.light.primary} />
            <Text style={styles.statNumber}>{stats.activeDrivers}</Text>
            <Text style={styles.statLabel}>Online Drivers</Text>
          </View>
        </View>

        <View style={styles.alertsContainer}>
          <Text style={styles.sectionTitle}>System Alerts</Text>
          <View style={styles.alertsList}>
            {alerts.map((alert) => {
              const AlertIcon = getAlertIcon(alert.type);
              const alertColor = getAlertColor(alert.type);
              
              return (
                <View key={alert.id} style={[styles.alertCard, { borderLeftColor: alertColor }]}>
                  <View style={[styles.alertIcon, { backgroundColor: alertColor + "20" }]}>
                    <AlertIcon size={16} color={alertColor} />
                  </View>
                  <View style={styles.alertContent}>
                    <Text style={styles.alertMessage}>{alert.message}</Text>
                    <Text style={styles.alertTime}>{alert.time}</Text>
                  </View>
                  <View style={[styles.priorityDot, { backgroundColor: alertColor }]} />
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.recentOrdersContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => router.push("/(admin)/orders")}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.ordersList}>
            {recentOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>{order.id}</Text>
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

                <View style={styles.orderRoute}>
                  <View style={styles.routePoint}>
                    <View style={[styles.routeDot, styles.routeDotStart]} />
                    <Text style={styles.routeText}>{order.from}</Text>
                  </View>
                  <View style={styles.routeLine} />
                  <View style={styles.routePoint}>
                    <View style={[styles.routeDot, styles.routeDotEnd]} />
                    <Text style={styles.routeText}>{order.to}</Text>
                  </View>
                </View>

                <View style={styles.orderDetails}>
                  <View style={styles.orderParticipants}>
                    <Text style={styles.participantText}>Customer: {order.customer}</Text>
                    <Text style={styles.participantText}>
                      Driver: {order.driver || "Unassigned"}
                    </Text>
                  </View>
                  <View style={styles.orderMeta}>
                    <Text style={styles.orderAmount}>{order.amount}</Text>
                    <Text style={styles.orderTime}>{order.time}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push("/(admin)/orders")}
            >
              <LinearGradient
                colors={[Colors.light.primary, Colors.light.primaryDark]}
                style={styles.actionButtonGradient}
              >
                <Package size={20} color={Colors.light.background} />
                <Text style={styles.actionButtonText}>Manage Orders</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push("/(admin)/users")}
            >
              <LinearGradient
                colors={[Colors.light.accent, Colors.light.accentDark]}
                style={styles.actionButtonGradient}
              >
                <Users size={20} color={Colors.light.background} />
                <Text style={styles.actionButtonText}>User Management</Text>
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
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
    position: "absolute",
    top: 10,
    right: 10,
  },
  logoutButton: {
    borderRadius: 22,
    shadowColor: Colors.light.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  liveStatus: {
    backgroundColor: Colors.light.success + "10",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.light.success + "30",
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  liveText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.success,
  },
  liveSubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: "500",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 56) / 3,
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 8,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statCardLarge: {
    minWidth: (width - 44) / 2,
  },
  statCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  statNumberWhite: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.background,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textMuted,
    textAlign: "center",
  },
  statLabelWhite: {
    fontSize: 12,
    color: Colors.light.background + "CC",
    textAlign: "center",
  },
  statSubtext: {
    fontSize: 10,
    color: Colors.light.textMuted,
    textAlign: "center",
  },
  statSubtextWhite: {
    fontSize: 10,
    color: Colors.light.background + "CC",
    textAlign: "center",
  },
  alertsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 16,
  },
  alertsList: {
    gap: 8,
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 12,
    gap: 12,
    borderLeftWidth: 4,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  alertIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 2,
    fontWeight: "500",
  },
  alertTime: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  recentOrdersContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: "600",
  },
  ordersList: {
    gap: 12,
  },
  orderCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.light.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  orderRoute: {
    marginBottom: 12,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  routeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
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
    fontWeight: "500",
  },
  routeLine: {
    width: 1,
    height: 12,
    backgroundColor: Colors.light.border,
    marginLeft: 2,
    marginVertical: 2,
  },
  orderDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  orderParticipants: {
    flex: 1,
  },
  participantText: {
    fontSize: 12,
    color: Colors.light.textMuted,
    marginBottom: 2,
  },
  orderMeta: {
    alignItems: "flex-end",
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 2,
  },
  orderTime: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  quickActions: {
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.background,
  },
});