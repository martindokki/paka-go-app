import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Calculator, Package, DollarSign, MapPin, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import { PricingService, PriceCalculationOptions, PriceBreakdown } from '@/constants/pricing';
import { useOrdersStore } from '@/stores/orders-store';
import { useAuthStore } from '@/stores/auth-store';

export default function DebugPricingScreen() {
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [testOptions, setTestOptions] = useState<PriceCalculationOptions>({
    distance: 5,
    isFragile: false,
    hasInsurance: false,
    isAfterHours: false,
    isWeekend: false,
  });
  
  const { orders } = useOrdersStore();
  const { user } = useAuthStore();

  useEffect(() => {
    calculateTestPrice();
  }, [testOptions]);

  const calculateTestPrice = () => {
    const breakdown = PricingService.calculatePrice(testOptions);
    setPriceBreakdown(breakdown);
    console.log('Test price calculation:', { options: testOptions, breakdown });
  };

  const testScenarios = [
    {
      name: 'Basic Delivery (5km)',
      options: { distance: 5, isFragile: false, hasInsurance: false, isAfterHours: false, isWeekend: false },
    },
    {
      name: 'Fragile Package (8km)',
      options: { distance: 8, isFragile: true, hasInsurance: false, isAfterHours: false, isWeekend: false },
    },
    {
      name: 'Insured Electronics (12km)',
      options: { distance: 12, isFragile: true, hasInsurance: true, isAfterHours: false, isWeekend: false },
    },
    {
      name: 'Weekend Delivery (6km)',
      options: { distance: 6, isFragile: false, hasInsurance: false, isAfterHours: false, isWeekend: true },
    },
    {
      name: 'After Hours + Insurance (10km)',
      options: { distance: 10, isFragile: false, hasInsurance: true, isAfterHours: true, isWeekend: false },
    },
  ];

  const runTestScenario = (scenario: typeof testScenarios[0]) => {
    setTestOptions(scenario.options);
    Alert.alert(
      `Test: ${scenario.name}`,
      `Distance: ${scenario.options.distance}km\nFragile: ${scenario.options.isFragile ? 'Yes' : 'No'}\nInsurance: ${scenario.options.hasInsurance ? 'Yes' : 'No'}\nAfter Hours: ${scenario.options.isAfterHours ? 'Yes' : 'No'}\nWeekend: ${scenario.options.isWeekend ? 'Yes' : 'No'}`,
      [{ text: 'OK' }]
    );
  };

  const createTestOrder = async () => {
    if (!user) {
      Alert.alert('Error', 'Please log in first');
      return;
    }

    try {
      const { createOrder } = useOrdersStore.getState();
      
      const testOrderData = {
        customerId: user.id,
        clientId: user.id,
        pickupAddress: 'Test Pickup Location, Nairobi',
        deliveryAddress: 'Test Delivery Location, Nairobi',
        recipientName: 'Test Recipient',
        recipientPhone: '+254712345678',
        packageType: 'documents',
        packageDescription: 'Test package for pricing verification',
        paymentMethod: 'mpesa',
        paymentTerm: 'pay_now',
        price: priceBreakdown?.total || 0,
        estimatedDistance: testOptions.distance,
        isFragile: testOptions.isFragile,
        hasInsurance: testOptions.hasInsurance,
        createdAt: new Date().toISOString(),
      };

      const orderId = await createOrder(testOrderData);
      
      Alert.alert(
        'Test Order Created! 🎉',
        `Order ID: ${orderId}\nPrice: KSh ${priceBreakdown?.total || 0}\n\nYou can view this order in the Orders screen.`,
        [
          {
            text: 'View Orders',
            onPress: () => router.push('/(client)/orders'),
          },
          {
            text: 'OK',
          },
        ]
      );
    } catch (error) {
      console.error('Test order creation error:', error);
      Alert.alert('Error', 'Failed to create test order');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[colors.accent, colors.accentDark]}
        style={styles.header}
      >
        <Calculator size={32} color={colors.background} />
        <Text style={styles.title}>Pricing Debug</Text>
        <Text style={styles.subtitle}>Test and verify pricing calculations</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Current Test Options */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Test Options</Text>
          <View style={styles.optionRow}>
            <MapPin size={16} color={colors.primary} />
            <Text style={styles.optionText}>Distance: {testOptions.distance} km</Text>
          </View>
          <View style={styles.optionRow}>
            <Package size={16} color={testOptions.isFragile ? colors.warning : colors.textMuted} />
            <Text style={styles.optionText}>Fragile: {testOptions.isFragile ? 'Yes' : 'No'}</Text>
          </View>
          <View style={styles.optionRow}>
            <Package size={16} color={testOptions.hasInsurance ? colors.success : colors.textMuted} />
            <Text style={styles.optionText}>Insurance: {testOptions.hasInsurance ? 'Yes' : 'No'}</Text>
          </View>
          <View style={styles.optionRow}>
            <Clock size={16} color={testOptions.isAfterHours ? colors.warning : colors.textMuted} />
            <Text style={styles.optionText}>After Hours: {testOptions.isAfterHours ? 'Yes' : 'No'}</Text>
          </View>
          <View style={styles.optionRow}>
            <Clock size={16} color={testOptions.isWeekend ? colors.info : colors.textMuted} />
            <Text style={styles.optionText}>Weekend: {testOptions.isWeekend ? 'Yes' : 'No'}</Text>
          </View>
        </View>

        {/* Price Breakdown */}
        {priceBreakdown && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Price Breakdown</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Base Fare:</Text>
              <Text style={styles.priceValue}>KSh {priceBreakdown.baseFare}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Distance Fee ({testOptions.distance} km):</Text>
              <Text style={styles.priceValue}>KSh {priceBreakdown.distanceFee}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal:</Text>
              <Text style={styles.priceValue}>KSh {priceBreakdown.subtotal}</Text>
            </View>
            
            {priceBreakdown.fragileCharge > 0 && (
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: colors.warning }]}>Fragile Handling (20%):</Text>
                <Text style={[styles.priceValue, { color: colors.warning }]}>+KSh {priceBreakdown.fragileCharge}</Text>
              </View>
            )}
            
            {priceBreakdown.insuranceCharge > 0 && (
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: colors.success }]}>Insurance (20%):</Text>
                <Text style={[styles.priceValue, { color: colors.success }]}>+KSh {priceBreakdown.insuranceCharge}</Text>
              </View>
            )}
            
            {priceBreakdown.afterHoursCharge > 0 && (
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: colors.warning }]}>After Hours (10%):</Text>
                <Text style={[styles.priceValue, { color: colors.warning }]}>+KSh {priceBreakdown.afterHoursCharge}</Text>
              </View>
            )}
            
            {priceBreakdown.weekendCharge > 0 && (
              <View style={styles.priceRow}>
                <Text style={[styles.priceLabel, { color: colors.info }]}>Weekend (10%):</Text>
                <Text style={[styles.priceValue, { color: colors.info }]}>+KSh {priceBreakdown.weekendCharge}</Text>
              </View>
            )}
            
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>TOTAL:</Text>
              <Text style={styles.totalValue}>KSh {priceBreakdown.total}</Text>
            </View>
            
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Driver Earnings:</Text>
              <Text style={[styles.priceValue, { color: colors.success }]}>KSh {priceBreakdown.driverEarnings}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Company Commission:</Text>
              <Text style={[styles.priceValue, { color: colors.primary }]}>KSh {priceBreakdown.companyCommission}</Text>
            </View>
          </View>
        )}

        {/* Test Scenarios */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Test Scenarios</Text>
          {testScenarios.map((scenario, index) => (
            <TouchableOpacity
              key={index}
              style={styles.scenarioButton}
              onPress={() => runTestScenario(scenario)}
            >
              <Text style={styles.scenarioText}>{scenario.name}</Text>
              <Text style={styles.scenarioPrice}>
                KSh {PricingService.calculatePrice(scenario.options).total}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.createOrderButton} onPress={createTestOrder}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.buttonGradient}
            >
              <Package size={20} color={colors.background} />
              <Text style={styles.buttonText}>Create Test Order</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.viewOrdersButton}
            onPress={() => router.push('/(client)/orders')}
          >
            <Text style={styles.viewOrdersText}>View All Orders ({orders.length})</Text>
          </TouchableOpacity>
        </View>

        {/* Debug Info */}
        <View style={styles.debugCard}>
          <Text style={styles.debugTitle}>Debug Info</Text>
          <Text style={styles.debugText}>User: {user?.name || 'Not logged in'}</Text>
          <Text style={styles.debugText}>User Type: {user?.userType || 'N/A'}</Text>
          <Text style={styles.debugText}>Total Orders: {orders.length}</Text>
          <Text style={styles.debugText}>Current Time: {new Date().toLocaleString()}</Text>
          <Text style={styles.debugText}>Is After Hours: {PricingService.isAfterHours() ? 'Yes' : 'No'}</Text>
          <Text style={styles.debugText}>Is Weekend: {PricingService.isWeekend() ? 'Yes' : 'No'}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    padding: 40,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.background,
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.background + 'CC',
    fontWeight: '500',
  },
  content: {
    padding: 20,
  },
  card: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  optionText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '800',
  },
  totalValue: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '900',
  },
  scenarioButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  scenarioText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
  },
  scenarioPrice: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
  actions: {
    marginTop: 8,
  },
  createOrderButton: {
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.background,
  },
  viewOrdersButton: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  viewOrdersText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  debugCard: {
    backgroundColor: colors.info + '10',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.info + '30',
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.info,
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: colors.info,
    fontWeight: '500',
    marginBottom: 4,
  },
});