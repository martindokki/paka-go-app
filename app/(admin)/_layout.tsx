import React from "react";
import { Tabs } from "expo-router";
import { Platform, Alert, View, ActivityIndicator } from "react-native";
import { BarChart3, Package, Users, Settings } from "lucide-react-native";
import Colors from "@/constants/colors";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/auth-store";

function TabBarIcon({ icon: Icon, color }: { icon: any; color: string }) {
  return <Icon size={24} color={color} />;
}

export default function AdminTabLayout() {
  const { isAuthenticated, user, isInitialized } = useAuthStore();

  // Check authentication and platform
  React.useEffect(() => {
    if (!isInitialized) return;
    
    if (!isAuthenticated || !user || user.userType !== 'admin') {
      router.replace('/auth');
      return;
    }

    if (Platform.OS !== 'web') {
      Alert.alert(
        "Access Restricted",
        "Admin dashboard is only available on web platform. Please use a web browser to access admin features.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/auth"),
          },
        ]
      );
    }
  }, [isAuthenticated, user, isInitialized]);

  if (!isInitialized) {
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

  // Don't render tabs if not authenticated or not on web
  if (!isAuthenticated || !user || user.userType !== 'admin' || Platform.OS !== 'web') {
    return null;
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
          tabBarIcon: ({ color }) => <TabBarIcon icon={BarChart3} color={color} />,
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
        name="users"
        options={{
          title: "Users",
          tabBarIcon: ({ color }) => <TabBarIcon icon={Users} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <TabBarIcon icon={Settings} color={color} />,
        }}
      />
    </Tabs>
  );
}