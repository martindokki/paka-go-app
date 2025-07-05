import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
  TextInput,
} from "react-native";
import {
  CreditCard,
  MapPin,
  Bell,
  Shield,
  DollarSign,
  Settings as SettingsIcon,
  ChevronRight,
} from "lucide-react-native";
import Colors from "@/constants/colors";

export default function AdminSettingsScreen() {
  const [settings, setSettings] = useState({
    autoAssignOrders: true,
    enableNotifications: true,
    requireDriverVerification: true,
    allowCashPayments: true,
    enableRealTimeTracking: true,
  });

  const [pricing, setPricing] = useState({
    baseFare: "50",
    perKmRate: "25",
    minimumFare: "100",
    commissionRate: "15",
  });

  const paymentMethods = [
    {
      id: "mpesa",
      name: "M-Pesa",
      enabled: true,
      description: "Mobile money payments",
    },
    {
      id: "card",
      name: "Credit/Debit Cards",
      enabled: true,
      description: "Visa, Mastercard payments",
    },
    {
      id: "cash",
      name: "Cash on Delivery",
      enabled: false,
      description: "Pay driver directly",
    },
    {
      id: "bitcoin",
      name: "Bitcoin",
      enabled: false,
      description: "Cryptocurrency payments",
    },
  ];

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updatePricing = (key: string, value: string) => {
    setPricing(prev => ({ ...prev, [key]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Settings</Text>
          <View style={styles.settingsList}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingName}>Auto-assign Orders</Text>
                <Text style={styles.settingDescription}>
                  Automatically assign orders to nearest available drivers
                </Text>
              </View>
              <Switch
                value={settings.autoAssignOrders}
                onValueChange={(value) => updateSetting("autoAssignOrders", value)}
                trackColor={{ false: Colors.light.border, true: Colors.light.primary + "40" }}
                thumbColor={settings.autoAssignOrders ? Colors.light.primary : Colors.light.textMuted}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingName}>Push Notifications</Text>
                <Text style={styles.settingDescription}>
                  Send notifications for new orders and updates
                </Text>
              </View>
              <Switch
                value={settings.enableNotifications}
                onValueChange={(value) => updateSetting("enableNotifications", value)}
                trackColor={{ false: Colors.light.border, true: Colors.light.primary + "40" }}
                thumbColor={settings.enableNotifications ? Colors.light.primary : Colors.light.textMuted}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingName}>Driver Verification</Text>
                <Text style={styles.settingDescription}>
                  Require document verification for new drivers
                </Text>
              </View>
              <Switch
                value={settings.requireDriverVerification}
                onValueChange={(value) => updateSetting("requireDriverVerification", value)}
                trackColor={{ false: Colors.light.border, true: Colors.light.primary + "40" }}
                thumbColor={settings.requireDriverVerification ? Colors.light.primary : Colors.light.textMuted}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingName}>Real-time Tracking</Text>
                <Text style={styles.settingDescription}>
                  Enable GPS tracking for active deliveries
                </Text>
              </View>
              <Switch
                value={settings.enableRealTimeTracking}
                onValueChange={(value) => updateSetting("enableRealTimeTracking", value)}
                trackColor={{ false: Colors.light.border, true: Colors.light.primary + "40" }}
                thumbColor={settings.enableRealTimeTracking ? Colors.light.primary : Colors.light.textMuted}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing Configuration</Text>
          <View style={styles.pricingGrid}>
            <View style={styles.pricingItem}>
              <Text style={styles.pricingLabel}>Base Fare (KSh)</Text>
              <TextInput
                style={styles.pricingInput}
                value={pricing.baseFare}
                onChangeText={(value) => updatePricing("baseFare", value)}
                keyboardType="numeric"
                placeholder="50"
              />
            </View>
            <View style={styles.pricingItem}>
              <Text style={styles.pricingLabel}>Per KM Rate (KSh)</Text>
              <TextInput
                style={styles.pricingInput}
                value={pricing.perKmRate}
                onChangeText={(value) => updatePricing("perKmRate", value)}
                keyboardType="numeric"
                placeholder="25"
              />
            </View>
            <View style={styles.pricingItem}>
              <Text style={styles.pricingLabel}>Minimum Fare (KSh)</Text>
              <TextInput
                style={styles.pricingInput}
                value={pricing.minimumFare}
                onChangeText={(value) => updatePricing("minimumFare", value)}
                keyboardType="numeric"
                placeholder="100"
              />
            </View>
            <View style={styles.pricingItem}>
              <Text style={styles.pricingLabel}>Commission Rate (%)</Text>
              <TextInput
                style={styles.pricingInput}
                value={pricing.commissionRate}
                onChangeText={(value) => updatePricing("commissionRate", value)}
                keyboardType="numeric"
                placeholder="15"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          <View style={styles.paymentsList}>
            {paymentMethods.map((method) => (
              <View key={method.id} style={styles.paymentItem}>
                <View style={styles.paymentIcon}>
                  <CreditCard size={20} color={Colors.light.primary} />
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentName}>{method.name}</Text>
                  <Text style={styles.paymentDescription}>{method.description}</Text>
                </View>
                <Switch
                  value={method.enabled}
                  onValueChange={(value) => {
                    // TODO: Update payment method status
                    console.log(`Toggle ${method.id}:`, value);
                  }}
                  trackColor={{ false: Colors.light.border, true: Colors.light.success + "40" }}
                  thumbColor={method.enabled ? Colors.light.success : Colors.light.textMuted}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Configuration</Text>
          <View style={styles.configList}>
            <TouchableOpacity style={styles.configItem}>
              <View style={styles.configIcon}>
                <MapPin size={20} color={Colors.light.primary} />
              </View>
              <View style={styles.configInfo}>
                <Text style={styles.configName}>Service Areas</Text>
                <Text style={styles.configDescription}>Manage delivery zones</Text>
              </View>
              <ChevronRight size={20} color={Colors.light.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.configItem}>
              <View style={styles.configIcon}>
                <Bell size={20} color={Colors.light.primary} />
              </View>
              <View style={styles.configInfo}>
                <Text style={styles.configName}>Notification Templates</Text>
                <Text style={styles.configDescription}>Customize messages</Text>
              </View>
              <ChevronRight size={20} color={Colors.light.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.configItem}>
              <View style={styles.configIcon}>
                <Shield size={20} color={Colors.light.primary} />
              </View>
              <View style={styles.configInfo}>
                <Text style={styles.configName}>Security Settings</Text>
                <Text style={styles.configDescription}>API keys and permissions</Text>
              </View>
              <ChevronRight size={20} color={Colors.light.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 16,
  },
  settingsList: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingName: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  pricingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  pricingItem: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
  },
  pricingLabel: {
    fontSize: 12,
    color: Colors.light.textMuted,
    marginBottom: 8,
    fontWeight: "500",
  },
  pricingInput: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.light.text,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    paddingVertical: 4,
  },
  paymentsList: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  paymentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
    marginRight: 16,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.text,
    marginBottom: 2,
  },
  paymentDescription: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  configList: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  configItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  configIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  configInfo: {
    flex: 1,
  },
  configName: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.text,
    marginBottom: 2,
  },
  configDescription: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
  },
  saveButtonText: {
    color: Colors.light.background,
    fontSize: 16,
    fontWeight: "600",
  },
});