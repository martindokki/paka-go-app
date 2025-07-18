import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, Truck, Shield, Users } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Simple colors object
const colors = {
  primary: '#FF6A00',
  primaryDark: '#E55A00',
  background: '#FFFFFF',
  text: '#1A1A1A',
  textMuted: '#6B7280',
  warning: '#F59E0B',
};

export default function WelcomeScreen() {
  const features = [
    {
      icon: Send,
      title: 'Fast Delivery',
      description: 'Quick and reliable package delivery across Kenya',
    },
    {
      icon: Truck,
      title: 'Real-time Tracking',
      description: 'Track your packages in real-time with live updates',
    },
    {
      icon: Shield,
      title: 'Secure & Safe',
      description: 'Your packages are insured and handled with care',
    },
    {
      icon: Users,
      title: 'Trusted Drivers',
      description: 'Verified and rated drivers for peace of mind',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Send size={48} color={colors.background} />
            </View>
            <Text style={styles.title}>Swift Delivery</Text>
            <Text style={styles.subtitle}>
              Your trusted delivery partner in Kenya
            </Text>
          </View>

          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={styles.featureIcon}>
                  <feature.icon size={24} color={colors.primary} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={() => router.push('/auth')}
            >
              <LinearGradient
                colors={[colors.background, '#FFFFFF']}
                style={styles.getStartedGradient}
              >
                <Text style={styles.getStartedText}>Get Started</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <Text style={styles.footerText}>
              Join thousands of satisfied customers
            </Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.background,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    color: colors.background + 'CC',
    textAlign: 'center',
    fontWeight: '500',
  },
  featuresContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
    marginVertical: 40,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.background,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.background + 'CC',
    fontWeight: '500',
    lineHeight: 20,
  },
  actions: {
    alignItems: 'center',
    gap: 16,
  },
  getStartedButton: {
    width: '100%',
    borderRadius: 16,
    shadowColor: colors.background,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  getStartedGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  footerText: {
    fontSize: 14,
    color: colors.background + '99',
    textAlign: 'center',
    fontWeight: '500',
  },
});