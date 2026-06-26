import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import ImageView from "react-native-image-viewing";
import { SafeAreaView } from "react-native-safe-area-context";
import BackArrow from "../components/BackArrow";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const COLUMN_COUNT = 2;
const ITEM_MARGIN = 6;
const ITEM_WIDTH =
  (SCREEN_WIDTH - ITEM_MARGIN * (COLUMN_COUNT + 1) * 2) / COLUMN_COUNT;

// ─── Design Tokens ───────────────────────────────────────────────────────────
const COLORS = {
  bg: "rgb(242, 242, 242)",
  surface: "#FFFFFF",
  surfaceElevated: "#F5F5F5",
  border: "#E8E8E8",
  accent: "#FF6B35",
  accentSoft: "rgba(255,107,53,0.10)",
  accentGlow: "rgba(255,107,53,0.18)",
  text: "#1A1A1A",
  textMuted: "#888899",
  textDim: "#BBBBCC",
  white: "#FFFFFF",
  shadow: "rgba(0,0,0,0.07)",
  playerBg: "#0F0F0F",
};

// ─── Skeleton Loader ─────────────────────────────────────────────────────────
const SkeletonItem = ({ delay = 0 }) => {
  const anim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 800,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.skeletonItem,
        {
          opacity: anim,
          width: ITEM_WIDTH,
          height: ITEM_WIDTH * 1.1,
        },
      ]}
    />
  );
};

const SkeletonGrid = () => (
  <View style={styles.skeletonGrid}>
    {Array.from({ length: 8 }).map((_, i) => (
      <SkeletonItem key={i} delay={i * 80} />
    ))}
  </View>
);

// ─── Photo Card ───────────────────────────────────────────────────────────────
const PhotoCard = ({ item, index, onPress }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const entryAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(entryAnim, {
      toValue: 1,
      delay: (index % 6) * 60,
      tension: 80,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      tension: 200,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 200,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const uri = item?.url_m
    ? encodeURI(
        item.url_m.startsWith("http://")
          ? item.url_m.replace("http://", "https://")
          : item.url_m
      )
    : "https://s.ytimg.com/yts/img/no_thumbnail-vfl4t3-4R.jpg";

  return (
    <Animated.View
      style={{
        opacity: entryAnim,
        transform: [
          { scale: scaleAnim },
          {
            translateY: entryAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [24, 0],
            }),
          },
        ],
        margin: ITEM_MARGIN,
        flex: 1,
      }}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => onPress(item, index)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.card}
      >
        <Image source={{ uri }} style={styles.cardImage} resizeMode="cover" />
        {/* Inner border shimmer */}
        <View style={styles.cardInnerBorder} />

        {/* Views badge */}
        {item?.views ? (
          <View style={styles.viewsBadge}>
            <Text style={styles.viewsText}>
              {Number(item.views) > 999
                ? `${(Number(item.views) / 1000).toFixed(1)}k`
                : item.views}{" "}
              👁
            </Text>
          </View>
        ) : null}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Header ───────────────────────────────────────────────────────────────────
const Header = ({ title, count, onBack }: any) => {
  const router = useRouter();
  return (
    <View style={styles.header}>
      <TouchableOpacity
        // onPress={()=> router.back()}
        onPress={onBack}
        style={styles.backBtn}
        activeOpacity={0.7}
      >
        <View style={styles.backIcon}>
          <BackArrow color={"#000"} />
        </View>
      </TouchableOpacity>

      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title || "Photos"}
        </Text>
        {count > 0 && (
          <View style={styles.countPill}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        )}
      </View>

      <View style={styles.accentDot} />
    </View>
  );
};

// ─── Footer Loader ────────────────────────────────────────────────────────────
const FooterLoader = ({ visible }: any) => {
  if (!visible) return null;
  return (
    <View style={styles.footerLoader}>
      <ActivityIndicator color={COLORS.accent} size="small" />
      <Text style={styles.footerLoaderText}>Loading more…</Text>
    </View>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = () => (
  <View style={styles.emptyState}>
    <View style={styles.emptyIconWrap}>
      <Text style={styles.emptyIcon}>🖼️</Text>
    </View>
    <Text style={styles.emptyTitle}>No Photos Yet</Text>
    <Text style={styles.emptySubtitle}>
      This album appears to be empty right now.
    </Text>
  </View>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Photos = () => {
  const navigation = useNavigation();
  const { id: itemId, title } = useLocalSearchParams();

  console.log(title);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState([]);
  const [responseData, setResponseData] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [isImageViewVisible, setIsImageViewVisible] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;

  const fetchPhotos = (currentPage = page) => {
    if (currentPage === 1) setIsLoading(true);

    fetch(
      `https://www.flickr.com/services/rest/?method=flickr.photosets.getPhotos&api_key=f150eb83ccc18bfae28b269e0d2f6e0f&photoset_id=${itemId}&user_id=45796762@N03&extras=date_upload,date_taken,last_update,geo,tags,views,media,url_m,url_l,url_o&per_page=30&format=json&nojsoncallback=1&page=${currentPage}`
    )
      .then((r) => r.json())
      .then((json) => {
        const photos = json?.photoset?.photo ?? [];
        setData((prev) => (currentPage === 1 ? photos : [...prev, ...photos]));
        setResponseData(photos.length);
        setIsLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      })
      .catch(() => {
        setIsLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
        Alert.alert(
          "Connection Error",
          "Please check your internet connection and try again.",
          [
            {
              text: "Cancel",
              onPress: () => navigation.goBack(),
              style: "cancel",
            },
            { text: "Retry", onPress: () => fetchPhotos(currentPage) },
          ],
          { cancelable: false }
        );
        Vibration.vibrate();
      });
  };

  const handleRefresh = () => {
    setPage(1);
    setRefreshing(true);
    fetchPhotos(1);
  };

  const handleLoadMore = () => {
    if (responseData === 30 && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      setLoadingMore(true);
      fetchPhotos(nextPage);
    }
  };

  const handleViewImage = (item: any, index: number) => {
    setImageIndex(index);
    setIsImageViewVisible(true);
  };

  useEffect(() => {
    fetchPhotos(1);
  }, []);

  const headerShadowOpacity = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const images = data.map((img: any) => ({
    uri: encodeURI(
      img.url_m?.startsWith("http://")
        ? img.url_m.replace("http://", "https://")
        : img.url_m || ""
    ),
  }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* Scroll-reactive header shadow */}
      <Animated.View
        pointerEvents="none"
        style={[styles.headerShadow, { opacity: headerShadowOpacity }]}
      />

      <Header
        title={title}
        count={data.length}
        onBack={() => navigation.goBack()}
      />

      {isLoading ? (
        <SkeletonGrid />
      ) : (
        <Animated.FlatList
          numColumns={COLUMN_COUNT}
          data={data}
          keyExtractor={(item: any, i: number) => `${item.id}-${i}`}
          renderItem={({ item, index }) => (
            <PhotoCard item={item} index={index} onPress={handleViewImage} />
          )}
          ListEmptyComponent={<EmptyState />}
          ListFooterComponent={<FooterLoader visible={loadingMore} />}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          windowSize={5}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
        />
      )}

      {isImageViewVisible && (
        <ImageView
          images={images}
          imageIndex={imageIndex}
          animationType="fade"
          visible={isImageViewVisible}
          onRequestClose={() => setIsImageViewVisible(false)}
          swipeToCloseEnabled
          doubleTapToZoomEnabled
        />
      )}
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // Header shadow overlay
  headerShadow: {
    position: "absolute",
    top: Platform.select({ ios: 88, android: 56 }),
    left: 0,
    right: 0,
    height: 12,
    zIndex: 5,
    // Simulated gradient shadow via layered Views isn't possible in RN;
    // elevation handles it on Android, shadowColor on iOS via the header itself
  },

  // ── Header ──
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 10,
  },
  backBtn: {},
  backIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    // Android
    elevation: 2,
  },
  backArrow: {
    fontSize: 28,
    lineHeight: 34,
    color: COLORS.text,
    fontWeight: "300",
    marginLeft: -1,
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.4,
    flexShrink: 1,
  },
  countPill: {
    backgroundColor: COLORS.accentSoft,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  countText: {
    fontSize: 11,
    color: COLORS.accent,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  accentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },

  // ── Grid ──
  listContent: {
    paddingHorizontal: ITEM_MARGIN,
    paddingTop: ITEM_MARGIN,
    paddingBottom: 48,
    flexGrow: 1,
  },

  // ── Card ──
  card: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: COLORS.surfaceElevated,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  cardImage: {
    width: "100%",
    height: ITEM_WIDTH * 1.15,
  },
  cardInnerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  viewsBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(15,15,15,0.55)",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  viewsText: {
    fontSize: 10,
    color: "#FFF",
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  // ── Skeleton ──
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: ITEM_MARGIN,
    paddingTop: ITEM_MARGIN,
  },
  skeletonItem: {
    backgroundColor: COLORS.border,
    borderRadius: 14,
    margin: ITEM_MARGIN,
  },

  // ── Footer loader ──
  footerLoader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 8,
  },
  footerLoaderText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: "500",
  },

  // ── Empty state ──
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 21,
  },
});

export default Photos;
