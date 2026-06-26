/**
 * app/projectscontent.tsx
 *
 * IITA Project Detail screen — "Field Intelligence" aesthetic.
 * Matches the Projects list screen: light BG, green accents, editorial cards,
 * animated mount, WebView for rich description content.
 *
 * TypeScript + Expo Router.
 */

import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  SafeAreaView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import WebView from "react-native-webview";
import BackArrow from "../components/BackArrow";
import CustomHeader from "../components/CustomHeader";
import { Service } from "../utils/service";

// ─── Design tokens (matches projects.tsx) ────────────────────────────────────
const GREEN = "#2D7D46";
const GREEN_LT = "#E8F5ED";
const ORANGE = "#F26522";
const DARK = "#111A14";
const BODY = "#3D4A41";
const MUTED = "#8A9E90";
const BORDER = "#E2EBE5";
const BG = "#F4F7F5";
const WHITE = "#FFFFFF";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProjectMeta {
  "wpcf-project-description"?: string;
  "wpcf-project-status"?: string;
  "wpcf-project-donor"?: string;
  "wpcf-project-start-year"?: string;
  "wpcf-project-end-year"?: string;
  "wpcf-project-hub"?: string;
  "wpcf-project-crop"?: string;
  "wpcf-project-lead"?: string;
  "wpcf-project-budget"?: string;
  [key: string]: string | undefined;
}

interface ProjectData {
  id?: number;
  title?: { rendered: string };
  link?: string;
  "post-meta-fields"?: ProjectMeta;
  acf?: Record<string, string>;
  featured_image_url?: string;
}

// ─── WebView HTML wrapper ─────────────────────────────────────────────────────
// Injects the brand font + base styles so the WebView content feels native.
const buildHtml = (body: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
      font-size: 15px;
      line-height: 1.75;
      color: #3D4A41;
      background: #F4F7F5;
      padding: 0 4px 40px 4px;
      -webkit-text-size-adjust: none;
    }
    h1, h2, h3, h4 {
      color: #111A14;
      font-weight: 700;
      margin: 20px 0 10px;
      line-height: 1.35;
    }
    h1 { font-size: 20px; }
    h2 { font-size: 17px; border-left: 3px solid #2D7D46; padding-left: 10px; }
    h3 { font-size: 15px; }
    p  { margin-bottom: 14px; }
    a  { color: #2D7D46; text-decoration: none; font-weight: 600; }
    ul, ol { padding-left: 20px; margin-bottom: 14px; }
    li { margin-bottom: 6px; }
    strong { color: #111A14; font-weight: 700; }
    table {
      width: 100%; border-collapse: collapse; margin-bottom: 14px;
      font-size: 13px;
    }
    th { background: #E8F5ED; color: #2D7D46; padding: 8px; text-align: left; font-weight: 700; }
    td { padding: 8px; border-bottom: 1px solid #E2EBE5; color: #3D4A41; }
    img { max-width: 100%; height: auto; border-radius: 10px; margin: 10px 0; }
    blockquote {
      border-left: 3px solid #F26522;
      margin: 16px 0;
      padding: 10px 14px;
      background: #FFF5F0;
      border-radius: 0 8px 8px 0;
      color: #3D4A41;
      font-style: italic;
    }
    hr { border: none; border-top: 1px solid #E2EBE5; margin: 20px 0; }
  </style>
</head>
<body>${body}</body>
</html>`;

// ─── Meta info row ────────────────────────────────────────────────────────────
interface MetaRowProps {
  icon: string;
  label: string;
  value: string;
  accent?: boolean;
}

const MetaRow: React.FC<MetaRowProps> = ({ icon, label, value, accent }) => (
  <View style={styles.metaRow}>
    <View style={styles.metaIconWrap}>
      <Ionicons name={icon as any} size={14} color={GREEN} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.metaLabel}>{label.toUpperCase()}</Text>
      <Text
        style={[
          styles.metaValue,
          accent && { color: GREEN, fontWeight: "700" },
        ]}
      >
        {value}
      </Text>
    </View>
  </View>
);

// ─── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const isActive = status.toLowerCase().includes("active");
  return (
    <View
      style={[
        styles.statusBadge,
        isActive ? styles.statusActive : styles.statusInactive,
      ]}
    >
      <View
        style={[
          styles.statusDot,
          { backgroundColor: isActive ? GREEN : MUTED },
        ]}
      />
      <Text style={[styles.statusText, { color: isActive ? GREEN : MUTED }]}>
        {status.toUpperCase()}
      </Text>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
const ProjectsContent: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { id: itemId } = useLocalSearchParams<{
    id: string;
    otherParam?: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [webLoading, setWebLoading] = useState(false);
  const [dataSource, setDataSource] = useState<ProjectData>({});
  const [description, setDescription] = useState<string>("");

  // Stagger animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const metaAnim = useRef(new Animated.Value(0)).current;
  const bodyAnim = useRef(new Animated.Value(0)).current;

  const runAnims = () => {
    Animated.stagger(100, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 360,
        useNativeDriver: true,
      }),
      Animated.timing(metaAnim, {
        toValue: 1,
        duration: 360,
        useNativeDriver: true,
      }),
      Animated.timing(bodyAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (!itemId) return;
    setLoading(true);
    fetch(`${Service.projectContentUrl}${itemId}`)
      .then((r) => r.json())
      .then((json: ProjectData) => {
        setDataSource(json);
        setDescription(
          json["post-meta-fields"]?.["wpcf-project-description"] ?? ""
        );
        setLoading(false);
        runAnims();
      })
      .catch((err: Error) => {
        setLoading(false);
        Alert.alert(
          "Connection Error",
          "Please check your internet connection and try again.",
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => navigation.goBack(),
            },
            { text: "Retry", onPress: () => navigation.goBack() },
          ]
        );
        Vibration.vibrate();
      });
  }, [itemId]);

  const onShare = async () => {
    try {
      await Share.share({
        title: dataSource?.title?.rendered ?? "IITA Project",
        message: `${dataSource?.title?.rendered ?? ""}\n\n${
          dataSource?.link ?? ""
        }`,
        url: dataSource?.link ?? "",
      });
    } catch (err: any) {
      Alert.alert("Share failed", err.message);
    }
  };

  // ── Derived meta ────────────────────────────────────────────────────────────
  const meta = dataSource["post-meta-fields"] ?? {};
  const title = dataSource?.title?.rendered ?? "";
  const status = meta["wpcf-project-status"] ?? "";
  const donor = meta["wpcf-project-donor"] ?? "";
  const start = meta["wpcf-project-start-year"] ?? "";
  const end = meta["wpcf-project-end-year"] ?? "";
  const hub = meta["wpcf-project-hub"] ?? "";
  const crop = meta["wpcf-project-crop"] ?? "";
  const lead = meta["wpcf-project-lead"] ?? "";
  const budget = meta["wpcf-project-budget"] ?? "";

  const hasMeta = !!(status || donor || start || hub || crop || lead || budget);

  // ── Skeleton loader ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.root}>
        <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
        <SafeAreaView style={{ backgroundColor: WHITE }}>
          <CustomHeader
            LeftIcon={<BackArrow />}
            onPressL={() => navigation.goBack()}
            title="Projects"
          />
        </SafeAreaView>
        <View style={styles.skeletonWrap}>
          {[1, 0.7, 0.5].map((w, i) => (
            <View
              key={i}
              style={[
                styles.skeletonLine,
                { width: `${w * 100}%`, marginBottom: 12 },
              ]}
            />
          ))}
          <View style={[styles.skeletonBlock, { marginTop: 24 }]} />
          <View style={[styles.skeletonBlock, { marginTop: 10, height: 60 }]} />
          <View
            style={[styles.skeletonBlock, { marginTop: 10, height: 300 }]}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

      {/* Header */}
      <SafeAreaView style={{ backgroundColor: WHITE }}>
        <CustomHeader
          LeftIcon={<BackArrow />}
          onPressL={() => navigation.goBack()}
          title="Projects"
          RightIcon={
            <TouchableOpacity
              onPress={onShare}
              style={styles.shareBtn}
              activeOpacity={0.75}
            >
              <Ionicons name="share-outline" size={18} color={GREEN} />
            </TouchableOpacity>
          }
          onPressR={onShare}
        />
      </SafeAreaView>

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: BORDER }} />

      {/* Scrollable content */}
      <Animated.ScrollView
        style={{ flex: 1, backgroundColor: BG }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: insets.bottom + 48,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Title card ────────────────────────────────────────────────── */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.titleRow}>
            <View style={styles.titleIcon}>
              <Ionicons name="briefcase-outline" size={20} color={GREEN} />
            </View>
            <Text style={styles.sectionTag}>PROJECT</Text>
          </View>
          <Text style={styles.projectTitle}>{title}</Text>
          {status ? <StatusBadge status={status} /> : null}
        </Animated.View>

        {/* ── Meta card ─────────────────────────────────────────────────── */}
        {hasMeta ? (
          <Animated.View
            style={[
              styles.card,
              {
                opacity: metaAnim,
                transform: [
                  {
                    translateY: metaAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [16, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.titleRow}>
              <Text style={styles.sectionTag}>PROJECT DETAILS</Text>
            </View>

            {donor ? (
              <MetaRow
                icon="business-outline"
                label="Donor / Funder"
                value={donor}
              />
            ) : null}
            {start || end ? (
              <MetaRow
                icon="calendar-outline"
                label="Duration"
                value={start && end ? `${start} – ${end}` : start || end}
                accent
              />
            ) : null}
            {hub ? (
              <MetaRow icon="globe-outline" label="Region / Hub" value={hub} />
            ) : null}
            {crop ? (
              <MetaRow
                icon="leaf-outline"
                label="Mandate Crop"
                value={crop}
                accent
              />
            ) : null}
            {lead ? (
              <MetaRow
                icon="person-outline"
                label="Project Lead"
                value={lead}
              />
            ) : null}
            {budget ? (
              <MetaRow icon="cash-outline" label="Budget" value={budget} />
            ) : null}
          </Animated.View>
        ) : null}

        {/* ── Description card ──────────────────────────────────────────── */}
        {description ? (
          <Animated.View
            style={[
              styles.card,
              styles.descCard,
              {
                opacity: bodyAnim,
                transform: [
                  {
                    translateY: bodyAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [16, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.titleRow}>
              <Text style={styles.sectionTag}>DESCRIPTION</Text>
            </View>

            {/* Thin green accent line */}
            <View style={styles.descAccent} />

            <WebView
              source={{ html: buildHtml(description) }}
              style={styles.webView}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              onLoadStart={() => setWebLoading(true)}
              onLoadEnd={() => setWebLoading(false)}
              // Dynamically resize to content height
              injectedJavaScript={`
                const el = document.documentElement;
                window.ReactNativeWebView.postMessage(
                  JSON.stringify({ height: el.scrollHeight })
                );
                true;
              `}
              onMessage={(e) => {
                try {
                  const { height } = JSON.parse(e.nativeEvent.data);
                  // Height is handled via minHeight on the WebView
                } catch {}
              }}
            />
          </Animated.View>
        ) : (
          <View
            style={[styles.card, { alignItems: "center", paddingVertical: 40 }]}
          >
            <Ionicons name="document-outline" size={36} color={MUTED} />
            <Text style={[styles.sectionTag, { marginTop: 12, color: MUTED }]}>
              No description available
            </Text>
          </View>
        )}

        {/* ── Share CTA ─────────────────────────────────────────────────── */}
        {dataSource?.link ? (
          <Animated.View style={{ opacity: bodyAnim }}>
            <TouchableOpacity
              onPress={onShare}
              activeOpacity={0.8}
              style={styles.shareCard}
            >
              <Ionicons name="share-social-outline" size={20} color={GREEN} />
              <Text style={styles.shareCardText}>Share this project</Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={GREEN}
                style={{ marginLeft: "auto" }}
              />
            </TouchableOpacity>
          </Animated.View>
        ) : null}
      </Animated.ScrollView>
    </View>
  );
};

export default ProjectsContent;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: WHITE,
  },

  // ── Cards ────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  descCard: {
    padding: 18,
    paddingBottom: 0, // WebView handles its own bottom space
  },

  // ── Title card ───────────────────────────────────────────────────────────
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  titleIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: GREEN_LT,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTag: {
    fontSize: 10,
    fontWeight: "800",
    color: GREEN,
    letterSpacing: 1.2,
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: DARK,
    lineHeight: 28,
    marginBottom: 14,
  },

  // ── Status ───────────────────────────────────────────────────────────────
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    gap: 5,
    alignSelf: "flex-start",
  },
  statusActive: { backgroundColor: GREEN_LT },
  statusInactive: { backgroundColor: "#F0F0F0" },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // ── Meta rows ────────────────────────────────────────────────────────────
  metaRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderColor: BORDER,
    gap: 12,
  },
  metaIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: GREEN_LT,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: MUTED,
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: "600",
    color: BODY,
    lineHeight: 20,
  },

  // ── Description ───────────────────────────────────────────────────────────
  descAccent: {
    height: 3,
    width: 40,
    backgroundColor: GREEN,
    borderRadius: 2,
    marginBottom: 14,
  },
  webView: {
    minHeight: 400,
    backgroundColor: "transparent",
  },

  // ── Share card ────────────────────────────────────────────────────────────
  shareCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: GREEN_LT,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: GREEN + "40",
    marginTop: 4,
  },
  shareCardText: {
    fontSize: 14,
    fontWeight: "700",
    color: GREEN,
  },
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: GREEN_LT,
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Skeleton ──────────────────────────────────────────────────────────────
  skeletonWrap: {
    flex: 1,
    padding: 16,
    backgroundColor: BG,
  },
  skeletonLine: {
    height: 18,
    backgroundColor: BORDER,
    borderRadius: 8,
  },
  skeletonBlock: {
    height: 100,
    backgroundColor: WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
});
