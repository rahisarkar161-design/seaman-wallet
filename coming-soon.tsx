import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

export default function ComingSoonScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: colors.secondary }]}>
        <MaterialCommunityIcons name="tools" size={52} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>Coming in V2</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        This module is under development and will be available in the next update of Seaman Wallet.
      </Text>
      <View style={[styles.badge, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "30" }]}>
        <MaterialCommunityIcons name="anchor" size={14} color={colors.primary} />
        <Text style={[styles.badgeText, { color: colors.primary }]}>Seaman Wallet V2</Text>
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.backBtn,
          { borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
        ]}
        onPress={() => router.back()}
      >
        <Text style={[styles.backBtnText, { color: colors.primary }]}>Go Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16,
  },
  iconBox: {
    width: 100,
    height: 100,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: { fontSize: 24, fontWeight: "700" },
  subtitle: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 4,
  },
  badgeText: { fontSize: 13, fontWeight: "600" },
  backBtn: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 8,
  },
  backBtnText: { fontSize: 15, fontWeight: "700" },
});
