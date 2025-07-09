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
      Alert.alert('Invalid Confirmation', 'Please type \"DELETE\" to confirm account deletion.');
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
                  'Your account has been permanently deleted. We\\'re sorry to see you go!',
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
                  'We couldn\\'t delete your account at this time. Please try again later or contact support.'
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
                • Your account and profile will be permanently deleted{\"\\n\"}\n                • All your order history will be removed{\"\\n\"}\n                • You won't be able to recover any data{\"\\n\"}\n                • Active orders will be cancelled{\"\\n\"}\n                • You'll need to create a new account to use PAKA Go again\n              </Text>\n            </View>\n\n            <View style={styles.inputSection}>\n              <Text style={styles.inputLabel}>\n                Type <Text style={styles.deleteText}>DELETE</Text> to confirm:\n              </Text>\n              <TextInput\n                style={styles.input}\n                value={confirmText}\n                onChangeText={setConfirmText}\n                placeholder=\"Type DELETE here\"\n                placeholderTextColor={Colors.light.textMuted}\n                autoCapitalize=\"characters\"\n                editable={!isDeleting}\n              />\n            </View>\n\n            <View style={styles.userInfo}>\n              <Text style={styles.userInfoText}>\n                Account: {user?.email}\n              </Text>\n            </View>\n          </View>\n\n          <View style={styles.actions}>\n            <TouchableOpacity\n              style={styles.cancelButton}\n              onPress={handleClose}\n              disabled={isDeleting}\n            >\n              <Text style={styles.cancelButtonText}>Cancel</Text>\n            </TouchableOpacity>\n\n            <TouchableOpacity\n              style={[\n                styles.deleteButton,\n                (confirmText.toLowerCase() !== 'delete' || isDeleting) && styles.deleteButtonDisabled,\n              ]}\n              onPress={handleDeleteAccount}\n              disabled={confirmText.toLowerCase() !== 'delete' || isDeleting}\n            >\n              <LinearGradient\n                colors={[\n                  confirmText.toLowerCase() === 'delete' && !isDeleting\n                    ? Colors.light.error\n                    : Colors.light.textMuted,\n                  confirmText.toLowerCase() === 'delete' && !isDeleting\n                    ? '#C53030'\n                    : Colors.light.textMuted,\n                ]}\n                style={styles.deleteButtonGradient}\n              >\n                {isDeleting ? (\n                  <View style={styles.loadingContainer}>\n                    <ActivityIndicator size=\"small\" color={Colors.light.background} />\n                    <Text style={styles.deleteButtonText}>Deleting...</Text>\n                  </View>\n                ) : (\n                  <Text style={styles.deleteButtonText}>Delete Forever</Text>\n                )}\n              </LinearGradient>\n            </TouchableOpacity>\n          </View>\n        </View>\n      </View>\n    </Modal>\n  );\n};\n\nconst styles = StyleSheet.create({\n  overlay: {\n    flex: 1,\n    backgroundColor: 'rgba(0, 0, 0, 0.5)',\n    justifyContent: 'center',\n    alignItems: 'center',\n    paddingHorizontal: 20,\n  },\n  container: {\n    backgroundColor: Colors.light.background,\n    borderRadius: 20,\n    width: '100%',\n    maxWidth: 400,\n    maxHeight: '80%',\n  },\n  header: {\n    flexDirection: 'row',\n    alignItems: 'center',\n    justifyContent: 'space-between',\n    paddingHorizontal: 20,\n    paddingTop: 20,\n    paddingBottom: 10,\n  },\n  warningIcon: {\n    width: 60,\n    height: 60,\n    borderRadius: 30,\n    backgroundColor: Colors.light.error + '20',\n    justifyContent: 'center',\n    alignItems: 'center',\n  },\n  closeButton: {\n    width: 40,\n    height: 40,\n    borderRadius: 20,\n    backgroundColor: Colors.light.backgroundSecondary,\n    justifyContent: 'center',\n    alignItems: 'center',\n  },\n  content: {\n    paddingHorizontal: 20,\n    paddingBottom: 20,\n  },\n  title: {\n    fontSize: 24,\n    fontWeight: '800',\n    color: Colors.light.text,\n    textAlign: 'center',\n    marginBottom: 8,\n  },\n  subtitle: {\n    fontSize: 16,\n    color: Colors.light.textMuted,\n    textAlign: 'center',\n    marginBottom: 20,\n  },\n  warningBox: {\n    backgroundColor: Colors.light.error + '10',\n    borderRadius: 12,\n    padding: 16,\n    borderLeftWidth: 4,\n    borderLeftColor: Colors.light.error,\n    marginBottom: 20,\n  },\n  warningTitle: {\n    fontSize: 16,\n    fontWeight: '700',\n    color: Colors.light.error,\n    marginBottom: 8,\n  },\n  warningText: {\n    fontSize: 14,\n    color: Colors.light.text,\n    lineHeight: 20,\n  },\n  inputSection: {\n    marginBottom: 20,\n  },\n  inputLabel: {\n    fontSize: 16,\n    color: Colors.light.text,\n    marginBottom: 8,\n    fontWeight: '600',\n  },\n  deleteText: {\n    color: Colors.light.error,\n    fontWeight: '800',\n  },\n  input: {\n    borderWidth: 2,\n    borderColor: Colors.light.border,\n    borderRadius: 12,\n    paddingHorizontal: 16,\n    paddingVertical: 12,\n    fontSize: 16,\n    color: Colors.light.text,\n    backgroundColor: Colors.light.backgroundSecondary,\n  },\n  userInfo: {\n    backgroundColor: Colors.light.backgroundSecondary,\n    borderRadius: 8,\n    padding: 12,\n    marginBottom: 20,\n  },\n  userInfoText: {\n    fontSize: 14,\n    color: Colors.light.textMuted,\n    textAlign: 'center',\n  },\n  actions: {\n    flexDirection: 'row',\n    paddingHorizontal: 20,\n    paddingBottom: 20,\n    gap: 12,\n  },\n  cancelButton: {\n    flex: 1,\n    paddingVertical: 16,\n    borderRadius: 12,\n    backgroundColor: Colors.light.backgroundSecondary,\n    alignItems: 'center',\n  },\n  cancelButtonText: {\n    fontSize: 16,\n    fontWeight: '600',\n    color: Colors.light.text,\n  },\n  deleteButton: {\n    flex: 1,\n    borderRadius: 12,\n    overflow: 'hidden',\n  },\n  deleteButtonDisabled: {\n    opacity: 0.5,\n  },\n  deleteButtonGradient: {\n    paddingVertical: 16,\n    alignItems: 'center',\n  },\n  deleteButtonText: {\n    fontSize: 16,\n    fontWeight: '700',\n    color: Colors.light.background,\n  },\n  loadingContainer: {\n    flexDirection: 'row',\n    alignItems: 'center',\n    gap: 8,\n  },\n});"