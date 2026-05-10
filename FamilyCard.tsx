import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { FamilyMember } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const RELATION_CONFIG: Record<string, { color: string; icon: string }> = {
  Wife:     { color: "#C2185B", icon: "face-woman" },
  Husband:  { color: "#1565C0", icon: "face-man" },
  Son:      { color: "#0277BD", icon: "face-man" },
  Daughter: { color: "#AD1457", icon: "face-woman" },
  Father:   { color: "#37474F", icon: "face-man" },
  Mother:   { color: "#6A1B9A", icon: "face-woman" },
  Other:    { color: "#546E7A", icon: "account" },
};

export default function FamilyCard({
  member,
  onPress,
  onDelete,
}: {
  member: FamilyMember;
  onPress?: () => void;
  onDelete?: () => void;
}) {
  const colors = useColors();
  const cfg = RELATION_CONFIG[member.relation] ?? RELATION_CONFIG.Other;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: cfg.color + "20" }]}>
        <MaterialCommunityIcons name={cfg.icon as any} size={28} color={cfg.color} />
      </View>
      <View style={styles.info}>
        <View style={styles.row}>
          <View style={[styles.badge, { backgroundColor: cfg.color }]}>
            <Text style={styles.badgeText}>{member.relation}</Text>
          </View>
        </View>
        <Text style={[styles.name, { color: colors.foreground }]}>{member.name}</Text>
        <View style={styles.metaRow}>
          {!!member.bloodGroup && (
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
              Blood: {member.bloodGroup}
            </Text>
          )}
          {!!member.nid && (
            <Text style={[styles.meta, { color: colors.mutedForeground }]}>
              NID: {member.nid}
            </Text>
          )}
        </View>
        {!!member.dateOfBirth && (
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            DOB: {member.dateOfBirth}
          </Text>
        )}
      </View>
      {onDelete && (
        <Pressable onPress={onDelete} hitSlop={8}>
          <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.destructive} />
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1 },
  row: { flexDirection: "row", marginBottom: 4 },
  badge: {
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.4 },
  name: { fontSize: 15, fontWeight: "700", marginBottom: 3 },
  metaRow: { flexDirection: "row", gap: 12 },
  meta: { fontSize: 11 },
});
