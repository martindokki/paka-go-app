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
import colors from "@/constants/colors";
import { useAuthStore } from "@/stores/auth-store";

type UserType = 'customer' | 'driver' | 'admin';

interface LoginRequest {
  email: string;
  password: string;
  userType?: UserType;
}

interface RegisterRequest extends LoginRequest {
  name: string;
  phone: string;
}

const { width, height } = Dimensions.get("window");

type AuthMode = "login" | "register";

export default function AuthScreen() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [userType, setUserType] = useState<UserType>("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  // Use real auth store
  const { login, register, isLoading: authLoading, error: authError, clearError } = useAuthStore();

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }
    
    if (!formData.password.trim()) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    
    if (authMode === "register") {
      if (!formData.name.trim()) {
        errors.name = "Name is required";
      }
      
      if (!formData.phone.trim()) {
        errors.phone = "Phone number is required";
      } else if (!/^\+254[0-9]{9}$/.test(formData.phone)) {
        errors.phone = "Please enter a valid Kenyan phone number (+254xxxxxxxxx)";
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createTestUser = async () => {
    if (authMode !== "login") return;
    
    const testEmail = userType === "customer" ? "customer@test.com" : 
                     userType === "driver" ? "driver@test.com" : "admin@test.com";
    const testPassword = "password123";
    const testName = userType === "customer" ? "Test Client" : 
                    userType === "driver" ? "Test Driver" : "Test Admin";
    const testPhone = userType === "customer" ? "+254700000001" : 
                     userType === "driver" ? "+254700000002" : "+254700000003";
    
    try {
      const success = await register({
        name: testName,
        email: testEmail,
        phone: testPhone,
        password: testPassword,
        userType: userType as UserType,
      });
      
      if (success) {
        Alert.alert(
          "Test User Created", 
          `Test ${userType} user created successfully! You can now login with:\n\nEmail: ${testEmail}\nPassword: ${testPassword}`,
          [
            {
              text: "Login Now",
              onPress: () => {
                setFormData({
                  ...formData,
                  email: testEmail,
                  password: testPassword,
                });
              }
            },
            { text: "OK" }
          ]
        );
      }
    } catch (error) {
      console.error('Test user creation error:', error);
    }
  };

  const handleAuth = async () => {
    // Clear previous errors
    clearError();
    setValidationErrors({});
    
    // Validate form
    if (!validateForm()) {
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
    
    try {
      let success = false;
      
      if (authMode === "login") {
        success = await login({
          email: formData.email.trim(),
          password: formData.password,
          userType: userType as UserType,
        });
        
        // If login fails and this looks like a test account, offer to create it
        if (!success && authError && authError.includes('Invalid login credentials')) {
          const isTestEmail = formData.email.includes('@test.com') && formData.password === 'password123';
          if (isTestEmail) {
            Alert.alert(
              "Test User Not Found",
              "It looks like you're trying to use a test account that doesn't exist yet. Would you like to create it?",
              [
                {
                  text: "Create Test User",
                  onPress: createTestUser
                },
                { text: "Cancel" }
              ]
            );
            return;
          }
        }
      } else {
        success = await register({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
          userType: userType as UserType,
        });
      }
      
      if (success) {
        console.log(`${authMode} successful`, { userType, email: formData.email });
        
        // Navigate based on user type
        switch (userType) {
          case "customer":
            router.replace("/(client)");
            break;
          case "driver":
            router.replace("/(driver)");
            break;
          case "admin":
            router.replace("/(admin)");
            break;
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert(
        "Authentication Error", 
        "Something went wrong. Please try again."
      );
    }
  };

  const UserTypeSelector = () => {
    return (
      <View style={styles.userTypeContainer}>
        <Text style={styles.userTypeTitle}>Choose Your Adventure 🚀</Text>
        <View style={styles.userTypeButtons}>
        <TouchableOpacity
          style={[
            styles.userTypeButton,
            userType === "customer" && styles.userTypeButtonActive,
          ]}
          onPress={() => setUserType("customer")}
        >
          <LinearGradient
            colors={userType === "customer" ? [colors.primary, colors.primaryDark] : ["transparent", "transparent"]}
            style={styles.userTypeGradient}
          >
            <View style={styles.userTypeIconContainer}>
              <View style={[
                styles.userTypeIcon,
                userType === "customer" && styles.userTypeIconActive,
              ]}>
                <Send
                  size={32}
                  color={userType === "customer" ? colors.background : colors.primary}
                />
              </View>
              <View style={styles.sparkleContainer}>
                <Sparkles size={16} color={userType === "customer" ? colors.background : colors.primary} />
              </View>
            </View>
            <Text
              style={[
                styles.userTypeText,
                userType === "customer" && styles.userTypeTextActive,
              ]}
            >
              Client
            </Text>
            <Text style={[
              styles.userTypeSubtext,
              userType === "customer" && styles.userTypeSubtextActive,
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
            colors={userType === "driver" ? [colors.primary, colors.primaryDark] : ["transparent", "transparent"]}
            style={styles.userTypeGradient}
          >
            <View style={styles.userTypeIconContainer}>
              <View style={[
                styles.userTypeIcon,
                userType === "driver" && styles.userTypeIconActive,
              ]}>
                <Truck
                  size={32}
                  color={userType === "driver" ? colors.background : colors.primary}
                />
              </View>
              <View style={styles.sparkleContainer}>
                <Star size={16} color={userType === "driver" ? colors.background : colors.warning} />
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
              colors={userType === "admin" ? [colors.accent, colors.accentDark] : ["transparent", "transparent"]}
              style={styles.userTypeGradient}
            >
              <View style={styles.userTypeIconContainer}>
                <View style={[
                  styles.userTypeIcon,
                  userType === "admin" && styles.userTypeIconActive,
                ]}>
                  <Shield
                    size={32}
                    color={userType === "admin" ? colors.background : colors.accent}
                  />
                </View>
                <View style={styles.sparkleContainer}>
                  <UserCheck size={16} color={userType === "admin" ? colors.background : colors.accent} />
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
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundGradient}>
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
                <View style={styles.logoIcon}>
                  <Zap size={48} color={colors.primary} />
                </View>
                <View style={styles.logoTextContainer}>
                  <Text style={styles.logo}>PAKA HOME</Text>
                  <View style={styles.taglineContainer}>
                    <Sparkles size={16} color={colors.background} />
                    <Text style={styles.tagline}>Parcel Delivery Service</Text>
                    <Sparkles size={16} color={colors.background} />
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
                    <Package size={16} color={colors.background} />
                    <Text style={styles.featureText}>Instant Booking</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Zap size={16} color={colors.background} />
                    <Text style={styles.featureText}>Real-time Tracking</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Shield size={16} color={colors.background} />
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
                  onPress={() => {
                    setAuthMode("login");
                    clearError();
                    setValidationErrors({});
                  }}
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
                  onPress={() => {
                    setAuthMode("register");
                    clearError();
                    setValidationErrors({});
                  }}
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
                      <User size={22} color={colors.primary} />
                    </View>
                    <TextInput
                      style={[
                        styles.input,
                        validationErrors.name && styles.inputError
                      ]}
                      placeholder="Full Name"
                      value={formData.name}
                      onChangeText={(text) => {
                        setFormData({ ...formData, name: text });
                        if (validationErrors.name) {
                          setValidationErrors(prev => ({ ...prev, name: '' }));
                        }
                      }}
                      placeholderTextColor={colors.textMuted}
                    />
                    {validationErrors.name && (
                      <Text style={styles.errorText}>{validationErrors.name}</Text>
                    )}
                  </View>
                )}

                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Mail size={22} color={colors.primary} />
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      validationErrors.email && styles.inputError
                    ]}
                    placeholder="Email Address"
                    value={formData.email}
                    onChangeText={(text) => {
                      setFormData({ ...formData, email: text });
                      if (validationErrors.email) {
                        setValidationErrors(prev => ({ ...prev, email: '' }));
                      }
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor={colors.textMuted}
                  />
                  {validationErrors.email && (
                    <Text style={styles.errorText}>{validationErrors.email}</Text>
                  )}
                </View>

                {authMode === "register" && (
                  <View style={styles.inputContainer}>
                    <View style={styles.inputIcon}>
                      <Phone size={22} color={colors.primary} />
                    </View>
                    <TextInput
                      style={[
                        styles.input,
                        validationErrors.phone && styles.inputError
                      ]}
                      placeholder="Phone Number (+254...)"
                      value={formData.phone}
                      onChangeText={(text) => {
                        setFormData({ ...formData, phone: text });
                        if (validationErrors.phone) {
                          setValidationErrors(prev => ({ ...prev, phone: '' }));
                        }
                      }}
                      keyboardType="phone-pad"
                      placeholderTextColor={colors.textMuted}
                    />
                    {validationErrors.phone && (
                      <Text style={styles.errorText}>{validationErrors.phone}</Text>
                    )}
                  </View>
                )}

                <View style={styles.inputContainer}>
                  <View style={styles.inputIcon}>
                    <Lock size={22} color={colors.primary} />
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      validationErrors.password && styles.inputError
                    ]}
                    placeholder="Password"
                    value={formData.password}
                    onChangeText={(text) => {
                      setFormData({ ...formData, password: text });
                      if (validationErrors.password) {
                        setValidationErrors(prev => ({ ...prev, password: '' }));
                      }
                    }}
                    secureTextEntry={!showPassword}
                    placeholderTextColor={colors.textMuted}
                  />
                  {validationErrors.password && (
                    <Text style={styles.errorText}>{validationErrors.password}</Text>
                  )}
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? (
                      <EyeOff size={22} color={colors.textMuted} />
                    ) : (
                      <Eye size={22} color={colors.textMuted} />
                    )}
                  </TouchableOpacity>
                </View>

                {authMode === "login" && (
                  <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>Forgot Password? 🤔</Text>
                  </TouchableOpacity>
                )}

                {authError && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{authError}</Text>
                    {(authError.includes('already exists') || authError.includes('already registered')) && (
                      <View>
                        <Text style={styles.errorHelpText}>
                          💡 {authError.includes('already registered') 
                            ? 'This email is registered with a different account type. Try switching the account type or use a different email.'
                            : 'If you already have an account, try signing in instead. Otherwise, use a different email address.'}
                        </Text>
                        <View style={styles.errorActions}>
                          <TouchableOpacity 
                            style={styles.switchModeButton}
                            onPress={() => {
                              setAuthMode('login');
                              clearError();
                            }}
                          >
                            <Text style={styles.switchModeText}>Switch to Sign In →</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.clearEmailButton}
                            onPress={() => {
                              setFormData(prev => ({ ...prev, email: '' }));
                              clearError();
                            }}
                          >
                            <Text style={styles.clearEmailText}>Try Different Email</Text>
                          </TouchableOpacity>
                          {authError.includes('already registered as a') && (
                            <TouchableOpacity 
                              style={styles.userTypeButton}
                              onPress={() => {
                                // Extract the user type from the error message
                                const match = authError.match(/already registered as a (\w+)/);
                                if (match && match[1]) {
                                  setUserType(match[1] as UserType);
                                  clearError();
                                }
                              }}
                            >
                              <Text style={styles.userTypeText}>Switch Account Type</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    )}
                  </View>
                )}

                <TouchableOpacity 
                  style={[styles.authButton, authLoading && styles.authButtonLoading]} 
                  onPress={handleAuth}
                  disabled={authLoading}
                >
                  <LinearGradient
                    colors={[colors.background, "#FFFFFF"]}
                    style={styles.authButtonGradient}
                  >
                    <View style={styles.authButtonContent}>
                      {authLoading ? (
                        <Text style={styles.authButtonText}>
                          {authMode === "login" ? "Signing In... ✨" : "Creating Account... 🎉"}
                        </Text>
                      ) : (
                        <>
                          <Text style={styles.authButtonText}>
                            {authMode === "login" ? "Let's Go! 🚀" : "Join PAKA HOME! 🎉"}
                          </Text>
                          <ArrowRight size={20} color={colors.primary} />
                        </>
                      )}
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                {authMode === "register" && (
                  <View style={styles.termsContainer}>
                    <Text style={styles.termsText}>
                      By joining PAKA HOME, you agree to our <Text style={styles.termsLink}>Terms of Service</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Made with ❤️ in Kenya 🇰🇪</Text>
              <Text style={styles.footerSubtext}>Connecting communities, one delivery at a time</Text>
              
              {__DEV__ && (
                <View style={styles.testAccountsContainer}>
                  <Text style={styles.testAccountsTitle}>🧪 Test Accounts (Dev Only)</Text>
                  <Text style={styles.testAccount}>⚠️ Test users need to be created first!</Text>
                  <TouchableOpacity 
                    style={styles.debugButton}
                    onPress={() => router.push('/create-test-users-auth')}
                  >
                    <Text style={styles.debugButtonText}>🔧 Create Test Users</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.debugButton}
                    onPress={() => router.push('/clear-all-data')}
                  >
                    <Text style={styles.debugButtonText}>🗑️ Clear All Data</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.debugButton}
                    onPress={() => {
                      const testEmail = userType === "customer" ? "customer@test.com" : 
                                       userType === "driver" ? "driver@test.com" : "admin@test.com";
                      setFormData({
                        ...formData,
                        email: testEmail,
                        password: "password123",
                      });
                    }}
                  >
                    <Text style={styles.debugButtonText}>📝 Fill Test Credentials</Text>
                  </TouchableOpacity>
                  <View style={styles.testAccounts}>
                    <Text style={styles.testAccount}>Customer: customer@test.com / password123</Text>
                    <Text style={styles.testAccount}>Driver: driver@test.com / password123</Text>
                    <Text style={styles.testAccount}>Admin: admin@test.com / password123</Text>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
    backgroundColor: colors.primary,
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
    backgroundColor: colors.background,
    shadowColor: colors.background,
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
    color: colors.background,
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
    color: colors.background,
    letterSpacing: 0.5,
  },
  heroSection: {
    alignItems: "center",
    maxWidth: width * 0.9,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.background,
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.background + "E6",
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
    color: colors.background,
    fontWeight: "600",
  },
  formContainer: {
    backgroundColor: colors.background,
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
    backgroundColor: colors.backgroundSecondary,
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
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  authModeText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textMuted,
  },
  authModeTextActive: {
    color: colors.background,
  },
  userTypeContainer: {
    marginBottom: 24,
  },
  userTypeTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
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
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  userTypeButtonActive: {
    borderColor: colors.primary,
    shadowColor: colors.primary,
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
    backgroundColor: colors.primaryLight,
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
    backgroundColor: colors.warning,
    justifyContent: "center",
    alignItems: "center",
  },
  userTypeText: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 8,
  },
  userTypeTextActive: {
    color: colors.background,
  },
  userTypeSubtext: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "500",
  },
  userTypeSubtextActive: {
    color: colors.background + "E6",
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.borderLight,
    gap: 16,
  },
  inputIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
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
    color: colors.primary,
    fontWeight: "600",
  },
  authButton: {
    borderRadius: 20,
    marginTop: 8,
    shadowColor: colors.primary,
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
    color: colors.primary,
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
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    fontSize: 14,
    color: colors.background,
    fontWeight: "600",
  },
  footerSubtext: {
    fontSize: 12,
    color: colors.background + "CC",
    textAlign: "center",
    fontWeight: "500",
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  errorContainer: {
    backgroundColor: colors.error + "20",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  errorHelpText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "500",
    marginTop: 8,
    lineHeight: 16,
    textAlign: "center",
  },
  errorActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    justifyContent: "center",
  },
  switchModeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.primary + "20",
    borderRadius: 12,
  },
  switchModeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  clearEmailButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.warning + "20",
    borderRadius: 12,
  },
  clearEmailText: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  testAccountsContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  testAccountsTitle: {
    fontSize: 12,
    color: colors.background,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  testAccounts: {
    gap: 4,
  },
  testAccount: {
    fontSize: 10,
    color: colors.background + "CC",
    fontWeight: "500",
    textAlign: "center",
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  debugButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  debugButtonText: {
    fontSize: 12,
    color: colors.background,
    fontWeight: "600",
    textAlign: "center",
  },
});