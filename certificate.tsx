import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ExpiryBadge from "@/components/ExpiryBadge";
import { Certificate, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function genId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function daysUntil(dateStr: string): number {
  if (!dateStr) return 9999;
  const parts = dateStr.split("/");
  if (parts.length !== 3) return 9999;
  const expiry = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function CertificateScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { certificates, saveCertificate, removeCertificate } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editCert, setEditCert] = useState<Certificate | null>(null);

  const [form, setForm] = useState({
    name: "",
    issuingBody: "",
    issueDate: "",
    expiryDate: "",
    fileType: "PDF" as Certificate["fileType"],
    fileUri: "",
  });

  function resetForm() {
    setForm({ name: "", issuingBody: "", issueDate: "", expiryDate: "", fileType: "PDF", fileUri: "" });
    setEditCert(null);
  }

  function openAdd() {
    resetForm();
    setShowModal(true);
  }

  function openEdit(cert: Certificate) {
    setForm({
      name: cert.name,
      issuingBody: cert.issuingBody,
      issueDate: cert.issueDate,
      expiryDate: cert.expiryDate,
      fileType: cert.fileType,
      fileUri: cert.fileUri || "",
    });
    setEditCert(cert);
    setShowModal(true);
  }

  async function pickFile() {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
      });
      if (!res.canceled && res.assets[0]) {
        setForm((f) => ({ ...f, fileUri: res.assets[0].uri }));
      }
    } catch {
      // ignore
    }
  }

  async function handleSave() {
    if (!form.name.trim() || !form.expiryDate.trim()) {
      Alert.alert("Required", "Certificate name and expiry date are required.");
      return;
    }
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const cert: Certificate = {
      id: editCert?.id || genId(),
      name: form.name.trim(),
      issuingBody: form.issuingBody.trim(),
      issueDate: form.issueDate.trim(),
      expiryDate: form.expiryDate.trim(),
      fileType: form.fileType,
      fileUri: form.fileUri || undefined,
    };
    await saveCertificate(cert);
    setShowModal(false);
    resetForm();
  }

  function handleDelete(id: string) {
    Alert.alert("Delete Certificate", "Remove this certificate?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await removeCertificate(id);
        },
      },
    ]);
  }

  const styles = makeStyles(colors);

  const sorted = [...certificates].sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={sorted}
        keyExtractor={(i) => i.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 90 },
        ]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="certificate-outline" size={56} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Certificates Yet</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Add your STCW, medical, and other certificates to track expiry dates.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const days = daysUntil(item.expiryDate);
          return (
            <Pressable
              style={[
                styles.certCard,
                { borderColor: days <= 25 ? "#FEB2B2" : days <= 90 ? "#FBD38D" : colors.border },
              ]}
              onPress={() => openEdit(item)}
            >
              <View style={[styles.certIcon, { backgroundColor: "#2E7D3218" }]}>
                <MaterialCommunityIcons
                  name={item.fileType === "PDF" ? "file-pdf-box" : "image"}
                  size={26}
                  color="#2E7D32"
                />
              </View>
              <View style={styles.certInfo}>
                <Text style={[styles.certName, { color: colors.foreground }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[styles.certBody, { color: colors.mutedForeground }]}>
                  {item.issuingBody || "—"}
                </Text>
                <Text style={[styles.certDate, { color: colors.mutedForeground }]}>
                  Expires: {item.expiryDate}
                </Text>
              </View>
              <View style={styles.certRight}>
                <ExpiryBadge daysLeft={days} />
                <Pressable onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                  <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.destructive} />
                </Pressable>
              </View>
            </Pressable>
          );
        }}
      />

      {/* FAB */}
      <Pressable
        style={({ pressed }) => [styles.fab, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
        onPress={openAdd}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#fff" />
      </Pressable>

      {/* Add/Edit Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              {editCert ? "Edit Certificate" : "Add Certificate"}
            </Text>
            <Pressable onPress={() => { setShowModal(false); resetForm(); }}>
              <MaterialCommunityIcons name="close" size={24} color={colors.foreground} />
            </Pressable>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.formCard}>
              <FLabel label="Certificate Name *" />
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
                placeholder="e.g. STCW Basic Safety Training"
                placeholderTextColor={colors.mutedForeground}
                value={form.name}
                onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
              />

              <FLabel label="Issuing Body" />
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
                placeholder="e.g. BIMCO, IMO, DG Shipping"
                placeholderTextColor={colors.mutedForeground}
                value={form.issuingBody}
                onChangeText={(v) => setForm((f) => ({ ...f, issuingBody: v }))}
              />

              <FLabel label="Issue Date (DD/MM/YYYY)" />
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="number-pad"
                value={form.issueDate}
                onChangeText={(v) => setForm((f) => ({ ...f, issueDate: v }))}
                maxLength={10}
              />

              <FLabel label="Expiry Date (DD/MM/YYYY) *" />
              <TextInput
                style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="number-pad"
                value={form.expiryDate}
                onChangeText={(v) => setForm((f) => ({ ...f, expiryDate: v }))}
                maxLength={10}
              />

              <FLabel label="File Type" />
              <View style={styles.toggleRow}>
                {(["PDF", "Image", "Other"] as Certificate["fileType"][]).map((t) => (
                  <Pressable
                    key={t}
                    style={[
                      styles.toggleBtn,
                      form.fileType === t && { backgroundColor: colors.primary },
                      { borderColor: colors.border },
                    ]}
                    onPress={() => setForm((f) => ({ ...f, fileType: t }))}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        { color: form.fileType === t ? "#fff" : colors.foreground },
                      ]}
                    >
                      {t}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.uploadBtn,
                  { borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
                ]}
                onPress={pickFile}
              >
                <MaterialCommunityIcons name="upload" size={20} color={colors.primary} />
                <Text style={[styles.uploadText, { color: colors.primary }]}>
                  {form.fileUri ? "File selected" : `Upload ${form.fileType}`}
                </Text>
                {form.fileUri && (
                  <MaterialCommunityIcons name="check-circle" size={18} color={colors.success} />
                )}
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [styles.saveBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
              onPress={handleSave}
            >
              <Text style={styles.saveBtnText}>Save Certificate</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function FLabel({ label }: { label: string }) {
  const colors = useColors();
  return (
    <Text style={{ fontSize: 11, fontWeight: "600", color: colors.mutedForeground, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>
      {label}
    </Text>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    list: { padding: 12 },
    certCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      gap: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 1,
    },
    certIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    certInfo: { flex: 1 },
    certName: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
    certBody: { fontSize: 12, marginBottom: 2 },
    certDate: { fontSize: 12 },
    certRight: { alignItems: "flex-end", gap: 8 },
    deleteBtn: { padding: 4 },
    empty: {
      alignItems: "center",
      paddingTop: 80,
      paddingHorizontal: 32,
      gap: 12,
    },
    emptyTitle: { fontSize: 18, fontWeight: "700" },
    emptyText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
    fab: {
      position: "absolute",
      bottom: 24,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 6,
    },
    modalContainer: {
      flex: 1,
      padding: 20,
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "700",
    },
    formCard: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
    input: {
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      marginBottom: 16,
      backgroundColor: colors.background,
    },
    toggleRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 16,
    },
    toggleBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      alignItems: "center",
    },
    toggleText: { fontSize: 13, fontWeight: "600" },
    uploadBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderWidth: 1.5,
      borderRadius: 10,
      borderStyle: "dashed",
      paddingVertical: 14,
    },
    uploadText: { fontSize: 14, fontWeight: "600" },
    saveBtn: {
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: "center",
      marginBottom: 16,
    },
    saveBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  });
}
