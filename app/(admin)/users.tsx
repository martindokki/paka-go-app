import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
} from "react-native";
import { Search, Filter, User, Truck, Star, Phone, Mail } from "lucide-react-native";
import Colors from "@/constants/colors";

type UserType = "client" | "driver";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: UserType;
  status: "active" | "inactive" | "suspended";
  joinDate: string;
  totalOrders?: number;
  rating?: number;
  vehicleType?: string;
}

export default function AdminUsersScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<UserType | "all">("all");

  const users: AdminUser[] = [
    {
      id: "USR-001",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+254712345678",
      type: "client",
      status: "active",
      joinDate: "2024-01-15",
      totalOrders: 24,
    },
    {
      id: "USR-002",
      name: "Peter Mwangi",
      email: "peter.mwangi@example.com",
      phone: "+254723456789",
      type: "driver",
      status: "active",
      joinDate: "2023-03-20",
      totalOrders: 1247,
      rating: 4.8,
      vehicleType: "Motorcycle",
    },
    {
      id: "USR-003",
      name: "Mary Smith",
      email: "mary.smith@example.com",
      phone: "+254734567890",
      type: "client",
      status: "active",
      joinDate: "2024-02-10",
      totalOrders: 18,
    },
    {
      id: "USR-004",
      name: "Grace Akinyi",
      email: "grace.akinyi@example.com",
      phone: "+254745678901",
      type: "driver",
      status: "active",
      joinDate: "2023-08-05",
      totalOrders: 892,
      rating: 4.6,
      vehicleType: "Car",
    },
    {
      id: "USR-005",
      name: "James Kiprotich",
      email: "james.k@example.com",
      phone: "+254756789012",
      type: "driver",
      status: "inactive",
      joinDate: "2024-12-01",
      totalOrders: 5,
      rating: 4.2,
      vehicleType: "Motorcycle",
    },
  ];

  const userTypeOptions = [
    { key: "all", label: "All Users", count: users.length },
    { key: "client", label: "Clients", count: users.filter(u => u.type === "client").length },
    { key: "driver", label: "Drivers", count: users.filter(u => u.type === "driver").length },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return Colors.light.success;
      case "inactive":
        return Colors.light.warning;
      case "suspended":
        return Colors.light.error;
      default:
        return Colors.light.textMuted;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.phone.includes(searchQuery);
    
    const matchesType = selectedType === "all" || user.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const renderStarRating = (rating: number) => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={12}
            color={star <= rating ? Colors.light.warning : Colors.light.border}
            fill={star <= rating ? Colors.light.warning : "transparent"}
          />
        ))}
      </View>
    );
  };

  const renderUserCard = ({ item }: { item: AdminUser }) => (
    <TouchableOpacity style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            {item.type === "driver" ? (
              <Truck size={20} color={Colors.light.primary} />
            ) : (
              <User size={20} color={Colors.light.accent} />
            )}
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userType}>
              {item.type === "driver" ? "Driver" : "Client"}
              {item.vehicleType && ` • ${item.vehicleType}`}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + "20" },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(item.status) },
            ]}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.contactInfo}>
        <View style={styles.contactItem}>
          <Mail size={14} color={Colors.light.textMuted} />
          <Text style={styles.contactText}>{item.email}</Text>
        </View>
        <View style={styles.contactItem}>
          <Phone size={14} color={Colors.light.textMuted} />
          <Text style={styles.contactText}>{item.phone}</Text>
        </View>
      </View>

      <View style={styles.userStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Orders</Text>
          <Text style={styles.statValue}>{item.totalOrders || 0}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Join Date</Text>
          <Text style={styles.statValue}>{item.joinDate}</Text>
        </View>
        {item.rating && (
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Rating</Text>
            <View style={styles.ratingContainer}>
              {renderStarRating(Math.floor(item.rating))}
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Management</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.light.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.light.textMuted}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.typeTabs}>
        {userTypeOptions.map((type) => (
          <TouchableOpacity
            key={type.key}
            style={[
              styles.typeTab,
              selectedType === type.key && styles.activeTypeTab,
            ]}
            onPress={() => setSelectedType(type.key as any)}
          >
            <Text
              style={[
                styles.typeTabText,
                selectedType === type.key && styles.activeTypeTabText,
              ]}
            >
              {type.label}
            </Text>
            <Text
              style={[
                styles.typeTabCount,
                selectedType === type.key && styles.activeTypeTabCount,
              ]}
            >
              {type.count}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderUserCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.usersList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: 20,
    paddingBottom: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  searchContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  typeTabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  typeTab: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
  },
  activeTypeTab: {
    backgroundColor: Colors.light.primary,
  },
  typeTabText: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.light.textMuted,
  },
  activeTypeTabText: {
    color: Colors.light.background,
  },
  typeTabCount: {
    fontSize: 10,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  activeTypeTabCount: {
    color: Colors.light.background + "CC",
  },
  usersList: {
    padding: 20,
    paddingTop: 0,
  },
  userCard: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 2,
  },
  userType: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "500",
  },
  contactInfo: {
    marginBottom: 12,
    gap: 6,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  contactText: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  userStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.borderLight,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 10,
    color: Colors.light.textMuted,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.light.text,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  starContainer: {
    flexDirection: "row",
    gap: 1,
  },
  ratingText: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
});