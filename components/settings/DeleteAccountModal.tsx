import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { AlertTriangle, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import { useAuthStore } from '@/stores/auth-store';
import { router } from 'expo-router';

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  visible,
  onClose,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteAccount } = useAuthStore();

  const handleDeleteAccount = async () => {
    if (confirmText.toLowerCase() !== 'delete') {
      Alert.alert('Invalid Confirmation', 'Please type "DELETE" to confirm account deletion.');
      return;
    }

    Alert.alert(
      'Final Confirmation',
      'This action cannot be undone. Are you absolutely sure you want to delete your account?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            
            try {
              const success = await deleteAccount();
              
              if (success) {
                Alert.alert(
                  'Account Deleted',
                  'Your account has been permanently deleted. We are sorry to see you go!',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        onClose();
                        router.replace('/auth');
                      },
                    },
                  ]
                );
              } else {
                Alert.alert('Error', 'Failed to delete account. Please try again.');
              }
            } catch (error) {
              Alert.alert('Error', 'An unexpected error occurred. Please try again.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={[Colors.light.background, '#FFFFFF']}
            style={styles.gradient}
          >
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <AlertTriangle size={32} color={Colors.light.error} />
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color={Colors.light.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <Text style={styles.title}>Delete Account</Text>
              <Text style={styles.subtitle}>
                This action is permanent and cannot be undone. All your data will be permanently deleted.
              </Text>

              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  ⚠️ This will permanently delete:
                </Text>
                <Text style={styles.warningItem}>• Your profile and account information</Text>
                <Text style={styles.warningItem}>• All your order history</Text>
                <Text style={styles.warningItem}>• Payment methods and transaction history</Text>
                <Text style={styles.warningItem}>• Chat messages and support tickets</Text>
              </View>

              <View style={styles.confirmationSection}>
                <Text style={styles.confirmationLabel}>
                  Type "DELETE" to confirm:
                </Text>
                <TextInput
                  style={styles.confirmationInput}
                  value={confirmText}
                  onChangeText={setConfirmText}
                  placeholder="Type DELETE here"
                  placeholderTextColor={Colors.light.textMuted}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                disabled={isDeleting}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.deleteButton,
                  (confirmText.toLowerCase() !== 'delete' || isDeleting) && styles.deleteButtonDisabled
                ]}
                onPress={handleDeleteAccount}
                disabled={confirmText.toLowerCase() !== 'delete' || isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={Colors.light.background} />
                ) : (
                  <Text style={styles.deleteButtonText}>Delete Forever</Text>
                )}
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  gradient: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textMuted,
    lineHeight: 24,
    marginBottom: 20,
  },
  warningBox: {
    backgroundColor: Colors.light.error + '10',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.error,
    marginBottom: 20,
  },
  warningText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.error,
    marginBottom: 8,
  },
  warningItem: {
    fontSize: 14,
    color: Colors.light.error,
    marginBottom: 4,
    paddingLeft: 8,
  },
  confirmationSection: {
    marginBottom: 8,
  },
  confirmationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  confirmationInput: {
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.light.text,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.light.error,
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.background,
  },
});