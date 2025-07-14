import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, MapPin, Navigation, Route } from 'lucide-react-native';
import colors from '@/constants/colors';
import { MapViewComponent } from '@/components/MapView';
import { useMapStore } from '@/stores/map-store';
import { useLocation } from '@/hooks/useLocation';
import { MapService } from '@/services/map-service';

export default function TestMapScreen() {
  const {
    userLocation,
    destination,
    routePoints,
    searchQuery,
    setUserLocation,
    setDestination,
    clearRoute,
  } = useMapStore();

  const { location: currentLocation, requestLocation, isLoading } = useLocation();

  useEffect(() => {
    if (currentLocation) {
      setUserLocation(currentLocation);
    }
  }, [currentLocation, setUserLocation]);

  const testLocationSearch = async () => {
    try {
      const coords = await MapService.geocodeAddress('Westlands, Nairobi');
      if (coords) {
        setDestination(coords);
        Alert.alert('Success', `Found Westlands: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to search for location');
    }
  };

  const testRouting = async () => {
    if (!userLocation) {
      Alert.alert('Error', 'User location not available');
      return;
    }

    try {
      const destination = { latitude: -1.2676, longitude: 36.8108 }; // Westlands
      const route = await MapService.getRoute(userLocation, destination);
      if (route) {
        Alert.alert('Success', `Route calculated with ${route.length} points`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to calculate route');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Map Test</Text>
        
        <TouchableOpacity style={styles.locationButton} onPress={requestLocation}>
          <Navigation size={20} color={isLoading ? colors.textSecondary : colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Status */}
      <View style={styles.statusContainer}>
        <View style={styles.statusItem}>
          <MapPin size={16} color={userLocation ? colors.success : colors.textSecondary} />
          <Text style={styles.statusText}>
            GPS: {userLocation ? 'Connected' : 'Searching...'}
          </Text>
        </View>
        
        <View style={styles.statusItem}>
          <Route size={16} color={destination ? colors.primary : colors.textSecondary} />
          <Text style={styles.statusText}>
            Destination: {destination ? 'Set' : 'None'}
          </Text>
        </View>
        
        <View style={styles.statusItem}>
          <Navigation size={16} color={routePoints.length > 0 ? colors.accent : colors.textSecondary} />
          <Text style={styles.statusText}>
            Route: {routePoints.length} points
          </Text>
        </View>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapViewComponent
          showSearch={true}
          showRoute={true}
          height={400}
          onLocationSelect={(location) => {
            setDestination(location);
            Alert.alert('Location Selected', `Lat: ${location.latitude.toFixed(4)}, Lng: ${location.longitude.toFixed(4)}`);
          }}
        />
      </View>

      {/* Test Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.testButton} onPress={testLocationSearch}>
          <Text style={styles.testButtonText}>Test LocationIQ</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.testButton} onPress={testRouting}>
          <Text style={styles.testButtonText}>Test GraphHopper</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.testButton, styles.clearButton]} onPress={clearRoute}>
          <Text style={[styles.testButtonText, styles.clearButtonText]}>Clear Route</Text>
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Map Features:</Text>
        <Text style={styles.infoText}>• MapTiler tiles for base map</Text>
        <Text style={styles.infoText}>• LocationIQ geocoding for search</Text>
        <Text style={styles.infoText}>• GraphHopper routing for directions</Text>
        <Text style={styles.infoText}>• Expo Location for GPS</Text>
        <Text style={styles.infoText}>• Centered on Nairobi, Kenya</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  locationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  controlsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  testButton: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clearButtonText: {
    color: colors.text,
  },
  infoContainer: {
    padding: 20,
    backgroundColor: colors.backgroundSecondary,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 2,
  },
});