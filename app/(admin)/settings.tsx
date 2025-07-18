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
  Alert,
  Platform,
} from "react-native";
import {
  CreditCard,
  MapPin,
  Bell,
  Shield,
  DollarSign,
  Settings as SettingsIcon,
  ChevronRight,
  FileText,
  Trash2,
  Eye,
  LogOut,
} from "lucide-react-native";
import colors from "@/constants/colors";
import { useAuthStore } from "@/stores/auth-store-simple";
import { SettingsSection, SettingsItem } from "@/components/settings/SettingsSection";
import { PrivacyPolicyModal } from "@/components/settings/PrivacyPolicyModal";
import { TermsOfServiceModal } from "@/components/settings/TermsOfServiceModal";
import { DeleteAccountModal } from "@/components/settings/DeleteAccountModal";
import { errorLogger } from "@/utils/error-logger";
import { showConfirm } from "@/utils/platform-utils";
import { router } from "expo-router";

export default function AdminSettingsScreen() {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { logout } = useAuthStore();
  
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

  const handleLogout = async () => {
    const performLogout = async () => {
      try {
        await logout();
        // Add a small delay to ensure state is cleared
        setTimeout(() => {
          router.replace("/auth");
        }, 100);
      } catch (error) {
        await errorLogger.error(error as Error, { action: 'logout' });
        Alert.alert("Error", "Failed to logout. Please try again.");
      }
    };

    showConfirm(
      "Logout",
      "Are you sure you want to logout from admin panel?",
      performLogout
    );
  };

  const handleViewErrorLogs = async () => {
    try {
      const logs = await errorLogger.getLogs();
      Alert.alert(
        "Error Logs",
        `Found ${logs.length} error logs. Check console for details.`,
        [
          {
            text: "Clear Logs",
            style: "destructive",
            onPress: async () => {
              await errorLogger.clearLogs();
              Alert.alert("Success", "Error logs cleared.");
            },
          },
          { text: "OK", style: "default" },
        ]
      );
      console.log("Error Logs:", logs);
    } catch (error) {
      Alert.alert("Error", "Failed to retrieve error logs.");
    }
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
                trackColor={{ false: colors.border, true: colors.primary + "40" }}
                thumbColor={settings.autoAssignOrders ? colors.primary : colors.textMuted}
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
                trackColor={{ false: colors.border, true: colors.primary + "40" }}
                thumbColor={settings.enableNotifications ? colors.primary : colors.textMuted}
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
                trackColor={{ false: colors.border, true: colors.primary + "40" }}
                thumbColor={settings.requireDriverVerification ? colors.primary : colors.textMuted}
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
                trackColor={{ false: colors.border, true: colors.primary + "40" }}
                thumbColor={settings.enableRealTimeTracking ? colors.primary : colors.textMuted}
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
                  <CreditCard size={20} color={colors.primary} />
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
                  trackColor={{ false: colors.border, true: colors.success + "40" }}
                  thumbColor={method.enabled ? colors.success : colors.textMuted}
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
                <MapPin size={20} color={colors.primary} />
              </View>
              <View style={styles.configInfo}>
                <Text style={styles.configName}>Service Areas</Text>
                <Text style={styles.configDescription}>Manage delivery zones</Text>
              </View>
              <ChevronRight size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.configItem}>
              <View style={styles.configIcon}>
                <Bell size={20} color={colors.primary} />
              </View>
              <View style={styles.configInfo}>
                <Text style={styles.configName}>Notification Templates</Text>
                <Text style={styles.configDescription}>Customize messages</Text>
              </View>
              <ChevronRight size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.configItem}>
              <View style={styles.configIcon}>
                <Shield size={20} color={colors.primary} />
              </View>
              <View style={styles.configInfo}>
                <Text style={styles.configName}>Security Settings</Text>
                <Text style={styles.configDescription}>API keys and permissions</Text>
              </View>
              <ChevronRight size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>

        <SettingsSection title="Privacy & Legal">
          <SettingsItem
            title="Privacy Policy"
            subtitle="How we handle user data"
            icon={<Shield size={20} color={colors.info} />}
            onPress={() => setShowPrivacyModal(true)}
          />
          <SettingsItem
            title="Terms of Service"
            subtitle="Platform terms and conditions"
            icon={<FileText size={20} color={colors.info} />}
            onPress={() => setShowTermsModal(true)}
          />
          <SettingsItem
            title="View Error Logs"
            subtitle="System debug information"
            icon={<Eye size={20} color={colors.textMuted} />}
            onPress={handleViewErrorLogs}
          />
        </SettingsSection>

        <SettingsSection title="Account Actions">
          <SettingsItem
            title="Logout"
            subtitle="Sign out of admin panel"
            icon={<LogOut size={20} color={colors.error} />}
            onPress={handleLogout}
            destructive
          />
          <SettingsItem
            title="Delete Account"
            subtitle="Permanently delete admin account"
            icon={<Trash2 size={20} color={colors.error} />}
            onPress={() => setShowDeleteModal(true)}
            destructive
          />
        </SettingsSection>
      </ScrollView>

      <PrivacyPolicyModal
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
      
      <TermsOfServiceModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
      
      <DeleteAccountModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.text,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
  settingsList: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: colors.textMuted,
  },
  pricingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  pricingItem: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
  },
  pricingLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8,
    fontWeight: "500",
  },
  pricingInput: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 4,
  },
  paymentsList: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  paymentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
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
    color: colors.text,
    marginBottom: 2,
  },
  paymentDescription: {
    fontSize: 12,
    color: colors.textMuted,
  },
  configList: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  configItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  configIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
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
    color: colors.text,
    marginBottom: 2,
  },
  configDescription: {
    fontSize: 12,
    color: colors.textMuted,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
  },
  saveButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: "600",
  },
});