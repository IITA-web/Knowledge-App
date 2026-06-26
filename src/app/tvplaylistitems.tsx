import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Image,
  StatusBar,
  Text,
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
  text: "#1A1A1A",
  textMuted: "#888899",
  textDim: "#BBBBCC",
  white: "#FFFFFF",
  shadow: "rgba(0,0,0,0.07)",
};

// ─── Constants ─────────────────────────────────────────────────────────────────
const CARD_GAP = 12;
const H_PAD = 16;
const CARD_WIDTH = (screenWidth - H_PAD * 2 - CARD_GAP) / 2;
const THUMB_HEIGHT = CARD_WIDTH * 0.62;

const API_KEY = "AIzaSyAi5WzxpF2E6wmz-e1yu2nAg9lQWEM43Zg";

const PLAYLIST_ITEMS_URL = (playlistId: any, pageToken = "") =>
  `https://www.googleapis.com/youtube/v3/playlistItems` +
  `?key=${API_KEY}&part=snippet,id` +
  `&playlistId=${playlistId}&maxResults=20` +
  (pageToken ? `&pageToken=${pageToken}` : "");

const safeThumbUrl = (item: any) => {
  const raw =
    item?.snippet?.thumbnails?.high?.url ||
    item?.snippet?.thumbnails?.medium?.url ||
    item?.snippet?.thumbnails?.default?.url ||
    "https://s.ytimg.com/yts/img/no_thumbnail-vfl4t3-4R.jpg";
  return raw.startsWith("http://") ? raw.replace("http://", "https://") : raw;
};

const isPrivateOrDeleted = (title = "") =>
  title === "Private video" || title === "Deleted video";

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

  const position = item?.snippet?.position;

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
              backgroundColor: "rgba(0,0,0,0.22)",
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

          {/* Position badge */}
          {position != null && (
            <View
              style={{
                position: "absolute",
                bottom: 7,
                right: 8,
                backgroundColor: COLORS.accent,
                paddingHorizontal: 7,
                paddingVertical: 3,
                borderRadius: 6,
              }}
            >
              <Text
                style={{ color: COLORS.white, fontSize: 10, fontWeight: "700" }}
              >
                #{position + 1}
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
          {item?.snippet?.videoOwnerChannelTitle && (
            <Text
              numberOfLines={1}
              style={{
                color: COLORS.textMuted,
                fontSize: 11,
                fontWeight: "500",
              }}
            >
              {item.snippet.videoOwnerChannelTitle}
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

// ─── Header ────────────────────────────────────────────────────────────────────
const Header = ({ title, onBack, count }: any) => (
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
        numberOfLines={1}
        style={{
          color: COLORS.text,
          fontSize: 17,
          fontWeight: "800",
          letterSpacing: -0.3,
        }}
      >
        {title || "Playlist"}
      </Text>
      {count > 0 && (
        <Text
          style={{
            color: COLORS.accent,
            fontSize: 11,
            fontWeight: "600",
            letterSpacing: 0.4,
            marginTop: 1,
          }}
        >
          {count} {count === 1 ? "video" : "videos"}
        </Text>
      )}
    </View>

    {/* IITA TV badge */}
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: COLORS.accentSoft,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
      }}
    >
      <Ionicons name="tv-outline" size={13} color={COLORS.accent} />
      <Text
        style={{
          color: COLORS.accent,
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 0.4,
        }}
      >
        IITA TV
      </Text>
    </View>
  </View>
);

// ─── Section Label ─────────────────────────────────────────────────────────────
const SectionLabel = ({ count }: any) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: H_PAD,
      paddingTop: 16,
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
      Videos
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
const EmptyState = () => (
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingBottom: 80,
      paddingTop: 40,
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
      No Videos Found
    </Text>
    <Text
      style={{
        color: COLORS.textMuted,
        fontSize: 14,
        textAlign: "center",
        paddingHorizontal: 40,
      }}
    >
      This playlist doesn't have any public videos yet.
    </Text>
  </View>
);

// ─── Main Screen ───────────────────────────────────────────────────────────────
const Tvplaylistitems = () => {
  const navigation = useNavigation();
  const { id: itemId, otherParam } = useLocalSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pageToken, setPageToken] = useState("");
  const [data, setData] = useState([]);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchVideos = useCallback(
    async (token = "", append = false) => {
      if (!append) setIsLoading(true);
      else setLoadingMore(true);

      try {
        const response = await fetch(PLAYLIST_ITEMS_URL(itemId, token));
        const json = await response.json();
        const items = (json.items ?? []).filter(
          (v: any) => !isPrivateOrDeleted(v.snippet?.title)
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
    },
    [itemId]
  );

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setPageToken("");
    fetchVideos();
  };

  const handleLoadMore = () => {
    if (loadingMore || !pageToken) return;
    fetchVideos(pageToken, true);
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <Header
        title={otherParam}
        onBack={() => navigation.goBack()}
        count={data.length}
      />

      {isLoading ? (
        <FlatList
          data={[...Array(8)]}
          numColumns={2}
          keyExtractor={(_, i) => `skel-${i}`}
          ListHeaderComponent={<SectionLabel count={0} />}
          contentContainerStyle={{ paddingHorizontal: H_PAD }}
          columnWrapperStyle={{ gap: CARD_GAP, marginBottom: CARD_GAP }}
          renderItem={({ index }) => <SkeletonCard index={index} />}
          scrollEnabled={false}
        />
      ) : (
        <FlatList
          data={data}
          numColumns={2}
          keyExtractor={(item: any, index: number) =>
            `${item?.snippet?.resourceId?.videoId ?? index}-${index}`
          }
          contentContainerStyle={{
            paddingHorizontal: H_PAD,
            paddingBottom: 48,
            flexGrow: 1,
          }}
          columnWrapperStyle={{ gap: CARD_GAP, marginBottom: CARD_GAP }}
          ListHeaderComponent={<SectionLabel count={data.length} />}
          renderItem={({ item, index }: any) => (
            <VideoCard
              item={item}
              index={index}
              onPress={() =>
                router.push({
                  pathname: "/videoplay",
                  params: {
                    id: String(item?.snippet?.resourceId?.videoId ?? ""),
                    otherParam: item?.snippet?.title ?? "",
                  },
                })
              }
            />
          )}
          ListEmptyComponent={<EmptyState />}
          ListFooterComponent={renderFooter}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          initialNumToRender={20}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default Tvplaylistitems;
