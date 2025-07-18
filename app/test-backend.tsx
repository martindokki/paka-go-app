import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, TextInput } from 'react-native';
import { Stack } from 'expo-router';
import { supabase } from '@/services/supabase';
import { AuthService } from '@/services/auth-service';
import { ParcelService } from '@/services/parcel-service';
import { useAuthStore } from '@/stores/auth-store';
import { useOrdersStore } from '@/stores/orders-store';

export default function TestBackendScreen() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('password123');
  const [testName, setTestName] = useState('Test User');
  const [testPhone, setTestPhone] = useState('+254712345678');
  
  const { user, login, register, logout } = useAuthStore();
  const { createOrder, getOrdersByClient, getAllOrders, orders } = useOrdersStore();

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  // Test 1: Supabase Connection
  const testSupabaseConnection = async () => {
    try {
      addResult('🔄 Testing Supabase connection...');
      const { data, error } = await supabase.from('users').select('count').limit(1);
      
      if (error) {
        addResult(`❌ Supabase connection failed: ${error.message}`);
        return false;
      }
      
      addResult('✅ Supabase connection successful');
      return true;
    } catch (error: any) {
      addResult(`❌ Supabase connection error: ${error.message}`);
      return false;
    }
  };

  // Test 2: User Registration
  const testUserRegistration = async () => {
    try {
      addResult('🔄 Testing user registration...');
      
      // Generate unique email for testing
      const uniqueEmail = `test${Date.now()}@example.com`;
      
      const success = await register({
        email: uniqueEmail,
        password: testPassword,
        name: testName,
        phone: testPhone,
        userType: 'customer'
      });

      if (success) {
        addResult(`✅ User registration successful: ${uniqueEmail}`);
        
        // Verify user was created in database
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', uniqueEmail)
          .single();

        if (userData) {
          addResult(`✅ User found in database: ${userData.full_name} (${userData.role})`);
        } else {
          addResult(`❌ User not found in database: ${error?.message}`);
        }
        
        return true;
      } else {
        addResult('❌ User registration failed');
        return false;
      }
    } catch (error: any) {
      addResult(`❌ Registration error: ${error.message}`);
      return false;
    }
  };

  // Test 3: User Login
  const testUserLogin = async () => {
    try {
      addResult('🔄 Testing user login...');
      
      if (!user) {
        addResult('❌ No user to test login with');
        return false;
      }

      // Logout first
      await logout();
      
      // Login with the registered user
      const success = await login({
        email: user.email,
        password: testPassword
      });

      if (success) {
        addResult(`✅ User login successful: ${user.email}`);
        return true;
      } else {
        addResult('❌ User login failed');
        return false;
      }
    } catch (error: any) {
      addResult(`❌ Login error: ${error.message}`);
      return false;
    }
  };

  // Test 4: Create Parcel
  const testCreateParcel = async () => {
    try {
      addResult('🔄 Testing parcel creation...');
      
      if (!user) {
        addResult('❌ No authenticated user for parcel creation');
        return false;
      }

      const orderData = {
        customerId: user.id,
        clientId: user.id,
        recipientName: 'Jane Doe',
        recipientPhone: '+254798765432',
        pickupAddress: 'Westlands, Nairobi',
        deliveryAddress: 'Karen, Nairobi',
        packageDescription: 'Test package for backend verification',
        packageType: 'documents',
        paymentMethod: 'mpesa',
        paymentTerm: 'pay_now',
        price: 500,
        weight: 1.5
      };

      const orderId = await createOrder(orderData);
      
      if (orderId) {
        addResult(`✅ Parcel created successfully: ${orderId}`);
        
        // Verify parcel was created in database
        const { data: parcelData, error } = await supabase
          .from('parcels')
          .select('*')
          .eq('id', orderId)
          .single();

        if (parcelData) {
          addResult(`✅ Parcel found in database: ${parcelData.receiver_name} -> ${parcelData.dropoff_address}`);
        } else {
          addResult(`❌ Parcel not found in database: ${error?.message}`);
        }
        
        return orderId;
      } else {
        addResult('❌ Parcel creation failed');
        return false;
      }
    } catch (error: any) {
      addResult(`❌ Parcel creation error: ${error.message}`);
      return false;
    }
  };

  // Test 5: Fetch User Parcels
  const testFetchUserParcels = async () => {
    try {
      addResult('🔄 Testing fetch user parcels...');
      
      if (!user) {
        addResult('❌ No authenticated user for fetching parcels');
        return false;
      }

      await getOrdersByClient(user.id);
      
      addResult(`✅ User parcels fetched: ${orders.length} parcels found`);
      
      // Display parcel details
      orders.forEach((order, index) => {
        addResult(`   📦 Parcel ${index + 1}: ${order.recipientName} - ${order.status}`);
      });
      
      return true;
    } catch (error: any) {
      addResult(`❌ Fetch user parcels error: ${error.message}`);
      return false;
    }
  };

  // Test 6: Create Driver and Assign to Parcel
  const testDriverAssignment = async (parcelId: string) => {
    try {
      addResult('🔄 Testing driver creation and assignment...');
      
      // Create a test driver
      const driverEmail = `driver${Date.now()}@example.com`;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: driverEmail,
        password: 'driver123'
      });

      if (authError || !authData.user) {
        addResult(`❌ Driver creation failed: ${authError?.message}`);
        return false;
      }

      // Update driver profile
      const { error: profileError } = await supabase
        .from('users')
        .update({
          full_name: 'Test Driver',
          phone_number: '+254787654321',
          role: 'driver'
        })
        .eq('id', authData.user.id);

      if (profileError) {
        addResult(`❌ Driver profile update failed: ${profileError.message}`);
        return false;
      }

      addResult(`✅ Driver created: ${driverEmail}`);

      // Assign driver to parcel
      const { data: assignData, error: assignError } = await ParcelService.assignDriverToParcel(parcelId, authData.user.id);
      
      if (assignError) {
        addResult(`❌ Driver assignment failed: ${assignError?.message || 'Unknown error'}`);
        return false;
      }

      addResult(`✅ Driver assigned to parcel: ${parcelId}`);
      
      // Verify delivery record was created
      const { data: deliveryData, error: deliveryError } = await supabase
        .from('deliveries')
        .select('*')
        .eq('parcel_id', parcelId)
        .single();

      if (deliveryData) {
        addResult(`✅ Delivery record created: ${deliveryData.delivery_status}`);
      } else {
        addResult(`❌ Delivery record not found: ${deliveryError?.message}`);
      }
      
      return true;
    } catch (error: any) {
      addResult(`❌ Driver assignment error: ${error.message}`);
      return false;
    }
  };

  // Test 7: Update Delivery Status
  const testUpdateDeliveryStatus = async (parcelId: string) => {
    try {
      addResult('🔄 Testing delivery status update...');
      
      // Get delivery record
      const { data: deliveryData, error: deliveryError } = await supabase
        .from('deliveries')
        .select('*')
        .eq('parcel_id', parcelId)
        .single();

      if (!deliveryData) {
        addResult(`❌ Delivery record not found: ${deliveryError?.message}`);
        return false;
      }

      // Update to picked status
      const { data: updateData, error: updateError } = await ParcelService.updateDeliveryStatus(deliveryData.id, 'picked');
      
      if (updateError) {
        addResult(`❌ Delivery status update failed: ${updateError?.message || 'Unknown error'}`);
        return false;
      }

      addResult(`✅ Delivery status updated to: picked`);
      
      // Update to delivered status
      const { data: deliveredData, error: deliveredError } = await ParcelService.updateDeliveryStatus(deliveryData.id, 'delivered');
      
      if (deliveredError) {
        addResult(`❌ Delivery completion failed: ${deliveredError?.message || 'Unknown error'}`);
        return false;
      }

      addResult(`✅ Delivery completed successfully`);
      
      // Verify parcel status was updated
      const { data: parcelData, error: parcelError } = await supabase
        .from('parcels')
        .select('*')
        .eq('id', parcelId)
        .single();

      if (parcelData && parcelData.status === 'delivered') {
        addResult(`✅ Parcel status updated to: ${parcelData.status}`);
      } else {
        addResult(`❌ Parcel status not updated: ${parcelError?.message}`);
      }
      
      return true;
    } catch (error: any) {
      addResult(`❌ Delivery status update error: ${error.message}`);
      return false;
    }
  };

  // Test 8: Admin Functions
  const testAdminFunctions = async () => {
    try {
      addResult('🔄 Testing admin functions...');
      
      // Fetch all parcels
      await getAllOrders();
      addResult(`✅ Admin: Fetched all parcels (${orders.length} total)`);
      
      // Fetch all drivers
      const { data: drivers, error: driversError } = await ParcelService.getDrivers();
      
      if (driversError) {
        addResult(`❌ Admin: Failed to fetch drivers: ${driversError?.message || 'Unknown error'}`);
        return false;
      }

      addResult(`✅ Admin: Fetched drivers (${drivers?.length || 0} total)`);
      
      // Display driver details
      drivers?.forEach((driver, index) => {
        addResult(`   👨‍💼 Driver ${index + 1}: ${driver.full_name} (${driver.email})`);
      });
      
      return true;
    } catch (error: any) {
      addResult(`❌ Admin functions error: ${error.message}`);
      return false;
    }
  };

  // Run All Tests
  const runAllTests = async () => {
    setIsLoading(true);
    clearResults();
    
    addResult('🚀 Starting comprehensive backend tests...');
    
    try {
      // Test 1: Connection
      const connectionOk = await testSupabaseConnection();
      if (!connectionOk) return;
      
      // Test 2: Registration
      const registrationOk = await testUserRegistration();
      if (!registrationOk) return;
      
      // Test 3: Login
      const loginOk = await testUserLogin();
      if (!loginOk) return;
      
      // Test 4: Create Parcel
      const parcelId = await testCreateParcel();
      if (!parcelId) return;
      
      // Test 5: Fetch User Parcels
      const fetchOk = await testFetchUserParcels();
      if (!fetchOk) return;
      
      // Test 6: Driver Assignment
      const assignmentOk = await testDriverAssignment(parcelId as string);
      if (!assignmentOk) return;
      
      // Test 7: Update Delivery Status
      const statusUpdateOk = await testUpdateDeliveryStatus(parcelId as string);
      if (!statusUpdateOk) return;
      
      // Test 8: Admin Functions
      const adminOk = await testAdminFunctions();
      if (!adminOk) return;
      
      addResult('🎉 All tests completed successfully!');
      addResult('✅ Backend integration is working properly');
      addResult('✅ Data is being saved to Supabase database');
      
    } catch (error: any) {
      addResult(`❌ Test suite failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Backend Test Suite',
          headerStyle: { backgroundColor: '#2563eb' },
          headerTintColor: '#fff'
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>🔧 Backend Integration Test</Text>
          <Text style={styles.subtitle}>
            Testing Supabase connection and data persistence
          </Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Test Configuration</Text>
          <TextInput
            style={styles.input}
            placeholder="Test Email"
            value={testEmail}
            onChangeText={setTestEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Test Password"
            value={testPassword}
            onChangeText={setTestPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Test Name"
            value={testName}
            onChangeText={setTestName}
          />
          <TextInput
            style={styles.input}
            placeholder="Test Phone"
            value={testPhone}
            onChangeText={setTestPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.buttonSection}>
          <Pressable
            style={[styles.button, styles.primaryButton, isLoading && styles.disabledButton]}
            onPress={runAllTests}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? '🔄 Running Tests...' : '🚀 Run All Tests'}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.button, styles.secondaryButton]}
            onPress={clearResults}
          >
            <Text style={styles.secondaryButtonText}>🗑️ Clear Results</Text>
          </Pressable>
        </View>

        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>Test Results</Text>
          <View style={styles.resultsContainer}>
            {testResults.length === 0 ? (
              <Text style={styles.noResults}>No test results yet. Run tests to see results.</Text>
            ) : (
              testResults.map((result, index) => (
                <Text key={index} style={styles.resultText}>
                  {result}
                </Text>
              ))
            )}
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Database Info</Text>
          <Text style={styles.infoText}>
            🔗 Supabase URL: https://yrokteacdihxfcrpgotz.supabase.co
          </Text>
          <Text style={styles.infoText}>
            📊 Tables: users, parcels, deliveries, payments, locations
          </Text>
          <Text style={styles.infoText}>
            👤 Current User: {user ? `${user.name} (${user.userType})` : 'Not logged in'}
          </Text>
          <Text style={styles.infoText}>
            📦 Orders in Store: {orders.length}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  buttonSection: {
    marginBottom: 24,
    gap: 12,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsSection: {
    marginBottom: 24,
  },
  resultsContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 16,
    minHeight: 200,
  },
  noResults: {
    color: '#94a3b8',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 60,
  },
  resultText: {
    color: '#f1f5f9',
    fontSize: 14,
    fontFamily: 'monospace',
    marginBottom: 4,
    lineHeight: 20,
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
});