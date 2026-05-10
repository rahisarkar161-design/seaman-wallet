import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { useApp } from "@/context/AppContext";

const NAVY = "#0A2342";
const GOLD = "#D4AF37";
const DG_URL = "https://dgshipping.gov.in";

export default function StatusScreen() {
  const { seamanProfile } = useApp();
  const webRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [canBack, setCanBack] = useState(false);
  const [canForward, setCanForward] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(DG_URL);

  const indos = seamanProfile?.indosNumber || "";
  const sid = seamanProfile?.sidNumber || "";

  if (Platform.OS === "web") {
    return (
      <View style={styles.webFallback}>
        <MaterialCommunityIcons name="monitor-off" size={54} color={NAVY} />
        <Text style={styles.wfTitle}>Mobile Only</Text>
        <Text style={styles.wfSub}>
          The Status Tracker uses an embedded browser which is only available on Android and iOS devices. Please use the Expo Go app to access this feature.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        {indos || sid ? (
          <View style={styles.credBadge}>
            <MaterialCommunityIcons name="account-check" size={14} color="#22543D" />
            <Text style={styles.credText}>
              {indos ? `INDOS: ${indos}` : ""}{indos && sid ? " · " : ""}{sid ? `SID: ${sid}` : ""}
            </Text>
          </View>
        ) : (
          <View style={[styles.credBadge, { backgroundColor: "#FED7D7" }]}>
            <MaterialCommunityIcons name="account-alert" size={14} color="#C53030" />
            <Text style={[styles.credText, { color: "#C53030" }]}>No credentials saved — update profile</Text>
          </View>
        )}
      </View>

      {/* WebView */}
      <WebView
        ref={webRef}
        source={{ uri: DG_URL }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={(state) => {
          setCanBack(state.canGoBack);
          setCanForward(state.canGoForward);
          setCurrentUrl(state.url);
        }}
        userAgent="Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={NAVY} />
            <Text style={styles.loadingText}>Opening DG Shipping portal...</Text>
          </View>
        )}
      />

      {loading && (
        <View style={styles.loadingBar}>
          <ActivityIndicator size="small" color={GOLD} />
        </View>
      )}

      {/* Browser controls */}
      <View style={styles.controls}>
        <Pressable
          style={[styles.ctrl, !canBack && styles.ctrlDisabled]}
          onPress={() => webRef.current?.goBack()}
          disabled={!canBack}
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color={canBack ? "#fff" : "rgba(255,255,255,0.3)"} />
        </Pressable>
        <Pressable
          style={[styles.ctrl, !canForward && styles.ctrlDisabled]}
          onPress={() => webRef.current?.goForward()}
          disabled={!canForward}
        >
          <MaterialCommunityIcons name="arrow-right" size={20} color={canForward ? "#fff" : "rgba(255,255,255,0.3)"} />
        </Pressable>
        <View style={styles.urlBar}>
          <MaterialCommunityIcons name="lock" size={12} color="rgba(255,255,255,0.5)" />
          <Text style={styles.urlText} numberOfLines={1}>
            {currentUrl.replace("https://", "").replace("http://", "")}
          </Text>
        </View>
        <Pressable style={styles.ctrl} onPress={() => webRef.current?.reload()}>
          <MaterialCommunityIcons name="refresh" size={20} color="#fff" />
        </Pressable>
        <Pressable style={styles.ctrl} onPress={() => webRef.current?.injectJavaScript(autoFillScript(indos, sid))}>
          <MaterialCommunityIcons name="form-textbox" size={20} color={GOLD} />
        </Pressable>
      </View>
    </View>
  );
}

function autoFillScript(indos: string, sid: string) {
  return `
    (function() {
      var inputs = document.querySelectorAll('input[type="text"], input[type="email"]');
      inputs.forEach(function(inp) {
        var name = (inp.name || inp.id || inp.placeholder || '').toLowerCase();
        if (name.includes('indos') && '${indos}') inp.value = '${indos}';
        if ((name.includes('sid') || name.includes('seaman')) && '${sid}') inp.value = '${sid}';
      });
      true;
    })();
  `;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: NAVY },
  topBar: {
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: NAVY, alignItems: "flex-start",
  },
  credBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#C6F6D5", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
  },
  credText: { fontSize: 11, fontWeight: "600", color: "#22543D" },
  webview: { flex: 1 },
  loadingOverlay: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  loadingText: { fontSize: 14, color: "#718096" },
  loadingBar: {
    position: "absolute", top: 54, right: 12,
  },
  controls: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: NAVY, paddingHorizontal: 10, paddingVertical: 8,
  },
  ctrl: {
    width: 36, height: 36, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center", justifyContent: "center",
  },
  ctrlDisabled: { opacity: 0.4 },
  urlBar: {
    flex: 1, flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8,
  },
  urlText: { flex: 1, fontSize: 11, color: "rgba(255,255,255,0.7)" },
  webFallback: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40, gap: 14 },
  wfTitle: { fontSize: 20, fontWeight: "800", color: NAVY },
  wfSub: { fontSize: 14, color: "#718096", textAlign: "center", lineHeight: 22 },
});
