import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { useColors } from "@/hooks/useColors";

export default function TabLayout() {
  const colors = useColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.primary,
          borderTopWidth: 0,
          height: Platform.OS === "ios" ? 82 : 62,
          paddingBottom: Platform.OS === "ios" ? 24 : 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
        },
        tabBarActiveTintColor: "#D4AF37",
        tabBarInactiveTintColor: "rgba(255,255,255,0.45)",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
          marginTop: 1,
          letterSpacing: 0.2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Documents",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-multiple" size={size - 1} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cv"
        options={{
          title: "Auto CV",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-account" size={size - 1} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: "DG Tools",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="tools" size={size - 1} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="family"
        options={{
          title: "Family",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" size={size - 1} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
