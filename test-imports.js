// Test file to check if basic imports are working
console.log('Testing imports...');

try {
  // Test React Native imports
  const { View, Text } = require('react-native');
  console.log('✓ React Native imports working');
  
  // Test Expo Router
  const { router } = require('expo-router');
  console.log('✓ Expo Router imports working');
  
  // Test Lucide icons
  const { Package } = require('lucide-react-native');
  console.log('✓ Lucide icons imports working');
  
  // Test stores
  const { useAuthStore } = require('./stores/auth-store');
  console.log('✓ Auth store imports working');
  
  const { useOrdersStore } = require('./stores/orders-store');
  console.log('✓ Orders store imports working');
  
  const { useLocalDataStore } = require('./stores/local-data-store');
  console.log('✓ Local data store imports working');
  
  console.log('All imports working correctly!');
} catch (error) {
  console.error('Import error:', error.message);
  console.error('Stack:', error.stack);
}