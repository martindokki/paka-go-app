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
  ActivityIndicator,
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
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors, { Colors } from "@/constants/colors";
import { useOrdersStore } from "@/stores/orders-store";
import { usePaymentStore } from "@/stores/payment-store";
import mpesaService, { MpesaPaymentRequest } from "@/services/mpesa";

export default function PaymentScreen() {
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const { getOrderById, updatePaymentStatus } = useOrdersStore();
  const { createTransaction, updateTransactionStatus, getTransactionByOrderId } = usePaymentStore();
  
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'waiting'>('form');
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [phoneValidation, setPhoneValidation] = useState<{ valid: boolean; message?: string }>({ valid: true });
  const [currentTransactionId, setCurrentTransactionId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'testing' | 'success' | 'failed'>('unknown');

  const order = orderId ? getOrderById(orderId) : null;
  const orderAmount = order?.price || 450;

  useEffect(() => {
    if (orderId && !order) {
      Alert.alert("Order Not Found", "The order you're trying to pay for doesn't exist.", [
        { text: "Go Back", onPress: () => router.back() }
      ]);
    }
  }, [order, orderId]);

  // Test M-Pesa connection on component mount
  useEffect(() => {
    if (order?.paymentMethod === 'mpesa') {
      testMpesaConnection();
    }
  }, [order?.paymentMethod]);

  const testMpesaConnection = async () => {
    setConnectionStatus('testing');
    try {
      const result = await mpesaService.testConnection();
      setConnectionStatus(result.success ? 'success' : 'failed');
      if (!result.success) {
        console.warn('M-Pesa connection test failed:', result.message);
      }
    } catch (error) {
      setConnectionStatus('failed');
      console.error('M-Pesa connection test error:', error);
    }
  };

  // Validate phone number on change
  const handlePhoneChange = (phone: string) => {
    setMpesaPhone(phone);
    if (phone.length > 0) {
      const validation = mpesaService.validatePhoneNumber(phone);
      setPhoneValidation(validation);
    } else {
      setPhoneValidation({ valid: true });
    }
  };

  const handleMpesaPayment = async () => {
    if (!order || !orderId) {
      Alert.alert("Error", "No order found to process payment");
      return;
    }

    if (!mpesaPhone) {
      Alert.alert("Missing Information", "Please enter your M-Pesa phone number");
      return;
    }

    const validation = mpesaService.validatePhoneNumber(mpesaPhone);
    if (!validation.valid) {
      Alert.alert("Invalid Phone Number", validation.message || "Please enter a valid phone number");
      return;
    }

    // Test connection first if it failed
    if (connectionStatus === 'failed') {
      Alert.alert(
        "Connection Issue",
        "There seems to be an issue with M-Pesa connection. Would you like to retry?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Retry", 
            onPress: async () => {
              await testMpesaConnection();
              // The connection status will be updated, and user can try again manually
            }
          },
        ]
      );
      return;
    }

    setIsProcessing(true);
    setPaymentStep('processing');

    try {
      // Create payment transaction record
      const transactionId = createTransaction({
        orderId: orderId,
        method: 'mpesa',
        amount: orderAmount,
        status: 'pending',
        phoneNumber: mpesaPhone,
      });
      setCurrentTransactionId(transactionId);
      
      const paymentRequest: MpesaPaymentRequest = {
        phoneNumber: mpesaPhone,
        amount: orderAmount,
        orderId: orderId,
        description: `Payment for delivery from ${order.from} to ${order.to}`,
      };

      console.log('Initiating M-Pesa payment:', paymentRequest);

      // Update transaction to processing
      updateTransactionStatus(transactionId, 'processing');
      
      const response = await mpesaService.initiateSTKPush(paymentRequest);

      console.log('M-Pesa payment response:', response);

      if (response.success && response.checkoutRequestId) {
        setCheckoutRequestId(response.checkoutRequestId);
        setPaymentStep('waiting');
        
        // Update transaction with checkout request ID
        updateTransactionStatus(transactionId, 'processing', {
          checkoutRequestId: response.checkoutRequestId,
        });
        
        Alert.alert(
          "Payment Request Sent! 📱",
          response.customerMessage || `Please check your phone ${mpesaPhone} for the M-Pesa prompt and enter your PIN to complete the payment.`,
          [
            {
              text: "I've Paid",
              onPress: () => handlePaymentConfirmation(),
            },
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => {
                updateTransactionStatus(transactionId, 'cancelled');
                setPaymentStep('form');
                setIsProcessing(false);
              },
            },
          ]
        );
      } else {
        updateTransactionStatus(transactionId, 'failed', {
          errorMessage: response.error || 'Payment initiation failed',
        });
        throw new Error(response.error || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('M-Pesa payment error:', error);
      Alert.alert(
        "Payment Failed",
        `Failed to initiate payment: ${error instanceof Error ? error.message : "Unknown error"}. Please check your connection and try again.`
      );
      setPaymentStep('form');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentConfirmation = async () => {
    if (!orderId || !checkoutRequestId || !currentTransactionId) return;

    setIsProcessing(true);
    
    try {
      console.log('Confirming payment for checkout request:', checkoutRequestId);
      
      // Query payment status from M-Pesa
      const statusResponse = await mpesaService.querySTKPushStatus(checkoutRequestId);
      
      console.log('Payment status response:', statusResponse);
      
      if (statusResponse.success) {
        // Payment successful
        updateTransactionStatus(currentTransactionId, 'completed', {
          mpesaReceiptNumber: statusResponse.mpesaReceiptNumber || `MP${Date.now()}`,
        });
        updatePaymentStatus(orderId, "paid");
        
        Alert.alert(
          "Payment Successful! 🎉",
          "Your M-Pesa payment has been confirmed. Your order is now being processed.",
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
      } else {
        // Payment failed or pending
        updateTransactionStatus(currentTransactionId, 'failed', {
          errorMessage: statusResponse.error || 'Payment verification failed',
        });
        
        Alert.alert(
          "Payment Verification Failed",
          statusResponse.error || "We couldn't verify your payment. Please try again or contact support if you've already paid."
        );
      }
    } catch (error) {
      console.error('Payment confirmation error:', error);
      updateTransactionStatus(currentTransactionId, 'failed', {
        errorMessage: error instanceof Error ? error.message : 'Payment verification failed',
      });
      
      Alert.alert(
        "Payment Verification Failed",
        "We couldn't verify your payment. Please contact support if you've already paid."
      );
    } finally {
      setIsProcessing(false);
      setPaymentStep('form');
    }
  };

  const handleCardPayment = async () => {
    if (!order || !orderId) {
      Alert.alert("Error", "No order found to process payment");
      return;
    }

    if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
      Alert.alert("Missing Information", "Please fill in all card details");
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create payment transaction record
      const transactionId = createTransaction({
        orderId: orderId,
        method: 'card',
        amount: orderAmount,
        status: 'processing',
      });
      setCurrentTransactionId(transactionId);
      
      // Simulate card payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update transaction and order status
      updateTransactionStatus(transactionId, 'completed');
      updatePaymentStatus(orderId, "paid");
      
      Alert.alert(
        "Payment Successful! 🎉",
        `Your card payment of KSh ${orderAmount.toLocaleString()} has been processed successfully.`,
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
    } catch (error) {
      if (currentTransactionId) {
        updateTransactionStatus(currentTransactionId, 'failed', {
          errorMessage: error instanceof Error ? error.message : 'Card payment failed',
        });
      }
      
      Alert.alert(
        "Payment Failed",
        "Card payment failed. Please check your details and try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = () => {
    if (order?.paymentMethod === "mpesa") {
      handleMpesaPayment();
    } else if (order?.paymentMethod === "card") {
      handleCardPayment();
    }
  };

  const renderConnectionStatus = () => {
    if (order?.paymentMethod !== 'mpesa') return null;

    return (
      <View style={styles.connectionStatus}>
        <View style={styles.connectionStatusContent}>
          {connectionStatus === 'testing' && (
            <>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.connectionStatusText}>Testing M-Pesa connection...</Text>
            </>
          )}
          {connectionStatus === 'success' && (
            <>
              <CheckCircle size={16} color={colors.success} />
              <Text style={[styles.connectionStatusText, { color: colors.success }]}>
                M-Pesa connection ready
              </Text>
            </>
          )}
          {connectionStatus === 'failed' && (
            <>
              <AlertCircle size={16} color={colors.error} />
              <Text style={[styles.connectionStatusText, { color: colors.error }]}>
                M-Pesa connection failed
              </Text>
              <TouchableOpacity onPress={testMpesaConnection} style={styles.retryButton}>
                <RefreshCw size={14} color={colors.primary} />
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  const renderMpesaForm = () => (
    <View style={styles.paymentForm}>
      <LinearGradient
        colors={[colors.mpesa, "#00B85C"]}
        style={styles.mpesaHeader}
      >
        <View style={styles.mpesaHeaderContent}>
          <Zap size={24} color={colors.background} />
          <Text style={styles.mpesaHeaderTitle}>M-Pesa Payment</Text>
        </View>
        <Text style={styles.mpesaHeaderSubtitle}>
          Lipa na M-Pesa - Fast & Secure
        </Text>
      </LinearGradient>
      
      <View style={styles.formContent}>
        {renderConnectionStatus()}
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <View style={[
            styles.phoneInputContainer,
            !phoneValidation.valid && styles.phoneInputError
          ]}>
            <Text style={styles.countryCode}>+254</Text>
            <TextInput
              style={styles.phoneInput}
              placeholder="712345678"
              value={mpesaPhone}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              placeholderTextColor={colors.textMuted}
              editable={!isProcessing}
            />
          </View>
          {!phoneValidation.valid && phoneValidation.message && (
            <View style={styles.validationError}>
              <AlertCircle size={14} color={colors.error} />
              <Text style={styles.validationErrorText}>{phoneValidation.message}</Text>
            </View>
          )}
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
        <CreditCard size={24} color={colors.accent} />
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
            placeholderTextColor={colors.textMuted}
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
              placeholderTextColor={colors.textMuted}
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
              placeholderTextColor={colors.textMuted}
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
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </View>
    </View>
  );

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Package size={64} color={colors.textMuted} />
          <Text style={styles.errorTitle}>Order Not Found</Text>
          <Text style={styles.errorSubtitle}>
            The order you're trying to pay for doesn't exist or has been removed.
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Payment</Text>
          <Text style={styles.subtitle}>Complete your payment for Order #{order.id}</Text>
        </View>

        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.amountCard}
        >
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={styles.amountValue}>KSh {orderAmount.toLocaleString()}</Text>
          <View style={styles.amountBadge}>
            <Zap size={16} color={colors.primary} />
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
          <TouchableOpacity 
            style={[
              styles.payButton,
              (isProcessing || !phoneValidation.valid || connectionStatus === 'failed') && styles.payButtonDisabled
            ]} 
            onPress={handlePayment}
            disabled={isProcessing || (order.paymentMethod === "mpesa" && (!phoneValidation.valid || connectionStatus === 'failed'))}
          >
            <LinearGradient
              colors={[
                isProcessing || connectionStatus === 'failed' ? colors.textMuted : colors.primary,
                isProcessing || connectionStatus === 'failed' ? colors.textMuted : colors.primaryDark
              ]}
              style={styles.payButtonGradient}
            >
              {isProcessing ? (
                <>
                  <ActivityIndicator size="small" color={colors.background} />
                  <Text style={styles.payButtonText}>
                    {paymentStep === 'processing' ? 'Initiating Payment...' : 
                     paymentStep === 'waiting' ? 'Confirming Payment...' : 'Processing...'}
                  </Text>
                </>
              ) : (
                <>
                  {order.paymentMethod === "mpesa" && <Smartphone size={20} color={colors.background} />}
                  {order.paymentMethod === "card" && <CreditCard size={20} color={colors.background} />}
                  <Text style={styles.payButtonText}>
                    {order.paymentMethod === "mpesa" ? 'Pay with M-Pesa' : 'Pay with Card'} - KSh {orderAmount.toLocaleString()}
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}
        
        {paymentStep === 'waiting' && (
          <View style={styles.waitingCard}>
            <LinearGradient
              colors={[colors.mpesa, "#00B85C"]}
              style={styles.waitingGradient}
            >
              <View style={styles.waitingContent}>
                <Clock size={32} color={colors.background} />
                <Text style={styles.waitingTitle}>Waiting for Payment</Text>
                <Text style={styles.waitingSubtitle}>
                  Please complete the payment on your phone using M-Pesa PIN
                </Text>
                <Text style={styles.waitingPhone}>📱 {mpesaPhone}</Text>
              </View>
            </LinearGradient>
          </View>
        )}

        <View style={styles.securityNote}>
          <Shield size={16} color={colors.success} />
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
    backgroundColor: colors.backgroundSecondary,
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
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  amountCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  amountLabel: {
    fontSize: 16,
    color: colors.background + "CC",
    marginBottom: 8,
    fontWeight: "600",
  },
  amountValue: {
    fontSize: 36,
    fontWeight: "900",
    color: colors.background,
    marginBottom: 12,
    letterSpacing: -1,
  },
  amountBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  amountBadgeText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "700",
  },
  orderSummary: {
    backgroundColor: colors.background,
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
    color: colors.text,
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
    color: colors.textMuted,
    fontWeight: "500",
  },
  orderSummaryValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  paymentForm: {
    backgroundColor: colors.background,
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
    color: colors.background,
  },
  mpesaHeaderSubtitle: {
    fontSize: 14,
    color: colors.background + "CC",
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
    color: colors.text,
  },
  formContent: {
    padding: 20,
  },
  connectionStatus: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
  },
  connectionStatusContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  connectionStatusText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    flex: 1,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  retryButtonText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 8,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.borderLight,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: Colors.light.borderLight,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontWeight: "500",
  },
  textInput: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.text,
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
    color: colors.text,
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
    backgroundColor: colors.mpesa,
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.background,
  },
  stepText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  payButton: {
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  payButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.1,
  },
  payButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 12,
    borderRadius: 20,
  },
  payButtonText: {
    color: colors.background,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  phoneInputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  validationError: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  validationErrorText: {
    fontSize: 12,
    color: colors.error,
    fontWeight: "500",
  },
  waitingCard: {
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: colors.mpesa,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  waitingGradient: {
    padding: 24,
    borderRadius: 20,
  },
  waitingContent: {
    alignItems: "center",
    gap: 12,
  },
  waitingTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.background,
    textAlign: "center",
  },
  waitingSubtitle: {
    fontSize: 14,
    color: colors.background + "CC",
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 20,
  },
  waitingPhone: {
    fontSize: 16,
    color: colors.background,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 8,
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
    color: colors.textMuted,
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