import { useLanguage } from "@/context/LanguageContext";
import i18n from "@/i18n";
import { Ionicons } from "@expo/vector-icons";
import { File, Paths } from "expo-file-system";
import { Image } from "expo-image";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  fetchCropDigitalTools,
  fetchCropEvents,
  fetchCropNews,
  fetchCropPictures,
  fetchCropProjects,
  fetchCropPublications,
  fetchCropVideos,
  getItemImage,
} from "../utils/cropService";

// ─── Design System ────────────────────────────────────────────────────────────
const ORANGE = "#F26522";
const DARK = "#111418";
const CARD_BG = "#FFFFFF";
const SURFACE = "#F7F8FA";
const BORDER = "#ECEEF2";
const MUTED = "#8A919E";
const MUTED2 = "#B4BAC4";

const COLORS = {
  surface: SURFACE,
  border: BORDER,
  text: DARK,
  textMuted: MUTED,
  textDim: MUTED2,
  accent: ORANGE,
  white: "#FFFFFF",
};

// Typography scale
const T: any = {
  hero: { fontSize: 32, fontWeight: "800", letterSpacing: -0.8, color: "#fff" },
  h1: { fontSize: 20, fontWeight: "700", letterSpacing: -0.3, color: DARK },
  h2: { fontSize: 15, fontWeight: "700", letterSpacing: -0.2, color: DARK },
  body: { fontSize: 13, fontWeight: "400", lineHeight: 19, color: MUTED },
  caption: { fontSize: 11, fontWeight: "500", color: MUTED2 },
  label: { fontSize: 10, fontWeight: "700", letterSpacing: 0.6 },
};

type IconName = React.ComponentProps<typeof Ionicons>["name"];
type TabItem = { icon: IconName; key: string; labelKey: string };

// ─── Tab definitions ──────────────────────────────────────────────────────────
// labelKey maps to existing top-level keys in translations where possible
const TABS: TabItem[] = [
  { key: "news", labelKey: "news", icon: "newspaper-outline" },
  { key: "publications", labelKey: "publications", icon: "book-outline" },
  { key: "digitaltools", labelKey: "digitalTools", icon: "construct-outline" },
  { key: "events", labelKey: "events", icon: "calendar-outline" },
  { key: "projects", labelKey: "projects", icon: "briefcase-outline" },
  { key: "videos", labelKey: "videos", icon: "videocam-outline" },
  { key: "pictures", labelKey: "pictures", icon: "images-outline" },
];

// Quick-nav items shown in the hero strip
const HERO_NAV: { key: string; labelKey: string; icon: IconName }[] = [
  { key: "news", labelKey: "news", icon: "newspaper-outline" },
  { key: "publications", labelKey: "publications", icon: "book-outline" },
  { key: "projects", labelKey: "projects", icon: "briefcase-outline" },
  { key: "videos", labelKey: "videos", icon: "videocam-outline" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const safeUri = (raw: any) => {
  if (!raw || typeof raw !== "string") return null;
  return raw.startsWith("http://") ? raw.replace("http://", "https://") : raw;
};

const stripHtml = (html = "") =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim();

const lightenHex = (hex: any, amount = 0.88) => {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.round(((num >> 16) & 0xff) * (1 - amount) + 255 * amount);
  const g = Math.round(((num >> 8) & 0xff) * (1 - amount) + 255 * amount);
  const b = Math.round((num & 0xff) * (1 - amount) + 255 * amount);
  return `rgb(${r},${g},${b})`;
};

// ─── Ripple wrapper ───────────────────────────────────────────────────────────
const Pressable = ({
  onPress,
  style,
  children,
  rippleColor = "rgba(0,0,0,0.06)",
}: any) => {
  if (Platform.OS === "android") {
    return (
      <TouchableNativeFeedback
        onPress={onPress}
        background={TouchableNativeFeedback.Ripple(rippleColor, false)}
      >
        <View style={style}>{children}</View>
      </TouchableNativeFeedback>
    );
  }
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={style}>
      {children}
    </TouchableOpacity>
  );
};

// ─── Pill badge ───────────────────────────────────────────────────────────────
const Pill = ({ label, color = ORANGE, bg }: any) => (
  <View
    style={{
      backgroundColor: bg || lightenHex(color, 0.85),
      borderRadius: 100,
      paddingHorizontal: 8,
      paddingVertical: 3,
      alignSelf: "flex-start",
    }}
  >
    <Text style={[T.label, { color }]}>{label.toUpperCase()}</Text>
  </View>
);

// ─── Image with fade-in ───────────────────────────────────────────────────────
const FadeImage = ({ uri, style, resizeMode = "cover" }: any) => {
  const anim = useRef(new Animated.Value(0)).current;
  return (
    <Animated.Image
      source={{ uri }}
      style={[style, { opacity: anim }]}
      resizeMode={resizeMode}
      onLoad={() =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }).start()
      }
    />
  );
};

// ─── No-image placeholder ─────────────────────────────────────────────────────
const ImgPlaceholder = ({
  size,
  icon = "image-outline",
  cropBg = "#eee",
}: any) => (
  <View
    style={{
      width: size,
      height: size,
      backgroundColor: lightenHex(cropBg, 0.9),
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Ionicons name={icon} size={size * 0.35} color={cropBg} />
  </View>
);

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ label, loading, cropBg }: any) => {
  const { language } = useLanguage();
  if (loading) return null;
  return (
    <View
      style={{
        alignItems: "center",
        paddingVertical: 64,
        paddingHorizontal: 32,
      }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: lightenHex(cropBg, 0.88),
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Ionicons name="leaf-outline" size={32} color={cropBg} />
      </View>
      <Text style={[T.h2, { textAlign: "center", marginBottom: 6 }]}>
        {language && i18n.t("cropDetail.nothingHere")}
      </Text>
      <Text style={[T.body, { textAlign: "center" }]}>
        {language && i18n.t("cropDetail.noContent", { label })}
      </Text>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// CARD COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── News card ────────────────────────────────────────────────────────────────
const NewsCard = ({ item, onPress, cropBg, index }: any) => {
  const { language } = useLanguage();
  const img = safeUri(getItemImage(item));
  const title = item?.title?.rendered
    ? stripHtml(item.title.rendered)
    : "Untitled";
  const excerpt = item?.excerpt?.rendered
    ? stripHtml(item.excerpt.rendered)
    : "";
  const date = item?.date ? moment(item.date).format("D MMM YYYY") : "";
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 320,
      delay: Math.min(index * 60, 300),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        marginHorizontal: 16,
        opacity: anim,
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [16, 0],
            }),
          },
        ],
      }}
    >
      <Pressable onPress={onPress}>
        <View
          style={{
            flexDirection: "row",
            marginBottom: 12,
            backgroundColor: CARD_BG,
            borderRadius: 16,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: BORDER,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}
        >
          <View style={{ width: 4, backgroundColor: cropBg }} />
          <View style={{ width: 96, height: 96, overflow: "hidden" }}>
            {img ? (
              <FadeImage uri={img} style={{ width: 96, height: 96 }} />
            ) : (
              <ImgPlaceholder
                size={96}
                icon="newspaper-outline"
                cropBg={cropBg}
              />
            )}
          </View>
          <View
            style={{ flex: 1, padding: 12, justifyContent: "space-between" }}
          >
            <Text style={T.h2} numberOfLines={3}>
              {title}
            </Text>
            {excerpt ? (
              <Text style={[T.body, { marginTop: 4 }]} numberOfLines={2}>
                {excerpt}
              </Text>
            ) : null}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 8,
                gap: 6,
              }}
            >
              <Pill label={language && i18n.t("news")} color={cropBg} />
              {date ? <Text style={T.caption}>{date}</Text> : null}
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// ─── Publication card ─────────────────────────────────────────────────────────
const PublicationCard = ({ item, onPress, cropBg, index }: any) => {
  const { language } = useLanguage();
  const img =
    item["toolset-meta"]?.["iita-documents"]?.thumbnail?.raw ||
    "https://iita.org/wp-content/uploads/2016/06/IITA-default.jpg";
  const title = item?.title?.rendered
    ? stripHtml(item.title.rendered)
    : item?.title || "Untitled";
  const author =
    item["toolset-meta"]?.["iita-documents"]?.["document-authors"]?.raw || "";
  const year =
    item["toolset-meta"]?.["iita-documents"]?.["publication-year"]?.raw ||
    (item?.date ? moment(item.date).format("YYYY") : "");
  const type =
    item?.pure_taxonomies?.["publication-type"]?.[0]?.name ||
    (language && i18n.t("publications"));
  const downloadUrl =
    item["toolset-meta"]?.["iita-documents"]?.["document-upload"]?.raw ||
    item?.link;
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 320,
      delay: Math.min(index * 60, 300),
      useNativeDriver: true,
    }).start();
  }, []);

  const handleDownload = async () => {
    if (!downloadUrl) return;
    try {
      const fileName = downloadUrl.split("/").pop() || "document.pdf";
      const file = new File(Paths.document, fileName);
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const buffer = await blob.arrayBuffer();
      file.create({ overwrite: true });
      file.write(new Uint8Array(buffer));
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri);
      } else {
        Alert.alert(
          language && i18n.t("cropDetail.downloaded"),
          language && i18n.t("cropDetail.fileSaved", { path: file.uri })
        );
      }
    } catch (error) {
      console.log("Download error:", error);
      Alert.alert(
        language && i18n.t("cropDetail.downloadErrorTitle"),
        language && i18n.t("cropDetail.downloadError")
      );
    }
  };

  return (
    <Animated.View
      style={{
        marginHorizontal: 16,
        opacity: anim,
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [16, 0],
            }),
          },
        ],
      }}
    >
      <Pressable onPress={onPress}>
        <View
          style={{
            flexDirection: "row",
            marginBottom: 12,
            backgroundColor: CARD_BG,
            borderRadius: 16,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: BORDER,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}
        >
          <View
            style={{ width: 76, backgroundColor: lightenHex(cropBg, 0.85) }}
          >
            {img ? (
              <FadeImage uri={img} style={{ width: 76, height: 110 }} />
            ) : (
              <View
                style={{
                  width: 76,
                  height: 110,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name="document-text-outline"
                  size={28}
                  color={cropBg}
                />
              </View>
            )}
          </View>
          <View
            style={{ flex: 1, padding: 12, justifyContent: "space-between" }}
          >
            <View>
              <Pill label={type} color={cropBg} />
              <Text style={[T.h2, { marginTop: 8 }]} numberOfLines={3}>
                {title}
              </Text>
            </View>
            <View>
              {author ? (
                <Text style={T.caption} numberOfLines={1}>
                  {author}
                </Text>
              ) : null}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 6,
                }}
              >
                {year ? (
                  <Text style={[T.label, { color: cropBg }]}>{year}</Text>
                ) : (
                  <View />
                )}
                {downloadUrl ? (
                  <TouchableOpacity
                    onPress={handleDownload}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: lightenHex(cropBg, 0.88),
                      borderRadius: 100,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      gap: 4,
                    }}
                  >
                    <Ionicons
                      name="download-outline"
                      size={12}
                      color={cropBg}
                    />
                    <Text style={[T.label, { color: cropBg }]}>
                      {language && i18n.t("cropDetail.pdf")}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// ─── Digital Tool card ────────────────────────────────────────────────────────
const DigitalToolCard = ({ item, onPress, cropBg, index }: any) => {
  const { language } = useLanguage();
  const img = safeUri(getItemImage(item));
  const title = item?.title?.rendered
    ? stripHtml(item.title.rendered)
    : item?.name || "Untitled";
  const excerpt = item?.excerpt?.rendered
    ? stripHtml(item.excerpt.rendered)
    : item?.acf?.description || "";
  const toolUrl = item?.acf?.tool_url || item?.acf?.app_url || item?.link;
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 320,
      delay: Math.min(index * 60, 300),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        marginHorizontal: 16,
        opacity: anim,
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [16, 0],
            }),
          },
        ],
      }}
    >
      <Pressable onPress={onPress}>
        <View
          style={{
            marginBottom: 12,
            backgroundColor: CARD_BG,
            borderRadius: 16,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: BORDER,
            padding: 14,
            flexDirection: "row",
            alignItems: "center",
            shadowColor: "#000",
            shadowOpacity: 0.04,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              backgroundColor: lightenHex(cropBg, 0.85),
              justifyContent: "center",
              alignItems: "center",
              marginRight: 14,
              overflow: "hidden",
            }}
          >
            {img ? (
              <FadeImage uri={img} style={{ width: 56, height: 56 }} />
            ) : (
              <Ionicons name="construct-outline" size={26} color={cropBg} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={T.h2} numberOfLines={2}>
              {title}
            </Text>
            {excerpt ? (
              <Text style={[T.body, { marginTop: 3 }]} numberOfLines={2}>
                {excerpt}
              </Text>
            ) : null}
            {toolUrl ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 6,
                  gap: 4,
                }}
              >
                <Ionicons name="open-outline" size={11} color={cropBg} />
                <Text style={[T.label, { color: cropBg }]}>
                  {language && i18n.t("cropDetail.openTool")}
                </Text>
              </View>
            ) : null}
          </View>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 100,
              backgroundColor: lightenHex(cropBg, 0.88),
              justifyContent: "center",
              alignItems: "center",
              marginLeft: 8,
            }}
          >
            <Ionicons name="chevron-forward" size={16} color={cropBg} />
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// ─── Event card ───────────────────────────────────────────────────────────────
const EventCard = ({ item, onPress, cropBg, index }: any) => {
  const img = safeUri(getItemImage(item));
  const title = item?.title?.rendered
    ? stripHtml(item.title.rendered)
    : "Untitled";
  const excerpt = item?.excerpt?.rendered
    ? stripHtml(item.excerpt.rendered)
    : "";
  const startDate =
    item?.acf?.start_date || item?.acf?.event_start || item?.date;
  const endDate = item?.acf?.end_date || item?.acf?.event_end;
  const location = item?.acf?.location || item?.acf?.venue || "";
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 340,
      delay: Math.min(index * 70, 350),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        marginHorizontal: 16,
        opacity: anim,
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          },
        ],
      }}
    >
      <Pressable onPress={onPress}>
        <View
          style={{
            marginBottom: 16,
            backgroundColor: CARD_BG,
            borderRadius: 20,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: BORDER,
            shadowColor: "#000",
            shadowOpacity: 0.07,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 3,
          }}
        >
          <View style={{ position: "relative", height: 180 }}>
            {img ? (
              <FadeImage uri={img} style={{ width: "100%", height: 180 }} />
            ) : (
              <View
                style={{
                  width: "100%",
                  height: 180,
                  backgroundColor: lightenHex(cropBg, 0.88),
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="calendar-outline" size={48} color={cropBg} />
              </View>
            )}
            <View
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 80,
                backgroundColor: "rgba(0,0,0,0.45)",
              }}
            />
            {startDate ? (
              <View
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  backgroundColor: cropBg,
                  borderRadius: 12,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 18,
                    fontWeight: "800",
                    lineHeight: 20,
                  }}
                >
                  {moment(startDate).format("D")}
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.9)",
                    fontSize: 10,
                    fontWeight: "600",
                  }}
                >
                  {moment(startDate).format("MMM").toUpperCase()}
                </Text>
              </View>
            ) : null}
          </View>
          <View style={{ padding: 14 }}>
            <Text style={T.h2} numberOfLines={2}>
              {title}
            </Text>
            {excerpt ? (
              <Text style={[T.body, { marginTop: 4 }]} numberOfLines={2}>
                {excerpt}
              </Text>
            ) : null}
            <View style={{ flexDirection: "row", marginTop: 10, gap: 16 }}>
              {startDate ? (
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
                >
                  <Ionicons name="time-outline" size={13} color={cropBg} />
                  <Text style={T.caption}>
                    {moment(startDate).format("MMM D, YYYY")}
                    {endDate ? ` – ${moment(endDate).format("MMM D")}` : ""}
                  </Text>
                </View>
              ) : null}
              {location ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                    flex: 1,
                  }}
                >
                  <Ionicons name="location-outline" size={13} color={cropBg} />
                  <Text style={T.caption} numberOfLines={1}>
                    {location}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// ─── Project card ─────────────────────────────────────────────────────────────
const ProjectCard = ({ item, onPress, cropBg, index }: any) => {
  const img = safeUri(getItemImage(item));
  const title = item?.title?.rendered
    ? stripHtml(item.title.rendered)
    : "Untitled";
  const excerpt = item?.excerpt?.rendered
    ? stripHtml(item.excerpt.rendered)
    : item?.acf?.short_description || "";
  const status = item?.acf?.status || item?.acf?.project_status || "";
  const funder = item?.acf?.funder || item?.acf?.donor || "";
  const startYr = item?.acf?.start_year || item?.acf?.start_date || "";
  const endYr = item?.acf?.end_year || item?.acf?.end_date || "";
  const isActive = status.toLowerCase().includes("active");
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 320,
      delay: Math.min(index * 60, 300),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        marginHorizontal: 16,
        opacity: anim,
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [16, 0],
            }),
          },
        ],
      }}
    >
      <Pressable onPress={onPress}>
        <View
          style={{
            marginBottom: 12,
            backgroundColor: CARD_BG,
            borderRadius: 16,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: BORDER,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 2,
          }}
        >
          {img ? (
            <View style={{ height: 140 }}>
              <FadeImage uri={img} style={{ width: "100%", height: 140 }} />
            </View>
          ) : (
            <View
              style={{
                height: 70,
                backgroundColor: lightenHex(cropBg, 0.92),
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="briefcase-outline" size={28} color={cropBg} />
            </View>
          )}
          <View style={{ padding: 14 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              {status ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    backgroundColor: isActive ? "#E8F5E9" : SURFACE,
                    borderRadius: 100,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                  }}
                >
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: isActive ? "#43A047" : MUTED2,
                    }}
                  />
                  <Text
                    style={[T.label, { color: isActive ? "#2E7D32" : MUTED }]}
                  >
                    {status.toUpperCase()}
                  </Text>
                </View>
              ) : null}
              {funder ? (
                <Text style={T.caption} numberOfLines={1}>
                  {funder}
                </Text>
              ) : null}
            </View>
            <Text style={T.h2} numberOfLines={2}>
              {title}
            </Text>
            {excerpt ? (
              <Text style={[T.body, { marginTop: 4 }]} numberOfLines={2}>
                {excerpt}
              </Text>
            ) : null}
            {startYr ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  marginTop: 10,
                }}
              >
                <Ionicons name="calendar-outline" size={12} color={cropBg} />
                <Text style={[T.caption, { color: cropBg }]}>
                  {startYr}
                  {endYr ? ` – ${endYr}` : ""}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// ─── Video card ───────────────────────────────────────────────────────────────
const VideoCard = ({ item, onPress, cropBg, index }: any) => {
  const { language } = useLanguage();
  const thumb =
    item?.snippet?.thumbnails?.medium?.url ||
    item?.snippet?.thumbnails?.default?.url;
  const title = item?.snippet?.title || "Untitled";
  const date = item?.snippet?.publishedAt
    ? moment(item.snippet.publishedAt).format("D MMM YYYY")
    : "";
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 340,
      delay: Math.min(index * 70, 350),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        marginHorizontal: 16,
        opacity: anim,
        transform: [
          {
            scale: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.96, 1],
            }),
          },
        ],
      }}
    >
      <Pressable onPress={onPress}>
        <View
          style={{
            marginBottom: 16,
            backgroundColor: DARK,
            borderRadius: 20,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOpacity: 0.18,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 6 },
            elevation: 6,
          }}
        >
          <View style={{ position: "relative" }}>
            {thumb ? (
              <FadeImage uri={thumb} style={{ width: "100%", height: 200 }} />
            ) : (
              <View
                style={{
                  width: "100%",
                  height: 200,
                  backgroundColor: "#1A1E24",
                }}
              />
            )}
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.25)",
              }}
            />
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 29,
                  backgroundColor: cropBg,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name="play"
                  color="#fff"
                  size={26}
                  style={{ marginLeft: 3 }}
                />
              </View>
            </View>
            <View
              style={{
                position: "absolute",
                bottom: 10,
                right: 12,
                backgroundColor: "rgba(0,0,0,0.7)",
                borderRadius: 6,
                paddingHorizontal: 6,
                paddingVertical: 2,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "600" }}>
                {language && i18n.t("cropDetail.youtube")}
              </Text>
            </View>
          </View>
          <View style={{ padding: 14, backgroundColor: CARD_BG }}>
            <Text style={T.h2} numberOfLines={2}>
              {title}
            </Text>
            {date ? (
              <Text style={[T.caption, { marginTop: 4 }]}>{date}</Text>
            ) : null}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// ─── Album / Picture card ─────────────────────────────────────────────────────
const AlbumCard = ({ item, index }: any) => {
  const { language } = useLanguage();
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      delay: Math.min(index * 35, 380),
      useNativeDriver: true,
    }).start();
  }, []);

  const onPressIn = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 40,
    }).start();
  const onPressOut = () =>
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
    }).start();

  const rawUrl =
    item?.primary_photo_extras?.url_m ||
    item?.url_m ||
    safeUri(
      item?.source_url ||
        item?.media_details?.sizes?.thumbnail?.source_url ||
        getItemImage(item)
    );

  const imageUri = rawUrl
    ? encodeURI(
        rawUrl.startsWith("http://")
          ? rawUrl.replace("http://", "https://")
          : rawUrl
      )
    : "https://iita.org/wp-content/uploads/2016/06/IITA-default.jpg";

  const albumTitle =
    item?.title?._content ||
    (item?.title?.rendered ? stripHtml(item.title.rendered) : null) ||
    item?.title ||
    "Untitled";

  const photoCount =
    item?.count_photos ?? item?.media_details?.sizes
      ? Object.keys(item?.media_details?.sizes ?? {}).length
      : null;

  const photoLabel =
    photoCount === 1
      ? language && i18n.t("cropDetail.photo")
      : language && i18n.t("cropDetail.photos");

  const handleAlbumPress = (item: any) => {
    router.push({
      pathname: "/photos",
      params: { id: item.id, title: albumTitle },
    });
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
        marginBottom: 10,
        marginHorizontal: 16,
      }}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => handleAlbumPress(item)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={styles.card}
      >
        <View style={styles.thumbnailWrap}>
          <Image
            source={{ uri: imageUri }}
            style={styles.thumbnail}
            contentFit="cover"
          />
          <View style={styles.thumbnailGradient} />
          {photoCount !== null && (
            <View style={styles.countBadge}>
              <Ionicons name="images-outline" size={11} color={COLORS.white} />
              <Text style={styles.countBadgeText}>{photoCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
            {albumTitle}
          </Text>
          {photoCount !== null && (
            <View style={styles.cardMeta}>
              <View style={styles.cardMetaDot} />
              <Text style={styles.cardMetaText}>
                {photoCount} {photoLabel}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardArrow}>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textDim} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// DATA HOOK
// ═══════════════════════════════════════════════════════════════════════════════
const fetcherMap: any = {
  news: fetchCropNews,
  publications: fetchCropPublications,
  digitaltools: fetchCropDigitalTools,
  events: fetchCropEvents,
  projects: fetchCropProjects,
  pictures: fetchCropPictures,
};

const useCropTab = (cropKey: any, tabKey: any) => {
  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const nextVideoToken = useRef<any>(null);
  const loadingRef = useRef(false);

  const load = useCallback(
    async (reset = false) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      try {
        let result: any = [];
        if (tabKey === "videos") {
          const token = reset ? "" : nextVideoToken.current || "";
          const res = await fetchCropVideos(cropKey, token);
          result = res.items;
          nextVideoToken.current = res.nextPageToken;
          if (!res.nextPageToken) setHasMore(false);
        } else {
          const fetcher = fetcherMap[tabKey];
          if (!fetcher) return;
          const pg = reset ? 1 : page;
          result = await fetcher(cropKey, pg);
          if (result.length < 10) setHasMore(false);
          setPage(pg + 1);
        }
        if (reset) {
          setData(result);
          setHasMore(true);
          nextVideoToken.current = null;
        } else {
          setData((prev: any) => {
            const ids = new Set(prev.map((i: any) => i.id));
            return [...prev, ...result.filter((i: any) => !ids.has(i.id))];
          });
        }
      } catch (err: any) {
        setError(err.message || "Failed to load");
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [cropKey, tabKey, page]
  );

  useEffect(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    nextVideoToken.current = null;
    const t = setTimeout(() => load(true), 60);
    return () => clearTimeout(t);
  }, [cropKey, tabKey]);

  return {
    data,
    loading,
    hasMore,
    error,
    loadMore: () => {
      if (hasMore && !loadingRef.current) load(false);
    },
    refresh: () => load(true),
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
const CropDetailScreen = () => {
  const { language } = useLanguage();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const cropKey = params?.cropKey || "cassava";
  const cropLabel = params?.cropLabel || "Cassava";
  const cropEmoji = params?.cropEmoji || "🌿";
  const cropBg: any = params?.cropBg || "#4CAF50";

  const [activeTab, setActiveTab] = useState("news");
  const scrollY = useRef(new Animated.Value(0)).current;
  const tabScrollRef = useRef(null);

  const { data, loading, hasMore, error, loadMore, refresh } = useCropTab(
    cropKey,
    activeTab
  );

  const heroOpacity = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });
  const heroScale = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [1, 0.92],
    extrapolate: "clamp",
  });

  const handleItemPress = (item: any) => {
    switch (activeTab) {
      case "news":
        router.push({
          pathname: "/newscontent",
          params: {
            id: String(item?.id ?? ""),
            otherParam: item?.title?.rendered ?? "",
            sourceUrl: item?.link ?? "",
          },
        });
        break;
      case "publications":
        Linking.openURL(
          item?.acf?.document_url || item?.acf?.pdf_url || item?.link
        );
        break;
      case "digitaltools":
        if (item?.acf?.tool_url || item?.acf?.app_url)
          Linking.openURL(item.acf.tool_url || item.acf.app_url);
        else
          router.push({
            pathname: "/inappbrowser",
            params: { url: item?.link ?? "" },
          });
        break;
      case "events":
      case "projects":
        router.push({
          pathname: "/inappbrowser",
          params: { url: item?.link ?? "" },
        });
        break;
      case "videos": {
        const videoId = item?.id?.videoId || item?.snippet?.resourceId?.videoId;
        router.push({
          pathname: "/videoplay",
          params: { videoId: videoId ?? "", title: item?.snippet?.title ?? "" },
        });
        break;
      }
      case "pictures":
        router.push({
          pathname: "/photoviewer",
          params: {
            uri: safeUri(item?.source_url || getItemImage(item)) ?? "",
            title:
              stripHtml(item?.title?.rendered || item?.title?._content || "") ??
              "",
          },
        });
        break;
      default:
        if (item?.link) Linking.openURL(item.link);
    }
  };

  const renderItem = ({ item, index }: any) => {
    const props = { item, onPress: () => handleItemPress(item), cropBg, index };
    switch (activeTab) {
      case "news":
        return <NewsCard {...props} />;
      case "publications":
        return <PublicationCard {...props} />;
      case "digitaltools":
        return <DigitalToolCard {...props} />;
      case "events":
        return <EventCard {...props} />;
      case "projects":
        return <ProjectCard {...props} />;
      case "videos":
        return <VideoCard {...props} />;
      case "pictures":
        return <AlbumCard item={item} index={index} />;
      default:
        return null;
    }
  };

  // ── Hero section ──────────────────────────────────────────────────────────
  const HeroSection = () => (
    <View
      style={{
        backgroundColor: cropBg,
        paddingTop: insets.top + 20,
        paddingBottom: 0,
      }}
    >
      <StatusBar barStyle="light-content" backgroundColor={cropBg} />
      {/* Decorative circles */}
      <View
        style={{
          position: "absolute",
          top: -30,
          right: -40,
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: "rgba(255,255,255,0.08)",
        }}
      />
      <View
        style={{
          position: "absolute",
          top: 40,
          right: 30,
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: "rgba(255,255,255,0.06)",
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: 20,
          left: -20,
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: "rgba(0,0,0,0.06)",
        }}
      />

      <Animated.View
        style={{
          alignItems: "center",
          paddingBottom: 28,
          opacity: heroOpacity,
          transform: [{ scale: heroScale }],
        }}
      >
        <View
          style={{
            width: 88,
            height: 88,
            borderRadius: 44,
            backgroundColor: "rgba(255,255,255,0.18)",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <Text style={{ fontSize: 52, lineHeight: 60 }}>{cropEmoji}</Text>
        </View>
        <Text
          style={[
            T.hero,
            {
              fontSize: 30,
              textAlign: "center",
              marginBottom: 6,
              textShadowColor: "rgba(0,0,0,0.15)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 4,
            },
          ]}
        >
          {language && i18n.t(cropLabel)}
        </Text>
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.22)",
            borderRadius: 100,
            paddingHorizontal: 14,
            paddingVertical: 5,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 1,
            }}
          >
            {language && i18n.t("cropDetail.mandateCropBadge")}
          </Text>
        </View>
      </Animated.View>

      {/* Quick-nav strip */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "rgba(0,0,0,0.12)",
          paddingVertical: 12,
        }}
      >
        {HERO_NAV.map((item, i) => (
          <TouchableOpacity
            key={item.key}
            style={{
              flex: 1,
              alignItems: "center",
              borderRightWidth: i < HERO_NAV.length - 1 ? 1 : 0,
              borderColor: "rgba(255,255,255,0.15)",
            }}
            onPress={() => setActiveTab(item.key)}
          >
            <Ionicons
              name={item.icon}
              size={18}
              color="rgba(255,255,255,0.9)"
            />
            <Text
              style={{
                color: "rgba(255,255,255,0.75)",
                fontSize: 10,
                fontWeight: "600",
                marginTop: 3,
              }}
            >
              {language && i18n.t(item.labelKey)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // ── Tab strip ─────────────────────────────────────────────────────────────
  const TabStrip = () => (
    <View
      style={{
        backgroundColor: CARD_BG,
        borderBottomWidth: 1,
        borderColor: BORDER,
      }}
    >
      <ScrollView
        ref={tabScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingVertical: 10,
          gap: 6,
        }}
      >
        {TABS.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 100,
                backgroundColor: active ? cropBg : SURFACE,
                gap: 5,
              }}
            >
              <Ionicons
                name={tab.icon}
                size={13}
                color={active ? "#fff" : MUTED}
              />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: active ? "#fff" : MUTED,
                  letterSpacing: 0.1,
                }}
              >
                {language && i18n.t(tab.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  // ── Section heading ───────────────────────────────────────────────────────
  const SectionHeading = () => (
    <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12 }}>
      <Text style={T.h1}>
        {language &&
          i18n.t(TABS.find((t) => t.key === activeTab)?.labelKey ?? "")}
      </Text>
      <Text style={[T.caption, { marginTop: 2 }]}>
        {language &&
          i18n.t("cropDetail.researchResources", { crop: cropLabel as string })}
      </Text>
    </View>
  );

  const ListHeaderComponent = useCallback(
    () => (
      <View>
        <HeroSection />
        <TabStrip />
        <SectionHeading />
      </View>
    ),
    [activeTab, cropBg, cropLabel, cropEmoji, language]
  );

  const ListEmptyComponent = () => (
    <View>
      {error ? (
        <View
          style={{
            margin: 16,
            padding: 16,
            backgroundColor: "#FFF5F5",
            borderRadius: 14,
            borderLeftWidth: 4,
            borderColor: "#E53E3E",
          }}
        >
          <Text style={{ color: "#C53030", fontSize: 13, fontWeight: "600" }}>
            ⚠️ {error}
          </Text>
          <TouchableOpacity
            onPress={refresh}
            style={{
              marginTop: 8,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Ionicons name="refresh-outline" size={14} color={cropBg} />
            <Text style={{ color: cropBg, fontWeight: "700", fontSize: 13 }}>
              {language && i18n.t("cropDetail.tryAgain")}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
      <EmptyState
        label={
          language &&
          i18n.t(TABS.find((t) => t.key === activeTab)?.labelKey ?? "")
        }
        loading={loading}
        cropBg={cropBg}
      />
    </View>
  );

  const ListFooterComponent = () =>
    loading ? (
      <View style={{ paddingVertical: 28, alignItems: "center" }}>
        <ActivityIndicator size="small" color={cropBg} />
        <Text style={[T.caption, { marginTop: 8 }]}>
          {language && i18n.t("cropDetail.loading")}
        </Text>
      </View>
    ) : hasMore && data.length > 0 ? (
      <TouchableOpacity
        onPress={loadMore}
        activeOpacity={0.75}
        style={{
          marginHorizontal: 16,
          marginVertical: 16,
          paddingVertical: 14,
          borderRadius: 14,
          borderWidth: 2,
          borderColor: cropBg,
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <Ionicons name="arrow-down-circle-outline" size={18} color={cropBg} />
        <Text style={{ color: cropBg, fontWeight: "700", fontSize: 14 }}>
          {language && i18n.t("cropDetail.loadMore")}
        </Text>
      </TouchableOpacity>
    ) : (
      <View style={{ height: 32 }} />
    );

  return (
    <View style={{ flex: 1, backgroundColor: CARD_BG }}>
      {/* Floating back button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          position: "absolute",
          top: insets.top + 12,
          left: 16,
          zIndex: 99,
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: "rgba(0,0,0,0.28)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons name="arrow-back" size={20} color="#fff" />
      </TouchableOpacity>

      <Animated.FlatList
        key={`${cropKey}-${activeTab}`}
        data={data}
        keyExtractor={(item, index) =>
          (item?.id || item?.id?.videoId || index).toString()
        }
        renderItem={renderItem}
        numColumns={1}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        ListFooterComponent={ListFooterComponent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.6}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={loading && data.length === 0}
            onRefresh={refresh}
            tintColor={cropBg}
            colors={[cropBg]}
          />
        }
      />
    </View>
  );
};

export default CropDetailScreen;

// ─── Styles (for AlbumCard) ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  thumbnailWrap: { width: 90, height: 82, position: "relative" },
  thumbnail: { width: "100%", height: "100%" },
  thumbnailGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.14)",
  },
  countBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  countBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: "700" },
  cardInfo: { flex: 1, paddingHorizontal: 14, paddingVertical: 12 },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    gap: 6,
  },
  cardMetaDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
  },
  cardMetaText: { fontSize: 12, color: COLORS.textMuted, fontWeight: "500" },
  cardArrow: { paddingRight: 14 },
});
