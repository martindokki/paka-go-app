import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { useAuthStore } from '@/stores/auth-store';

export default function TestSimpleAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, register, isLoading, error, user, isAuthenticated } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    const success = await login({
      email,
      password,
      userType: 'customer',
    });

    if (success) {
      Alert.alert('Success', 'Login successful!');
    } else {
      Alert.alert('Error', error || 'Login failed');
    }
  };

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    const success = await register({
      email,
      password,
      name: 'Test User',
      phone: '+254700000000',
      userType: 'customer',
    });

    if (success) {
      Alert.alert('Success', 'Registration successful!');
    } else {
      Alert.alert('Error', error || 'Registration failed');
    }
  };

  const handleLogout = async () => {
    const { logout } = useAuthStore.getState();
    await logout();
    Alert.alert('Success', 'Logged out successfully');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Simple Auth Test' }} />
      
      <Text style={styles.title}>Simple Auth Test</Text>
      
      {isAuthenticated && user ? (
        <View style={styles.userInfo}>
          <Text style={styles.userText}>Logged in as: {user.name}</Text>
          <Text style={styles.userText}>Email: {user.email}</Text>
          <Text style={styles.userText}>Type: {user.userType}</Text>
          
          <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          {error && (
            <Text style={styles.error}>{error}</Text>
          )}
          
          <TouchableOpacity 
            style={[styles.button, styles.loginButton]} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.registerButton]} 
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Registering...' : 'Register'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.testCredentials}>
        <Text style={styles.testTitle}>Test Credentials:</Text>
        <TouchableOpacity onPress={() => { setEmail('client@test.com'); setPassword('password123'); }}>
          <Text style={styles.testCred}>client@test.com / password123</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setEmail('driver@test.com'); setPassword('password123'); }}>
          <Text style={styles.testCred}>driver@test.com / password123</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={[styles.button, styles.createUsersButton]} 
        onPress={() => router.push('/create-test-users-auth')}
      >
        <Text style={styles.buttonText}>Create Test Users</Text>
      </TouchableOpacity>
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
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: '#2196F3',
  },
  registerButton: {
    backgroundColor: '#4CAF50',
  },
  logoutButton: {
    backgroundColor: '#F44336',
  },
  createUsersButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: '#F44336',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  userInfo: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  userText: {
    fontSize: 16,
    marginBottom: 5,
  },
  testCredentials: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  testCred: {
    fontSize: 14,
    color: '#2196F3',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
});