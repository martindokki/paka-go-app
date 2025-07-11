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
  Search, 
  Filter, 
  MessageSquare, 
  User, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Send,
  Eye,
  UserCheck
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { useAdminStore, SupportQuery } from '@/stores/admin-store';

interface QueryCardProps {
  query: SupportQuery;
  onAssign: (queryId: string) => void;
  onRespond: (query: SupportQuery) => void;
  onUpdateStatus: (queryId: string, status: SupportQuery['status']) => void;
}

function QueryCard({ query, onAssign, onRespond, onUpdateStatus }: QueryCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return colors.light.error;
      case 'in_progress': return colors.light.warning;
      case 'resolved': return colors.light.success;
      default: return colors.light.textMuted;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return colors.light.error;
      case 'medium': return colors.light.warning;
      case 'low': return colors.light.info;
      default: return colors.light.textMuted;
    }
  };

  const getStatusText = (status: string) => {
    return status.replace('_', ' ').toUpperCase();
  };

  const getPriorityText = (priority: string) => {
    return priority.toUpperCase();
  };

  return (
    <View style={styles.queryCard}>
      <View style={styles.queryHeader}>
        <View style={styles.queryInfo}>
          <Text style={styles.querySubject}>{query.subject}</Text>
          <View style={styles.badges}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(query.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(query.status) }]}>
                {getStatusText(query.status)}
              </Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(query.priority) + '20' }]}>
              <Text style={[styles.priorityText, { color: getPriorityColor(query.priority) }]}>
                {getPriorityText(query.priority)}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.queryDate}>
          {new Date(query.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.queryDetails}>
        <View style={styles.customerInfo}>
          <User size={16} color={colors.light.textMuted} />
          <Text style={styles.customerName}>{query.userName}</Text>
        </View>
        
        <Text style={styles.queryMessage} numberOfLines={3}>
          {query.message}
        </Text>
        
        {query.assignedTo && (
          <View style={styles.assignedInfo}>
            <UserCheck size={16} color={colors.light.info} />
            <Text style={styles.assignedText}>Assigned to: {query.assignedTo}</Text>
          </View>
        )}
        
        {query.response && (
          <View style={styles.responseInfo}>
            <Text style={styles.responseLabel}>Response:</Text>
            <Text style={styles.responseText} numberOfLines={2}>
              {query.response}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.queryActions}>
        {query.status === 'open' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.assignButton]}
            onPress={() => onAssign(query.id)}
          >
            <UserCheck size={16} color={colors.light.background} />
            <Text style={styles.assignButtonText}>Assign to Me</Text>
          </TouchableOpacity>
        )}
        
        {query.status === 'in_progress' && !query.response && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.respondButton]}
            onPress={() => onRespond(query)}
          >
            <Send size={16} color={colors.light.background} />
            <Text style={styles.respondButtonText}>Respond</Text>
          </TouchableOpacity>
        )}
        
        {query.status === 'in_progress' && query.response && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.resolveButton]}
            onPress={() => onUpdateStatus(query.id, 'resolved')}
          >
            <CheckCircle size={16} color={colors.light.background} />
            <Text style={styles.resolveButtonText}>Mark Resolved</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

interface ResponseModalProps {
  visible: boolean;
  query: SupportQuery | null;
  onClose: () => void;
  onSend: (queryId: string, response: string) => void;
}

function ResponseModal({ visible, query, onClose, onSend }: ResponseModalProps) {
  const [response, setResponse] = useState('');

  const handleSend = () => {
    if (!response.trim()) {
      Alert.alert('Error', 'Please enter a response');
      return;
    }

    if (query) {
      onSend(query.id, response.trim());
      setResponse('');
      onClose();
    }
  };

  React.useEffect(() => {
    if (!visible) {
      setResponse('');
    }
  }, [visible]);

  if (!query) return null;

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
            <Text style={styles.modalTitle}>Respond to Query</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalBody}>
            <View style={styles.queryPreview}>
              <Text style={styles.previewLabel}>Subject:</Text>
              <Text style={styles.previewText}>{query.subject}</Text>
              
              <Text style={styles.previewLabel}>Customer:</Text>
              <Text style={styles.previewText}>{query.userName}</Text>
              
              <Text style={styles.previewLabel}>Message:</Text>
              <Text style={styles.previewText}>{query.message}</Text>
            </View>
            
            <View style={styles.responseSection}>
              <Text style={styles.responseLabel}>Your Response:</Text>
              <TextInput
                style={styles.responseInput}
                value={response}
                onChangeText={setResponse}
                placeholder="Type your response here..."
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                placeholderTextColor={colors.light.textMuted}
              />
            </View>
          </View>
          
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
              <Text style={styles.sendButtonText}>Send Response</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function SupportManagement() {
  const { 
    supportQueries, 
    assignQuery, 
    respondToQuery, 
    updateQueryStatus,
    isLoading 
  } = useAdminStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<SupportQuery | null>(null);

  const filteredQueries = supportQueries.filter(query => {
    const matchesSearch = 
      query.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      query.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      query.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || query.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || query.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleAssign = async (queryId: string) => {
    const success = await assignQuery(queryId, 'current_admin'); // In real app, use actual admin ID
    if (success) {
      Alert.alert('Success', 'Query assigned successfully');
    }
  };

  const handleRespond = (query: SupportQuery) => {
    setSelectedQuery(query);
    setShowResponseModal(true);
  };

  const handleSendResponse = async (queryId: string, response: string) => {
    const success = await respondToQuery(queryId, response);
    if (success) {
      Alert.alert('Success', 'Response sent successfully');
    }
  };

  const handleUpdateStatus = async (queryId: string, status: SupportQuery['status']) => {
    const success = await updateQueryStatus(queryId, status);
    if (success) {
      Alert.alert('Success', `Query marked as ${status}`);
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priority' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.light.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search queries..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.light.textMuted}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={colors.light.primary} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={`status-${option.value}`}
                style={[
                  styles.filterChip,
                  statusFilter === option.value && styles.filterChipActive
                ]}
                onPress={() => setStatusFilter(option.value)}
              >
                <Text style={[
                  styles.filterChipText,
                  statusFilter === option.value && styles.filterChipTextActive
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.secondFilterRow}>
            {priorityOptions.map((option) => (
              <TouchableOpacity
                key={`priority-${option.value}`}
                style={[
                  styles.filterChip,
                  priorityFilter === option.value && styles.filterChipActive
                ]}
                onPress={() => setPriorityFilter(option.value)}
              >
                <Text style={[
                  styles.filterChipText,
                  priorityFilter === option.value && styles.filterChipTextActive
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView style={styles.queriesList} showsVerticalScrollIndicator={false}>
        {filteredQueries.length === 0 ? (
          <View style={styles.emptyState}>
            <MessageSquare size={48} color={colors.light.textMuted} />
            <Text style={styles.emptyStateText}>No support queries found</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Support queries will appear here when customers need help'
              }
            </Text>
          </View>
        ) : (
          filteredQueries.map((query) => (
            <QueryCard
              key={query.id}
              query={query}
              onAssign={handleAssign}
              onRespond={handleRespond}
              onUpdateStatus={handleUpdateStatus}
            />
          ))
        )}
      </ScrollView>

      <ResponseModal
        visible={showResponseModal}
        query={selectedQuery}
        onClose={() => setShowResponseModal(false)}
        onSend={handleSendResponse}
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
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.light.text,
  },
  filterButton: {
    padding: 12,
    backgroundColor: colors.light.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  secondFilterRow: {
    marginTop: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.light.background,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  filterChipActive: {
    backgroundColor: colors.light.primary,
    borderColor: colors.light.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: colors.light.textMuted,
  },
  filterChipTextActive: {
    color: colors.light.background,
    fontWeight: '600',
  },
  queriesList: {
    flex: 1,
  },
  queryCard: {
    backgroundColor: colors.light.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.light.border,
    shadowColor: colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  queryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  queryInfo: {
    flex: 1,
    marginRight: 12,
  },
  querySubject: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.light.text,
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  queryDate: {
    fontSize: 14,
    color: colors.light.textMuted,
  },
  queryDetails: {
    marginBottom: 16,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.text,
  },
  queryMessage: {
    fontSize: 14,
    color: colors.light.textMuted,
    lineHeight: 20,
    marginBottom: 8,
  },
  assignedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  assignedText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.light.info,
    fontWeight: '500',
  },
  responseInfo: {
    backgroundColor: colors.light.backgroundSecondary,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  responseLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.light.textMuted,
    marginBottom: 4,
  },
  responseText: {
    fontSize: 14,
    color: colors.light.text,
    lineHeight: 18,
  },
  queryActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  assignButton: {
    backgroundColor: colors.light.primary,
  },
  assignButtonText: {
    color: colors.light.background,
    fontWeight: '600',
    fontSize: 14,
  },
  respondButton: {
    backgroundColor: colors.light.info,
  },
  respondButtonText: {
    color: colors.light.background,
    fontWeight: '600',
    fontSize: 14,
  },
  resolveButton: {
    backgroundColor: colors.light.success,
  },
  resolveButtonText: {
    color: colors.light.background,
    fontWeight: '600',
    fontSize: 14,
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
    maxHeight: '80%',
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
    padding: 20,
  },
  queryPreview: {
    backgroundColor: colors.light.backgroundSecondary,
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.light.textMuted,
    marginBottom: 4,
    marginTop: 8,
  },
  previewText: {
    fontSize: 14,
    color: colors.light.text,
    lineHeight: 18,
  },
  responseSection: {
    marginBottom: 20,
  },
  responseInput: {
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.light.text,
    backgroundColor: colors.light.backgroundSecondary,
    minHeight: 120,
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
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.light.backgroundSecondary,
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.light.textMuted,
    fontWeight: '600',
  },
  sendButton: {
    backgroundColor: colors.light.primary,
  },
  sendButtonText: {
    fontSize: 16,
    color: colors.light.background,
    fontWeight: '600',
  },
});