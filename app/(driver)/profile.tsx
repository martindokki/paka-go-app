import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Image,
  Platform,
} from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  User,
  Phone,
  Mail,
  Car,
  Star,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Shield,
  Camera,
  Image as ImageIcon,
  Award,
  TrendingUp,
  Package,
  Clock,
  Edit3,
  Zap,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";

export default function DriverProfileScreen() {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  const driverInfo = {
    name: "Peter Mwangi",
    email: "peter.mwangi@example.com",
    phone: "+254712345678",
    vehicleType: "Motorcycle",
    plateNumber: "KCA 123D",
    rating: 4.8,
    totalDeliveries: 1247,
    memberSince: "Mar 2023",
    completionRate: 96,
    onTimeRate: 94,
    earnings: 125680,
  };

  const achievements = [
    { id: 1, title: "Speed Demon", description: "100+ deliveries in a month", icon: "⚡", unlocked: true },
    { id: 2, title: "Customer Favorite", description: "4.8+ rating for 6 months", icon: "⭐", unlocked: true },
    { id: 3, title: "Reliable Rider", description: "95%+ on-time delivery", icon: "🎯", unlocked: true },
    { id: 4, title: "Marathon Runner", description: "1000+ total deliveries", icon: "🏃", unlocked: true },
    { id: 5, title: "Night Owl", description: "50+ night deliveries", icon: "🦉", unlocked: false },
    { id: 6, title: "Weekend Warrior", description: "100+ weekend deliveries", icon: "💪", unlocked: false },
  ];

  const menuItems = [
    {
      id: "vehicle",
      title: "Vehicle Information",
      subtitle: "Update your vehicle details",
      icon: Car,
      color: Colors.light.primary,
      onPress: () => console.log("Navigate to vehicle info"),
    },
    {
      id: "documents",
      title: "Documents & Verification",
      subtitle: "License, insurance, etc.",
      icon: Shield,
      color: Colors.light.accent,
      onPress: () => console.log("Navigate to documents"),
    },
    {
      id: "earnings",
      title: "Earnings & Payouts",
      subtitle: "View payment history",
      icon: TrendingUp,
      color: Colors.light.warning,
      onPress: () => router.push("/(driver)/earnings"),
    },
    {
      id: "settings",
      title: "App Settings",
      subtitle: "Notifications, preferences",
      icon: Settings,
      color: Colors.light.info,
      onPress: () => console.log("Navigate to settings"),
    },
    {
      id: "help",
      title: "Help & Support",
      subtitle: "Get help or contact us",
      icon: HelpCircle,
      color: Colors.light.success,
      onPress: () => console.log("Navigate to help"),
    },
  ];

  const handleImagePicker = () => {
    Alert.alert(
      "Update Profile Photo 📸",
      "Choose how you would like to update your profile photo",
      [
        {
          text: "Take Selfie 🤳",
          onPress: () => openCamera(),
        },
        {
          text: "Choose from Gallery 🖼️",
          onPress: () => openGallery(),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Camera permission is required to take photos");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
        Alert.alert("Success! 🎉", "Profile photo updated successfully!");
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("Error", "Failed to open camera. Please try again.");
    }
  };

  const openGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Gallery permission is required to select photos");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
        Alert.alert("Success! 🎉", "Profile photo updated successfully!");
      }
    } catch (error) {
      console.error("Gallery error:", error);
      Alert.alert("Error", "Failed to open gallery. Please try again.");
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout 👋",
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

  const renderStarRating = (rating: number) => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            color={star <= rating ? Colors.light.warning : Colors.light.border}
            fill={star <= rating ? Colors.light.warning : "transparent"}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <LinearGradient
          colors={[Colors.light.primary, Colors.light.primaryDark]}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Driver Profile 👨‍💼</Text>
          </View>

          <View style={styles.profileSection}>
            <TouchableOpacity style={styles.avatarContainer} onPress={handleImagePicker}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatar} />
              ) : (
                <LinearGradient
                  colors={[Colors.light.background, "#FFFFFF"]}
                  style={styles.avatar}
                >
                  <User size={40} color={Colors.light.primary} />
                </LinearGradient>
              )}
              <LinearGradient
                colors={[Colors.light.accent, Colors.light.accentDark]}
                style={styles.cameraButton}
              >
                <Camera size={16} color={Colors.light.background} />
              </LinearGradient>
            </TouchableOpacity>
            
            <View style={styles.userInfo}>
              <View style={styles.nameContainer}>
                <Text style={styles.userName}>{driverInfo.name}</Text>
                <TouchableOpacity style={styles.editButton}>
                  <Edit3 size={16} color={Colors.light.background} />
                </TouchableOpacity>
              </View>
              <Text style={styles.userEmail}>{driverInfo.email}</Text>
              <View style={styles.ratingContainer}>
                {renderStarRating(Math.floor(driverInfo.rating))}
                <Text style={styles.ratingText}>
                  {driverInfo.rating} • {driverInfo.totalDeliveries} deliveries
                </Text>
              </View>
              <Text style={styles.memberSince}>
                🚗 Driver since {driverInfo.memberSince}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={[Colors.light.success, "#10B981"]}
              style={styles.statGradient}
            >
              <Package size={24} color={Colors.light.background} />
              <Text style={styles.statNumber}>{driverInfo.totalDeliveries}</Text>
              <Text style={styles.statLabel}>Total Deliveries</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.statCard}>
            <LinearGradient
              colors={[Colors.light.warning, "#F59E0B"]}
              style={styles.statGradient}
            >
              <TrendingUp size={24} color={Colors.light.background} />
              <Text style={styles.statNumber}>KSh {(driverInfo.earnings / 1000).toFixed(0)}K</Text>
              <Text style={styles.statLabel}>Total Earnings</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.statCard}>
            <LinearGradient
              colors={[Colors.light.accent, Colors.light.accentDark]}
              style={styles.statGradient}
            >
              <Clock size={24} color={Colors.light.background} />
              <Text style={styles.statNumber}>{driverInfo.onTimeRate}%</Text>
              <Text style={styles.statLabel}>On-Time Rate</Text>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Achievements 🏆</Text>
          <View style={styles.achievementsGrid}>
            {achievements.map((achievement) => (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  !achievement.unlocked && styles.achievementCardLocked,
                ]}
              >
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <Text
                  style={[
                    styles.achievementTitle,
                    !achievement.unlocked && styles.achievementTitleLocked,
                  ]}
                >
                  {achievement.title}
                </Text>
                <Text
                  style={[
                    styles.achievementDescription,
                    !achievement.unlocked && styles.achievementDescriptionLocked,
                  ]}
                >
                  {achievement.description}
                </Text>
                {achievement.unlocked && (
                  <View style={styles.unlockedBadge}>
                    <Award size={12} color={Colors.light.warning} />
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.vehicleSection}>
          <Text style={styles.sectionTitle}>Vehicle Information 🏍️</Text>
          <View style={styles.vehicleCard}>
            <LinearGradient
              colors={[Colors.light.backgroundSecondary, Colors.light.borderLight]}
              style={styles.vehicleGradient}
            >
              <View style={styles.vehicleIcon}>
                <Car size={24} color={Colors.light.primary} />
              </View>
              <View style={styles.vehicleDetails}>
                <View style={styles.vehicleItem}>
                  <Text style={styles.vehicleLabel}>Vehicle Type</Text>
                  <Text style={styles.vehicleValue}>{driverInfo.vehicleType}</Text>
                </View>
                <View style={styles.vehicleItem}>
                  <Text style={styles.vehicleLabel}>Plate Number</Text>
                  <Text style={styles.vehicleValue}>{driverInfo.plateNumber}</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Quick Actions ⚡</Text>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <LinearGradient
                  colors={[item.color + "20", item.color + "10"]}
                  style={styles.menuIcon}
                >
                  <item.icon size={20} color={item.color} />
                </LinearGradient>
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
          <LinearGradient
            colors={[Colors.light.error, "#DC2626"]}
            style={styles.logoutGradient}
          >
            <LogOut size={20} color={Colors.light.background} />
            <Text style={styles.logoutText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>PAKA Go Driver v1.0.0</Text>
          <Text style={styles.footerText}>Made with ❤️ in Kenya 🇰🇪</Text>
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
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: Colors.light.background,
    letterSpacing: -1,
  },
  profileSection: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: Colors.light.background,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.light.background,
    shadowColor: Colors.light.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  userInfo: {
    alignItems: "center",
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  userName: {
    fontSize: 24,
    fontWeight: "900",
    color: Colors.light.background,
  },
  editButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  userEmail: {
    fontSize: 14,
    color: Colors.light.background + "CC",
    marginBottom: 12,
    fontWeight: "500",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  starContainer: {
    flexDirection: "row",
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    color: Colors.light.background + "CC",
    fontWeight: "600",
  },
  memberSince: {
    fontSize: 12,
    color: Colors.light.background + "CC",
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  statGradient: {
    alignItems: "center",
    paddingVertical: 20,
    borderRadius: 16,
    gap: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.light.background,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.background + "CC",
    textAlign: "center",
    fontWeight: "600",
  },
  achievementsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.light.text,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  achievementCard: {
    width: "47%",
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    position: "relative",
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  achievementCardLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: 4,
  },
  achievementTitleLocked: {
    color: Colors.light.textMuted,
  },
  achievementDescription: {
    fontSize: 12,
    color: Colors.light.textMuted,
    textAlign: "center",
    lineHeight: 16,
    fontWeight: "500",
  },
  achievementDescriptionLocked: {
    color: Colors.light.textMuted,
  },
  unlockedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.light.warning + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  vehicleSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  vehicleCard: {
    borderRadius: 16,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  vehicleGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
  },
  vehicleIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  vehicleDetails: {
    flex: 1,
    gap: 12,
  },
  vehicleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  vehicleLabel: {
    fontSize: 14,
    color: Colors.light.textMuted,
    fontWeight: "500",
  },
  vehicleValue: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.text,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: "500",
  },
  logoutButton: {
    marginHorizontal: 20,
    borderRadius: 16,
    marginBottom: 32,
    shadowColor: Colors.light.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.background,
  },
  footer: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: "500",
  },
});