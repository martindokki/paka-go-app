import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '@/constants/colors';
import { Driver } from '@/stores/local-data-store';

interface DriversManagementProps {
  drivers: Driver[];
}

export function DriversManagement({ drivers }: DriversManagementProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Drivers Management</Text>
      <Text style={styles.subtitle}>
        Managing {drivers.length} drivers
      </Text>
      <Text style={styles.description}>
        Driver management features coming soon...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.primary,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
  },
});