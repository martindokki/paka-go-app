// Simple test to check if basic imports work
try {
  console.log('Testing basic imports...');
  
  // Test React Native imports
  const RN = require('react-native');
  console.log('✓ React Native imported');
  
  // Test Expo Router
  const ExpoRouter = require('expo-router');
  console.log('✓ Expo Router imported');
  
  // Test Zustand
  const zustand = require('zustand');
  console.log('✓ Zustand imported');
  
  // Test AsyncStorage
  const AsyncStorage = require('@react-native-async-storage/async-storage');
  console.log('✓ AsyncStorage imported');
  
  // Test Lucide icons
  const lucide = require('lucide-react-native');
  console.log('✓ Lucide icons imported');
  
  // Test Linear Gradient
  const LinearGradient = require('expo-linear-gradient');
  console.log('✓ Linear Gradient imported');
  
  console.log('All basic imports successful!');
} catch (error) {
  console.error('Import error:', error.message);
}