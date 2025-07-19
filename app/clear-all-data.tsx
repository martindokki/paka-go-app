import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/auth-store';
import colors from '@/constants/colors';

export default function ClearAllData() {
  const [isClearing, setIsClearing] = useState(false);
  const { logout } = useAuthStore();

  const clearAllData = async () => {
    Alert.alert(
      'Clear All Data',
      'This will delete ALL users and data from the database. This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: async () => {
            setIsClearing(true);
            try {
              // First logout current user
              await logout();
              
              // Clear all users from the database
              const { error: deleteError } = await supabase
                .from('users')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all except a dummy row
              
              if (deleteError) {
                console.error('Error clearing users:', deleteError);
                Alert.alert('Error', 'Failed to clear users: ' + deleteError.message);
                return;
              }

              // Clear auth users (this might not work due to RLS, but we'll try)
              try {
                const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();
                if (!listError && authUsers?.users) {
                  for (const user of authUsers.users) {
                    await supabase.auth.admin.deleteUser(user.id);
                  }
                }
              } catch (authError) {
                console.warn('Could not clear auth users (expected in client):', authError);
              }

              Alert.alert(
                'Success',
                'All data has been cleared successfully. You can now create fresh test users.',
                [
                  {
                    text: 'Go to Auth',
                    onPress: () => router.replace('/auth')
                  }
                ]
              );
            } catch (error) {
              console.error('Clear data error:', error);
              Alert.alert('Error', 'Failed to clear data: ' + String(error));
            } finally {
              setIsClearing(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Clear All Data' }} />
      
      <View style={styles.content}>
        <Text style={styles.title}>⚠️ Danger Zone</Text>
        <Text style={styles.description}>
          This will permanently delete all users and data from the database.
          Use this to start fresh with clean test data.
        </Text>
        
        <TouchableOpacity 
          style={[styles.button, styles.dangerButton]} 
          onPress={clearAllData}
          disabled={isClearing}
        >
          {isClearing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Clear All Data</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]} 
          onPress={() => router.back()}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.error,
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  dangerButton: {
    backgroundColor: colors.error,
  },
  cancelButton: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});