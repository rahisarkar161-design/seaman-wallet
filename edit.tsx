import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Education, SeamanProfile, useApp } from "@/context/AppContext";

const RANKS = [
  "Master", "Chief Officer", "2nd Officer", "3rd Officer",
  "Chief Engineer", "2nd Engineer", "3rd Engineer", "4th Engineer",
  "Bosun", "AB (Able Seaman)", "OS (Ordinary Seaman)",
  "Electrician", "Fitter", "Oiler", "Wiper", "Cook", "Steward",
  "Deck Cadet", "Engine Cadet",
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const NAVY = "#0A2342";
const GOLD = "#D4AF37";
const BG = "#F0F4F8";

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export default function ProfileEditScreen() {
  const { seamanProfile, saveSeamanProfile } = useApp();

  const [form, setForm] = useState<SeamanProfile>(
    seamanProfile ?? {
      name: "", photo: undefined, rank: "", nationality: "Bangladeshi",
      dateOfBirth: "", birthPlace: "", phone: "", email: "", address: "",
      indosNumber: "", sidNumber: "", cdcNumber: "", fatherName: "", motherName: "",
      education: [],
    }
  );
  const [showRanks, setShowRanks] = useState(false);
  const [saving, setSaving] = useState(false);

  function set(key: keyof SeamanProfile, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function pickPhoto() {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!res.canceled && res.assets[0]) {
      setForm((f) => ({ ...f, photo: res.assets[0].uri }));
    }
  }

  async function takePhoto() {
    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!res.canceled && res.assets[0]) {
      setForm((f) => ({ ...f, photo: res.assets[0].uri }));
    }
  }

  function addEducation() {
    const edu: Education = { id: uid(), degree: "", institution: "", year: "", grade: "" };
    setForm((f) => ({ ...f, education: [...f.education, edu] }));
  }

  function updateEducation(id: string, key: keyof Education, val: string) {
    setForm((f) => ({
      ...f,
      education: f.education.map((e) => (e.id === id ? { ...e, [key]: val } : e)),
    }));
  }

  function removeEducation(id: string) {
    setForm((f) => ({ ...f, education: f.education.filter((e) => e.id !== id) }));
  }

  async function save() {
    if (!form.name.trim()) {
      Alert.alert("Required", "Please enter your full name.");
      return;
    }
    setSaving(true);
    await saveSeamanProfile(form);
    setSaving(false);
    router.back();
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Photo */}
        <View style={styles.photoSection}>
          <Pressable onPress={pickPhoto}>
            {form.photo ? (
              <Image source={{ uri: form.photo }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <MaterialCommunityIcons name="camera-account" size={44} color={GOLD} />
              </View>
            )}
          </Pressable>
          <View style={styles.photoButtons}>
            <Pressable style={styles.photoBtn} onPress={takePhoto}>
              <MaterialCommunityIcons name="camera" size={16} color={NAVY} />
              <Text style={styles.photoBtnText}>Camera</Text>
            </Pressable>
            <Pressable style={styles.photoBtn} onPress={pickPhoto}>
              <MaterialCommunityIcons name="image" size={16} color={NAVY} />
              <Text style={styles.photoBtnText}>Gallery</Text>
            </Pressable>
          </View>
        </View>

        <SectionHeader title="Personal Information" />

        <Field label="Full Name *" value={form.name} onChangeText={(v) => set("name", v)} placeholder="As per passport" />
        <Field label="Father's Name" value={form.fatherName} onChangeText={(v) => set("fatherName", v)} placeholder="Father's full name" />
        <Field label="Mother's Name" value={form.motherName} onChangeText={(v) => set("motherName", v)} placeholder="Mother's full name" />
        <Field label="Date of Birth" value={form.dateOfBirth} onChangeText={(v) => set("dateOfBirth", v)} placeholder="DD/MM/YYYY" />
        <Field label="Place of Birth" value={form.birthPlace} onChangeText={(v) => set("birthPlace", v)} placeholder="City, Country" />
        <Field label="Nationality" value={form.nationality} onChangeText={(v) => set("nationality", v)} placeholder="e.g. Bangladeshi" />

        <SectionHeader title="Rank" />

        <Pressable style={styles.rankSelector} onPress={() => setShowRanks(!showRanks)}>
          <Text style={[styles.rankText, !form.rank && { color: "#aaa" }]}>
            {form.rank || "Select Rank"}
          </Text>
          <MaterialCommunityIcons name={showRanks ? "chevron-up" : "chevron-down"} size={20} color={NAVY} />
        </Pressable>
        {showRanks && (
          <View style={styles.rankList}>
            {RANKS.map((r) => (
              <Pressable
                key={r}
                style={[styles.rankItem, form.rank === r && styles.rankItemActive]}
                onPress={() => { set("rank", r); setShowRanks(false); }}
              >
                <Text style={[styles.rankItemText, form.rank === r && styles.rankItemTextActive]}>{r}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <SectionHeader title="Contact" />

        <Field label="Phone" value={form.phone} onChangeText={(v) => set("phone", v)} placeholder="+880 ..." keyboardType="phone-pad" />
        <Field label="Email" value={form.email} onChangeText={(v) => set("email", v)} placeholder="you@example.com" keyboardType="email-address" />
        <Field label="Permanent Address" value={form.address} onChangeText={(v) => set("address", v)} placeholder="Full address" multiline />

        <SectionHeader title="Seaman Documents" />

        <Field label="INDOS Number" value={form.indosNumber} onChangeText={(v) => set("indosNumber", v)} placeholder="INDOS-XXXX-XXXXXX" />
        <Field label="SID Number" value={form.sidNumber} onChangeText={(v) => set("sidNumber", v)} placeholder="SID-XXXXX" />
        <Field label="CDC Number" value={form.cdcNumber} onChangeText={(v) => set("cdcNumber", v)} placeholder="CDC number" />

        <SectionHeader title="Education" />

        {form.education.map((edu, i) => (
          <View key={edu.id} style={styles.eduCard}>
            <View style={styles.eduHeader}>
              <Text style={styles.eduLabel}>Entry {i + 1}</Text>
              <Pressable onPress={() => removeEducation(edu.id)}>
                <MaterialCommunityIcons name="trash-can-outline" size={18} color="#e53e3e" />
              </Pressable>
            </View>
            <Field label="Degree / Certificate" value={edu.degree} onChangeText={(v) => updateEducation(edu.id, "degree", v)} placeholder="e.g. B.Sc Marine Engineering" />
            <Field label="Institution" value={edu.institution} onChangeText={(v) => updateEducation(edu.id, "institution", v)} placeholder="University / College name" />
            <Field label="Year" value={edu.year} onChangeText={(v) => updateEducation(edu.id, "year", v)} placeholder="e.g. 2018" keyboardType="numeric" />
            <Field label="Grade / Result" value={edu.grade} onChangeText={(v) => updateEducation(edu.id, "grade", v)} placeholder="e.g. CGPA 3.8" />
          </View>
        ))}

        <Pressable style={styles.addEduBtn} onPress={addEducation}>
          <MaterialCommunityIcons name="plus-circle-outline" size={18} color={NAVY} />
          <Text style={styles.addEduText}>Add Education</Text>
        </Pressable>

        <Pressable style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={save} disabled={saving}>
          <MaterialCommunityIcons name="content-save" size={20} color="#fff" />
          <Text style={styles.saveBtnText}>{saving ? "Saving..." : "Save Profile"}</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionLine} />
    </View>
  );
}

function Field({
  label, value, onChangeText, placeholder, multiline, keyboardType,
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; multiline?: boolean; keyboardType?: "phone-pad" | "email-address" | "numeric";
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.inputMulti]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  content: { padding: 16 },
  photoSection: { alignItems: "center", marginBottom: 20, marginTop: 8 },
  photo: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: GOLD },
  photoPlaceholder: {
    width: 110, height: 110, borderRadius: 55, backgroundColor: "#e8f0f8",
    borderWidth: 3, borderColor: GOLD, alignItems: "center", justifyContent: "center",
  },
  photoButtons: { flexDirection: "row", gap: 12, marginTop: 12 },
  photoBtn: {
    flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16,
    paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: NAVY, backgroundColor: "#fff",
  },
  photoBtnText: { fontSize: 13, color: NAVY, fontWeight: "600" },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 20, marginBottom: 10 },
  sectionTitle: { fontSize: 12, fontWeight: "700", color: NAVY, textTransform: "uppercase", letterSpacing: 0.8 },
  sectionLine: { flex: 1, height: 1.5, backgroundColor: GOLD },
  field: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: "600", color: NAVY, marginBottom: 4 },
  input: {
    backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 14, color: "#1a202c", borderWidth: 1, borderColor: "#e2e8f0",
  },
  inputMulti: { height: 80, textAlignVertical: "top", paddingTop: 10 },
  rankSelector: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13,
    borderWidth: 1, borderColor: "#e2e8f0", marginBottom: 8,
  },
  rankText: { fontSize: 14, color: "#1a202c" },
  rankList: {
    backgroundColor: "#fff", borderRadius: 10, borderWidth: 1, borderColor: "#e2e8f0",
    marginBottom: 12, overflow: "hidden",
  },
  rankItem: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f0f4f8" },
  rankItemActive: { backgroundColor: NAVY },
  rankItemText: { fontSize: 14, color: "#1a202c" },
  rankItemTextActive: { color: "#fff", fontWeight: "700" },
  eduCard: {
    backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: "#e2e8f0",
  },
  eduHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  eduLabel: { fontSize: 12, fontWeight: "700", color: NAVY, textTransform: "uppercase", letterSpacing: 0.5 },
  addEduBtn: {
    flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10,
    borderWidth: 1.5, borderColor: NAVY, borderStyle: "dashed",
    paddingVertical: 12, justifyContent: "center", marginBottom: 20,
  },
  addEduText: { fontSize: 14, color: NAVY, fontWeight: "600" },
  saveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: NAVY, borderRadius: 14, paddingVertical: 16,
  },
  saveBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});
