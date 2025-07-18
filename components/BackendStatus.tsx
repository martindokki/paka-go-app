import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTrpcWithFallback } from '@/hooks/useTrpcWithFallback';

interface BackendStatusProps {
  showDetails?: boolean;
}

export function BackendStatus({ showDetails = false }: BackendStatusProps) {
  const { isBackendAvailable, isChecking, checkBackend } = useTrpcWithFallback();

  if (isBackendAvailable === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.checkingText}>Checking backend connection...</Text>
      </View>
    );
  }

  if (isBackendAvailable) {
    return showDetails ? (
      <View style={[styles.container, styles.success]}>
        <Text style={styles.successText}>✅ Backend Connected</Text>
      </View>
    ) : null;
  }

  return (
    <View style={[styles.container, styles.error]}>
      <Text style={styles.errorText}>❌ Backend Unavailable</Text>
      {showDetails && (
        <>
          <Text style={styles.detailText}>
            The backend server is not responding. Some features may not work.
          </Text>
          <Pressable 
            style={styles.retryButton} 
            onPress={checkBackend}
            disabled={isChecking}
          >
            <Text style={styles.retryButtonText}>
              {isChecking ? 'Checking...' : 'Retry Connection'}
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  success: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
  },
  error: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
  },
  checkingText: {
    color: '#6c757d',
    fontSize: 14,
    textAlign: 'center',
  },
  successText: {
    color: '#155724',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  detailText: {
    color: '#721c24',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
});