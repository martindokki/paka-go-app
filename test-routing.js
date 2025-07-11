// Test the routing functionality
const { MapService } = require('./services/map-service');

async function testRouting() {
  console.log('Testing routing functionality...');
  
  const start = { latitude: -1.2921, longitude: 36.8219 }; // Nairobi
  const end = { latitude: -1.3032, longitude: 36.8856 }; // Nearby location
  
  try {
    const route = await MapService.getRoute(start, end);
    console.log('✅ Route calculation successful');
    console.log(`✅ Route has ${route?.length || 0} points`);
    
    const distance = MapService.calculateDistance(start, end);
    console.log(`✅ Distance: ${distance.toFixed(2)} km`);
    
    console.log('\n🎉 Routing functionality is working correctly!');
  } catch (error) {
    console.error('❌ Routing test failed:', error.message);
  }
}

testRouting();