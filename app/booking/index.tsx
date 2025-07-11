import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import { router } from "expo-router";
import { 
  MapPin, 
  Package, 
  DollarSign, 
  Clock, 
  ArrowRight, 
  Zap, 
  Send, 
  CreditCard,
  Smartphone,
  CheckCircle,
  User,
  Phone,
  Timer,
  Wallet,
  Shield,
  Info,
  Search,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";
import { useOrdersStore, PackageType, PaymentMethod, PaymentTerm } from "@/stores/orders-store";
import { useAuthStore } from "@/stores/auth-store";
import { MapViewComponent } from "@/components/MapView";
import { useMapStore } from "@/stores/map-store";
import { MapService, Coordinates } from "@/services/map-service";
import { LocationSearchModal } from "@/components/LocationSearchModal";
import { PriceBreakdownModal } from "@/components/PriceBreakdownModal";
import { PricingService, PriceCalculationOptions, PriceBreakdown } from "@/constants/pricing";

export default function BookingScreen() {
  const { user } = useAuthStore();
  const { createOrder } = useOrdersStore();
  const { userLocation, destination, routePoints, clearRoute } = useMapStore();
  
  const [bookingData, setBookingData] = useState({
    pickupLocation: "",
    dropoffLocation: "",
    pickupCoords: null as Coordinates | null,
    dropoffCoords: null as Coordinates | null,
    packageType: "documents" as PackageType,
    packageDescription: "",
    recipientName: "",
    recipientPhone: "",
    specialInstructions: "",
    paymentMethod: "mpesa" as PaymentMethod,
    paymentTerm: "pay_now" as PaymentTerm,
    isFragile: false,
    hasInsurance: false,
  });

  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [estimatedTime, setEstimatedTime] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [showPickupSearch, setShowPickupSearch] = useState(false);
  const [showDropoffSearch, setShowDropoffSearch] = useState(false);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);

  const packageTypes = [
    { id: "documents", label: "Documents", icon: "📄", isFragileDefault: false },
    { id: "small", label: "Small Package", icon: "📦", isFragileDefault: false },
    { id: "medium", label: "Medium Package", icon: "📫", isFragileDefault: false },
    { id: "electronics", label: "Electronics", icon: "📱", isFragileDefault: true },
    { id: "clothing", label: "Clothing", icon: "👕", isFragileDefault: false },
    { id: "food", label: "Food & Beverages", icon: "🍕", isFragileDefault: true },
  ];

  const paymentMethods = [
    {
      id: "mpesa" as PaymentMethod,
      name: "M-Pesa",
      description: "Lipa na M-Pesa - Fast & Secure",
      icon: Smartphone,
      featured: true,
      benefits: ["Instant payment", "No cash needed", "SMS confirmation"],
    },
    {
      id: "card" as PaymentMethod,
      name: "Debit/Credit Card",
      description: "Visa, Mastercard accepted",
      icon: CreditCard,
      featured: false,
      benefits: ["International cards", "Secure payment", "Instant processing"],
    },
    {
      id: "cash" as PaymentMethod,
      name: "Cash on Delivery",
      description: "Pay when package arrives",
      icon: DollarSign,
      featured: false,
      benefits: ["No upfront payment", "Pay on receipt", "Exact change preferred"],
    },
  ];

  const paymentTerms = [
    {
      id: "pay_now" as PaymentTerm,
      name: "Pay Now",
      description: "Secure instant payment",
      icon: Zap,
      recommended: true,
      availableFor: ["mpesa", "card"] as PaymentMethod[],
    },
    {
      id: "pay_on_delivery" as PaymentTerm,
      name: "Pay on Delivery",
      description: "Pay when package arrives",
      icon: Timer,
      recommended: false,
      availableFor: ["cash", "mpesa"] as PaymentMethod[],
    },
  ];

  const updateBookingData = (key: string, value: string | boolean) => {
    setBookingData(prev => {
      const newData = { ...prev, [key]: value };
      
      // Auto-adjust payment term based on payment method
      if (key === "paymentMethod") {
        if (value === "cash") {
          newData.paymentTerm = "pay_on_delivery";
        } else if (value === "card") {
          newData.paymentTerm = "pay_now";
        }
      }
      
      // Auto-set fragile for certain package types
      if (key === "packageType") {
        const selectedType = packageTypes.find(type => type.id === value);
        if (selectedType) {
          newData.isFragile = selectedType.isFragileDefault;
        }
      }
      
      return newData;
    });
    
    // Recalculate price when relevant fields change
    if (["packageType", "isFragile", "hasInsurance"].includes(key)) {
      calculatePrice();
    }
  };

  const calculatePrice = async () => {
    if (!bookingData.pickupCoords || !bookingData.dropoffCoords) {
      setPriceBreakdown(null);
      setEstimatedTime("25-35 mins");
      return;
    }

    setIsCalculatingPrice(true);
    try {
      const distance = MapService.calculateDistance(bookingData.pickupCoords, bookingData.dropoffCoords);
      
      const options: PriceCalculationOptions = {
        distance,
        isFragile: bookingData.isFragile,
        hasInsurance: bookingData.hasInsurance,
        isAfterHours: PricingService.isAfterHours(),
        isWeekend: PricingService.isWeekend(),
      };
      
      const breakdown = PricingService.calculatePrice(options);
      setPriceBreakdown(breakdown);
      
      // Estimate time based on distance (assuming 30 km/h average speed)
      const estimatedMinutes = Math.round((distance / 30) * 60) + 15; // +15 for pickup/dropoff
      setEstimatedTime(`${estimatedMinutes}-${estimatedMinutes + 10} mins`);
      
    } catch (error) {
      console.error('Price calculation error:', error);
      setPriceBreakdown(null);
      setEstimatedTime("25-35 mins");
    } finally {
      setIsCalculatingPrice(false);
    }
  };

  const handlePickupLocationSelect = (address: string, coordinates: Coordinates) => {
    setBookingData(prev => ({ 
      ...prev, 
      pickupLocation: address,
      pickupCoords: coordinates 
    }));
    calculatePrice();
  };

  const handleDropoffLocationSelect = (address: string, coordinates: Coordinates) => {
    setBookingData(prev => ({ 
      ...prev, 
      dropoffLocation: address,
      dropoffCoords: coordinates 
    }));
    calculatePrice();
  };

  const handleLocationSelect = async (location: Coordinates) => {
    try {
      const address = await MapService.reverseGeocode(location);
      if (address) {
        handleDropoffLocationSelect(address, location);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  const toggleMap = () => {
    setShowMap(!showMap);
  };

  const getAvailablePaymentTerms = () => {
    return paymentTerms.filter(term => 
      term.availableFor.includes(bookingData.paymentMethod)
    );
  };

  const handleBookDelivery = () => {
    if (!bookingData.pickupLocation || !bookingData.dropoffLocation) {
      Alert.alert("Missing Information", "Please fill in pickup and dropoff locations");
      return;
    }

    if (!bookingData.recipientName || !bookingData.recipientPhone) {
      Alert.alert("Missing Information", "Please fill in recipient details");
      return;
    }

    if (!user) {
      Alert.alert("Authentication Error", "Please log in to book a delivery");
      return;
    }

    try {
      // Create the order
      const orderId = createOrder({
        clientId: user.id,
        from: bookingData.pickupLocation,
        to: bookingData.dropoffLocation,
        packageType: bookingData.packageType,
        packageDescription: bookingData.packageDescription,
        recipientName: bookingData.recipientName,
        recipientPhone: bookingData.recipientPhone,
        specialInstructions: bookingData.specialInstructions,
        status: "pending",
        paymentMethod: bookingData.paymentMethod,
        paymentTerm: bookingData.paymentTerm,
        price: priceBreakdown?.total || 0,
        distance: bookingData.pickupCoords && bookingData.dropoffCoords 
          ? `${MapService.calculateDistance(bookingData.pickupCoords, bookingData.dropoffCoords).toFixed(1)} km`
          : "0 km",
        estimatedTime: estimatedTime,
      });

      console.log("Order created:", orderId, bookingData);
      
      // Navigate based on payment term
      if (bookingData.paymentTerm === "pay_now" && bookingData.paymentMethod !== "cash") {
        Alert.alert(
          "Booking Confirmed! 🎉",
          `Your delivery has been booked successfully. Order ID: ${orderId}. Proceed to payment.`,
          [
            {
              text: "Pay Now",
              onPress: () => {
                router.dismiss();
                router.push(`/payment?orderId=${orderId}`);
              },
            },
            {
              text: "View Order",
              onPress: () => {
                router.dismiss();
                router.push(`/tracking?orderId=${orderId}`);
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Booking Confirmed! 🎉",
          `Your delivery has been booked successfully. Order ID: ${orderId}. ${
            bookingData.paymentTerm === "pay_on_delivery" 
              ? "You will pay when the package is delivered." 
              : ""
          }`,
          [
            {
              text: "View Orders",
              onPress: () => {
                router.dismiss();
                router.push("/(client)/orders");
              },
            },
            {
              text: "Track Order",
              onPress: () => {
                router.dismiss();
                router.push(`/tracking?orderId=${orderId}`);
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert("Booking Error", "Failed to create order. Please try again.");
      console.error("Booking error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Book Delivery</Text>
          <Text style={styles.subtitle}>Send your package anywhere in Kenya</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📍 Pickup & Delivery</Text>
            <TouchableOpacity style={styles.mapToggle} onPress={toggleMap}>
              <MapPin size={16} color={Colors.light.primary} />
              <Text style={styles.mapToggleText}>{showMap ? 'Hide Map' : 'Show Map'}</Text>
            </TouchableOpacity>
          </View>
          
          {showMap && (
            <View style={styles.mapContainer}>
              <MapViewComponent
                onLocationSelect={handleLocationSelect}
                showSearch={true}
                showRoute={true}
                height={300}
              />
            </View>
          )}
          
          <View style={styles.locationContainer}>
            <TouchableOpacity 
              style={styles.locationInput}
              onPress={() => setShowPickupSearch(true)}
            >
              <View style={styles.locationIcon}>
                <MapPin size={20} color={Colors.light.primary} />
              </View>
              <View style={styles.locationTextContainer}>
                <Text style={[
                  styles.locationText,
                  !bookingData.pickupLocation && styles.locationPlaceholder
                ]}>
                  {bookingData.pickupLocation || "Where should we pick up?"}
                </Text>
              </View>
              <Search size={16} color={Colors.light.textSecondary} />
            </TouchableOpacity>
            
            <View style={styles.locationConnector}>
              <View style={styles.connectorLine} />
              <View style={styles.connectorDot}>
                <ArrowRight size={16} color={Colors.light.background} />
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.locationInput}
              onPress={() => setShowDropoffSearch(true)}
            >
              <View style={styles.locationIcon}>
                <MapPin size={20} color={Colors.light.accent} />
              </View>
              <View style={styles.locationTextContainer}>
                <Text style={[
                  styles.locationText,
                  !bookingData.dropoffLocation && styles.locationPlaceholder
                ]}>
                  {bookingData.dropoffLocation || "Where should we deliver?"}
                </Text>
              </View>
              <Search size={16} color={Colors.light.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Package Type</Text>
          <View style={styles.packageTypes}>
            {packageTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.packageTypeCard,
                  bookingData.packageType === type.id && styles.packageTypeCardActive,
                ]}
                onPress={() => updateBookingData("packageType", type.id)}
              >
                {bookingData.packageType === type.id && (
                  <LinearGradient
                    colors={[Colors.light.primary, Colors.light.primaryDark]}
                    style={styles.packageTypeGradient}
                  />
                )}
                <Text style={styles.packageTypeEmoji}>{type.icon}</Text>
                <Text
                  style={[
                    styles.packageTypeText,
                    bookingData.packageType === type.id && styles.packageTypeTextActive,
                  ]}
                >
                  {type.label}
                </Text>
                {bookingData.packageType === type.id && type.isFragileDefault && (
                  <View style={styles.fragileIndicator}>
                    <Shield size={12} color={Colors.light.background} />
                    <Text style={styles.fragileText}>Fragile</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Add-ons Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛡️ Add-ons & Protection</Text>
          
          <View style={styles.addOnContainer}>
            <View style={styles.addOnItem}>
              <View style={styles.addOnLeft}>
                <Shield size={20} color={Colors.light.accent} />
                <View style={styles.addOnInfo}>
                  <Text style={styles.addOnTitle}>Fragile Handling</Text>
                  <Text style={styles.addOnDescription}>+20% for delicate items</Text>
                </View>
              </View>
              <Switch
                value={bookingData.isFragile}
                onValueChange={(value) => updateBookingData("isFragile", value)}
                trackColor={{ false: Colors.light.borderLight, true: Colors.light.accent }}
                thumbColor={bookingData.isFragile ? Colors.light.background : Colors.light.textMuted}
              />
            </View>
            
            <View style={styles.addOnItem}>
              <View style={styles.addOnLeft}>
                <Shield size={20} color={Colors.light.primary} />
                <View style={styles.addOnInfo}>
                  <Text style={styles.addOnTitle}>Insurance Cover</Text>
                  <Text style={styles.addOnDescription}>+20% up to KSh 10,000</Text>
                </View>
              </View>
              <Switch
                value={bookingData.hasInsurance}
                onValueChange={(value) => updateBookingData("hasInsurance", value)}
                trackColor={{ false: Colors.light.borderLight, true: Colors.light.primary }}
                thumbColor={bookingData.hasInsurance ? Colors.light.background : Colors.light.textMuted}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Payment Method</Text>
          <View style={styles.paymentMethods}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethodCard,
                  bookingData.paymentMethod === method.id && styles.paymentMethodCardActive,
                  method.featured && styles.paymentMethodCardFeatured,
                ]}
                onPress={() => updateBookingData("paymentMethod", method.id)}
              >
                {method.featured && (
                  <View style={styles.featuredBadge}>
                    <Text style={styles.featuredText}>MOST POPULAR</Text>
                  </View>
                )}
                
                <View style={styles.paymentMethodLeft}>
                  <LinearGradient
                    colors={
                      method.id === "mpesa" 
                        ? [Colors.light.mpesa, "#00B85C"]
                        : bookingData.paymentMethod === method.id
                        ? [Colors.light.primary, Colors.light.primaryDark]
                        : [Colors.light.backgroundSecondary, Colors.light.backgroundSecondary]
                    }
                    style={styles.paymentMethodIcon}
                  >
                    <method.icon
                      size={20}
                      color={
                        method.id === "mpesa" || bookingData.paymentMethod === method.id
                          ? Colors.light.background
                          : Colors.light.textMuted
                      }
                    />
                  </LinearGradient>
                  <View style={styles.paymentMethodInfo}>
                    <Text
                      style={[
                        styles.paymentMethodName,
                        bookingData.paymentMethod === method.id && styles.paymentMethodNameActive,
                      ]}
                    >
                      {method.name}
                    </Text>
                    <Text style={styles.paymentMethodDescription}>
                      {method.description}
                    </Text>
                    {bookingData.paymentMethod === method.id && method.benefits && (
                      <View style={styles.benefitsList}>
                        {method.benefits.map((benefit, index) => (
                          <Text key={index} style={styles.benefitText}>
                            ✓ {benefit}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
                {bookingData.paymentMethod === method.id && (
                  <CheckCircle size={20} color={Colors.light.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏰ Payment Terms</Text>
          <View style={styles.paymentTerms}>
            {getAvailablePaymentTerms().map((term) => (
              <TouchableOpacity
                key={term.id}
                style={[
                  styles.paymentTermCard,
                  bookingData.paymentTerm === term.id && styles.paymentTermCardActive,
                  term.recommended && styles.paymentTermCardRecommended,
                ]}
                onPress={() => updateBookingData("paymentTerm", term.id)}
              >
                {term.recommended && (
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>RECOMMENDED</Text>
                  </View>
                )}
                
                <View style={styles.paymentTermLeft}>
                  <LinearGradient
                    colors={
                      bookingData.paymentTerm === term.id
                        ? [Colors.light.accent, Colors.light.accentDark]
                        : [Colors.light.backgroundSecondary, Colors.light.backgroundSecondary]
                    }
                    style={styles.paymentTermIcon}
                  >
                    <term.icon
                      size={20}
                      color={
                        bookingData.paymentTerm === term.id
                          ? Colors.light.background
                          : Colors.light.textMuted
                      }
                    />
                  </LinearGradient>
                  <View style={styles.paymentTermInfo}>
                    <Text
                      style={[
                        styles.paymentTermName,
                        bookingData.paymentTerm === term.id && styles.paymentTermNameActive,
                      ]}
                    >
                      {term.name}
                    </Text>
                    <Text style={styles.paymentTermDescription}>
                      {term.description}
                    </Text>
                  </View>
                </View>
                {bookingData.paymentTerm === term.id && (
                  <CheckCircle size={20} color={Colors.light.accent} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Package Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Package Description (Optional)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="What are you sending? (e.g., birthday gift, important documents)"
              value={bookingData.packageDescription}
              onChangeText={(text) => updateBookingData("packageDescription", text)}
              multiline
              numberOfLines={3}
              placeholderTextColor={Colors.light.textMuted}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Recipient Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Recipient Name</Text>
            <View style={styles.inputWithIcon}>
              <User size={18} color={Colors.light.textMuted} />
              <TextInput
                style={styles.textInputWithIcon}
                placeholder="Who will receive the package?"
                value={bookingData.recipientName}
                onChangeText={(text) => updateBookingData("recipientName", text)}
                placeholderTextColor={Colors.light.textMuted}
              />
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Recipient Phone</Text>
            <View style={styles.inputWithIcon}>
              <Phone size={18} color={Colors.light.textMuted} />
              <TextInput
                style={styles.textInputWithIcon}
                placeholder="+254712345678"
                value={bookingData.recipientPhone}
                onChangeText={(text) => updateBookingData("recipientPhone", text)}
                keyboardType="phone-pad"
                placeholderTextColor={Colors.light.textMuted}
              />
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Special Instructions (Optional)</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Any special delivery instructions? (e.g., call before delivery, gate code)"
              value={bookingData.specialInstructions}
              onChangeText={(text) => updateBookingData("specialInstructions", text)}
              multiline
              numberOfLines={3}
              placeholderTextColor={Colors.light.textMuted}
            />
          </View>
        </View>

        {priceBreakdown && (
          <TouchableOpacity 
            onPress={() => setShowPriceBreakdown(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.light.accent, Colors.light.accentDark]}
              style={styles.estimateCard}
            >
              <View style={styles.estimateHeader}>
                <View style={styles.estimateHeaderLeft}>
                  <Zap size={24} color={Colors.light.background} />
                  <Text style={styles.estimateTitle}>Delivery Estimate</Text>
                </View>
                <View style={styles.estimateHeaderRight}>
                  {isCalculatingPrice && (
                    <ActivityIndicator size="small" color={Colors.light.background} />
                  )}
                  <Info size={16} color={Colors.light.background} style={{ marginLeft: 8 }} />
                </View>
              </View>
              <View style={styles.estimateDetails}>
                <View style={styles.estimateItem}>
                  <DollarSign size={20} color={Colors.light.background} />
                  <Text style={styles.estimateLabel}>Total Price</Text>
                  <Text style={styles.estimateValue}>KSh {priceBreakdown.total}</Text>
                </View>
                <View style={styles.estimateItem}>
                  <Clock size={20} color={Colors.light.background} />
                  <Text style={styles.estimateLabel}>Time</Text>
                  <Text style={styles.estimateValue}>{estimatedTime}</Text>
                </View>
                <View style={styles.estimateItem}>
                  <Wallet size={20} color={Colors.light.background} />
                  <Text style={styles.estimateLabel}>Payment</Text>
                  <Text style={styles.estimateValue}>
                    {bookingData.paymentTerm === "pay_now" ? "Pay Now" : "On Delivery"}
                  </Text>
                </View>
                {bookingData.pickupCoords && bookingData.dropoffCoords && (
                  <View style={styles.estimateItem}>
                    <MapPin size={20} color={Colors.light.background} />
                    <Text style={styles.estimateLabel}>Distance</Text>
                    <Text style={styles.estimateValue}>
                      {MapService.calculateDistance(bookingData.pickupCoords, bookingData.dropoffCoords).toFixed(1)} km
                    </Text>
                  </View>
                )}
              </View>
              
              {(priceBreakdown.fragileCharge > 0 || priceBreakdown.insuranceCharge > 0 || 
                priceBreakdown.afterHoursCharge > 0 || priceBreakdown.weekendCharge > 0) && (
                <View style={styles.addOnsIndicator}>
                  <Text style={styles.addOnsText}>
                    Includes: {[
                      priceBreakdown.fragileCharge > 0 && 'Fragile handling',
                      priceBreakdown.insuranceCharge > 0 && 'Insurance',
                      priceBreakdown.afterHoursCharge > 0 && 'After-hours',
                      priceBreakdown.weekendCharge > 0 && 'Weekend'
                    ].filter(Boolean).join(', ')}
                  </Text>
                </View>
              )}
              
              <Text style={styles.tapForDetails}>Tap for price breakdown</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.bookButton} onPress={handleBookDelivery}>
          <LinearGradient
            colors={[Colors.light.primary, Colors.light.primaryDark]}
            style={styles.bookButtonGradient}
          >
            <Send size={24} color={Colors.light.background} />
            <Text style={styles.bookButtonText}>
              {bookingData.paymentTerm === "pay_now" ? "Book & Pay" : "Book Delivery"}
            </Text>
            {priceBreakdown && (
              <Text style={styles.bookButtonPrice}>KSh {priceBreakdown.total}</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
      
      {/* Location Search Modals */}
      <LocationSearchModal
        visible={showPickupSearch}
        onClose={() => setShowPickupSearch(false)}
        onLocationSelect={handlePickupLocationSelect}
        title="Select Pickup Location"
        placeholder="Search for pickup address..."
      />
      
      <LocationSearchModal
        visible={showDropoffSearch}
        onClose={() => setShowDropoffSearch(false)}
        onLocationSelect={handleDropoffLocationSelect}
        title="Select Delivery Location"
        placeholder="Search for delivery address..."
      />
      
      {/* Price Breakdown Modal */}
      {priceBreakdown && (
        <PriceBreakdownModal
          visible={showPriceBreakdown}
          onClose={() => setShowPriceBreakdown(false)}
          breakdown={priceBreakdown}
          distance={bookingData.pickupCoords && bookingData.dropoffCoords 
            ? MapService.calculateDistance(bookingData.pickupCoords, bookingData.dropoffCoords)
            : 0
          }
        />
      )}
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
    padding: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: Colors.light.text,
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    fontWeight: "500",
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.light.text,
  },
  mapToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.light.primaryLight,
    borderRadius: 12,
  },
  mapToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  mapContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  locationContainer: {
    gap: 8,
  },
  locationInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 16,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  locationTextContainer: {
    flex: 1,
  },
  locationText: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: "500",
  },
  locationPlaceholder: {
    color: Colors.light.textMuted,
  },
  locationConnector: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 40,
    gap: 12,
  },
  connectorLine: {
    width: 2,
    height: 24,
    backgroundColor: Colors.light.border,
  },
  connectorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  packageTypes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  packageTypeCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    gap: 12,
    position: "relative",
    overflow: "hidden",
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  packageTypeCardActive: {
    borderColor: Colors.light.primary,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.2,
  },
  packageTypeGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  packageTypeEmoji: {
    fontSize: 32,
  },
  packageTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
    textAlign: "center",
  },
  packageTypeTextActive: {
    color: Colors.light.primary,
    fontWeight: "700",
  },
  packageTypePrice: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: "600",
  },
  packageTypePriceActive: {
    color: Colors.light.primary,
    fontWeight: "700",
  },
  fragileIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  fragileText: {
    fontSize: 10,
    color: Colors.light.background,
    fontWeight: '600',
  },
  paymentMethods: {
    gap: 12,
  },
  paymentMethodCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: "relative",
  },
  paymentMethodCardActive: {
    borderColor: Colors.light.primary,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.2,
  },
  paymentMethodCardFeatured: {
    borderColor: Colors.light.mpesa,
  },
  featuredBadge: {
    position: "absolute",
    top: -8,
    right: 12,
    backgroundColor: Colors.light.mpesa,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 1,
  },
  featuredText: {
    fontSize: 10,
    color: Colors.light.background,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  paymentMethodLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  paymentMethodIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 2,
  },
  paymentMethodNameActive: {
    color: Colors.light.primary,
  },
  paymentMethodDescription: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: "500",
  },
  benefitsList: {
    marginTop: 8,
    gap: 2,
  },
  benefitText: {
    fontSize: 11,
    color: Colors.light.primary,
    fontWeight: "600",
  },
  paymentTerms: {
    gap: 12,
  },
  paymentTermCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: "relative",
  },
  paymentTermCardActive: {
    borderColor: Colors.light.accent,
    shadowColor: Colors.light.accent,
    shadowOpacity: 0.2,
  },
  paymentTermCardRecommended: {
    borderColor: Colors.light.accent,
  },
  recommendedBadge: {
    position: "absolute",
    top: -8,
    right: 12,
    backgroundColor: Colors.light.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 1,
  },
  recommendedText: {
    fontSize: 10,
    color: Colors.light.background,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  paymentTermLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  paymentTermIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  paymentTermInfo: {
    flex: 1,
  },
  paymentTermName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 2,
  },
  paymentTermNameActive: {
    color: Colors.light.accent,
  },
  paymentTermDescription: {
    fontSize: 12,
    color: Colors.light.textMuted,
    fontWeight: "500",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 8,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderWidth: 2,
    borderColor: Colors.light.borderLight,
    gap: 12,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textInputWithIcon: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: "500",
  },
  textArea: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 2,
    borderColor: Colors.light.borderLight,
    textAlignVertical: "top",
    fontWeight: "500",
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  estimateCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: Colors.light.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  estimateHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  estimateHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  estimateHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  estimateTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.light.background,
  },
  estimateDetails: {
    gap: 12,
  },
  estimateItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  estimateLabel: {
    fontSize: 16,
    color: Colors.light.background + "CC",
    flex: 1,
    fontWeight: "600",
  },
  estimateValue: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.light.background,
  },
  bookButton: {
    borderRadius: 20,
    marginBottom: 32,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  bookButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderRadius: 20,
  },
  bookButtonText: {
    color: Colors.light.background,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  bookButtonPrice: {
    color: Colors.light.background,
    fontSize: 18,
    fontWeight: "900",
    marginLeft: 8,
  },
  addOnContainer: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 16,
    gap: 16,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  addOnItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addOnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  addOnInfo: {
    flex: 1,
  },
  addOnTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 2,
  },
  addOnDescription: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  addOnsIndicator: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  addOnsText: {
    fontSize: 12,
    color: Colors.light.background + 'CC',
    fontWeight: '500',
  },
  tapForDetails: {
    fontSize: 11,
    color: Colors.light.background + '99',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
});