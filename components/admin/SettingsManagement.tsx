import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  Switch
} from 'react-native';
import { 
  DollarSign, 
  Settings, 
  Save, 
  RefreshCw,
  AlertTriangle,
  Info,
  Truck,
  Clock,
  Shield,
  Percent
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { useAdminStore, AdminSettings } from '@/stores/admin-store';

interface SettingCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  children: React.ReactNode;
}

function SettingCard({ title, description, icon: IconComponent, children }: SettingCardProps) {
  return (
    <View style={styles.settingCard}>
      <View style={styles.settingHeader}>
        <View style={styles.settingIcon}>
          <IconComponent size={24} color={colors.primary} />
        </View>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingDescription}>{description}</Text>
        </View>
      </View>
      <View style={styles.settingContent}>
        {children}
      </View>
    </View>
  );
}

interface PricingInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  suffix?: string;
  keyboardType?: 'numeric' | 'default';
}

function PricingInput({ label, value, onChangeText, suffix = 'KES', keyboardType = 'numeric' }: PricingInputProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholderTextColor={colors.textMuted}
        />
        {suffix && <Text style={styles.inputSuffix}>{suffix}</Text>}
      </View>
    </View>
  );
}

export function SettingsManagement() {
  const { settings, updateSettings, isLoading } = useAdminStore();
  
  // Local state for form inputs
  const [baseFare, setBaseFare] = useState(settings?.baseFare?.toString() || '80');
  const [perKmRate, setPerKmRate] = useState(settings?.perKmRate?.toString() || '11');
  const [minimumCharge, setMinimumCharge] = useState(settings?.minimumCharge?.toString() || '150');
  const [fragileItemSurcharge, setFragileItemSurcharge] = useState(settings?.fragileItemSurcharge?.toString() || '20');
  const [insuranceSurcharge, setInsuranceSurcharge] = useState(settings?.insuranceSurcharge?.toString() || '20');
  const [afterHoursSurcharge, setAfterHoursSurcharge] = useState(settings?.afterHoursSurcharge?.toString() || '10');
  const [weekendSurcharge, setWeekendSurcharge] = useState(settings?.weekendSurcharge?.toString() || '10');
  const [waitTimeRate, setWaitTimeRate] = useState(settings?.waitTimeRate?.toString() || '5');
  const [commissionRate, setCommissionRate] = useState(settings?.commissionRate?.toString() || '15');
  const [maintenanceMode, setMaintenanceMode] = useState(settings?.maintenanceMode || false);

  // Update local state when settings change
  React.useEffect(() => {
    if (settings) {
      setBaseFare(settings.baseFare.toString());
      setPerKmRate(settings.perKmRate.toString());
      setMinimumCharge(settings.minimumCharge.toString());
      setFragileItemSurcharge(settings.fragileItemSurcharge.toString());
      setInsuranceSurcharge(settings.insuranceSurcharge.toString());
      setAfterHoursSurcharge(settings.afterHoursSurcharge.toString());
      setWeekendSurcharge(settings.weekendSurcharge.toString());
      setWaitTimeRate(settings.waitTimeRate.toString());
      setCommissionRate(settings.commissionRate.toString());
      setMaintenanceMode(settings.maintenanceMode);
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    // Validate inputs
    const numericFields = {
      baseFare: parseFloat(baseFare),
      perKmRate: parseFloat(perKmRate),
      minimumCharge: parseFloat(minimumCharge),
      fragileItemSurcharge: parseFloat(fragileItemSurcharge),
      insuranceSurcharge: parseFloat(insuranceSurcharge),
      afterHoursSurcharge: parseFloat(afterHoursSurcharge),
      weekendSurcharge: parseFloat(weekendSurcharge),
      waitTimeRate: parseFloat(waitTimeRate),
      commissionRate: parseFloat(commissionRate),
    };

    // Check for invalid numbers
    const invalidFields = Object.entries(numericFields).filter(([_, value]) => isNaN(value) || value < 0);
    
    if (invalidFields.length > 0) {
      Alert.alert('Error', 'Please enter valid positive numbers for all fields');
      return;
    }

    const newSettings: Partial<AdminSettings> = {
      ...numericFields,
      maintenanceMode,
    };

    const success = await updateSettings(newSettings);
    if (success) {
      Alert.alert('Success', 'Settings updated successfully');
    } else {
      Alert.alert('Error', 'Failed to update settings');
    }
  };

  const handleResetToDefaults = () => {
    Alert.alert(
      'Reset to Defaults',
      'Are you sure you want to reset all settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setBaseFare('80');
            setPerKmRate('11');
            setMinimumCharge('150');
            setFragileItemSurcharge('20');
            setInsuranceSurcharge('20');
            setAfterHoursSurcharge('10');
            setWeekendSurcharge('10');
            setWaitTimeRate('5');
            setCommissionRate('15');
            setMaintenanceMode(false);
          }
        }
      ]
    );
  };

  const calculateSamplePrice = () => {
    const distance = 8; // 8km sample
    const base = parseFloat(baseFare) || 80;
    const perKm = parseFloat(perKmRate) || 11;
    const fragile = parseFloat(fragileItemSurcharge) || 20;
    const insurance = parseFloat(insuranceSurcharge) || 20;
    
    const subtotal = base + (distance * perKm);
    const fragileCharge = (subtotal * fragile) / 100;
    const insuranceCharge = (subtotal * insurance) / 100;
    const total = subtotal + fragileCharge + insuranceCharge;
    
    return {
      base,
      distance: distance * perKm,
      subtotal,
      fragileCharge,
      insuranceCharge,
      total
    };
  };

  const samplePrice = calculateSamplePrice();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.resetButton}
          onPress={handleResetToDefaults}
        >
          <RefreshCw size={16} color={colors.textMuted} />
          <Text style={styles.resetButtonText}>Reset to Defaults</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSaveSettings}
          disabled={isLoading}
        >
          <Save size={16} color={colors.background} />
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Pricing */}
        <SettingCard
          title="Basic Pricing"
          description="Set the fundamental pricing structure for deliveries"
          icon={DollarSign}
        >
          <View style={styles.inputRow}>
            <PricingInput
              label="Base Fare"
              value={baseFare}
              onChangeText={setBaseFare}
            />
            <PricingInput
              label="Per Kilometer Rate"
              value={perKmRate}
              onChangeText={setPerKmRate}
            />
          </View>
          
          <PricingInput
            label="Minimum Charge"
            value={minimumCharge}
            onChangeText={setMinimumCharge}
          />
        </SettingCard>

        {/* Surcharges */}
        <SettingCard
          title="Additional Charges"
          description="Configure optional surcharges and add-ons"
          icon={Percent}
        >
          <View style={styles.inputRow}>
            <PricingInput
              label="Fragile Items"
              value={fragileItemSurcharge}
              onChangeText={setFragileItemSurcharge}
              suffix="%"
            />
            <PricingInput
              label="Insurance Cover"
              value={insuranceSurcharge}
              onChangeText={setInsuranceSurcharge}
              suffix="%"
            />
          </View>
          
          <View style={styles.inputRow}>
            <PricingInput
              label="After Hours"
              value={afterHoursSurcharge}
              onChangeText={setAfterHoursSurcharge}
              suffix="%"
            />
            <PricingInput
              label="Weekend Delivery"
              value={weekendSurcharge}
              onChangeText={setWeekendSurcharge}
              suffix="%"
            />
          </View>
          
          <PricingInput
            label="Wait Time Rate (per minute)"
            value={waitTimeRate}
            onChangeText={setWaitTimeRate}
          />
        </SettingCard>

        {/* Driver Settings */}
        <SettingCard
          title="Driver Commission"
          description="Set commission rates for driver payouts"
          icon={Truck}
        >
          <PricingInput
            label="Commission Rate"
            value={commissionRate}
            onChangeText={setCommissionRate}
            suffix="%"
          />
          
          <View style={styles.infoBox}>
            <Info size={16} color={colors.info} />
            <Text style={styles.infoText}>
              Drivers receive {100 - (parseFloat(commissionRate) || 15)}% of the total fare
            </Text>
          </View>
        </SettingCard>

        {/* System Settings */}
        <SettingCard
          title="System Settings"
          description="Configure system-wide settings and maintenance mode"
          icon={Settings}
        >
          <View style={styles.switchContainer}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Maintenance Mode</Text>
              <Text style={styles.switchDescription}>
                Temporarily disable app functionality for maintenance
              </Text>
            </View>
            <Switch
              value={maintenanceMode}
              onValueChange={setMaintenanceMode}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={maintenanceMode ? colors.primary : colors.textMuted}
            />
          </View>
          
          {maintenanceMode && (
            <View style={styles.warningBox}>
              <AlertTriangle size={16} color={colors.warning} />
              <Text style={styles.warningText}>
                Maintenance mode is enabled. Users cannot place new orders.
              </Text>
            </View>
          )}
        </SettingCard>

        {/* Price Calculator */}
        <SettingCard
          title="Price Calculator"
          description="Preview how pricing changes affect order totals"
          icon={Clock}
        >
          <View style={styles.calculatorContainer}>
            <Text style={styles.calculatorTitle}>Sample Order (8km, Fragile + Insurance)</Text>
            
            <View style={styles.calculatorRow}>
              <Text style={styles.calculatorLabel}>Base Fare:</Text>
              <Text style={styles.calculatorValue}>KES {samplePrice.base.toFixed(0)}</Text>
            </View>
            
            <View style={styles.calculatorRow}>
              <Text style={styles.calculatorLabel}>Distance (8km):</Text>
              <Text style={styles.calculatorValue}>KES {samplePrice.distance.toFixed(0)}</Text>
            </View>
            
            <View style={styles.calculatorRow}>
              <Text style={styles.calculatorLabel}>Subtotal:</Text>
              <Text style={styles.calculatorValue}>KES {samplePrice.subtotal.toFixed(0)}</Text>
            </View>
            
            <View style={styles.calculatorRow}>
              <Text style={styles.calculatorLabel}>Fragile ({fragileItemSurcharge}%):</Text>
              <Text style={styles.calculatorValue}>+KES {samplePrice.fragileCharge.toFixed(0)}</Text>
            </View>
            
            <View style={styles.calculatorRow}>
              <Text style={styles.calculatorLabel}>Insurance ({insuranceSurcharge}%):</Text>
              <Text style={styles.calculatorValue}>+KES {samplePrice.insuranceCharge.toFixed(0)}</Text>
            </View>
            
            <View style={[styles.calculatorRow, styles.calculatorTotal]}>
              <Text style={styles.calculatorTotalLabel}>Total:</Text>
              <Text style={styles.calculatorTotalValue}>KES {samplePrice.total.toFixed(0)}</Text>
            </View>
          </View>
        </SettingCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    gap: 8,
  },
  resetButtonText: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 14,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonText: {
    color: colors.background,
    fontWeight: '600',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  settingCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textMuted,
  },
  settingContent: {
    gap: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.backgroundSecondary,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  inputSuffix: {
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: colors.textMuted,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondaryLight,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.info,
    flex: 1,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  warningText: {
    fontSize: 14,
    color: colors.warning,
    flex: 1,
    fontWeight: '500',
  },
  calculatorContainer: {
    backgroundColor: colors.backgroundSecondary,
    padding: 16,
    borderRadius: 8,
  },
  calculatorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  calculatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  calculatorLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  calculatorValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  calculatorTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 8,
    paddingTop: 8,
  },
  calculatorTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  calculatorTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
});