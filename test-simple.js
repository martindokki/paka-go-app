// Simple test to check if basic imports work
console.log('Testing basic imports...');

try {
  // Test React Native imports
  const { View, Text } = require('react-native');
  console.log('✓ React Native imports work');
  
  // Test Expo Router
  const { router } = require('expo-router');
  console.log('✓ Expo Router imports work');
  
  // Test Lucide icons
  const { Send } = require('lucide-react-native');
  console.log('✓ Lucide icons import work');
  
  // Test Zustand
  const { create } = require('zustand');
  console.log('✓ Zustand imports work');
  
  console.log('All basic imports successful!');
} catch (error) {
  console.error('Import error:', error.message);
}