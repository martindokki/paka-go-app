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
  MapViewComponent = require('./MapView.web').MapViewComponent;
} else {
  // For native, use the native implementation
  MapViewComponent = require('./MapView.native').MapViewComponent;
}

export { MapViewComponent };