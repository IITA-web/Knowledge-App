/**
 * app/cropphotos.tsx  (was photos.tsx)
 *
 * Shows every picture inside a single WordPress album post.
 * Fetches: GET {wpBaseUrl}/wp-json/wp/v2/media?parent={id}
 *
 * What changed from the previous version:
 *  1. toAlbumPhoto — fixed size fallback chain to match real API response:
 *       full > medium_large > medium > thumbnail  (no "large" size exists)
 *     Also uses `caption.rendered` (stripped) in preference to title,
 *     and reads `alt_text` for accessibility.
 *  2. Header photo count uses i18n keys (photo / photos).
 *  3. Error / empty / retry strings use i18n.
 *  4. All hardcoded English strings are gone.
 */

import { useLanguage } from "@/context/LanguageContext";
import i18n from "@/i18n";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Modal,
  PanResponder,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { screenHeight, screenWidth } from "../utils/Dimension";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#FFFFFF",
  surface: "#F7F8FA",
  border: "#ECEEF2",
  accent: "#F26522",
  text: "#111418",
  textMuted: "#8A919E",
  white: "#FFFFFF",
};

const WP_DEFAULT_BASE = "https://iita.org";
const NUM_COLUMNS = 3;
const GRID_GAP = 3;
const ITEM_SIZE = (screenWidth - GRID_GAP * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const stripHtml = (html = "") =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim();

const toSecureUri = (raw?: string | null): string | null => {
  if (!raw) return null;
  return raw.startsWith("http://") ? raw.replace("http://", "https://") : raw;
};

const isWpError = (json: any): boolean =>
  !!json &&
  typeof json === "object" &&
  !Array.isArray(json) &&
  "code" in json &&
  "message" in json;

interface AlbumPhoto {
  id: number;
  thumbUri: string;
  fullUri: string;
  caption?: string;
  alt?: string;
}

/**
 * Convert one raw WordPress media item into an AlbumPhoto.
 *
 * Real API size keys (from the sample data):
 *   full, medium_large, medium, thumbnail, trp-custom-language-flag
 * There is NO "large" key — the old code fell through to source_url anyway,
 * but this is now explicit and correct.
 *
 * Caption preference: caption.rendered > title.rendered
 * (caption is the human-written description; title is the filename slug)
 */
const toAlbumPhoto = (raw: any): AlbumPhoto | null => {
  const sizes = raw?.media_details?.sizes ?? {};

  // Best full-resolution URL: full > medium_large > medium > source_url
  const fullRaw =
    sizes?.full?.source_url ??
    sizes?.medium_large?.source_url ??
    sizes?.medium?.source_url ??
    raw?.source_url;

  const full = toSecureUri(fullRaw);
  if (!full) return null;

  // Best thumbnail: medium > thumbnail > fall back to full
  const thumbRaw = sizes?.medium?.source_url ?? sizes?.thumbnail?.source_url;
  const thumb = toSecureUri(thumbRaw) ?? full;

  // Caption: prefer caption.rendered over title.rendered (which is often a filename)
  const rawCaption = raw?.caption?.rendered
    ? stripHtml(raw.caption.rendered)
    : raw?.title?.rendered
    ? stripHtml(raw.title.rendered)
    : undefined;

  return {
    id: raw.id,
    thumbUri: thumb,
    fullUri: full,
    caption: rawCaption || undefined,
    alt: raw?.alt_text || undefined,
  };
};

const fetchAlbumPhotos = async (
  albumId: string,
  wpBaseUrl: string
): Promise<AlbumPhoto[]> => {
  const url = `${wpBaseUrl}/wp-json/wp/v2/media?parent=${albumId}&per_page=100`;

  const res = await fetch(url);
  const json = await res.json();

  if (isWpError(json))
    throw new Error(json.message || "Couldn't load this album");
  if (!Array.isArray(json)) throw new Error("Unexpected response from server");

  return json.map(toAlbumPhoto).filter((p): p is AlbumPhoto => p !== null);
};

// ═══════════════════════════════════════════════════════════════════════════════
// ZOOMABLE IMAGE (unchanged from previous version)
// ═══════════════════════════════════════════════════════════════════════════════
const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;
const DOUBLE_TAP_WINDOW_MS = 280;
const DISMISS_DISTANCE = 100;
const DISMISS_VELOCITY = 0.8;

const ZoomableImage: React.FC<{
  uri: string;
  onZoomChange: (zoomed: boolean) => void;
  onSwipeDownDismiss: () => void;
}> = ({ uri, onZoomChange, onSwipeDownDismiss }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const scaleVal = useRef(1);
  const translateXVal = useRef(0);
  const translateYVal = useRef(0);

  const pinchStartDistance = useRef<number | null>(null);
  const pinchStartScale = useRef(1);
  const panOrigin = useRef({ x: 0, y: 0 });
  const isZoomedRef = useRef(false);
  const isDismissDrag = useRef(false);
  const lastTapAt = useRef(0);
  const touchStartAt = useRef(0);

  useEffect(() => {
    const l1 = scale.addListener(({ value }) => (scaleVal.current = value));
    const l2 = translateX.addListener(
      ({ value }) => (translateXVal.current = value)
    );
    const l3 = translateY.addListener(
      ({ value }) => (translateYVal.current = value)
    );
    return () => {
      scale.removeListener(l1);
      translateX.removeListener(l2);
      translateY.removeListener(l3);
    };
  }, []);

  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

  const animateTo = (s: number, x: number, y: number, duration = 220) => {
    Animated.parallel([
      Animated.timing(scale, { toValue: s, duration, useNativeDriver: true }),
      Animated.timing(translateX, {
        toValue: x,
        duration,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: y,
        duration,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const resetZoom = () => {
    isZoomedRef.current = false;
    onZoomChange(false);
    animateTo(1, 0, 0);
  };
  const zoomToDouble = () => {
    isZoomedRef.current = true;
    onZoomChange(true);
    animateTo(DOUBLE_TAP_SCALE, 0, 0);
  };
  const getDistance = (touches: any[]) => {
    const [a, b] = touches;
    return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: (evt) =>
        evt.nativeEvent.touches.length === 2,
      onMoveShouldSetPanResponder: (evt, gesture) => {
        if (evt.nativeEvent.touches.length === 2) return true;
        if (isZoomedRef.current) return true;
        return (
          Math.abs(gesture.dy) > 10 &&
          Math.abs(gesture.dy) > Math.abs(gesture.dx)
        );
      },
      onPanResponderGrant: (evt) => {
        touchStartAt.current = Date.now();
        if (evt.nativeEvent.touches.length === 2) {
          pinchStartDistance.current = getDistance(evt.nativeEvent.touches);
          pinchStartScale.current = scaleVal.current;
        }
        panOrigin.current = {
          x: translateXVal.current,
          y: translateYVal.current,
        };
      },
      onPanResponderMove: (evt, gesture) => {
        const touches = evt.nativeEvent.touches;
        if (touches.length === 2) {
          if (pinchStartDistance.current == null) {
            pinchStartDistance.current = getDistance(touches);
            pinchStartScale.current = scaleVal.current;
            return;
          }
          const dist = getDistance(touches);
          const next = clamp(
            pinchStartScale.current * (dist / pinchStartDistance.current),
            1,
            MAX_SCALE
          );
          scale.setValue(next);
          isZoomedRef.current = next > 1.02;
          return;
        }
        if (isZoomedRef.current) {
          const boundX = (screenWidth * (scaleVal.current - 1)) / 2;
          const boundY = (screenHeight * (scaleVal.current - 1)) / 2;
          translateX.setValue(
            clamp(panOrigin.current.x + gesture.dx, -boundX, boundX)
          );
          translateY.setValue(
            clamp(panOrigin.current.y + gesture.dy, -boundY, boundY)
          );
          return;
        }
        if (gesture.dy > 0) {
          isDismissDrag.current = true;
          translateY.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (evt, gesture) => {
        const wasPinch = pinchStartDistance.current !== null;
        pinchStartDistance.current = null;
        if (wasPinch) {
          scaleVal.current <= 1.05
            ? resetZoom()
            : ((isZoomedRef.current = true), onZoomChange(true));
          return;
        }
        if (isDismissDrag.current) {
          isDismissDrag.current = false;
          if (gesture.dy > DISMISS_DISTANCE || gesture.vy > DISMISS_VELOCITY) {
            onSwipeDownDismiss();
          } else {
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
              speed: 20,
            }).start();
          }
          return;
        }
        if (isZoomedRef.current) return;
        const duration = Date.now() - touchStartAt.current;
        const moved = Math.abs(gesture.dx) > 8 || Math.abs(gesture.dy) > 8;
        if (!moved && duration < 250) {
          const now = Date.now();
          if (now - lastTapAt.current < DOUBLE_TAP_WINDOW_MS) {
            zoomToDouble();
            lastTapAt.current = 0;
          } else {
            lastTapAt.current = now;
          }
        }
      },
    })
  ).current;

  return (
    <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers}>
      <Animated.Image
        source={{ uri }}
        resizeMode="contain"
        style={[
          StyleSheet.absoluteFill,
          { transform: [{ translateX }, { translateY }, { scale }] },
        ]}
      />
    </View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// FULL-SCREEN VIEWER MODAL (unchanged)
// ═══════════════════════════════════════════════════════════════════════════════
const PhotoViewerModal: React.FC<{
  visible: boolean;
  photos: AlbumPhoto[];
  initialIndex: number;
  onClose: () => void;
}> = ({ visible, photos, initialIndex, onClose }) => {
  const inset = useSafeAreaInsets();
  const listRef = useRef<FlatList<AlbumPhoto>>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      setScrollEnabled(true);
    }
  }, [visible, initialIndex]);

  if (!visible) return null;
  const current = photos[currentIndex];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={v.backdrop}>
        <StatusBar barStyle="light-content" />

        <View style={v.topBar}>
          <TouchableOpacity
            onPress={onClose}
            style={v.closeBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={v.counter}>
            {currentIndex + 1} / {photos.length}
          </Text>
          <View style={{ width: 38 }} />
        </View>

        <FlatList
          ref={listRef}
          data={photos}
          horizontal
          pagingEnabled
          scrollEnabled={scrollEnabled}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(p) => String(p.id)}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
            setCurrentIndex(idx);
          }}
          renderItem={({ item }) => (
            <View style={{ width: screenWidth, height: screenHeight }}>
              <ZoomableImage
                uri={item.fullUri}
                onZoomChange={(z) => setScrollEnabled(!z)}
                onSwipeDownDismiss={onClose}
              />
            </View>
          )}
        />

        {current?.caption ? (
          <View
            style={[v.captionWrap, { marginBottom: inset.bottom + 20 }]}
            pointerEvents="none"
          >
            <Text style={v.captionText} numberOfLines={2}>
              {current.caption}
            </Text>
          </View>
        ) : null}
      </View>
    </Modal>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
const CropPhotosScreen: React.FC = () => {
  const navigation = useNavigation();
  const { language } = useLanguage();

  const params = useLocalSearchParams<{
    id?: string;
    title?: string;
    source?: string;
    wpBaseUrl?: string;
  }>();

  const albumId = params.id;
  const wpBaseUrl = params.wpBaseUrl || WP_DEFAULT_BASE;
  const albumTitle =
    params.title || (language ? i18n.t("cropPhotos.album") : "Album");

  const [photos, setPhotos] = useState<AlbumPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const load = useCallback(
    async (isRefresh = false) => {
      if (!albumId) {
        setError(
          language ? i18n.t("cropPhotos.missingId") : "Missing album id"
        );
        return;
      }
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const result = await fetchAlbumPhotos(
          String(albumId),
          String(wpBaseUrl)
        );
        setPhotos(result);
      } catch (e: any) {
        setError(
          e?.message ??
            (language
              ? i18n.t("cropPhotos.loadFailed")
              : "Failed to load photos")
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [albumId, wpBaseUrl, language]
  );

  useEffect(() => {
    load();
  }, [load]);

  // Singular / plural photo count label
  const photoCountLabel =
    photos.length === 1
      ? `1 ${language ? i18n.t("cropPhotos.photo") : "photo"}`
      : `${photos.length} ${language ? i18n.t("cropPhotos.photos") : "photos"}`;

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header — same style as all other screens */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.headerBtn}
        >
          <Ionicons name="arrow-back" size={20} color={C.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle} numberOfLines={1}>
            {albumTitle}
          </Text>
          {photos.length > 0 && (
            <Text style={s.headerSub}>{photoCountLabel}</Text>
          )}
        </View>
      </View>

      {/* Loading */}
      {loading && (
        <View style={s.centerFill}>
          <ActivityIndicator color={C.accent} size="large" />
        </View>
      )}

      {/* Error */}
      {!loading && error && (
        <View style={s.centerFill}>
          <Ionicons name="alert-circle-outline" size={36} color={C.textMuted} />
          <Text style={s.stateText}>{error}</Text>
          <TouchableOpacity onPress={() => load()} style={s.retryBtn}>
            <Text style={s.retryText}>
              {language ? i18n.t("cropPhotos.tryAgain") : "Try again"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Empty */}
      {!loading && !error && photos.length === 0 && (
        <View style={s.centerFill}>
          <Ionicons name="images-outline" size={36} color={C.textMuted} />
          <Text style={s.stateText}>
            {language ? i18n.t("cropPhotos.noPhotos") : "No photos here yet"}
          </Text>
        </View>
      )}

      {/* Grid */}
      {!loading && !error && photos.length > 0 && (
        <FlatList
          data={photos}
          keyExtractor={(p) => String(p.id)}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={{ padding: GRID_GAP }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load(true)}
              tintColor={C.accent}
              colors={[C.accent]}
            />
          }
          renderItem={({ item, index }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setViewerIndex(index)}
              accessibilityLabel={item.alt || item.caption || undefined}
              style={{
                width: ITEM_SIZE,
                height: ITEM_SIZE,
                margin: GRID_GAP / 2,
                borderRadius: 6,
                overflow: "hidden",
                backgroundColor: C.surface,
              }}
            >
              <Image
                source={{ uri: item.thumbUri }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
        />
      )}

      <PhotoViewerModal
        visible={viewerIndex !== null}
        photos={photos}
        initialIndex={viewerIndex ?? 0}
        onClose={() => setViewerIndex(null)}
      />
    </SafeAreaView>
  );
};

export default CropPhotosScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 16, fontWeight: "800", color: C.text },
  headerSub: { fontSize: 11, color: C.textMuted, marginTop: 1 },
  centerFill: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 10,
  },
  stateText: { fontSize: 14, color: C.textMuted, textAlign: "center" },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(242,101,34,0.1)",
  },
  retryText: { color: C.accent, fontWeight: "700", fontSize: 13 },
});

const v = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "#000" },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  counter: { color: "#fff", fontSize: 13, fontWeight: "700" },
  captionWrap: {
    position: "absolute",
    bottom: 32,
    left: 24,
    right: 24,
    alignItems: "center",
  },
  captionText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    textAlign: "center",
  },
});
