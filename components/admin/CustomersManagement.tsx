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
  User, 
  Phone, 
  Mail, 
  Package, 
  DollarSign,
  Calendar,
  Pause,
  Trash2,
  Eye,
  Edit
} from 'lucide-react-native';
import colors from '@/constants/colors';
// Mock customer interface
interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  rating: number;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt?: string;
  lastOrderDate?: string;
}

interface CustomerCardProps {
  customer: Customer;
  onSuspend: (customerId: string) => void;
  onDelete: (customerId: string) => void;
  onViewDetails: (customer: Customer) => void;
}

function CustomerCard({ customer, onSuspend, onDelete, onViewDetails }: CustomerCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return colors.success;
      case 'suspended': return colors.error;
      default: return colors.textMuted;
    }
  };

  const getStatusText = (status: string) => {
    return status.toUpperCase();
  };

  return (
    <View style={styles.customerCard}>
      <View style={styles.customerHeader}>
        <View style={styles.customerInfo}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {customer.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.customerName}>{customer.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(customer.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(customer.status) }]}>
                {getStatusText(customer.status)}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.joinDate}>
          Joined: {new Date(customer.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.customerDetails}>
        <View style={styles.contactInfo}>
          <View style={styles.contactRow}>
            <Mail size={16} color={colors.textMuted} />
            <Text style={styles.contactText}>{customer.email}</Text>
          </View>
          <View style={styles.contactRow}>
            <Phone size={16} color={colors.textMuted} />
            <Text style={styles.contactText}>{customer.phone}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Package size={16} color={colors.textMuted} />
            <Text style={styles.statText}>{customer.totalOrders} orders</Text>
          </View>
          <View style={styles.statItem}>
            <DollarSign size={16} color={colors.textMuted} />
            <Text style={styles.statText}>KES {customer.totalSpent.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.customerActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => onViewDetails(customer)}
        >
          <Eye size={16} color={colors.background} />
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
        
        {customer.status === 'active' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.suspendButton]}
            onPress={() => onSuspend(customer.id)}
          >
            <Pause size={16} color={colors.background} />
            <Text style={styles.suspendButtonText}>Suspend</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => onDelete(customer.id)}
        >
          <Trash2 size={16} color={colors.background} />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface CustomerDetailsModalProps {
  visible: boolean;
  customer: Customer | null;
  onClose: () => void;
}

function CustomerDetailsModal({ visible, customer, onClose }: CustomerDetailsModalProps) {
  if (!customer) return null;

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
            <Text style={styles.modalTitle}>Customer Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name:</Text>
                <Text style={styles.detailValue}>{customer.name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue}>{customer.email}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone:</Text>
                <Text style={styles.detailValue}>{customer.phone}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text style={[styles.detailValue, { 
                  color: customer.status === 'active' ? colors.success : colors.error 
                }]}>
                  {customer.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Order Statistics</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Orders:</Text>
                <Text style={styles.detailValue}>{customer.totalOrders}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Total Spent:</Text>
                <Text style={styles.detailValue}>KES {customer.totalSpent.toLocaleString()}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Average Order Value:</Text>
                <Text style={styles.detailValue}>
                  KES {customer.totalOrders > 0 ? (customer.totalSpent / customer.totalOrders).toFixed(0) : '0'}
                </Text>
              </View>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Account Information</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Member Since:</Text>
                <Text style={styles.detailValue}>
                  {new Date(customer.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Last Updated:</Text>
                <Text style={styles.detailValue}>
                  {new Date(customer.updatedAt || customer.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// Mock customers data
const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+254712345678',
    totalOrders: 15,
    totalSpent: 4500,
    rating: 4.8,
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:20:00Z'
  },
  {
    id: '2',
    name: 'Mary Smith',
    email: 'mary@example.com',
    phone: '+254723456789',
    totalOrders: 8,
    totalSpent: 2400,
    rating: 4.5,
    status: 'active',
    createdAt: '2024-02-01T09:15:00Z',
    updatedAt: '2024-02-05T16:45:00Z'
  }
];

export function CustomersManagement() {
  const customers = mockCustomers;
  const isLoading = false;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const filteredCustomers = customers.filter((customer: Customer) => {
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleSuspend = async (customerId: string) => {
    Alert.alert(
      'Suspend Customer',
      'Are you sure you want to suspend this customer?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Suspend', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Customer suspended successfully');
          }
        }
      ]
    );
  };

  const handleDelete = async (customerId: string) => {
    Alert.alert(
      'Delete Customer',
      'Are you sure you want to delete this customer? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Customer deleted successfully');
          }
        }
      ]
    );
  };

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
  };

  const statusOptions = [
    { value: 'all', label: 'All Customers' },
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search customers..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textMuted}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
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
        </View>
      )}

      <ScrollView style={styles.customersList} showsVerticalScrollIndicator={false}>
        {filteredCustomers.length === 0 ? (
          <View style={styles.emptyState}>
            <User size={48} color={colors.textMuted} />
            <Text style={styles.emptyStateText}>No customers found</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Customers will appear here when they register'
              }
            </Text>
          </View>
        ) : (
          filteredCustomers.map((customer: Customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onSuspend={handleSuspend}
              onDelete={handleDelete}
              onViewDetails={handleViewDetails}
            />
          ))
        )}
      </ScrollView>

      <CustomerDetailsModal
        visible={showDetailsModal}
        customer={selectedCustomer}
        onClose={() => setShowDetailsModal(false)}
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
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.text,
  },
  filterButton: {
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.background,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  filterChipTextActive: {
    color: colors.background,
    fontWeight: '600',
  },
  customersList: {
    flex: 1,
  },
  customerCard: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.background,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  joinDate: {
    fontSize: 14,
    color: colors.textMuted,
  },
  customerDetails: {
    marginBottom: 16,
  },
  contactInfo: {
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 4,
    fontSize: 14,
    color: colors.textMuted,
  },
  customerActions: {
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
  viewButton: {
    backgroundColor: colors.info,
  },
  viewButtonText: {
    color: colors.background,
    fontWeight: '600',
    fontSize: 14,
  },
  suspendButton: {
    backgroundColor: colors.warning,
  },
  suspendButtonText: {
    color: colors.background,
    fontWeight: '600',
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  deleteButtonText: {
    color: colors.background,
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
    color: colors.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textMuted,
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
    backgroundColor: colors.background,
    borderRadius: 12,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.textMuted,
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
});