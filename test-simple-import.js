// Test basic imports
try {
  console.log('Testing basic imports...');
  
  // Test React Native imports
  const { View, Text } = require('react-native');
  console.log('✓ React Native imports work');
  
  // Test Expo Router
  const { router } = require('expo-router');
  console.log('✓ Expo Router imports work');
  
  // Test stores
  const { useAuthStore } = require('./stores/auth-store');
  console.log('✓ Auth store imports work');
  
  const { useOrdersStore } = require('./stores/orders-store');
  console.log('✓ Orders store imports work');
  
  const { useLocalDataStore } = require('./stores/local-data-store');
  console.log('✓ Local data store imports work');
  
  // Test constants
  const colors = require('./constants/colors');
  console.log('✓ Colors imports work');
  
  console.log('All imports successful!');
} catch (error) {
  console.error('Import error:', error.message);
  console.error('Stack:', error.stack);
}