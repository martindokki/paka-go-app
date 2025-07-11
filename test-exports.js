// Test file to verify exports
console.log('Testing exports...');

// Test driver profile
try {
  const driverProfile = require('./app/(driver)/profile.tsx');
  console.log('✅ Driver profile export:', typeof driverProfile.default);
} catch (e) {
  console.log('❌ Driver profile error:', e.message);
}

// Test root layout
try {
  const rootLayout = require('./app/_layout.tsx');
  console.log('✅ Root layout export:', typeof rootLayout.default);
} catch (e) {
  console.log('❌ Root layout error:', e.message);
}

// Test client index
try {
  const clientIndex = require('./app/(client)/index.tsx');
  console.log('✅ Client index export:', typeof clientIndex.default);
} catch (e) {
  console.log('❌ Client index error:', e.message);
}

console.log('Test complete');