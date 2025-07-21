import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import * as Location from 'expo-location';
import { Search, MapPin, Navigation, X } from 'lucide-react-native';
import axios from 'axios';
import colors from '@/constants/colors';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationSearchResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
}

interface RoutePoint {
  latitude: number;
  longitude: number;
}

export interface MapViewComponentProps {
  onLocationSelect?: (location: Coordinates & { address: string }) => void;
  showSearch?: boolean;
  showRoute?: boolean;
  initialLocation?: Coordinates;
  height?: number;
}

const NAIROBI_LOCATION: Coordinates = {
  latitude: -1.2921,
  longitude: 36.8219,
};

const MAPTILER_API_KEY = '79OLLNisYXbzUxnyeyMB';
const LOCATIONIQ_API_KEY = 'pk.660be2665aac44ed24823d543f20a67a';
const GRAPHHOPPER_API_KEY = '5ee3d9d9-8d55-40b5-b9d4-92edffb415d9';

export const MapViewComponent: React.FC<MapViewComponentProps> = ({
  onLocationSelect,
  showSearch = true,
  showRoute = false,
  initialLocation,
  height = 400,
}) => {
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(
    initialLocation || NAIROBI_LOCATION
  );
  const [destination, setDestination] = useState<Coordinates | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<RoutePoint[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get user's current location
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      
      if (Platform.OS === 'web') {
        // Use web geolocation API
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const coords = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };
              setCurrentLocation(coords);
              setIsLoadingLocation(false);
            },
            (error) => {
              console.error('Web geolocation error:', error);
              Alert.alert('Error', 'Failed to get your current location');
              setIsLoadingLocation(false);
            }
          );
        } else {
          Alert.alert('Error', 'Geolocation is not supported by this browser');
          setIsLoadingLocation(false);
        }
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is required to show your current location on the map.'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setCurrentLocation(coords);
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Failed to get your current location');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Search for locations using LocationIQ
  const searchLocations = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      setIsSearching(true);
      
      const response = await axios.get(
        `https://us1.locationiq.com/v1/search.php`,
        {
          params: {
            key: LOCATIONIQ_API_KEY,
            q: query,
            format: 'json',
            limit: 5,
            countrycodes: 'ke', // Limit to Kenya
          },
        }
      );

      setSearchResults(response.data);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Search Error', 'Failed to search for locations');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input with debouncing
  const handleSearchInput = (text: string) => {
    setSearchQuery(text);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(text);
    }, 500);
  };

  // Select a location from search results
  const selectLocation = (result: LocationSearchResult) => {
    const coords = {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    };

    setDestination(coords);
    setSearchQuery(result.display_name);
    setShowSearchResults(false);

    // Call the callback if provided
    if (onLocationSelect) {
      onLocationSelect({
        ...coords,
        address: result.display_name,
      });
    }

    // Draw route if current location is available
    if (currentLocation && showRoute) {
      drawRoute(currentLocation, coords);
    }
  };

  // Draw route using GraphHopper
  const drawRoute = async (start: Coordinates, end: Coordinates) => {
    try {
      setIsLoadingRoute(true);
      
      const response = await axios.get(
        'https://graphhopper.com/api/1/route',
        {
          params: {
            point: [`${start.latitude},${start.longitude}`, `${end.latitude},${end.longitude}`],
            vehicle: 'car',
            points_encoded: false,
            key: GRAPHHOPPER_API_KEY,
          },
        }
      );

      if (response.data.paths && response.data.paths.length > 0) {
        const path = response.data.paths[0];
        const coordinates = path.points.coordinates.map((coord: [number, number]) => ({
          latitude: coord[1],
          longitude: coord[0],
        }));
        
        setRouteCoordinates(coordinates);
      }
    } catch (error) {
      console.error('Route error:', error);
      Alert.alert('Route Error', 'Failed to calculate route');
    } finally {
      setIsLoadingRoute(false);
    }
  };

  // Clear search and route
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    setDestination(null);
    setRouteCoordinates([]);
  };

  const renderSearchResult = ({ item }: { item: LocationSearchResult }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => selectLocation(item)}
    >
      <MapPin size={16} color={colors.primary} />
      <Text style={styles.searchResultText} numberOfLines={2}>
        {item.display_name}
      </Text>
    </TouchableOpacity>
  );

  // Web Map Fallback
  const renderWebFallback = () => {
    return (
      <View style={styles.webFallback}>
        <MapPin size={48} color={colors.primary} />
        <Text style={styles.webFallbackTitle}>Map View</Text>
        <Text style={styles.webFallbackText}>
          Interactive map with location search and routing is available on mobile devices.
        </Text>
        {currentLocation && (
          <View style={styles.locationInfo}>
            <Text style={styles.locationInfoText}>
              Current Location: {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
            </Text>
          </View>
        )}
        {destination && (
          <View style={styles.locationInfo}>
            <Text style={styles.locationInfoText}>
              Destination: {destination.latitude.toFixed(4)}, {destination.longitude.toFixed(4)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { height }]}>
      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a location..."
              value={searchQuery}
              onChangeText={handleSearchInput}
              placeholderTextColor={colors.textMuted}
            />
            {(searchQuery || isSearching) && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                {isSearching ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <X size={20} color={colors.textMuted} />
                )}
              </TouchableOpacity>
            )}
          </View>
          
          {/* Search Results */}
          {showSearchResults && searchResults.length > 0 && (
            <View style={styles.searchResults}>
              <FlatList
                data={searchResults}
                renderItem={renderSearchResult}
                keyExtractor={(item) => item.place_id}
                style={styles.searchResultsList}
                keyboardShouldPersistTaps="handled"
              />
            </View>
          )}
        </View>
      )}

      {/* Web Map Fallback */}
      {renderWebFallback()}

      {/* Loading Indicators */}
      {(isLoadingLocation || isLoadingRoute) && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>
              {isLoadingLocation ? 'Getting your location...' : 'Calculating route...'}
            </Text>
          </View>
        </View>
      )}

      {/* Current Location Button */}
      <TouchableOpacity
        style={styles.locationButton}
        onPress={getCurrentLocation}
        disabled={isLoadingLocation}
      >
        <Navigation size={24} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.backgroundSecondary,
    gap: 16,
  },
  webFallbackTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
  },
  webFallbackText: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  locationInfo: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  locationInfoText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500' as const,
  },
  searchContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 1000,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500' as const,
  },
  clearButton: {
    padding: 4,
  },
  searchResults: {
    backgroundColor: colors.background,
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchResultsList: {
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  searchResultText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500' as const,
  },
  map: {
    flex: 1,
  },

  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  loadingContainer: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600' as const,
  },
  locationButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: colors.background,
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
  },
});