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
              PAKA Go is a delivery platform that connects customers with independent drivers 
              to facilitate package delivery services. We act as an intermediary and do not 
              directly provide delivery services.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>User Responsibilities</Text>
            <Text style={styles.sectionText}>
              Users are responsible for providing accurate information, ensuring packages 
              comply with legal requirements, and treating all parties with respect. 
              Prohibited items include illegal substances, dangerous materials, and items 
              that violate local laws.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Driver Requirements</Text>
            <Text style={styles.sectionText}>
              Drivers must have valid licenses, insurance, and meet our verification requirements. 
              Drivers are independent contractors and are responsible for their own taxes, 
              insurance, and compliance with local regulations.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Terms</Text>
            <Text style={styles.sectionText}>
              Payment is processed through our secure payment system. Customers are charged 
              upon booking confirmation. Drivers receive payment after successful delivery 
              completion, minus our service fee.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cancellation Policy</Text>
            <Text style={styles.sectionText}>
              Orders can be cancelled within 5 minutes of booking without charge. After this 
              period, cancellation fees may apply. Drivers who cancel after accepting an 
              order may face account penalties.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Liability and Insurance</Text>
            <Text style={styles.sectionText}>
              PAKA Go's liability is limited to the platform service. We are not responsible 
              for loss, damage, or theft of packages during delivery. Users are encouraged 
              to obtain appropriate insurance for valuable items.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dispute Resolution</Text>
            <Text style={styles.sectionText}>
              Disputes should first be reported through our in-app support system. We will 
              mediate between parties to reach a fair resolution. Unresolved disputes may 
              be subject to arbitration under Kenyan law.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Termination</Text>
            <Text style={styles.sectionText}>
              We reserve the right to suspend or terminate accounts that violate these terms, 
              engage in fraudulent activity, or pose a risk to other users. Users may delete 
              their accounts at any time through the app settings.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Changes to Terms</Text>
            <Text style={styles.sectionText}>
              We may update these terms from time to time. Users will be notified of 
              significant changes and continued use of the service constitutes acceptance 
              of the updated terms.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <Text style={styles.sectionText}>
              For questions about these terms, please contact us at:
              {\"\\n\\n\"}Email: legal@pakago.com
              {\"\\n\"}Phone: +254 700 000 000
              {\"\\n\"}Address: Nairobi, Kenya
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
    backgroundColor: Colors.light.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 16,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.light.textMuted,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 14,
    color: Colors.light.textMuted,
    fontWeight: '500',
  },
});