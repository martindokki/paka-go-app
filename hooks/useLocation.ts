import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert, Platform } from 'react-native';

export interface LocationData {
  latitude: number;
  longitude: number;
}

export interface UseLocationReturn {
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => Promise<void>;
  hasPermission: boolean;
}

export const useLocation = (): UseLocationReturn => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    checkPermissions();
    // Automatically request location on initialization
    requestLocation();
  }, []);

  const checkPermissions = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
    } catch (err) {
      console.error('Error checking location permissions:', err);
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);
      
      if (!granted) {
        setError('Location permission denied');
        if (Platform.OS !== 'web') {
          Alert.alert(
            'Location Permission Required',
            'Please enable location access in your device settings to use map features.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Settings', onPress: () => Location.requestForegroundPermissionsAsync() }
            ]
          );
        }
      }
      
      return granted;
    } catch (err) {
      console.error('Error requesting location permissions:', err);
      setError('Failed to request location permissions');
      return false;
    }
  };

  const getCurrentLocation = async (): Promise<LocationData | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if we have permission
      if (!hasPermission) {
        const granted = await requestPermissions();
        if (!granted) {
          return null;
        }
      }

      // Get current position with timeout
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced, // Use balanced for better performance
        maximumAge: 60000, // Accept cached location up to 1 minute old
      });

      const locationData: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setLocation(locationData);
      return locationData;
    } catch (err) {
      console.error('Error getting current location:', err);
      setError('Failed to get current location');
      
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Location Error',
          'Unable to get your current location. Please check your GPS settings and try again.'
        );
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const requestLocation = async () => {
    await getCurrentLocation();
  };

  return {
    location,
    isLoading,
    error,
    requestLocation,
    hasPermission,
  };
};