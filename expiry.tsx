import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function getStatusColor(days: number): string {
  if (days < 0) return "#742A2A";
  if (days <= 25) return "#C53030";
  if (days <= 90) return "#D69E2E";
  return "#38A169";
}

function getStatusBg(days: number): string {
  if (days < 0) return "#FFF5F5";
  if (days <= 25) return "#FFF5F5";
  if (days <= 90) return "#FFFFF0";
  return "#F0FFF4";
}

function getStatusLabel(days: number): string {
  if (days < 0) return "EXPIRED";
  if (days <= 25) return "URGENT";
  if (days <= 90) return "SOON";
  return "OK";
}

function getCategoryIcon(category: string): string {
  switch (category) {
    case "Certificate": return "certificate";
    case "Passport": return "passport";
    case "CDC": return "card-account-details";
    default: return "file-document";
  }
}

function getCategoryColor(category: string): string {
  switch (category) {
    case "Certificate": return "#2E7D32";
    case "Passport": return "#6A1B9A";
    case "CDC": return "#0277BD";
    default: return "#37474F";
  }
}

export default function ExpiryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getExpiringItems } = useApp();
  const items = getExpiringItems();

  const expired = items.filter((i) => i.daysLeft < 0);
  const urgent = items.filter((i) => i.daysLeft >= 0 && i.daysLeft <= 25);
  const soon = items.filter((i) => i.daysLeft > 25 && i.daysLeft <= 90);
  const good = items.filter((i) => i.daysLeft > 90);

  const styles = makeStyles(colors);

  if (items.length === 0) {
    return (
      <View style={[styles.emptyContainer, { paddingBottom: insets.bottom }]}>
        <MaterialCommunityIcons name="calendar-check" size={64} color={colors.mutedForeground} />
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Documents Tracked</Text>
        <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
          Add certificates and passport/CDC details to track expiry dates here.
        </Text>
      </View>
    );
  }

  function renderItem({ item }: { item: ReturnType<typeof getExpiringItems>[0] }) {
    const statusColor = getStatusColor(item.daysLeft);
    const statusBg = getStatusBg(item.daysLeft);
    const statusLabel = getStatusLabel(item.daysLeft);
    const catIcon = getCategoryIcon(item.category);
    const catColor = getCategoryColor(item.category);

    return (
      <View style={[styles.itemCard, { backgroundColor: statusBg, borderColor: statusColor + "40" }]}>
        <View style={[styles.itemIcon, { backgroundColor: catColor + "18" }]}>
          <MaterialCommunityIcons name={catIcon as any} size={22} color={catColor} />
        </View>
        <View style={styles.itemInfo}>
          <Text style={[styles.itemTitle, { color: colors.foreground }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.itemCat, { color: colors.mutedForeground }]}>
            {item.category} · Expires {item.expiryDate}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{statusLabel}</Text>
          {item.daysLeft >= 0 && (
            <Text style={styles.statusDays}>{item.daysLeft}d</Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(i) => i.id}
      contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + Platform.OS === "web" ? 34 : 20 }]}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View>
          {/* Summary Row */}
          <View style={styles.summaryRow}>
            <SummaryChip count={expired.length} label="Expired" color="#742A2A" />
            <SummaryChip count={urgent.length} label="Urgent" color="#C53030" />
            <SummaryChip count={soon.length} label="Soon" color="#D69E2E" />
            <SummaryChip count={good.length} label="Good" color="#38A169" />
          </View>
          {expired.length > 0 && (
            <Text style={[styles.groupLabel, { color: "#742A2A" }]}>Expired</Text>
          )}
        </View>
      }
      renderItem={renderItem}
    />
  );
}

function SummaryChip({ count, label, color }: { count: number; label: string; color: string }) {
  const colors = useColors();
  return (
    <View style={[{
      flex: 1,
      backgroundColor: color + "18",
      borderRadius: 12,
      padding: 12,
      alignItems: "center",
      borderWidth: 1,
      borderColor: color + "30",
    }]}>
      <Text style={{ fontSize: 22, fontWeight: "800", color }}>{count}</Text>
      <Text style={{ fontSize: 11, color, fontWeight: "600", marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
      gap: 16,
      backgroundColor: colors.background,
    },
    emptyTitle: { fontSize: 20, fontWeight: "700" },
    emptyText: { fontSize: 14, textAlign: "center", lineHeight: 22 },
    list: { padding: 14 },
    summaryRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 20,
    },
    groupLabel: {
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    itemCard: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      gap: 12,
    },
    itemIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    itemInfo: { flex: 1 },
    itemTitle: { fontSize: 14, fontWeight: "700", marginBottom: 3 },
    itemCat: { fontSize: 12 },
    statusBadge: {
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 6,
      alignItems: "center",
      minWidth: 52,
    },
    statusText: { color: "#fff", fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
    statusDays: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "700" },
  });
}
