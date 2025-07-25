import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Search, MapPin, X, Navigation } from 'lucide-react-native';
import { MapService, Coordinates } from '@/services/map-service';
import colors from '@/constants/colors';

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
  height = 400,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [lastSearchResult, setLastSearchResult] = useState<Coordinates | null>(null);

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

  return (
    <View style={[styles.container, { height }]}>
      {showSearch && (
        <View style={styles.webSearchContainer}>
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
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
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
      
      <View style={styles.webFallback}>
        <View style={styles.mapPlaceholder}>
          <MapPin size={48} color={colors.primary} />
          <Text style={styles.webFallbackTitle}>Map View - Nairobi, Kenya</Text>
          <Text style={styles.webFallbackText}>
            Interactive maps with MapTiler tiles are not available on web.
            Please use the mobile app for full map functionality with GPS location and routing.
          </Text>
          {showSearch && (
            <Text style={styles.webFallbackSubtext}>
              You can search for locations using LocationIQ geocoding above.
            </Text>
          )}
          
          {lastSearchResult && (
            <View style={styles.locationResult}>
              <Navigation size={16} color={colors.accent} />
              <Text style={styles.locationResultText}>
                Last Search: {lastSearchResult.latitude.toFixed(4)}, {lastSearchResult.longitude.toFixed(4)}
              </Text>
            </View>
          )}
        </View>
        
        {/* Nairobi Grid Representation */}
        <View style={styles.nairobiGrid}>
          <Text style={styles.gridLabel}>Nairobi City Center</Text>
          <View style={styles.gridContainer}>
            {Array.from({ length: 25 }).map((_, i) => (
              <View key={i} style={styles.gridCell} />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  webSearchContainer: {
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
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.backgroundSecondary,
  },
  mapPlaceholder: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  webFallbackTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  webFallbackText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  webFallbackSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 12,
    fontStyle: 'italic',
  },
  locationResult: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    gap: 8,
  },
  locationResultText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  nairobiGrid: {
    alignItems: 'center',
  },
  gridLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
  },
  gridContainer: {
    width: 150,
    height: 150,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  gridCell: {
    width: '20%',
    height: '20%',
    borderWidth: 0.5,
    borderColor: colors.border + '60',
    backgroundColor: colors.background + '80',
  },
});

// Default export for compatibility
export default MapViewComponent;