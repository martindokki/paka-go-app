// Mock for react-native-maps to prevent web bundling errors
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Create a fallback component that shows a message
const MapFallback = ({ children, style, ...props }) => (
  <View style={[styles.fallback, style]} {...props}>
    <Text style={styles.fallbackText}>Map not available on web</Text>
    {children}
  </View>
);

const MarkerFallback = ({ children, ...props }) => (
  <View style={styles.marker} {...props}>
    <Text style={styles.markerText}>📍</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    minHeight: 200,
  },
  fallbackText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  marker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: {
    fontSize: 20,
  },
});

export const MapView = MapFallback;
export const Marker = MarkerFallback;
export const Polyline = View;
export const Circle = View;
export const Polygon = View;
export const Callout = View;
export const UrlTile = View;

// Export constants that might be used
export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = 'default';

export default {
  MapView: MapFallback,
  Marker: MarkerFallback,
  Polyline: View,
  Circle: View,
  Polygon: View,
  Callout: View,
  UrlTile: View,
  PROVIDER_GOOGLE,
  PROVIDER_DEFAULT,
};