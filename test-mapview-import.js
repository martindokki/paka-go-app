// Test MapView imports to check for circular dependencies
console.log('Testing MapView imports...');

try {
  // Test main MapView
  const MapView = require('./components/MapView');
  console.log('✅ Main MapView imported successfully');
  console.log('MapViewComponent available:', !!MapView.MapViewComponent);
  
  // Test native MapView
  const NativeMapView = require('./components/MapView.native');
  console.log('✅ Native MapView imported successfully');
  console.log('Native MapViewComponent available:', !!NativeMapView.MapViewComponent);
  
  // Test web MapView
  const WebMapView = require('./components/MapView.web');
  console.log('✅ Web MapView imported successfully');
  console.log('Web MapViewComponent available:', !!WebMapView.MapViewComponent);
  
  // Test fallback MapView
  const FallbackMapView = require('./components/MapView.fallback');
  console.log('✅ Fallback MapView imported successfully');
  console.log('Fallback MapViewComponent available:', !!FallbackMapView.MapViewComponent);
  
  console.log('🎉 All MapView imports working correctly!');
} catch (error) {
  console.error('❌ MapView import error:', error.message);
  console.error('Stack:', error.stack);
}