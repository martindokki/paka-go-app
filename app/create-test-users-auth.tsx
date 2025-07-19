import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { AuthService } from '@/services/auth-service';

const testUsers = [
  {
    email: 'client@test.com',
    password: 'password123',
    name: 'Test Client',
    phone: '+254700000001',
    role: 'customer' as const,
  },
  {
    email: 'driver@test.com',
    password: 'password123',
    name: 'Test Driver',
    phone: '+254700000002',
    role: 'driver' as const,
  },
  {
    email: 'admin@test.com',
    password: 'password123',
    name: 'Test Admin',
    phone: '+254700000003',
    role: 'customer' as const, // Will be manually changed to admin in database
  },
];

export default function CreateTestUsersAuth() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const createAllUsers = async () => {
    setLoading(true);
    setResults([]);
    addResult('Starting to create test users...');

    for (const user of testUsers) {
      try {
        addResult(`Creating ${user.role}: ${user.email}...`);
        
        const { user: authUser, profile, error } = await AuthService.signUp(
          user.email,
          user.password,
          user.name,
          user.phone,
          user.role
        );

        if (error) {
          addResult(`❌ Failed to create ${user.email}: ${error.message}`);
        } else {
          addResult(`✅ Successfully created ${user.email} (ID: ${authUser?.id})`);
          
          // Sign out after creating each user
          await AuthService.signOut();
          addResult(`🔓 Signed out ${user.email}`);
        }
      } catch (error: any) {
        addResult(`💥 Exception creating ${user.email}: ${error.message}`);
      }
      
      // Wait a bit between creations
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    addResult('✨ Finished creating test users!');
    addResult('');
    addResult('📝 Test Credentials:');
    testUsers.forEach(user => {
      addResult(`${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
    });
    
    setLoading(false);
  };

  const testLogin = async (email: string, password: string) => {
    try {
      addResult(`🔐 Testing login for ${email}...`);
      
      const { user, error } = await AuthService.signIn(email, password);
      
      if (error) {
        addResult(`❌ Login failed for ${email}: ${error.message}`);
      } else {
        addResult(`✅ Login successful for ${email} (ID: ${user?.id})`);
        
        // Get profile
        const { profile } = await AuthService.getCurrentUser();
        if (profile) {
          addResult(`👤 Profile: ${profile.full_name} (${profile.role})`);
        }
        
        // Sign out
        await AuthService.signOut();
        addResult(`🔓 Signed out ${email}`);
      }
    } catch (error: any) {
      addResult(`💥 Exception testing ${email}: ${error.message}`);
    }
  };

  const testAllLogins = async () => {
    setLoading(true);
    addResult('🧪 Testing all user logins...');
    
    for (const user of testUsers) {
      await testLogin(user.email, user.password);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Create Test Users' }} />
      
      <Text style={styles.title}>Create Test Users</Text>
      <Text style={styles.subtitle}>This will create test users in Supabase Auth</Text>
      
      <View style={styles.buttons}>
        <TouchableOpacity 
          style={[styles.button, styles.createButton]} 
          onPress={createAllUsers}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating Users...' : 'Create All Test Users'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.testButton]} 
          onPress={testAllLogins}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Testing...' : 'Test All Logins'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.clearButton]} 
          onPress={clearResults}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Results:</Text>
        <ScrollView style={styles.results} showsVerticalScrollIndicator={false}>
          {results.length === 0 ? (
            <Text style={styles.noResults}>No results yet. Click "Create All Test Users" to start.</Text>
          ) : (
            results.map((result, index) => (
              <Text key={index} style={styles.resultText}>{result}</Text>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttons: {
    gap: 12,
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButton: {
    backgroundColor: '#4CAF50',
  },
  testButton: {
    backgroundColor: '#2196F3',
  },
  clearButton: {
    backgroundColor: '#757575',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  results: {
    flex: 1,
  },
  noResults: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
  },
  resultText: {
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
    marginBottom: 2,
  },
});