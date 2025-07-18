import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  MapPin,
  Package,
  Clock,
  Phone,
  MessageCircle,
  Navigation,
  CheckCircle,
  Star,
  Zap,
  ArrowLeft,
  CreditCard,
  Smartphone,
  DollarSign,
  Timer,
  Wallet,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "@/constants/colors";
import { useOrdersStore, OrderStatus } from "@/stores/orders-store";
import { MapViewComponent } from "@/components/MapView";
import { MapService, Coordinates } from "@/services/map-service";

export default function TrackingScreen() {
  const { orderId, trackingCode } = useLocalSearchParams<{ orderId?: string; trackingCode?: string }>();
  const { getOrderById, getOrderByTrackingCode, updateOrderStatus } = useOrdersStore();
  const [refreshing, setRefreshing] = useState(false);
  const [pickupCoords, setPickupCoords] = useState<Coordinates | null>(null);
  const [deliveryCoords, setDeliveryCoords] = useState<Coordinates | null>(null);
  
  // Find order by orderId or trackingCode
  let order = orderId 
    ? getOrderById(orderId) 
    : trackingCode 
    ? getOrderByTrackingCode(trackingCode)
    : null;

  // Fallback: if trackingCode didn't work, try to find by orderId that contains the tracking code
  if (!order && trackingCode) {
    const { orders } = useOrdersStore.getState();
    order = orders.find(o => 
      o.trackingCode === trackingCode || 
      o.id.includes(trackingCode) || 
      o.id === trackingCode
    ) || null;
  }

  // Debug logging
  console.log('Tracking screen params:', { orderId, trackingCode });
  console.log('Found order:', order ? `${order.id} - ${order.trackingCode}` : 'null');

  useEffect(() => {
    if (!order) {
      Alert.alert("Order Not Found", "The order you're looking for doesn't exist.", [
        { text: "Go Back", onPress: () => router.back() }
      ]);
    } else {
      // Geocode pickup and delivery addresses
      geocodeAddresses();
    }
  }, [order]);

  const geocodeAddresses = async () => {
    if (!order) return;
    
    try {
      const [pickup, delivery] = await Promise.all([
        MapService.geocodeAddress(order.from),
        MapService.geocodeAddress(order.to)
      ]);
      
      if (pickup) setPickupCoords(pickup as any);
      if (delivery) setDeliveryCoords(delivery as any);
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Package size={64} color={colors.textMuted} />
          <Text style={styles.errorTitle}>Order Not Found</Text>
          <Text style={styles.errorSubtitle}>
            The order you're looking for doesn't exist or has been removed.
          </Text>
          <TouchableOpacity 
            style={styles.errorButton}
            onPress={() => router.back()}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.errorButtonGradient}
            >
              <ArrowLeft size={20} color={colors.background} />
              <Text style={styles.errorButtonText}>Go Back</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return colors.warning;
      case "assigned":
        return colors.primary;
      case "picked_up":
      case "in_transit":
        return colors.accent;
      case "delivered":
        return colors.success;
      case "cancelled":
        return colors.error;
      default:
        return colors.textMuted;
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "Finding Driver";
      case "assigned":
        return "Driver Assigned";
      case "picked_up":
        return "Package Picked Up";
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

  const getStatusEmoji = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "🔍";
      case "assigned":
        return "👨‍💼";
      case "picked_up":
        return "📦";
      case "in_transit":
        return "🚚";
      case "delivered":
        return "✅";
      case "cancelled":
        return "❌";
      default:
        return "📋";
    }
  };

  const getPaymentMethodIcon = () => {
    switch (order.paymentMethod) {
      case "mpesa":
        return Smartphone;
      case "card":
        return CreditCard;
      case "cash":
        return DollarSign;
      default:
        return Wallet;
    }
  };

  const getPaymentTermIcon = () => {
    switch (order.paymentTerm) {
      case "pay_now":
        return Zap;
      case "pay_on_delivery":
        return Timer;
      default:
        return Wallet;
    }
  };

  const getPaymentStatusColor = () => {
    switch (order.paymentStatus) {
      case "paid":
        return colors.success;
      case "pending":
        return colors.warning;
      case "failed":
        return colors.error;
      default:
        return colors.textMuted;
    }
  };

  const renderTimelineItem = (item: any, index: number) => (
    <View key={index} style={styles.timelineItem}>
      <View style={styles.timelineIndicator}>
        <View
          style={[
            styles.timelineDot,
            {
              backgroundColor: item.completed
                ? getStatusColor(item.status)
                : colors.border,
            },
          ]}
        >
          {item.completed && (
            <CheckCircle size={12} color={colors.background} />
          )}
        </View>
        {index < order.timeline.length - 1 && (
          <View
            style={[
              styles.timelineLine,
              {
                backgroundColor: item.completed
                  ? getStatusColor(item.status)
                  : colors.border,
              },
            ]}
          />
        )}
      </View>
      <View style={styles.timelineContent}>
        <Text
          style={[
            styles.timelineDescription,
            { color: item.completed ? colors.text : colors.textMuted },
          ]}
        >
          {item.description}
        </Text>
        <Text style={styles.timelineTime}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <Zap size={16} color={colors.primary} />
            <Text style={styles.refreshText}>Pull to refresh</Text>
          </TouchableOpacity>
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Track Order</Text>
          <Text style={styles.orderId}>Order #{order.id}</Text>
          {order.trackingCode && (
            <Text style={styles.trackingCode}>Tracking: {order.trackingCode}</Text>
          )}
        </View>

        <LinearGradient
          colors={[getStatusColor(order.status), getStatusColor(order.status) + "CC"]}
          style={styles.statusCard}
        >
          <View style={styles.statusHeader}>
            <Text style={styles.statusEmoji}>{getStatusEmoji(order.status)}</Text>
            <View style={styles.statusInfo}>
              <Text style={styles.statusText}>
                {getStatusText(order.status)}
              </Text>
              {order.estimatedTime && order.status !== "delivered" && (
                <View style={styles.estimatedTime}>
                  <Clock size={16} color={colors.background} />
                  <Text style={styles.estimatedTimeText}>
                    ETA: {order.estimatedTime}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>

        <View style={styles.routeCard}>
          <View style={styles.routeHeader}>
            <Text style={styles.routeTitle}>Delivery Route</Text>
            <Text style={styles.routePrice}>KSh {order.price}</Text>
          </View>
          
          <View style={styles.route}>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, styles.routeDotStart]} />
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>Pickup</Text>
                <Text style={styles.routeText}>{order.from}</Text>
              </View>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, styles.routeDotEnd]} />
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>Delivery</Text>
                <Text style={styles.routeText}>{order.to}</Text>
              </View>
            </View>
          </View>

          <View style={styles.packageInfo}>
            <View style={styles.packageDetail}>
              <Package size={16} color={colors.textMuted} />
              <Text style={styles.packageType}>{order.packageType}</Text>
            </View>
            <View style={styles.recipientInfo}>
              <Text style={styles.recipientLabel}>Recipient:</Text>
              <Text style={styles.recipientName}>{order.recipientName}</Text>
            </View>
          </View>
        </View>

        {order.driverInfo && (
          <View style={styles.driverCard}>
            <LinearGradient
              colors={[colors.accent, colors.accentDark]}
              style={styles.driverGradient}
            >
              <View style={styles.driverInfo}>
                <View style={styles.driverAvatar}>
                  <Text style={styles.driverInitial}>
                    {order.driverInfo.name.charAt(0)}
                  </Text>
                </View>
                <View style={styles.driverDetails}>
                  <Text style={styles.driverName}>{order.driverInfo.name}</Text>
                  <View style={styles.driverRating}>
                    <Star size={14} color={colors.warning} fill={colors.warning} />
                    <Text style={styles.ratingText}>{order.driverInfo.rating}</Text>
                    <Text style={styles.driverLabel}>• Your Driver</Text>
                  </View>
                </View>
              </View>
              <View style={styles.driverActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push(`/chat?orderId=${order.id}`)}
                >
                  <MessageCircle size={20} color={colors.background} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    console.log("Call driver:", order.driverInfo?.phone);
                  }}
                >
                  <Phone size={20} color={colors.background} />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        )}

        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>Order Timeline</Text>
          <View style={styles.timeline}>
            {order.timeline.map(renderTimelineItem)}
          </View>
        </View>

        <View style={styles.mapContainer}>
          <View style={styles.mapHeader}>
            <Text style={styles.mapTitle}>Live Tracking</Text>
            <TouchableOpacity 
              style={styles.fullMapButton}
              onPress={() => router.push(`/map?orderId=${order.id}`)}
            >
              <Navigation size={16} color={colors.primary} />
              <Text style={styles.fullMapText}>Full Map</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.mapWrapper}>
            <MapViewComponent
              showSearch={false}
              showRoute={true}
              height={300}
              initialLocation={pickupCoords || undefined}
            />
          </View>
        </View>

        <View style={styles.paymentInfo}>
          <Text style={styles.paymentTitle}>Payment Information</Text>
          
          <View style={styles.paymentDetails}>
            <View style={styles.paymentRow}>
              <View style={styles.paymentMethodInfo}>
                <LinearGradient
                  colors={
                    order.paymentMethod === "mpesa" 
                      ? [colors.mpesa, "#00B85C"]
                      : [colors.primary, colors.primaryDark]
                  }
                  style={styles.paymentIcon}
                >
                  {React.createElement(getPaymentMethodIcon(), {
                    size: 20,
                    color: colors.background,
                  })}
                </LinearGradient>
                <View style={styles.paymentTextInfo}>
                  <Text style={styles.paymentMethodText}>
                    {order.paymentMethod === "mpesa" ? "M-Pesa" : 
                     order.paymentMethod === "card" ? "Credit/Debit Card" : "Cash on Delivery"}
                  </Text>
                  <Text style={styles.paymentMethodSubtext}>Payment Method</Text>
                </View>
              </View>
            </View>

            <View style={styles.paymentRow}>
              <View style={styles.paymentMethodInfo}>
                <LinearGradient
                  colors={[colors.accent, colors.accentDark]}
                  style={styles.paymentIcon}
                >
                  {React.createElement(getPaymentTermIcon(), {
                    size: 20,
                    color: colors.background,
                  })}
                </LinearGradient>
                <View style={styles.paymentTextInfo}>
                  <Text style={styles.paymentMethodText}>
                    {order.paymentTerm === "pay_now" ? "Pay Now" : "Pay on Delivery"}
                  </Text>
                  <Text style={styles.paymentMethodSubtext}>Payment Terms</Text>
                </View>
              </View>
            </View>

            <View style={styles.paymentStatusRow}>
              <Text style={styles.paymentStatusLabel}>Payment Status:</Text>
              <View style={[styles.paymentStatusBadge, { backgroundColor: getPaymentStatusColor() + "20" }]}>
                <Text style={[styles.paymentStatusText, { color: getPaymentStatusColor() }]}>
                  {order.paymentStatus === "paid" ? "✅ Paid" : 
                   order.paymentStatus === "pending" ? "⏳ Pending" : "❌ Failed"}
                </Text>
              </View>
            </View>

            {order.paymentStatus === "pending" && order.paymentTerm === "pay_now" && (
              <TouchableOpacity 
                style={styles.payNowButton}
                onPress={() => router.push(`/payment?orderId=${order.id}`)}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.payNowButtonGradient}
                >
                  <Zap size={16} color={colors.background} />
                  <Text style={styles.payNowButtonText}>Complete Payment</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
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
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8,
  },
  refreshText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -1,
  },
  orderId: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  trackingCode: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
    marginTop: 4,
  },
  statusCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  statusEmoji: {
    fontSize: 32,
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.background,
    marginBottom: 4,
  },
  estimatedTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  estimatedTimeText: {
    fontSize: 14,
    color: colors.background + "CC",
    fontWeight: "600",
  },
  routeCard: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  routeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  routePrice: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text,
  },
  route: {
    marginBottom: 20,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 16,
  },
  routeDotStart: {
    backgroundColor: colors.primary,
  },
  routeDotEnd: {
    backgroundColor: colors.accent,
  },
  routeInfo: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "600",
    marginBottom: 4,
  },
  routeText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "600",
  },
  routeLine: {
    width: 2,
    height: 24,
    backgroundColor: colors.border,
    marginLeft: 5,
    marginVertical: 4,
  },
  packageInfo: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: 12,
  },
  packageDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  packageType: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  recipientInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recipientLabel: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "500",
  },
  recipientName: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "600",
  },
  driverCard: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  driverGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  driverInitial: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.background,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.background,
    marginBottom: 4,
  },
  driverRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: colors.background + "CC",
    fontWeight: "600",
  },
  driverLabel: {
    fontSize: 14,
    color: colors.background + "CC",
    fontWeight: "500",
  },
  driverActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  timelineCard: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 20,
  },
  timeline: {
    gap: 20,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  timelineIndicator: {
    alignItems: "center",
    marginRight: 16,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  timelineLine: {
    width: 2,
    height: 32,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineDescription: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  mapContainer: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  fullMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
  },
  fullMapText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  mapWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentInfo: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 16,
  },
  paymentDetails: {
    gap: 16,
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentMethodInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  paymentIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  paymentTextInfo: {
    flex: 1,
  },
  paymentMethodText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "600",
    marginBottom: 2,
  },
  paymentMethodSubtext: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  paymentStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  paymentStatusLabel: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "500",
  },
  paymentStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  payNowButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  payNowButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 8,
  },
  payNowButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: "700",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text,
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  errorSubtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    fontWeight: "500",
  },
  errorButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  errorButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 8,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.background,
  },
});