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
  const { user, deleteAccount } = useAuthStore();

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
                  'Your account has been permanently deleted. We\'re sorry to see you go!',
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
                Alert.alert(
                  'Deletion Failed',
                  'We couldn\'t delete your account at this time. Please try again later or contact support.'
                );
              }
            } catch (error) {
              Alert.alert(
                'Error',
                'An unexpected error occurred. Please try again later.'
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const resetModal = () => {
    setConfirmText('');
    setIsDeleting(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.warningIcon}>
              <AlertTriangle size={32} color={Colors.light.error} />
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              disabled={isDeleting}
            >
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>Delete Account</Text>
            <Text style={styles.subtitle}>
              This action is permanent and cannot be undone.
            </Text>

            <View style={styles.warningBox}>
              <Text style={styles.warningTitle}>What will happen:</Text>
              <Text style={styles.warningText}>
                • Your account and profile will be permanently deleted{"\n"}
                • All your order history will be removed{"\n"}
                • You won't be able to recover any data{"\n"}
                • Active orders will be cancelled{"\n"}
                • You'll need to create a new account to use PAKA Go again
              </Text>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>
                Type <Text style={styles.deleteText}>DELETE</Text> to confirm:
              </Text>
              <TextInput
                style={styles.input}
                value={confirmText}
                onChangeText={setConfirmText}
                placeholder="Type DELETE here"
                placeholderTextColor={Colors.light.textMuted}
                autoCapitalize="characters"
                editable={!isDeleting}
              />
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userInfoText}>
                Account: {user?.email}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={isDeleting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.deleteButton,
                (confirmText.toLowerCase() !== 'delete' || isDeleting) && styles.deleteButtonDisabled,
              ]}
              onPress={handleDeleteAccount}
              disabled={confirmText.toLowerCase() !== 'delete' || isDeleting}
            >
              <LinearGradient
                colors={[
                  confirmText.toLowerCase() === 'delete' && !isDeleting
                    ? Colors.light.error
                    : Colors.light.textMuted,
                  confirmText.toLowerCase() === 'delete' && !isDeleting
                    ? '#d32f2f'
                    : Colors.light.textMuted,
                ]}
                style={styles.deleteButtonGradient}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.deleteButtonText}>Delete Forever</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: Colors.light.background,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  warningIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  warningBox: {
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e65100',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#bf360c',
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 8,
  },
  deleteText: {
    fontWeight: '700',
    color: Colors.light.error,
  },
  input: {
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.light.text,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  userInfo: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  userInfoText: {
    fontSize: 14,
    color: Colors.light.textMuted,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 24,
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
    borderRadius: 12,
    overflow: 'hidden',
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});