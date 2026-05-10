import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DocType, SeamanDocument, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const DOC_TYPES: DocType[] = ["Profile", "CDC", "Passport", "COP", "COC", "Certificate"];

export default function EditDocumentScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { documents, saveDocument, removeDocument } = useApp();
  const doc = documents.find((d) => d.id === id);

  const [isSaving, setIsSaving] = useState(false);
  const [docType, setDocType] = useState<DocType>(doc?.type ?? "Certificate");
  const [name, setName] = useState(doc?.name ?? "");
  const [number, setNumber] = useState(doc?.number ?? "");
  const [issueDate, setIssueDate] = useState(doc?.issueDate ?? "");
  const [expiryDate, setExpiryDate] = useState(doc?.expiryDate ?? "");
  const [fileUri, setFileUri] = useState(doc?.fileUri ?? "");
  const [voiceUri, setVoiceUri] = useState(doc?.voiceNoteUri ?? "");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      soundRef.current?.unloadAsync();
    };
  }, []);

  if (!doc) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: colors.foreground }}>Document not found.</Text>
      </View>
    );
  }

  async function startRecording() {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) return;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: rec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(rec);
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch {}
  }

  async function stopRecording() {
    if (!recording) return;
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = recording.getURI() ?? "";
      setVoiceUri(uri);
      setRecording(null);
      setIsRecording(false);
    } catch {}
  }

  async function playVoiceNote() {
    if (!voiceUri) return;
    try {
      if (soundRef.current) await soundRef.current.unloadAsync();
      const { sound } = await Audio.Sound.createAsync({ uri: voiceUri });
      soundRef.current = sound;
      setIsPlaying(true);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((s) => {
        if (s.isLoaded && s.didJustFinish) setIsPlaying(false);
      });
    } catch {}
  }

  async function pickFromGallery() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!res.canceled && res.assets[0]) setFileUri(res.assets[0].uri);
  }

  async function pickFromCamera() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!res.canceled && res.assets[0]) setFileUri(res.assets[0].uri);
  }

  async function handleSave() {
    if (!name.trim()) { Alert.alert("Required", "Document name is required."); return; }
    if (!expiryDate.trim()) { Alert.alert("Required", "Expiry date is required."); return; }
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsSaving(true);
    const updated: SeamanDocument = {
      ...doc,
      type: docType,
      name: name.trim(),
      number: number.trim(),
      issueDate: issueDate.trim(),
      expiryDate: expiryDate.trim(),
      fileUri: fileUri || undefined,
      voiceNoteUri: voiceUri || undefined,
    };
    await saveDocument(updated);
    setIsSaving(false);
    router.back();
  }

  async function handleDelete() {
    Alert.alert("Delete Document", "Permanently delete this document?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await removeDocument(doc.id);
          router.back();
        },
      },
    ]);
  }

  const styles = makeStyles(colors);
  const fmtTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 32 }]}
      keyboardShouldPersistTaps="handled"
    >
      {/* Type Selector */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Document Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
          {DOC_TYPES.map((t) => (
            <Pressable
              key={t}
              style={[
                styles.typeChip,
                { backgroundColor: docType === t ? colors.primary : colors.secondary, borderColor: docType === t ? colors.primary : colors.border },
              ]}
              onPress={() => setDocType(t)}
            >
              <Text style={[styles.typeChipText, { color: docType === t ? "#fff" : colors.foreground }]}>{t}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.card}>
        <FLabel label="Document Name *" />
        <TextInput style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} placeholder="Document name" placeholderTextColor={colors.mutedForeground} value={name} onChangeText={setName} />
        <FLabel label="Document Number / ID" />
        <TextInput style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} placeholder="e.g. BD-1234567" placeholderTextColor={colors.mutedForeground} autoCapitalize="characters" value={number} onChangeText={setNumber} />
        <FLabel label="Issue Date (DD/MM/YYYY)" />
        <TextInput style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} placeholder="DD/MM/YYYY" placeholderTextColor={colors.mutedForeground} keyboardType="number-pad" value={issueDate} onChangeText={setIssueDate} maxLength={10} />
        <FLabel label="Expiry Date (DD/MM/YYYY) *" />
        <TextInput style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} placeholder="DD/MM/YYYY" placeholderTextColor={colors.mutedForeground} keyboardType="number-pad" value={expiryDate} onChangeText={setExpiryDate} maxLength={10} />
      </View>

      {/* File */}
      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>Attached Document</Text>
        {fileUri ? (
          <View style={styles.previewWrap}>
            <Image source={{ uri: fileUri }} style={styles.preview} resizeMode="cover" />
            <Pressable style={[styles.clearBtn, { backgroundColor: colors.destructive }]} onPress={() => setFileUri("")}>
              <MaterialCommunityIcons name="close" size={16} color="#fff" />
            </Pressable>
          </View>
        ) : (
          <View style={styles.uploadRow}>
            <Pressable style={({ pressed }) => [styles.uploadBtn, { borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]} onPress={pickFromCamera}>
              <MaterialCommunityIcons name="camera" size={22} color={colors.primary} />
              <Text style={[styles.uploadText, { color: colors.primary }]}>Camera</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.uploadBtn, { borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]} onPress={pickFromGallery}>
              <MaterialCommunityIcons name="image-multiple" size={22} color={colors.primary} />
              <Text style={[styles.uploadText, { color: colors.primary }]}>Gallery</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Voice */}
      <View style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>Voice Reminder</Text>
        {!voiceUri ? (
          isRecording ? (
            <View>
              <View style={styles.recordingIndicator}>
                <View style={[styles.recDot, { backgroundColor: "#E53E3E" }]} />
                <Text style={[styles.recTime, { color: "#E53E3E" }]}>{fmtTime(recordingTime)}</Text>
              </View>
              <Pressable style={[styles.voiceBtn, { backgroundColor: "#E53E3E" }]} onPress={stopRecording}>
                <MaterialCommunityIcons name="stop" size={22} color="#fff" />
                <Text style={styles.voiceBtnText}>Stop Recording</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable style={[styles.voiceBtn, { backgroundColor: colors.primary }]} onPress={startRecording}>
              <MaterialCommunityIcons name="microphone" size={22} color="#fff" />
              <Text style={styles.voiceBtnText}>Record Reminder</Text>
            </Pressable>
          )
        ) : (
          <View style={styles.voicePlayRow}>
            <View style={[styles.voicePlayIcon, { backgroundColor: colors.secondary }]}>
              <MaterialCommunityIcons name="microphone-outline" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.voiceRecorded, { color: colors.foreground, flex: 1 }]}>Voice note saved</Text>
            <Pressable style={[styles.playBtn, { backgroundColor: isPlaying ? colors.warning : colors.ocean }]} onPress={isPlaying ? async () => { await soundRef.current?.stopAsync(); setIsPlaying(false); } : playVoiceNote}>
              <MaterialCommunityIcons name={isPlaying ? "pause" : "play"} size={20} color="#fff" />
            </Pressable>
            <Pressable onPress={() => setVoiceUri("")} hitSlop={8}>
              <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.destructive} />
            </Pressable>
          </View>
        )}
      </View>

      {/* Save */}
      <Pressable style={({ pressed }) => [styles.saveBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]} onPress={handleSave} disabled={isSaving}>
        {isSaving ? <ActivityIndicator color="#fff" /> : (
          <>
            <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </>
        )}
      </Pressable>

      {/* Delete */}
      <Pressable style={({ pressed }) => [styles.deleteBtn, { borderColor: colors.destructive, opacity: pressed ? 0.8 : 1 }]} onPress={handleDelete}>
        <MaterialCommunityIcons name="trash-can" size={18} color={colors.destructive} />
        <Text style={[styles.deleteBtnText, { color: colors.destructive }]}>Delete Document</Text>
      </Pressable>
    </ScrollView>
  );
}

function FLabel({ label }: { label: string }) {
  const colors = useColors();
  return <Text style={{ fontSize: 11, fontWeight: "600", color: colors.mutedForeground, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</Text>;
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { padding: 16, gap: 14 },
    section: { gap: 8 },
    sectionLabel: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.4 },
    typeScroll: { flexGrow: 0 },
    typeChip: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, borderWidth: 1.5 },
    typeChipText: { fontSize: 13, fontWeight: "700" },
    card: { backgroundColor: colors.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.border },
    cardTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
    input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, marginBottom: 14, backgroundColor: colors.background },
    uploadRow: { flexDirection: "row", gap: 10 },
    uploadBtn: { flex: 1, flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, borderWidth: 1.5, borderRadius: 12, borderStyle: "dashed", paddingVertical: 18 },
    uploadText: { fontSize: 13, fontWeight: "600" },
    previewWrap: { position: "relative", borderRadius: 12, overflow: "hidden" },
    preview: { width: "100%", height: 180, borderRadius: 12 },
    clearBtn: { position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    recordingIndicator: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
    recDot: { width: 10, height: 10, borderRadius: 5 },
    recTime: { fontSize: 18, fontWeight: "700" },
    voiceBtn: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
    voiceBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
    voicePlayRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    voicePlayIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
    voiceRecorded: { fontSize: 14, fontWeight: "600" },
    playBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
    saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 16 },
    saveBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
    deleteBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 14, borderWidth: 1.5 },
    deleteBtnText: { fontSize: 15, fontWeight: "700" },
  });
}
