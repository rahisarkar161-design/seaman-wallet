import { Stack } from "expo-router";
import React from "react";
import { useColors } from "@/hooks/useColors";

export default function MainLayout() {
  const colors = useColors();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700" },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ title: "My Profile" }} />
      <Stack.Screen name="certificate" options={{ title: "Certificates" }} />
      <Stack.Screen name="passport" options={{ title: "Passport & CDC" }} />
      <Stack.Screen name="cv" options={{ title: "Auto CV Maker" }} />
      <Stack.Screen name="expiry" options={{ title: "Expiry Manager" }} />
      <Stack.Screen name="coming-soon" options={{ title: "Coming Soon" }} />
    </Stack>
  );
}
