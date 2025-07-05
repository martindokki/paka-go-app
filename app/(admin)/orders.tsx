import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
} from "react-native";
import { Search, Filter, Package, MapPin, User, Truck } from "lucide-react-native";
import Colors from "@/constants/colors";

type OrderStatus = "pending" | "assigned" | "picked_up" | "in_transit" | "delivered" | "cancelled";

interface AdminOrder {
  id: string;
  customer: string;
  driver?: string;
  from: string;
  to: string;
  status: OrderStatus;
  amount: string;
  createdAt: string;
  packageType: string;
  distance: string;
}

export default function AdminOrdersScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">("all");

  const orders: AdminOrder[] = [
    {
      id: "ORD-001",
      customer: "John Doe",
      driver: "Peter Mwangi",
      from: "Westlands Mall",
      to: "Karen Shopping Centre",
      status: "in_transit",
      amount: "KSh 450",
      createdAt: "2024-12-15 14:30",
      packageType: "Documents",
      distance: "12.5 km",
    },
    {
      id: "ORD-002",
      customer: "Mary Smith",
      driver: "Grace Akinyi",
      from: "CBD Post Office",
      to: "Kilimani",
      status: "delivered",
      amount: "KSh 320",
      createdAt: "2024-12-15 13:15",
      packageType: "Small Package",
      distance: "8.2 km",
    },
    {
      id: "ORD-003",
      customer: "Peter Wilson",
      from: "Sarit Centre",
      to: "Lavington",
      status: "pending",
      amount: "KSh 280",
      createdAt: "2024-12-15 12:45",
      packageType: "Electronics",
      distance: "6.8 km",
    },
    {
      id: "ORD-004",
      customer: "Grace Akinyi",
      driver: "John Kamau",
      from: "Junction Mall",
      to: "Runda",
      status: "assigned",
      amount: "KSh 520",
      createdAt: "2024-12-15 11:20",
      packageType: "Clothing",
      distance: "15.2 km",
    },
  ];

  const statusOptions = [
    { key: "all", label: "All Orders", count: orders.length },
    { key: "pending", label: "Pending", count: orders.filter(o => o.status === "pending").length },
    { key: "assigned", label: "Assigned", count: orders.filter(o => o.status === "assigned").length },
    { key: "in_transit", label: "In Transit", count: orders.filter(o => o.status === "in_transit").length },
    { key: "delivered", label: "Delivered", count: orders.filter(o => o.status === "delivered").length },
  ];

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return Colors.light.warning;
      case "assigned":
        return Colors.light.primary;
      case "picked_up":
      case "in_transit":
        return Colors.light.accent;
      case "delivered":
        return Colors.light.success;
      case "cancelled":
        return Colors.light.error;
      default:
        return Colors.light.textMuted;
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "assigned":
        return "Assigned";
      case "picked_up":
        return "Picked Up";
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

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.to.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const renderOrderCard = ({ item }: { item: AdminOrder }) => (
    <TouchableOpacity style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>{item.id}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + "20" },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(item.status) },
            ]}
          >
            {getStatusText(item.status)}
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
        <View style={styles.participantInfo}>
          <View style={styles.participant}>
            <User size={14} color={Colors.light.textMuted} />
            <Text style={styles.participantText}>{item.customer}</Text>
          </View>
          {item.driver && (
            <View style={styles.participant}>
              <Truck size={14} color={Colors.light.textMuted} />
              <Text style={styles.participantText}>{item.driver}</Text>
            </View>
          )}
        </View>
        <View style={styles.orderMeta}>
          <Text style={styles.orderAmount}>{item.amount}</Text>
          <Text style={styles.orderDistance}>{item.distance}</Text>
        </View>
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.packageInfo}>
          <Package size={12} color={Colors.light.textMuted} />
          <Text style={styles.packageType}>{item.packageType}</Text>
        </View>
        <Text style={styles.orderTime}>{item.createdAt}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Order Management</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.light.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search orders..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.light.textMuted}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.statusTabs}>
        {statusOptions.map((status) => (
          <TouchableOpacity
            key={status.key}
            style={[
              styles.statusTab,
              selectedStatus === status.key && styles.activeStatusTab,
            ]}
            onPress={() => setSelectedStatus(status.key as any)}
          >
            <Text
              style={[
                styles.statusTabText,
                selectedStatus === status.key && styles.activeStatusTabText,
              ]}
            >
              {status.label}
            </Text>
            <Text
              style={[
                styles.statusTabCount,
                selectedStatus === status.key && styles.activeStatusTabCount,
              ]}
            >
              {status.count}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.ordersList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: 20,
    paddingBottom: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  searchContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  statusTabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  statusTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
  },
  activeStatusTab: {
    backgroundColor: Colors.light.primary,
  },
  statusTabText: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.light.textMuted,
  },
  activeStatusTabText: {
    color: Colors.light.background,
  },
  statusTabCount: {
    fontSize: 10,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  activeStatusTabCount: {
    color: Colors.light.background + "CC",
  },
  ordersList: {
    padding: 20,
    paddingTop: 0,
  },
  orderCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "500",
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
    flex: 1,
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
    marginBottom: 8,
  },
  participantInfo: {
    flex: 1,
    gap: 4,
  },
  participant: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  participantText: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  orderMeta: {
    alignItems: "flex-end",
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 2,
  },
  orderDistance: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  packageInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  packageType: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  orderTime: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
});