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
import { MapPin, User, LogOut, RefreshCw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import { useAuthStore } from '@/stores/auth-store';
import { MapViewComponent } from '@/components/MapView';

export default function TestAuthMapScreen() {
  const { user, logout, isAuthenticated, checkAuthStatus } = useAuthStore();
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  const handleLocationSelect = (location: any) => {
    setSelectedLocation(location);
    console.log('Selected location:', location);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth');
          },
        },
      ]
    );
  };

  const handleRefreshAuth = async () => {
    await checkAuthStatus();
    Alert.alert('Auth Status', 'Authentication status refreshed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.userInfo}>
                <View style={styles.userAvatar}>
                  <User size={24} color={colors.background} />
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>
                    {user?.name || 'Unknown User'}
                  </Text>
                  <Text style={styles.userEmail}>
                    {user?.email || 'No email'}
                  </Text>
                  <Text style={styles.userType}>
                    {user?.userType || 'No type'} • {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={handleRefreshAuth}
                >
                  <RefreshCw size={20} color={colors.background} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={handleLogout}
                >
                  <LogOut size={20} color={colors.background} />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Auth Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Authentication Status</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Authenticated:</Text>
              <Text style={[
                styles.statusValue,
                { color: isAuthenticated ? colors.success : colors.error }
              ]}>
                {isAuthenticated ? '✅ Yes' : '❌ No'}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>User ID:</Text>
              <Text style={styles.statusValue}>{user?.id || 'None'}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>User Type:</Text>
              <Text style={styles.statusValue}>{user?.userType || 'None'}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Phone:</Text>
              <Text style={styles.statusValue}>{user?.phone || 'None'}</Text>
            </View>
          </View>
        </View>

        {/* Map Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Map with Location Search</Text>
          <View style={styles.mapContainer}>
            <MapViewComponent
              onLocationSelect={handleLocationSelect}
              showSearch={true}
              showRoute={true}
              height={300}
            />
          </View>
        </View>

        {/* Selected Location */}
        {selectedLocation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Selected Location</Text>
            <View style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <MapPin size={20} color={colors.primary} />
                <Text style={styles.locationTitle}>Location Details</Text>
              </View>
              <Text style={styles.locationAddress}>
                {selectedLocation.address}
              </Text>
              <View style={styles.coordinatesRow}>
                <Text style={styles.coordinateLabel}>Latitude:</Text>
                <Text style={styles.coordinateValue}>
                  {selectedLocation.latitude.toFixed(6)}
                </Text>
              </View>
              <View style={styles.coordinatesRow}>
                <Text style={styles.coordinateLabel}>Longitude:</Text>
                <Text style={styles.coordinateValue}>
                  {selectedLocation.longitude.toFixed(6)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Navigation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Navigation</Text>
          <View style={styles.navigationButtons}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => router.push('/auth')}
            >
              <Text style={styles.navButtonText}>Go to Auth</Text>
            </TouchableOpacity>
            
            {user?.userType === 'customer' && (
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => router.push('/(client)')}
              >
                <Text style={styles.navButtonText}>Go to Client Dashboard</Text>
              </TouchableOpacity>
            )}
            
            {user?.userType === 'driver' && (
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => router.push('/(driver)')}
              >
                <Text style={styles.navButtonText}>Go to Driver Dashboard</Text>
              </TouchableOpacity>
            )}
            
            {user?.userType === 'admin' && (
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => router.push('/(admin)')}
              >
                <Text style={styles.navButtonText}>Go to Admin Dashboard</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => router.push('/booking')}
            >
              <Text style={styles.navButtonText}>Test Booking</Text>
            </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.background,
  },
  userEmail: {
    fontSize: 14,
    color: colors.background + 'CC',
    marginTop: 2,
  },
  userType: {
    fontSize: 12,
    color: colors.background + 'AA',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  statusCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  mapContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.backgroundSecondary,
  },
  locationCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  locationAddress: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  coordinatesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coordinateLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  coordinateValue: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  navigationButtons: {
    gap: 12,
  },
  navButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.background,
  },
});