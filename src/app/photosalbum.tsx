import { useLanguage } from "@/context/LanguageContext";
import i18n from "@/i18n";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  Keyboard,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import LoadingSpinner from "../components/LoadingSpinner";

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

// Sort option keys — labels resolved via i18n at render time
const SORT_OPTION_KEYS = [
  { key: "default", labelKey: "photoAlbum.sort.default", icon: "grid-outline" },
  { key: "az", labelKey: "photoAlbum.sort.az", icon: "text-outline" },
  { key: "za", labelKey: "photoAlbum.sort.za", icon: "text-outline" },
  {
    key: "most",
    labelKey: "photoAlbum.sort.mostPhotos",
    icon: "images-outline",
  },
  {
    key: "least",
    labelKey: "photoAlbum.sort.leastPhotos",
    icon: "image-outline",
  },
];

const RECENT_SEED = ["Landscapes", "Portraits", "Architecture", "Wildlife"];

// ─── Search Modal ──────────────────────────────────────────────────────────────
const SearchModal = ({ visible, onClose, onSearch, currentTerm }: any) => {
  const { language } = useLanguage();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput | null>(null);
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const [localTerm, setLocalTerm] = useState(currentTerm || "");
  const [recents, setRecents] = useState(RECENT_SEED);
  const [suggestions, setSuggestions] = useState<any>([]);

  useEffect(() => {
    if (localTerm.length > 1) {
      setSuggestions(
        recents
          .filter((r) => r.toLowerCase().includes(localTerm.toLowerCase()))
          .slice(0, 4)
      );
    } else {
      setSuggestions([]);
    }
  }, [localTerm]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      setTimeout(() => inputRef?.current?.focus(), 150);
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -60,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
      setLocalTerm("");
      setSuggestions([]);
    }
  }, [visible]);

  const submitSearch = (term?: any) => {
    const t = (term || localTerm).trim();
    if (!t) return;
    if (!recents.includes(t)) setRecents((p) => [t, ...p].slice(0, 6));
    onSearch(t);
    onClose();
    Keyboard.dismiss();
  };

  const clearRecent = (item: any) =>
    setRecents((p) => p.filter((r) => r !== item));

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.modalBackdrop, { opacity: opacityAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <Animated.View
          style={[
            styles.searchSheet,
            {
              paddingTop: insets.top + 8,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Search Bar Row */}
          <View style={styles.searchRow}>
            <TouchableOpacity onPress={onClose} style={styles.searchBackBtn}>
              <Ionicons name="arrow-back" size={22} color={COLORS.text} />
            </TouchableOpacity>

            <View style={styles.searchInputWrap}>
              <Ionicons
                name="search"
                size={18}
                color={COLORS.accent}
                style={{ marginRight: 8 }}
              />
              <TextInput
                ref={inputRef}
                style={styles.searchInput}
                placeholder={
                  language
                    ? i18n.t("photoAlbum.searchPlaceholder")
                    : "Search albums…"
                }
                placeholderTextColor={COLORS.textDim}
                value={localTerm}
                onChangeText={setLocalTerm}
                onSubmitEditing={() => submitSearch()}
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="none"
              />
              {localTerm.length > 0 && (
                <TouchableOpacity
                  onPress={() => setLocalTerm("")}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={COLORS.textDim}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.searchDivider} />

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <View style={styles.suggestionSection}>
              {suggestions.map((s: any) => (
                <TouchableOpacity
                  key={s}
                  style={styles.suggestionRow}
                  onPress={() => submitSearch(s)}
                >
                  <Ionicons
                    name="search-outline"
                    size={16}
                    color={COLORS.textMuted}
                    style={{ marginRight: 12 }}
                  />
                  <Text style={styles.suggestionText}>
                    {s
                      .split(new RegExp(`(${localTerm})`, "i"))
                      .map((part: any, i: number) =>
                        part.toLowerCase() === localTerm.toLowerCase() ? (
                          <Text key={i} style={styles.suggestionHighlight}>
                            {part}
                          </Text>
                        ) : (
                          <Text key={i}>{part}</Text>
                        )
                      )}
                  </Text>
                  <Ionicons
                    name="arrow-back-outline"
                    size={14}
                    color={COLORS.textDim}
                    style={{ marginLeft: "auto" }}
                  />
                </TouchableOpacity>
              ))}
              <View style={styles.searchDivider} />
            </View>
          )}

          {/* Search for X row */}
          {localTerm.length > 1 && suggestions.length === 0 && (
            <TouchableOpacity
              style={styles.searchDirectRow}
              onPress={() => submitSearch()}
            >
              <Ionicons
                name="search"
                size={16}
                color={COLORS.accent}
                style={{ marginRight: 12 }}
              />
              <Text style={styles.searchDirectText}>
                {language ? i18n.t("photoAlbum.searchFor") : "Search for"} "
                <Text style={{ color: COLORS.accent }}>{localTerm}</Text>"
              </Text>
            </TouchableOpacity>
          )}

          {/* Recent searches */}
          {recents.length > 0 && localTerm.length === 0 && (
            <View style={styles.recentSection}>
              <View style={styles.recentHeader}>
                <Text style={styles.recentTitle}>
                  {language ? i18n.t("photoAlbum.recent") : "Recent"}
                </Text>
                <TouchableOpacity onPress={() => setRecents([])}>
                  <Text style={styles.clearAllText}>
                    {language ? i18n.t("photoAlbum.clearAll") : "Clear all"}
                  </Text>
                </TouchableOpacity>
              </View>
              {recents.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={styles.recentRow}
                  onPress={() => submitSearch(r)}
                >
                  <View style={styles.recentIconWrap}>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={COLORS.textMuted}
                    />
                  </View>
                  <Text style={styles.recentText}>{r}</Text>
                  <TouchableOpacity
                    onPress={() => clearRecent(r)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={{ marginLeft: "auto" }}
                  >
                    <Ionicons name="close" size={16} color={COLORS.textDim} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ─── Sort Sheet ────────────────────────────────────────────────────────────────
const SortSheet = ({ visible, onClose, activeSort, onSelect }: any) => {
  const { language } = useLanguage();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : 300,
      useNativeDriver: true,
      damping: 22,
      stiffness: 220,
    }).start();
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          style={[
            styles.sortSheet,
            {
              paddingBottom: insets.bottom + 16,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>
            {language ? i18n.t("photoAlbum.sortAlbums") : "Sort Albums"}
          </Text>
          {SORT_OPTION_KEYS.map((opt) => {
            const isActive = activeSort === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[styles.sortOption, isActive && styles.sortOptionActive]}
                onPress={() => {
                  onSelect(opt.key);
                  onClose();
                }}
              >
                <View
                  style={[
                    styles.sortIconWrap,
                    isActive && styles.sortIconWrapActive,
                  ]}
                >
                  <Ionicons
                    name={opt.icon as any}
                    size={18}
                    color={isActive ? COLORS.white : COLORS.textMuted}
                  />
                </View>
                <Text
                  style={[styles.sortLabel, isActive && styles.sortLabelActive]}
                >
                  {language ? i18n.t(opt.labelKey) : opt.key}
                </Text>
                {isActive && (
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color={COLORS.accent}
                    style={{ marginLeft: "auto" }}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </View>
    </Modal>
  );
};

// ─── Album Card ────────────────────────────────────────────────────────────────
const AlbumCard = ({ item, onPress, index }: any) => {
  const { language } = useLanguage();
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

  const rawUrl = item?.primary_photo_extras?.url_m || item?.url_m;
  const imageUri = rawUrl
    ? encodeURI(
        rawUrl.startsWith("http://")
          ? rawUrl.replace("http://", "https://")
          : rawUrl
      )
    : "https://s.ytimg.com/yts/img/no_thumbnail-vfl4t3-4R.jpg";
  const albumTitle =
    item?.title?._content ||
    item?.title ||
    (language ? i18n.t("photoAlbum.untitled") : "Untitled");
  const photoCount = item?.count_photos ?? 0;
  const photoLabel =
    photoCount === 1
      ? `1 ${language ? i18n.t("photoAlbum.photo") : "photo"}`
      : `${photoCount} ${language ? i18n.t("photoAlbum.photos") : "photos"}`;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
        marginBottom: 10,
      }}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => onPress(item)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={styles.card}
      >
        <View style={styles.thumbnailWrap}>
          <Image
            source={{ uri: imageUri }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
          <View style={styles.thumbnailGradient} />
          <View style={styles.countBadge}>
            <Ionicons name="images-outline" size={11} color={COLORS.white} />
            <Text style={styles.countBadgeText}>{photoCount}</Text>
          </View>
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
            {item?.title?._content || item?.title}
          </Text>
          <View style={styles.cardMeta}>
            <View style={styles.cardMetaDot} />
            <Text style={styles.cardMetaText}>{photoLabel}</Text>
          </View>
        </View>

        <View style={styles.cardArrow}>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textDim} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Top Bar ───────────────────────────────────────────────────────────────────
const TopBar = ({
  albumCount,
  searchTerm,
  onSearchOpen,
  onClearSearch,
  onSortOpen,
  activeSort,
  onBack,
}: any) => {
  const { language } = useLanguage();
  const albumLabel =
    albumCount === 1
      ? `1 ${language ? i18n.t("photoAlbum.album") : "album"}`
      : `${albumCount} ${language ? i18n.t("photoAlbum.albums") : "albums"}`;

  return (
    <View style={styles.topBar}>
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

      <View>
        <Text style={styles.topBarTitle}>
          {language ? i18n.t("photoAlbum.screenTitle") : "Photo Gallery"}
        </Text>
        {searchTerm ? (
          <TouchableOpacity
            style={styles.activeSearchChip}
            onPress={onClearSearch}
          >
            <Text style={styles.activeSearchChipText}>"{searchTerm}"</Text>
            <Ionicons name="close" size={13} color={COLORS.accent} />
          </TouchableOpacity>
        ) : (
          <Text style={styles.topBarSub}>{albumLabel}</Text>
        )}
      </View>

      <View style={styles.topBarActions}>
        <TouchableOpacity
          style={[
            styles.iconBtn,
            activeSort !== "default" && styles.iconBtnActive,
          ]}
          onPress={onSortOpen}
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={activeSort !== "default" ? COLORS.accent : COLORS.text}
          />
          {activeSort !== "default" && <View style={styles.iconBtnDot} />}
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={onSearchOpen}>
          <Ionicons name="search-outline" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = ({ searchTerm, onClear }: any) => {
  const { language } = useLanguage();
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIcon}>
        <Ionicons name="images-outline" size={36} color={COLORS.textDim} />
      </View>
      <Text style={styles.emptyTitle}>
        {searchTerm
          ? language
            ? i18n.t("photoAlbum.noResultsTitle")
            : "No results found"
          : language
          ? i18n.t("photoAlbum.noAlbumsTitle")
          : "No albums yet"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchTerm
          ? `${
              language ? i18n.t("photoAlbum.noResultsBody") : "Nothing matched"
            } "${searchTerm}"`
          : language
          ? i18n.t("photoAlbum.pullToRefresh")
          : "Pull down to refresh"}
      </Text>
      {searchTerm ? (
        <TouchableOpacity style={styles.emptyBtn} onPress={onClear}>
          <Text style={styles.emptyBtnText}>
            {language ? i18n.t("photoAlbum.clearSearch") : "Clear search"}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

// ─── Footer ────────────────────────────────────────────────────────────────────
const Footer = ({ loadingMore }: any) => {
  const { language } = useLanguage();
  if (!loadingMore) return <View style={{ height: 32 }} />;
  return (
    <View style={styles.footerLoader}>
      <ActivityIndicator color={COLORS.accent} size="small" />
      <Text style={styles.footerLoaderText}>
        {language ? i18n.t("photoAlbum.loadingMore") : "Loading more…"}
      </Text>
    </View>
  );
};

// ─── Sorting helper ────────────────────────────────────────────────────────────
const sortData = (data: any, key: any) => {
  const arr = [...(data || [])];
  switch (key) {
    case "az":
      return arr.sort((a, b) =>
        (a?.title?._content || a?.title || "").localeCompare(
          b?.title?._content || b?.title || ""
        )
      );
    case "za":
      return arr.sort((a, b) =>
        (b?.title?._content || b?.title || "").localeCompare(
          a?.title?._content || a?.title || ""
        )
      );
    case "most":
      return arr.sort(
        (a, b) => (b?.count_photos ?? 0) - (a?.count_photos ?? 0)
      );
    case "least":
      return arr.sort(
        (a, b) => (a?.count_photos ?? 0) - (b?.count_photos ?? 0)
      );
    default:
      return arr;
  }
};

// ─── Main Screen ───────────────────────────────────────────────────────────────
const PhotosAlbum = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any>([]);
  const [responseData, setResponseData] = useState(0);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [sortSheetVisible, setSortSheetVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [activeSort, setActiveSort] = useState("default");

  const fetchPhotos = useCallback(() => {
    fetch(
      `https://www.flickr.com/services/rest/?method=flickr.photosets.getList&api_key=f150eb83ccc18bfae28b269e0d2f6e0f&user_id=45796762%40N03&per_page=30&primary_photo_extras=url_m&format=json&nojsoncallback=1&page=${page}`
    )
      .then((r) => r.json())
      .then((json) => {
        const photos = json["photosets"]["photoset"];

        const count = Object.keys(photos).length;
        if (count > 0) {
          setData((prev: any) =>
            page === 1 ? Array.from(photos) : [...prev, ...photos]
          );
          setResponseData(count);
        }
        setIsLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      })
      .catch(() => {
        setIsLoading(false);
        Alert.alert(
          i18n.t("photoAlbum.connectionError"),
          i18n.t("photoAlbum.checkConnection"),
          [
            {
              text: i18n.t("photoAlbum.cancel"),
              onPress: () => router.push("/"),
              style: "cancel",
            },
            { text: i18n.t("photoAlbum.retry"), onPress: fetchPhotos },
          ],
          { cancelable: false }
        );
        Vibration.vibrate();
      });
  }, [page]);

  const searchPhotos = useCallback((term: any) => {
    setIsLoading(true);
    fetch(
      `https://www.flickr.com/services/rest?method=flickr.photos.search&api_key=f150eb83ccc18bfae28b269e0d2f6e0f&user_id=45796762%40N03&text=${term}&extras=date_upload,date_taken,last_update,geo,tags,views,media,url_m,url_l,url_o&per_page=30&format=json&nojsoncallback=1&page=1`
    )
      .then((r) => r.json())
      .then((json) => {
        const photos = json["photos"]["photo"];
        setData(Array.isArray(photos) ? photos : []);
        setSearchActive(true);
        setIsLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      })
      .catch(() => {
        setIsLoading(false);
        Vibration.vibrate();
      });
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [page]);

  const handleSearch = (term: any) => {
    setSearchTerm(term);
    searchPhotos(term);
  };
  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchActive(false);
    setPage(1);
    fetchPhotos();
  };
  const handleRefresh = () => {
    if (searchActive) return;
    setPage(1);
    setRefreshing(true);
    fetchPhotos();
  };
  const handleLoadMore = () => {
    if (responseData === 30 && !searchActive) {
      setPage((p) => p + 1);
      setLoadingMore(true);
    }
  };
  const handleAlbumPress = (item: any) => {
    router.push({
      pathname: "/photos",
      params: { id: item.id, title: item?.title?._content || item?.title },
    });
  };

  const displayData = sortData(data, activeSort);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <TopBar
        albumCount={data.length}
        searchTerm={searchTerm}
        onSearchOpen={() => setSearchModalVisible(true)}
        onClearSearch={handleClearSearch}
        onSortOpen={() => setSortSheetVisible(true)}
        activeSort={activeSort}
        onBack={() => navigation.goBack()}
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={displayData}
          keyExtractor={(item, index) => item.id?.toString() + index}
          renderItem={({ item, index }) => (
            <AlbumCard item={item} index={index} onPress={handleAlbumPress} />
          )}
          ListEmptyComponent={
            <EmptyState searchTerm={searchTerm} onClear={handleClearSearch} />
          }
          ListFooterComponent={<Footer loadingMore={loadingMore} />}
          ListHeaderComponent={<View style={{ height: 8 }} />}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          initialNumToRender={20}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}

      <SearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        onSearch={handleSearch}
        currentTerm={searchTerm}
      />
      <SortSheet
        visible={sortSheetVisible}
        onClose={() => setSortSheetVisible(false)}
        activeSort={activeSort}
        onSelect={setActiveSort}
      />
    </SafeAreaView>
  );
};

// ─── Styles (unchanged) ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.bg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -0.4,
  },
  topBarSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: "500",
    marginTop: 2,
  },
  topBarActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    position: "relative",
  },
  iconBtnActive: {
    backgroundColor: COLORS.accentSoft,
    borderColor: COLORS.accent,
  },
  iconBtnDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    borderWidth: 1.5,
    borderColor: COLORS.bg,
  },
  activeSearchChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
    backgroundColor: COLORS.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  activeSearchChipText: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: "600",
  },
  listContent: { paddingHorizontal: 16, paddingTop: 6 },
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
  emptyWrap: { alignItems: "center", paddingTop: 80, paddingHorizontal: 32 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyBtn: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.accentSoft,
    borderRadius: 12,
  },
  emptyBtnText: { fontSize: 14, fontWeight: "600", color: COLORS.accent },
  footerLoader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 20,
  },
  footerLoaderText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-start",
  },
  searchSheet: {
    backgroundColor: COLORS.surface,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
  },
  searchBackBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    fontWeight: "500",
    paddingVertical: 0,
  },
  searchDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
    marginBottom: 4,
  },
  suggestionSection: { marginTop: 4 },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  suggestionText: { flex: 1, fontSize: 15, color: COLORS.text },
  suggestionHighlight: { fontWeight: "700", color: COLORS.text },
  searchDirectRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginTop: 4,
  },
  searchDirectText: { fontSize: 15, color: COLORS.text },
  recentSection: { paddingTop: 8 },
  recentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  recentTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  clearAllText: { fontSize: 13, fontWeight: "600", color: COLORS.accent },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  recentIconWrap: { marginRight: 14 },
  recentText: { flex: 1, fontSize: 15, color: COLORS.text },
  sortSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 4,
  },
  sortOptionActive: { backgroundColor: COLORS.accentSoft },
  sortIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  sortIconWrapActive: { backgroundColor: COLORS.accent },
  sortLabel: { fontSize: 15, fontWeight: "500", color: COLORS.text },
  sortLabelActive: { fontWeight: "700", color: COLORS.accent },
});

export default PhotosAlbum;
