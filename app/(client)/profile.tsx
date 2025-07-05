import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Dimensions,
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
} from "lucide-react-native";
import Colors from "@/constants/colors";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const userInfo = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+254712345678",
    totalOrders: 24,
    memberSince: "Jan 2024",
    rating: 4.8,
    totalSpent: 8200,
  };

  const menuItems = [
    {
      id: "addresses",
      title: "Saved Addresses",
      subtitle: "Manage your delivery locations",
      icon: MapPin,
      color: Colors.light.primary,
      onPress: () => console.log("Navigate to addresses"),
    },
    {
      id: "payment",
      title: "Payment Methods",
      subtitle: "Cards, M-Pesa, and more",
      icon: CreditCard,
      color: Colors.light.accent,
      onPress: () => router.push("/payment"),
    },
    {
      id: "notifications",
      title: "Notifications",
      subtitle: "Manage your preferences",
      icon: Bell,
      color: Colors.light.warning,
      onPress: () => console.log("Navigate to notifications"),
    },
    {
      id: "privacy",
      title: "Privacy & Security",
      subtitle: "Account security settings",
      icon: Shield,
      color: Colors.light.info,
      onPress: () => console.log("Navigate to privacy"),
    },
    {
      id: "settings",
      title: "App Settings",
      subtitle: "Preferences and configuration",
      icon: Settings,
      color: Colors.light.textMuted,
      onPress: () => console.log("Navigate to settings"),
    },
    {
      id: "help",
      title: "Help & Support",
      subtitle: "Get help or contact us",
      icon: HelpCircle,
      color: Colors.light.primary,
      onPress: () => console.log("Navigate to help"),
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => router.replace("/auth"),
        },
      ]
    );
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
            <User size={32} color={Colors.light.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userInfo.name}</Text>
            <Text style={styles.userEmail}>{userInfo.email}</Text>
            <View style={styles.userStats}>
              <View style={styles.statItem}>
                <Package size={12} color={Colors.light.textMuted} />
                <Text style={styles.statText}>{userInfo.totalOrders} orders</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Star size={12} color={Colors.light.warning} fill={Colors.light.warning} />
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
            <Mail size={16} color={Colors.light.textMuted} />
            <Text style={styles.contactText}>{userInfo.email}</Text>
          </View>
          <View style={styles.contactItem}>
            <Phone size={16} color={Colors.light.textMuted} />
            <Text style={styles.contactText}>{userInfo.phone}</Text>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.menuItemLast,
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: item.color + "20" }]}>
                  <item.icon size={20} color={item.color} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <ChevronRight size={20} color={Colors.light.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={Colors.light.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>PAKA Go v1.0.0</Text>
          <Text style={styles.footerText}>Made with ❤️ in Kenya</Text>
          <Text style={styles.memberSince}>Member since {userInfo.memberSince}</Text>
        </View>
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
  profileCard: {
    flexDirection: "row",
    backgroundColor: Colors.light.background,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.light.primaryLight,
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
    color: Colors.light.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.light.textSecondary,
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
    backgroundColor: Colors.light.textMuted,
    marginHorizontal: 8,
  },
  statText: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textMuted,
    textAlign: "center",
  },
  contactInfo: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: Colors.light.shadow,
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
    color: Colors.light.text,
    fontWeight: "500",
  },
  menuSection: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: Colors.light.shadow,
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
    borderBottomColor: Colors.light.borderLight,
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
    color: Colors.light.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.error + "30",
    gap: 8,
    marginBottom: 32,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.error,
  },
  footer: {
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  memberSince: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: "500",
    marginTop: 4,
  },
});