// Database Setup Verification Script
// Run this to check if your Supabase database is properly configured

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yrokteacdihxfcrpgotz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlyb2t0ZWFjZGloeGZjcnBnb3R6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4NDk5NTksImV4cCI6MjA2ODQyNTk1OX0.hahF2k3TeBmvVXHN5LXf_8zOcchpIL8F7cMKOM48wGw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyDatabaseSetup() {
  console.log('🔍 Verifying Supabase Database Setup...\n');
  
  try {
    // Test 1: Connection
    console.log('1. Testing connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.log('❌ Connection failed:', connectionError.message);
      return;
    }
    console.log('✅ Connection successful\n');
    
    // Test 2: Check required tables
    console.log('2. Checking required tables...');
    const requiredTables = [
      'users', 'parcels', 'deliveries', 'payments', 
      'locations', 'chats', 'notifications', 'vehicles', 
      'support_tickets', 'feedback'
    ];
    
    for (const table of requiredTables) {
      try {
        const { error } = await supabase.from(table).select('count').limit(1);
        if (error) {
          console.log(`❌ Table '${table}': ${error.message}`);
        } else {
          console.log(`✅ Table '${table}': OK`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}': ${err.message}`);
      }
    }
    
    console.log('\n3. Testing user creation trigger...');
    
    // Test 3: Test user creation (this will fail due to RLS, but we can check the error)
    const testEmail = `test-${Date.now()}@example.com`;
    
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: 'TestPassword123!',
        options: {
          data: {
            full_name: 'Test User',
            phone_number: '+254712345678',
            role: 'customer'
          }
        }
      });
      
      if (signUpError) {
        console.log('❌ Signup test failed:', signUpError.message);
      } else if (signUpData.user) {
        console.log('✅ Auth user creation works');
        
        // Wait and check if profile was created
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', signUpData.user.id)
            .single();
          
          if (profileError) {
            console.log('❌ Profile creation trigger not working:', profileError.message);
            console.log('💡 You may need to run the database setup script in Supabase SQL Editor');
          } else {
            console.log('✅ Profile creation trigger works');
          }
        } catch (err) {
          console.log('❌ Profile check failed:', err.message);
        }
        
        // Clean up
        try {
          await supabase.auth.admin.deleteUser(signUpData.user.id);
          console.log('🧹 Test user cleaned up');
        } catch (cleanupErr) {
          console.log('⚠️ Could not clean up test user (this is normal)');
        }
      }
    } catch (err) {
      console.log('❌ User creation test failed:', err.message);
    }
    
    console.log('\n🎉 Database verification completed');
    console.log('\n📋 Next steps if there are issues:');
    console.log('1. Make sure you have run the SQL schema in your Supabase SQL Editor');
    console.log('2. Check that RLS policies are enabled');
    console.log('3. Verify the user creation trigger is working');
    console.log('4. Check that all required tables exist');
    
  } catch (error) {
    console.log('❌ Verification failed:', error.message);
  }
}

// Run the verification
verifyDatabaseSetup().catch(console.error);