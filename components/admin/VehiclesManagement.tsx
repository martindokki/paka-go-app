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
  Car, 
  Plus, 
  Trash2, 
  User,
  Package,
  Settings,
  CheckCircle,
  AlertTriangle
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { useAdminStore, Vehicle } from '@/stores/admin-store';

interface VehicleCardProps {
  vehicle: Vehicle;
  onDelete: (vehicleId: string) => void;
  onEdit: (vehicle: Vehicle) => void;
}

function VehicleCard({ vehicle, onDelete, onEdit }: VehicleCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return colors.light.success;
      case 'assigned': return colors.light.info;
      case 'maintenance': return colors.light.warning;
      default: return colors.light.textMuted;
    }
  };

  const getStatusText = (status: string) => {
    return status.toUpperCase();
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'motorcycle':
      case 'bicycle':
      case 'car':
      case 'van':
        return Car;
      default:
        return Car;
    }
  };

  const VehicleIcon = getVehicleIcon(vehicle.type);

  return (
    <View style={styles.vehicleCard}>
      <View style={styles.vehicleHeader}>
        <View style={styles.vehicleInfo}>
          <View style={styles.vehicleIconContainer}>
            <VehicleIcon size={24} color={colors.light.primary} />
          </View>
          <View>
            <Text style={styles.vehiclePlate}>{vehicle.plateNumber}</Text>
            <Text style={styles.vehicleType}>{vehicle.type}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(vehicle.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(vehicle.status) }]}>
            {getStatusText(vehicle.status)}
          </Text>
        </View>
      </View>

      <View style={styles.vehicleDetails}>
        <View style={styles.detailRow}>
          <Package size={16} color={colors.light.textMuted} />
          <Text style={styles.detailText}>Load Capacity: {vehicle.loadCapacity}kg</Text>
        </View>
        
        {vehicle.driverId && (
          <View style={styles.detailRow}>
            <User size={16} color={colors.light.textMuted} />
            <Text style={styles.detailText}>Assigned to Driver: {vehicle.driverId}</Text>
          </View>
        )}
        
        <View style={styles.detailRow}>
          <Text style={styles.dateText}>
            Added: {new Date(vehicle.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.vehicleActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => onEdit(vehicle)}
        >
          <Settings size={16} color={colors.light.background} />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => onDelete(vehicle.id)}
        >
          <Trash2 size={16} color={colors.light.background} />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface VehicleFormProps {
  visible: boolean;
  vehicle?: Vehicle | null;
  onClose: () => void;
  onSave: (vehicleData: any) => void;
}

function VehicleForm({ visible, vehicle, onClose, onSave }: VehicleFormProps) {
  const [plateNumber, setPlateNumber] = useState(vehicle?.plateNumber || '');
  const [type, setType] = useState(vehicle?.type || 'motorcycle');
  const [loadCapacity, setLoadCapacity] = useState(vehicle?.loadCapacity?.toString() || '');
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const vehicleTypes = [
    { value: 'motorcycle', label: 'Motorcycle' },
    { value: 'bicycle', label: 'Bicycle' },
    { value: 'car', label: 'Car' },
    { value: 'van', label: 'Van' },
  ];

  const handleSave = () => {
    if (!plateNumber.trim() || !loadCapacity.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const vehicleData = {
      plateNumber: plateNumber.trim(),
      type: type as Vehicle['type'],
      loadCapacity: parseInt(loadCapacity),
      status: 'available' as Vehicle['status'],
    };

    onSave(vehicleData);
    
    // Reset form
    setPlateNumber('');
    setType('motorcycle');
    setLoadCapacity('');
  };

  React.useEffect(() => {
    if (vehicle) {
      setPlateNumber(vehicle.plateNumber);
      setType(vehicle.type);
      setLoadCapacity(vehicle.loadCapacity.toString());
    } else {
      setPlateNumber('');
      setType('motorcycle');
      setLoadCapacity('');
    }
  }, [vehicle, visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
          </Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Plate Number *</Text>
            <TextInput
              style={styles.formInput}
              value={plateNumber}
              onChangeText={setPlateNumber}
              placeholder="e.g., KCA 123A"
              placeholderTextColor={colors.light.textMuted}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Vehicle Type *</Text>
            <TouchableOpacity
              style={styles.formInput}
              onPress={() => setShowTypeSelector(!showTypeSelector)}
            >
              <Text style={styles.formInputText}>
                {vehicleTypes.find(t => t.value === type)?.label}
              </Text>
            </TouchableOpacity>
            
            {showTypeSelector && (
              <View style={styles.typeSelector}>
                {vehicleTypes.map((vehicleType) => (
                  <TouchableOpacity
                    key={vehicleType.value}
                    style={styles.typeOption}
                    onPress={() => {
                      setType(vehicleType.value);
                      setShowTypeSelector(false);
                    }}
                  >
                    <Text style={styles.typeOptionText}>{vehicleType.label}</Text>
                    {type === vehicleType.value && (
                      <CheckCircle size={16} color={colors.light.success} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Load Capacity (kg) *</Text>
            <TextInput
              style={styles.formInput}
              value={loadCapacity}
              onChangeText={setLoadCapacity}
              placeholder="e.g., 50"
              keyboardType="numeric"
              placeholderTextColor={colors.light.textMuted}
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>
                {vehicle ? 'Update' : 'Add Vehicle'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function VehiclesManagement() {
  const { 
    vehicles, 
    createVehicle, 
    deleteVehicle,
    isLoading 
  } = useAdminStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    const matchesType = typeFilter === 'all' || vehicle.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setShowVehicleForm(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setShowVehicleForm(true);
  };

  const handleSaveVehicle = async (vehicleData: any) => {
    if (editingVehicle) {
      // Update existing vehicle (not implemented in store yet)
      Alert.alert('Info', 'Vehicle update functionality will be implemented');
    } else {
      // Create new vehicle
      const success = await createVehicle(vehicleData);
      if (success) {
        Alert.alert('Success', 'Vehicle added successfully');
        setShowVehicleForm(false);
      }
    }
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    Alert.alert(
      'Delete Vehicle',
      'Are you sure you want to delete this vehicle?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            const success = await deleteVehicle(vehicleId);
            if (success) {
              Alert.alert('Success', 'Vehicle deleted successfully');
            }
          }
        }
      ]
    );
  };

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'available', label: 'Available' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'maintenance', label: 'Maintenance' },
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'motorcycle', label: 'Motorcycle' },
    { value: 'bicycle', label: 'Bicycle' },
    { value: 'car', label: 'Car' },
    { value: 'van', label: 'Van' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.light.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search vehicles..."
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

        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddVehicle}
        >
          <Plus size={20} color={colors.light.background} />
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
            {typeOptions.map((option) => (
              <TouchableOpacity
                key={`type-${option.value}`}
                style={[
                  styles.filterChip,
                  typeFilter === option.value && styles.filterChipActive
                ]}
                onPress={() => setTypeFilter(option.value)}
              >
                <Text style={[
                  styles.filterChipText,
                  typeFilter === option.value && styles.filterChipTextActive
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView style={styles.vehiclesList} showsVerticalScrollIndicator={false}>
        {filteredVehicles.length === 0 ? (
          <View style={styles.emptyState}>
            <Car size={48} color={colors.light.textMuted} />
            <Text style={styles.emptyStateText}>No vehicles found</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Add vehicles to get started'
              }
            </Text>
          </View>
        ) : (
          filteredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onDelete={handleDeleteVehicle}
              onEdit={handleEditVehicle}
            />
          ))
        )}
      </ScrollView>

      <VehicleForm
        visible={showVehicleForm}
        vehicle={editingVehicle}
        onClose={() => setShowVehicleForm(false)}
        onSave={handleSaveVehicle}
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
  addButton: {
    padding: 12,
    backgroundColor: colors.light.primary,
    borderRadius: 8,
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
  vehiclesList: {
    flex: 1,
  },
  vehicleCard: {
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
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vehicleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.light.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehiclePlate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.light.text,
  },
  vehicleType: {
    fontSize: 14,
    color: colors.light.textMuted,
    textTransform: 'capitalize',
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
  vehicleDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.light.textMuted,
  },
  dateText: {
    fontSize: 12,
    color: colors.light.textMuted,
  },
  vehicleActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  editButton: {
    backgroundColor: colors.light.info,
  },
  editButtonText: {
    color: colors.light.background,
    fontWeight: '600',
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: colors.light.error,
  },
  deleteButtonText: {
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.light.text,
    marginBottom: 20,
    textAlign: 'center',
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
  formInputText: {
    fontSize: 16,
    color: colors.light.text,
  },
  typeSelector: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 8,
    backgroundColor: colors.light.background,
  },
  typeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  typeOptionText: {
    fontSize: 16,
    color: colors.light.text,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
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
  saveButton: {
    backgroundColor: colors.light.primary,
  },
  saveButtonText: {
    fontSize: 16,
    color: colors.light.background,
    fontWeight: '600',
  },
});