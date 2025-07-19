import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Trash2, RefreshCw, Users, Database, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import { useAuthStore } from '@/stores/auth-store';
import { supabase } from '@/services/supabase';

export default function ClearUsersAndResetScreen() {
  const [isClearing, setIsClearing] = useState(false);
  const [isCreatingTestUsers, setIsCreatingTestUsers] = useState(false);
  const { logout } = useAuthStore();

  const clearAllUsers = async () => {
    Alert.alert(
      'Clear All Users',
      'This will permanently delete ALL users from the database. This action cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'DELETE ALL',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsClearing(true);
              
              console.log('Starting user cleanup...');
              
              // First logout current user
              await logout();
              
              // Clear dependent tables first
              console.log('Clearing payments...');
              const { error: paymentsError } = await supabase
                .from('payments')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
              
              if (paymentsError) {
                console.warn('Error clearing payments:', paymentsError);
              }
              
              console.log('Clearing deliveries...');
              const { error: deliveriesError } = await supabase
                .from('deliveries')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
              
              if (deliveriesError) {
                console.warn('Error clearing deliveries:', deliveriesError);
              }
              
              console.log('Clearing parcels...');
              const { error: parcelsError } = await supabase
                .from('parcels')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
              
              if (parcelsError) {
                console.warn('Error clearing parcels:', parcelsError);
              }
              
              console.log('Clearing users...');
              const { error: usersError } = await supabase
                .from('users')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
              
              if (usersError) {
                console.warn('Error clearing users:', usersError);
              }
              
              console.log('All users and related data cleared successfully');
              
              Alert.alert(
                'Success',
                'All users and related data have been cleared from the database.',
                [
                  {
                    text: 'OK',
                    onPress: () => router.replace('/auth'),
                  },
                ]
              );
            } catch (error) {
              console.error('Error clearing users:', error);
              Alert.alert(
                'Error',
                'Failed to clear users. Please check the console for details.'
              );
            } finally {
              setIsClearing(false);
            }
          },
        },
      ]
    );
  };

  const createTestUsers = async () => {
    try {
      setIsCreatingTestUsers(true);
      
      const testUsers = [
        {
          email: 'customer@test.com',
          password: 'password123',
          name: 'Test Customer',
          phone: '+254700000001',
          role: 'customer',
        },
        {
          email: 'driver@test.com',
          password: 'password123',
          name: 'Test Driver',
          phone: '+254700000002',
          role: 'driver',
        },
        {
          email: 'admin@test.com',
          password: 'password123',
          name: 'Test Admin',
          phone: '+254700000003',
          role: 'customer', // Admin users are stored as customers in auth
        },
      ];

      let successCount = 0;
      let errors: string[] = [];

      for (const user of testUsers) {
        try {
          console.log(`Creating test user: ${user.email}`);
          
          const { data, error } = await supabase.auth.signUp({
            email: user.email,
            password: user.password,
            options: {
              data: {
                full_name: user.name,
                phone_number: user.phone,
                role: user.role,
              },
            },
          });

          if (error) {
            console.error(`Error creating ${user.email}:`, error);
            errors.push(`${user.email}: ${error.message}`);
          } else if (data.user) {
            console.log(`Successfully created ${user.email}`);
            successCount++;
            
            // Wait a bit for the database trigger to complete
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`Exception creating ${user.email}:`, error);
          errors.push(`${user.email}: ${error}`);
        }
      }

      Alert.alert(
        'Test Users Created',
        `Successfully created ${successCount} test users.\n\n` +
        `You can now login with:\n` +
        `• customer@test.com / password123\n` +
        `• driver@test.com / password123\n` +
        `• admin@test.com / password123\n\n` +
        (errors.length > 0 ? `Errors:\n${errors.join('\n')}` : ''),
        [
          {
            text: 'Go to Login',
            onPress: () => router.replace('/auth'),
          },
        ]
      );
    } catch (error) {
      console.error('Error creating test users:', error);
      Alert.alert('Error', 'Failed to create test users');
    } finally {
      setIsCreatingTestUsers(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Database Management</Text>
        </View>

        {/* Warning */}
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>⚠️ Development Tools</Text>
          <Text style={styles.warningText}>
            These tools are for development and testing purposes only. 
            Use with caution as they will permanently modify the database.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {/* Clear All Users */}
          <TouchableOpacity
            style={[styles.actionButton, styles.dangerButton]}
            onPress={clearAllUsers}
            disabled={isClearing}
          >
            <LinearGradient
              colors={[colors.error, '#DC2626']}
              style={styles.actionButtonGradient}
            >
              <View style={styles.actionButtonContent}>
                {isClearing ? (
                  <ActivityIndicator size="small" color={colors.background} />
                ) : (
                  <Trash2 size={24} color={colors.background} />
                )}
                <View style={styles.actionButtonText}>
                  <Text style={styles.actionButtonTitle}>
                    {isClearing ? 'Clearing...' : 'Clear All Users'}
                  </Text>
                  <Text style={styles.actionButtonSubtitle}>
                    Delete all users and related data
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Create Test Users */}
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={createTestUsers}
            disabled={isCreatingTestUsers}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.actionButtonGradient}
            >
              <View style={styles.actionButtonContent}>
                {isCreatingTestUsers ? (
                  <ActivityIndicator size="small" color={colors.background} />
                ) : (
                  <Users size={24} color={colors.background} />
                )}
                <View style={styles.actionButtonText}>
                  <Text style={styles.actionButtonTitle}>
                    {isCreatingTestUsers ? 'Creating...' : 'Create Test Users'}
                  </Text>
                  <Text style={styles.actionButtonSubtitle}>
                    Create customer, driver, and admin test accounts
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Go to Test Page */}
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => router.push('/test-auth-map')}
          >
            <LinearGradient
              colors={[colors.accent, colors.accentDark]}
              style={styles.actionButtonGradient}
            >
              <View style={styles.actionButtonContent}>
                <Database size={24} color={colors.background} />
                <View style={styles.actionButtonText}>
                  <Text style={styles.actionButtonTitle}>
                    Test Auth & Map
                  </Text>
                  <Text style={styles.actionButtonSubtitle}>
                    Test authentication and map functionality
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Instructions</Text>
          <Text style={styles.instructionsText}>
            1. First, clear all existing users to start fresh{'\n'}
            2. Create new test users with known credentials{'\n'}
            3. Test authentication and map functionality{'\n'}
            4. Use the test page to verify everything works
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  warningCard: {
    backgroundColor: colors.warning + '20',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.warning,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  actionsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dangerButton: {},
  primaryButton: {},
  secondaryButton: {},
  actionButtonGradient: {
    padding: 20,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionButtonText: {
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.background,
    marginBottom: 4,
  },
  actionButtonSubtitle: {
    fontSize: 14,
    color: colors.background + 'CC',
  },
  instructionsCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
});