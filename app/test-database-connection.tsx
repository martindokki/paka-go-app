import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { supabase } from '@/services/supabase';

export default function TestDatabaseConnectionScreen() {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (result: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const testDatabaseConnection = async () => {
    setIsLoading(true);
    clearResults();
    
    try {
      addResult('🔄 Testing database connection...');
      
      // Test 1: Basic connection
      const { data: connectionTest, error: connectionError } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (connectionError) {
        addResult(`❌ Connection failed: ${connectionError.message}`);
        return;
      }
      
      addResult('✅ Database connection successful');
      
      // Test 2: Check if tables exist
      const tables = ['users', 'parcels', 'deliveries', 'payments', 'notifications'];
      
      for (const table of tables) {
        try {
          const { error } = await supabase.from(table).select('count').limit(1);
          if (error) {
            addResult(`❌ Table '${table}' error: ${error.message}`);
          } else {
            addResult(`✅ Table '${table}' exists and accessible`);
          }
        } catch (err: any) {
          addResult(`❌ Table '${table}' check failed: ${err.message}`);
        }
      }
      
      // Test 3: Check auth functions
      addResult('🔄 Testing auth functions...');
      
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError) {
          addResult(`ℹ️ No current user (expected): ${authError.message}`);
        } else {
          addResult(`ℹ️ Current user: ${authData.user?.email || 'No email'}`);
        }
      } catch (err: any) {
        addResult(`❌ Auth check failed: ${err.message}`);
      }
      
      // Test 4: Check RLS policies
      addResult('🔄 Testing RLS policies...');
      
      try {
        // This should fail due to RLS if not authenticated
        const { data: rlsTest, error: rlsError } = await supabase
          .from('users')
          .select('*')
          .limit(1);
        
        if (rlsError) {
          addResult(`✅ RLS working (access denied as expected): ${rlsError.message}`);
        } else {
          addResult(`⚠️ RLS might not be working properly - got data without auth`);
        }
      } catch (err: any) {
        addResult(`✅ RLS working (access denied): ${err.message}`);
      }
      
      addResult('🎉 Database tests completed');
      
    } catch (error: any) {
      addResult(`❌ Test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testUserCreation = async () => {
    setIsLoading(true);
    addResult('🔄 Testing user creation process...');
    
    try {
      // Test creating a user with minimal data
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = 'TestPassword123!';
      
      addResult(`📝 Attempting to create user: ${testEmail}`);
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            full_name: 'Test User',
            phone_number: '+254712345678',
            role: 'customer'
          }
        }
      });
      
      if (signUpError) {
        addResult(`❌ Signup failed: ${signUpError.message}`);
        return;
      }
      
      if (!signUpData.user) {
        addResult(`❌ No user returned from signup`);
        return;
      }
      
      addResult(`✅ Auth user created: ${signUpData.user.id}`);
      
      // Wait for trigger to create profile
      addResult('⏳ Waiting for profile creation trigger...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check if profile was created
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', signUpData.user.id)
        .single();
      
      if (profileError) {
        addResult(`❌ Profile not found: ${profileError.message}`);
        addResult('🔧 This indicates the database trigger is not working');
      } else {
        addResult(`✅ Profile created successfully: ${profileData.full_name}`);
      }
      
      // Clean up - delete the test user
      addResult('🧹 Cleaning up test user...');
      await supabase.auth.admin.deleteUser(signUpData.user.id);
      
    } catch (error: any) {
      addResult(`❌ User creation test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Database Connection Test' }} />
      
      <View style={styles.buttonContainer}>
        <Pressable 
          style={[styles.button, styles.primaryButton]} 
          onPress={testDatabaseConnection}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Testing...' : 'Test Database Connection'}
          </Text>
        </Pressable>
        
        <Pressable 
          style={[styles.button, styles.secondaryButton]} 
          onPress={testUserCreation}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            Test User Creation
          </Text>
        </Pressable>
        
        <Pressable 
          style={[styles.button, styles.clearButton]} 
          onPress={clearResults}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Clear Results</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.resultsContainer}>
        {results.map((result, index) => (
          <Text key={index} style={styles.resultText}>
            {result}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 16,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  clearButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  resultText: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
});