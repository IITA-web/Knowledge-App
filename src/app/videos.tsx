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
};

// ─── Constants ─────────────────────────────────────────────────────────────────
const CARD_GAP = 12;
const HORIZONTAL_PADDING = 16;
const CARD_WIDTH = (screenWidth - HORIZONTAL_PADDING * 2 - CARD_GAP) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.55;
const THUMB_HEIGHT = CARD_WIDTH * 0.58;

const API_KEY = "AIzaSyAi5WzxpF2E6wmz-e1yu2nAg9lQWEM43Zg";
const PLAYLIST_ID = "UUWOAtXUd8F-MCx2-AfBE_8A";
const CHANNEL_ID = "UCWOAtXUd8F-MCx2-AfBE_8A";

const PLAYLIST_URL = (pageToken = "") =>
  `https://www.googleapis.com/youtube/v3/playlistItems?key=${API_KEY}&playlistId=${PLAYLIST_ID}&part=snippet,id&maxResults=50${
    pageToken ? `&pageToken=${pageToken}` : ""
  }`;

const SEARCH_URL = (query: any, pageToken = "") =>
  `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&maxResults=20&q=${encodeURIComponent(
    query
  )}${pageToken ? `&pageToken=${pageToken}` : ""}`;

const isPrivateOrDeleted = (title: any) =>
  title === "Private video" || title === "Deleted video";

// ─── Recent Searches ───────────────────────────────────────────────────────────
const INITIAL_RECENT = ["crop research", "soil health", "IITA"];

// ─── Search Modal ──────────────────────────────────────────────────────────────
const SearchModal = ({ visible, onClose, onSearch }: any) => {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState(INITIAL_RECENT);
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

  const handleSearch = (term?: string) => {
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
                  placeholder="Search videos…"
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

            {/* Recent Searches */}
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

// ─── Video Card ────────────────────────────────────────────────────────────────
const VideoCard = ({ item, onPress, index }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        delay: (index % 10) * 50,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        delay: (index % 10) * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 200,
    }).start();
  const handlePressOut = () =>
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
    }).start();

  // Support both playlistItems (snippet.resourceId.videoId) and search results (id.videoId)
  const snippet = item.snippet ?? {};
  const thumb =
    snippet.thumbnails?.high?.url ||
    snippet.thumbnails?.medium?.url ||
    snippet.thumbnails?.default?.url ||
    "https://s.ytimg.com/yts/img/no_thumbnail-vfl4t3-4R.jpg";

  const safeThumb = thumb.startsWith("http://")
    ? thumb.replace("http://", "https://")
    : thumb;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
      }}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          width: CARD_WIDTH,
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
            source={{ uri: encodeURI(safeThumb) }}
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
              inset: 0,
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
          {/* Duration-style accent dot */}
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
              gap: 3,
            }}
          >
            <Ionicons name="videocam" size={10} color={COLORS.white} />
          </View>
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
            }}
          >
            {snippet.title}
          </Text>
          {snippet.videoOwnerChannelTitle && (
            <Text
              numberOfLines={1}
              style={{
                color: COLORS.textMuted,
                fontSize: 11,
                marginTop: 5,
                fontWeight: "500",
              }}
            >
              {snippet.videoOwnerChannelTitle}
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
            width: "45%",
            marginTop: 2,
          }}
        />
      </View>
    </Animated.View>
  );
};

// ─── Header ────────────────────────────────────────────────────────────────────
const Header = ({ onBack, onSearch, searchQuery, onClearSearch }: any) => (
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
      <Text
        style={{
          color: COLORS.text,
          fontSize: 18,
          fontWeight: "800",
          letterSpacing: -0.3,
        }}
      >
        Videos
      </Text>
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

// ─── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = ({ searchQuery, onClear }: any) => (
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingBottom: 60,
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
      <Ionicons name="videocam-outline" size={36} color={COLORS.accent} />
    </View>
    <Text
      style={{
        color: COLORS.text,
        fontSize: 17,
        fontWeight: "700",
        marginBottom: 6,
      }}
    >
      {searchQuery ? "No Results Found" : "No Videos Available"}
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
        ? `No videos matched "${searchQuery}". Try a different search term.`
        : "Videos will appear here once they are available."}
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
const Videos = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageToken, setPageToken] = useState("");
  const [data, setData] = useState([]);

  // ── Fetch playlist ──────────────────────────────────────────────────────────
  const fetchVideos = useCallback(async (token = "", append = false) => {
    if (!append) setIsLoading(true);
    else setLoadingMore(true);

    try {
      const response = await fetch(PLAYLIST_URL(token));
      const json = await response.json();
      const items = (json.items ?? []).filter(
        (v: any) => !isPrivateOrDeleted(v.snippet?.title ?? "")
      );
      setData((prev) => (append ? [...prev, ...items] : items));
      setPageToken(json.nextPageToken ?? "");
    } catch (error) {
      Vibration.vibrate();
      Alert.alert(
        "Connection Error",
        "Please check your internet connection and try again.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Retry", onPress: () => fetchVideos(token, append) },
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
  const searchVideos = useCallback(
    async (query: any, token = "", append = false) => {
      if (!query.trim()) {
        fetchVideos();
        return;
      }
      if (!append) setIsLoading(true);
      else setLoadingMore(true);

      try {
        const response = await fetch(SEARCH_URL(query, token));
        const json = await response.json();
        const items = (json.items ?? []).filter(
          (v: any) => !isPrivateOrDeleted(v.snippet?.title ?? "")
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
              onPress: () => searchVideos(query, token, append),
            },
          ]
        );
      } finally {
        setIsLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [fetchVideos]
  );

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPageToken("");
    searchVideos(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setPageToken("");
    fetchVideos();
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPageToken("");
    if (searchQuery) searchVideos(searchQuery);
    else fetchVideos();
  };

  const handleLoadMore = () => {
    if (loadingMore || !pageToken) return;
    if (searchQuery) searchVideos(searchQuery, pageToken, true);
    else fetchVideos(pageToken, true);
  };

  const getVideoId = (item: any) =>
    item?.snippet?.resourceId?.videoId ?? item?.id?.videoId ?? "";

  // ── Render ──────────────────────────────────────────────────────────────────
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <Header
        onBack={() => navigation.goBack()}
        onSearch={() => setSearchModalVisible(true)}
        searchQuery={searchQuery}
        onClearSearch={handleClearSearch}
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
          contentContainerStyle={{ padding: HORIZONTAL_PADDING, gap: CARD_GAP }}
          columnWrapperStyle={{ gap: CARD_GAP, marginBottom: CARD_GAP }}
          renderItem={({ index }) => <SkeletonCard index={index} />}
          scrollEnabled={false}
        />
      ) : (
        <FlatList
          data={data}
          numColumns={2}
          keyExtractor={(item, index) => `${getVideoId(item)}-${index}`}
          contentContainerStyle={{
            padding: HORIZONTAL_PADDING,
            paddingBottom: 48,
            flexGrow: 1,
          }}
          columnWrapperStyle={{ gap: CARD_GAP, marginBottom: CARD_GAP }}
          renderItem={({ item, index }: any) => (
            <VideoCard
              item={item}
              index={index}
              onPress={() =>
                router.push({
                  pathname: "/videoplay",
                  params: {
                    id: getVideoId(item),
                    otherParam: item.snippet?.title,
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
          initialNumToRender={20}
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

export default Videos;
