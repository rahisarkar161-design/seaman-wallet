import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";

export interface ModuleConfig {
  id: string;
  title: string;
  icon: string;
  iconLib: "Ionicons" | "MaterialCommunityIcons";
  route: string;
  color: string;
  badge?: number;
}

interface Props {
  module: ModuleConfig;
}

export default function ModuleCard({ module }: Props) {
  const colors = useColors();

  function handlePress() {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(module.route as any);
  }

  const IconComponent =
    module.iconLib === "Ionicons" ? Ionicons : MaterialCommunityIcons;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.96 : 1 }],
        },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: module.color + "18" }]}>
        <IconComponent
          name={module.icon as any}
          size={26}
          color={module.color}
        />
        {!!module.badge && module.badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{module.badge}</Text>
          </View>
        )}
      </View>
      <Text
        style={[styles.title, { color: colors.foreground }]}
        numberOfLines={2}
      >
        {module.title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 5,
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 90,
    justifyContent: "center",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 15,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#E53E3E",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "700",
  },
});
