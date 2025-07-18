import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { testBackendConnection, checkBackendHealth, testTrpcConnection, pingBackend } from '@/lib/trpc';
import { Platform } from 'react-native';

export default function DebugConnection() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test: string, result: any) => {
    setResults(prev => [...prev, { test, result, timestamp: new Date().toISOString() }]);
  };

  const runTests = async () => {
    setLoading(true);
    setResults([]);

    // Test 1: Basic backend connection
    try {
      const backendTest = await testBackendConnection();
      addResult('Backend Connection', backendTest);
    } catch (error) {
      addResult('Backend Connection', { success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }

    // Test 2: Health check
    try {
      const healthTest = await checkBackendHealth();
      addResult('Health Check', { success: healthTest, message: healthTest ? 'Healthy' : 'Unhealthy' });
    } catch (error) {
      addResult('Health Check', { success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }

    // Test 3: Ping
    try {
      const pingTest = await pingBackend();
      addResult('Ping Test', pingTest);
    } catch (error) {
      addResult('Ping Test', { success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }

    // Test 4: tRPC connection
    try {
      const trpcTest = await testTrpcConnection();
      addResult('tRPC Test', trpcTest);
    } catch (error) {
      addResult('tRPC Test', { success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }

    setLoading(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Connection Debug</Text>
      <Text style={styles.subtitle}>Platform: {Platform.OS}</Text>
      
      <Pressable style={styles.button} onPress={runTests} disabled={loading}>
        <Text style={styles.buttonText}>
          {loading ? 'Running Tests...' : 'Run Tests Again'}
        </Text>
      </Pressable>

      {results.map((result, index) => (
        <View key={index} style={styles.resultContainer}>
          <Text style={styles.testName}>{result.test}</Text>
          <Text style={styles.timestamp}>{new Date(result.timestamp).toLocaleTimeString()}</Text>
          <View style={[styles.resultBox, result.result.success ? styles.success : styles.error]}>
            <Text style={styles.resultText}>
              {JSON.stringify(result.result, null, 2)}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    marginBottom: 20,
  },
  testName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  resultBox: {
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
  },
  success: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
  },
  error: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
  },
  resultText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
  },
});