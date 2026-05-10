import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { Profile, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, saveProfile } = useApp();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showBloodPicker, setShowBloodPicker] = useState(false);

  const [form, setForm] = useState<Profile>({
    name: "",
    photo: undefined,
    nid: "",
    bloodGroup: "",
    dateOfBirth: "",
    nationality: "Bangladeshi",
    phone: "",
    email: "",
    rank: "",
  });

  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  function setField<K extends keyof Profile>(key: K, value: Profile[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function pickPhoto() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const b64 = result.assets[0].base64;
      if (b64) setField("photo", `data:image/jpeg;base64,${b64}`);
    }
  }

  async function handleSave() {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsSaving(true);
    await saveProfile(form);
    setIsSaving(false);
    setSaved(true);
  }

  const styles = makeStyles(colors);

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { paddingBottom: insets.bottom + 32 },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      {/* Photo */}
      <View style={styles.photoSection}>
        <Pressable onPress={pickPhoto} style={styles.avatarWrap}>
          {form.photo ? (
            <Image source={{ uri: form.photo }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.secondary }]}>
              <MaterialCommunityIcons name="account" size={52} color={colors.mutedForeground} />
            </View>
          )}
          <View style={styles.cameraIcon}>
            <MaterialCommunityIcons name="camera" size={16} color="#fff" />
          </View>
        </Pressable>
        <Text style={[styles.photoLabel, { color: colors.mutedForeground }]}>
          Tap to change photo
        </Text>
      </View>

      <View style={styles.card}>
        <FieldLabel label="Full Name" />
        <TextInput
          style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
          placeholder="Enter full name"
          placeholderTextColor={colors.mutedForeground}
          value={form.name}
          onChangeText={(v) => setField("name", v)}
        />

        <FieldLabel label="Rank / Position" />
        <TextInput
          style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
          placeholder="e.g. Chief Officer, AB Seaman"
          placeholderTextColor={colors.mutedForeground}
          value={form.rank}
          onChangeText={(v) => setField("rank", v)}
        />

        <FieldLabel label="National ID (NID)" />
        <TextInput
          style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
          placeholder="Enter NID number"
          placeholderTextColor={colors.mutedForeground}
          keyboardType="number-pad"
          value={form.nid}
          onChangeText={(v) => setField("nid", v)}
        />

        <FieldLabel label="Date of Birth (DD/MM/YYYY)" />
        <TextInput
          style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
          placeholder="DD/MM/YYYY"
          placeholderTextColor={colors.mutedForeground}
          keyboardType="number-pad"
          value={form.dateOfBirth}
          onChangeText={(v) => setField("dateOfBirth", v)}
          maxLength={10}
        />

        <FieldLabel label="Blood Group" />
        <Pressable
          style={[styles.input, styles.picker, { borderColor: colors.border }]}
          onPress={() => setShowBloodPicker(!showBloodPicker)}
        >
          <Text style={[{ color: form.bloodGroup ? colors.foreground : colors.mutedForeground, flex: 1 }]}>
            {form.bloodGroup || "Select blood group"}
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={20} color={colors.mutedForeground} />
        </Pressable>
        {showBloodPicker && (
          <View style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {BLOOD_GROUPS.map((bg) => (
              <Pressable
                key={bg}
                style={[
                  styles.dropdownItem,
                  form.bloodGroup === bg && { backgroundColor: colors.secondary },
                ]}
                onPress={() => { setField("bloodGroup", bg); setShowBloodPicker(false); }}
              >
                <Text style={[styles.dropdownText, { color: colors.foreground }]}>{bg}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <FieldLabel label="Nationality" />
        <TextInput
          style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
          placeholder="Nationality"
          placeholderTextColor={colors.mutedForeground}
          value={form.nationality}
          onChangeText={(v) => setField("nationality", v)}
        />

        <FieldLabel label="Phone Number" />
        <TextInput
          style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
          placeholder="+880 01XXXXXXXXX"
          placeholderTextColor={colors.mutedForeground}
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={(v) => setField("phone", v)}
        />

        <FieldLabel label="Email Address" />
        <TextInput
          style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
          placeholder="your@email.com"
          placeholderTextColor={colors.mutedForeground}
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={(v) => setField("email", v)}
        />
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.saveBtn,
          { backgroundColor: saved ? colors.success : colors.primary, opacity: pressed ? 0.85 : 1 },
        ]}
        onPress={handleSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <MaterialCommunityIcons
              name={saved ? "check-circle" : "content-save"}
              size={20}
              color="#fff"
            />
            <Text style={styles.saveBtnText}>{saved ? "Saved!" : "Save Profile"}</Text>
          </>
        )}
      </Pressable>
    </ScrollView>
  );
}

function FieldLabel({ label }: { label: string }) {
  const colors = useColors();
  return (
    <Text style={{ fontSize: 12, fontWeight: "600", color: colors.mutedForeground, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>
      {label}
    </Text>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: {
      padding: 16,
      paddingTop: 8,
    },
    photoSection: {
      alignItems: "center",
      marginBottom: 24,
    },
    avatarWrap: {
      position: "relative",
      marginBottom: 8,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
    },
    avatarPlaceholder: {
      width: 100,
      height: 100,
      borderRadius: 50,
      alignItems: "center",
      justifyContent: "center",
    },
    cameraIcon: {
      position: "absolute",
      bottom: 2,
      right: 2,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colors.background,
    },
    photoLabel: {
      fontSize: 13,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 20,
      gap: 0,
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
    picker: {
      flexDirection: "row",
      alignItems: "center",
    },
    dropdown: {
      borderWidth: 1,
      borderRadius: 10,
      marginTop: -10,
      marginBottom: 16,
      overflow: "hidden",
    },
    dropdownItem: {
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    dropdownText: {
      fontSize: 15,
    },
    saveBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderRadius: 14,
      paddingVertical: 16,
    },
    saveBtnText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#fff",
    },
  });
}
