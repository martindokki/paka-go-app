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

// Platform-specific component loading
let MapViewComponent: React.FC<MapViewComponentProps>;

if (Platform.OS === 'web') {
  // For web, use the web implementation
  const WebMapView = require('./MapView.web');
  MapViewComponent = WebMapView.MapViewComponent || WebMapView.default;
} else {
  // For native, use the native implementation
  const NativeMapView = require('./MapView.native');
  MapViewComponent = NativeMapView.MapViewComponent || NativeMapView.default;
}

export { MapViewComponent };