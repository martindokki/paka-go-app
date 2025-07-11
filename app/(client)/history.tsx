import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
} from "react-native";
import { Package, Calendar, TrendingUp } from "lucide-react-native";
import colors from "@/constants/colors";

interface HistoryOrder {
  id: string;
  from: string;
  to: string;
  price: string;
  date: string;
  packageType: string;
  rating: number;
}

export default function HistoryScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month");

  const historyOrders: HistoryOrder[] = [
    {
      id: "1",
      from: "Westlands",
      to: "Karen",
      price: "KSh 450",
      date: "Dec 15, 2024",
      packageType: "Documents",
      rating: 5,
    },
    {
      id: "2",
      from: "CBD",
      to: "Kilimani",
      price: "KSh 320",
      date: "Dec 14, 2024",
      packageType: "Small Package",
      rating: 4,
    },
    {
      id: "3",
      from: "Sarit Centre",
      to: "Lavington",
      price: "KSh 380",
      date: "Dec 12, 2024",
      packageType: "Electronics",
      rating: 5,
    },
    {
      id: "4",
      from: "Junction Mall",
      to: "Runda",
      price: "KSh 520",
      date: "Dec 10, 2024",
      packageType: "Clothing",
      rating: 4,
    },
  ];

  const stats = {
    totalOrders: historyOrders.length,
    totalSpent: historyOrders.reduce((sum, order) => {
      return sum + parseInt(order.price.replace("KSh ", ""));
    }, 0),
    averageRating: historyOrders.reduce((sum, order) => sum + order.rating, 0) / historyOrders.length,
  };

  const periods = [
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "year", label: "This Year" },
  ];

  const renderStarRating = (rating: number) => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text
            key={star}
            style={[
              styles.star,
              { color: star <= rating ? colors.warning : colors.border },
            ]}
          >
            ★
          </Text>
        ))}
      </View>
    );
  };

  const renderHistoryItem = ({ item }: { item: HistoryOrder }) => (
    <View style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <View style={styles.routeContainer}>
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
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{item.price}</Text>
        </View>
      </View>

      <View style={styles.historyDetails}>
        <View style={styles.packageInfo}>
          <Package size={14} color={colors.textMuted} />
          <Text style={styles.packageType}>{item.packageType}</Text>
        </View>
        <View style={styles.dateContainer}>
          <Calendar size={14} color={colors.textMuted} />
          <Text style={styles.date}>{item.date}</Text>
        </View>
      </View>

      <View style={styles.ratingContainer}>
        {renderStarRating(item.rating)}
        <Text style={styles.ratingText}>({item.rating}.0)</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Order History</Text>
      </View>

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
          <Package size={20} color={colors.primary} />
          <Text style={styles.statNumber}>{stats.totalOrders}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
        <View style={styles.statCard}>
          <TrendingUp size={20} color={colors.accent} />
          <Text style={styles.statNumber}>KSh {stats.totalSpent.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.warning }]}>
            {stats.averageRating.toFixed(1)}★
          </Text>
          <Text style={styles.statLabel}>Avg Rating</Text>
        </View>
      </View>

      <FlatList
        data={historyOrders}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.historyList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingBottom: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text,
  },
  periodSelector: {
    flexDirection: "row",
    margin: 20,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  activePeriodButton: {
    backgroundColor: colors.background,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textMuted,
  },
  activePeriodText: {
    color: colors.text,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
  },
  historyList: {
    padding: 20,
    paddingTop: 0,
  },
  historyCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  historyHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  routeContainer: {
    flex: 1,
    marginRight: 16,
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
    backgroundColor: colors.primary,
  },
  routeDotEnd: {
    backgroundColor: colors.accent,
  },
  routeText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
    flex: 1,
  },
  routeLine: {
    width: 1,
    height: 12,
    backgroundColor: colors.border,
    marginLeft: 2,
    marginVertical: 2,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
  },
  historyDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  packageInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  packageType: {
    fontSize: 12,
    color: colors.textMuted,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  date: {
    fontSize: 12,
    color: colors.textMuted,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  starContainer: {
    flexDirection: "row",
  },
  star: {
    fontSize: 14,
    marginRight: 2,
  },
  ratingText: {
    fontSize: 12,
    color: colors.textMuted,
  },
});