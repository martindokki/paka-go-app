import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Receipt,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import colors from "@/constants/colors";
import { usePaymentStore, PaymentTransaction } from "@/stores/payment-store";
import { useOrdersStore } from "@/stores/orders-store";

export default function PaymentHistoryScreen() {
  const { transactions } = usePaymentStore();
  const { getOrderById } = useOrdersStore();

  const getPaymentMethodIcon = (method: PaymentTransaction['method']) => {
    switch (method) {
      case 'mpesa':
        return Smartphone;
      case 'card':
        return CreditCard;
      case 'cash':
        return DollarSign;
      default:
        return Receipt;
    }
  };

  const getPaymentMethodName = (method: PaymentTransaction['method']) => {
    switch (method) {
      case 'mpesa':
        return 'M-Pesa';
      case 'card':
        return 'Card';
      case 'cash':
        return 'Cash';
      default:
        return 'Unknown';
    }
  };

  const getStatusIcon = (status: PaymentTransaction['status']) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'failed':
      case 'cancelled':
        return XCircle;
      case 'processing':
        return Clock;
      case 'pending':
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status: PaymentTransaction['status']) => {
    switch (status) {
      case 'completed':
        return colors.success;
      case 'failed':
      case 'cancelled':
        return colors.error;
      case 'processing':
        return colors.primary;
      case 'pending':
        return colors.warning;
      default:
        return colors.textMuted;
    }
  };

  const getStatusText = (status: PaymentTransaction['status']) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'cancelled':
        return 'Cancelled';
      case 'processing':
        return 'Processing';
      case 'pending':
        return 'Pending';
      default:
        return status;
    }
  };

  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Payment History</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {sortedTransactions.length > 0 ? (
          <View style={styles.transactionsList}>
            {sortedTransactions.map((transaction) => {
              const order = getOrderById(transaction.orderId);
              const PaymentIcon = getPaymentMethodIcon(transaction.method);
              const StatusIcon = getStatusIcon(transaction.status);
              const statusColor = getStatusColor(transaction.status);

              return (
                <TouchableOpacity
                  key={transaction.id}
                  style={styles.transactionCard}
                  onPress={() => {
                    if (order) {
                      router.push(`/tracking?orderId=${order.id}`);
                    }
                  }}
                >
                  <View style={styles.transactionHeader}>
                    <View style={styles.transactionLeft}>
                      <LinearGradient
                        colors={
                          transaction.method === 'mpesa'
                            ? [colors.mpesa, "#00B85C"]
                            : transaction.method === 'card'
                            ? [colors.accent, colors.accentDark]
                            : [colors.textMuted, colors.textMuted]
                        }
                        style={styles.paymentIcon}
                      >
                        <PaymentIcon size={20} color={colors.background} />
                      </LinearGradient>
                      <View style={styles.transactionInfo}>
                        <Text style={styles.transactionTitle}>
                          {getPaymentMethodName(transaction.method)} Payment
                        </Text>
                        <Text style={styles.transactionSubtitle}>
                          Order #{transaction.orderId}
                        </Text>
                        {order && (
                          <Text style={styles.transactionRoute} numberOfLines={1}>
                            {order.from} → {order.to}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.transactionRight}>
                      <Text style={styles.transactionAmount}>
                        KSh {transaction.amount.toLocaleString()}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
                        <StatusIcon size={12} color={statusColor} />
                        <Text style={[styles.statusText, { color: statusColor }]}>
                          {getStatusText(transaction.status)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.transactionFooter}>
                    <Text style={styles.transactionDate}>
                      {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    {transaction.mpesaReceiptNumber && (
                      <Text style={styles.receiptNumber}>
                        Receipt: {transaction.mpesaReceiptNumber}
                      </Text>
                    )}
                    {transaction.phoneNumber && (
                      <Text style={styles.phoneNumber}>
                        📱 {transaction.phoneNumber}
                      </Text>
                    )}
                  </View>

                  {transaction.errorMessage && (
                    <View style={styles.errorMessage}>
                      <AlertTriangle size={14} color={colors.error} />
                      <Text style={styles.errorText}>{transaction.errorMessage}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <LinearGradient
              colors={[colors.primaryLight, colors.backgroundSecondary]}
              style={styles.emptyStateGradient}
            >
              <Receipt size={64} color={colors.primary} />
              <Text style={styles.emptyStateTitle}>No Payment History</Text>
              <Text style={styles.emptyStateSubtitle}>
                Your payment transactions will appear here once you start making orders.
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => router.push("/booking")}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.emptyStateButtonGradient}
                >
                  <Text style={styles.emptyStateButtonText}>Make Your First Order</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}
      </ScrollView>
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  transactionsList: {
    gap: 16,
  },
  transactionCard: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 16,
  },
  paymentIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 2,
  },
  transactionSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
    marginBottom: 2,
  },
  transactionRoute: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  transactionRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  transactionFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 12,
    gap: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  receiptNumber: {
    fontSize: 12,
    color: colors.success,
    fontWeight: "600",
  },
  phoneNumber: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  errorMessage: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    padding: 8,
    backgroundColor: colors.error + "10",
    borderRadius: 8,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    fontWeight: "500",
    flex: 1,
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
    paddingVertical: 40,
    borderRadius: 24,
    maxWidth: 320,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
    fontWeight: "500",
  },
  emptyStateButton: {
    borderRadius: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyStateButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.background,
  },
});