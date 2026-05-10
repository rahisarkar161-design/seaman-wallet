import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DocumentCard from "@/components/DocumentCard";
import { daysUntil, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type Filter = "all" | "expiring" | "expired";

export default function DocumentsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { documents, logout } = useApp();
  const [filter, setFilter] = useState<Filter>("all");

  const expiring = documents.filter((d) => {
    const days = daysUntil(d.expiryDate);
    return days >= 0 && days <= 180;
  });
  const expired = documents.filter((d) => daysUntil(d.expiryDate) < 0);
  const urgentCount = documents.filter((d) => {
    const days = daysUntil(d.expiryDate);
    return days >= 0 && days <= 30;
  }).length;

  const filtered =
    filter === "expiring" ? expiring : filter === "expired" ? expired : documents;

  const topPad = Platform.OS === "web" ? 56 : insets.top;
  const styles = makeStyles(colors);

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logo}>
            <MaterialCommunityIcons name="anchor" size={20} color="#D4AF37" />
          </View>
          <View>
            <Text style={styles.title}>Seaman Wallet</Text>
            <Text style={styles.subtitle}>
              {documents.length} document{documents.length !== 1 ? "s" : ""} stored
            </Text>
          </View>
        </View>
        <Pressable onPress={logout} style={styles.logoutBtn}>
          <MaterialCommunityIcons name="logout" size={20} color="rgba(255,255,255,0.7)" />
        </Pressable>
      </View>

      {/* Alert Banner */}
      {(urgentCount > 0 || expired.length > 0) && (
        <Pressable
          style={[
            styles.alertBanner,
            { backgroundColor: expired.length > 0 ? "#742A2A" : "#C53030" },
          ]}
          onPress={() => setFilter(expired.length > 0 ? "expired" : "expiring")}
        >
          <MaterialCommunityIcons name="alert-circle" size={16} color="#fff" />
          <Text style={styles.alertText}>
            {expired.length > 0
              ? `${expired.length} expired · ${urgentCount} expiring within 30 days`
              : `${urgentCount} document${urgentCount !== 1 ? "s" : ""} expiring within 30 days`}
          </Text>
          <MaterialCommunityIcons name="chevron-right" size={16} color="#fff" />
        </Pressable>
      )}

      {/* Body */}
      <View style={styles.body}>
        {/* Segmented Control */}
        <View style={styles.segmented}>
          <SegBtn
            label="All Docs"
            count={documents.length}
            active={filter === "all"}
            onPress={() => setFilter("all")}
          />
          <SegBtn
            label="Expiring"
            count={expiring.length}
            active={filter === "expiring"}
            onPress={() => setFilter("expiring")}
            countColor="#D69E2E"
          />
          <SegBtn
            label="Expired"
            count={expired.length}
            active={filter === "expired"}
            onPress={() => setFilter("expired")}
            countColor="#C53030"
          />
        </View>

        {/* Document List */}
        <FlatList
          data={filtered}
          keyExtractor={(d) => d.id}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons
                name={
                  filter === "expired"
                    ? "file-remove"
                    : filter === "expiring"
                    ? "calendar-clock"
                    : "file-plus-outline"
                }
                size={60}
                color={colors.mutedForeground}
              />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                {filter === "all"
                  ? "No Documents Yet"
                  : filter === "expiring"
                  ? "None Expiring Soon"
                  : "No Expired Documents"}
              </Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                {filter === "all"
                  ? "Tap the gold + button to add your first document."
                  : filter === "expiring"
                  ? "All documents are valid beyond 180 days."
                  : "Great — no expired documents."}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <DocumentCard
              doc={item}
              onPress={() => router.push(`/document/${item.id}` as any)}
            />
          )}
        />
      </View>

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [
          styles.fab,
          { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] },
        ]}
        onPress={() => router.push("/document/add" as any)}
      >
        <MaterialCommunityIcons name="plus" size={30} color="#0A2342" />
      </Pressable>
    </View>
  );
}

function SegBtn({
  label,
  count,
  active,
  onPress,
  countColor,
}: {
  label: string;
  count: number;
  active: boolean;
  onPress: () => void;
  countColor?: string;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={[
        segS.btn,
        active && {
          backgroundColor: colors.card,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        },
      ]}
    >
      <Text style={[segS.label, { color: active ? colors.primary : colors.mutedForeground }]}>
        {label}
      </Text>
      {count > 0 && (
        <View
          style={[
            segS.badge,
            { backgroundColor: active ? (countColor ?? colors.primary) : colors.border },
          ]}
        >
          <Text
            style={[
              segS.badgeText,
              { color: active ? "#fff" : colors.mutedForeground },
            ]}
          >
            {count}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const segS = StyleSheet.create({
  btn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 9,
    borderRadius: 10,
  },
  label: { fontSize: 12, fontWeight: "700" },
  badge: {
    borderRadius: 8,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { fontSize: 10, fontWeight: "700" },
});

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.primary },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 18,
      paddingBottom: 14,
      paddingTop: 6,
    },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    logo: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: "rgba(255,255,255,0.12)",
      alignItems: "center",
      justifyContent: "center",
    },
    title: { fontSize: 18, fontWeight: "800", color: "#fff" },
    subtitle: { fontSize: 12, color: "rgba(255,255,255,0.6)" },
    logoutBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: "rgba(255,255,255,0.1)",
      alignItems: "center",
      justifyContent: "center",
    },
    alertBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginHorizontal: 14,
      marginBottom: 10,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 9,
    },
    alertText: { flex: 1, color: "#fff", fontSize: 12, fontWeight: "600" },
    body: {
      flex: 1,
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 14,
      overflow: "hidden",
    },
    segmented: {
      flexDirection: "row",
      backgroundColor: colors.secondary,
      borderRadius: 12,
      padding: 4,
      marginHorizontal: 14,
      marginBottom: 12,
    },
    list: { paddingHorizontal: 14, paddingTop: 4 },
    empty: {
      alignItems: "center",
      paddingTop: 70,
      paddingHorizontal: 32,
      gap: 14,
    },
    emptyTitle: { fontSize: 18, fontWeight: "700" },
    emptyText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
    fab: {
      position: "absolute",
      bottom: Platform.OS === "ios" ? 100 : 76,
      right: 20,
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: "#D4AF37",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
    },
  });
}
