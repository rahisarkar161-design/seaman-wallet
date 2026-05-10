import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const NAVY = "#0A2342";
const GOLD = "#D4AF37";
const BG = "#F0F4F8";

type Target = 100 | 200;

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

async function getFileSize(uri: string): Promise<number> {
  try {
    const info = await FileSystem.getInfoAsync(uri, { size: true });
    return (info as FileSystem.FileInfo & { size?: number }).size ?? 0;
  } catch {
    return 0;
  }
}

async function compressToTarget(
  uri: string,
  targetKB: number
): Promise<{ uri: string; size: number }> {
  const targetBytes = targetKB * 1024;
  let quality = 0.85;
  let width = 1400;
  let lastUri = uri;
  let lastSize = 0;

  for (let attempt = 0; attempt < 12; attempt++) {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width } }],
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );
    lastUri = result.uri;
    lastSize = await getFileSize(result.uri);

    if (lastSize <= targetBytes) break;

    if (quality > 0.25) {
      quality = Math.max(0.1, quality - 0.15);
    } else {
      width = Math.floor(width * 0.75);
    }
  }

  return { uri: lastUri, size: lastSize };
}

export default function ResizerScreen() {
  const [sourceUri, setSourceUri] = useState<string | null>(null);
  const [sourceSize, setSourceSize] = useState(0);
  const [target, setTarget] = useState<Target>(200);
  const [resultUri, setResultUri] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState(0);
  const [processing, setProcessing] = useState(false);

  async function pickImage() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!res.canceled && res.assets[0]) {
      const uri = res.assets[0].uri;
      const size = await getFileSize(uri);
      setSourceUri(uri);
      setSourceSize(size);
      setResultUri(null);
      setResultSize(0);
    }
  }

  async function compress() {
    if (!sourceUri) return;
    setProcessing(true);
    try {
      const { uri, size } = await compressToTarget(sourceUri, target);
      setResultUri(uri);
      setResultSize(size);
    } catch (e) {
      Alert.alert("Error", String(e));
    } finally {
      setProcessing(false);
    }
  }

  async function share() {
    if (!resultUri) return;
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(resultUri, { mimeType: "image/jpeg" });
    } else {
      Alert.alert("Saved", `File saved to: ${resultUri}`);
    }
  }

  const saved = sourceSize > 0 && resultSize > 0 ? sourceSize - resultSize : 0;
  const pct = sourceSize > 0 && resultSize > 0 ? Math.round((saved / sourceSize) * 100) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <View style={styles.heroCard}>
        <MaterialCommunityIcons name="image-filter-hdr" size={32} color={GOLD} />
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>File Resizer</Text>
          <Text style={styles.heroSub}>Compress images for DG Shipping portal</Text>
        </View>
      </View>

      {/* Target selection */}
      <Text style={styles.sectionLabel}>Target Size</Text>
      <View style={styles.targetRow}>
        {([100, 200] as Target[]).map((t) => (
          <Pressable
            key={t}
            style={[styles.targetBtn, target === t && styles.targetBtnActive]}
            onPress={() => setTarget(t)}
          >
            <Text style={[styles.targetBtnText, target === t && styles.targetBtnTextActive]}>
              {t} KB
            </Text>
            <Text style={[styles.targetBtnSub, target === t && { color: "#fff" }]}>
              {t === 100 ? "DG Shipping Profile" : "Document Upload"}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Pick image */}
      <Pressable style={styles.pickBtn} onPress={pickImage}>
        <MaterialCommunityIcons name="image-plus" size={22} color={NAVY} />
        <Text style={styles.pickBtnText}>{sourceUri ? "Change Image" : "Select Image"}</Text>
      </Pressable>

      {/* Preview */}
      {sourceUri && (
        <View style={styles.previewCard}>
          <Text style={styles.sectionLabel}>Original</Text>
          <Image source={{ uri: sourceUri }} style={styles.preview} resizeMode="cover" />
          <View style={styles.sizeRow}>
            <MaterialCommunityIcons name="file-image" size={16} color="#718096" />
            <Text style={styles.sizeText}>{fmtSize(sourceSize)}</Text>
            {sourceSize > target * 1024 ? (
              <View style={styles.sizeBadge}>
                <Text style={styles.sizeBadgeText}>Too Large</Text>
              </View>
            ) : (
              <View style={[styles.sizeBadge, { backgroundColor: "#C6F6D5" }]}>
                <Text style={[styles.sizeBadgeText, { color: "#22543D" }]}>OK</Text>
              </View>
            )}
          </View>

          <Pressable
            style={[styles.compressBtn, processing && { opacity: 0.6 }]}
            onPress={compress}
            disabled={processing}
          >
            {processing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="zip-disk" size={20} color="#fff" />
                <Text style={styles.compressBtnText}>Compress to {target} KB</Text>
              </>
            )}
          </Pressable>
        </View>
      )}

      {/* Result */}
      {resultUri && (
        <View style={styles.resultCard}>
          <Text style={styles.sectionLabel}>Result</Text>
          <Image source={{ uri: resultUri }} style={styles.preview} resizeMode="cover" />

          <View style={styles.statsGrid}>
            <StatBox label="New Size" value={fmtSize(resultSize)} good={resultSize <= target * 1024} />
            <StatBox label="Saved" value={fmtSize(saved)} />
            <StatBox label="Reduction" value={`${pct}%`} good={pct > 0} />
          </View>

          {resultSize > target * 1024 && (
            <View style={styles.warnBox}>
              <MaterialCommunityIcons name="alert-circle" size={16} color="#C05621" />
              <Text style={styles.warnText}>
                Result is still over {target} KB. Try a smaller original image.
              </Text>
            </View>
          )}

          <Pressable style={styles.shareBtn} onPress={share}>
            <MaterialCommunityIcons name="share-variant" size={20} color="#fff" />
            <Text style={styles.shareBtnText}>Save / Share Result</Text>
          </Pressable>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function StatBox({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, good === false && { color: "#C53030" }, good === true && { color: "#22543D" }]}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  content: { padding: 16 },
  heroCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: NAVY, borderRadius: 14, padding: 16, marginBottom: 18,
  },
  heroTitle: { fontSize: 16, fontWeight: "800", color: "#fff" },
  heroSub: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: NAVY, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 },
  targetRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  targetBtn: {
    flex: 1, borderRadius: 12, borderWidth: 2, borderColor: NAVY,
    paddingVertical: 12, alignItems: "center", backgroundColor: "#fff",
  },
  targetBtnActive: { backgroundColor: NAVY },
  targetBtnText: { fontSize: 20, fontWeight: "800", color: NAVY },
  targetBtnTextActive: { color: GOLD },
  targetBtnSub: { fontSize: 10, color: "#718096", marginTop: 2, textAlign: "center" },
  pickBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    borderRadius: 12, borderWidth: 2, borderColor: NAVY, borderStyle: "dashed",
    paddingVertical: 14, backgroundColor: "#fff", marginBottom: 16,
  },
  pickBtnText: { fontSize: 15, fontWeight: "700", color: NAVY },
  previewCard: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: "#e2e8f0" },
  preview: { width: "100%", height: 200, borderRadius: 10, marginBottom: 10 },
  sizeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  sizeText: { fontSize: 14, fontWeight: "600", color: "#4A5568", flex: 1 },
  sizeBadge: { backgroundColor: "#FED7D7", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  sizeBadgeText: { fontSize: 11, fontWeight: "700", color: "#C53030" },
  compressBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: NAVY, borderRadius: 12, paddingVertical: 14,
  },
  compressBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },
  resultCard: { backgroundColor: "#fff", borderRadius: 14, padding: 14, borderWidth: 1, borderColor: "#C6F6D5" },
  statsGrid: { flexDirection: "row", gap: 8, marginBottom: 12 },
  statBox: {
    flex: 1, alignItems: "center", backgroundColor: BG, borderRadius: 10, paddingVertical: 10,
  },
  statValue: { fontSize: 16, fontWeight: "800", color: NAVY },
  statLabel: { fontSize: 10, color: "#718096", marginTop: 2 },
  warnBox: {
    flexDirection: "row", gap: 8, alignItems: "flex-start",
    backgroundColor: "#FEFCBF", borderRadius: 10, padding: 12, marginBottom: 12,
  },
  warnText: { flex: 1, fontSize: 12, color: "#744210", lineHeight: 17 },
  shareBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: "#22543D", borderRadius: 12, paddingVertical: 14,
  },
  shareBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },
});
