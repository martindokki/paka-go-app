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
import { Search, MapPin, Navigation, X } from 'lucide-react-native';
import { useMapStore } from '@/stores/map-store';
import { MapService, Coordinates, MAPTILER_TILE_URL } from '@/services/map-service';
import { useLocation } from '@/hooks/useLocation';
import colors from '@/constants/colors';
import MapView, { Marker, Polyline, UrlTile, PROVIDER_DEFAULT } from 'react-native-maps';

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
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
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
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
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
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
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
      console.log('Searching for:', searchQuery);
      
      const coordinates = await MapService.geocodeAddress(searchQuery);
      
      if (coordinates) {
        console.log('Found coordinates:', coordinates);
        setDestination(coordinates);
        
        // Animate to destination
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }, 1000);
        }

        // Call callback if provided
        if (onLocationSelect) {
          onLocationSelect(coordinates);
        }
      } else {
        console.warn('No coordinates found for:', searchQuery);
        Alert.alert('Not found', 'Could not find the specified location. Please try a different search term.');
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Error', 'Failed to search for location. Please check your internet connection and try again.');
    } finally {
      setGeocoding(false);
    }
  };

  const getRoute = async () => {
    if (!userLocation || !destination) return;

    try {
      setLoadingRoute(true);
      console.log('Calculating route between:', userLocation, 'and', destination);
      
      const route = await MapService.getRoute(userLocation, destination);
      
      if (route && route.length > 0) {
        setRoutePoints(route);
        console.log('Route calculated successfully with', route.length, 'points');
        
        // Fit map to show both locations
        if (mapRef.current) {
          mapRef.current.fitToCoordinates([userLocation, destination], {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }
      } else {
        console.warn('No route returned from MapService');
        // Create a simple straight line as fallback
        const fallbackRoute = [
          { latitude: userLocation.latitude, longitude: userLocation.longitude },
          { latitude: destination.latitude, longitude: destination.longitude }
        ];
        setRoutePoints(fallbackRoute);
      }
    } catch (error) {
      console.error('Route calculation error:', error);
      // Create a simple straight line as fallback
      const fallbackRoute = [
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        { latitude: destination.latitude, longitude: destination.longitude }
      ];
      setRoutePoints(fallbackRoute);
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
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 1000);
    }
  };

  return (
    <View style={[styles.container, { height }]}>
      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, searchFocused && styles.searchBarFocused]}>
            <Search size={20} color={colors.text} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a destination..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
            {isGeocoding && (
              <ActivityIndicator size="small" color={colors.primary} style={styles.searchLoader} />
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
          latitude: -1.2921, // Nairobi, Kenya
          longitude: 36.8219,
          latitudeDelta: 0.05, // City-level zoom
          longitudeDelta: 0.05,
        }}
        showsUserLocation={false} // We'll use custom marker
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        loadingEnabled={true}
      >
        {/* MapTiler Tiles */}
        <UrlTile
          urlTemplate={MAPTILER_TILE_URL}
          maximumZ={19}
          flipY={false}
        />

        {/* User Location Marker */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Your Location"
            description="You are here"
            pinColor={colors.primary}
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
            pinColor={colors.accent}
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
            strokeColor="#007AFF" // Blue color as requested
            strokeWidth={5}
            lineDashPattern={[0]}
            lineJoin="round"
            lineCap="round"
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
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Navigation size={20} color={userLocation ? colors.primary : colors.textSecondary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Loading Route Indicator */}
      {isLoadingRoute && (
        <View style={styles.routeLoader}>
          <ActivityIndicator size="small" color={colors.primary} />
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
    color: colors.text,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  searchLoader: {
    marginLeft: 8,
  },
  searchButton: {
    backgroundColor: colors.primary,
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
    backgroundColor: colors.primary,
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
    backgroundColor: colors.accent,
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
    color: colors.text,
    fontSize: 14,
  },
});

// Default export for compatibility
export default MapViewComponent;