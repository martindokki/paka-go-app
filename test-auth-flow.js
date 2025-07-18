// Simple test to verify auth flow
const testAuthFlow = () => {
  console.log('Testing authentication flow...');
  
  // Test 1: Import auth store
  try {
    const { useAuthStore } = require('./stores/auth-store');
    console.log('✅ Auth store imported successfully');
    
    // Test 2: Get initial state
    const initialState = useAuthStore.getState();
    console.log('✅ Initial auth state:', {
      isAuthenticated: initialState.isAuthenticated,
      isInitialized: initialState.isInitialized,
      user: initialState.user
    });
    
    // Test 3: Test login function
    const loginTest = async () => {
      try {
        const result = await initialState.login({
          email: 'test@example.com',
          password: 'password123',
          userType: 'client'
        });
        console.log('✅ Login test result:', result);
        
        const newState = useAuthStore.getState();
        console.log('✅ State after login:', {
          isAuthenticated: newState.isAuthenticated,
          user: newState.user?.email,
          userType: newState.user?.userType
        });
      } catch (error) {
        console.error('❌ Login test failed:', error);
      }
    };
    
    loginTest();
    
  } catch (error) {
    console.error('❌ Auth store test failed:', error);
  }
};

// Run test if this file is executed directly
if (require.main === module) {
  testAuthFlow();
}

module.exports = { testAuthFlow };