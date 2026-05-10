import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/context/AppContext";
import { requestNotificationPermissions } from "@/hooks/useNotifications";

SplashScreen.preventAutoHideAsync();

const NAV_HEADER = {
  headerStyle: { backgroundColor: "#0A2342" },
  headerTintColor: "#fff",
  headerTitleStyle: { fontWeight: "700" as const },
};

function RootLayoutNav() {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("isLoggedIn").then((val) => {
      setIsLoggedIn(val === "true");
      setIsReady(true);
    });
    requestNotificationPermissions();
  }, []);

  useEffect(() => {
    if (!isReady) return;
    router.replace(isLoggedIn ? "/(tabs)" : "/login");
  }, [isReady, isLoggedIn]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ animation: "fade" }} />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(main)" options={{ headerShown: false }} />
      <Stack.Screen
        name="document/add"
        options={{ headerShown: true, title: "Add Document", presentation: "modal", ...NAV_HEADER }}
      />
      <Stack.Screen
        name="document/[id]"
        options={{ headerShown: true, title: "Edit Document", presentation: "modal", ...NAV_HEADER }}
      />
      <Stack.Screen
        name="profile/edit"
        options={{ headerShown: true, title: "Edit Profile", presentation: "modal", ...NAV_HEADER }}
      />
      <Stack.Screen
        name="tools/resizer"
        options={{ headerShown: true, title: "File Resizer", presentation: "modal", ...NAV_HEADER }}
      />
      <Stack.Screen
        name="tools/status"
        options={{ headerShown: true, title: "DG Shipping Status", ...NAV_HEADER }}
      />
      <Stack.Screen
        name="tools/forms"
        options={{ headerShown: true, title: "Form Pre-fill", presentation: "modal", ...NAV_HEADER }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AppProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <RootLayoutNav />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </AppProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
