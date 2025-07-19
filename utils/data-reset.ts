import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Call this to reset all data and start fresh
// This removes all mock data and resets the app to production-ready state

export const resetAllData = async () => {
  try {
    if (Platform.OS === 'web') {
      // Clear localStorage on web
      localStorage.removeItem('auth-simple-storage');
      localStorage.removeItem('orders-storage');
      localStorage.removeItem('admin-storage');
      localStorage.removeItem('local-data-storage');
    } else {
      // Clear AsyncStorage on mobile
      await AsyncStorage.multiRemove([
        'auth-simple-storage',
        'orders-storage', 
        'admin-storage',
        'local-data-storage'
      ]);
    }
    
    console.log('All data cleared successfully - app reset to clean state');
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

export const resetOrdersData = async () => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem('orders-storage');
    } else {
      await AsyncStorage.removeItem('orders-storage');
    }
    
    console.log('Orders data cleared successfully - no more mock orders');
    return true;
  } catch (error) {
    console.error('Error clearing orders data:', error);
    return false;
  }
};

// Initialize clean state on app start
export const initializeCleanState = async () => {
  try {
    // Reset all data to ensure clean state
    await resetAllData();
    console.log('App initialized with clean state - no mock data');
    return true;
  } catch (error) {
    console.error('Error initializing clean state:', error);
    return false;
  }
};