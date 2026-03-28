import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert
} from 'react-native';
import { 
  Search, 
  Filter, 
  Car, 
  User,
  Package,
  CheckCircle,
  AlertTriangle
} from 'lucide-react-native';
import colors from '@/constants/colors';
import { Driver } from '@/stores/local-data-store';

interface Vehicle {
  id: string;
  plateNumber: string;
  type: string;
  model: string;
  year: string;
  loadCapacity: number;
  status: string;
  driverId?: string;
  driverName?: string;
  lastMaintenance: string;
  nextMaintenance: string;
}

interface VehicleCardProps {
  vehicle: Vehicle;
}

function VehicleCard({ vehicle }: VehicleCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return colors.success;
      case 'inactive': return colors.warning;
      case 'maintenance': return colors.error;
      default: return colors.textMuted;
    }
  };

  return (
    <View style={styles.vehicleCard}>
      <View style={styles.vehicleHeader}>
        <View style={styles.vehicleInfo}>
          <Text style={styles.plateNumber}>{vehicle.plateNumber}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(vehicle.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(vehicle.status) }]}>
              {vehicle.status.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.vehicleType}>{vehicle.type} {vehicle.model}</Text>
      </View>

      <View style={styles.vehicleDetails}>
        <View style={styles.detailRow}>
          <Car size={16} color={colors.textMuted} />
          <Text style={styles.detailText}>Year: {vehicle.year}</Text>
        </View>
        <View style={styles.detailRow}>
          <Package size={16} color={colors.textMuted} />
          <Text style={styles.detailText}>Capacity: {vehicle.loadCapacity}kg</Text>
        </View>
        {vehicle.driverName && (
          <View style={styles.detailRow}>
            <User size={16} color={colors.textMuted} />
            <Text style={styles.detailText}>Driver: {vehicle.driverName}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

interface VehiclesManagementProps {
  drivers: Driver[];
}

export function VehiclesManagement({ drivers }: VehiclesManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Mock vehicles data based on drivers
  const vehicles: Vehicle[] = drivers.map(driver => ({
    id: driver.id,
    plateNumber: driver.vehicleInfo?.split(' - ')[1] || 'N/A',
    type: driver.vehicleInfo?.split(' ')[0] || 'Unknown',
    model: driver.vehicleInfo?.split(' ')[1] || 'Unknown',
    year: '2020',
    loadCapacity: 50,
    status: driver.status === 'online' ? 'active' : 'inactive',
    driverId: driver.id,
    driverName: driver.name,
    lastMaintenance: new Date().toISOString(),
    nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  }));

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.driverName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: 'all', label: 'All Vehicles' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'maintenance', label: 'Maintenance' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search vehicles..."
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

      <ScrollView style={styles.vehiclesList} showsVerticalScrollIndicator={false}>
        {filteredVehicles.length === 0 ? (
          <View style={styles.emptyState}>
            <Car size={48} color={colors.textMuted} />
            <Text style={styles.emptyStateText}>No vehicles found</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Vehicles will appear here when drivers are registered'
              }
            </Text>
          </View>
        ) : (
          filteredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
            />
          ))
        )}
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
  vehiclesList: {
    flex: 1,
  },
  vehicleCard: {
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
  plateNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
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
  vehicleType: {
    fontSize: 14,
    color: colors.textMuted,
  },
  vehicleDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.textMuted,
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
});