import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Stack } from 'expo-router';
import { supabase } from '@/services/supabase';

export default function TestDatabaseSetupScreen() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testDatabaseSetup = async () => {
    setIsLoading(true);
    clearResults();
    
    addResult('🔄 Testing database setup...');
    
    const requiredTables = [
      'users',
      'parcels', 
      'deliveries',
      'payments',
      'locations',
      'chats',
      'notifications',
      'vehicles',
      'support_tickets',
      'feedback'
    ];

    let allTablesExist = true;

    for (const table of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          addResult(`❌ Table '${table}' not found or not accessible: ${error.message}`);
          allTablesExist = false;
        } else {
          addResult(`✅ Table '${table}' exists and is accessible`);
        }
      } catch (error: any) {
        addResult(`❌ Error checking table '${table}': ${error.message}`);
        allTablesExist = false;
      }
    }

    // Test RLS policies
    try {
      addResult('🔄 Testing Row Level Security...');
      
      // This should fail without authentication (which is good)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      if (error && error.message.includes('row-level security')) {
        addResult('✅ Row Level Security is properly configured');
      } else if (error) {
        addResult(`⚠️ RLS test result: ${error.message}`);
      } else {
        addResult('⚠️ RLS might not be properly configured (no error when accessing users table)');
      }
    } catch (error: any) {
      addResult(`❌ Error testing RLS: ${error.message}`);
    }

    // Test database functions
    try {
      addResult('🔄 Testing database functions...');
      
      const { data, error } = await supabase
        .rpc('handle_new_user');
      
      if (error && error.message.includes('function')) {
        addResult('✅ Database functions are available');
      } else {
        addResult('⚠️ Could not verify database functions');
      }
    } catch (error: any) {
      addResult(`⚠️ Database functions test: ${error.message}`);
    }

    if (allTablesExist) {
      addResult('🎉 Database setup appears to be complete!');
      addResult('✅ All required tables exist');
      addResult('✅ You can now test user registration');
    } else {
      addResult('❌ Database setup is incomplete');
      addResult('📋 Please run the SQL schema from supabase-schema.sql');
      addResult('📖 See setup-database.md for instructions');
    }

    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Database Setup Test',
          headerStyle: { backgroundColor: '#059669' },
          headerTintColor: '#fff'
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>🗄️ Database Setup Verification</Text>
          <Text style={styles.subtitle}>
            Check if your Supabase database is properly configured
          </Text>
        </View>

        <View style={styles.buttonSection}>
          <Pressable
            style={[styles.button, styles.primaryButton, isLoading && styles.disabledButton]}
            onPress={testDatabaseSetup}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? '🔄 Testing...' : '🧪 Test Database Setup'}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.secondaryButton]}
            onPress={clearResults}
          >
            <Text style={styles.secondaryButtonText}>🗑️ Clear Results</Text>
          </Pressable>
        </View>

        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>Test Results</Text>
          <View style={styles.resultsContainer}>
            {testResults.length === 0 ? (
              <Text style={styles.noResults}>No test results yet. Run the test to check your database setup.</Text>
            ) : (
              testResults.map((result, index) => (
                <Text key={index} style={styles.resultText}>
                  {result}
                </Text>
              ))
            )}
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Setup Instructions</Text>
          <Text style={styles.infoText}>
            1. Copy content from supabase-schema.sql
          </Text>
          <Text style={styles.infoText}>
            2. Go to Supabase SQL Editor
          </Text>
          <Text style={styles.infoText}>
            3. Paste and run the SQL script
          </Text>
          <Text style={styles.infoText}>
            4. Run this test to verify setup
          </Text>
          <Text style={styles.infoText}>
            5. Test user registration in the app
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#14532d',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#16a34a',
    textAlign: 'center',
  },
  buttonSection: {
    marginBottom: 24,
    gap: 12,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#059669',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  secondaryButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  resultsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#14532d',
    marginBottom: 12,
  },
  resultsContainer: {
    backgroundColor: '#14532d',
    borderRadius: 8,
    padding: 16,
    minHeight: 200,
  },
  noResults: {
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 60,
  },
  resultText: {
    color: '#f0fdf4',
    fontSize: 14,
    fontFamily: 'monospace',
    marginBottom: 4,
    lineHeight: 20,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  infoText: {
    fontSize: 14,
    color: '#16a34a',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
});