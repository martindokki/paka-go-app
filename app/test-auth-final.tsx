import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { AuthService } from '@/services/auth-service';

export default function TestAuthFinal() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('Test User');
  const [phoneNumber, setPhoneNumber] = useState('+1234567890');
  const [role, setRole] = useState<'customer' | 'driver'>('customer');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleSignUp = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('Testing signup with:', { email, fullName, role });
      
      const { user, profile, error } = await AuthService.signUp(
        email,
        password,
        fullName,
        phoneNumber,
        role
      );

      if (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setResult(`❌ Signup failed: ${errorMessage}`);
        Alert.alert('Signup Failed', errorMessage);
      } else if (user && profile) {
        setResult(`✅ Signup successful!\nUser ID: ${user.id}\nProfile: ${JSON.stringify(profile, null, 2)}`);
        Alert.alert('Success', 'Account created successfully!');
      } else {
        setResult('❌ Unexpected result: No user or profile returned');
      }
    } catch (error: any) {
      console.error('Signup test error:', error);
      setResult(`❌ Exception: ${error.message || error}`);
      Alert.alert('Error', error.message || String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('Testing signin with:', { email });
      
      const result = await AuthService.signIn(email, password);

      if (result.error) {
        const errorMessage = result.error instanceof Error ? result.error.message : String(result.error);
        setResult(`❌ Signin failed: ${errorMessage}`);
        Alert.alert('Signin Failed', errorMessage);
      } else if (result.user) {
        // Get current user profile
        const profileResult = await AuthService.getCurrentUser();
        
        if (profileResult.error) {
          const errorMessage = profileResult.error instanceof Error ? profileResult.error.message : String(profileResult.error);
          setResult(`✅ Signin successful but profile error: ${errorMessage}\nUser: ${JSON.stringify(user, null, 2)}`);
        } else {
          setResult(`✅ Signin successful!\nUser ID: ${user.id}\nProfile: ${JSON.stringify(profile, null, 2)}`);
        }
        Alert.alert('Success', 'Signed in successfully!');
      } else {
        setResult('❌ Unexpected result: No user returned');
      }
    } catch (error: any) {
      console.error('Signin test error:', error);
      setResult(`❌ Exception: ${error.message || error}`);
      Alert.alert('Error', error.message || String(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGetCurrentUser = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const { user, profile, error } = await AuthService.getCurrentUser();

      if (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setResult(`❌ Get current user failed: ${errorMessage}`);
      } else if (user && profile) {
        setResult(`✅ Current user retrieved!\nUser ID: ${user.id}\nProfile: ${JSON.stringify(profile, null, 2)}`);
      } else {
        setResult('ℹ️ No current user found');
      }
    } catch (error: any) {
      console.error('Get current user error:', error);
      setResult(`❌ Exception: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const { error } = await AuthService.signOut();

      if (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setResult(`❌ Signout failed: ${errorMessage}`);
      } else {
        setResult('✅ Signed out successfully!');
        Alert.alert('Success', 'Signed out successfully!');
      }
    } catch (error: any) {
      console.error('Signout error:', error);
      setResult(`❌ Exception: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Auth Test - Final Fix' }} />
      
      <Text style={styles.title}>Authentication Test</Text>
      
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
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </Text>
        </Pressable>
        
        <Pressable
          style={[styles.button, styles.signinButton, loading && styles.buttonDisabled]}
          onPress={handleSignIn}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Text>
        </Pressable>
        
        <Pressable
          style={[styles.button, styles.getCurrentButton, loading && styles.buttonDisabled]}
          onPress={handleGetCurrentUser}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Loading...' : 'Get Current User'}
          </Text>
        </Pressable>
        
        <Pressable
          style={[styles.button, styles.signoutButton, loading && styles.buttonDisabled]}
          onPress={handleSignOut}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Signing Out...' : 'Sign Out'}
          </Text>
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
    marginBottom: 30,
    color: '#333',
  },
  form: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
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
    gap: 10,
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
    color: 'white',
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
  getCurrentButton: {
    backgroundColor: '#FF9500',
  },
  signoutButton: {
    backgroundColor: '#FF3B30',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  resultText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
    lineHeight: 20,
  },
});