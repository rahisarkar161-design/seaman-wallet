import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SeamanDocument, useApp } from "@/context/AppContext";

const NAVY = "#0A2342";
const GOLD = "#D4AF37";
const BG = "#F0F4F8";

type Template = "modern" | "classic" | "compact";

const TEMPLATES: { id: Template; label: string; desc: string; icon: string }[] = [
  { id: "modern", label: "Modern Marine", desc: "Navy header · Gold accents · 2-column", icon: "anchor" },
  { id: "classic", label: "Classic", desc: "Formal · Black & white · Single-column", icon: "file-document" },
  { id: "compact", label: "Compact", desc: "Dense · One-page · Minimal", icon: "view-compact" },
];

export default function CVScreen() {
  const { seamanProfile, documents } = useApp();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<Template>("modern");
  const [exporting, setExporting] = useState(false);
  const topPad = Platform.OS === "web" ? 60 : insets.top;

  const certs = documents.filter((d) => ["CDC", "Passport", "COC", "COP", "Certificate"].includes(d.type));
  const hasProfile = !!seamanProfile?.name;

  async function exportPDF() {
    setExporting(true);
    try {
      let photoDataUri = "";
      if (seamanProfile?.photo) {
        try {
          const b64 = await FileSystem.readAsStringAsync(seamanProfile.photo, {
            encoding: FileSystem.EncodingType.Base64,
          });
          photoDataUri = `data:image/jpeg;base64,${b64}`;
        } catch {
          // ignore photo errors
        }
      }

      const html = buildHTML(selected, seamanProfile, certs, photoDataUri);
      const { uri } = await Print.printToFileAsync({ html, base64: false });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: "application/pdf" });
      } else {
        Alert.alert("PDF Saved", `Saved to: ${uri}`);
      }
    } catch (e) {
      Alert.alert("Export Failed", String(e));
    } finally {
      setExporting(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 8 }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Auto CV Maker</Text>
          <Text style={styles.headerSub}>Generate your maritime resume instantly</Text>
        </View>
        <MaterialCommunityIcons name="file-account" size={32} color={GOLD} />
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        {hasProfile ? (
          <View style={styles.profileRow}>
            {seamanProfile?.photo ? (
              <Image source={{ uri: seamanProfile.photo }} style={styles.profilePhoto} />
            ) : (
              <View style={styles.profilePhotoPlaceholder}>
                <MaterialCommunityIcons name="account" size={32} color={GOLD} />
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{seamanProfile?.name}</Text>
              <Text style={styles.profileRank}>{seamanProfile?.rank}</Text>
              <Text style={styles.profileNat}>{seamanProfile?.nationality} · {seamanProfile?.indosNumber || "No INDOS"}</Text>
            </View>
            <Pressable style={styles.editBtn} onPress={() => router.push("/profile/edit")}>
              <MaterialCommunityIcons name="pencil" size={16} color={NAVY} />
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.profileEmpty} onPress={() => router.push("/profile/edit")}>
            <MaterialCommunityIcons name="account-plus-outline" size={36} color={GOLD} />
            <Text style={styles.profileEmptyTitle}>Set Up Your Profile</Text>
            <Text style={styles.profileEmptySub}>Add your name, rank, photo, and education to generate a CV</Text>
            <View style={styles.profileEmptyBtn}>
              <Text style={styles.profileEmptyBtnText}>Create Profile →</Text>
            </View>
          </Pressable>
        )}
      </View>

      {/* Document count */}
      <View style={styles.statsRow}>
        <StatChip icon="certificate" label="Certs" value={certs.length} />
        <StatChip icon="school" label="Education" value={seamanProfile?.education?.length ?? 0} />
        <StatChip icon="file-multiple" label="Total Docs" value={documents.length} />
      </View>

      {/* Template selection */}
      <Text style={styles.sectionLabel}>Choose Template</Text>
      {TEMPLATES.map((t) => (
        <Pressable
          key={t.id}
          style={[styles.templateCard, selected === t.id && styles.templateCardActive]}
          onPress={() => setSelected(t.id)}
        >
          <View style={[styles.templateIcon, selected === t.id && styles.templateIconActive]}>
            <MaterialCommunityIcons
              name={t.icon as never}
              size={22}
              color={selected === t.id ? "#fff" : NAVY}
            />
          </View>
          <View style={styles.templateInfo}>
            <Text style={[styles.templateLabel, selected === t.id && styles.templateLabelActive]}>
              {t.label}
            </Text>
            <Text style={styles.templateDesc}>{t.desc}</Text>
          </View>
          {selected === t.id && (
            <MaterialCommunityIcons name="check-circle" size={22} color={GOLD} />
          )}
        </Pressable>
      ))}

      {/* Export Button */}
      <Pressable
        style={[styles.exportBtn, (!hasProfile || exporting) && styles.exportBtnDisabled]}
        onPress={exportPDF}
        disabled={!hasProfile || exporting}
      >
        {exporting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <MaterialCommunityIcons name="file-pdf-box" size={22} color="#fff" />
            <Text style={styles.exportBtnText}>Export PDF</Text>
          </>
        )}
      </Pressable>

      {!hasProfile && (
        <Text style={styles.exportHint}>Create your profile above to enable PDF export</Text>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function StatChip({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <View style={styles.statChip}>
      <MaterialCommunityIcons name={icon as never} size={18} color={GOLD} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── HTML Builders ────────────────────────────────────────────────────────────

function esc(s: string) {
  return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function fmtCerts(docs: SeamanDocument[]) {
  return docs
    .map(
      (d) => `
    <div class="cert-item">
      <div class="cert-name">${esc(d.name || d.type)}</div>
      <div class="cert-detail">No: ${esc(d.number)} &nbsp;|&nbsp; Expiry: ${esc(d.expiryDate)}</div>
    </div>`
    )
    .join("");
}

function buildHTML(
  template: Template,
  profile: ReturnType<typeof useApp>["seamanProfile"],
  certs: SeamanDocument[],
  photoUri: string
): string {
  const p = profile!;
  const photoTag = photoUri
    ? `<img src="${photoUri}" class="photo" />`
    : `<div class="photo-ph"><span>👤</span></div>`;

  const eduRows = (p.education || [])
    .map(
      (e) => `
    <div class="edu-item">
      <div class="edu-degree">${esc(e.degree)}</div>
      <div class="edu-inst">${esc(e.institution)}${e.year ? ` &mdash; ${esc(e.year)}` : ""}${e.grade ? ` &mdash; ${esc(e.grade)}` : ""}</div>
    </div>`
    )
    .join("");

  if (template === "modern") return modernTemplate(p, certs, photoTag, eduRows);
  if (template === "classic") return classicTemplate(p, certs, photoTag, eduRows);
  return compactTemplate(p, certs, photoTag, eduRows);
}

function modernTemplate(p: NonNullable<ReturnType<typeof useApp>["seamanProfile"]>, certs: SeamanDocument[], photoTag: string, eduRows: string) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,sans-serif;background:#fff;font-size:12px}
  .header{background:#0A2342;padding:28px 30px;display:flex;align-items:center;gap:20px}
  .photo{width:100px;height:100px;border-radius:50px;border:3px solid #D4AF37;object-fit:cover}
  .photo-ph{width:100px;height:100px;border-radius:50px;border:3px solid #D4AF37;background:rgba(212,175,55,0.15);display:flex;align-items:center;justify-content:center;font-size:36px}
  .hi{flex:1}
  .name{font-size:24px;font-weight:bold;color:#fff}
  .rank{font-size:15px;color:#D4AF37;margin-top:4px}
  .contact{font-size:11px;color:rgba(255,255,255,0.8);margin-top:8px;line-height:1.8}
  .gold-bar{height:4px;background:#D4AF37}
  .body{display:flex;gap:0;padding:0}
  .left{width:36%;background:#f0f4f8;padding:20px 18px}
  .right{flex:1;padding:20px 18px}
  .sec-title{font-size:11px;font-weight:bold;color:#0A2342;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #D4AF37;padding-bottom:4px;margin-bottom:10px;margin-top:16px}
  .sec-title:first-child{margin-top:0}
  .cert-item{background:#fff;border-left:3px solid #0A2342;padding:8px 10px;margin-bottom:6px;border-radius:0 6px 6px 0}
  .cert-name{font-size:11px;font-weight:bold;color:#0A2342}
  .cert-detail{font-size:10px;color:#555;margin-top:2px}
  .info-row{display:flex;justify-content:space-between;margin-bottom:6px;gap:8px}
  .il{font-size:10px;color:#888}
  .iv{font-size:11px;font-weight:600;color:#0A2342;text-align:right}
  .edu-item{margin-bottom:10px}
  .edu-degree{font-size:11px;font-weight:bold;color:#0A2342}
  .edu-inst{font-size:10px;color:#555;margin-top:2px}
  .no-content{font-size:11px;color:#999;font-style:italic}
  .footer{text-align:center;padding:12px;background:#0A2342;color:rgba(255,255,255,0.55);font-size:9px}
</style>
</head><body>
<div class="header">
  ${photoTag}
  <div class="hi">
    <div class="name">${esc(p.name)}</div>
    <div class="rank">${esc(p.rank)}</div>
    <div class="contact">
      ${p.phone ? `📱 ${esc(p.phone)}` : ""}${p.email ? ` &nbsp;·&nbsp; ✉ ${esc(p.email)}` : ""}<br>
      ${p.nationality ? `🌍 ${esc(p.nationality)}` : ""}${p.indosNumber ? ` &nbsp;·&nbsp; INDOS: ${esc(p.indosNumber)}` : ""}${p.cdcNumber ? ` &nbsp;·&nbsp; CDC: ${esc(p.cdcNumber)}` : ""}
    </div>
  </div>
</div>
<div class="gold-bar"></div>
<div class="body">
  <div class="left">
    <div class="sec-title">Personal</div>
    ${p.dateOfBirth ? `<div class="info-row"><span class="il">Date of Birth</span><span class="iv">${esc(p.dateOfBirth)}</span></div>` : ""}
    ${p.birthPlace ? `<div class="info-row"><span class="il">Birth Place</span><span class="iv">${esc(p.birthPlace)}</span></div>` : ""}
    ${p.fatherName ? `<div class="info-row"><span class="il">Father</span><span class="iv">${esc(p.fatherName)}</span></div>` : ""}
    ${p.motherName ? `<div class="info-row"><span class="il">Mother</span><span class="iv">${esc(p.motherName)}</span></div>` : ""}
    ${p.address ? `<div class="info-row"><span class="il">Address</span><span class="iv" style="max-width:120px">${esc(p.address)}</span></div>` : ""}
    <div class="sec-title">Credentials</div>
    ${p.indosNumber ? `<div class="info-row"><span class="il">INDOS No</span><span class="iv">${esc(p.indosNumber)}</span></div>` : ""}
    ${p.sidNumber ? `<div class="info-row"><span class="il">SID No</span><span class="iv">${esc(p.sidNumber)}</span></div>` : ""}
    ${p.cdcNumber ? `<div class="info-row"><span class="il">CDC No</span><span class="iv">${esc(p.cdcNumber)}</span></div>` : ""}
    <div class="sec-title">Education</div>
    ${eduRows || '<div class="no-content">No education added</div>'}
  </div>
  <div class="right">
    <div class="sec-title">Certificates & Documents</div>
    ${certs.length ? fmtCerts(certs) : '<div class="no-content">No certificates added</div>'}
  </div>
</div>
<div class="footer">Generated by Seaman Wallet &nbsp;·&nbsp; ${new Date().toLocaleDateString()}</div>
</body></html>`;
}

function classicTemplate(p: NonNullable<ReturnType<typeof useApp>["seamanProfile"]>, certs: SeamanDocument[], photoTag: string, eduRows: string) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Times New Roman',serif;background:#fff;font-size:12px;padding:30px}
  .header{text-align:center;border-bottom:3px double #000;padding-bottom:18px;margin-bottom:18px;display:flex;align-items:center;justify-content:center;gap:20px}
  .photo{width:90px;height:90px;border:2px solid #333;object-fit:cover}
  .photo-ph{width:90px;height:90px;border:2px solid #333;display:flex;align-items:center;justify-content:center;font-size:32px;background:#f5f5f5}
  .name{font-size:22px;font-weight:bold;text-transform:uppercase;letter-spacing:2px}
  .rank{font-size:14px;color:#333;margin-top:4px;font-style:italic}
  .contact{font-size:11px;color:#555;margin-top:6px;line-height:1.8}
  .sec-title{font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #333;padding-bottom:3px;margin-top:18px;margin-bottom:10px}
  .info-table{width:100%;border-collapse:collapse;margin-bottom:8px}
  .info-table td{padding:4px 6px;font-size:11px;vertical-align:top}
  .info-table .label{font-weight:bold;width:140px;color:#333}
  .cert-row{padding:5px 0;border-bottom:1px solid #eee;font-size:11px}
  .cert-row strong{color:#000}
  .edu-item{margin-bottom:8px;font-size:11px}
  .edu-degree{font-weight:bold}
  .edu-inst{color:#555;margin-top:2px}
  .no-content{font-size:11px;color:#999;font-style:italic}
  .footer{text-align:center;margin-top:24px;font-size:9px;color:#888;border-top:1px solid #ccc;padding-top:10px}
</style>
</head><body>
<div class="header">
  ${photoTag}
  <div>
    <div class="name">${esc(p.name)}</div>
    <div class="rank">${esc(p.rank)}</div>
    <div class="contact">
      ${[p.phone, p.email, p.nationality].filter(Boolean).map(esc).join(" | ")}<br>
      ${[p.indosNumber ? `INDOS: ${p.indosNumber}` : "", p.cdcNumber ? `CDC: ${p.cdcNumber}` : ""].filter(Boolean).join(" | ")}
    </div>
  </div>
</div>
<div class="sec-title">Personal Information</div>
<table class="info-table">
  <tr><td class="label">Date of Birth</td><td>${esc(p.dateOfBirth)}</td><td class="label">Place of Birth</td><td>${esc(p.birthPlace)}</td></tr>
  <tr><td class="label">Father's Name</td><td>${esc(p.fatherName)}</td><td class="label">Mother's Name</td><td>${esc(p.motherName)}</td></tr>
  <tr><td class="label">Nationality</td><td>${esc(p.nationality)}</td><td class="label">Address</td><td>${esc(p.address)}</td></tr>
  ${p.sidNumber ? `<tr><td class="label">SID Number</td><td>${esc(p.sidNumber)}</td><td class="label">INDOS Number</td><td>${esc(p.indosNumber)}</td></tr>` : ""}
</table>
<div class="sec-title">Education & Qualifications</div>
${eduRows || '<div class="no-content">Not provided</div>'}
<div class="sec-title">Certificates & Documents</div>
${certs.map((d) => `<div class="cert-row"><strong>${esc(d.name || d.type)}</strong> — No: ${esc(d.number)} — Expiry: ${esc(d.expiryDate)}</div>`).join("") || '<div class="no-content">No certificates</div>'}
<div class="footer">Generated by Seaman Wallet &nbsp;·&nbsp; ${new Date().toLocaleDateString()} &nbsp;·&nbsp; This document is computer generated.</div>
</body></html>`;
}

function compactTemplate(p: NonNullable<ReturnType<typeof useApp>["seamanProfile"]>, certs: SeamanDocument[], photoTag: string, eduRows: string) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,sans-serif;background:#fff;font-size:11px;padding:20px}
  .top{display:flex;align-items:flex-start;gap:16px;border-bottom:2px solid #0A2342;padding-bottom:14px;margin-bottom:14px}
  .photo{width:80px;height:80px;border-radius:8px;object-fit:cover}
  .photo-ph{width:80px;height:80px;border-radius:8px;background:#e8f0f8;display:flex;align-items:center;justify-content:center;font-size:28px}
  .ti{flex:1}
  .name{font-size:20px;font-weight:bold;color:#0A2342}
  .rank{font-size:13px;color:#D4AF37;font-weight:bold;margin-top:2px}
  .contact{font-size:10px;color:#555;margin-top:5px;line-height:1.7}
  .cols{display:flex;gap:16px}
  .col{flex:1}
  .sec{margin-bottom:12px}
  .sec-title{font-size:10px;font-weight:bold;color:#0A2342;text-transform:uppercase;letter-spacing:0.8px;background:#f0f4f8;padding:3px 6px;border-left:3px solid #D4AF37;margin-bottom:6px}
  .row{display:flex;gap:4px;margin-bottom:3px}
  .rl{color:#888;width:80px;flex-shrink:0}
  .rv{color:#0A2342;font-weight:600;flex:1}
  .tag{display:inline-block;background:#0A2342;color:#fff;font-size:9px;padding:2px 7px;border-radius:10px;margin:2px 2px 0 0}
  .cert-line{padding:4px 0;border-bottom:1px solid #f0f4f8;font-size:10px}
  .edu-line{margin-bottom:5px;font-size:10px}
  .no-content{font-size:10px;color:#999;font-style:italic}
  .footer{text-align:center;margin-top:14px;font-size:9px;color:#aaa;border-top:1px solid #eee;padding-top:8px}
</style>
</head><body>
<div class="top">
  ${photoTag}
  <div class="ti">
    <div class="name">${esc(p.name)}</div>
    <div class="rank">${esc(p.rank)}</div>
    <div class="contact">
      ${p.phone ? `📱 ${esc(p.phone)}` : ""}${p.email ? ` &nbsp;|&nbsp; ${esc(p.email)}` : ""}<br>
      ${p.nationality ? esc(p.nationality) : ""}${p.indosNumber ? ` &nbsp;|&nbsp; INDOS: ${esc(p.indosNumber)}` : ""}${p.cdcNumber ? ` &nbsp;|&nbsp; CDC: ${esc(p.cdcNumber)}` : ""}
    </div>
  </div>
</div>
<div class="cols">
  <div class="col">
    <div class="sec">
      <div class="sec-title">Personal</div>
      ${p.dateOfBirth ? `<div class="row"><span class="rl">DOB</span><span class="rv">${esc(p.dateOfBirth)}</span></div>` : ""}
      ${p.birthPlace ? `<div class="row"><span class="rl">Birthplace</span><span class="rv">${esc(p.birthPlace)}</span></div>` : ""}
      ${p.nationality ? `<div class="row"><span class="rl">Nationality</span><span class="rv">${esc(p.nationality)}</span></div>` : ""}
      ${p.fatherName ? `<div class="row"><span class="rl">Father</span><span class="rv">${esc(p.fatherName)}</span></div>` : ""}
      ${p.sidNumber ? `<div class="row"><span class="rl">SID No</span><span class="rv">${esc(p.sidNumber)}</span></div>` : ""}
    </div>
    <div class="sec">
      <div class="sec-title">Education</div>
      ${eduRows || '<div class="no-content">Not added</div>'}
    </div>
  </div>
  <div class="col">
    <div class="sec">
      <div class="sec-title">Certificates</div>
      ${certs.map((d) => `<div class="cert-line"><strong>${esc(d.name || d.type)}</strong><br>${esc(d.number)} · Exp: ${esc(d.expiryDate)}</div>`).join("") || '<div class="no-content">No certs</div>'}
    </div>
  </div>
</div>
<div class="footer">Seaman Wallet &nbsp;·&nbsp; ${new Date().toLocaleDateString()}</div>
</body></html>`;
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
  profileCard: { backgroundColor: "#fff", borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: "#e2e8f0" },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  profilePhoto: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: GOLD },
  profilePhotoPlaceholder: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: "#e8f0f8",
    borderWidth: 2, borderColor: GOLD, alignItems: "center", justifyContent: "center",
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: "700", color: NAVY },
  profileRank: { fontSize: 13, color: GOLD, fontWeight: "600", marginTop: 2 },
  profileNat: { fontSize: 11, color: "#718096", marginTop: 2 },
  editBtn: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: "#f0f4f8",
    alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#e2e8f0",
  },
  profileEmpty: { alignItems: "center", paddingVertical: 20, gap: 8 },
  profileEmptyTitle: { fontSize: 16, fontWeight: "700", color: NAVY },
  profileEmptySub: { fontSize: 12, color: "#718096", textAlign: "center", lineHeight: 18 },
  profileEmptyBtn: { backgroundColor: NAVY, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10, marginTop: 4 },
  profileEmptyBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
  statChip: {
    flex: 1, alignItems: "center", gap: 2, backgroundColor: "#fff",
    borderRadius: 12, paddingVertical: 12, borderWidth: 1, borderColor: "#e2e8f0",
  },
  statValue: { fontSize: 18, fontWeight: "800", color: NAVY },
  statLabel: { fontSize: 10, color: "#718096", fontWeight: "600" },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: NAVY, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 },
  templateCard: {
    flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "#fff",
    borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 2, borderColor: "#e2e8f0",
  },
  templateCardActive: { borderColor: NAVY, backgroundColor: "#f0f4f8" },
  templateIcon: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: "#e8f0f8",
    alignItems: "center", justifyContent: "center",
  },
  templateIconActive: { backgroundColor: NAVY },
  templateInfo: { flex: 1 },
  templateLabel: { fontSize: 14, fontWeight: "700", color: NAVY },
  templateLabelActive: { color: NAVY },
  templateDesc: { fontSize: 11, color: "#718096", marginTop: 2 },
  exportBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: NAVY, borderRadius: 14, paddingVertical: 16, marginTop: 8,
  },
  exportBtnDisabled: { opacity: 0.45 },
  exportBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  exportHint: { textAlign: "center", fontSize: 12, color: "#718096", marginTop: 8 },
});
