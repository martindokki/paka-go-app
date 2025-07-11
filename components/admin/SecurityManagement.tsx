import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  Switch
} from 'react-native';
import { 
  Shield, 
  Eye, 
  Lock, 
  Users, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Smartphone,
  Key,
  UserX,
  RefreshCw
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { useAdminStore, ActivityLog } from '@/stores/admin-store';

interface SecurityCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  children: React.ReactNode;
}

function SecurityCard({ title, description, icon: IconComponent, children }: SecurityCardProps) {
  return (
    <View style={styles.securityCard}>
      <View style={styles.securityHeader}>
        <View style={styles.securityIcon}>
          <IconComponent size={24} color={colors.light.primary} />
        </View>
        <View style={styles.securityInfo}>
          <Text style={styles.securityTitle}>{title}</Text>
          <Text style={styles.securityDescription}>{description}</Text>
        </View>
      </View>
      <View style={styles.securityContent}>
        {children}
      </View>
    </View>
  );
}

interface ActivityLogItemProps {
  log: ActivityLog;
}

function ActivityLogItem({ log }: ActivityLogItemProps) {
  const getActionColor = (action: string) => {
    if (action.toLowerCase().includes('delete') || action.toLowerCase().includes('suspend')) {
      return colors.light.error;
    }
    if (action.toLowerCase().includes('approve') || action.toLowerCase().includes('create')) {
      return colors.light.success;
    }
    if (action.toLowerCase().includes('update') || action.toLowerCase().includes('edit')) {
      return colors.light.warning;
    }
    return colors.light.info;
  };

  return (
    <View style={styles.logItem}>
      <View style={styles.logHeader}>
        <View style={styles.logInfo}>
          <Text style={styles.logAction}>{log.action}</Text>
          <Text style={styles.logAdmin}>by {log.adminName}</Text>
        </View>
        <Text style={styles.logTime}>
          {new Date(log.timestamp).toLocaleString()}
        </Text>
      </View>
      
      <Text style={styles.logDetails}>{log.details}</Text>
      
      <View style={styles.logFooter}>
        <View style={styles.logMeta}>
          <MapPin size={12} color={colors.light.textMuted} />
          <Text style={styles.logMetaText}>{log.ipAddress}</Text>
        </View>
        <View style={[styles.logStatus, { backgroundColor: getActionColor(log.action) + '20' }]}>
          <Text style={[styles.logStatusText, { color: getActionColor(log.action) }]}>
            {log.action.split(' ')[0]}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function SecurityManagement() {
  const { activityLogs, fetchActivityLogs, isLoading } = useAdminStore();
  
  // Security settings state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [maxLoginAttempts, setMaxLoginAttempts] = useState('5');
  const [ipWhitelistEnabled, setIpWhitelistEnabled] = useState(false);
  const [auditLogsRetention, setAuditLogsRetention] = useState('90');

  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const filteredLogs = activityLogs.filter(log =>
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefreshLogs = async () => {
    await fetchActivityLogs();
  };

  const handleSaveSecuritySettings = () => {
    Alert.alert(
      'Save Security Settings',
      'Are you sure you want to update security settings?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: () => {
            // In a real app, this would call an API
            Alert.alert('Success', 'Security settings updated successfully');
          }
        }
      ]
    );
  };

  const handleRevokeAllSessions = () => {
    Alert.alert(
      'Revoke All Sessions',
      'This will log out all admin users. They will need to log in again. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke All',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'All admin sessions have been revoked');
          }
        }
      ]
    );
  };

  const securityStats = {
    totalLogins: 156,
    failedAttempts: 12,
    activeSessions: 3,
    suspiciousActivity: 2,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => setShowSettings(!showSettings)}
        >
          <Lock size={16} color={colors.light.primary} />
          <Text style={styles.settingsButtonText}>Security Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefreshLogs}
        >
          <RefreshCw size={16} color={colors.light.textMuted} />
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Security Overview */}
        <SecurityCard
          title="Security Overview"
          description="Monitor system security metrics and alerts"
          icon={Shield}
        >
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Users size={20} color={colors.light.success} />
              </View>
              <Text style={styles.statValue}>{securityStats.totalLogins}</Text>
              <Text style={styles.statLabel}>Total Logins</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <AlertTriangle size={20} color={colors.light.error} />
              </View>
              <Text style={styles.statValue}>{securityStats.failedAttempts}</Text>
              <Text style={styles.statLabel}>Failed Attempts</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Activity size={20} color={colors.light.info} />
              </View>
              <Text style={styles.statValue}>{securityStats.activeSessions}</Text>
              <Text style={styles.statLabel}>Active Sessions</Text>
            </View>
            
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Eye size={20} color={colors.light.warning} />
              </View>
              <Text style={styles.statValue}>{securityStats.suspiciousActivity}</Text>
              <Text style={styles.statLabel}>Suspicious Activity</Text>
            </View>
          </View>
        </SecurityCard>

        {/* Security Settings */}
        {showSettings && (
          <SecurityCard
            title="Security Configuration"
            description="Configure system security settings and policies"
            icon={Lock}
          >
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Two-Factor Authentication</Text>
                <Text style={styles.settingDesc}>Require 2FA for all admin accounts</Text>
              </View>
              <Switch
                value={twoFactorEnabled}
                onValueChange={setTwoFactorEnabled}
                trackColor={{ false: colors.light.border, true: colors.light.primaryLight }}
                thumbColor={twoFactorEnabled ? colors.light.primary : colors.light.textMuted}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>IP Whitelist</Text>
                <Text style={styles.settingDesc}>Restrict access to specific IP addresses</Text>
              </View>
              <Switch
                value={ipWhitelistEnabled}
                onValueChange={setIpWhitelistEnabled}
                trackColor={{ false: colors.light.border, true: colors.light.primaryLight }}
                thumbColor={ipWhitelistEnabled ? colors.light.primary : colors.light.textMuted}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Session Timeout (minutes)</Text>
                <TextInput
                  style={styles.input}
                  value={sessionTimeout}
                  onChangeText={setSessionTimeout}
                  keyboardType="numeric"
                  placeholderTextColor={colors.light.textMuted}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Max Login Attempts</Text>
                <TextInput
                  style={styles.input}
                  value={maxLoginAttempts}
                  onChangeText={setMaxLoginAttempts}
                  keyboardType="numeric"
                  placeholderTextColor={colors.light.textMuted}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Audit Logs Retention (days)</Text>
              <TextInput
                style={styles.input}
                value={auditLogsRetention}
                onChangeText={setAuditLogsRetention}
                keyboardType="numeric"
                placeholderTextColor={colors.light.textMuted}
              />
            </View>

            <View style={styles.settingActions}>
              <TouchableOpacity 
                style={styles.revokeButton}
                onPress={handleRevokeAllSessions}
              >
                <UserX size={16} color={colors.light.background} />
                <Text style={styles.revokeButtonText}>Revoke All Sessions</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveSecuritySettings}
              >
                <CheckCircle size={16} color={colors.light.background} />
                <Text style={styles.saveButtonText}>Save Settings</Text>
              </TouchableOpacity>
            </View>
          </SecurityCard>
        )}

        {/* Activity Logs */}
        <SecurityCard
          title="Activity Logs"
          description="Monitor all admin actions and system events"
          icon={Activity}
        >
          <View style={styles.logsHeader}>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search activity logs..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={colors.light.textMuted}
              />
            </View>
          </View>

          <View style={styles.logsList}>
            {filteredLogs.length === 0 ? (
              <View style={styles.emptyState}>
                <Activity size={48} color={colors.light.textMuted} />
                <Text style={styles.emptyStateText}>No activity logs found</Text>
                <Text style={styles.emptyStateSubtext}>
                  {searchQuery 
                    ? 'Try adjusting your search query'
                    : 'Activity logs will appear here as admins perform actions'
                  }
                </Text>
              </View>
            ) : (
              filteredLogs.map((log) => (
                <ActivityLogItem key={log.id} log={log} />
              ))
            )}
          </View>
        </SecurityCard>

        {/* Security Alerts */}
        <SecurityCard
          title="Security Alerts"
          description="Recent security events and notifications"
          icon={AlertTriangle}
        >
          <View style={styles.alertsList}>
            <View style={styles.alertItem}>
              <View style={styles.alertIcon}>
                <AlertTriangle size={20} color={colors.light.warning} />
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>Multiple Failed Login Attempts</Text>
                <Text style={styles.alertDescription}>
                  5 failed login attempts from IP 192.168.1.100
                </Text>
                <Text style={styles.alertTime}>2 hours ago</Text>
              </View>
            </View>

            <View style={styles.alertItem}>
              <View style={styles.alertIcon}>
                <Eye size={20} color={colors.light.info} />
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>New Admin Login</Text>
                <Text style={styles.alertDescription}>
                  Admin user logged in from new location
                </Text>
                <Text style={styles.alertTime}>4 hours ago</Text>
              </View>
            </View>

            <View style={styles.alertItem}>
              <View style={styles.alertIcon}>
                <CheckCircle size={20} color={colors.light.success} />
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>Security Scan Complete</Text>
                <Text style={styles.alertDescription}>
                  Daily security scan completed successfully
                </Text>
                <Text style={styles.alertTime}>6 hours ago</Text>
              </View>
            </View>
          </View>
        </SecurityCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.light.primaryLight,
    gap: 8,
  },
  settingsButtonText: {
    color: colors.light.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
    backgroundColor: colors.light.background,
    gap: 8,
  },
  refreshButtonText: {
    color: colors.light.textMuted,
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  securityCard: {
    backgroundColor: colors.light.background,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
    shadowColor: colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  securityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  securityInfo: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.light.text,
    marginBottom: 4,
  },
  securityDescription: {
    fontSize: 14,
    color: colors.light.textMuted,
  },
  securityContent: {
    gap: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: 120,
    alignItems: 'center',
    backgroundColor: colors.light.backgroundSecondary,
    padding: 16,
    borderRadius: 8,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.light.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.light.textMuted,
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.borderLight,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 14,
    color: colors.light.textMuted,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.light.text,
    backgroundColor: colors.light.backgroundSecondary,
  },
  settingActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  revokeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.light.error,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  revokeButtonText: {
    color: colors.light.background,
    fontWeight: '600',
    fontSize: 14,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.light.success,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonText: {
    color: colors.light.background,
    fontWeight: '600',
    fontSize: 14,
  },
  logsHeader: {
    marginBottom: 16,
  },
  searchContainer: {
    backgroundColor: colors.light.backgroundSecondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    fontSize: 16,
    color: colors.light.text,
  },
  logsList: {
    gap: 12,
  },
  logItem: {
    backgroundColor: colors.light.backgroundSecondary,
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.light.primary,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  logInfo: {
    flex: 1,
  },
  logAction: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: 2,
  },
  logAdmin: {
    fontSize: 14,
    color: colors.light.textMuted,
  },
  logTime: {
    fontSize: 12,
    color: colors.light.textMuted,
  },
  logDetails: {
    fontSize: 14,
    color: colors.light.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  logFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logMetaText: {
    fontSize: 12,
    color: colors.light.textMuted,
  },
  logStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  logStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  alertsList: {
    gap: 12,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.light.backgroundSecondary,
    padding: 16,
    borderRadius: 8,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 14,
    color: colors.light.textMuted,
    marginBottom: 4,
    lineHeight: 18,
  },
  alertTime: {
    fontSize: 12,
    color: colors.light.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.light.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.light.textMuted,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
});