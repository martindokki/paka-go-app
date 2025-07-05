import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  CreditCard,
  Smartphone,
  DollarSign,
  CheckCircle,
  Zap,
  Shield,
  ArrowLeft,
  Package,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { useOrdersStore } from "@/stores/orders-store";

export default function PaymentScreen() {
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const { getOrderById, updatePaymentStatus } = useOrdersStore();
  
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  const order = orderId ? getOrderById(orderId) : null;
  const orderAmount = order?.price || 450;

  useEffect(() => {
    if (orderId && !order) {
      Alert.alert("Order Not Found", "The order you're trying to pay for doesn't exist.", [
        { text: "Go Back", onPress: () => router.back() }
      ]);
    }
  }, [order, orderId]);

  const handlePayment = () => {
    if (!order) {
      Alert.alert("Error", "No order found to process payment");
      return;
    }

    if (order.paymentMethod === "mpesa") {
      if (!mpesaPhone) {
        Alert.alert("Missing Information", "Please enter your M-Pesa phone number");
        return;
      }
      
      // Simulate M-Pesa payment processing
      Alert.alert(
        "M-Pesa Payment Initiated",
        `Please check your phone ${mpesaPhone} for the M-Pesa prompt to complete payment of KSh ${orderAmount}`,
        [
          {
            text: "Payment Completed",
            onPress: () => {
              if (orderId) {
                updatePaymentStatus(orderId, "paid");
              }
              Alert.alert(
                "Payment Successful! 🎉",
                "Your payment has been processed successfully. Your order is now confirmed.",
                [
                  {
                    text: "Track Order",
                    onPress: () => {
                      router.dismiss();
                      router.push(`/tracking?orderId=${orderId}`);
                    },
                  },
                ]
              );
            },
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    } else if (order.paymentMethod === "card") {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
        Alert.alert("Missing Information", "Please fill in all card details");
        return;
      }
      
      // Simulate card payment processing
      if (orderId) {
        updatePaymentStatus(orderId, "paid");
      }
      Alert.alert(
        "Payment Successful! 🎉",
        `Your payment of KSh ${orderAmount} has been processed successfully.`,
        [
          {
            text: "Track Order",
            onPress: () => {
              router.dismiss();
              router.push(`/tracking?orderId=${orderId}`);
            },
          },
        ]
      );
    }
  };

  const renderMpesaForm = () => (
    <View style={styles.paymentForm}>
      <LinearGradient
        colors={[Colors.light.mpesa, "#00B85C"]}
        style={styles.mpesaHeader}
      >
        <View style={styles.mpesaHeaderContent}>
          <Zap size={24} color={Colors.light.background} />
          <Text style={styles.mpesaHeaderTitle}>M-Pesa Payment</Text>
        </View>
        <Text style={styles.mpesaHeaderSubtitle}>
          Lipa na M-Pesa - Fast & Secure
        </Text>
      </LinearGradient>
      
      <View style={styles.formContent}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <View style={styles.phoneInputContainer}>
            <Text style={styles.countryCode}>+254</Text>
            <TextInput
              style={styles.phoneInput}
              placeholder="712345678"
              value={mpesaPhone}
              onChangeText={setMpesaPhone}
              keyboardType="phone-pad"
              placeholderTextColor={Colors.light.textMuted}
            />
          </View>
        </View>
        
        <View style={styles.mpesaSteps}>
          <Text style={styles.stepsTitle}>How it works:</Text>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>Enter your M-Pesa number</Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>Check your phone for STK prompt</Text>
          </View>
          <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>Enter your M-Pesa PIN to confirm</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderCardForm = () => (
    <View style={styles.paymentForm}>
      <View style={styles.cardHeader}>
        <CreditCard size={24} color={Colors.light.accent} />
        <Text style={styles.formTitle}>Card Payment</Text>
      </View>
      
      <View style={styles.formContent}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Card Number</Text>
          <TextInput
            style={styles.textInput}
            placeholder="1234 5678 9012 3456"
            value={cardDetails.number}
            onChangeText={(text) => setCardDetails({ ...cardDetails, number: text })}
            keyboardType="numeric"
            placeholderTextColor={Colors.light.textMuted}
          />
        </View>

        <View style={styles.cardRow}>
          <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.inputLabel}>Expiry Date</Text>
            <TextInput
              style={styles.textInput}
              placeholder="MM/YY"
              value={cardDetails.expiry}
              onChangeText={(text) => setCardDetails({ ...cardDetails, expiry: text })}
              keyboardType="numeric"
              placeholderTextColor={Colors.light.textMuted}
            />
          </View>
          <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.inputLabel}>CVV</Text>
            <TextInput
              style={styles.textInput}
              placeholder="123"
              value={cardDetails.cvv}
              onChangeText={(text) => setCardDetails({ ...cardDetails, cvv: text })}
              keyboardType="numeric"
              secureTextEntry
              placeholderTextColor={Colors.light.textMuted}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Cardholder Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="John Doe"
            value={cardDetails.name}
            onChangeText={(text) => setCardDetails({ ...cardDetails, name: text })}
            placeholderTextColor={Colors.light.textMuted}
          />
        </View>
      </View>
    </View>
  );

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Package size={64} color={Colors.light.textMuted} />
          <Text style={styles.errorTitle}>Order Not Found</Text>
          <Text style={styles.errorSubtitle}>
            The order you're trying to pay for doesn't exist or has been removed.
          </Text>
          <TouchableOpacity 
            style={styles.errorButton}
            onPress={() => router.back()}
          >
            <LinearGradient
              colors={[Colors.light.primary, Colors.light.primaryDark]}
              style={styles.errorButtonGradient}
            >
              <ArrowLeft size={20} color={Colors.light.background} />
              <Text style={styles.errorButtonText}>Go Back</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Payment</Text>
          <Text style={styles.subtitle}>Complete your payment for Order #{order.id}</Text>
        </View>

        <LinearGradient
          colors={[Colors.light.primary, Colors.light.primaryDark]}
          style={styles.amountCard}
        >
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={styles.amountValue}>KSh {orderAmount.toLocaleString()}</Text>
          <View style={styles.amountBadge}>
            <Zap size={16} color={Colors.light.primary} />
            <Text style={styles.amountBadgeText}>
              {order.paymentTerm === "pay_now" ? "Pay Now" : "Pay on Delivery"}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.orderSummary}>
          <Text style={styles.orderSummaryTitle}>Order Summary</Text>
          <View style={styles.orderSummaryItem}>
            <Text style={styles.orderSummaryLabel}>From:</Text>
            <Text style={styles.orderSummaryValue}>{order.from}</Text>
          </View>
          <View style={styles.orderSummaryItem}>
            <Text style={styles.orderSummaryLabel}>To:</Text>
            <Text style={styles.orderSummaryValue}>{order.to}</Text>
          </View>
          <View style={styles.orderSummaryItem}>
            <Text style={styles.orderSummaryLabel}>Package:</Text>
            <Text style={styles.orderSummaryValue}>{order.packageType}</Text>
          </View>
          <View style={styles.orderSummaryItem}>
            <Text style={styles.orderSummaryLabel}>Payment Method:</Text>
            <Text style={styles.orderSummaryValue}>
              {order.paymentMethod === "mpesa" ? "M-Pesa" : 
               order.paymentMethod === "card" ? "Credit/Debit Card" : "Cash"}
            </Text>
          </View>
        </View>

        {order.paymentMethod === "mpesa" && renderMpesaForm()}
        {order.paymentMethod === "card" && renderCardForm()}

        {order.paymentMethod !== "cash" && (
          <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
            <LinearGradient
              colors={[Colors.light.primary, Colors.light.primaryDark]}
              style={styles.payButtonGradient}
            >
              <Text style={styles.payButtonText}>
                Pay KSh {orderAmount.toLocaleString()}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <View style={styles.securityNote}>
          <Shield size={16} color={Colors.light.success} />
          <Text style={styles.securityText}>
            Your payment information is secure and encrypted
          </Text>
        </View>
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
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: Colors.light.text,
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    fontWeight: "500",
  },
  amountCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  amountLabel: {
    fontSize: 16,
    color: Colors.light.background + "CC",
    marginBottom: 8,
    fontWeight: "600",
  },
  amountValue: {
    fontSize: 36,
    fontWeight: "900",
    color: Colors.light.background,
    marginBottom: 12,
    letterSpacing: -1,
  },
  amountBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  amountBadgeText: {
    fontSize: 12,
    color: Colors.light.primary,
    fontWeight: "700",
  },
  orderSummary: {
    backgroundColor: Colors.light.background,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  orderSummaryTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.light.text,
    marginBottom: 16,
  },
  orderSummaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderSummaryLabel: {
    fontSize: 14,
    color: Colors.light.textMuted,
    fontWeight: "500",
  },
  orderSummaryValue: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  paymentForm: {
    backgroundColor: Colors.light.background,
    borderRadius: 20,
    marginBottom: 24,
    overflow: "hidden",
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  mpesaHeader: {
    padding: 20,
  },
  mpesaHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  mpesaHeaderTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.light.background,
  },
  mpesaHeaderSubtitle: {
    fontSize: 14,
    color: Colors.light.background + "CC",
    fontWeight: "600",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.light.text,
  },
  formContent: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 8,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.borderLight,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: Colors.light.borderLight,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontWeight: "500",
  },
  textInput: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 2,
    borderColor: Colors.light.borderLight,
    fontWeight: "500",
  },
  cardRow: {
    flexDirection: "row",
  },
  mpesaSteps: {
    marginTop: 16,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 12,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.mpesa,
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.light.background,
  },
  stepText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: "500",
  },
  payButton: {
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  payButtonGradient: {
    paddingVertical: 20,
    alignItems: "center",
    borderRadius: 20,
  },
  payButtonText: {
    color: Colors.light.background,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 32,
  },
  securityText: {
    fontSize: 12,
    color: Colors.light.textMuted,
    textAlign: "center",
    fontWeight: "500",
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
    color: Colors.light.text,
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  errorSubtitle: {
    fontSize: 16,
    color: Colors.light.textMuted,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    fontWeight: "500",
  },
  errorButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: Colors.light.primary,
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
    color: Colors.light.background,
  },
});