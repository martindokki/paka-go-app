import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from "react-native";
import { DollarSign, TrendingUp, Clock, Package, Award, Zap, Target, Calendar } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";

const { width } = Dimensions.get("window");

export default function EarningsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month">("today");

  const earningsData = {
    today: {
      totalEarnings: 2450,
      ordersCompleted: 8,
      hoursWorked: 6.5,
      averagePerOrder: 306,
      tips: 180,
      breakdown: [
        { time: "9:00 AM", amount: 320, orders: 1, tip: 20 },
        { time: "10:30 AM", amount: 450, orders: 1, tip: 50 },
        { time: "12:15 PM", amount: 280, orders: 1, tip: 0 },
        { time: "1:45 PM", amount: 380, orders: 1, tip: 30 },
        { time: "3:20 PM", amount: 520, orders: 2, tip: 40 },
        { time: "5:00 PM", amount: 500, orders: 2, tip: 40 },
      ],
    },
    week: {
      totalEarnings: 15680,
      ordersCompleted: 52,
      hoursWorked: 42,
      averagePerOrder: 302,
      tips: 1240,
      breakdown: [
        { time: "Monday", amount: 2450, orders: 8, tip: 180 },
        { time: "Tuesday", amount: 2180, orders: 7, tip: 160 },
        { time: "Wednesday", amount: 2890, orders: 9, tip: 220 },
        { time: "Thursday", amount: 2340, orders: 8, tip: 190 },
        { time: "Friday", amount: 3120, orders: 10, tip: 280 },
        { time: "Saturday", amount: 2700, orders: 10, tip: 210 },
      ],
    },
    month: {
      totalEarnings: 68450,
      ordersCompleted: 224,
      hoursWorked: 180,
      averagePerOrder: 305,
      tips: 5680,
      breakdown: [
        { time: "Week 1", amount: 15680, orders: 52, tip: 1240 },
        { time: "Week 2", amount: 17230, orders: 58, tip: 1450 },
        { time: "Week 3", amount: 16890, orders: 55, tip: 1380 },
        { time: "Week 4", amount: 18650, orders: 59, tip: 1610 },
      ],
    },
  };

  const currentData = earningsData[selectedPeriod];

  const periods = [
    { key: "today", label: "Today", emoji: "📅" },
    { key: "week", label: "This Week", emoji: "📊" },
    { key: "month", label: "This Month", emoji: "📈" },
  ];

  const achievements = [
    { title: "Top Performer", description: "Highest earnings this week", icon: "🏆", unlocked: true },
    { title: "Speed Demon", description: "Fastest delivery time", icon: "⚡", unlocked: true },
    { title: "Customer Favorite", description: "5-star rating streak", icon: "⭐", unlocked: false },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={[Colors.light.warning, "#F59E0B"]}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Earnings Dashboard 💰</Text>
            <Text style={styles.subtitle}>Track your income and performance</Text>
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

        <LinearGradient
          colors={[Colors.light.success, "#10B981"]}
          style={styles.totalEarningsCard}
        >
          <View style={styles.earningsHeader}>
            <View style={styles.earningsIconContainer}>
              <DollarSign size={32} color={Colors.light.background} />
            </View>
            <View style={styles.earningsContent}>
              <Text style={styles.totalEarningsLabel}>Total Earnings</Text>
              <Text style={styles.totalEarningsAmount}>
                KSh {currentData.totalEarnings.toLocaleString()}
              </Text>
              <View style={styles.earningsGrowth}>
                <TrendingUp size={16} color={Colors.light.background} />
                <Text style={styles.growthText}>+12% from last {selectedPeriod}</Text>
              </View>
            </View>
          </View>
          
          {currentData.tips > 0 && (
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsLabel}>💡 Tips Earned</Text>
              <Text style={styles.tipsAmount}>KSh {currentData.tips.toLocaleString()}</Text>
            </View>
          )}
        </LinearGradient>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={[Colors.light.primary, Colors.light.primaryDark]}
              style={styles.statGradient}
            >
              <Package size={20} color={Colors.light.background} />
              <Text style={styles.statNumber}>{currentData.ordersCompleted}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.statCard}>
            <LinearGradient
              colors={[Colors.light.accent, Colors.light.accentDark]}
              style={styles.statGradient}
            >
              <Clock size={20} color={Colors.light.background} />
              <Text style={styles.statNumber}>{currentData.hoursWorked}h</Text>
              <Text style={styles.statLabel}>Hours</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.statCard}>
            <LinearGradient
              colors={[Colors.light.info, "#3B82F6"]}
              style={styles.statGradient}
            >
              <Target size={20} color={Colors.light.background} />
              <Text style={styles.statNumber}>KSh {currentData.averagePerOrder}</Text>
              <Text style={styles.statLabel}>Avg/Order</Text>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Achievements 🏆</Text>
          <View style={styles.achievementsContainer}>
            {achievements.map((achievement, index) => (
              <View
                key={index}
                style={[
                  styles.achievementCard,
                  !achievement.unlocked && styles.achievementCardLocked,
                ]}
              >
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <View style={styles.achievementContent}>
                  <Text
                    style={[
                      styles.achievementTitle,
                      !achievement.unlocked && styles.achievementTitleLocked,
                    ]}
                  >
                    {achievement.title}
                  </Text>
                  <Text
                    style={[
                      styles.achievementDescription,
                      !achievement.unlocked && styles.achievementDescriptionLocked,
                    ]}
                  >
                    {achievement.description}
                  </Text>
                </View>
                {achievement.unlocked && (
                  <View style={styles.unlockedBadge}>
                    <Award size={16} color={Colors.light.warning} />
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.breakdownContainer}>
          <View style={styles.breakdownHeader}>
            <Calendar size={20} color={Colors.light.primary} />
            <Text style={styles.sectionTitle}>Earnings Breakdown</Text>
          </View>
          <View style={styles.breakdownList}>
            {currentData.breakdown.map((item, index) => (
              <View key={index} style={styles.breakdownItem}>
                <View style={styles.breakdownLeft}>
                  <Text style={styles.breakdownTime}>{item.time}</Text>
                  <Text style={styles.breakdownOrders}>
                    {item.orders} order{item.orders > 1 ? "s" : ""}
                    {item.tip > 0 && ` • KSh ${item.tip} tip`}
                  </Text>
                </View>
                <Text style={styles.breakdownAmount}>
                  KSh {item.amount.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <LinearGradient
          colors={[Colors.light.accent, Colors.light.accentDark]}
          style={styles.payoutContainer}
        >
          <View style={styles.payoutHeader}>
            <View style={styles.payoutIconContainer}>
              <Zap size={24} color={Colors.light.background} />
            </View>
            <Text style={styles.payoutTitle}>Payout Information 💳</Text>
          </View>
          
          <View style={styles.payoutDetails}>
            <View style={styles.payoutItem}>
              <Text style={styles.payoutLabel}>Bank Account</Text>
              <Text style={styles.payoutValue}>KCB Bank - ****1234</Text>
            </View>
            <View style={styles.payoutItem}>
              <Text style={styles.payoutLabel}>Next Payout</Text>
              <Text style={styles.payoutValue}>Friday, Dec 20, 2024</Text>
            </View>
            <View style={styles.payoutItem}>
              <Text style={styles.payoutLabel}>Pending Amount</Text>
              <Text style={styles.payoutValue}>KSh {currentData.totalEarnings.toLocaleString()}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.editPayoutButton}>
            <Text style={styles.editPayoutText}>Edit Payout Details</Text>
          </TouchableOpacity>
        </LinearGradient>
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
    color: Colors.light.background,
    marginBottom: 4,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.background + "CC",
    fontWeight: "500",
  },
  periodSelector: {
    flexDirection: "row",
    margin: 20,
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 4,
    shadowColor: Colors.light.shadow,
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
    backgroundColor: Colors.light.primary,
    shadowColor: Colors.light.primary,
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
    color: Colors.light.textMuted,
  },
  activePeriodText: {
    color: Colors.light.background,
    fontWeight: "700",
  },
  totalEarningsCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: Colors.light.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  earningsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  earningsIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  earningsContent: {
    flex: 1,
  },
  totalEarningsLabel: {
    fontSize: 16,
    color: Colors.light.background + "CC",
    marginBottom: 4,
    fontWeight: "600",
  },
  totalEarningsAmount: {
    fontSize: 32,
    fontWeight: "900",
    color: Colors.light.background,
    marginBottom: 8,
    letterSpacing: -1,
  },
  earningsGrowth: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  growthText: {
    fontSize: 14,
    color: Colors.light.background + "CC",
    fontWeight: "600",
  },
  tipsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    padding: 16,
  },
  tipsLabel: {
    fontSize: 14,
    color: Colors.light.background + "CC",
    fontWeight: "600",
  },
  tipsAmount: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.light.background,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    shadowColor: Colors.light.shadow,
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
    color: Colors.light.background,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.light.background + "CC",
    textAlign: "center",
    fontWeight: "600",
  },
  achievementsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.light.text,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  achievementsContainer: {
    gap: 12,
  },
  achievementCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  achievementCardLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 2,
  },
  achievementTitleLocked: {
    color: Colors.light.textMuted,
  },
  achievementDescription: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: "500",
  },
  achievementDescriptionLocked: {
    color: Colors.light.textMuted,
  },
  unlockedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.warning + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  breakdownContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  breakdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  breakdownList: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  breakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  breakdownLeft: {
    flex: 1,
  },
  breakdownTime: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 2,
  },
  breakdownOrders: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: "500",
  },
  breakdownAmount: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.light.text,
  },
  payoutContainer: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: Colors.light.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  payoutHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  payoutIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  payoutTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.light.background,
  },
  payoutDetails: {
    gap: 12,
    marginBottom: 20,
  },
  payoutItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  payoutLabel: {
    fontSize: 14,
    color: Colors.light.background + "CC",
    fontWeight: "600",
  },
  payoutValue: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.light.background,
  },
  editPayoutButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  editPayoutText: {
    fontSize: 14,
    color: Colors.light.background,
    fontWeight: "700",
  },
});