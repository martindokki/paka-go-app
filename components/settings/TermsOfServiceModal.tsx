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

interface TermsOfServiceModalProps {
  visible: boolean;
  onClose: () => void;
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({
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
          <Text style={styles.title}>Terms of Service</Text>
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
            <Text style={styles.sectionTitle}>Acceptance of Terms</Text>
            <Text style={styles.sectionText}>
              By accessing and using PAKA Go, you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, 
              please do not use this service.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Description</Text>
            <Text style={styles.sectionText}>
              PAKA Go is a delivery platform that connects users who need to send packages 
              with drivers who can deliver them. We facilitate the connection but are not 
              responsible for the actual delivery service.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>User Responsibilities</Text>
            <Text style={styles.sectionText}>
              Users are responsible for providing accurate information, ensuring packages 
              comply with legal requirements, and treating drivers with respect. Prohibited 
              items include illegal substances, dangerous materials, and items that violate 
              local laws.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Driver Responsibilities</Text>
            <Text style={styles.sectionText}>
              Drivers must have valid licenses, maintain their vehicles properly, handle 
              packages with care, and provide professional service. Drivers are independent 
              contractors and not employees of PAKA Go.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Terms</Text>
            <Text style={styles.sectionText}>
              Payment is processed through our secure payment system. Fees are clearly 
              displayed before booking. Refunds are available according to our refund 
              policy. We reserve the right to change pricing with notice.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Liability and Insurance</Text>
            <Text style={styles.sectionText}>
              PAKA Go provides limited liability coverage for packages during delivery. 
              Users should declare valuable items and consider additional insurance. 
              We are not liable for delays, damages, or losses beyond our coverage limits.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy and Data</Text>
            <Text style={styles.sectionText}>
              Your privacy is important to us. Please review our Privacy Policy to 
              understand how we collect, use, and protect your information. By using 
              our service, you consent to our data practices.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Termination</Text>
            <Text style={styles.sectionText}>
              We may terminate or suspend your account for violations of these terms, 
              illegal activity, or other reasons at our discretion. You may also 
              terminate your account at any time through the app settings.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Changes to Terms</Text>
            <Text style={styles.sectionText}>
              We reserve the right to modify these terms at any time. Changes will be 
              effective immediately upon posting. Continued use of the service constitutes 
              acceptance of modified terms.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <Text style={styles.sectionText}>
              For questions about these terms, please contact us at:
              {"\n\n"}Email: legal@pakago.com
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
    fontWeight: '700',
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
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.light.textMuted,
  },
  footer: {
    marginTop: 32,
    marginBottom: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.light.textMuted,
    fontWeight: '600',
  },
});