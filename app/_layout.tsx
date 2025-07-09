import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Colors from "@/constants/colors";

export const unstable_settings = {
  initialRouteName: "index",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // Add custom fonts here if needed
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen 
          name="auth" 
          options={{ 
            headerShown: false,
            gestureEnabled: false,
          }} 
        />
        <Stack.Screen 
          name="(client)" 
          options={{ 
            headerShown: false,
            gestureEnabled: false,
          }} 
        />
        <Stack.Screen 
          name="(driver)" 
          options={{ 
            headerShown: false,
            gestureEnabled: false,
          }} 
        />
        {/* Admin routes only available on web */}
        {Platform.OS === 'web' && (
          <Stack.Screen 
            name="(admin)" 
            options={{ 
              headerShown: false,
              gestureEnabled: false,
            }} 
          />
        )}
        <Stack.Screen 
          name="booking" 
          options={{ 
            headerShown: true,
            title: "Book Delivery",
            presentation: "modal",
            headerStyle: {
              backgroundColor: Colors.light.background,
            },
            headerTintColor: Colors.light.text,
          }} 
        />
        <Stack.Screen 
          name="tracking" 
          options={{ 
            headerShown: true,
            title: "Track Order",
            presentation: "modal",
            headerStyle: {
              backgroundColor: Colors.light.background,
            },
            headerTintColor: Colors.light.text,
          }} 
        />
        <Stack.Screen 
          name="payment" 
          options={{ 
            headerShown: true,
            title: "Payment",
            presentation: "modal",
            headerStyle: {
              backgroundColor: Colors.light.background,
            },
            headerTintColor: Colors.light.text,
          }} 
        />
        <Stack.Screen 
          name="chat" 
          options={{ 
            headerShown: true,
            title: "Chat",
            presentation: "modal",
            headerStyle: {
              backgroundColor: Colors.light.background,
            },
            headerTintColor: Colors.light.text,
          }} 
        />
      </Stack>
    </ErrorBoundary>
  );
}