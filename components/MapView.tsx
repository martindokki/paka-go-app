import React from 'react';
import { Platform } from 'react-native';
import { Coordinates } from '@/services/map-service';

export interface MapViewComponentProps {
  onLocationSelect?: (location: Coordinates) => void;
  showSearch?: boolean;
  showRoute?: boolean;
  initialLocation?: Coordinates;
  height?: number;
}

// Platform-specific component loading with fallback
let MapViewComponent: React.FC<MapViewComponentProps>;

try {
  if (Platform.OS === 'web') {
    // For web, use the web implementation
    const WebMapView = require('./MapView.web');
    MapViewComponent = WebMapView.MapViewComponent || WebMapView.default;
  } else {
    // For native, use the native implementation
    const NativeMapView = require('./MapView.native.tsx');
    MapViewComponent = NativeMapView.MapViewComponent || NativeMapView.default;
  }
} catch (error) {
  console.warn('MapView component failed to load, using fallback:', error);
  // Fallback component
  const FallbackMapView = require('./MapView.fallback');
  MapViewComponent = FallbackMapView.MapViewComponent || FallbackMapView.default;
}

export { MapViewComponent };