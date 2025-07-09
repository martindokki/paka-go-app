import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
} from 'react-native';
import { X } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface PrivacyPolicyModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  visible,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Privacy Policy</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <X size={24} color={Colors.light.text} />
          </TouchableOpacity>
        </View>
        
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Information We Collect</Text>
            <Text style={styles.sectionText}>
              We collect information you provide directly to us, such as when you create an account, 
              book a delivery, or contact us for support. This includes your name, email address, 
              phone number, and delivery addresses.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How We Use Your Information</Text>
            <Text style={styles.sectionText}>
              We use the information we collect to provide, maintain, and improve our services, 
              process transactions, send you technical notices and support messages, and communicate 
              with you about products, services, and promotional offers.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location Information</Text>
            <Text style={styles.sectionText}>
              We collect location information to provide delivery services, match you with nearby 
              drivers, and provide real-time tracking. You can control location sharing through 
              your device settings.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Information Sharing</Text>
            <Text style={styles.sectionText}>
              We do not sell, trade, or otherwise transfer your personal information to third parties 
              without your consent, except as described in this policy. We may share information with 
              service providers who assist us in operating our platform.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Security</Text>
            <Text style={styles.sectionText}>
              We implement appropriate security measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction. However, no method of 
              transmission over the internet is 100% secure.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Rights</Text>
            <Text style={styles.sectionText}>
              You have the right to access, update, or delete your personal information. You can 
              also opt out of certain communications from us. To exercise these rights, please 
              contact us through the app or at support@pakago.com.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Changes to This Policy</Text>
            <Text style={styles.sectionText}>
              We may update this privacy policy from time to time. We will notify you of any 
              changes by posting the new policy on this page and updating the "Last Updated" date.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Us</Text>
            <Text style={styles.sectionText}>
              If you have any questions about this privacy policy, please contact us at:
              {"\n\n"}Email: support@pakago.com
              {"\n"}Phone: +254 700 000 000
              {"\n"}Address: Nairobi, Kenya
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Last Updated: January 2025
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.light.text,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    lineHeight: 24,
  },
  footer: {
    marginTop: 32,
    marginBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.light.textMuted,
    fontWeight: '500',
  },
});