import React from 'react';
import { Platform } from 'react-native';
import { Coordinates } from '@/services/map-service';

interface MapViewComponentProps {
  onLocationSelect?: (location: Coordinates) => void;
  showSearch?: boolean;
  showRoute?: boolean;
  initialLocation?: Coordinates;
  height?: number;
}

// Platform-specific component loading
let MapViewComponent: React.FC<MapViewComponentProps>;

if (Platform.OS === 'web') {
  // Import web version
  const WebMapView = require('./MapView.web').MapViewComponent;
  MapViewComponent = WebMapView;
} else {
  // Import native version
  const NativeMapView = require('./MapView.native').MapViewComponent;
  MapViewComponent = NativeMapView;
}

export { MapViewComponent };
export type { MapViewComponentProps };