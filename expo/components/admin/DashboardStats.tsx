import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { 
  DollarSign, 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle, 
  Users, 
  UserCheck,
  TrendingUp,
  Timer
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { AdminStats } from '@/stores/local-data-store';
import { Order } from '@/stores/orders-store';
import { Driver } from '@/stores/local-data-store';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
  subtitle?: string;
}

function StatCard({ title, value, icon: IconComponent, color, subtitle }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
          <IconComponent size={24} color={color} />
        </View>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );
}

interface DashboardStatsProps {
  stats: AdminStats;
  orders: Order[];
  drivers: Driver[];
}

export function DashboardStats({ stats, orders, drivers }: DashboardStatsProps) {
  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  // Calculate real-time stats from orders and drivers
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const onTransitOrders = orders.filter(order => ['assigned', 'picked_up', 'in_transit'].includes(order.status)).length;
  const onlineDrivers = drivers.filter(driver => driver.status === 'online').length;

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: colors.success,
      subtitle: 'All time',
    },
    {
      title: 'Total Orders',
      value: formatNumber(orders.length),
      icon: Package,
      color: colors.primary,
      subtitle: 'All time',
    },
    {
      title: 'Pending Orders',
      value: formatNumber(pendingOrders),
      icon: Clock,
      color: colors.warning,
      subtitle: 'Awaiting assignment',
    },
    {
      title: 'Completed Orders',
      value: formatNumber(stats.completedOrders),
      icon: CheckCircle,
      color: colors.success,
      subtitle: 'Successfully delivered',
    },
    {
      title: 'On Transit',
      value: formatNumber(onTransitOrders),
      icon: Truck,
      color: colors.info,
      subtitle: 'Currently delivering',
    },
    {
      title: 'Cancelled Orders',
      value: formatNumber(stats.cancelledOrders),
      icon: XCircle,
      color: colors.error,
      subtitle: 'Cancelled by users/admin',
    },
    {
      title: 'Total Customers',
      value: formatNumber(stats.totalCustomers),
      icon: Users,
      color: colors.secondary,
      subtitle: 'Registered users',
    },
    {
      title: 'Active Drivers',
      value: `${onlineDrivers}/${drivers.length}`,
      icon: UserCheck,
      color: colors.success,
      subtitle: 'Online drivers',
    },
    {
      title: 'Today\'s Orders',
      value: formatNumber(stats.ordersToday),
      icon: TrendingUp,
      color: colors.primary,
      subtitle: 'Today',
    },
    {
      title: 'Average Rating',
      value: stats.averageRating.toFixed(1),
      icon: Timer,
      color: colors.info,
      subtitle: 'Customer satisfaction',
    },
    {
      title: 'New Customers',
      value: formatNumber(stats.newCustomersToday),
      icon: Users,
      color: colors.success,
      subtitle: 'Today',
    },
    {
      title: 'Today\'s Revenue',
      value: formatCurrency(stats.revenueToday),
      icon: DollarSign,
      color: colors.secondary,
      subtitle: 'Today',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.grid}>
        {statCards.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            subtitle={stat.subtitle}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 20,
    minWidth: 280,
    flex: 1,
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statTitle: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
});