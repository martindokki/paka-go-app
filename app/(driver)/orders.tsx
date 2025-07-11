import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Dimensions,
} from "react-native";
import { Package, Clock, MapPin, Star, TrendingUp, Award, Zap } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "@/constants/colors";

const { width } = Dimensions.get("window");

type OrderStatus = "completed" | "cancelled";

interface DriverOrder {
  id: string;
  from: string;
  to: string;
  status: OrderStatus;
  customerName: string;
  price: string;
  date: string;
  rating?: number;
  distance: string;
  duration: string;
  tip?: string;
  packageType: string;
}

export default function DriverOrdersScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month">("today");

  const orders: DriverOrder[] = [
    {
      id: "1",
      from: "Westlands Mall",
      to: "Karen Shopping Centre",
      status: "completed",
      customerName: "John Doe",
      price: "KSh 450",
      date: "Today, 2:30 PM",
      rating: 5,
      distance: "12.5 km",
      duration: "25 mins",
      tip: "KSh 50",
      packageType: "Documents",
    },
    {
      id: "2",
      from: "CBD Post Office",
      to: "Kilimani",
      status: "completed",
      customerName: "Mary Smith",
      price: "KSh 320",
      date: "Today, 1:15 PM",
      rating: 4,
      distance: "8.2 km",
      duration: "18 mins",
      packageType: "Small Package",
    },
    {
      id: "3",
      from: "Sarit Centre",
      to: "Lavington",
      status: "completed",
      customerName: "Peter Wilson",
      price: "KSh 280",
      date: "Today, 11:45 AM",
      rating: 5,
      distance: "6.8 km",
      duration: "15 mins",
      tip: "KSh 30",
      packageType: "Electronics",
    },
    {
      id: "4",
      from: "Junction Mall",
      to: "Runda",
      status: "cancelled",
      customerName: "Grace Akinyi",
      price: "KSh 520",
      date: "Yesterday, 4:20 PM",
      distance: "15.2 km",
      duration: "30 mins",
      packageType: "Clothing",
    },
  ];

  const periods = [
    { key: "today", label: "Today", emoji: "📅" },
    { key: "week", label: "This Week", emoji: "📊" },
    { key: "month", label: "This Month", emoji: "📈" },
  ];

  const stats = {
    totalOrders: orders.filter(o => o.status === "completed").length,
    totalEarnings: orders
      .filter(o => o.status === "completed")
      .reduce((sum, order) => {
        const price = parseInt(order.price.replace("KSh ", ""));
        const tip = order.tip ? parseInt(order.tip.replace("KSh ", "")) : 0;
        return sum + price + tip;
      }, 0),
    averageRating: orders
      .filter(o => o.rating)
      .reduce((sum, order) => sum + (order.rating || 0), 0) / orders.filter(o => o.rating).length,
    totalTips: orders
      .filter(o => o.tip)
      .reduce((sum, order) => sum + parseInt(order.tip?.replace("KSh ", "") || "0"), 0),
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

  const renderOrderItem = ({ item }: { item: DriverOrder }) => (
    <TouchableOpacity style={styles.orderCard}>
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
          <Text style={styles.orderPrice}>{item.price}</Text>
          {item.tip && (
            <View style={styles.tipBadge}>
              <Text style={styles.tipText}>+{item.tip} tip 💰</Text>
            </View>
          )}
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  item.status === "completed"
                    ? colors.success + "20"
                    : colors.error + "20",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    item.status === "completed"
                      ? colors.success
                      : colors.error,
                },
              ]}
            >
              {item.status === "completed" ? "✅ Completed" : "❌ Cancelled"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.customerName}>👤 Customer: {item.customerName}</Text>
        <Text style={styles.packageType}>📦 {item.packageType}</Text>
        <Text style={styles.orderDate}>🕐 {item.date}</Text>
      </View>

      <View style={styles.orderStats}>
        <View style={styles.statItem}>
          <MapPin size={14} color={colors.textMuted} />
          <Text style={styles.statText}>{item.distance}</Text>
        </View>
        <View style={styles.statItem}>
          <Clock size={14} color={colors.textMuted} />
          <Text style={styles.statText}>{item.duration}</Text>
        </View>
        {item.rating && (
          <View style={styles.ratingContainer}>
            {renderStarRating(item.rating)}
            <Text style={styles.ratingText}>({item.rating}.0)</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

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
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.ordersList}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Zap size={20} color={colors.primary} />
            <Text style={styles.listHeaderText}>Recent Deliveries</Text>
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
});