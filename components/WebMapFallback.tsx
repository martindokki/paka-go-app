import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MapPin } from 'lucide-react-native';
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
  return (
    <View style={[styles.container, { height }]}>
      <MapPin size={48} color={colors.primary} />
      <Text style={styles.title}>Map View</Text>
      <Text style={styles.description}>
        Interactive map with location search and routing is available on mobile devices.
      </Text>
      {currentLocation && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>
            Current Location: {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
          </Text>
        </View>
      )}
      {destination && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>
            Destination: {destination.latitude.toFixed(4)}, {destination.longitude.toFixed(4)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
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
  locationInfo: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  locationText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500' as const,
  },
});