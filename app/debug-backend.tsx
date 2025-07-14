import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { checkBackendHealth, testTrpcConnection } from '@/lib/trpc';
import colors from '@/constants/colors';

export default function DebugBackendScreen() {
  const [healthStatus, setHealthStatus] = useState<boolean | null>(null);
  const [trpcStatus, setTrpcStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testBackendHealth = async () => {
    setIsLoading(true);
    addLog('Testing backend health...');
    
    try {
      const isHealthy = await checkBackendHealth();
      setHealthStatus(isHealthy);
      addLog(`Backend health: ${isHealthy ? 'OK' : 'FAILED'}`);
    } catch (error) {
      addLog(`Backend health error: ${error}`);
      setHealthStatus(false);
    }
    
    setIsLoading(false);
  };

  const testTrpc = async () => {
    setIsLoading(true);
    addLog('Testing tRPC connection...');
    
    try {
      const result = await testTrpcConnection();
      setTrpcStatus(result);
      addLog(`tRPC test: ${result.success ? 'SUCCESS' : 'FAILED'}`);
      if (result.success) {
        addLog(`tRPC data: ${JSON.stringify(result.data)}`);
      } else {
        addLog(`tRPC error: ${result.error}`);
      }
    } catch (error) {
      addLog(`tRPC test error: ${error}`);
      setTrpcStatus({ success: false, error });
    }
    
    setIsLoading(false);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  useEffect(() => {
    addLog('Debug screen loaded');
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Backend Debug</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backend Health</Text>
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={testBackendHealth}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Test Backend Health</Text>
          </TouchableOpacity>
          <Text style={[
            styles.status,
            healthStatus === true && styles.statusSuccess,
            healthStatus === false && styles.statusError
          ]}>
            Status: {healthStatus === null ? 'Not tested' : healthStatus ? 'Healthy' : 'Failed'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>tRPC Connection</Text>
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={testTrpc}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Test tRPC</Text>
          </TouchableOpacity>
          <Text style={[
            styles.status,
            trpcStatus?.success === true && styles.statusSuccess,
            trpcStatus?.success === false && styles.statusError
          ]}>
            Status: {trpcStatus === null ? 'Not tested' : trpcStatus.success ? 'Connected' : 'Failed'}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.logHeader}>
            <Text style={styles.sectionTitle}>Logs</Text>
            <TouchableOpacity style={styles.clearButton} onPress={clearLogs}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.logContainer}>
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
    backgroundColor: colors.backgroundSecondary,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.background,
    fontWeight: '600',
    fontSize: 16,
  },
  status: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  statusSuccess: {
    color: colors.success || '#10B981',
  },
  statusError: {
    color: colors.error || '#EF4444',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearButtonText: {
    color: colors.background,
    fontSize: 12,
    fontWeight: '600',
  },
  logContainer: {
    backgroundColor: colors.backgroundSecondary,
    padding: 12,
    borderRadius: 8,
    maxHeight: 200,
  },
  logText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
});