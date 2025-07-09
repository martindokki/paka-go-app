import React, { useEffect, useState } from "react";
import { Tabs, router } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { Home, Package, DollarSign, User } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useAuthStore } from "@/stores/auth-store";

function TabBarIcon({ icon: Icon, color }: { icon: any; color: string }) {
  return <Icon size={24} color={color} />;
}

export default function DriverTabLayout() {
  const { isAuthenticated, user, isInitialized } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isInitialized || !isMounted) return;
    
    // Use setTimeout to ensure navigation happens after component is fully mounted
    const timeoutId = setTimeout(() => {
      if (!isAuthenticated || !user || user.userType !== 'driver') {
        router.replace('/auth');
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, user, isInitialized, isMounted]);

  if (!isInitialized || !isMounted) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: Colors.light.background 
      }}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (!isAuthenticated || !user || user.userType !== 'driver') {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: Colors.light.background 
      }}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.light.background,
          borderTopColor: Colors.light.borderLight,
          paddingTop: 8,
          paddingBottom: 8,
          height: 88,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <TabBarIcon icon={Home} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color }) => <TabBarIcon icon={Package} color={color} />,
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: "Earnings",
          tabBarIcon: ({ color }) => <TabBarIcon icon={DollarSign} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <TabBarIcon icon={User} color={color} />,
        }}
      />
    </Tabs>
  );
}