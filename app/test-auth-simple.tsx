import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { AuthService } from '@/services/auth-service';

export default function TestAuthSimple() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('Test User');
  const [phoneNumber, setPhoneNumber] = useState('+254700000000');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testSignUp = async () => {
    setIsLoading(true);
    setResults([]);
    addResult('Starting signup test...');

    try {
      const result = await AuthService.signUp(email, password, fullName, phoneNumber, 'customer');
      
      if (result.error) {
        addResult(`❌ Signup failed: ${result.error.message || 'Unknown error'}`);
      } else if (result.user && result.profile) {
        addResult(`✅ Signup successful!`);
        addResult(`User ID: ${result.user.id}`);
        addResult(`Profile: ${result.profile.full_name} (${result.profile.email})`);
        addResult(`Role: ${result.profile.role}`);
      } else {
        addResult('❌ Signup failed: No user or profile returned');
      }
    } catch (error: any) {
      addResult(`❌ Signup error: ${error.message || 'Unknown error'}`);
    }

    setIsLoading(false);
  };

  const testSignIn = async () => {
    setIsLoading(true);
    setResults([]);
    addResult('Starting signin test...');

    try {
      const result = await AuthService.signIn(email, password);
      
      if (result.error) {
        addResult(`❌ Signin failed: ${result.error.message || 'Unknown error'}`);
      } else if (result.user) {
        addResult(`✅ Signin successful!`);
        addResult(`User ID: ${result.user.id}`);
        addResult(`Email: ${result.user.email}`);
        
        // Try to get current user profile
        const profileResult = await AuthService.getCurrentUser();
        if (profileResult.profile) {
          addResult(`✅ Profile loaded: ${profileResult.profile.full_name}`);
        } else {
          addResult(`⚠️ Profile not found in database`);
        }
      } else {
        addResult('❌ Signin failed: No user returned');
      }
    } catch (error: any) {
      addResult(`❌ Signin error: ${error.message || 'Unknown error'}`);
    }

    setIsLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Auth Test Simple' }} />
      
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Simple Authentication Test</Text>
        
        <View style={styles.form}>
          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <Text style={styles.label}>Password:</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            secureTextEntry
          />
          
          <Text style={styles.label}>Full Name:</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter full name"
          />
          
          <Text style={styles.label}>Phone Number:</Text>
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.buttons}>
          <Pressable
            style={[styles.button, styles.signupButton]}
            onPress={testSignUp}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Testing...' : 'Test Sign Up'}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.signinButton]}
            onPress={testSignIn}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Testing...' : 'Test Sign In'}
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

        <View style={styles.results}>
          <Text style={styles.resultsTitle}>Test Results:</Text>
          {results.map((result, index) => (
            <Text key={index} style={styles.resultText}>
              {result}
            </Text>
          ))}
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
  form: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
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
  signupButton: {
    backgroundColor: '#007AFF',
  },
  signinButton: {
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
    minHeight: 200,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  resultText: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'monospace',
    color: '#666',
  },
});