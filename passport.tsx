import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { PassportCDC, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function daysUntil(dateStr: string): number {
  if (!dateStr) return 9999;
  const parts = dateStr.split("/");
  if (parts.length !== 3) return 9999;
  const expiry = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function CountdownRing({ days }: { days: number }) {
  const colors = useColors();
  let ringColor = colors.success;
  let label = `${days} days`;
  if (days < 0) { ringColor = "#742A2A"; label = "EXPIRED"; }
  else if (days <= 25) { ringColor = "#C53030"; }
  else if (days <= 90) { ringColor = "#D69E2E"; }

  return (
    <View style={{ alignItems: "center", justifyContent: "center", width: 80, height: 80, borderRadius: 40, borderWidth: 5, borderColor: ringColor }}>
      <Text style={{ fontSize: days < 0 ? 10 : 18, fontWeight: "800", color: ringColor }}>{days < 0 ? "EXP" : days > 999 ? "—" : days}</Text>
      {days >= 0 && days <= 999 && <Text style={{ fontSize: 9, color: ringColor, fontWeight: "600" }}>days</Text>}
    </View>
  );
}

export default function PassportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { passportCDC, savePassportCDC } = useApp();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState<PassportCDC>({
    passportNumber: "",
    passportExpiry: "",
    passportCountry: "Bangladesh",
    cdcNumber: "",
    cdcExpiry: "",
    cdcIssuePort: "",
  });

  useEffect(() => {
    if (passportCDC) setForm(passportCDC);
  }, [passportCDC]);

  function setField<K extends keyof PassportCDC>(key: K, val: PassportCDC[K]) {
    setForm((f) => ({ ...f, [key]: val }));
    setSaved(false);
  }

  async function handleSave() {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsSaving(true);
    await savePassportCDC(form);
    setIsSaving(false);
    setSaved(true);
  }

  const passportDays = daysUntil(form.passportExpiry);
  const cdcDays = daysUntil(form.cdcExpiry);
  const styles = makeStyles(colors);

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 32 }]}
      keyboardShouldPersistTaps="handled"
    >
      {/* Passport Card */}
      <View style={[styles.docCard, { borderColor: "#6A1B9A30" }]}>
        <View style={styles.docCardHeader}>
          <View style={[styles.docIcon, { backgroundColor: "#6A1B9A18" }]}>
            <MaterialCommunityIcons name="passport" size={28} color="#6A1B9A" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.docTitle, { color: colors.foreground }]}>Passport</Text>
            {form.passportExpiry !== "" && (
              <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Expires {form.passportExpiry}</Text>
            )}
          </View>
          {form.passportExpiry !== "" && <CountdownRing days={passportDays} />}
        </View>

        <FieldLabel label="Passport Number" />
        <TextInput
          style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
          placeholder="A-1234567"
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="characters"
          value={form.passportNumber}
          onChangeText={(v) => setField("passportNumber", v)}
        />

        <FieldLabel label="Issuing Country" />
        <TextInput
          style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
          placeholder="Bangladesh"
          placeholderTextColor={colors.mutedForeground}
          value={form.passportCountry}
          onChangeText={(v) => setField("passportCountry", v)}
        />

        <FieldLabel label="Expiry Date (DD/MM/YYYY)" />
        <TextInput
          style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
          placeholder="DD/MM/YYYY"
          placeholderTextColor={colors.mutedForeground}
          keyboardType="number-pad"
          value={form.passportExpiry}
          onChangeText={(v) => setField("passportExpiry", v)}
          maxLength={10}
        />

        {form.passportExpiry !== "" && passportDays <= 90 && (
          <View style={styles.alertRow}>
            <MaterialCommunityIcons name="alert-circle" size={16} color={passportDays <= 25 ? "#C53030" : "#D69E2E"} />
            <Text style={{ color: passportDays <= 25 ? "#C53030" : "#D69E2E", fontSize: 13, fontWeight: "600" }}>
              {passportDays <= 0 ? "Passport EXPIRED — renew immediately!" : `Renew passport within ${passportDays} days`}
            </Text>
          </View>
        )}
      </View>

      {/* CDC Card */}
      <View style={[styles.docCard, { borderColor: "#0277BD30" }]}>
        <View style={styles.docCardHeader}>
          <View style={[styles.docIcon, { backgroundColor: "#0277BD18" }]}>
            <MaterialCommunityIcons name="card-account-details" size={28} color="#0277BD" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.docTitle, { color: colors.foreground }]}>CDC</Text>
            <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Continuous Discharge Certificate</Text>
            {form.cdcExpiry !== "" && (
              <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 2 }}>Expires {form.cdcExpiry}</Text>
            )}
          </View>
          {form.cdcExpiry !== "" && <CountdownRing days={cdcDays} />}
        </View>

        <FieldLabel label="CDC Number" />
        <TextInput
          style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
          placeholder="BD-1234567"
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="characters"
          value={form.cdcNumber}
          onChangeText={(v) => setField("cdcNumber", v)}
        />

        <FieldLabel label="Issue Port" />
        <TextInput
          style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
          placeholder="Chittagong, Dhaka"
          placeholderTextColor={colors.mutedForeground}
          value={form.cdcIssuePort}
          onChangeText={(v) => setField("cdcIssuePort", v)}
        />

        <FieldLabel label="Expiry Date (DD/MM/YYYY)" />
        <TextInput
          style={[styles.input, { color: colors.foreground, borderColor: colors.border }]}
          placeholder="DD/MM/YYYY"
          placeholderTextColor={colors.mutedForeground}
          keyboardType="number-pad"
          value={form.cdcExpiry}
          onChangeText={(v) => setField("cdcExpiry", v)}
          maxLength={10}
        />

        {form.cdcExpiry !== "" && cdcDays <= 90 && (
          <View style={styles.alertRow}>
            <MaterialCommunityIcons name="alert-circle" size={16} color={cdcDays <= 25 ? "#C53030" : "#D69E2E"} />
            <Text style={{ color: cdcDays <= 25 ? "#C53030" : "#D69E2E", fontSize: 13, fontWeight: "600" }}>
              {cdcDays <= 0 ? "CDC EXPIRED — renew immediately!" : `Renew CDC within ${cdcDays} days`}
            </Text>
          </View>
        )}
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
            <MaterialCommunityIcons name={saved ? "check-circle" : "content-save"} size={20} color="#fff" />
            <Text style={styles.saveBtnText}>{saved ? "Saved!" : "Save Documents"}</Text>
          </>
        )}
      </Pressable>
    </ScrollView>
  );
}

function FieldLabel({ label }: { label: string }) {
  const colors = useColors();
  return (
    <Text style={{ fontSize: 11, fontWeight: "600", color: colors.mutedForeground, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>
      {label}
    </Text>
  );
}

function makeStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    container: { padding: 16, gap: 16 },
    docCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
    },
    docCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 20,
    },
    docIcon: {
      width: 52,
      height: 52,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    docTitle: { fontSize: 18, fontWeight: "700" },
    input: {
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      marginBottom: 14,
      backgroundColor: colors.background,
    },
    alertRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: "#FFF5F5",
      borderRadius: 8,
      padding: 10,
      marginTop: -4,
    },
    saveBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderRadius: 14,
      paddingVertical: 16,
    },
    saveBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  });
}
