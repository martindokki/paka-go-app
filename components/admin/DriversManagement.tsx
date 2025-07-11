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
  Star, 
  MapPin,
  Car,
  CheckCircle,
  XCircle,
  Pause,
  DollarSign,
  Package
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { useAdminStore, Driver } from '@/stores/admin-store';

interface DriverCardProps {
  driver: Driver;
  onApprove: (driverId: string) => void;
  onSuspend: (driverId: string) => void;
  onAssignVehicle: (driverId: string) => void;
  onViewLocation: (driver: Driver) => void;
}

function DriverCard({ driver, onApprove, onSuspend, onAssignVehicle, onViewLocation }: DriverCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return colors.light.warning;
      case 'approved': return colors.light.success;
      case 'active': return colors.light.success;
      case 'suspended': return colors.light.error;
      default: return colors.light.textMuted;
    }
  };

  const getStatusText = (status: string) => {
    return status.toUpperCase();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        color={i < Math.floor(rating) ? colors.light.warning : colors.light.border}
        fill={i < Math.floor(rating) ? colors.light.warning : 'transparent'}
      />
    ));
  };

  return (
    <View style={styles.driverCard}>
      <View style={styles.driverHeader}>
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{driver.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(driver.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(driver.status) }]}>
              {getStatusText(driver.status)}
            </Text>
          </View>
        </View>
        <Text style={styles.joinDate}>
          Joined: {new Date(driver.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.driverDetails}>
        <View style={styles.contactInfo}>
          <View style={styles.contactRow}>
            <Mail size={16} color={colors.light.textMuted} />
            <Text style={styles.contactText}>{driver.email}</Text>
          </View>
          <View style={styles.contactRow}>
            <Phone size={16} color={colors.light.textMuted} />
            <Text style={styles.contactText}>{driver.phone}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={styles.ratingContainer}>
              {renderStars(driver.rating)}
              <Text style={styles.ratingText}>{driver.rating.toFixed(1)}</Text>
            </View>
          </View>
          <View style={styles.statItem}>
            <Package size={16} color={colors.light.textMuted} />
            <Text style={styles.statText}>{driver.totalDeliveries} deliveries</Text>
          </View>
          <View style={styles.statItem}>
            <DollarSign size={16} color={colors.light.textMuted} />
            <Text style={styles.statText}>KES {driver.earnings.toLocaleString()}</Text>
          </View>
        </View>

        {driver.vehicleId && (
          <View style={styles.vehicleInfo}>
            <Car size={16} color={colors.light.textMuted} />
            <Text style={styles.vehicleText}>Vehicle: {driver.vehicleId}</Text>
          </View>
        )}
      </View>

      <View style={styles.driverActions}>
        {driver.status === 'pending' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => onApprove(driver.id)}
          >
            <CheckCircle size={16} color={colors.light.background} />
            <Text style={styles.approveButtonText}>Approve</Text>
          </TouchableOpacity>
        )}
        
        {driver.status === 'approved' && !driver.vehicleId && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.assignButton]}
            onPress={() => onAssignVehicle(driver.id)}
          >
            <Car size={16} color={colors.light.background} />
            <Text style={styles.assignButtonText}>Assign Vehicle</Text>
          </TouchableOpacity>
        )}
        
        {driver.status === 'active' && driver.location && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.locationButton]}
            onPress={() => onViewLocation(driver)}
          >
            <MapPin size={16} color={colors.light.background} />
            <Text style={styles.locationButtonText}>View Location</Text>
          </TouchableOpacity>
        )}
        
        {driver.status !== 'suspended' && driver.status !== 'pending' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.suspendButton]}
            onPress={() => onSuspend(driver.id)}
          >
            <Pause size={16} color={colors.light.background} />
            <Text style={styles.suspendButtonText}>Suspend</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export function DriversManagement() {
  const { 
    drivers, 
    vehicles,
    approveDriver, 
    suspendDriver, 
    assignVehicleToDriver,
    isLoading 
  } = useAdminStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = 
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const availableVehicles = vehicles.filter(vehicle => vehicle.status === 'available');

  const handleApprove = async (driverId: string) => {
    Alert.alert(
      'Approve Driver',
      'Are you sure you want to approve this driver?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Approve', 
          onPress: async () => {
            const success = await approveDriver(driverId);
            if (success) {
              Alert.alert('Success', 'Driver approved successfully');
            }
          }
        }
      ]
    );
  };

  const handleSuspend = async (driverId: string) => {
    Alert.alert(
      'Suspend Driver',
      'Are you sure you want to suspend this driver?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Suspend', 
          style: 'destructive',
          onPress: async () => {
            const success = await suspendDriver(driverId);
            if (success) {
              Alert.alert('Success', 'Driver suspended successfully');
            }
          }
        }
      ]
    );
  };

  const handleAssignVehicle = (driverId: string) => {
    setSelectedDriverId(driverId);
    setShowVehicleModal(true);
  };

  const handleVehicleAssignment = async (vehicleId: string) => {
    if (!selectedDriverId) return;
    
    const success = await assignVehicleToDriver(selectedDriverId, vehicleId);
    if (success) {
      Alert.alert('Success', 'Vehicle assigned successfully');
      setShowVehicleModal(false);
      setSelectedDriverId(null);
    }
  };

  const handleViewLocation = (driver: Driver) => {
    if (driver.location) {
      Alert.alert(
        'Driver Location',
        `${driver.name} is currently at:\nLat: ${driver.location.latitude.toFixed(6)}\nLng: ${driver.location.longitude.toFixed(6)}`,
        [{ text: 'OK' }]
      );
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Drivers' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.light.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search drivers..."
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

      <ScrollView style={styles.driversList} showsVerticalScrollIndicator={false}>
        {filteredDrivers.length === 0 ? (
          <View style={styles.emptyState}>
            <User size={48} color={colors.light.textMuted} />
            <Text style={styles.emptyStateText}>No drivers found</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Drivers will appear here when they register'
              }
            </Text>
          </View>
        ) : (
          filteredDrivers.map((driver) => (
            <DriverCard
              key={driver.id}
              driver={driver}
              onApprove={handleApprove}
              onSuspend={handleSuspend}
              onAssignVehicle={handleAssignVehicle}
              onViewLocation={handleViewLocation}
            />
          ))
        )}
      </ScrollView>

      {/* Vehicle Assignment Modal */}
      <Modal
        visible={showVehicleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowVehicleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assign Vehicle</Text>
            
            {availableVehicles.length === 0 ? (
              <Text style={styles.noVehiclesText}>No available vehicles</Text>
            ) : (
              <ScrollView style={styles.vehiclesList}>
                {availableVehicles.map((vehicle) => (
                  <TouchableOpacity
                    key={vehicle.id}
                    style={styles.vehicleItem}
                    onPress={() => handleVehicleAssignment(vehicle.id)}
                  >
                    <Text style={styles.vehiclePlate}>{vehicle.plateNumber}</Text>
                    <Text style={styles.vehicleType}>{vehicle.type}</Text>
                    <Text style={styles.vehicleCapacity}>{vehicle.loadCapacity}kg</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowVehicleModal(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  driversList: {
    flex: 1,
  },
  driverCard: {
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
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.light.text,
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
  joinDate: {
    fontSize: 14,
    color: colors.light.textMuted,
  },
  driverDetails: {
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
    color: colors.light.text,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: colors.light.text,
    marginLeft: 4,
  },
  statText: {
    marginLeft: 4,
    fontSize: 14,
    color: colors.light.textMuted,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.light.textMuted,
  },
  driverActions: {
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
  approveButton: {
    backgroundColor: colors.light.success,
  },
  approveButtonText: {
    color: colors.light.background,
    fontWeight: '600',
    fontSize: 14,
  },
  assignButton: {
    backgroundColor: colors.light.primary,
  },
  assignButtonText: {
    color: colors.light.background,
    fontWeight: '600',
    fontSize: 14,
  },
  locationButton: {
    backgroundColor: colors.light.info,
  },
  locationButtonText: {
    color: colors.light.background,
    fontWeight: '600',
    fontSize: 14,
  },
  suspendButton: {
    backgroundColor: colors.light.error,
  },
  suspendButtonText: {
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
    padding: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.light.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  noVehiclesText: {
    fontSize: 16,
    color: colors.light.textMuted,
    textAlign: 'center',
    paddingVertical: 24,
  },
  vehiclesList: {
    maxHeight: 300,
  },
  vehicleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.light.backgroundSecondary,
    borderRadius: 8,
    marginBottom: 8,
  },
  vehiclePlate: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.text,
  },
  vehicleType: {
    fontSize: 14,
    color: colors.light.textMuted,
    textTransform: 'capitalize',
  },
  vehicleCapacity: {
    fontSize: 14,
    color: colors.light.textMuted,
  },
  modalCloseButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: colors.light.primary,
    fontWeight: '600',
  },
});