import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Navigation, MapPin, Package } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import { MapViewComponent } from '@/components/MapView';
import { useMapStore } from '@/stores/map-store';
import { useOrdersStore, Order } from '@/stores/orders-store';
import { MapService, Coordinates } from '@/services/map-service';

export default function MapScreen() {
  const { orderId, mode } = useLocalSearchParams<{ orderId?: string; mode?: string }>();
  const { getOrderById } = useOrdersStore();
  const { userLocation, destination, routePoints } = useMapStore();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (orderId) {
      const foundOrder = getOrderById(orderId);
      if (foundOrder) {
        setOrder(foundOrder);
        // Geocode order addresses and set them in map store
        geocodeOrderAddresses(foundOrder);
      }
    }
  }, [orderId]);

  const geocodeOrderAddresses = async (orderData: any) => {
    try {
      const [pickup, delivery] = await Promise.all([
        MapService.geocodeAddress(orderData.from),
        MapService.geocodeAddress(orderData.to)
      ]);
      
      // Set locations in map store for route calculation
      if (pickup && delivery) {
        // This will trigger route calculation in MapViewComponent
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      Alert.alert('Error', 'Failed to load map locations');
    }
  };

  const handleLocationSelect = (location: any) => {
    // Handle location selection if in booking mode
    if (mode === 'booking') {
      // Navigate back with selected location
      router.back();
    }
  };

  const getDistance = () => {
    if (userLocation && destination) {
      return MapService.calculateDistance(userLocation, destination).toFixed(1);
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.light.text} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            {order ? `Order #${order.id}` : 'Map View'}
          </Text>
          {order && (
            <Text style={styles.headerSubtitle}>
              {order.from} → {order.to}
            </Text>
          )}
        </View>

        <TouchableOpacity style={styles.centerButton}>
          <Navigation size={20} color={colors.light.primary} />
        </TouchableOpacity>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapViewComponent
          onLocationSelect={handleLocationSelect}
          showSearch={!order} // Only show search if not viewing an order
          showRoute={true}
          height="400"
        />
      </View>

      {/* Bottom Info Panel */}
      {(userLocation && destination) && (
        <View style={styles.bottomPanel}>
          <LinearGradient
            colors={[colors.light.background, colors.light.backgroundSecondary]}
            style={styles.panelGradient}
          >
            <View style={styles.routeInfo}>
              <View style={styles.routeStats}>
                <View style={styles.statItem}>
                  <MapPin size={16} color={colors.light.primary} />
                  <Text style={styles.statLabel}>Distance</Text>
                  <Text style={styles.statValue}>{getDistance()} km</Text>
                </View>
                
                {routePoints.length > 0 && (
                  <View style={styles.statItem}>
                    <Package size={16} color={colors.light.accent} />
                    <Text style={styles.statLabel}>Route</Text>
                    <Text style={styles.statValue}>Calculated</Text>
                  </View>
                )}
              </View>

              {order && (
                <View style={styles.orderInfo}>
                  <Text style={styles.orderLabel}>Package Type</Text>
                  <Text style={styles.orderValue}>{order.packageType}</Text>
                  <Text style={styles.orderPrice}>KSh {order.price}</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  centerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    flex: 1,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  panelGradient: {
    padding: 24,
  },
  routeInfo: {
    gap: 16,
  },
  routeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '700',
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.primaryLight,
    borderRadius: 12,
  },
  orderLabel: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  orderValue: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  orderPrice: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: '800',
  },
});