import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  Alert,
  Dimensions,
} from "react-native";
import { 
  Package, 
  MapPin, 
  Clock, 
  DollarSign, 
  User, 
  Phone,
  CheckCircle,
  AlertCircle,
  Navigation
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { safeColors as colors } from "@/constants/colors";
import { useAuthStore } from "@/stores/auth-store-simple";
import { useOrdersStore } from "@/stores/orders-store";

const { width } = Dimensions.get("window");

export default function AvailableOrdersScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuthStore();
  const { orders, getAllOrders, assignDriver, isLoading } = useOrdersStore();

  useEffect(() => {
    getAllOrders();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await getAllOrders();
    setRefreshing(false);
  };

  // Get pending orders that are not assigned to any driver
  const availableOrders = orders.filter(order => 
    order.status === "pending" && !order.driverId
  );

  const handleAcceptOrder = async (orderId: string) => {
    if (!user?.id) return;

    Alert.alert(
      "Accept Order",
      "Are you sure you want to accept this delivery order?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept",
          onPress: async () => {
            try {
              await assignDriver(orderId, user.id, {
                name: user.name || "Driver",
                phone: user.phone || "",
                rating: 4.5,
              });
              Alert.alert("Success", "Order accepted successfully!");
              getAllOrders(); // Refresh the list
            } catch (error) {
              Alert.alert("Error", "Failed to accept order. Please try again.");
            }
          },
        },
      ]
    );
  };

  const renderOrderCard = ({ item }: { item: any }) => (
    <View style={styles.orderCard}>
      <LinearGradient
        colors={[colors.background, colors.backgroundSecondary]}
        style={styles.orderGradient}
      >
        {/* Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderIdContainer}>
            <Package size={16} color={colors.primary} />
            <Text style={styles.orderId}>#{item.id}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.orderPrice}>KSh {item.price.toLocaleString()}</Text>
            <Text style={styles.priceLabel}>Delivery Fee</Text>
          </View>
        </View>

        {/* Route */}
        <View style={styles.routeContainer}>
          <View style={styles.routePoint}>
            <View style={[styles.routeDot, { backgroundColor: colors.primary }]} />
            <View style={styles.routeTextContainer}>
              <Text style={styles.routeLabel}>PICKUP</Text>
              <Text style={styles.routeText} numberOfLines={2}>
                {item.from}
              </Text>
            </View>
          </View>
          
          <View style={styles.routeConnector}>
            <View style={styles.routeLine} />
            <View style={styles.distanceInfo}>
              <MapPin size={12} color={colors.textMuted} />
              <Text style={styles.distanceText}>
                {item.distance || "~8.5 km"}
              </Text>
            </View>
          </View>
          
          <View style={styles.routePoint}>
            <View style={[styles.routeDot, { backgroundColor: colors.accent }]} />
            <View style={styles.routeTextContainer}>
              <Text style={styles.routeLabel}>DROPOFF</Text>
              <Text style={styles.routeText} numberOfLines={2}>
                {item.to}
              </Text>
            </View>
          </View>
        </View>

        {/* Package Details */}
        <View style={styles.packageDetails}>
          <View style={styles.detailItem}>
            <Package size={14} color={colors.textMuted} />
            <Text style={styles.detailText}>{item.packageType}</Text>
          </View>
          {item.estimatedTime && (
            <View style={styles.detailItem}>
              <Clock size={14} color={colors.textMuted} />
              <Text style={styles.detailText}>{item.estimatedTime}</Text>
            </View>
          )}
        </View>

        {/* Customer Info */}
        <View style={styles.customerSection}>
          <View style={styles.customerInfo}>
            <User size={16} color={colors.primary} />
            <View style={styles.customerDetails}>
              <Text style={styles.customerLabel}>Recipient</Text>
              <Text style={styles.customerName}>{item.recipientName}</Text>
              <Text style={styles.customerPhone}>{item.recipientPhone}</Text>
            </View>
          </View>
        </View>

        {/* Special Instructions */}
        {item.specialInstructions && (
          <View style={styles.instructionsContainer}>
            <AlertCircle size={14} color={colors.warning} />
            <Text style={styles.instructionsText}>{item.specialInstructions}</Text>
          </View>
        )}

        {/* Payment Info */}
        <View style={styles.paymentInfo}>
          <View style={styles.paymentMethod}>
            <DollarSign size={14} color={colors.success} />
            <Text style={styles.paymentText}>
              {item.paymentMethod === "mpesa" ? "M-Pesa" : 
               item.paymentMethod === "card" ? "Card" : "Cash"}
            </Text>
          </View>
          <View style={styles.paymentTerm}>
            <Text style={styles.paymentTermText}>
              {item.paymentTerm === "pay_now" ? "Pre-paid" : "Pay on Delivery"}
            </Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAcceptOrder(item.id)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.success, "#10B981"]}
            style={styles.acceptGradient}
          >
            <CheckCircle size={20} color={colors.background} />
            <Text style={styles.acceptButtonText}>Accept Order</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Order Time */}
        <View style={styles.orderFooter}>
          <Text style={styles.orderTime}>
            Posted {new Date(item.createdAt).toLocaleString()}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <LinearGradient
        colors={[colors.primaryLight, colors.backgroundSecondary]}
        style={styles.emptyStateGradient}
      >
        <Navigation size={64} color={colors.primary} />
        <Text style={styles.emptyStateTitle}>No Available Orders</Text>
        <Text style={styles.emptyStateSubtitle}>
          New delivery orders will appear here. Pull down to refresh and check for new orders.
        </Text>
      </LinearGradient>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>Available Orders</Text>
          <Text style={styles.subtitle}>
            {availableOrders.length} orders available for pickup
          </Text>
        </View>
      </LinearGradient>

      {/* Orders List */}
      <FlatList
        data={availableOrders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.ordersList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={<EmptyState />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
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
  ordersList: {
    padding: 20,
    flexGrow: 1,
  },
  orderCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  orderGradient: {
    padding: 20,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  orderIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  orderId: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  orderPrice: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text,
  },
  priceLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "500",
  },
  routeContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 4,
  },
  routeTextContainer: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  routeText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "600",
    lineHeight: 20,
  },
  routeConnector: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 6,
    marginVertical: 12,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: colors.border,
    marginRight: 12,
  },
  distanceInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  distanceText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "600",
  },
  packageDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
    textTransform: "capitalize",
  },
  customerSection: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  customerDetails: {
    marginLeft: 12,
    flex: 1,
  },
  customerLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  customerName: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "700",
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  instructionsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.warningLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  instructionsText: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: "500",
    flex: 1,
    lineHeight: 16,
  },
  paymentInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  paymentText: {
    fontSize: 10,
    color: colors.success,
    fontWeight: "700",
  },
  paymentTerm: {
    backgroundColor: colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  paymentTermText: {
    fontSize: 10,
    color: colors.accent,
    fontWeight: "700",
  },
  acceptButton: {
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  acceptGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.background,
  },
  orderFooter: {
    alignItems: "center",
  },
  orderTime: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateGradient: {
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 48,
    borderRadius: 24,
    maxWidth: 320,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
    textAlign: "center",
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "500",
  },
});