import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/auth-store';
import { AuthService } from '@/services/auth-service';
import colors from '@/constants/colors';

export default function TestProfileUpdate() {
  const { user } = useAuthStore();
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const testDatabaseConnection = async () => {
    setIsLoading(true);
    setTestResult('Testing database connection...\n');
    
    try {
      if (!user) {
        setTestResult(prev => prev + 'ERROR: No user logged in\n');
        return;
      }

      // Test 1: Check current user profile
      setTestResult(prev => prev + 'Test 1: Getting current user profile...\n');
      const { user: authUser, profile, error: getUserError } = await AuthService.getCurrentUser();
      
      if (getUserError) {
        setTestResult(prev => prev + `ERROR: Failed to get user profile: ${getUserError instanceof Error ? getUserError.message : JSON.stringify(getUserError)}\n`);
        return;
      }
      
      if (!profile) {
        setTestResult(prev => prev + 'ERROR: No profile returned\n');
        return;
      }
      
      setTestResult(prev => prev + `SUCCESS: Profile retrieved\n`);
      setTestResult(prev => prev + `- ID: ${profile.id}\n`);
      setTestResult(prev => prev + `- Name: ${profile.full_name}\n`);
      setTestResult(prev => prev + `- Email: ${profile.email}\n`);
      setTestResult(prev => prev + `- Phone: ${profile.phone_number}\n`);
      setTestResult(prev => prev + `- Created: ${profile.created_at}\n`);
      setTestResult(prev => prev + `- Updated: ${profile.updated_at}\n\n`);

      // Test 2: Update profile
      setTestResult(prev => prev + 'Test 2: Updating profile...\n');
      const updateData = {
        full_name: formData.name,
        email: formData.email,
        phone_number: formData.phone,
      };
      
      const { data: updateResult, error: updateError } = await AuthService.updateProfile(user.id, updateData);
      
      if (updateError) {
        setTestResult(prev => prev + `ERROR: Profile update failed: ${JSON.stringify(updateError)}\n`);
        return;
      }
      
      setTestResult(prev => prev + `SUCCESS: Profile updated\n`);
      setTestResult(prev => prev + `Updated data: ${JSON.stringify(updateResult, null, 2)}\n\n`);

      // Test 3: Verify update
      setTestResult(prev => prev + 'Test 3: Verifying update...\n');
      const { profile: verifyProfile, error: verifyError } = await AuthService.getCurrentUser();
      
      if (verifyError || !verifyProfile) {
        setTestResult(prev => prev + `ERROR: Failed to verify update: ${verifyError instanceof Error ? verifyError.message : JSON.stringify(verifyError)}\n`);
        return;
      }
      
      setTestResult(prev => prev + `SUCCESS: Update verified\n`);
      setTestResult(prev => prev + `- Name: ${verifyProfile.full_name}\n`);
      setTestResult(prev => prev + `- Email: ${verifyProfile.email}\n`);
      setTestResult(prev => prev + `- Phone: ${verifyProfile.phone_number}\n`);
      setTestResult(prev => prev + `- Updated: ${verifyProfile.updated_at}\n`);
      
    } catch (error: any) {
      setTestResult(prev => prev + `EXCEPTION: ${error.message}\n`);
      console.error('Test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Profile Update Test</Text>
        
        {user ? (
          <View style={styles.userInfo}>
            <Text style={styles.subtitle}>Current User:</Text>
            <Text style={styles.text}>ID: {user.id}</Text>
            <Text style={styles.text}>Name: {user.name}</Text>
            <Text style={styles.text}>Email: {user.email}</Text>
            <Text style={styles.text}>Phone: {user.phone}</Text>
            <Text style={styles.text}>Type: {user.userType}</Text>
          </View>
        ) : (
          <Text style={styles.error}>No user logged in</Text>
        )}

        <View style={styles.form}>
          <Text style={styles.subtitle}>Test Update Data:</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name:</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="Enter name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email:</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone:</Text>
            <TextInput
              style={styles.input}
              value={formData.phone}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
              placeholder="Enter phone"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={testDatabaseConnection}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Testing...' : 'Test Profile Update'}
          </Text>
        </TouchableOpacity>

        {testResult ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>Test Results:</Text>
            <ScrollView style={styles.resultScroll}>
              <Text style={styles.resultText}>{testResult}</Text>
            </ScrollView>
          </View>
        ) : null}
      </ScrollView>
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  userInfo: {
    backgroundColor: colors.backgroundSecondary,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  text: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 5,
  },
  error: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.backgroundSecondary,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 10,
    padding: 15,
    maxHeight: 400,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 10,
  },
  resultScroll: {
    maxHeight: 300,
  },
  resultText: {
    fontSize: 12,
    color: colors.text,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
});