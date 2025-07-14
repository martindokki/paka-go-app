// Simple test to check if backend is working
const testBackend = async () => {
  try {
    console.log('Testing backend health...');
    
    // Test health endpoint
    const healthResponse = await fetch('http://localhost:8081/api/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check passed:', healthData);
    } else {
      console.log('❌ Health check failed:', healthResponse.status, healthResponse.statusText);
      return;
    }
    
    // Test tRPC endpoint
    console.log('Testing tRPC endpoint...');
    const trpcResponse = await fetch('http://localhost:8081/api/trpc/example.hi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: null,
        meta: {
          values: {}
        }
      }),
    });
    
    if (trpcResponse.ok) {
      const trpcData = await trpcResponse.json();
      console.log('✅ tRPC test passed:', trpcData);
    } else {
      console.log('❌ tRPC test failed:', trpcResponse.status, trpcResponse.statusText);
      const errorText = await trpcResponse.text();
      console.log('Error response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Backend test failed:', error);
  }
};

testBackend();