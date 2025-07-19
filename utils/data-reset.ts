import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const resetAllData = async () => {
  try {
    if (Platform.OS === 'web') {
      // Clear localStorage on web
      localStorage.removeItem('auth-storage');
      localStorage.removeItem('orders-storage');
      localStorage.removeItem('admin-storage');
    } else {
      // Clear AsyncStorage on mobile
      await AsyncStorage.multiRemove([
        'auth-storage',
        'orders-storage', 
        'admin-storage'
      ]);
    }
    
    console.log('All data cleared successfully');
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
    
    console.log('Orders data cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing orders data:', error);
    return false;
  }
};