import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MapPin, Search, Navigation, X } from 'lucide-react-native';
import colors from '@/constants/colors';
import { Coordinates, MapService } from '@/services/map-service';

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
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [lastSearchResult, setLastSearchResult] = React.useState<Coordinates | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      const coordinates = await MapService.geocodeAddress(searchQuery);
      
      if (coordinates) {
        setLastSearchResult(coordinates);
        if (onLocationSelect) {
          onLocationSelect(coordinates);
        }
        Alert.alert('Location Found', `Found: ${searchQuery}\nLat: ${coordinates.latitude.toFixed(6)}\nLng: ${coordinates.longitude.toFixed(6)}`);
      } else {
        Alert.alert('Not found', 'Could not find the specified location. Please try a different search term.');
      }
    } catch (error) {
      Alert.alert('Search Error', 'Failed to search for location. Please check your internet connection and try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setLastSearchResult(null);
  };

  return (
    <View style={[styles.container, { height }]}>
      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={colors.text} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a destination..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
            {isSearching && (
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

      {/* Map Placeholder */}
      <View style={styles.mapPlaceholder}>
        <View style={styles.mapContent}>
          <MapPin size={48} color={colors.primary} />
          <Text style={styles.mapTitle}>Map View</Text>
          <Text style={styles.mapSubtitle}>
            Map with MapTiler tiles, GPS location, and GraphHopper routing
          </Text>
          <Text style={styles.mapDescription}>
            Search for any location in Kenya using LocationIQ geocoding.
            The mobile app provides full interactive maps with real-time GPS and route calculation.
          </Text>
          
          {(initialLocation || lastSearchResult) && (
            <View style={styles.locationInfo}>
              {initialLocation && (
                <Text style={styles.locationText}>
                  Initial: {initialLocation.latitude.toFixed(4)}, {initialLocation.longitude.toFixed(4)}
                </Text>
              )}
              {lastSearchResult && (
                <Text style={styles.locationText}>
                  Search Result: {lastSearchResult.latitude.toFixed(4)}, {lastSearchResult.longitude.toFixed(4)}
                </Text>
              )}
            </View>
          )}
        </View>
        
        <View style={styles.mapGrid}>
          {Array.from({ length: 20 }).map((_, i) => (
            <View key={i} style={styles.gridLine} />
          ))}
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton}>
          <Navigation size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    overflow: 'hidden',
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
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mapContent: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.background,
    borderRadius: 20,
    margin: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1,
  },
  mapTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  mapSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  mapDescription: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  locationInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
  },
  locationText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  mapGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridLine: {
    width: '10%',
    height: '10%',
    borderWidth: 0.5,
    borderColor: colors.border + '40',
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
});

export default MapViewComponent;