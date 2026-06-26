/**
 * app/publicationscontent.tsx
 *
 * IITA Publication Detail screen — "Field Intelligence" aesthetic.
 * Matches the shared design system: light BG, green accents, editorial cards,
 * hero image with parallax-style overlay, staggered mount animations.
 *
 * TypeScript + Expo Router.
 */

import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Platform,
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
import { Service } from "../utils/service";

// ─── Design tokens ────────────────────────────────────────────────────────────
const GREEN = "#2D7D46";
const GREEN_LT = "#E8F5ED";
const ORANGE = "#F26522";
const DARK = "#111A14";
const BODY = "#3D4A41";
const MUTED = "#8A9E90";
const BORDER = "#E2EBE5";
const BG = "#F4F7F5";
const WHITE = "#FFFFFF";

const HERO_HEIGHT = 280;

// ─── Types ────────────────────────────────────────────────────────────────────
interface Bitstream {
  bundleName: string;
  name: string;
  retrieveLink: string;
  mimeType?: string;
  sizeBytes?: number;
}

interface PublicationData {
  name?: string;
  title?: { rendered?: string };
  date?: string;
  link?: string;
  description?: string;
  citation?: string;
  bitstream?: Bitstream[];
  metadata?: Record<string, string[]>;
  author?: string;
  publisher?: string;
  type?: string;
  language?: string;
  subject?: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const safeImg = (raw?: string): string => {
  if (!raw) return "";
  return raw.startsWith("http://") ? raw.replace("http://", "https://") : raw;
};

const formatBytes = (bytes?: number): string => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ─── Section card wrapper ─────────────────────────────────────────────────────
interface SectionCardProps {
  icon: string;
  label: string;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ icon, label, children }) => (
  <View style={styles.card}>
    <View style={styles.sectionRow}>
      <View style={styles.sectionIconTile}>
        <Ionicons name={icon as any} size={14} color={GREEN} />
      </View>
      <Text style={styles.sectionTag}>{label.toUpperCase()}</Text>
    </View>
    <View style={styles.accentLine} />
    {children}
  </View>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton: React.FC = () => {
  const pulse = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.45,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const Bar = ({
    w = "100%",
    h = 14,
    mt = 0,
  }: {
    w?: any;
    h?: number;
    mt?: number;
  }) => (
    <Animated.View
      style={{
        height: h,
        width: w,
        backgroundColor: BORDER,
        borderRadius: 7,
        marginTop: mt,
        opacity: pulse,
      }}
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Hero placeholder */}
      <Animated.View
        style={{ height: HERO_HEIGHT, backgroundColor: BORDER, opacity: pulse }}
      />
      <View style={{ padding: 16, gap: 12 }}>
        <Bar w="90%" h={22} />
        <Bar w="60%" h={14} mt={4} />
        <View style={[styles.card, { gap: 10, marginTop: 8 }]}>
          <Bar w="40%" h={12} />
          <Bar h={14} />
          <Bar h={14} />
          <Bar w="80%" h={14} />
        </View>
        <View style={[styles.card, { gap: 10 }]}>
          <Bar w="30%" h={12} />
          <Bar h={14} />
          <Bar h={14} />
        </View>
      </View>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
const Publicationscontent: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { id: itemId } = useLocalSearchParams<{ id: string }>();

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<PublicationData>({});
  const [resource, setResource] = useState<Bitstream | null>(null);

  // Animations
  const heroAnim = useRef(new Animated.Value(0)).current;
  const bodyAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  const runAnims = () => {
    Animated.stagger(120, [
      Animated.timing(heroAnim, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.timing(bodyAnim, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getData = () => {
    setIsLoading(true);
    fetch(`${Service.Publications}get_item?uuid=${itemId}`)
      .then((r) => r.json())
      .then((json: PublicationData) => {
        setData(json);
        const bitstreams = json.bitstream ?? [];
        const original = bitstreams.find((b) => b.bundleName === "ORIGINAL");
        setResource(original ?? null);
        setIsLoading(false);
        runAnims();
      })
      .catch((err: Error) => {
        setIsLoading(false);
        Alert.alert(
          "Connection Error",
          "Please check your internet connection and try again.",
          [
            {
              text: "Go back",
              style: "cancel",
              onPress: () => navigation.goBack(),
            },
            { text: "Retry", onPress: getData },
          ]
        );
        Vibration.vibrate();
      });
  };

  useEffect(() => {
    getData();
  }, []);

  const onShare = async () => {
    try {
      await Share.share({
        title: data?.name ?? data?.title?.rendered ?? "IITA Publication",
        message: `${data?.name ?? ""}\n\n${data?.link ?? ""}`,
        url: data?.link ?? "",
      });
    } catch (err: any) {
      Alert.alert("Share failed", err.message);
    }
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const rawThumb = data?.metadata?.["wpcf-news-thumbnail"]?.[0];
  const thumbUri = rawThumb ? safeImg(rawThumb) : "";
  const title = data?.name ?? data?.title?.rendered ?? "Untitled";
  const pubDate = data?.date ? moment(data.date).format("MMM D, YYYY") : "";

  // Hero parallax translate
  const heroTranslate = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT],
    outputRange: [0, -HERO_HEIGHT * 0.35],
    extrapolate: "clamp",
  });
  // Header bg opacity as user scrolls past hero
  const headerBgOpacity = scrollY.interpolate({
    inputRange: [HERO_HEIGHT - 80, HERO_HEIGHT],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  if (isLoading) return <Skeleton />;

  return (
    <View style={styles.root}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* ── Floating header ──────────────────────────────────────────────── */}
      <Animated.View
        style={[styles.floatingHeader, { paddingTop: insets.top }]}
      >
        {/* Solid bg that fades in on scroll */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: WHITE, opacity: headerBgOpacity },
          ]}
        />
        <SafeAreaView
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 8,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.floatingBtn}
          >
            <Ionicons name="arrow-back" size={20} color={WHITE} />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={onShare} style={styles.floatingBtn}>
            <Ionicons name="share-outline" size={20} color={WHITE} />
          </TouchableOpacity>
        </SafeAreaView>
      </Animated.View>

      {/* ── Scroll content ───────────────────────────────────────────────── */}
      <Animated.ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 48 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* ── Hero image ─────────────────────────────────────────────────── */}
        <Animated.View
          style={[
            styles.heroWrap,
            { transform: [{ translateY: heroTranslate }], opacity: heroAnim },
          ]}
        >
          <Image
            source={
              thumbUri
                ? { uri: thumbUri }
                : require("../../assets/images/library.jpg")
            }
            style={styles.heroImage}
            resizeMode="cover"
          />
          {/* gradient scrim */}
          <View style={styles.heroScrim} />

          {/* Type badge */}
          {data?.type ? (
            <View style={styles.typeBadge}>
              <Ionicons name="book-outline" size={11} color={WHITE} />
              <Text style={styles.typeBadgeText}>
                {data.type.toUpperCase()}
              </Text>
            </View>
          ) : null}
        </Animated.View>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <Animated.View
          style={[
            styles.body,
            {
              opacity: bodyAnim,
              transform: [
                {
                  translateY: bodyAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [24, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* ── Title card ─────────────────────────────────────────────── */}
          <View style={styles.titleCard}>
            <Text style={styles.titleText}>{title}</Text>

            {/* Meta strip */}
            <View style={styles.metaStrip}>
              {pubDate ? (
                <View style={styles.metaChip}>
                  <Ionicons name="calendar-outline" size={12} color={MUTED} />
                  <Text style={styles.metaChipText}>{pubDate}</Text>
                </View>
              ) : null}
              {data?.author ? (
                <View style={styles.metaChip}>
                  <Ionicons name="person-outline" size={12} color={MUTED} />
                  <Text style={styles.metaChipText} numberOfLines={1}>
                    {data.author}
                  </Text>
                </View>
              ) : null}
              {data?.language ? (
                <View style={styles.metaChip}>
                  <Ionicons name="language-outline" size={12} color={MUTED} />
                  <Text style={styles.metaChipText}>{data.language}</Text>
                </View>
              ) : null}
            </View>

            {/* Subject tags */}
            {data?.subject && data.subject.length > 0 ? (
              <View style={styles.tagRow}>
                {data.subject.slice(0, 5).map((s, i) => (
                  <View key={i} style={styles.tag}>
                    <Text style={styles.tagText}>{s}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          {/* ── Description ────────────────────────────────────────────── */}
          {data?.description ? (
            <SectionCard icon="document-text-outline" label="Description">
              <Text style={styles.bodyText}>{data.description}</Text>
            </SectionCard>
          ) : null}

          {/* ── Citation ───────────────────────────────────────────────── */}
          {data?.citation ? (
            <SectionCard icon="journal-outline" label="Citation">
              <View style={styles.citationBlock}>
                <Text style={styles.citationText}>{data.citation}</Text>
              </View>
            </SectionCard>
          ) : null}

          {/* ── Resources ──────────────────────────────────────────────── */}
          <SectionCard icon="folder-open-outline" label="Resources">
            {resource ? (
              <TouchableOpacity
                activeOpacity={0.78}
                style={styles.resourceRow}
                onPress={() =>
                  router.push({
                    pathname: "/publicationpdfpreview",
                    params: {
                      url: resource.retrieveLink,
                      name: data?.name,
                    },
                  })
                }
              >
                {/* File icon */}
                <View style={styles.fileIconTile}>
                  <Ionicons name="document-outline" size={22} color={ORANGE} />
                </View>

                {/* File info */}
                <View style={{ flex: 1 }}>
                  <Text style={styles.resourceName} numberOfLines={2}>
                    {resource.name}
                  </Text>
                  <View style={styles.resourceMeta}>
                    {resource.mimeType ? (
                      <Text style={styles.resourceType}>
                        {resource.mimeType.split("/")[1]?.toUpperCase() ??
                          "FILE"}
                      </Text>
                    ) : null}
                    {resource.sizeBytes ? (
                      <Text style={styles.resourceSize}>
                        {formatBytes(resource.sizeBytes)}
                      </Text>
                    ) : null}
                  </View>
                </View>

                {/* Arrow */}
                <View style={styles.resourceArrow}>
                  <Ionicons name="arrow-forward" size={15} color={GREEN} />
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.noResource}>
                <Ionicons
                  name="cloud-offline-outline"
                  size={32}
                  color={BORDER}
                />
                <Text style={styles.noResourceText}>
                  No resources available.{"\n"}Please contact the IITA Knowledge
                  Centre.
                </Text>
              </View>
            )}
          </SectionCard>

          {/* ── Share CTA ──────────────────────────────────────────────── */}
          <TouchableOpacity
            onPress={onShare}
            activeOpacity={0.8}
            style={styles.shareCta}
          >
            <Ionicons name="share-social-outline" size={18} color={GREEN} />
            <Text style={styles.shareCtaText}>Share this publication</Text>
            <Ionicons
              name="arrow-forward"
              size={15}
              color={GREEN}
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
};

export default Publicationscontent;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },

  // ── Floating header ────────────────────────────────────────────────────────
  floatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99,
  },
  floatingBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.32)",
    justifyContent: "center",
    alignItems: "center",
    margin: 8,
  },

  // ── Hero ───────────────────────────────────────────────────────────────────
  heroWrap: {
    height: HERO_HEIGHT,
    position: "relative",
    backgroundColor: DARK,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.38)",
  },
  typeBadge: {
    position: "absolute",
    bottom: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: WHITE,
    letterSpacing: 1,
  },

  // ── Body ───────────────────────────────────────────────────────────────────
  body: {
    padding: 16,
    gap: 12,
  },

  // ── Title card ────────────────────────────────────────────────────────────
  titleCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "800",
    color: DARK,
    lineHeight: 28,
    marginBottom: 14,
  },
  metaStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: BG,
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: BORDER,
  },
  metaChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: BODY,
    maxWidth: 140,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  tag: {
    backgroundColor: GREEN_LT,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "700",
    color: GREEN,
  },

  // ── Section card ──────────────────────────────────────────────────────────
  card: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  sectionIconTile: {
    width: 28,
    height: 28,
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
  accentLine: {
    height: 3,
    width: 36,
    backgroundColor: GREEN,
    borderRadius: 2,
    marginBottom: 14,
  },
  bodyText: {
    fontSize: 15,
    color: BODY,
    lineHeight: 24,
  },

  // ── Citation ──────────────────────────────────────────────────────────────
  citationBlock: {
    backgroundColor: BG,
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: ORANGE,
    borderWidth: 1,
    borderColor: BORDER,
  },
  citationText: {
    fontSize: 14,
    color: BODY,
    lineHeight: 22,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },

  // ── Resource row ──────────────────────────────────────────────────────────
  resourceRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BG,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  fileIconTile: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FFF3EE",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  resourceName: {
    fontSize: 14,
    fontWeight: "700",
    color: DARK,
    lineHeight: 20,
  },
  resourceMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  resourceType: {
    fontSize: 10,
    fontWeight: "800",
    color: ORANGE,
    letterSpacing: 0.5,
  },
  resourceSize: {
    fontSize: 11,
    color: MUTED,
    fontWeight: "500",
  },
  resourceArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: GREEN_LT,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  noResource: {
    alignItems: "center",
    paddingVertical: 28,
    gap: 12,
  },
  noResourceText: {
    fontSize: 13,
    color: MUTED,
    textAlign: "center",
    lineHeight: 20,
  },

  // ── Share CTA ─────────────────────────────────────────────────────────────
  shareCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: GREEN_LT,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: GREEN + "40",
  },
  shareCtaText: {
    fontSize: 14,
    fontWeight: "700",
    color: GREEN,
  },
});
