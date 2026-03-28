import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import { X, Bell, Smartphone, Mail, MessageSquare } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import { showAlert } from '@/utils/platform-utils';

interface NotificationSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  visible,
  onClose,
}) => {
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    promotions: true,
    driverMessages: true,
    soundEnabled: true,
    vibrationEnabled: true,
  });

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Here you would typically save to backend or local storage
    showAlert('Success', 'Notification settings saved successfully!', [
      {
        text: 'OK',
        onPress: onClose,
      },
    ]);
  };

  const notificationTypes = [
    {
      id: 'pushNotifications',
      title: 'Push Notifications',
      subtitle: 'Receive notifications on your device',
      icon: Smartphone,
      value: settings.pushNotifications,
    },
    {
      id: 'emailNotifications',
      title: 'Email Notifications',
      subtitle: 'Receive updates via email',
      icon: Mail,
      value: settings.emailNotifications,
    },
    {
      id: 'smsNotifications',
      title: 'SMS Notifications',
      subtitle: 'Receive text messages for important updates',
      icon: MessageSquare,
      value: settings.smsNotifications,
    },
  ];

  const contentTypes = [
    {
      id: 'orderUpdates',
      title: 'Order Updates',
      subtitle: 'Status changes, delivery confirmations',
      value: settings.orderUpdates,
    },
    {
      id: 'promotions',
      title: 'Promotions & Offers',
      subtitle: 'Special deals and discounts',
      value: settings.promotions,
    },
    {
      id: 'driverMessages',
      title: 'Driver Messages',
      subtitle: 'Messages from your delivery driver',
      value: settings.driverMessages,
    },
  ];

  const deviceSettings = [
    {
      id: 'soundEnabled',
      title: 'Sound',
      subtitle: 'Play notification sounds',
      value: settings.soundEnabled,
    },
    {
      id: 'vibrationEnabled',
      title: 'Vibration',
      subtitle: 'Vibrate for notifications',
      value: settings.vibrationEnabled,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'web' ? 'overFullScreen' : 'pageSheet'}
      transparent={Platform.OS === 'web'}
    >
      <SafeAreaView style={[styles.container, Platform.OS === 'web' && styles.webContainer]}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={[colors.warning, '#F59E0B']}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <Bell size={24} color={colors.background} />
              <Text style={styles.title}>Notification Settings</Text>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <X size={24} color={colors.background} />
            </TouchableOpacity>
          </LinearGradient>
          
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notification Methods</Text>
              <View style={styles.settingsList}>
                {notificationTypes.map((item) => (
                  <View key={item.id} style={styles.settingItem}>
                    <View style={styles.settingIcon}>
                      <item.icon size={20} color={colors.primary} />
                    </View>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingTitle}>{item.title}</Text>
                      <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                    </View>
                    <Switch
                      value={item.value}
                      onValueChange={(value) => updateSetting(item.id, value)}
                      trackColor={{ false: colors.border, true: colors.primary + '40' }}
                      thumbColor={item.value ? colors.primary : colors.textMuted}
                    />
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Content Types</Text>
              <View style={styles.settingsList}>
                {contentTypes.map((item) => (
                  <View key={item.id} style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingTitle}>{item.title}</Text>
                      <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                    </View>
                    <Switch
                      value={item.value}
                      onValueChange={(value) => updateSetting(item.id, value)}
                      trackColor={{ false: colors.border, true: colors.success + '40' }}
                      thumbColor={item.value ? colors.success : colors.textMuted}
                    />
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Device Settings</Text>
              <View style={styles.settingsList}>
                {deviceSettings.map((item) => (
                  <View key={item.id} style={styles.settingItem}>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingTitle}>{item.title}</Text>
                      <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                    </View>
                    <Switch
                      value={item.value}
                      onValueChange={(value) => updateSetting(item.id, value)}
                      trackColor={{ false: colors.border, true: colors.accent + '40' }}
                      thumbColor={item.value ? colors.accent : colors.textMuted}
                    />
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                💡 You can change these settings anytime. Some notifications may be required for security and order updates.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.saveButtonGradient}
              >
                <Text style={styles.saveButtonText}>Save Settings</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  settingsList: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: colors.info + '20',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
    marginVertical: 16,
  },
  infoText: {
    fontSize: 14,
    color: colors.info,
    lineHeight: 20,
  },
  actions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.background,
  },
});