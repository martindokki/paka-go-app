import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { 
  User, 
  Phone, 
  Mail, 
  Lock, 
  Truck, 
  UserCheck, 
  Eye, 
  EyeOff, 
  Zap, 
  Send,
  Package,
  Star,
  Shield,
  Sparkles,
  ArrowRight,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { useAuthStore, UserType } from "@/stores/auth-store";

const { width, height } = Dimensions.get("window");

type AuthMode = "login" | "register";

export default function AuthScreen() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [userType, setUserType] = useState<UserType>("client");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const { login } = useAuthStore();

  const handleAuth = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert("Missing Information", "Please fill in email and password");
      return;
    }

    if (authMode === "register" && (!formData.name || !formData.phone)) {
      Alert.alert("Missing Information", "Please fill in all required fields");
      return;
    }

    // Admin access only on web
    if (userType === "admin" && Platform.OS !== "web") {
      Alert.alert(
        "Access Restricted", 
        "Admin dashboard is only available on web. Please use a web browser to access admin features."
      );
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      // Login user with proper ID for sample data
      const userId = userType === "client" ? "client-1" : userType === "driver" ? "driver-1" : "admin-1";
      
      login({
        id: userId,
        name: formData.name || "User",
        email: formData.email,
        phone: formData.phone || "+254700000000",
        userType,
      });

      console.log("Auth successful:", { authMode, userType, formData });
      
      // Navigate based on user type
      switch (userType) {
        case "client":
          router.replace("/(client)");
          break;
        case "driver":
          router.replace("/(driver)");
          break;
        case "admin":
          router.replace("/(admin)");
          break;
      }
    } catch (error) {
      Alert.alert("Authentication Error", "Please try again");
    } finally {
      setIsLoading(false);
    }
  };

  const UserTypeSelector = () => (
    <View style={styles.userTypeContainer}>
      <Text style={styles.userTypeTitle}>Choose Your Adventure 🚀</Text>
      <View style={styles.userTypeButtons}>
        <TouchableOpacity
          style={[
            styles.userTypeButton,
            userType === "client" && styles.userTypeButtonActive,
          ]}
          onPress={() => setUserType("client")}
        >
          <LinearGradient
            colors={userType === "client" ? [Colors.light.primary, Colors.light.primaryDark] : ["transparent", "transparent"]}
            style={styles.userTypeGradient}
          >
            <View style={styles.userTypeIconContainer}>
              <View style={[
                styles.userTypeIcon,
                userType === "client" && styles.userTypeIconActive,
              ]}>
                <Send
                  size={32}
                  color={userType === "client" ? Colors.light.background : Colors.light.primary}
                />
              </View>
              <View style={styles.sparkleContainer}>
                <Sparkles size={16} color={userType === "client" ? Colors.light.background : Colors.light.primary} />
              </View>
            </View>
            <Text
              style={[
                styles.userTypeText,
                userType === "client" && styles.userTypeTextActive,
              ]}
            >
              Client
            </Text>
            <Text style={[
              styles.userTypeSubtext,
              userType === "client" && styles.userTypeSubtextActive,
            ]}>
              Send packages anywhere, anytime! 📦✨
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.userTypeButton,
            userType === "driver" && styles.userTypeButtonActive,
          ]}
          onPress={() => setUserType("driver")}
        >
          <LinearGradient
            colors={userType === "driver" ? [Colors.light.primary, Colors.light.primaryDark] : ["transparent", "transparent"]}
            style={styles.userTypeGradient}
          >
            <View style={styles.userTypeIconContainer}>
              <View style={[
                styles.userTypeIcon,
                userType === "driver" && styles.userTypeIconActive,
              ]}>
                <Truck
                  size={32}
                  color={userType === "driver" ? Colors.light.background : Colors.light.primary}
                />
              </View>
              <View style={styles.sparkleContainer}>
                <Star size={16} color={userType === "driver" ? Colors.light.background : Colors.light.warning} />
              </View>
            </View>
            <Text
              style={[
                styles.userTypeText,
                userType === "driver" && styles.userTypeTextActive,
              ]}
            >
              Driver
            </Text>
            <Text style={[
              styles.userTypeSubtext,
              userType === "driver" && styles.userTypeSubtextActive,
            ]}>
              Earn money while helping others! 💰🚗
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {Platform.OS === 'web' && (
          <TouchableOpacity
            style={[
              styles.userTypeButton,
              userType === "admin" && styles.userTypeButtonActive,
            ]}
            onPress={() => setUserType("admin")}
          >
            <LinearGradient
              colors={userType === "admin" ? [Colors.light.accent, Colors.light.accentDark] : ["transparent", "transparent"]}
              style={styles.userTypeGradient}
            >
              <View style={styles.userTypeIconContainer}>
                <View style={[
                  styles.userTypeIcon,
                  userType === "admin" && styles.userTypeIconActive,
                ]}>
                  <Shield
                    size={32}
                    color={userType === "admin" ? Colors.light.background : Colors.light.accent}
                  />
                </View>
                <View style={styles.sparkleContainer}>
                  <UserCheck size={16} color={userType === "admin" ? Colors.light.background : Colors.light.accent} />
                </View>
              </View>
              <Text
                style={[
                  styles.userTypeText,
                  userType === "admin" && styles.userTypeTextActive,
                ]}
              >
                Admin
              </Text>
              <Text style={[
                styles.userTypeSubtext,
                userType === "admin" && styles.userTypeSubtextActive,
              ]}>
                Manage the magic behind the scenes! ⚡🎯
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.light.primary, Colors.light.primaryDark, "#E55A2B"]}
        style={styles.backgroundGradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={[Colors.light.background, "#FFFFFF"]}
                  style={styles.logoIcon}
                >
                  <Zap size={48} color={Colors.light.primary} />
                </LinearGradient>
                <View style={styles.logoTextContainer}>
                  <Text style={styles.logo}>PAKA Go</Text>
                  <View style={styles.taglineContainer}>
                    <Sparkles size={16} color={Colors.light.background} />
                    <Text style={styles.tagline}>Lightning Fast Delivery</Text>
                    <Sparkles size={16} color={Colors.light.background} />
                  </View>
                </View>
              </View>
              
              <View style={styles.heroSection}>
                <Text style={styles.heroTitle}>
                  {authMode === "login" ? "Welcome Back! 👋" : "Join the Revolution! 🚀"}
                </Text>
                <Text style={styles.heroSubtitle}>
                  {authMode === "login" 
                    ? "Ready to send or deliver packages across Kenya?" 
                    : "Connect with trusted drivers for instant package delivery"}
                </Text>
                
                <View style={styles.featuresContainer}>
                  <View style={styles.featureItem}>
                    <Package size={16} color={Colors.light.background} />
                    <Text style={styles.featureText}>Instant Booking</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Zap size={16} color={Colors.light.background} />
                    <Text style={styles.featureText}>Real-time Tracking</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Shield size={16} color={Colors.light.background} />
                    <Text style={styles.featureText}>Secure Payments</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.authModeContainer}>
                <TouchableOpacity
                  style={[
                    styles.authModeButton,
                    authMode === "login" && styles.authModeButtonActive,
                  ]}
                  onPress={() => setAuthMode("login")}
                >
                  <Text
                    style={[
                      styles.authModeText,
                      authMode === "login" && styles.authModeTextActive,
                    ]}
                  >
                    Sign In
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.authModeButton,
                    authMode === "register" && styles.authModeButtonActive,
                  ]}
                  onPress={() => setAuthMode("register")}
                >
                  <Text
                    style={[
                      styles.authModeText,
                      authMode === "register" && styles.authModeTextActive,
                    ]}
                  >
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>

              <UserTypeSelector />

              <View style={styles.form}>
                {authMode === "register" && (
                  <View style={styles.inputContainer}>
                    <View style={styles.inputIcon}>
                      <User size={22} color={Colors.light.primary} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Full Name"
                      value={formData.name}
                      onChangeText={(text) => setFormData({ ...formData, name: text })}
                      placeholderTextColor={Colors.light.textMuted}
                    />
                  </View>
                )}

                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Mail size={22} color={Colors.light.primary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor={Colors.light.textMuted}
                  />
                </View>

                {authMode === "register" && (
                  <View style={styles.inputContainer}>
                    <View style={styles.inputIcon}>
                      <Phone size={22} color={Colors.light.primary} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Phone Number (+254...)"
                      value={formData.phone}
                      onChangeText={(text) => setFormData({ ...formData, phone: text })}
                      keyboardType="phone-pad"
                      placeholderTextColor={Colors.light.textMuted}
                    />
                  </View>
                )}

                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Lock size={22} color={Colors.light.primary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={formData.password}
                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                    secureTextEntry={!showPassword}
                    placeholderTextColor={Colors.light.textMuted}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? (
                      <EyeOff size={22} color={Colors.light.textMuted} />
                    ) : (
                      <Eye size={22} color={Colors.light.textMuted} />
                    )}
                  </TouchableOpacity>
                </View>

                {authMode === "login" && (
                  <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>Forgot Password? 🤔</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity 
                  style={[styles.authButton, isLoading && styles.authButtonLoading]} 
                  onPress={handleAuth}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={[Colors.light.background, "#FFFFFF"]}
                    style={styles.authButtonGradient}
                  >
                    <View style={styles.authButtonContent}>
                      {isLoading ? (
                        <Text style={styles.authButtonText}>Creating Magic... ✨</Text>
                      ) : (
                        <>
                          <Text style={styles.authButtonText}>
                            {authMode === "login" ? "Let's Go! 🚀" : "Join PAKA Go! 🎉"}
                          </Text>
                          <ArrowRight size={20} color={Colors.light.primary} />
                        </>
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                {authMode === "register" && (
                  <View style={styles.termsContainer}>
                    <Text style={styles.termsText}>
                      By joining PAKA Go, you agree to our{" "}
                      <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                      <Text style={styles.termsLink}>Privacy Policy</Text>
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Made with ❤️ in Kenya 🇰🇪</Text>
              <Text style={styles.footerSubtext}>Connecting communities, one delivery at a time</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
    minHeight: height - 100,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: Colors.light.background,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoTextContainer: {
    alignItems: "center",
  },
  logo: {
    fontSize: 42,
    fontWeight: "900",
    color: Colors.light.background,
    letterSpacing: -2,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  taglineContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  tagline: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.background,
    letterSpacing: 0.5,
  },
  heroSection: {
    alignItems: "center",
    maxWidth: width * 0.9,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: Colors.light.background,
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.light.background + "E6",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
    fontWeight: "500",
  },
  featuresContainer: {
    flexDirection: "row",
    gap: 20,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  featureText: {
    fontSize: 12,
    color: Colors.light.background,
    fontWeight: "600",
  },
  formContainer: {
    backgroundColor: Colors.light.background,
    borderRadius: 32,
    padding: 24,
    marginBottom: 24,
    shadowColor: "rgba(0, 0, 0, 0.3)",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 16,
  },
  authModeContainer: {
    flexDirection: "row",
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 20,
    padding: 6,
    marginBottom: 24,
  },
  authModeButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 16,
  },
  authModeButtonActive: {
    backgroundColor: Colors.light.primary,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  authModeText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.textMuted,
  },
  authModeTextActive: {
    color: Colors.light.background,
  },
  userTypeContainer: {
    marginBottom: 24,
  },
  userTypeTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.light.text,
    marginBottom: 16,
    textAlign: "center",
  },
  userTypeButtons: {
    gap: 12,
  },
  userTypeButton: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.light.border,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  userTypeButtonActive: {
    borderColor: Colors.light.primary,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.2,
  },
  userTypeGradient: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  userTypeIconContainer: {
    position: "relative",
    marginBottom: 12,
  },
  userTypeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  userTypeIconActive: {
    backgroundColor: "transparent",
  },
  sparkleContainer: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.light.warning,
    justifyContent: "center",
    alignItems: "center",
  },
  userTypeText: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.light.text,
    marginBottom: 8,
  },
  userTypeTextActive: {
    color: Colors.light.background,
  },
  userTypeSubtext: {
    fontSize: 14,
    color: Colors.light.textMuted,
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "500",
  },
  userTypeSubtextActive: {
    color: Colors.light.background + "E6",
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.light.borderLight,
    gap: 16,
  },
  inputIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: "500",
  },
  eyeButton: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: -8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: "600",
  },
  authButton: {
    borderRadius: 20,
    marginTop: 8,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  authButtonLoading: {
    opacity: 0.7,
  },
  authButtonGradient: {
    paddingVertical: 20,
    alignItems: "center",
    borderRadius: 20,
  },
  authButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  authButtonText: {
    color: Colors.light.primary,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  termsContainer: {
    marginTop: 16,
    paddingHorizontal: 8,
  },
  termsText: {
    fontSize: 12,
    color: Colors.light.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.light.primary,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 14,
    color: Colors.light.background,
    fontWeight: "600",
  },
  footerSubtext: {
    fontSize: 12,
    color: Colors.light.background + "CC",
    textAlign: "center",
    fontWeight: "500",
  },
});