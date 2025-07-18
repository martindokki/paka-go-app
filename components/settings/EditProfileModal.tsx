import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { X, User, Mail, Phone, Save } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import { useAuthStore } from '@/stores/auth-store-simple';
import { showAlert } from '@/utils/platform-utils';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
}) => {
  const { user, updateProfile } = useAuthStore();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showAlert('Validation Error', 'Name is required');
      return;
    }

    if (!formData.email.trim()) {
      showAlert('Validation Error', 'Email is required');
      return;
    }

    if (!formData.phone.trim()) {
      showAlert('Validation Error', 'Phone number is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showAlert('Validation Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await updateProfile(formData);
      
      if (success) {
        showAlert('Success', 'Profile updated successfully!', [
          {
            text: 'OK',
            onPress: onClose,
          },
        ]);
      } else {
        showAlert('Error', 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      showAlert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form data when closing
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'web' ? 'overFullScreen' : 'pageSheet'}
      transparent={Platform.OS === 'web'}
    >
      <SafeAreaView style={[styles.container, Platform.OS === 'web' && styles.webContainer]}>
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.header}
            >
              <Text style={styles.title}>Edit Profile</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
              >
                <X size={24} color={colors.background} />
              </TouchableOpacity>
            </LinearGradient>
            
            <ScrollView 
              style={styles.content}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <View style={styles.inputLabel}>
                    <User size={20} color={colors.primary} />
                    <Text style={styles.labelText}>Full Name</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={formData.name}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                    placeholder="Enter your full name"
                    placeholderTextColor={colors.textMuted}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.inputLabel}>
                    <Mail size={20} color={colors.primary} />
                    <Text style={styles.labelText}>Email Address</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={formData.email}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                    placeholder="Enter your email address"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.inputLabel}>
                    <Phone size={20} color={colors.primary} />
                    <Text style={styles.labelText}>Phone Number</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    value={formData.phone}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                    placeholder="Enter your phone number"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    💡 Your email and phone number are used for account security and order notifications.
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={isLoading ? [colors.textMuted, colors.textMuted] : [colors.primary, colors.primaryDark]}
                  style={styles.saveButtonGradient}
                >
                  <Save size={20} color={colors.background} />
                  <Text style={styles.saveButtonText}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  webContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  keyboardView: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: Platform.OS === 'web' ? 20 : 0,
    overflow: 'hidden',
    maxWidth: Platform.OS === 'web' ? 500 : undefined,
    maxHeight: Platform.OS === 'web' ? '90%' : undefined,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.background,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  form: {
    paddingVertical: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  labelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.backgroundSecondary,
  },
  infoBox: {
    backgroundColor: colors.info + '20',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.info,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.background,
  },
});