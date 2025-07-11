import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { X, MapPin, Search, Clock } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { MapService, Coordinates } from '@/services/map-service';
import { useMapStore } from '@/stores/map-store';

interface LocationSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (address: string, coordinates: Coordinates) => void;
  title: string;
  placeholder: string;
}

interface LocationSuggestion {
  id: string;
  address: string;
  coordinates: Coordinates;
  type: 'recent' | 'search';
}

export const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
  visible,
  onClose,
  onLocationSelect,
  title,
  placeholder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentLocations] = useState<LocationSuggestion[]>([
    {
      id: '1',
      address: 'Westlands Shopping Mall, Nairobi',
      coordinates: { latitude: -1.2676, longitude: 36.8108 },
      type: 'recent',
    },
    {
      id: '2',
      address: 'Karen Shopping Centre, Nairobi',
      coordinates: { latitude: -1.3197, longitude: 36.6859 },
      type: 'recent',
    },
    {
      id: '3',
      address: 'Sarit Centre, Westlands',
      coordinates: { latitude: -1.2676, longitude: 36.8108 },
      type: 'recent',
    },
    {
      id: '4',
      address: 'Yaya Centre, Kilimani',
      coordinates: { latitude: -1.2884, longitude: 36.7870 },
      type: 'recent',
    },
  ]);

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSuggestions(recentLocations);
    } else if (searchQuery.trim().length >= 3) {
      searchLocations();
    }
  }, [searchQuery]);

  const searchLocations = async () => {
    if (searchQuery.trim().length < 3) return;

    setIsSearching(true);
    try {
      // For demo purposes, we'll use predefined locations that match the search
      const mockResults: LocationSuggestion[] = [
        {
          id: 'search-1',
          address: `${searchQuery} - Nairobi CBD`,
          coordinates: { latitude: -1.2921, longitude: 36.8219 },
          type: 'search',
        },
        {
          id: 'search-2',
          address: `${searchQuery} - Westlands`,
          coordinates: { latitude: -1.2676, longitude: 36.8108 },
          type: 'search',
        },
        {
          id: 'search-3',
          address: `${searchQuery} - Karen`,
          coordinates: { latitude: -1.3197, longitude: 36.6859 },
          type: 'search',
        },
      ];

      // Try to get actual geocoding results
      try {
        const coordinates = await MapService.geocodeAddress(searchQuery);
        if (coordinates) {
          const actualResult: LocationSuggestion = {
            id: 'actual-result',
            address: searchQuery,
            coordinates,
            type: 'search',
          };
          setSuggestions([actualResult, ...mockResults]);
        } else {
          setSuggestions(mockResults);
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        setSuggestions(mockResults);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationSelect = (suggestion: LocationSuggestion) => {
    onLocationSelect(suggestion.address, suggestion.coordinates);
    onClose();
  };

  const renderLocationItem = ({ item }: { item: LocationSuggestion }) => (
    <TouchableOpacity
      style={styles.locationItem}
      onPress={() => handleLocationSelect(item)}
    >
      <View style={styles.locationIcon}>
        {item.type === 'recent' ? (
          <Clock size={16} color={Colors.light.textSecondary} />
        ) : (
          <MapPin size={16} color={Colors.light.primary} />
        )}
      </View>
      <View style={styles.locationInfo}>
        <Text style={styles.locationAddress}>{item.address}</Text>
        <Text style={styles.locationType}>
          {item.type === 'recent' ? 'Recent location' : 'Search result'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={Colors.light.text} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color={Colors.light.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder={placeholder}
              placeholderTextColor={Colors.light.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {isSearching && (
              <ActivityIndicator size="small" color={Colors.light.primary} />
            )}
          </View>
        </View>

        {/* Results */}
        <View style={styles.resultsContainer}>
          {searchQuery.trim().length === 0 && (
            <Text style={styles.sectionTitle}>Recent Locations</Text>
          )}
          
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.id}
            renderItem={renderLocationItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 20,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  locationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationInfo: {
    flex: 1,
  },
  locationAddress: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  locationType: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
});