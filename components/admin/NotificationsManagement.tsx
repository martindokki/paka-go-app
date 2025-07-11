import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  Modal
} from 'react-native';
import { 
  Bell, 
  Send, 
  Users, 
  Truck, 
  User,
  Plus,
  MessageSquare,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { useAdminStore } from '@/stores/admin-store';

interface NotificationTemplateProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  onSelect: () => void;
}

function NotificationTemplate({ title, description, icon: IconComponent, onSelect }: NotificationTemplateProps) {
  return (
    <TouchableOpacity style={styles.templateCard} onPress={onSelect}>
      <View style={styles.templateIcon}>
        <IconComponent size={24} color={colors.light.primary} />
      </View>
      <View style={styles.templateContent}>
        <Text style={styles.templateTitle}>{title}</Text>
        <Text style={styles.templateDescription}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
}

interface SendNotificationModalProps {
  visible: boolean;
  onClose: () => void;
  onSend: (type: 'all_users' | 'all_drivers' | 'specific', message: string, userIds?: string[]) => void;
}

function SendNotificationModal({ visible, onClose, onSend }: SendNotificationModalProps) {
  const [selectedType, setSelectedType] = useState<'all_users' | 'all_drivers' | 'specific'>('all_users');
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');

  const handleSend = () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in both title and message');
      return;
    }

    const fullMessage = `${title.trim()}\n\n${message.trim()}`;
    onSend(selectedType, fullMessage);
    
    // Reset form
    setTitle('');
    setMessage('');
    setSelectedType('all_users');
  };

  React.useEffect(() => {
    if (!visible) {
      setTitle('');
      setMessage('');
      setSelectedType('all_users');
    }
  }, [visible]);

  const notificationTypes = [
    { 
      value: 'all_users' as const, 
      label: 'All Users', 
      description: 'Send to all customers',
      icon: Users 
    },
    { 
      value: 'all_drivers' as const, 
      label: 'All Drivers', 
      description: 'Send to all drivers',
      icon: Truck 
    },
    { 
      value: 'specific' as const, 
      label: 'Specific Users', 
      description: 'Send to selected users',
      icon: Target 
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Send Notification</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Recipient Type</Text>
              {notificationTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeOption,
                      selectedType === type.value && styles.typeOptionSelected
                    ]}
                    onPress={() => setSelectedType(type.value)}
                  >
                    <View style={styles.typeOptionContent}>
                      <IconComponent 
                        size={20} 
                        color={selectedType === type.value ? colors.light.primary : colors.light.textMuted} 
                      />
                      <View style={styles.typeOptionText}>
                        <Text style={[
                          styles.typeOptionLabel,
                          selectedType === type.value && styles.typeOptionLabelSelected
                        ]}>
                          {type.label}
                        </Text>
                        <Text style={styles.typeOptionDescription}>{type.description}</Text>
                      </View>
                    </View>
                    {selectedType === type.value && (
                      <CheckCircle size={20} color={colors.light.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Notification Details</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Title *</Text>
                <TextInput
                  style={styles.formInput}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Enter notification title"
                  placeholderTextColor={colors.light.textMuted}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Message *</Text>
                <TextInput
                  style={[styles.formInput, styles.messageInput]}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Enter your message here..."
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  placeholderTextColor={colors.light.textMuted}
                />
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.sendButton]}
              onPress={handleSend}
            >
              <Send size={16} color={colors.light.background} />
              <Text style={styles.sendButtonText}>Send Notification</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function NotificationsManagement() {
  const { sendNotification, isLoading } = useAdminStore();
  const [showSendModal, setShowSendModal] = useState(false);

  const handleSendNotification = async (
    type: 'all_users' | 'all_drivers' | 'specific', 
    message: string, 
    userIds?: string[]
  ) => {
    const success = await sendNotification(type, message, userIds);
    if (success) {
      Alert.alert('Success', 'Notification sent successfully');
      setShowSendModal(false);
    } else {
      Alert.alert('Error', 'Failed to send notification');
    }
  };

  const notificationTemplates = [
    {
      title: 'Service Update',
      description: 'Notify users about service updates or maintenance',
      icon: Bell,
      message: 'Service Update\n\nWe are performing scheduled maintenance to improve our services. You may experience brief interruptions.',
    },
    {
      title: 'Promotional Offer',
      description: 'Send promotional offers and discounts',
      icon: MessageSquare,
      message: 'Special Offer!\n\nGet 20% off your next delivery! Use code SAVE20 at checkout. Valid until end of month.',
    },
    {
      title: 'Driver Alert',
      description: 'Important alerts for drivers',
      icon: Truck,
      message: 'Driver Alert\n\nPlease ensure you follow all safety protocols during deliveries. Thank you for your service!',
    },
    {
      title: 'Policy Update',
      description: 'Notify about policy changes',
      icon: Users,
      message: 'Policy Update\n\nWe have updated our terms of service. Please review the changes in your account settings.',
    },
  ];

  const handleTemplateSelect = (template: typeof notificationTemplates[0]) => {
    // Pre-fill the modal with template data
    setShowSendModal(true);
  };

  const recentNotifications = [
    {
      id: '1',
      title: 'Service Maintenance',
      message: 'Scheduled maintenance completed successfully',
      type: 'all_users',
      sentAt: '2024-01-20T15:30:00Z',
      recipients: 850,
    },
    {
      id: '2',
      title: 'Driver Safety Reminder',
      message: 'Please follow all safety protocols',
      type: 'all_drivers',
      sentAt: '2024-01-20T10:15:00Z',
      recipients: 120,
    },
    {
      id: '3',
      title: 'New Year Promotion',
      message: '20% off all deliveries this week!',
      type: 'all_users',
      sentAt: '2024-01-19T09:00:00Z',
      recipients: 850,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.sendButton}
          onPress={() => setShowSendModal(true)}
        >
          <Plus size={20} color={colors.light.background} />
          <Text style={styles.sendButtonText}>Send Notification</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Templates</Text>
          <Text style={styles.sectionDescription}>
            Use these pre-made templates to send common notifications
          </Text>
          
          <View style={styles.templatesGrid}>
            {notificationTemplates.map((template, index) => (
              <NotificationTemplate
                key={index}
                title={template.title}
                description={template.description}
                icon={template.icon}
                onSelect={() => handleTemplateSelect(template)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Notifications</Text>
          <Text style={styles.sectionDescription}>
            View recently sent notifications
          </Text>
          
          <View style={styles.notificationsList}>
            {recentNotifications.map((notification) => (
              <View key={notification.id} style={styles.notificationCard}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationDate}>
                    {new Date(notification.sentAt).toLocaleDateString()}
                  </Text>
                </View>
                
                <Text style={styles.notificationMessage} numberOfLines={2}>
                  {notification.message}
                </Text>
                
                <View style={styles.notificationFooter}>
                  <View style={styles.notificationMeta}>
                    <Text style={styles.notificationMetaText}>
                      Sent to: {notification.type.replace('_', ' ')}
                    </Text>
                    <Text style={styles.notificationMetaText}>
                      Recipients: {notification.recipients}
                    </Text>
                  </View>
                  
                  <View style={styles.notificationStatus}>
                    <CheckCircle size={16} color={colors.light.success} />
                    <Text style={styles.notificationStatusText}>Delivered</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Statistics</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Send size={24} color={colors.light.primary} />
              </View>
              <Text style={styles.statValue}>127</Text>
              <Text style={styles.statLabel}>Total Sent</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <CheckCircle size={24} color={colors.light.success} />
              </View>
              <Text style={styles.statValue}>98.5%</Text>
              <Text style={styles.statLabel}>Delivery Rate</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Clock size={24} color={colors.light.info} />
              </View>
              <Text style={styles.statValue}>15</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <SendNotificationModal
        visible={showSendModal}
        onClose={() => setShowSendModal(false)}
        onSend={handleSendNotification}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  sendButtonText: {
    color: colors.light.background,
    fontWeight: '600',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.light.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.light.textMuted,
    marginBottom: 16,
  },
  templatesGrid: {
    gap: 12,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
    shadowColor: colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  templateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  templateContent: {
    flex: 1,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    color: colors.light.textMuted,
  },
  notificationsList: {
    gap: 12,
  },
  notificationCard: {
    backgroundColor: colors.light.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
    shadowColor: colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.text,
  },
  notificationDate: {
    fontSize: 14,
    color: colors.light.textMuted,
  },
  notificationMessage: {
    fontSize: 14,
    color: colors.light.textMuted,
    lineHeight: 20,
    marginBottom: 12,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationMeta: {
    flex: 1,
  },
  notificationMetaText: {
    fontSize: 12,
    color: colors.light.textMuted,
    marginBottom: 2,
  },
  notificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notificationStatusText: {
    fontSize: 12,
    color: colors.light.success,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.light.background,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.light.border,
    shadowColor: colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.light.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.light.textMuted,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.light.background,
    borderRadius: 12,
    width: '90%',
    maxWidth: 600,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.light.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.light.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.light.textMuted,
  },
  modalBody: {
    maxHeight: 400,
  },
  formSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
    marginBottom: 8,
  },
  typeOptionSelected: {
    borderColor: colors.light.primary,
    backgroundColor: colors.light.primaryLight,
  },
  typeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeOptionText: {
    marginLeft: 12,
    flex: 1,
  },
  typeOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.text,
  },
  typeOptionLabelSelected: {
    color: colors.light.primary,
  },
  typeOptionDescription: {
    fontSize: 14,
    color: colors.light.textMuted,
    marginTop: 2,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.light.text,
    backgroundColor: colors.light.backgroundSecondary,
  },
  messageInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: colors.light.backgroundSecondary,
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.light.textMuted,
    fontWeight: '600',
  },
});