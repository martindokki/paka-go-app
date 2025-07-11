import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, { Marker, Polyline, UrlTile, PROVIDER_DEFAULT } from 'react-native-maps';
import { Search, MapPin, Navigation, X } from 'lucide-react-native';
import { useMapStore } from '@/stores/map-store';
import { MapService, Coordinates } from '@/services/map-service';
import { useLocation } from '@/hooks/useLocation';
import Colors from '@/constants/colors';

interface MapViewComponentProps {
  onLocationSelect?: (location: Coordinates) => void;
  showSearch?: boolean;
  showRoute?: boolean;
  initialLocation?: Coordinates;
  height?: number;
}

export const MapViewComponent: React.FC<MapViewComponentProps> = ({
  onLocationSelect,
  showSearch = true,
  showRoute = true,
  initialLocation,
  height = 400,
}) => {
  // Web fallback
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { height }]}>
        <View style={styles.webFallback}>
          <MapPin size={48} color={Colors.light.primary} />
          <Text style={styles.webFallbackTitle}>Map View</Text>
          <Text style={styles.webFallbackText}>
            Interactive maps are not available on web.
            Please use the mobile app for full map functionality.
          </Text>
        </View>
      </View>
    );
  }
  const mapRef = useRef<MapView>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  
  const {
    userLocation,
    destination,
    routePoints,
    isLoadingLocation,
    isLoadingRoute,
    isGeocoding,
    searchQuery,
    mapRegion,
    setUserLocation,
    setDestination,
    setRoutePoints,
    setLoadingLocation,
    setLoadingRoute,
    setGeocoding,
    setSearchQuery,
    setMapRegion,
    clearRoute,
  } = useMapStore();

  const { location: currentLocation, requestLocation, isLoading: locationLoading } = useLocation();

  // Set user location when current location is available
  useEffect(() => {
    if (currentLocation) {
      setUserLocation(currentLocation);
      setMapRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [currentLocation]);

  // Set initial location if provided
  useEffect(() => {
    if (initialLocation) {
      setUserLocation(initialLocation);
      setMapRegion({
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [initialLocation]);

  // Get route when both locations are available
  useEffect(() => {
    if (showRoute && userLocation && destination) {
      getRoute();
    }
  }, [userLocation, destination, showRoute]);

  const getCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      await requestLocation();
      
      // Animate to user location if available
      if (currentLocation && mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setGeocoding(true);
      const coordinates = await MapService.geocodeAddress(searchQuery);
      
      if (coordinates) {
        setDestination(coordinates);
        
        // Animate to destination
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 1000);
        }

        // Call callback if provided
        if (onLocationSelect) {
          onLocationSelect(coordinates);
        }
      } else {
        Alert.alert('Not found', 'Could not find the specified location.');
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search for location.');
    } finally {
      setGeocoding(false);
    }
  };

  const getRoute = async () => {
    if (!userLocation || !destination) return;

    try {
      setLoadingRoute(true);
      const route = await MapService.getRoute(userLocation, destination);
      
      if (route) {
        setRoutePoints(route);
        
        // Fit map to show both locations
        if (mapRef.current) {
          mapRef.current.fitToCoordinates([userLocation, destination], {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }
      } else {
        Alert.alert('Route not found', 'Could not calculate route to destination.');
      }
    } catch (error) {
      console.error('Route error:', error);
      Alert.alert('Error', 'Failed to calculate route.');
    } finally {
      setLoadingRoute(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    clearRoute();
  };

  const centerOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  return (
    <View style={[styles.container, { height }]}>
      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, searchFocused && styles.searchBarFocused]}>
            <Search size={20} color={Colors.light.text} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a destination..."
              placeholderTextColor={Colors.light.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <X size={16} color={Colors.light.textSecondary} />
              </TouchableOpacity>
            )}
            {isGeocoding && (
              <ActivityIndicator size="small" color={Colors.light.primary} style={styles.searchLoader} />
            )}
          </View>
          
          {searchQuery.length > 0 && (
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_DEFAULT : undefined}
        initialRegion={mapRegion || {
          latitude: -1.2921, // Nairobi default
          longitude: 36.8219,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={false} // We'll use custom marker
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        loadingEnabled={true}
      >
        {/* OpenStreetMap Tiles */}
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />

        {/* User Location Marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            description="You are here"
            pinColor={Colors.light.primary}
          >
            <View style={styles.userMarker}>
              <View style={styles.userMarkerInner} />
            </View>
          </Marker>
        )}

        {/* Destination Marker */}
        {destination && (
          <Marker
            coordinate={destination}
            title="Destination"
            description="Delivery destination"
            pinColor={Colors.light.accent}
          >
            <View style={styles.destinationMarker}>
              <MapPin size={24} color="white" />
            </View>
          </Marker>
        )}

        {/* Route Polyline */}
        {showRoute && routePoints.length > 0 && (
          <Polyline
            coordinates={routePoints}
            strokeColor={Colors.light.primary}
            strokeWidth={4}
            lineDashPattern={[0]}
          />
        )}
      </MapView>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Center on User Button */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={centerOnUser}
          disabled={!userLocation}
        >
          {(isLoadingLocation || locationLoading) ? (
            <ActivityIndicator size="small" color={Colors.light.primary} />
          ) : (
            <Navigation size={20} color={userLocation ? Colors.light.primary : Colors.light.textSecondary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Loading Route Indicator */}
      {isLoadingRoute && (
        <View style={styles.routeLoader}>
          <ActivityIndicator size="small" color={Colors.light.primary} />
          <Text style={styles.routeLoaderText}>Calculating route...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  searchContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchBarFocused: {
    shadowOpacity: 0.2,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  searchLoader: {
    marginLeft: 8,
  },
  searchButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  map: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1,
  },
  controlButton: {
    backgroundColor: 'white',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.light.primary,
    borderWidth: 3,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userMarkerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  destinationMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  routeLoader: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routeLoaderText: {
    marginLeft: 8,
    color: Colors.light.text,
    fontSize: 14,
  },
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  webFallbackTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  webFallbackText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});