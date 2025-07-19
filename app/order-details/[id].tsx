import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Package,
  MapPin,
  Clock,
  DollarSign,
  User,
  Phone,
  Star,
  CheckCircle,
  Truck,
  Navigation,
  MessageCircle,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "@/constants/colors";
import { useAuthStore } from "@/stores/auth-store-simple";
import { useOrdersStore, OrderStatus } from "@/stores/orders-store";

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { getOrderById, updateOrderStatus } = useOrdersStore();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const order = id ? getOrderById(id) : null;

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Package size={48} color={colors.textMuted} />
          <Text style={styles.errorText}>Order not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case "pending": return "assigned";
      case "assigned": return "picked_up";
      case "picked_up": return "in_transit";
      case "in_transit": return "delivered";
      default: return null;
    }
  };

  const getStatusActionText = (status: OrderStatus): string => {
    switch (status) {
      case "pending": return "Accept Order";
      case "assigned": return "Mark as Picked Up";
      case "picked_up": return "Mark In Transit";
      case "in_transit": return "Mark as Delivered";
      default: return "";
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending": return colors.warning;
      case "assigned": return colors.primary;
      case "picked_up":
      case "in_transit": return colors.accent;
      case "delivered": return colors.success;
      case "cancelled": return colors.error;
      default: return colors.textMuted;
    }
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!user?.id) return;

    setIsUpdating(true);
    try {
      await updateOrderStatus(order.id, newStatus, {
        name: user.name || "Driver",
        phone: user.phone || "",
        rating: 4.5,
      });

      Alert.alert("Success", "Order status updated successfully");
      
      // If delivered, show rating modal
      if (newStatus === "delivered") {
        setShowRatingModal(true);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to update order status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRatingSubmit = () => {
    // Here you would typically save the rating to your backend
    console.log("Rating submitted:", { rating, comment: ratingComment });
    setShowRatingModal(false);
    Alert.alert("Thank you!", "Your rating has been submitted.");
  };

  const nextStatus = getNextStatus(order.status);
  const canUpdateStatus = nextStatus && !['delivered', 'cancelled'].includes(order.status);
  const isDriverOrder = order.driverId === user?.id;
  const canAcceptOrder = order.status === 'pending' && !order.driverId && user?.userType === 'driver';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.background} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={styles.headerRight} />
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Order Info */}
        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <View style={styles.orderIdContainer}>
              <Package size={16} color={colors.primary} />
              <Text style={styles.orderId}>#{order.id}</Text>
            </View>
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
                {order.status.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.orderPrice}>KSh {order.price.toLocaleString()}</Text>
            <Text style={styles.priceLabel}>Delivery Fee</Text>
          </View>
        </View>

        {/* Route */}
        <View style={styles.routeCard}>
          <Text style={styles.sectionTitle}>Route</Text>
          <View style={styles.routeContainer}>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: colors.primary }]} />
              <View style={styles.routeTextContainer}>
                <Text style={styles.routeLabel}>PICKUP</Text>
                <Text style={styles.routeText}>{order.from}</Text>
              </View>
            </View>
            
            <View style={styles.routeConnector}>
              <View style={styles.routeLine} />
              <View style={styles.distanceInfo}>
                <MapPin size={12} color={colors.textMuted} />
                <Text style={styles.distanceText}>
                  {order.distance || "~8.5 km"}
                </Text>
              </View>
            </View>
            
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: colors.accent }]} />
              <View style={styles.routeTextContainer}>
                <Text style={styles.routeLabel}>DROPOFF</Text>
                <Text style={styles.routeText}>{order.to}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.customerCard}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.customerInfo}>
            <User size={20} color={colors.primary} />
            <View style={styles.customerDetails}>
              <Text style={styles.customerName}>{order.recipientName}</Text>
              <Text style={styles.customerPhone}>{order.recipientPhone}</Text>
            </View>
            <TouchableOpacity style={styles.callButton}>
              <Phone size={16} color={colors.background} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Package Details */}
        <View style={styles.packageCard}>
          <Text style={styles.sectionTitle}>Package Details</Text>
          <View style={styles.packageInfo}>
            <View style={styles.packageDetail}>
              <Text style={styles.packageLabel}>Type:</Text>
              <Text style={styles.packageValue}>{order.packageType}</Text>
            </View>
            {order.packageDescription && (
              <View style={styles.packageDetail}>
                <Text style={styles.packageLabel}>Description:</Text>
                <Text style={styles.packageValue}>{order.packageDescription}</Text>
              </View>
            )}
            {order.specialInstructions && (
              <View style={styles.packageDetail}>
                <Text style={styles.packageLabel}>Special Instructions:</Text>
                <Text style={styles.packageValue}>{order.specialInstructions}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.sectionTitle}>Order Timeline</Text>
          <View style={styles.timeline}>
            {order.timeline.map((item, index) => (
              <View key={index} style={styles.timelineItem}>
                <View
                  style={[
                    styles.timelineDot,
                    {
                      backgroundColor: item.completed
                        ? colors.success
                        : colors.border,
                    },
                  ]}
                />
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
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        {(canUpdateStatus || canAcceptOrder) && (
          <View style={styles.actionContainer}>
            {canAcceptOrder && (
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => handleStatusUpdate("assigned")}
                disabled={isUpdating}
              >
                <LinearGradient
                  colors={[colors.success, "#10B981"]}
                  style={styles.actionGradient}
                >
                  <CheckCircle size={20} color={colors.background} />
                  <Text style={styles.actionButtonText}>Accept Order</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {canUpdateStatus && isDriverOrder && (
              <TouchableOpacity
                style={styles.updateButton}
                onPress={() => nextStatus && handleStatusUpdate(nextStatus)}
                disabled={isUpdating}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.actionGradient}
                >
                  <Truck size={20} color={colors.background} />
                  <Text style={styles.actionButtonText}>
                    {getStatusActionText(order.status)}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Rating Modal */}
      <Modal
        visible={showRatingModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.ratingModal}>
            <Text style={styles.ratingTitle}>Rate this Customer</Text>
            <Text style={styles.ratingSubtitle}>
              How was your delivery experience?
            </Text>

            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                >
                  <Star
                    size={32}
                    color={star <= rating ? colors.warning : colors.border}
                    fill={star <= rating ? colors.warning : "transparent"}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment (optional)"
              value={ratingComment}
              onChangeText={setRatingComment}
              multiline
              numberOfLines={3}
              placeholderTextColor={colors.textMuted}
            />

            <View style={styles.ratingActions}>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={() => setShowRatingModal(false)}
              >
                <Text style={styles.skipButtonText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleRatingSubmit}
              >
                <Text style={styles.submitButtonText}>Submit Rating</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "800",
    color: colors.background,
    textAlign: "center",
    marginLeft: -32,
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  orderCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  priceContainer: {
    alignItems: "center",
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
  routeCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 12,
  },
  routeContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
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
  customerCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  customerDetails: {
    flex: 1,
    marginLeft: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "500",
  },
  callButton: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  packageCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  packageInfo: {
    gap: 8,
  },
  packageDetail: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  packageLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMuted,
    width: 80,
  },
  packageValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
    flex: 1,
  },
  timelineCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  timeline: {
    gap: 16,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineDescription: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  timelineTime: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  actionContainer: {
    gap: 12,
    marginBottom: 20,
  },
  acceptButton: {
    borderRadius: 16,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  updateButton: {
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: colors.textMuted,
    marginTop: 16,
    marginBottom: 24,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  ratingModal: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  ratingTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  ratingSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  commentInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: colors.text,
    textAlignVertical: "top",
    marginBottom: 24,
    minHeight: 80,
  },
  ratingActions: {
    flexDirection: "row",
    gap: 12,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  skipButtonText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: "600",
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  submitButtonText: {
    fontSize: 14,
    color: colors.background,
    fontWeight: "700",
  },
});