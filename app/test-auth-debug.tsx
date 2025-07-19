import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { AuthService } from '@/services/auth-service';
import { supabase } from '@/services/supabase';

export default function TestAuthDebug() {
  const [email, setEmail] = useState('client@test.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Test Client');
  const [phone, setPhone] = useState('+254700000001');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const testSignUp = async () => {
    setLoading(true);
    setResult('Creating test user...');
    
    try {
      // First, try to sign up the user
      const { user, profile, error } = await AuthService.signUp(
        email,
        password,
        name,
        phone,
        'customer'
      );
      
      if (error) {
        setResult(`SignUp Error: ${error.message}`);
      } else {
        setResult(`SignUp Success: User ${user?.id} created with profile ${profile?.full_name}`);
      }
    } catch (error: any) {
      setResult(`SignUp Exception: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSignIn = async () => {
    setLoading(true);
    setResult('Testing sign in...');
    
    try {
      const { user, error } = await AuthService.signIn(email, password);
      
      if (error) {
        setResult(`SignIn Error: ${error.message}`);
      } else {
        setResult(`SignIn Success: User ${user?.id} (${user?.email})`);
      }
    } catch (error: any) {
      setResult(`SignIn Exception: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testDirectSupabase = async () => {
    setLoading(true);
    setResult('Testing direct Supabase auth...');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setResult(`Direct Supabase Error: ${error.message}`);
      } else {
        setResult(`Direct Supabase Success: ${data.user?.email}`);
      }
    } catch (error: any) {
      setResult(`Direct Supabase Exception: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkSession = async () => {
    setLoading(true);
    setResult('Checking current session...');
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        setResult(`Session Error: ${error.message}`);
      } else if (session) {
        setResult(`Session Found: ${session.user.email} (expires: ${new Date(session.expires_at! * 1000).toLocaleString()})`);
      } else {
        setResult('No active session found');
      }
    } catch (error: any) {
      setResult(`Session Exception: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setResult('Signing out...');
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setResult(`SignOut Error: ${error.message}`);
      } else {
        setResult('SignOut Success');
      }
    } catch (error: any) {
      setResult(`SignOut Exception: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Auth Debug' }} />
      
      <Text style={styles.title}>Authentication Debug</Text>
      
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
        
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Phone"
          value={phone}
          onChangeText={setPhone}
        />
      </View>
      
      <View style={styles.buttons}>
        <TouchableOpacity 
          style={[styles.button, styles.signUpButton]} 
          onPress={testSignUp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Sign Up</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.signInButton]} 
          onPress={testSignIn}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Sign In</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.directButton]} 
          onPress={testDirectSupabase}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Direct Supabase</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.sessionButton]} 
          onPress={checkSession}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Check Session</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.signOutButton]} 
          onPress={signOut}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.result}>
        <Text style={styles.resultTitle}>Result:</Text>
        <Text style={styles.resultText}>{result || 'No test run yet'}</Text>
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
  buttons: {
    gap: 10,
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  signUpButton: {
    backgroundColor: '#4CAF50',
  },
  signInButton: {
    backgroundColor: '#2196F3',
  },
  directButton: {
    backgroundColor: '#FF9800',
  },
  sessionButton: {
    backgroundColor: '#9C27B0',
  },
  signOutButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  result: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 14,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
});