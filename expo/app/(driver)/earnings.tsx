import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Platform,
  StatusBar,
  Animated,
} from "react-native";
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Package, 
  Award, 
  Zap, 
  Target, 
  Calendar,
  Star,
  Trophy,
  Gift,
  Wallet,
  CreditCard,
  Smartphone,
  BarChart3,
  PieChart,
  Activity,
  Flame,
  Crown,
  Medal
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "@/constants/colors";

const { width, height } = Dimensions.get("window");

export default function EarningsScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month">("today");
  const [animatedValue] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [selectedPeriod]);

  const earningsData = {
    today: {
      totalEarnings: 2450,
      ordersCompleted: 8,
      hoursWorked: 6.5,
      averagePerOrder: 306,
      tips: 180,
      rating: 4.9,
      streak: 5,
      breakdown: [
        { time: "9:00 AM", amount: 320, orders: 1, tip: 20, location: "Westlands" },
        { time: "10:30 AM", amount: 450, orders: 1, tip: 50, location: "Karen" },
        { time: "12:15 PM", amount: 280, orders: 1, tip: 0, location: "CBD" },
        { time: "1:45 PM", amount: 380, orders: 1, tip: 30, location: "Kilimani" },
        { time: "3:20 PM", amount: 520, orders: 2, tip: 40, location: "Lavington" },
        { time: "5:00 PM", amount: 500, orders: 2, tip: 40, location: "Gigiri" },
      ],
    },
    week: {
      totalEarnings: 15680,
      ordersCompleted: 52,
      hoursWorked: 42,
      averagePerOrder: 302,
      tips: 1240,
      rating: 4.8,
      streak: 7,
      breakdown: [
        { time: "Monday", amount: 2450, orders: 8, tip: 180, location: "Various" },
        { time: "Tuesday", amount: 2180, orders: 7, tip: 160, location: "Various" },
        { time: "Wednesday", amount: 2890, orders: 9, tip: 220, location: "Various" },
        { time: "Thursday", amount: 2340, orders: 8, tip: 190, location: "Various" },
        { time: "Friday", amount: 3120, orders: 10, tip: 280, location: "Various" },
        { time: "Saturday", amount: 2700, orders: 10, tip: 210, location: "Various" },
      ],
    },
    month: {
      totalEarnings: 68450,
      ordersCompleted: 224,
      hoursWorked: 180,
      averagePerOrder: 305,
      tips: 5680,
      rating: 4.9,
      streak: 12,
      breakdown: [
        { time: "Week 1", amount: 15680, orders: 52, tip: 1240, location: "Various" },
        { time: "Week 2", amount: 17230, orders: 58, tip: 1450, location: "Various" },
        { time: "Week 3", amount: 16890, orders: 55, tip: 1380, location: "Various" },
        { time: "Week 4", amount: 18650, orders: 59, tip: 1610, location: "Various" },
      ],
    },
  };

  const currentData = earningsData[selectedPeriod];

  const periods = [
    { key: "today", label: "Today", emoji: "📅", color: colors.primary },
    { key: "week", label: "This Week", emoji: "📊", color: colors.accent },
    { key: "month", label: "This Month", emoji: "📈", color: colors.success },
  ];

  const achievements = [
    { 
      title: "Top Performer", 
      description: "Highest earnings this week", 
      icon: Trophy, 
      unlocked: true,
      color: colors.warning,
      progress: 100
    },
    { 
      title: "Speed Demon", 
      description: "Fastest delivery time", 
      icon: Zap, 
      unlocked: true,
      color: colors.accent,
      progress: 100
    },
    { 
      title: "Customer Favorite", 
      description: "5-star rating streak", 
      icon: Star, 
      unlocked: false,
      color: colors.info,
      progress: 80
    },
    { 
      title: "Marathon Runner", 
      description: "Complete 100 deliveries", 
      icon: Medal, 
      unlocked: false,
      color: colors.success,
      progress: 65
    },
  ];

  const quickStats = [
    {
      label: "Orders",
      value: currentData.ordersCompleted,
      icon: Package,
      gradient: [colors.primary, colors.primaryDark],
      change: "+12%"
    },
    {
      label: "Hours",
      value: `${currentData.hoursWorked}h`,
      icon: Clock,
      gradient: [colors.accent, colors.accentDark],
      change: "+8%"
    },
    {
      label: "Rating",
      value: currentData.rating,
      icon: Star,
      gradient: [colors.warning, "#F59E0B"],
      change: "+0.1"
    },
    {
      label: "Streak",
      value: `${currentData.streak} days`,
      icon: Flame,
      gradient: [colors.error, "#DC2626"],
      change: "+2"
    }
  ];

  const paymentMethods = [
    { name: "M-Pesa", percentage: 65, color: colors.mpesa, icon: Smartphone },
    { name: "Card", percentage: 25, color: colors.info, icon: CreditCard },
    { name: "Cash", percentage: 10, color: colors.success, icon: DollarSign },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.warning} />
      
      {/* Header */}
      <LinearGradient
        colors={[colors.warning, "#F59E0B"]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.crownContainer}>
              <Crown size={32} color={colors.background} />
            </View>
            <View>
              <Text style={styles.title}>Earnings Dashboard</Text>
              <Text style={styles.subtitle}>Track your income and performance</Text>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <View style={styles.totalEarningsCompact}>
              <Text style={styles.compactLabel}>Total</Text>
              <Text style={styles.compactAmount}>
                KSh {currentData.totalEarnings.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Period Selector */}
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
              <LinearGradient
                colors={selectedPeriod === period.key 
                  ? [period.color, period.color + "CC"] 
                  : ["transparent", "transparent"]
                }
                style={styles.periodGradient}
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
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Main Earnings Card */}
        <Animated.View style={[
          styles.totalEarningsCard,
          {
            opacity: animatedValue,
            transform: [{
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            }],
          }
        ]}>
          <LinearGradient
            colors={[colors.success, "#10B981"]}
            style={styles.earningsGradient}
          >
            <View style={styles.earningsHeader}>
              <View style={styles.earningsIconContainer}>
                <DollarSign size={40} color={colors.background} />
              </View>
              <View style={styles.earningsContent}>
                <Text style={styles.totalEarningsLabel}>Total Earnings</Text>
                <Text style={styles.totalEarningsAmount}>
                  KSh {currentData.totalEarnings.toLocaleString()}
                </Text>
                <View style={styles.earningsGrowth}>
                  <TrendingUp size={16} color={colors.background} />
                  <Text style={styles.growthText}>+12% from last {selectedPeriod}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.earningsDetails}>
              <View style={styles.earningsDetailItem}>
                <Text style={styles.detailLabel}>Base Earnings</Text>
                <Text style={styles.detailValue}>
                  KSh {(currentData.totalEarnings - currentData.tips).toLocaleString()}
                </Text>
              </View>
              <View style={styles.earningsDetailItem}>
                <Text style={styles.detailLabel}>Tips Earned</Text>
                <Text style={styles.detailValue}>
                  KSh {currentData.tips.toLocaleString()}
                </Text>
              </View>
              <View style={styles.earningsDetailItem}>
                <Text style={styles.detailLabel}>Avg per Order</Text>
                <Text style={styles.detailValue}>
                  KSh {currentData.averagePerOrder}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          {quickStats.map((stat, index) => (
            <Animated.View
              key={index}
              style={[
                styles.statCard,
                {
                  opacity: animatedValue,
                  transform: [{
                    translateY: animatedValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [30, 0],
                    }),
                  }],
                }
              ]}
            >
              <LinearGradient
                colors={stat.gradient}
                style={styles.statGradient}
              >
                <View style={styles.statHeader}>
                  <stat.icon size={24} color={colors.background} />
                  <Text style={styles.statChange}>{stat.change}</Text>
                </View>
                <Text style={styles.statNumber}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </LinearGradient>
            </Animated.View>
          ))}
        </View>

        {/* Performance Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
          <View style={styles.metricsContainer}>
            <View style={styles.metricCard}>
              <LinearGradient
                colors={[colors.info, "#3B82F6"]}
                style={styles.metricGradient}
              >
                <View style={styles.metricHeader}>
                  <Activity size={24} color={colors.background} />
                  <Text style={styles.metricTitle}>Efficiency</Text>
                </View>
                <Text style={styles.metricValue}>
                  {(currentData.totalEarnings / currentData.hoursWorked).toFixed(0)} KSh/hr
                </Text>
                <Text style={styles.metricSubtitle}>Earnings per hour</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.metricCard}>
              <LinearGradient
                colors={[colors.accent, colors.accentDark]}
                style={styles.metricGradient}
              >
                <View style={styles.metricHeader}>
                  <Target size={24} color={colors.background} />
                  <Text style={styles.metricTitle}>Completion</Text>
                </View>
                <Text style={styles.metricValue}>98.5%</Text>
                <Text style={styles.metricSubtitle}>Success rate</Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        {/* Payment Methods Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          <View style={styles.paymentMethodsContainer}>
            {paymentMethods.map((method, index) => (
              <View key={index} style={styles.paymentMethodItem}>
                <View style={styles.paymentMethodLeft}>
                  <View style={[styles.paymentMethodIcon, { backgroundColor: method.color + "20" }]}>
                    <method.icon size={20} color={method.color} />
                  </View>
                  <View style={styles.paymentMethodInfo}>
                    <Text style={styles.paymentMethodName}>{method.name}</Text>
                    <Text style={styles.paymentMethodPercentage}>{method.percentage}% of orders</Text>
                  </View>
                </View>
                <View style={styles.paymentMethodBar}>
                  <View 
                    style={[
                      styles.paymentMethodProgress, 
                      { 
                        width: `${method.percentage}%`,
                        backgroundColor: method.color 
                      }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <View style={styles.achievementsBadge}>
              <Trophy size={16} color={colors.warning} />
              <Text style={styles.achievementsCount}>
                {achievements.filter(a => a.unlocked).length}/{achievements.length}
              </Text>
            </View>
          </View>
          
          <View style={styles.achievementsContainer}>
            {achievements.map((achievement, index) => (
              <View
                key={index}
                style={[
                  styles.achievementCard,
                  !achievement.unlocked && styles.achievementCardLocked,
                ]}
              >
                <LinearGradient
                  colors={achievement.unlocked 
                    ? [achievement.color + "20", achievement.color + "10"]
                    : [colors.backgroundSecondary, colors.backgroundSecondary]
                  }
                  style={styles.achievementGradient}
                >
                  <View style={styles.achievementLeft}>
                    <View style={[
                      styles.achievementIconContainer,
                      { backgroundColor: achievement.color + (achievement.unlocked ? "20" : "10") }
                    ]}>
                      <achievement.icon 
                        size={24} 
                        color={achievement.unlocked ? achievement.color : colors.textMuted} 
                      />
                    </View>
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
                      {!achievement.unlocked && (
                        <View style={styles.progressContainer}>
                          <View style={styles.progressBar}>
                            <View 
                              style={[
                                styles.progressFill, 
                                { 
                                  width: `${achievement.progress}%`,
                                  backgroundColor: achievement.color 
                                }
                              ]} 
                            />
                          </View>
                          <Text style={styles.progressText}>{achievement.progress}%</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  {achievement.unlocked && (
                    <View style={[styles.unlockedBadge, { backgroundColor: achievement.color }]}>
                      <Award size={16} color={colors.background} />
                    </View>
                  )}
                </LinearGradient>
              </View>
            ))}
          </View>
        </View>

        {/* Earnings Breakdown */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Earnings Breakdown</Text>
            <View style={styles.breakdownToggle}>
              <BarChart3 size={16} color={colors.primary} />
            </View>
          </View>
          
          <View style={styles.breakdownList}>
            {currentData.breakdown.map((item, index) => (
              <View key={index} style={styles.breakdownItem}>
                <View style={styles.breakdownLeft}>
                  <View style={styles.breakdownTimeContainer}>
                    <Text style={styles.breakdownTime}>{item.time}</Text>
                    <Text style={styles.breakdownLocation}>{item.location}</Text>
                  </View>
                  <View style={styles.breakdownDetails}>
                    <Text style={styles.breakdownOrders}>
                      {item.orders} order{item.orders > 1 ? "s" : ""}
                    </Text>
                    {item.tip > 0 && (
                      <View style={styles.tipBadge}>
                        <Gift size={12} color={colors.success} />
                        <Text style={styles.tipText}>KSh {item.tip} tip</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.breakdownRight}>
                  <Text style={styles.breakdownAmount}>
                    KSh {item.amount.toLocaleString()}
                  </Text>
                  <View style={styles.breakdownProgress}>
                    <View 
                      style={[
                        styles.breakdownProgressFill,
                        { 
                          width: `${(item.amount / Math.max(...currentData.breakdown.map(b => b.amount))) * 100}%`
                        }
                      ]} 
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Payout Information */}
        <View style={styles.section}>
          <LinearGradient
            colors={[colors.accent, colors.accentDark]}
            style={styles.payoutContainer}
          >
            <View style={styles.payoutHeader}>
              <View style={styles.payoutIconContainer}>
                <Wallet size={28} color={colors.background} />
              </View>
              <View style={styles.payoutHeaderText}>
                <Text style={styles.payoutTitle}>Payout Information</Text>
                <Text style={styles.payoutSubtitle}>Manage your earnings</Text>
              </View>
            </View>
            
            <View style={styles.payoutDetails}>
              <View style={styles.payoutItem}>
                <View style={styles.payoutItemLeft}>
                  <Smartphone size={16} color={colors.background + "CC"} />
                  <Text style={styles.payoutLabel}>M-Pesa Number</Text>
                </View>
                <Text style={styles.payoutValue}>+254 7** *** 234</Text>
              </View>
              
              <View style={styles.payoutItem}>
                <View style={styles.payoutItemLeft}>
                  <Calendar size={16} color={colors.background + "CC"} />
                  <Text style={styles.payoutLabel}>Next Payout</Text>
                </View>
                <Text style={styles.payoutValue}>Friday, Dec 20, 2024</Text>
              </View>
              
              <View style={styles.payoutItem}>
                <View style={styles.payoutItemLeft}>
                  <DollarSign size={16} color={colors.background + "CC"} />
                  <Text style={styles.payoutLabel}>Pending Amount</Text>
                </View>
                <Text style={styles.payoutValue}>KSh {currentData.totalEarnings.toLocaleString()}</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.editPayoutButton}>
              <Text style={styles.editPayoutText}>Edit Payout Details</Text>
              <Zap size={16} color={colors.background} />
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
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  crownContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.background,
    marginBottom: 4,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    color: colors.background + "CC",
    fontWeight: "500",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  totalEarningsCompact: {
    alignItems: "flex-end",
  },
  compactLabel: {
    fontSize: 12,
    color: colors.background + "CC",
    fontWeight: "600",
  },
  compactAmount: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  periodSelector: {
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
  periodButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  periodGradient: {
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
    gap: 4,
  },
  activePeriodButton: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
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
  totalEarningsCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  earningsGradient: {
    padding: 24,
    borderRadius: 24,
  },
  earningsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  earningsIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  earningsContent: {
    flex: 1,
  },
  totalEarningsLabel: {
    fontSize: 16,
    color: colors.background + "CC",
    marginBottom: 4,
    fontWeight: "600",
  },
  totalEarningsAmount: {
    fontSize: 36,
    fontWeight: "900",
    color: colors.background,
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
    color: colors.background + "CC",
    fontWeight: "600",
  },
  earningsDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 16,
    padding: 16,
  },
  earningsDetailItem: {
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 12,
    color: colors.background + "CC",
    fontWeight: "600",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.background,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
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
    minHeight: 120,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  statChange: {
    fontSize: 12,
    color: colors.background + "CC",
    fontWeight: "600",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.background,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.background + "CC",
    fontWeight: "600",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: -0.5,
  },
  achievementsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.warning + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  achievementsCount: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: "700",
  },
  metricsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  metricCard: {
    flex: 1,
    borderRadius: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  metricGradient: {
    padding: 20,
    borderRadius: 16,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  metricTitle: {
    fontSize: 14,
    color: colors.background + "CC",
    fontWeight: "600",
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.background,
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 12,
    color: colors.background + "CC",
    fontWeight: "500",
  },
  paymentMethodsContainer: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  paymentMethodItem: {
    marginBottom: 16,
  },
  paymentMethodLeft: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 2,
  },
  paymentMethodPercentage: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  paymentMethodBar: {
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    overflow: "hidden",
  },
  paymentMethodProgress: {
    height: "100%",
    borderRadius: 3,
  },
  achievementsContainer: {
    gap: 12,
  },
  achievementCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  achievementCardLocked: {
    opacity: 0.7,
  },
  achievementGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  achievementLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  achievementIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 2,
  },
  achievementTitleLocked: {
    color: colors.textMuted,
  },
  achievementDescription: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
    marginBottom: 8,
  },
  achievementDescriptionLocked: {
    color: colors.textMuted,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.borderLight,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "600",
  },
  unlockedBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  breakdownToggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  breakdownList: {
    backgroundColor: colors.background,
    borderRadius: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  breakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  breakdownLeft: {
    flex: 1,
  },
  breakdownTimeContainer: {
    marginBottom: 8,
  },
  breakdownTime: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 2,
  },
  breakdownLocation: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  breakdownDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  breakdownOrders: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  tipBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.success + "20",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  tipText: {
    fontSize: 10,
    color: colors.success,
    fontWeight: "600",
  },
  breakdownRight: {
    alignItems: "flex-end",
  },
  breakdownAmount: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 4,
  },
  breakdownProgress: {
    width: 60,
    height: 3,
    backgroundColor: colors.borderLight,
    borderRadius: 1.5,
    overflow: "hidden",
  },
  breakdownProgressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 1.5,
  },
  payoutContainer: {
    borderRadius: 24,
    padding: 24,
    shadowColor: colors.accent,
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  payoutHeaderText: {
    flex: 1,
  },
  payoutTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.background,
    marginBottom: 2,
  },
  payoutSubtitle: {
    fontSize: 14,
    color: colors.background + "CC",
    fontWeight: "500",
  },
  payoutDetails: {
    gap: 16,
    marginBottom: 20,
  },
  payoutItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  payoutItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  payoutLabel: {
    fontSize: 14,
    color: colors.background + "CC",
    fontWeight: "600",
  },
  payoutValue: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.background,
  },
  editPayoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  editPayoutText: {
    fontSize: 16,
    color: colors.background,
    fontWeight: "700",
  },
});