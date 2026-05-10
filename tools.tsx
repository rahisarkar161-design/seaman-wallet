import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NAVY = "#0A2342";
const GOLD = "#D4AF37";
const BG = "#F0F4F8";

const TOOLS = [
  {
    id: "resizer",
    icon: "image-filter-hdr",
    color: "#2E7D32",
    title: "File Resizer",
    desc: "Compress JPG images to 100 KB or 200 KB for DG Shipping uploads.",
    tag: "Images",
    route: "/tools/resizer",
  },
  {
    id: "status",
    icon: "web",
    color: "#1565C0",
    title: "Status Tracker",
    desc: "Open DG Shipping portal with auto-fill of your INDOS/SID credentials.",
    tag: "Web",
    route: "/tools/status",
  },
  {
    id: "forms",
    icon: "form-select",
    color: "#6A1B9A",
    title: "Form Pre-fill",
    desc: "Auto-fill INDOS / SID / CDC application forms from your saved profile.",
    tag: "Forms",
    route: "/tools/forms",
  },
] as const;

export default function ToolsScreen() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 60 : insets.top;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 8 }]}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>DG Shipping Tools</Text>
          <Text style={styles.headerSub}>Utilities for seafarers' paperwork</Text>
        </View>
        <MaterialCommunityIcons name="anchor" size={32} color={GOLD} />
      </View>

      <View style={styles.infoCard}>
        <MaterialCommunityIcons name="information-outline" size={20} color={NAVY} />
        <Text style={styles.infoText}>
          These tools help you prepare documents for DG Shipping India. Keep your profile updated for best results.
        </Text>
      </View>

      {TOOLS.map((tool) => (
        <Pressable key={tool.id} style={styles.toolCard} onPress={() => router.push(tool.route as never)}>
          <View style={[styles.toolIcon, { backgroundColor: tool.color }]}>
            <MaterialCommunityIcons name={tool.icon} size={26} color="#fff" />
          </View>
          <View style={styles.toolInfo}>
            <View style={styles.toolTitleRow}>
              <Text style={styles.toolTitle}>{tool.title}</Text>
              <View style={[styles.toolTag, { backgroundColor: tool.color + "22" }]}>
                <Text style={[styles.toolTagText, { color: tool.color }]}>{tool.tag}</Text>
              </View>
            </View>
            <Text style={styles.toolDesc}>{tool.desc}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={22} color="#CBD5E0" />
        </Pressable>
      ))}

      <View style={styles.helpCard}>
        <Text style={styles.helpTitle}>Quick Tips</Text>
        <Tip icon="file-image" text="Use File Resizer before uploading to DG Shipping portal" />
        <Tip icon="account-edit" text="Complete your profile for Form Pre-fill to work best" />
        <Tip icon="web-check" text="Status Tracker opens the official dgshipping.gov.in site" />
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function Tip({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.tip}>
      <MaterialCommunityIcons name={icon as never} size={16} color={GOLD} />
      <Text style={styles.tipText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  content: { padding: 16 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: NAVY, borderRadius: 16, padding: 18, marginBottom: 14,
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#fff" },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  infoCard: {
    flexDirection: "row", gap: 10, alignItems: "flex-start",
    backgroundColor: "#EBF8FF", borderRadius: 12, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: "#BEE3F8",
  },
  infoText: { flex: 1, fontSize: 12, color: NAVY, lineHeight: 18 },
  toolCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: "#e2e8f0",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  toolIcon: { width: 54, height: 54, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  toolInfo: { flex: 1 },
  toolTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  toolTitle: { fontSize: 15, fontWeight: "700", color: NAVY },
  toolTag: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  toolTagText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.3 },
  toolDesc: { fontSize: 12, color: "#718096", lineHeight: 17 },
  helpCard: {
    backgroundColor: "#fff", borderRadius: 14, padding: 16, marginTop: 4,
    borderWidth: 1, borderColor: "#e2e8f0",
  },
  helpTitle: { fontSize: 13, fontWeight: "700", color: NAVY, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 },
  tip: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  tipText: { flex: 1, fontSize: 12, color: "#4A5568", lineHeight: 17 },
});
