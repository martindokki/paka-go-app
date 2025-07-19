import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { AuthService } from '@/services/auth-service';

export default function TestAuthFix() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('Test User');
  const [phoneNumber, setPhoneNumber] = useState('+254700000000');
  const [role, setRole] = useState<'customer' | 'driver'>('customer');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const testSignUp = async () => {
    setLoading(true);
    setResult('Testing signup...');
    
    try {
      const response = await AuthService.signUp(email, password, fullName, phoneNumber, role);
      
      if (response.error) {
        setResult(`❌ Signup failed: ${response.error.message || response.error}`);
      } else if (response.user && response.profile) {
        setResult(`✅ Signup successful!\nUser ID: ${response.user.id}\nProfile: ${JSON.stringify(response.profile, null, 2)}`);
      } else {
        setResult('❌ Unexpected response from signup');
      }
    } catch (error: any) {
      setResult(`❌ Signup error: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const testSignIn = async () => {
    setLoading(true);
    setResult('Testing signin...');
    
    try {
      const response = await AuthService.signIn(email, password);
      
      if (response.error) {
        setResult(`❌ Signin failed: ${response.error.message || response.error}`);
      } else if (response.user) {
        setResult(`✅ Signin successful!\nUser ID: ${response.user.id}\nEmail: ${response.user.email}`);
      } else {
        setResult('❌ Unexpected response from signin');
      }
    } catch (error: any) {
      setResult(`❌ Signin error: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetCurrentUser = async () => {
    setLoading(true);
    setResult('Testing get current user...');
    
    try {
      const response = await AuthService.getCurrentUser();
      
      if (response.error) {
        setResult(`❌ Get user failed: ${response.error.message || response.error}`);
      } else if (response.user && response.profile) {
        setResult(`✅ Get user successful!\nUser: ${response.user.email}\nProfile: ${JSON.stringify(response.profile, null, 2)}`);
      } else {
        setResult('❌ No user found or not authenticated');
      }
    } catch (error: any) {
      setResult(`❌ Get user error: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResult = () => {
    setResult('');
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Test Auth Fix' }} />
      
      <Text style={styles.title}>Auth Service Test</Text>
      <Text style={styles.subtitle}>Test the fixed authentication system</Text>

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

        <Text style={styles.label}>Role:</Text>
        <View style={styles.roleContainer}>
          <Pressable
            style={[styles.roleButton, role === 'customer' && styles.roleButtonActive]}
            onPress={() => setRole('customer')}
          >
            <Text style={[styles.roleButtonText, role === 'customer' && styles.roleButtonTextActive]}>
              Customer
            </Text>
          </Pressable>
          <Pressable
            style={[styles.roleButton, role === 'driver' && styles.roleButtonActive]}
            onPress={() => setRole('driver')}
          >
            <Text style={[styles.roleButtonText, role === 'driver' && styles.roleButtonTextActive]}>
              Driver
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.button, styles.signupButton, loading && styles.buttonDisabled]}
          onPress={testSignUp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Sign Up</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.signinButton, loading && styles.buttonDisabled]}
          onPress={testSignIn}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Sign In</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.getUserButton, loading && styles.buttonDisabled]}
          onPress={testGetCurrentUser}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Get User</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.clearButton]}
          onPress={clearResult}
        >
          <Text style={styles.buttonText}>Clear Result</Text>
        </Pressable>
      </View>

      {result ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Result:</Text>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  roleButtonText: {
    fontSize: 16,
    color: '#333',
  },
  roleButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 20,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  signupButton: {
    backgroundColor: '#34C759',
  },
  signinButton: {
    backgroundColor: '#007AFF',
  },
  getUserButton: {
    backgroundColor: '#FF9500',
  },
  clearButton: {
    backgroundColor: '#8E8E93',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  resultText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#333',
    lineHeight: 20,
  },
});