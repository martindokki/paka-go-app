import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import { router } from "expo-router";
import {
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Bell,
  HelpCircle,
  Settings,
  LogOut,
  ChevronRight,
  Star,
  Package,
  Shield,
  Receipt,
  FileText,
  Trash2,
  Eye,
} from "lucide-react-native";
import colors, { safeColors } from "@/constants/colors";
import { useAuthStore } from "@/stores/auth-store-simple";
import { SettingsSection, SettingsItem } from "@/components/settings/SettingsSection";
import { PrivacyPolicyModal } from "@/components/settings/PrivacyPolicyModal";
import { TermsOfServiceModal } from "@/components/settings/TermsOfServiceModal";
import { DeleteAccountModal } from "@/components/settings/DeleteAccountModal";
import { EditProfileModal } from "@/components/settings/EditProfileModal";
import { NotificationSettingsModal } from "@/components/settings/NotificationSettingsModal";
import { errorLogger } from "@/utils/error-logger";
import { showConfirm } from "@/utils/platform-utils";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  const userInfo = {
    name: user?.name || "User",
    email: user?.email || "user@example.com",
    phone: user?.phone || "+254700000000",
    totalOrders: 24,
    memberSince: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "Jan 2024",
    rating: 4.8,
    totalSpent: 8200,
  };

  const menuItems = [
    {
      id: "edit-profile",
      title: "Edit Profile",
      subtitle: "Update your personal information",
      icon: User,
      color: colors.primary,
      onPress: () => setShowEditProfileModal(true),
    },
    {
      id: "addresses",
      title: "Saved Addresses",
      subtitle: "Manage your delivery locations",
      icon: MapPin,
      color: colors.accent,
      onPress: () => console.log("Navigate to addresses"),
    },
    {
      id: "payment",
      title: "Payment Methods",
      subtitle: "Cards, M-Pesa, and more",
      icon: CreditCard,
      color: colors.accent,
      onPress: () => console.log("Navigate to payment methods"),
    },
    {
      id: "payment-history",
      title: "Payment History",
      subtitle: "View all your transactions",
      icon: Receipt,
      color: colors.mpesa,
      onPress: () => router.push("/payment/history"),
    },
    {
      id: "notifications",
      title: "Notifications",
      subtitle: "Manage your preferences",
      icon: Bell,
      color: colors.warning,
      onPress: () => setShowNotificationModal(true),
    },
    {
      id: "privacy",
      title: "Privacy & Security",
      subtitle: "Account security settings",
      icon: Shield,
      color: colors.info,
      onPress: () => console.log("Navigate to privacy"),
    },
    {
      id: "settings",
      title: "App Settings",
      subtitle: "Preferences and configuration",
      icon: Settings,
      color: colors.textMuted,
      onPress: () => console.log("Navigate to settings"),
    },
    {
      id: "help",
      title: "Help & Support",
      subtitle: "Get help or contact us",
      icon: HelpCircle,
      color: colors.primary,
      onPress: () => console.log("Navigate to help"),
    },
  ];

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
      "Are you sure you want to logout?",
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
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <User size={32} color={colors.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userInfo.name}</Text>
            <Text style={styles.userEmail}>{userInfo.email}</Text>
            <View style={styles.userStats}>
              <View style={styles.statItem}>
                <Package size={12} color={colors.textMuted} />
                <Text style={styles.statText}>{userInfo.totalOrders} orders</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Star size={12} color={colors.warning} fill={colors.warning} />
                <Text style={styles.statText}>{userInfo.rating} rating</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userInfo.totalOrders}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>KSh {(userInfo.totalSpent / 1000).toFixed(1)}K</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{userInfo.rating}</Text>
            <Text style={styles.statLabel}>Your Rating</Text>
          </View>
        </View>

        <View style={styles.contactInfo}>
          <View style={styles.contactItem}>
            <Mail size={16} color={colors.textMuted} />
            <Text style={styles.contactText}>{userInfo.email}</Text>
          </View>
          <View style={styles.contactItem}>
            <Phone size={16} color={colors.textMuted} />
            <Text style={styles.contactText}>{userInfo.phone}</Text>
          </View>
        </View>

        <SettingsSection title="Account Settings">
          {menuItems.map((item) => (
            <SettingsItem
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              icon={<item.icon size={20} color={item.color} />}
              onPress={item.onPress}
            />
          ))}
        </SettingsSection>

        <SettingsSection title="Privacy & Legal">
          <SettingsItem
            title="Privacy Policy"
            subtitle="How we handle your data"
            icon={<Shield size={20} color={colors.info} />}
            onPress={() => setShowPrivacyModal(true)}
          />
          <SettingsItem
            title="Terms of Service"
            subtitle="Terms and conditions"
            icon={<FileText size={20} color={colors.info} />}
            onPress={() => setShowTermsModal(true)}
          />
          <SettingsItem
            title="View Error Logs"
            subtitle="Debug information"
            icon={<Eye size={20} color={colors.textMuted} />}
            onPress={handleViewErrorLogs}
          />
        </SettingsSection>

        <SettingsSection title="Danger Zone">
          <SettingsItem
            title="Delete Account"
            subtitle="Permanently delete your account"
            icon={<Trash2 size={20} color={colors.error} />}
            onPress={() => setShowDeleteModal(true)}
            destructive
          />
        </SettingsSection>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>PAKA Go v1.0.0</Text>
          <Text style={styles.footerText}>Made with ❤️ in Kenya</Text>
          <Text style={styles.memberSince}>Member since {userInfo.memberSince}</Text>
        </View>
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
      
      <EditProfileModal
        visible={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
      />
      
      <NotificationSettingsModal
        visible={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: safeColors.background,
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
    color: safeColors.text,
  },
  profileCard: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: safeColors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  userStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
    marginHorizontal: 8,
  },
  statText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: safeColors.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: safeColors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
  },
  contactInfo: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    gap: 12,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  contactText: {
    fontSize: 14,
    color: safeColors.text,
    fontWeight: "500",
  },
  menuSection: {
    backgroundColor: colors.background,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: safeColors.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.error + "30",
    gap: 8,
    marginBottom: 32,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.error,
  },
  footer: {
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  memberSince: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "500",
    marginTop: 4,
  },
});