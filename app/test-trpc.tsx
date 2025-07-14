import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { trpcClient, checkBackendHealth, testTrpcConnection } from '@/lib/trpc';

export default function TestTrpcPage() {
  const [healthStatus, setHealthStatus] = useState<string>('Checking...');
  const [trpcStatus, setTrpcStatus] = useState<string>('Not tested');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  };

  const testHealth = async () => {
    addLog('Testing backend health...');
    setHealthStatus('Testing...');
    
    try {
      const isHealthy = await checkBackendHealth();
      const status = isHealthy ? '✅ Healthy' : '❌ Unhealthy';
      setHealthStatus(status);
      addLog(`Health check result: ${status}`);
    } catch (error) {
      const errorMsg = `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setHealthStatus(errorMsg);
      addLog(`Health check error: ${errorMsg}`);
    }
  };

  const testTrpc = async () => {
    addLog('Testing tRPC connection...');
    setTrpcStatus('Testing...');
    
    try {
      const result = await testTrpcConnection();
      if (result.success) {
        const status = `✅ Success: ${JSON.stringify(result.data)}`;
        setTrpcStatus(status);
        addLog(`tRPC test success: ${JSON.stringify(result.data)}`);
      } else {
        const status = `❌ Failed: ${result.error}`;
        setTrpcStatus(status);
        addLog(`tRPC test failed: ${result.error}`);
      }
    } catch (error) {
      const errorMsg = `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setTrpcStatus(errorMsg);
      addLog(`tRPC test error: ${errorMsg}`);
    }
  };

  const testDirectTrpc = async () => {
    addLog('Testing direct tRPC call...');
    
    try {
      const result = await trpcClient.example.hi.query();
      addLog(`Direct tRPC success: ${JSON.stringify(result)}`);
    } catch (error) {
      addLog(`Direct tRPC error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testPing = async () => {
    addLog('Testing ping endpoint...');
    
    try {
      const baseUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 
        (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8081');
      
      const response = await fetch(`${baseUrl}/api/ping`);
      const data = await response.json();
      addLog(`Ping success: ${JSON.stringify(data)}`);
    } catch (error) {
      addLog(`Ping error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testDebug = async () => {
    addLog('Testing debug endpoint...');
    
    try {
      const baseUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 
        (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8081');
      
      const response = await fetch(`${baseUrl}/api/debug`);
      const data = await response.json();
      addLog(`Debug success: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      addLog(`Debug error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    testHealth();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'tRPC Test' }} />
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backend Health</Text>
          <Text style={styles.status}>{healthStatus}</Text>
          <TouchableOpacity style={styles.button} onPress={testHealth}>
            <Text style={styles.buttonText}>Test Health</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>tRPC Connection</Text>
          <Text style={styles.status}>{trpcStatus}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={testTrpc}>
              <Text style={styles.buttonText}>Test tRPC</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={testDirectTrpc}>
              <Text style={styles.buttonText}>Direct Call</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Endpoints</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={testPing}>
              <Text style={styles.buttonText}>Ping</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={testDebug}>
              <Text style={styles.buttonText}>Debug</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Logs</Text>
          <ScrollView style={styles.logsContainer}>
            {logs.map((log, index) => (
              <Text key={index} style={styles.logText}>{log}</Text>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
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
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  status: {
    fontSize: 14,
    marginBottom: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  logsContainer: {
    maxHeight: 200,
    backgroundColor: '#f8f8f8',
    padding: 8,
    borderRadius: 8,
  },
  logText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
    marginBottom: 2,
  },
});