import { create } from 'zustand';
import { Coordinates, RoutePoint } from '@/services/map-service';

export interface MapState {
  // Current user location
  userLocation: Coordinates | null;
  
  // Destination coordinates
  destination: Coordinates | null;
  
  // Route points for drawing polyline
  routePoints: RoutePoint[];
  
  // Loading states
  isLoadingLocation: boolean;
  isLoadingRoute: boolean;
  isGeocoding: boolean;
  
  // Search
  searchQuery: string;
  
  // Map region
  mapRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null;
  
  // Actions
  setUserLocation: (location: Coordinates | null) => void;
  setDestination: (destination: Coordinates | null) => void;
  setRoutePoints: (points: RoutePoint[]) => void;
  setLoadingLocation: (loading: boolean) => void;
  setLoadingRoute: (loading: boolean) => void;
  setGeocoding: (loading: boolean) => void;
  setSearchQuery: (query: string) => void;
  setMapRegion: (region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null) => void;
  clearRoute: () => void;
  reset: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  // Initial state
  userLocation: null,
  destination: null,
  routePoints: [],
  isLoadingLocation: false,
  isLoadingRoute: false,
  isGeocoding: false,
  searchQuery: '',
  mapRegion: {
    latitude: -1.2921, // Nairobi, Kenya
    longitude: 36.8219,
    latitudeDelta: 0.05, // City-level view
    longitudeDelta: 0.05,
  },
  
  // Actions
  setUserLocation: (location) => set({ userLocation: location }),
  setDestination: (destination) => set({ destination }),
  setRoutePoints: (points) => set({ routePoints: points }),
  setLoadingLocation: (loading) => set({ isLoadingLocation: loading }),
  setLoadingRoute: (loading) => set({ isLoadingRoute: loading }),
  setGeocoding: (loading) => set({ isGeocoding: loading }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setMapRegion: (region) => set({ mapRegion: region }),
  clearRoute: () => set({ routePoints: [], destination: null }),
  reset: () => set({
    userLocation: null,
    destination: null,
    routePoints: [],
    isLoadingLocation: false,
    isLoadingRoute: false,
    isGeocoding: false,
    searchQuery: '',
    mapRegion: {
      latitude: -1.2921, // Nairobi, Kenya
      longitude: 36.8219,
      latitudeDelta: 0.05, // City-level view
      longitudeDelta: 0.05,
    },
  }),
}));