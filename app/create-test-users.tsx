import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, User, Truck, Shield, CheckCircle, XCircle } from 'lucide-react-native';
import colors from '@/constants/colors';
import { AuthService } from '@/services/auth-service';

interface TestUser {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  role: 'customer' | 'driver' | 'admin';
}

const testUsers: TestUser[] = [
  {
    email: 'client@test.com',
    password: 'password123',
    fullName: 'Test Client',
    phoneNumber: '+254700000001',
    role: 'customer',
  },
  {
    email: 'driver@test.com',
    password: 'password123',
    fullName: 'Test Driver',
    phoneNumber: '+254700000002',
    role: 'driver',
  },
  {
    email: 'admin@test.com',
    password: 'password123',
    fullName: 'Test Admin',
    phoneNumber: '+254700000003',
    role: 'admin',
  },
];

export default function CreateTestUsersScreen() {
  const [creationStatus, setCreationStatus] = useState<{[key: string]: 'idle' | 'creating' | 'success' | 'error'}>({});
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const createTestUser = async (user: TestUser) => {
    const key = user.email;
    setCreationStatus(prev => ({ ...prev, [key]: 'creating' }));
    setErrors(prev => ({ ...prev, [key]: '' }));

    try {
      const result = await AuthService.signUp(
        user.email,
        user.password,
        user.fullName,
        user.phoneNumber,
        user.role === 'admin' ? 'customer' : user.role
      );

      if (result.error) {
        throw result.error;
      }

      setCreationStatus(prev => ({ ...prev, [key]: 'success' }));
      console.log(`✅ Created test user: ${user.email}`);
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      setCreationStatus(prev => ({ ...prev, [key]: 'error' }));
      setErrors(prev => ({ ...prev, [key]: errorMessage }));
      console.error(`❌ Failed to create test user ${user.email}:`, errorMessage);
    }
  };

  const createAllTestUsers = async () => {
    Alert.alert(
      'Create All Test Users',
      'This will create all test users. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create All',
          onPress: async () => {
            for (const user of testUsers) {
              await createTestUser(user);
              // Small delay between creations
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          },
        },
      ]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={20} color={colors.success} />;
      case 'error':
        return <XCircle size={20} color={colors.error} />;
      case 'creating':
        return <Text style={styles.loadingText}>⏳</Text>;
      default:
        return null;
    }
  };

  const getUserIcon = (role: string) => {
    switch (role) {
      case 'customer':
        return <User size={24} color={colors.primary} />;
      case 'driver':
        return <Truck size={24} color={colors.warning} />;
      case 'admin':
        return <Shield size={24} color={colors.accent} />;
      default:
        return <User size={24} color={colors.textMuted} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Create Test Users</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🧪 Development Test Users</Text>
          <Text style={styles.infoText}>
            Create test accounts for development and testing purposes. These accounts will be created in your Supabase database.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.createAllButton}
          onPress={createAllTestUsers}
        >
          <Text style={styles.createAllButtonText}>Create All Test Users</Text>
        </TouchableOpacity>

        <View style={styles.usersList}>
          {testUsers.map((user) => {
            const status = creationStatus[user.email] || 'idle';
            const error = errors[user.email];

            return (
              <View key={user.email} style={styles.userCard}>
                <View style={styles.userHeader}>
                  <View style={styles.userInfo}>
                    {getUserIcon(user.role)}
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{user.fullName}</Text>
                      <Text style={styles.userEmail}>{user.email}</Text>
                      <Text style={styles.userRole}>{user.role.toUpperCase()}</Text>
                    </View>
                  </View>
                  <View style={styles.statusContainer}>
                    {getStatusIcon(status)}
                  </View>
                </View>

                {error && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.createButton,
                    status === 'creating' && styles.createButtonLoading,
                    status === 'success' && styles.createButtonSuccess,
                  ]}
                  onPress={() => createTestUser(user)}
                  disabled={status === 'creating'}
                >
                  <Text style={[
                    styles.createButtonText,
                    status === 'success' && styles.createButtonTextSuccess,
                  ]}>
                    {status === 'creating' ? 'Creating...' : 
                     status === 'success' ? 'Created ✓' : 'Create User'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <View style={styles.credentialsCard}>
          <Text style={styles.credentialsTitle}>📋 Test Credentials</Text>
          <Text style={styles.credentialsText}>
            All test users use the password: <Text style={styles.password}>password123</Text>
          </Text>
          <View style={styles.credentialsList}>
            <Text style={styles.credential}>👤 Client: client@test.com</Text>
            <Text style={styles.credential}>🚗 Driver: driver@test.com</Text>
            <Text style={styles.credential}>🛡️ Admin: admin@test.com</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    backgroundColor: colors.primaryLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  createAllButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  createAllButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
  usersList: {
    gap: 16,
  },
  userCard: {
    backgroundColor: colors.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  userRole: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 4,
  },
  statusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 20,
  },
  errorContainer: {
    backgroundColor: colors.error + '20',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonLoading: {
    backgroundColor: colors.textMuted,
  },
  createButtonSuccess: {
    backgroundColor: colors.success,
  },
  createButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  createButtonTextSuccess: {
    color: colors.background,
  },
  credentialsCard: {
    backgroundColor: colors.backgroundTertiary,
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  credentialsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  credentialsText: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 12,
  },
  password: {
    fontFamily: 'monospace',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    color: colors.primary,
    fontWeight: '600',
  },
  credentialsList: {
    gap: 8,
  },
  credential: {
    fontSize: 14,
    color: colors.text,
    fontFamily: 'monospace',
  },
});