import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MapPin, Navigation, ExternalLink } from 'lucide-react-native';
import colors from '@/constants/colors';

interface WebMapFallbackProps {
  height?: number;
  currentLocation?: { latitude: number; longitude: number } | null;
  destination?: { latitude: number; longitude: number } | null;
}

export const WebMapFallback: React.FC<WebMapFallbackProps> = ({
  height = 400,
  currentLocation,
  destination,
}) => {
  const handleOpenInMaps = () => {
    if (Platform.OS === 'web') {
      if (currentLocation && destination) {
        const url = `https://www.google.com/maps/dir/${currentLocation.latitude},${currentLocation.longitude}/${destination.latitude},${destination.longitude}`;
        window.open(url, '_blank');
      } else if (destination) {
        const url = `https://www.google.com/maps/search/${destination.latitude},${destination.longitude}`;
        window.open(url, '_blank');
      } else if (currentLocation) {
        const url = `https://www.google.com/maps/search/${currentLocation.latitude},${currentLocation.longitude}`;
        window.open(url, '_blank');
      }
    }
  };

  return (
    <View style={[styles.container, { height }]}>
      <View style={styles.content}>
        <MapPin size={48} color={colors.primary} />
        <Text style={styles.title}>Map View</Text>
        <Text style={styles.description}>
          Interactive map with location search and routing is available on mobile devices.
        </Text>
        
        {Platform.OS === 'web' && (currentLocation || destination) && (
          <TouchableOpacity style={styles.openMapsButton} onPress={handleOpenInMaps}>
            <ExternalLink size={20} color={colors.background} />
            <Text style={styles.openMapsText}>Open in Google Maps</Text>
          </TouchableOpacity>
        )}
        
        {currentLocation && (
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Current Location:</Text>
            <Text style={styles.locationText}>
              {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
            </Text>
          </View>
        )}
        
        {destination && (
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Destination:</Text>
            <Text style={styles.locationText}>
              {destination.latitude.toFixed(4)}, {destination.longitude.toFixed(4)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
  },
  description: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  openMapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  openMapsText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  locationInfo: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  locationLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500' as const,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});