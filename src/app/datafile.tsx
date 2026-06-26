import { screenWidth } from "@/utils/Dimension";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CitationButton {
  label: string;
  style: string;
  name: string;
}

interface Resource {
  id: string;
  url: string;
  name: string;
  format: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const CITATION_STYLES: CitationButton[] = [
  { label: "APA", style: "apa", name: "APA" },
  { label: "Harvard", style: "harvard-cite-them-right", name: "Harvard" },
  { label: "MLA", style: "modern-language-association", name: "MLA" },
  { label: "Chicago", style: "chicago-fullnote-bibliography", name: "Chicago" },
  { label: "IEEE", style: "ieee", name: "IEEE" },
  { label: "CSE", style: "council-of-science-editors", name: "CSE" },
  { label: "AMA", style: "american-medical-association", name: "AMA" },
  {
    label: "NLM",
    style: "national-library-of-medicine-grant-proposals",
    name: "NLM",
  },
  {
    label: "Turabian",
    style: "turabian-fullnote-bibliography",
    name: "Turabian",
  },
];

const COLORS = {
  bg: "#0D0D12",
  surface: "#161620",
  surfaceElevated: "#1E1E2E",
  border: "#2A2A3D",
  accent: "#FF6B2B",
  accentMuted: "rgba(255, 107, 43, 0.12)",
  accentBorder: "rgba(255, 107, 43, 0.35)",
  textPrimary: "#F0EEF8",
  textSecondary: "#9997B0",
  textMuted: "#5A5870",
  white: "#FFFFFF",
  embargo: "#E8B84B",
  embargoMuted: "rgba(232, 184, 75, 0.12)",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const Pill: React.FC<{
  label: string;
  active?: boolean;
  onPress?: () => void;
}> = ({ label, active, onPress }) => (
  <Pressable
    onPress={onPress}
    style={[styles.pill, active && styles.pillActive]}
  >
    <Text style={[styles.pillText, active && styles.pillTextActive]}>
      {label}
    </Text>
  </Pressable>
);

const SectionLabel: React.FC<{ children: string }> = ({ children }) => (
  <View style={styles.sectionLabelRow}>
    <View style={styles.sectionLabelDot} />
    <Text style={styles.sectionLabelText}>{children}</Text>
  </View>
);

const ResourceRow: React.FC<{ item: Resource; onPress: () => void }> = ({
  item,
  onPress,
}) => (
  <Pressable onPress={onPress} style={styles.resourceRow}>
    <View style={styles.resourceIcon}>
      <Ionicons name="document-outline" size={16} color={COLORS.accent} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.resourceName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.resourceFormat}>{item.format.toUpperCase()}</Text>
    </View>
    <Ionicons
      name="cloud-download-outline"
      size={18}
      color={COLORS.textSecondary}
    />
  </Pressable>
);

const EmbargoNotice: React.FC<{ date: string }> = ({ date }) => (
  <View style={styles.embargoCard}>
    <View style={styles.embargoIconWrap}>
      <Ionicons name="lock-closed" size={20} color={COLORS.embargo} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.embargoTitle}>Dataset Under Embargo</Text>
      <Text style={styles.embargoDesc}>
        Files will be publicly available on{" "}
        <Text style={{ color: COLORS.embargo, fontWeight: "700" }}>{date}</Text>
      </Text>
    </View>
  </View>
);

// ─── Citation Sheet ───────────────────────────────────────────────────────────

interface CitationSheetProps {
  visible: boolean;
  selected: string;
  onClose: () => void;
  onSelect: (style: string, name: string) => void;
}

const CitationSheet: React.FC<CitationSheetProps> = ({
  visible,
  selected,
  onClose,
  onSelect,
}) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : SCREEN_HEIGHT,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none">
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />
      <Animated.View
        style={[
          styles.sheetContainer,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Handle */}
        <View style={styles.sheetHandle} />

        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Citation Style</Text>
          <Pressable onPress={onClose} style={styles.sheetClose} hitSlop={12}>
            <Ionicons name="close" size={20} color={COLORS.textSecondary} />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sheetScroll}
        >
          {CITATION_STYLES.map((item) => {
            const isActive = item.style === selected;
            return (
              <Pressable
                key={item.style}
                onPress={() => onSelect(item.style, item.name)}
                style={[styles.sheetItem, isActive && styles.sheetItemActive]}
              >
                <View style={styles.sheetItemLeft}>
                  {isActive ? (
                    <View style={styles.sheetItemCheck}>
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color={COLORS.white}
                      />
                    </View>
                  ) : (
                    <View style={styles.sheetItemCheckEmpty} />
                  )}
                  <Text
                    style={[
                      styles.sheetItemText,
                      isActive && styles.sheetItemTextActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                </View>
                <Text style={styles.sheetItemSub}>{item.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

// ─── Skeleton loader ──────────────────────────────────────────────────────────

const SkeletonBlock: React.FC<{ width?: string | number; height?: number }> = ({
  width = "100%",
  height = 14,
}) => {
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        width: screenWidth,
        height,
        borderRadius: 6,
        backgroundColor: COLORS.surfaceElevated,
        marginBottom: 10,
        opacity: pulse,
      }}
    />
  );
};

const LoadingSkeleton: React.FC = () => (
  <View style={styles.skeletonWrap}>
    <SkeletonBlock width="65%" height={18} />
    <SkeletonBlock width="90%" height={12} />
    <SkeletonBlock width="80%" height={12} />
    <View style={{ height: 28 }} />
    <SkeletonBlock width="40%" height={12} />
    <SkeletonBlock width="100%" height={80} />
    <View style={{ height: 28 }} />
    <SkeletonBlock width="50%" height={14} />
    <SkeletonBlock width="100%" height={60} />
    <SkeletonBlock width="100%" height={60} />
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const Datafile: React.FC = () => {
  const navigation = useNavigation();
  const {
    identifier,
    embargo_end_date,
    title,
    notes,
    resources: rawResources,
  } = useLocalSearchParams<{
    id: string;
    identifier: string;
    embargo_end_date: string;
    creator: string;
    title: string;
    notes: string;
    resources: string;
  }>();

  const [isLoading, setIsLoading] = useState(true);
  const [showSheet, setShowSheet] = useState(false);
  const [embargo, setEmbargo] = useState(false);
  const [embargoEndLabel, setEmbargoEndLabel] = useState("");
  const [citationStyle, setCitationStyle] = useState("apa");
  const [citationStyleName, setCitationStyleName] = useState("APA");
  const [loadingCitation, setLoadingCitation] = useState(false);
  const [citationData, setCitationData] = useState("");

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(24)).current;

  const resources: Resource[] = rawResources
    ? (() => {
        try {
          return JSON.parse(rawResources as string);
        } catch {
          return [];
        }
      })()
    : [];

  const fetchCitation = () => {
    setLoadingCitation(true);
    fetch(identifier as string, {
      headers: { Accept: "text/x-bibliography; style=" + citationStyle },
    })
      .then((r) => r.text())
      .then((text) => {
        const clean = text.replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, "");
        setCitationData(clean);
        setLoadingCitation(false);
        setIsLoading(false);
        // Animate content in
        Animated.parallel([
          Animated.timing(headerOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(contentSlide, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      })
      .catch((err) => {
        Alert.alert("Error", err?.message);
        Vibration.vibrate();
        setIsLoading(false);
      });
  };

  useEffect(() => {
    const now = Date.now() / 1000;
    const end = new Date(embargo_end_date as string).getTime() / 1000;
    if (end > now) {
      setEmbargo(true);
      const d = new Date(embargo_end_date as string);
      setEmbargoEndLabel(
        d.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
    }
    fetchCitation();
  }, [embargo_end_date]);

  useEffect(() => {
    if (!isLoading) fetchCitation();
  }, [citationStyle]);

  const handleSelectStyle = (style: string, name: string) => {
    setCitationStyle(style);
    setCitationStyleName(name);
    setShowSheet(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.headerBack}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Dataset</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <Animated.View
            style={{
              opacity: headerOpacity,
              transform: [{ translateY: contentSlide }],
            }}
          >
            {/* ── Title block ── */}
            <View style={styles.titleCard}>
              <View style={styles.titleBadge}>
                <Ionicons
                  name="layers-outline"
                  size={14}
                  color={COLORS.accent}
                />
                <Text style={styles.titleBadgeText}>Dataset</Text>
              </View>
              <Text style={styles.titleText}>{title}</Text>
              {notes ? <Text style={styles.notesText}>{notes}</Text> : null}
            </View>

            {/* ── Embargo notice ── */}
            {embargo && <EmbargoNotice date={embargoEndLabel} />}

            {/* ── Citation ── */}
            <View style={styles.card}>
              <View style={styles.citationHeader}>
                <SectionLabel>Citation</SectionLabel>
                <Pressable
                  onPress={() => setShowSheet(true)}
                  style={styles.citationStyleBtn}
                >
                  <Text style={styles.citationStyleBtnText}>
                    {citationStyleName}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={14}
                    color={COLORS.accent}
                  />
                  {loadingCitation && (
                    <ActivityIndicator
                      size={12}
                      color={COLORS.accent}
                      style={{ marginLeft: 4 }}
                    />
                  )}
                </Pressable>
              </View>

              {loadingCitation ? (
                <View style={{ marginTop: 12 }}>
                  <SkeletonBlock width="100%" height={12} />
                  <SkeletonBlock width="85%" height={12} />
                  <SkeletonBlock width="70%" height={12} />
                </View>
              ) : (
                <Text style={styles.citationBody}>{citationData}</Text>
              )}
            </View>

            {/* ── Resources ── */}
            <View style={[styles.card, { marginBottom: 40 }]}>
              <SectionLabel>Data & Resources</SectionLabel>
              {embargo ? (
                <Text style={styles.embargoResourcesNote}>
                  Files are locked until the embargo lifts.
                </Text>
              ) : resources.length > 0 ? (
                resources.map((item) => (
                  <ResourceRow key={item.id} item={item} onPress={() => {}} />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="folder-open-outline"
                    size={32}
                    color={COLORS.textMuted}
                  />
                  <Text style={styles.emptyText}>
                    No resources available for this dataset
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* ── Citation style bottom sheet ── */}
      <CitationSheet
        visible={showSheet}
        selected={citationStyle}
        onClose={() => setShowSheet(false)}
        onSelect={handleSelectStyle}
      />
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerBack: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  skeletonWrap: {
    paddingTop: 10,
  },

  // Title card
  titleCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  titleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.accentMuted,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
  },
  titleBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.accent,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  titleText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
    lineHeight: 26,
    marginBottom: 10,
  },
  notesText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },

  // Embargo
  embargoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    backgroundColor: COLORS.embargoMuted,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(232,184,75,0.3)",
  },
  embargoIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(232,184,75,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  embargoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.embargo,
    marginBottom: 4,
  },
  embargoDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // Card
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // Section label
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sectionLabelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
  },
  sectionLabelText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  // Citation
  citationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 0,
  },
  citationStyleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.accentMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
  },
  citationStyleBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.accent,
  },
  citationBody: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginTop: 14,
    fontStyle: "italic",
  },

  // Resources
  resourceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  resourceIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.accentMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
  },
  resourceName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  resourceFormat: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    letterSpacing: 0.6,
  },
  embargoResourcesNote: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
  },

  // Pill
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: COLORS.accentMuted,
    borderColor: COLORS.accentBorder,
  },
  pillText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  pillTextActive: {
    color: COLORS.accent,
  },

  // Sheet
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  sheetContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surfaceElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: SCREEN_HEIGHT * 0.62,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  sheetClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetScroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  sheetItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sheetItemActive: {
    backgroundColor: COLORS.accentMuted,
    borderColor: COLORS.accentBorder,
  },
  sheetItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sheetItemCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetItemCheckEmpty: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  sheetItemText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  sheetItemTextActive: {
    color: COLORS.accent,
  },
  sheetItemSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
});

export default Datafile;
