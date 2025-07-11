import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import colors from '@/constants/colors';

interface SettingsItemProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  destructive?: boolean;
  disabled?: boolean;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  showChevron = true,
  destructive = false,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.settingsItem,
        disabled && styles.settingsItemDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View style={styles.settingsItemContent}>
        {icon && (
          <View style={styles.iconContainer}>
            {icon}
          </View>
        )}
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.settingsItemTitle,
              destructive && styles.destructiveText,
              disabled && styles.disabledText,
            ]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.settingsItemSubtitle}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {showChevron && !disabled && (
        <ChevronRight
          size={20}
          color={destructive ? colors.error : colors.textMuted}
        />
      )}
    </TouchableOpacity>
  );
};

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  children,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingsItemDisabled: {
    opacity: 0.5,
  },
  settingsItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  settingsItemSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  destructiveText: {
    color: colors.error,
  },
  disabledText: {
    color: colors.textMuted,
  },
});