import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { supabase } from '@/services/supabase';

export default function TestSupabaseScreen() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('Test User');
  const [phone, setPhone] = useState('+1234567890');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConnection = async () => {
    setLoading(true);
    addResult('Testing Supabase connection...');
    
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      if (error) {
        addResult(`❌ Connection failed: ${error.message}`);
      } else {
        addResult('✅ Connection successful');
      }
    } catch (error: any) {
      addResult(`❌ Connection error: ${error.message}`);
    }
    
    setLoading(false);
  };

  const testRegistration = async () => {
    setLoading(true);
    addResult('Testing user registration...');
    
    try {
      // First, sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        addResult(`❌ Auth signup failed: ${authError.message}`);
        setLoading(false);
        return;
      }

      addResult('✅ Auth user created');

      if (authData.user) {
        // Wait for trigger to potentially create user
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check if user exists in public.users
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (existingUser) {
          addResult('✅ User found in public.users table (trigger worked)');
          
          // Update the user
          const { error: updateError } = await supabase
            .from('users')
            .update({
              full_name: fullName,
              phone_number: phone,
              role: 'customer',
            })
            .eq('id', authData.user.id);

          if (updateError) {
            addResult(`❌ User update failed: ${updateError.message}`);
          } else {
            addResult('✅ User updated successfully');
          }
        } else {
          addResult('⚠️ User not found in public.users, creating manually...');
          
          // Insert user manually
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              full_name: fullName,
              email: email,
              phone_number: phone,
              role: 'customer',
            });

          if (insertError) {
            addResult(`❌ Manual user creation failed: ${insertError.message}`);
          } else {
            addResult('✅ User created manually');
          }
        }
      }
    } catch (error: any) {
      addResult(`❌ Registration test failed: ${error.message}`);
    }
    
    setLoading(false);
  };

  const testLogin = async () => {
    setLoading(true);
    addResult('Testing user login...');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        addResult(`❌ Login failed: ${error.message}`);
      } else {
        addResult('✅ Login successful');
        
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          addResult(`❌ Profile fetch failed: ${profileError.message}`);
        } else {
          addResult(`✅ Profile fetched: ${profile.full_name} (${profile.role})`);
        }
      }
    } catch (error: any) {
      addResult(`❌ Login test failed: ${error.message}`);
    }
    
    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Test Supabase' }} />
      
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Supabase Connection Test</Text>
        
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
          
          <Text style={styles.label}>Phone:</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter phone number"
          />
        </View>

        <View style={styles.buttons}>
          <Pressable 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={testConnection}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Test Connection</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={testRegistration}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Test Registration</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={testLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Test Login</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.button, styles.clearButton]} 
            onPress={clearResults}
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
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  buttons: {
    gap: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
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
    padding: 15,
    borderRadius: 8,
    minHeight: 200,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 14,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
});