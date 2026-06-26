import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Image,
  Keyboard,
  Modal,
  Pressable,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import YoutubePlayer from "react-native-youtube-iframe";
import { screenWidth } from "../utils/Dimension";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const COLORS = {
  bg: "rgb(242, 242, 242)",
  surface: "#FFFFFF",
  surfaceElevated: "#F5F5F5",
  border: "#E8E8E8",
  accent: "#FF6B35",
  accentSoft: "rgba(255,107,53,0.10)",
  accentGlow: "rgba(255,107,53,0.06)",
  text: "#1A1A1A",
  textMuted: "#888899",
  textDim: "#BBBBCC",
  white: "#FFFFFF",
  shadow: "rgba(0,0,0,0.07)",
  playerBg: "#0F0F0F",
};

// ─── Constants ─────────────────────────────────────────────────────────────────
const CARD_GAP = 12;
const H_PAD = 16;
const CARD_WIDTH = (screenWidth - H_PAD * 2 - CARD_GAP) / 2;
const THUMB_HEIGHT = CARD_WIDTH * 0.62;

const API_KEY = "AIzaSyAi5WzxpF2E6wmz-e1yu2nAg9lQWEM43Zg";
const TV_CHANNEL_ID = "UCX9nNo3ZvRk8ZZ9lHsEASLg";
const FEATURED_VIDEO_ID = "oMRKRVcMWBU";

const PLAYLISTS_URL =
  `https://www.googleapis.com/youtube/v3/playlists` +
  `?part=snippet,contentDetails` +
  `&channelId=${TV_CHANNEL_ID}` +
  `&maxResults=50` +
  `&key=${API_KEY}`;

const SEARCH_URL = (q: any, token = "") =>
  `https://www.googleapis.com/youtube/v3/search` +
  `?key=${API_KEY}&channelId=${TV_CHANNEL_ID}` +
  `&part=snippet,id&maxResults=20` +
  `&q=${encodeURIComponent(q)}` +
  (token ? `&pageToken=${token}` : "");

const safeThumbUrl = (item: any) => {
  const raw =
    item?.snippet?.thumbnails?.high?.url ||
    item?.snippet?.thumbnails?.medium?.url ||
    item?.snippet?.thumbnails?.default?.url ||
    "https://s.ytimg.com/yts/img/no_thumbnail-vfl4t3-4R.jpg";
  return raw.startsWith("http://") ? raw.replace("http://", "https://") : raw;
};

// ─── Search Modal ──────────────────────────────────────────────────────────────
const SearchModal = ({ visible, onClose, onSearch }: any) => {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState(["IITA TV", "crop science", "agronomy"]);
  const inputRef = useRef<TextInput | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 65,
          friction: 10,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => inputRef.current?.focus());
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 0],
  });

  const handleSearch = (term?: any) => {
    const q = (term ?? query).trim();
    if (!q) return;
    setRecent((prev) => [q, ...prev.filter((r) => r !== q)].slice(0, 8));
    onSearch(q);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }}
        onPress={() => {
          Keyboard.dismiss();
          onClose();
        }}
      >
        <Animated.View
          style={{
            opacity: opacityAnim,
            transform: [{ translateY }],
            backgroundColor: COLORS.surface,
            paddingTop: 52,
            paddingBottom: 12,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            shadowColor: "#000",
            shadowOpacity: 0.12,
            shadowRadius: 20,
            elevation: 20,
          }}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            {/* Search Row */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                marginBottom: 8,
                gap: 10,
              }}
            >
              <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
                <Ionicons name="arrow-back" size={24} color={COLORS.text} />
              </TouchableOpacity>
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: COLORS.surfaceElevated,
                  borderRadius: 12,
                  borderWidth: 1.5,
                  borderColor: query ? COLORS.accent : COLORS.border,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  gap: 8,
                }}
              >
                <Ionicons name="search" size={18} color={COLORS.textMuted} />
                <TextInput
                  ref={inputRef}
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search IITA TV…"
                  placeholderTextColor={COLORS.textDim}
                  style={{
                    flex: 1,
                    color: COLORS.text,
                    fontSize: 15,
                    letterSpacing: 0.2,
                  }}
                  returnKeyType="search"
                  onSubmitEditing={() => handleSearch()}
                  autoCorrect={false}
                />
                {query.length > 0 && (
                  <TouchableOpacity onPress={() => setQuery("")}>
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color={COLORS.textMuted}
                    />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity
                onPress={() => handleSearch()}
                style={{
                  backgroundColor: COLORS.accent,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{
                    color: COLORS.white,
                    fontWeight: "700",
                    fontSize: 13,
                  }}
                >
                  Go
                </Text>
              </TouchableOpacity>
            </View>

            {/* Recent */}
            {recent.length > 0 && (
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingTop: 6,
                  paddingBottom: 4,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={{
                      color: COLORS.textMuted,
                      fontSize: 12,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      fontWeight: "600",
                    }}
                  >
                    Recent
                  </Text>
                  <TouchableOpacity onPress={() => setRecent([])}>
                    <Text
                      style={{
                        color: COLORS.accent,
                        fontSize: 12,
                        fontWeight: "600",
                      }}
                    >
                      Clear all
                    </Text>
                  </TouchableOpacity>
                </View>
                {recent.map((r, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => {
                      setQuery(r);
                      handleSearch(r);
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 10,
                      gap: 12,
                    }}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        backgroundColor: COLORS.surfaceElevated,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Ionicons
                        name="time-outline"
                        size={16}
                        color={COLORS.textMuted}
                      />
                    </View>
                    <Text style={{ color: COLORS.text, fontSize: 14, flex: 1 }}>
                      {r}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setRecent(recent.filter((_, j) => j !== i))
                      }
                    >
                      <Ionicons name="close" size={16} color={COLORS.textDim} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

// ─── Featured Player ───────────────────────────────────────────────────────────
const FeaturedPlayer = () => {
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const onStateChange = useCallback((state: any) => {
    if (state === "ended") setPlaying(false);
  }, []);

  const onReady = () => {
    setReady(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View
      style={{
        marginHorizontal: H_PAD,
        marginBottom: 20,
        marginTop: 4,
        borderRadius: 18,
        overflow: "hidden",
        backgroundColor: COLORS.playerBg,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
        elevation: 8,
      }}
    >
      {/* Top bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255,255,255,0.06)",
        }}
      >
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: COLORS.accent,
          }}
        />
        <Text
          style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: 11,
            fontWeight: "700",
            letterSpacing: 1.2,
            textTransform: "uppercase",
            flex: 1,
          }}
        >
          Featured
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            backgroundColor: "rgba(255,107,53,0.15)",
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 10,
          }}
        >
          <Ionicons name="tv-outline" size={11} color={COLORS.accent} />
          <Text
            style={{
              color: COLORS.accent,
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 0.8,
            }}
          >
            IITA TV
          </Text>
        </View>
      </View>

      {/* Player */}
      <Animated.View style={{ opacity: ready ? fadeAnim : 1 }}>
        <YoutubePlayer
          height={screenWidth * 0.52}
          play={playing}
          videoId={FEATURED_VIDEO_ID}
          onChangeState={onStateChange}
          onReady={onReady}
          webViewStyle={{ opacity: 0.99 }}
        />
      </Animated.View>

      {/* Loading placeholder */}
      {!ready && (
        <View
          style={{
            position: "absolute",
            top: 40,
            left: 0,
            right: 0,
            height: screenWidth * 0.52,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: COLORS.playerBg,
          }}
        >
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: COLORS.accentSoft,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons
              name="play"
              size={24}
              color={COLORS.accent}
              style={{ marginLeft: 3 }}
            />
          </View>
        </View>
      )}
    </View>
  );
};

// ─── Playlist Card ─────────────────────────────────────────────────────────────
const PlaylistCard = ({ item, onPress, index }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay: (index % 10) * 55,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        delay: (index % 10) * 55,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onPressIn = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 200,
    }).start();
  const onPressOut = () =>
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
    }).start();

  const count = item?.contentDetails?.itemCount;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
        width: CARD_WIDTH,
      }}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={{
          backgroundColor: COLORS.surface,
          borderRadius: 14,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.07,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        {/* Thumbnail */}
        <View style={{ position: "relative" }}>
          <Image
            source={{ uri: encodeURI(safeThumbUrl(item)) }}
            style={{
              width: "100%",
              height: THUMB_HEIGHT,
              backgroundColor: COLORS.surfaceElevated,
            }}
            resizeMode="cover"
          />
          {/* Play overlay */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.25)",
            }}
          >
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: "rgba(0,0,0,0.55)",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons
                name="play"
                size={16}
                color={COLORS.white}
                style={{ marginLeft: 2 }}
              />
            </View>
          </View>

          {/* Video count badge */}
          {count != null && (
            <View
              style={{
                position: "absolute",
                bottom: 7,
                right: 8,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: COLORS.accent,
                paddingHorizontal: 7,
                paddingVertical: 3,
                borderRadius: 6,
                gap: 4,
              }}
            >
              <Ionicons name="film-outline" size={10} color={COLORS.white} />
              <Text
                style={{ color: COLORS.white, fontSize: 10, fontWeight: "700" }}
              >
                {count}
              </Text>
            </View>
          )}
        </View>

        {/* Info */}
        <View style={{ padding: 10 }}>
          <Text
            numberOfLines={2}
            style={{
              color: COLORS.text,
              fontSize: 12,
              fontWeight: "600",
              lineHeight: 17,
              letterSpacing: 0.1,
              marginBottom: 5,
            }}
          >
            {item?.snippet?.title}
          </Text>
          {item?.snippet?.channelTitle && (
            <Text
              numberOfLines={1}
              style={{
                color: COLORS.textMuted,
                fontSize: 11,
                fontWeight: "500",
              }}
            >
              {item.snippet.channelTitle}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Skeleton Card ─────────────────────────────────────────────────────────────
const SkeletonCard = ({ index }: any) => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          delay: index * 80,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: pulseAnim,
        width: CARD_WIDTH,
        backgroundColor: COLORS.surface,
        borderRadius: 14,
        overflow: "hidden",
        elevation: 2,
      }}
    >
      <View
        style={{
          width: "100%",
          height: THUMB_HEIGHT,
          backgroundColor: COLORS.surfaceElevated,
        }}
      />
      <View style={{ padding: 10, gap: 6 }}>
        <View
          style={{
            height: 12,
            borderRadius: 6,
            backgroundColor: COLORS.surfaceElevated,
            width: "90%",
          }}
        />
        <View
          style={{
            height: 12,
            borderRadius: 6,
            backgroundColor: COLORS.surfaceElevated,
            width: "65%",
          }}
        />
        <View
          style={{
            height: 10,
            borderRadius: 5,
            backgroundColor: COLORS.surfaceElevated,
            width: "40%",
            marginTop: 2,
          }}
        />
      </View>
    </Animated.View>
  );
};

// ─── Skeleton Player ───────────────────────────────────────────────────────────
const SkeletonPlayer = () => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
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
        opacity: pulseAnim,
        marginHorizontal: H_PAD,
        marginBottom: 20,
        marginTop: 4,
        height: screenWidth * 0.52 + 38,
        borderRadius: 18,
        backgroundColor: COLORS.surface,
        elevation: 3,
      }}
    />
  );
};

// ─── Header ────────────────────────────────────────────────────────────────────
const Header = ({ onBack, onSearch, searchQuery }: any) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      backgroundColor: COLORS.bg,
      gap: 12,
    }}
  >
    <TouchableOpacity
      onPress={onBack}
      style={{
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: COLORS.surface,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: COLORS.shadow,
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <Ionicons name="arrow-back" size={20} color={COLORS.text} />
    </TouchableOpacity>

    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text
          style={{
            color: COLORS.text,
            fontSize: 18,
            fontWeight: "800",
            letterSpacing: -0.3,
          }}
        >
          IITA TV
        </Text>
        <View
          style={{
            backgroundColor: COLORS.accentSoft,
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              color: COLORS.accent,
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 0.5,
            }}
          >
            LIVE
          </Text>
        </View>
      </View>
      {searchQuery ? (
        <Text
          style={{
            color: COLORS.accent,
            fontSize: 11,
            fontWeight: "600",
            letterSpacing: 0.4,
          }}
        >
          "{searchQuery}"
        </Text>
      ) : null}
    </View>

    <TouchableOpacity
      onPress={onSearch}
      style={{
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: COLORS.shadow,
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <Ionicons name="search-outline" size={19} color={COLORS.text} />
    </TouchableOpacity>
  </View>
);

// ─── Section Label ─────────────────────────────────────────────────────────────
const SectionLabel = ({ count, searchQuery }: any) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: H_PAD,
      paddingTop: 4,
      paddingBottom: 12,
      gap: 8,
    }}
  >
    <View
      style={{
        width: 3,
        height: 16,
        borderRadius: 2,
        backgroundColor: COLORS.accent,
      }}
    />
    <Text
      style={{ color: COLORS.text, fontSize: 14, fontWeight: "700", flex: 1 }}
    >
      {searchQuery ? "Search Results" : "All Playlists"}
    </Text>
    {count > 0 && (
      <View
        style={{
          backgroundColor: COLORS.accentSoft,
          paddingHorizontal: 10,
          paddingVertical: 3,
          borderRadius: 20,
        }}
      >
        <Text style={{ color: COLORS.accent, fontSize: 11, fontWeight: "700" }}>
          {count}
        </Text>
      </View>
    )}
  </View>
);

// ─── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = ({ searchQuery, onClear }: any) => (
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingBottom: 60,
      paddingTop: 20,
    }}
  >
    <View
      style={{
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: COLORS.accentSoft,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
      }}
    >
      <Ionicons name="tv-outline" size={36} color={COLORS.accent} />
    </View>
    <Text
      style={{
        color: COLORS.text,
        fontSize: 17,
        fontWeight: "700",
        marginBottom: 6,
      }}
    >
      {searchQuery ? "No Results Found" : "No Playlists Available"}
    </Text>
    <Text
      style={{
        color: COLORS.textMuted,
        fontSize: 14,
        textAlign: "center",
        paddingHorizontal: 40,
        marginBottom: 20,
      }}
    >
      {searchQuery
        ? `No playlists matched "${searchQuery}". Try a different term.`
        : "IITA TV playlists will appear here once available."}
    </Text>
    {searchQuery && (
      <TouchableOpacity
        onPress={onClear}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingHorizontal: 20,
          paddingVertical: 10,
          backgroundColor: COLORS.accent,
          borderRadius: 10,
        }}
      >
        <Ionicons name="close" size={16} color={COLORS.white} />
        <Text style={{ color: COLORS.white, fontWeight: "700", fontSize: 14 }}>
          Clear Search
        </Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─── Main Screen ───────────────────────────────────────────────────────────────
const TV = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageToken, setPageToken] = useState("");
  const [data, setData] = useState([]);

  // ── Fetch Playlists ─────────────────────────────────────────────────────────
  const fetchPlaylists = useCallback(async (append = false) => {
    if (!append) setIsLoading(true);
    else setLoadingMore(true);

    try {
      const response = await fetch(PLAYLISTS_URL);
      const json = await response.json();
      const items = json.items ?? [];
      setData((prev) => (append ? [...prev, ...items] : items));
      setPageToken(json.nextPageToken ?? "");
    } catch (error) {
      Vibration.vibrate();
      Alert.alert(
        "Connection Error",
        "Please check your internet connection and try again.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Retry", onPress: () => fetchPlaylists(append) },
        ],
        { cancelable: false }
      );
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, []);

  // ── Search ──────────────────────────────────────────────────────────────────
  const searchPlaylists = useCallback(
    async (query: any, token = "", append = false) => {
      if (!query.trim()) {
        fetchPlaylists();
        return;
      }
      if (!append) setIsLoading(true);
      else setLoadingMore(true);

      try {
        const response = await fetch(SEARCH_URL(query, token));
        const json = await response.json();
        const items = (json.items ?? []).filter(
          (v: any) => v.snippet?.title !== "Private video"
        );
        setData((prev) => (append ? [...prev, ...items] : items));
        setPageToken(json.nextPageToken ?? "");
      } catch (error) {
        Vibration.vibrate();
        Alert.alert(
          "Connection Error",
          "Please check your internet connection.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Retry",
              onPress: () => searchPlaylists(query, token, append),
            },
          ]
        );
      } finally {
        setIsLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [fetchPlaylists]
  );

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const handleSearch = (query: any) => {
    setSearchQuery(query);
    setPageToken("");
    searchPlaylists(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setPageToken("");
    fetchPlaylists();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPageToken("");
    if (searchQuery) searchPlaylists(searchQuery);
    else fetchPlaylists();
  };

  const handleLoadMore = () => {
    if (loadingMore || !pageToken) return;
    if (searchQuery) searchPlaylists(searchQuery, pageToken, true);
    else fetchPlaylists(true);
  };

  const renderFooter = () =>
    loadingMore ? (
      <View
        style={{ paddingVertical: 24, alignItems: "center", width: "100%" }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: COLORS.accent,
            }}
          />
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: COLORS.accentSoft,
            }}
          />
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: COLORS.border,
            }}
          />
        </View>
      </View>
    ) : null;

  const ListHeader = useCallback(
    () => (
      <View>
        <FeaturedPlayer />
        <SectionLabel count={data.length} searchQuery={searchQuery} />
      </View>
    ),
    [data.length, searchQuery]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <Header
        onBack={() => navigation.goBack()}
        onSearch={() => setSearchModalVisible(true)}
        searchQuery={searchQuery}
      />

      {/* Active search banner */}
      {searchQuery ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 10,
            gap: 8,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.border,
          }}
        >
          <Ionicons name="search" size={14} color={COLORS.accent} />
          <Text style={{ color: COLORS.textMuted, fontSize: 13, flex: 1 }}>
            Results for{" "}
            <Text style={{ color: COLORS.text, fontWeight: "700" }}>
              "{searchQuery}"
            </Text>
          </Text>
          <TouchableOpacity
            onPress={handleClearSearch}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor: COLORS.surfaceElevated,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 20,
            }}
          >
            <Ionicons name="close" size={12} color={COLORS.textMuted} />
            <Text style={{ color: COLORS.textMuted, fontSize: 12 }}>Clear</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {isLoading ? (
        <FlatList
          data={[...Array(8)]}
          numColumns={2}
          keyExtractor={(_, i) => `skel-${i}`}
          ListHeaderComponent={<SkeletonPlayer />}
          contentContainerStyle={{ paddingHorizontal: H_PAD }}
          columnWrapperStyle={{ gap: CARD_GAP, marginBottom: CARD_GAP }}
          renderItem={({ index }) => <SkeletonCard index={index} />}
          scrollEnabled={false}
        />
      ) : (
        <FlatList
          data={data}
          numColumns={2}
          keyExtractor={(item: any, index) => `${item?.id ?? index}-${index}`}
          contentContainerStyle={{
            paddingHorizontal: H_PAD,
            paddingBottom: 48,
            flexGrow: 1,
          }}
          columnWrapperStyle={{ gap: CARD_GAP, marginBottom: CARD_GAP }}
          ListHeaderComponent={ListHeader}
          renderItem={({ item, index }) => (
            <PlaylistCard
              item={item}
              index={index}
              onPress={() =>
                router.push({
                  pathname: "/tvplaylistitems",
                  params: {
                    id: String(item?.id ?? ""),
                    otherParam: item?.snippet?.title ?? "",
                  },
                })
              }
            />
          )}
          ListEmptyComponent={
            <EmptyState searchQuery={searchQuery} onClear={handleClearSearch} />
          }
          ListFooterComponent={renderFooter}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          initialNumToRender={16}
          showsVerticalScrollIndicator={false}
        />
      )}

      <SearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        onSearch={handleSearch}
      />
    </SafeAreaView>
  );
};

export default TV;
