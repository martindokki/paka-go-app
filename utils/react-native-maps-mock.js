// Mock for react-native-maps to prevent web bundling errors
import { View } from 'react-native';

export const MapView = View;
export const Marker = View;
export const Polyline = View;
export const Circle = View;
export const Polygon = View;
export const Callout = View;
export const UrlTile = View;

export default {
  MapView: View,
  Marker: View,
  Polyline: View,
  Circle: View,
  Polygon: View,
  Callout: View,
  UrlTile: View,
};