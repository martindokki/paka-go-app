import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { BackendStatus } from '@/components/BackendStatus';
import colors from '@/constants/colors';

export default function Welcome() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>PAKA Go</Text>
        <Text style={styles.subtitle}>Fast & Reliable Delivery Service</Text>
        
        <BackendStatus showDetails={true} />
        
        <View style={styles.buttonContainer}>
          <Pressable style={styles.primaryButton} onPress={() => router.push('/auth')}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
          </Pressable>
          
          <Pressable style={styles.secondaryButton} onPress={() => router.push('/debug-connection')}>
            <Text style={styles.secondaryButtonText}>Debug Connection</Text>
          </Pressable>
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>Quick Access</Text>
          <Pressable style={styles.linkButton} onPress={() => router.push('/auth')}>
            <Text style={styles.linkText}>• Login / Register</Text>
          </Pressable>
          <Pressable style={styles.linkButton} onPress={() => router.push('/tracking')}>
            <Text style={styles.linkText}>• Track Order</Text>
          </Pressable>
          <Pressable style={styles.linkButton} onPress={() => router.push('/debug-connection')}>
            <Text style={styles.linkText}>• Connection Status</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#6c757d',
    marginBottom: 40,
  },
  buttonContainer: {
    marginVertical: 30,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoContainer: {
    marginTop: 40,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  linkButton: {
    paddingVertical: 8,
  },
  linkText: {
    fontSize: 16,
    color: colors.primary,
  },
});