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

// For web, use the web implementation
if (Platform.OS === 'web') {
  const { MapViewComponent: WebMapView } = require('./MapView.web');
  export const MapViewComponent: React.FC<MapViewComponentProps> = WebMapView;
} else {
  // For native, use the native implementation
  const { MapViewComponent: NativeMapView } = require('./MapView.native');
  export const MapViewComponent: React.FC<MapViewComponentProps> = NativeMapView;
}
export type { MapViewComponentProps };