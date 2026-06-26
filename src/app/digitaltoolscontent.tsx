import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Linking,
  ListRenderItemInfo,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DigitalToolsMeta {
  "digital-thumbnail"?: { raw?: string };
  "download-link"?: { raw?: string };
}

interface ToolItem {
  id: number;
  link: string;
  title: { rendered: string };
  content: { rendered: string };
  "toolset-meta": { "digital-tools": DigitalToolsMeta };
  pure_taxonomies: { "digital-tools-category": Array<{ name: string }> };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const COLORS = {
  bg: "#FFFFFF",
  surface: "#F8F9FA",
  surfaceElevated: "#FFFFFF",
  border: "#E5E5EA",
  accent: "#FF6B2B",
  accentMuted: "rgba(255,107,43,0.08)",
  accentBorder: "rgba(255,107,43,0.25)",
  textPrimary: "#1C1C1E",
  textSecondary: "#555555",
  textMuted: "#8E8E93",
  white: "#FFFFFF",
};

const PALETTE = [
  "#FF6B6B",
  "#FF9F1C",
  "#6BCB77",
  "#4D96FF",
  "#9D4EDD",
  "#FF922B",
  "#38A3A5",
  "#F15BB5",
  "#00BBF9",
  "#FF66D8",
  "#8338EC",
  "#FFB703",
  "#06D6A0",
  "#EF476F",
  "#118AB2",
];

function getAvatarColor(name: string): string {
  const idx =
    (name.charCodeAt(0) + name.charCodeAt(name.length - 1)) % PALETTE.length;
  return PALETTE[idx];
}

function getSafeImageUri(raw?: string): string | null {
  if (!raw) return null;
  const secure = raw.startsWith("http://")
    ? raw.replace("http://", "https://")
    : raw;
  return encodeURI(secure);
}

// ─── LetterAvatar ─────────────────────────────────────────────────────────────

const LetterAvatar: React.FC<{ name: string; size: number }> = ({
  name,
  size,
}) => {
  const color = getAvatarColor(name);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        backgroundColor: color + "22",
        borderWidth: 1.5,
        borderColor: color + "44",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: size * 0.44, fontWeight: "800", color }}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
};

// ─── ToolRow ──────────────────────────────────────────────────────────────────

const ToolRow: React.FC<{
  item: ToolItem;
  index: number;
  onPress: () => void;
}> = ({ item, index, onPress }) => {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 260,
        delay: Math.min(index * 40, 380),
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 260,
        delay: Math.min(index * 40, 380),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const name = item.title.rendered;
  const imageUri = getSafeImageUri(
    item?.["toolset-meta"]?.["digital-tools"]?.["digital-thumbnail"]?.raw
  );
  const hasLink =
    !!item?.["toolset-meta"]?.["digital-tools"]?.["download-link"]?.raw;

  return (
    <Animated.View
      style={{ opacity: fade, transform: [{ translateY: slide }] }}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && { opacity: 0.72 }]}
      >
        {/* Thumbnail */}
        <View style={styles.rowThumb}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width: 42, height: 42 }}
              resizeMode="contain"
            />
          ) : (
            <LetterAvatar name={name} size={42} />
          )}
        </View>

        {/* Text */}
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle} numberOfLines={2}>
            {name}
          </Text>
          {hasLink && (
            <View style={styles.rowBadge}>
              <Ionicons
                name="cloud-download-outline"
                size={10}
                color={COLORS.accent}
              />
              <Text style={styles.rowBadgeText}>Download available</Text>
            </View>
          )}
        </View>

        <Ionicons name="chevron-forward" size={15} color={COLORS.textMuted} />
      </Pressable>
    </Animated.View>
  );
};

// ─── DetailSheet ──────────────────────────────────────────────────────────────

const DetailSheet: React.FC<{ item: ToolItem | null; onClose: () => void }> = ({
  item,
  onClose,
}) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const visible = !!item;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : SCREEN_HEIGHT,
      useNativeDriver: true,
      tension: 60,
      friction: 11,
    }).start();
  }, [visible]);

  if (!item) return null;

  const name = item.title.rendered;
  const imageUri = getSafeImageUri(
    item?.["toolset-meta"]?.["digital-tools"]?.["digital-thumbnail"]?.raw
  );
  const downloadLink =
    item?.["toolset-meta"]?.["digital-tools"]?.["download-link"]?.raw;
  const linkUrl = downloadLink || item.link;
  const linkLabel = downloadLink ? "Download the app" : "Visit website";
  const linkIcon: any = downloadLink
    ? "cloud-download-outline"
    : "globe-outline";

  const htmlContent = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, sans-serif;
            background: #FFFFFF; 
            color: #555555;
            font-size: 15px; 
            line-height: 1.75;
            padding: 16px; 
            margin: 0;
          }
          img { max-width: 100%; height: auto; border-radius: 8px; }
          a { color: #FF6B2B; }
          h1,h2,h3 { color: #1C1C1E; font-weight: 700; }
          p { margin: 0 0 14px; }
        </style>
      </head>
      <body>${item.content?.rendered || "<p>No content available.</p>"}</body>
    </html>
  `;

  const handleLink = async () => {
    try {
      await Linking.openURL(linkUrl);
    } catch (e: any) {
      Alert.alert("", e.message);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View
        style={[styles.detailSheet, { transform: [{ translateY: slideAnim }] }]}
      >
        <View style={styles.sheetHandle} />

        <View style={styles.detailHeader}>
          <View style={styles.detailThumb}>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={{ width: 48, height: 48 }}
                resizeMode="contain"
              />
            ) : (
              <LetterAvatar name={name} size={48} />
            )}
          </View>
          <Text style={styles.detailTitle} numberOfLines={2}>
            {name}
          </Text>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
            <Ionicons name="close" size={18} color={COLORS.textSecondary} />
          </Pressable>
        </View>

        <Pressable onPress={handleLink} style={styles.linkBtn}>
          <Ionicons name={linkIcon} size={16} color={COLORS.accent} />
          <Text style={styles.linkBtnText}>{linkLabel}</Text>
          <Ionicons
            name="open-outline"
            size={13}
            color={COLORS.textMuted}
            style={{ marginLeft: "auto" }}
          />
        </Pressable>

        <WebView
          originWhitelist={["*"]}
          source={{ html: htmlContent }}
          style={{ flex: 1, backgroundColor: "#FFFFFF" }}
          javaScriptEnabled
          domStorageEnabled
        />
      </Animated.View>
    </Modal>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const DigitalToolsContent: React.FC = () => {
  const navigation = useNavigation();
  const { title, stringData } = useLocalSearchParams<{
    title: string;
    stringData: string;
  }>();
  const data: ToolItem[] = JSON.parse(stringData ?? "[]");

  const [selectedItem, setSelectedItem] = useState<ToolItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchVisible, setSearchVisible] = useState(false);
  const searchBarAnim = useRef(new Animated.Value(0)).current;

  const filtered = data.filter((item) =>
    item.title.rendered.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSearch = () => {
    Animated.timing(searchBarAnim, {
      toValue: searchVisible ? 0 : 1,
      duration: 220,
      useNativeDriver: false,
    }).start();
    setSearchVisible((v) => !v);
    if (searchVisible) setSearchQuery("");
  };

  const searchBarHeight = searchBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 52],
  });

  const renderItem = ({ item, index }: ListRenderItemInfo<ToolItem>) => (
    <ToolRow item={item} index={index} onPress={() => setSelectedItem(item)} />
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
        </Pressable>
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.headerSub}>
            {data.length} tool{data.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <Pressable
          onPress={toggleSearch}
          style={[styles.iconBtn, searchVisible && styles.iconBtnActive]}
          hitSlop={8}
        >
          <Ionicons
            name={searchVisible ? "close" : "search-outline"}
            size={18}
            color={searchVisible ? COLORS.accent : COLORS.textPrimary}
          />
        </Pressable>
      </View>

      {/* Animated search bar */}
      <Animated.View style={{ height: searchBarHeight, overflow: "hidden" }}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={15} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${title}…`}
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={searchVisible}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
              <Ionicons
                name="close-circle"
                size={15}
                color={COLORS.textMuted}
              />
            </Pressable>
          )}
        </View>
      </Animated.View>

      {/* Results count */}
      {searchVisible && searchQuery.length > 0 && (
        <View style={styles.resultsRow}>
          <Text style={styles.resultsText}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "
            <Text style={{ color: COLORS.accent }}>{searchQuery}</Text>"
          </Text>
        </View>
      )}

      {/* List */}
      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item, i) => String(item.id) + i}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="search-outline"
              size={36}
              color={COLORS.textMuted}
            />
            <Text style={styles.emptyText}>No tools found</Text>
            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => setSearchQuery("")}
                style={styles.clearBtn}
              >
                <Text style={styles.clearBtnText}>Clear search</Text>
              </Pressable>
            )}
          </View>
        }
      />

      <DetailSheet item={selectedItem} onClose={() => setSelectedItem(null)} />
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textPrimary,
    letterSpacing: 0.1,
  },
  headerSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnActive: {
    backgroundColor: COLORS.accentMuted,
    borderColor: COLORS.accentBorder,
  },

  // Search
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 40,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.textPrimary },

  // Results
  resultsRow: { paddingHorizontal: 20, paddingBottom: 8 },
  resultsText: { fontSize: 12, color: COLORS.textMuted },

  // List
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 60 },
  separator: { height: 8 },

  // Row
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rowThumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  rowBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  rowBadgeText: { fontSize: 10, fontWeight: "600", color: COLORS.accent },

  // Empty
  emptyState: { alignItems: "center", paddingVertical: 80, gap: 12 },
  emptyText: { fontSize: 15, fontWeight: "600", color: COLORS.textSecondary },
  clearBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.accentMuted,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
  },
  clearBtnText: { fontSize: 13, fontWeight: "700", color: COLORS.accent },

  // Backdrop
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },

  // Detail sheet
  detailSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.82,
    backgroundColor: COLORS.surfaceElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D1D6",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailThumb: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  detailTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  linkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    marginVertical: 12,
    backgroundColor: COLORS.accentMuted,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  linkBtnText: { fontSize: 14, fontWeight: "700", color: COLORS.accent },
});

export default DigitalToolsContent;
