import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { MapPin, Search, Navigation } from 'lucide-react-native';
import colors from '@/constants/colors';
import { Coordinates } from '@/services/map-service';

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

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    // Mock coordinates for common Nairobi locations
    const mockLocations: { [key: string]: Coordinates } = {
      'westlands': { latitude: -1.2676, longitude: 36.8108 },
      'karen': { latitude: -1.3197, longitude: 36.6859 },
      'cbd': { latitude: -1.2921, longitude: 36.8219 },
      'kilimani': { latitude: -1.2921, longitude: 36.7833 },
      'lavington': { latitude: -1.2833, longitude: 36.7667 },
      'gigiri': { latitude: -1.2333, longitude: 36.8167 },
      'sarit': { latitude: -1.2676, longitude: 36.8108 },
      'yaya': { latitude: -1.2921, longitude: 36.7833 },
      'kencom': { latitude: -1.2921, longitude: 36.8219 },
      'nakumatt junction': { latitude: -1.2676, longitude: 36.8108 },
    };

    const searchLower = searchQuery.toLowerCase();
    let foundLocation: Coordinates | null = null;

    // Find matching location
    for (const [key, coords] of Object.entries(mockLocations)) {
      if (searchLower.includes(key) || key.includes(searchLower)) {
        foundLocation = coords;
        break;
      }
    }

    if (foundLocation) {
      if (onLocationSelect) {
        onLocationSelect(foundLocation);
      }
      Alert.alert('Location Found', `Found coordinates for: ${searchQuery}`);
    } else {
      // Default to Nairobi CBD
      const defaultLocation = { latitude: -1.2921, longitude: 36.8219 };
      if (onLocationSelect) {
        onLocationSelect(defaultLocation);
      }
      Alert.alert('Location Set', `Set location to Nairobi CBD for: ${searchQuery}`);
    }
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
            Interactive map is temporarily unavailable
          </Text>
          <Text style={styles.mapDescription}>
            You can still search for locations using the search bar above.
            Common areas like Westlands, Karen, CBD, and Kilimani are supported.
          </Text>
          
          {initialLocation && (
            <View style={styles.locationInfo}>
              <Text style={styles.locationText}>
                Current Location: {initialLocation.latitude.toFixed(4)}, {initialLocation.longitude.toFixed(4)}
              </Text>
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