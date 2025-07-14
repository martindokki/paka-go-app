import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import { trpc, pingBackend, testTrpcConnection } from '@/lib/trpc';

export default function SimpleTestPage() {
  const [result, setResult] = useState<string>('Not tested');
  const [loading, setLoading] = useState(false);

  // Use the tRPC hook
  const hiQuery = trpc.example.hi.useQuery(undefined, {
    enabled: false, // Don't auto-run
    onSuccess: (data) => {
      console.log('tRPC query success:', data);
      setResult(`Success: ${JSON.stringify(data)}`);
    },
    onError: (error) => {
      console.error('tRPC query error:', error);
      setResult(`Error: ${error.message}`);
    }
  });

  const testConnection = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      await hiQuery.refetch();
    } catch (error) {
      console.error('Test error:', error);
      setResult(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testPing = async () => {
    setLoading(true);
    setResult('Pinging backend...');
    
    try {
      const result = await pingBackend();
      if (result.success) {
        setResult(`Ping success: ${JSON.stringify(result.data)}`);
      } else {
        setResult(`Ping failed: ${result.error}`);
      }
    } catch (error) {
      setResult(`Ping error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testTrpcDirect = async () => {
    setLoading(true);
    setResult('Testing tRPC directly...');
    
    try {
      const result = await testTrpcConnection();
      if (result.success) {
        setResult(`tRPC success: ${JSON.stringify(result.data)}`);
      } else {
        setResult(`tRPC failed: ${result.error}`);
      }
    } catch (error) {
      setResult(`tRPC error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Simple tRPC Test' }} />
      
      <View style={styles.content}>
        <Text style={styles.title}>Simple tRPC Test</Text>
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={testPing}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Testing...' : 'Test Ping'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={testTrpcDirect}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Testing...' : 'Test tRPC Direct'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={testConnection}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Testing...' : 'Test tRPC Hook'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>Result:</Text>
          <Text style={styles.resultText}>{result}</Text>
        </View>
        
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Query Status:</Text>
          <Text style={styles.statusText}>
            Loading: {hiQuery.isLoading ? 'Yes' : 'No'}{'\n'}
            Error: {hiQuery.error ? hiQuery.error.message : 'None'}{'\n'}
            Data: {hiQuery.data ? 'Present' : 'None'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
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
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  resultText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
});