import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { supabase } from '@/services/supabase';

export default function TestDatabaseVerify() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testDatabaseConnection = async () => {
    setIsLoading(true);
    setResults([]);
    addResult('Testing database connection...');

    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (error) {
        addResult(`❌ Database connection failed: ${error.message}`);
        addResult(`Error code: ${error.code}`);
        addResult(`Error details: ${error.details}`);
      } else {
        addResult('✅ Database connection successful');
      }
    } catch (error: any) {
      addResult(`❌ Connection error: ${error.message}`);
    }

    setIsLoading(false);
  };

  const testTableStructure = async () => {
    setIsLoading(true);
    addResult('Testing table structure...');

    const tables = ['users', 'parcels', 'deliveries', 'payments', 'locations', 'chats', 'notifications', 'vehicles', 'support_tickets', 'feedback'];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          addResult(`❌ Table '${table}' error: ${error.message}`);
        } else {
          addResult(`✅ Table '${table}' accessible`);
        }
      } catch (error: any) {
        addResult(`❌ Table '${table}' failed: ${error.message}`);
      }
    }

    setIsLoading(false);
  };

  const testRLSPolicies = async () => {
    setIsLoading(true);
    addResult('Testing RLS policies...');

    try {
      // Test if we can insert into users table (should be allowed by policy)
      const testUserId = 'test-user-id-' + Date.now();
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: testUserId,
          full_name: 'Test User',
          email: `test-${Date.now()}@example.com`,
          role: 'customer'
        })
        .select();

      if (error) {
        addResult(`❌ RLS policy test failed: ${error.message}`);
        addResult(`Error code: ${error.code}`);
      } else {
        addResult('✅ RLS policies working (insert allowed)');
        
        // Clean up test data
        await supabase
          .from('users')
          .delete()
          .eq('id', testUserId);
        addResult('✅ Test data cleaned up');
      }
    } catch (error: any) {
      addResult(`❌ RLS test error: ${error.message}`);
    }

    setIsLoading(false);
  };

  const testAuthTrigger = async () => {
    setIsLoading(true);
    addResult('Testing auth trigger...');

    try {
      // Create a test auth user
      const testEmail = `test-trigger-${Date.now()}@example.com`;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: testEmail,
        password: 'testpassword123',
        options: {
          data: {
            full_name: 'Test Trigger User',
            phone_number: '+254700000000',
            role: 'customer'
          }
        }
      });

      if (authError) {
        addResult(`❌ Auth signup failed: ${authError.message}`);
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        addResult('❌ No user returned from auth signup');
        setIsLoading(false);
        return;
      }

      addResult('✅ Auth user created');

      // Wait for trigger to potentially work
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if profile was created by trigger
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        addResult(`❌ Trigger failed - no profile created: ${profileError.message}`);
        addResult('This means the database trigger is not working properly');
      } else if (profileData) {
        addResult('✅ Trigger working - profile created automatically');
        addResult(`Profile: ${profileData.full_name} (${profileData.email})`);
      }

      // Clean up
      try {
        await supabase.auth.admin.deleteUser(authData.user.id);
        addResult('✅ Test user cleaned up');
      } catch (cleanupError) {
        addResult('⚠️ Could not clean up test user (admin access required)');
      }

    } catch (error: any) {
      addResult(`❌ Trigger test error: ${error.message}`);
    }

    setIsLoading(false);
  };

  const runAllTests = async () => {
    await testDatabaseConnection();
    await testTableStructure();
    await testRLSPolicies();
    await testAuthTrigger();
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Database Verification' }} />
      
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Database Setup Verification</Text>
        
        <View style={styles.buttons}>
          <Pressable
            style={[styles.button, styles.primaryButton]}
            onPress={runAllTests}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Running Tests...' : 'Run All Tests'}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.secondaryButton]}
            onPress={testDatabaseConnection}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Test Connection</Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.secondaryButton]}
            onPress={testTableStructure}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Test Tables</Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.secondaryButton]}
            onPress={testRLSPolicies}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Test RLS Policies</Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.secondaryButton]}
            onPress={testAuthTrigger}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Test Auth Trigger</Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.clearButton]}
            onPress={clearResults}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Clear Results</Text>
          </Pressable>
        </View>

        <View style={styles.results}>
          <Text style={styles.resultsTitle}>Test Results:</Text>
          {results.length === 0 ? (
            <Text style={styles.noResults}>No tests run yet</Text>
          ) : (
            results.map((result, index) => (
              <Text key={index} style={styles.resultText}>
                {result}
              </Text>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  buttons: {
    gap: 12,
    marginBottom: 30,
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
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  results: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    minHeight: 300,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  noResults: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  resultText: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'monospace',
    color: '#666',
  },
});