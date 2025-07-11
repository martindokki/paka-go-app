import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { X, DollarSign, Info, Shield, Clock, Calendar, Timer } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import { PriceBreakdown } from '@/constants/pricing';

interface PriceBreakdownModalProps {
  visible: boolean;
  onClose: () => void;
  breakdown: PriceBreakdown;
  distance: number;
}

export const PriceBreakdownModal: React.FC<PriceBreakdownModalProps> = ({
  visible,
  onClose,
  breakdown,
  distance,
}) => {
  const renderBredownItem = (
    icon: React.ReactNode,
    label: string,
    amount: number,
    isAddOn = false
  ) => {
    if (amount === 0 && isAddOn) return null;
    
    return (
      <View style={styles.breakdownItem}>
        <View style={styles.breakdownLeft}>
          <View style={[styles.breakdownIcon, isAddOn && styles.addOnIcon]}>
            {icon}
          </View>
          <Text style={[styles.breakdownLabel, isAddOn && styles.addOnLabel]}>
            {label}
          </Text>
        </View>
        <Text style={[styles.breakdownAmount, isAddOn && styles.addOnAmount]}>
          {isAddOn && amount > 0 ? '+' : ''}KSh {amount}
        </Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Price Breakdown</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Base Charges */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Base Charges</Text>
            <View style={styles.sectionContent}>
              {renderBredownItem(
                <DollarSign size={16} color={colors.primary} />,
                'Base Fare',
                breakdown.baseFare
              )}
              {renderBredownItem(
                <DollarSign size={16} color={colors.primary} />,
                `Distance (${distance.toFixed(1)} km)`,
                breakdown.distanceFee
              )}
              <View style={styles.divider} />
              {renderBredownItem(
                <DollarSign size={16} color={colors.text} />,
                'Subtotal',
                breakdown.subtotal
              )}
            </View>
          </View>

          {/* Add-ons */}
          {(breakdown.fragileCharge > 0 || breakdown.insuranceCharge > 0 || 
            breakdown.afterHoursCharge > 0 || breakdown.weekendCharge > 0 || 
            breakdown.waitTimeCharge > 0) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Add-ons</Text>
              <View style={styles.sectionContent}>
                {renderBredownItem(
                  <Shield size={16} color={colors.accent} />,
                  'Fragile Handling (20%)',
                  breakdown.fragileCharge,
                  true
                )}
                {renderBredownItem(
                  <Shield size={16} color={colors.accent} />,
                  'Insurance Cover (20%)',
                  breakdown.insuranceCharge,
                  true
                )}
                {renderBredownItem(
                  <Clock size={16} color={colors.accent} />,
                  'After-hours Delivery (10%)',
                  breakdown.afterHoursCharge,
                  true
                )}
                {renderBredownItem(
                  <Calendar size={16} color={colors.accent} />,
                  'Weekend Delivery (10%)',
                  breakdown.weekendCharge,
                  true
                )}
                {renderBredownItem(
                  <Timer size={16} color={colors.accent} />,
                  'Wait Time',
                  breakdown.waitTimeCharge,
                  true
                )}
              </View>
            </View>
          )}

          {/* Total */}
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.totalCard}
          >
            <View style={styles.totalContent}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>KSh {breakdown.total}</Text>
            </View>
          </LinearGradient>

          {/* Driver Info */}
          <View style={styles.driverInfo}>
            <View style={styles.infoItem}>
              <Info size={16} color={colors.textSecondary} />
              <Text style={styles.infoText}>
                Driver earns KSh {breakdown.driverEarnings} (85% of total)
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Info size={16} color={colors.textSecondary} />
              <Text style={styles.infoText}>
                PAKA-Go commission: KSh {breakdown.companyCommission} (15%)
              </Text>
            </View>
          </View>

          {/* Pricing Notes */}
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Pricing Notes</Text>
            <Text style={styles.notesText}>
              • Minimum charge of KSh 150 applies to all deliveries{"\n"}
              • Fragile items include electronics, glass, and perishables{"\n"}
              • Insurance covers up to KSh 10,000 in case of damage{"\n"}
              • After-hours: 7 PM - 6 AM weekdays{"\n"}
              • Wait time charged after 5 minutes at pickup/drop-off
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  breakdownIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addOnIcon: {
    backgroundColor: colors.accentLight,
  },
  breakdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  addOnLabel: {
    color: colors.textSecondary,
  },
  breakdownAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  addOnAmount: {
    color: colors.accent,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 8,
  },
  totalCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  totalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.background,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.background,
  },
  driverInfo: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  notesSection: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    fontWeight: '500',
  },
});