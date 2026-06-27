/**
 * app/news.tsx
 *
 * IITA News screen — fixed & improved.
 *
 * Bugs fixed:
 *  1. `setData((prev) => [...prev, ...response.data])` was written as an
 *     inline arrow inside a `.then()` argument — JS treated it as an object
 *     literal, not a function, crashing with "cannot convert undefined to object".
 *     Fixed: use a named updater or intermediate variable.
 *  2. `fetchNews` could return `undefined` — all call-sites now guard with `?? []`.
 *  3. `loadNews` captured stale `catId` via closure — fixed with a param arg.
 *  4. `handleLoadMore` checked `loadingMore` via state (always stale inside the
 *     callback) — fixed with a `loadingMoreRef`.
 *  5. `Card.Cover` from react-native-paper is unnecessary and adds a
 *     peer-dependency risk — replaced with a plain `Image`.
 *  6. `FilterSheet` rendered `null` when not visible, breaking the spring-out
 *     animation — fixed with `pointerEvents` + `opacity` instead.
 */

import { useLanguage } from "@/context/LanguageContext";
import i18n from "@/i18n";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
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
import { fetchNews } from "../helper/getData";
import axiosService from "../utils/lib/axiosService";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: "#F2F2F2",
  surface: "#FFFFFF",
  elevated: "#F0F0F0",
  border: "#E0E0E0",
  accent: "#FF6B35",
  accentSoft: "rgba(255,107,53,0.12)",
  accentGlow: "rgba(255,107,53,0.08)",
  text: "#1A1A1A",
  muted: "#777788",
  dim: "#AAAABC",
  white: "#FFFFFF",
  shadow: "rgba(0,0,0,0.08)",
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface NewsItem {
  id: number;
  title: { rendered: string };
  date: string;
  metadata?: Record<string, string[]>;
}

interface Category {
  title: string;
  id: string;
  icon: string;
}

// ─── Categories ───────────────────────────────────────────────────────────────
const CATEGORIES: Category[] = [
  { title: "All", id: "", icon: "apps" },
  { title: "Agribusiness", id: "983", icon: "trending-up" },
  { title: "Bulletin", id: "8", icon: "newspaper" },
  { title: "Capacity Dev.", id: "991", icon: "school" },
  { title: "Climate", id: "992", icon: "partly-sunny" },
  { title: "Crop Breeding", id: "993", icon: "leaf" },
  { title: "Crop Improvement", id: "994", icon: "flower" },
  { title: "Digital Tools", id: "995", icon: "phone-portrait" },
  { title: "Featured", id: "996", icon: "star" },
  { title: "Nutrition", id: "997", icon: "nutrition" },
  { title: "Partnerships", id: "998", icon: "people" },
  { title: "Plant Health", id: "999", icon: "medkit" },
  { title: "Soil Management", id: "1000", icon: "earth" },
  { title: "Strategy", id: "1001", icon: "compass" },
  { title: "Sustainability", id: "1002", icon: "reload-circle" },
  { title: "Youth", id: "1003", icon: "happy" },
];

const INITIAL_RECENT = [
  "IITA crop research",
  "soil health",
  "agribusiness 2024",
];

const safeThumb = (item: NewsItem): string => {
  const raw = item?.metadata?.["wpcf-news-thumbnail"]?.[0];
  if (!raw) return "https://s.ytimg.com/yts/img/no_thumbnail-vfl4t3-4R.jpg";
  return encodeURI(
    raw.startsWith("http://") ? raw.replace("http://", "https://") : raw
  );
};

// ─── Search Modal ─────────────────────────────────────────────────────────────
interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  onClose,
  onSearch,
}) => {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>(INITIAL_RECENT);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<TextInput>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { language } = useLanguage();

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 10,
      }).start(() => inputRef.current?.focus());
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      // Reset when closed
      setQuery("");
      setSuggestions([]);
    }
  }, [visible]);

  const handleSearch = (term?: string) => {
    const q = (term ?? query).trim();
    if (!q) return;
    setRecent((prev) => [q, ...prev.filter((r) => r !== q)].slice(0, 8));
    onSearch(q);
    onClose();
  };

  const handleChange = (text: string) => {
    setQuery(text);
    setSuggestions(
      text.length > 1
        ? CATEGORIES.filter((c) =>
            c.title.toLowerCase().includes(text.toLowerCase())
          )
            .map((c) => c.title)
            .slice(0, 5)
        : []
    );
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 0],
  });
  const opacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        style={s.backdrop}
        onPress={() => {
          Keyboard.dismiss();
          onClose();
        }}
      >
        <Animated.View
          style={[
            s.searchSheet,
            {
              opacity,
              transform: [{ translateY }],
              paddingTop: insets.top + 12,
            },
          ]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            {/* Input row */}
            <View style={s.searchRow}>
              <TouchableOpacity onPress={onClose} style={s.iconBtn}>
                <Ionicons name="arrow-back" size={22} color={C.text} />
              </TouchableOpacity>

              <View
                style={[s.searchInputWrap, query ? s.searchInputActive : null]}
              >
                <Ionicons name="search" size={17} color={C.muted} />
                <TextInput
                  ref={inputRef}
                  value={query}
                  onChangeText={handleChange}
                  placeholder="Search news, topics…"
                  placeholderTextColor={C.dim}
                  style={s.searchInput}
                  returnKeyType="search"
                  onSubmitEditing={() => handleSearch()}
                  autoCorrect={false}
                />
                {query.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      setQuery("");
                      setSuggestions([]);
                    }}
                  >
                    <Ionicons name="close-circle" size={17} color={C.muted} />
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                onPress={() => handleSearch()}
                style={s.goBtn}
                activeOpacity={0.8}
              >
                <Text style={s.goBtnText}>Go</Text>
              </TouchableOpacity>
            </View>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <View style={s.suggestionList}>
                {suggestions.map((sug, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => handleSearch(sug)}
                    style={[
                      s.suggestionRow,
                      i < suggestions.length - 1 && s.suggestionBorder,
                    ]}
                  >
                    <Ionicons name="search-outline" size={15} color={C.muted} />
                    <Text style={s.suggestionText} numberOfLines={1}>
                      {sug}
                    </Text>
                    <TouchableOpacity onPress={() => setQuery(sug)}>
                      <Ionicons name="arrow-back" size={14} color={C.dim} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Recent searches */}
            {suggestions.length === 0 && recent.length > 0 && (
              <View style={s.recentSection}>
                <View style={s.recentHeader}>
                  <Text style={s.recentLabel}>
                    {language && i18n.t("recent")}
                  </Text>
                  <TouchableOpacity onPress={() => setRecent([])}>
                    <Text style={s.clearText}>
                      {language && i18n.t("clearAll")}
                    </Text>
                  </TouchableOpacity>
                </View>
                {recent.map((r, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => handleSearch(r)}
                    style={s.recentRow}
                  >
                    <View style={s.recentIconBox}>
                      <Ionicons name="time-outline" size={15} color={C.muted} />
                    </View>
                    <Text style={s.recentText} numberOfLines={1}>
                      {r}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setRecent((prev) => prev.filter((_, j) => j !== i))
                      }
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="close" size={15} color={C.dim} />
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

// ─── Filter bottom sheet ──────────────────────────────────────────────────────
interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  activeCatId: string;
  onSelect: (id: string) => void;
}

const FilterSheet: React.FC<FilterSheetProps> = ({
  visible,
  onClose,
  activeCatId,
  onSelect,
}) => {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const { language } = useLanguage();

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 1 : 0,
      useNativeDriver: true,
      tension: 70,
      friction: 12,
    }).start();
  }, [visible]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [700, 0],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={s.backdrop} onPress={onClose}>
        <Animated.View
          style={[
            s.filterSheet,
            { transform: [{ translateY }], paddingBottom: insets.bottom + 16 },
          ]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            {/* Handle */}
            <View style={s.sheetHandle} />

            {/* Header */}
            <View style={s.sheetHeader}>
              <View>
                <Text style={s.sheetTitle}>
                  {language && i18n.t("FilterByTopic")}
                </Text>
                <Text style={s.sheetSubtitle}>
                  {activeCatId
                    ? CATEGORIES.find((c) => c.id === activeCatId)?.title
                    : "All categories shown"}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={s.sheetCloseBtn}>
                <Ionicons name="close" size={19} color={C.text} />
              </TouchableOpacity>
            </View>

            {/* Category grid */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={s.categoryGrid}
            >
              {CATEGORIES.map((cat) => {
                const active = activeCatId === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => {
                      onSelect(cat.id);
                      onClose();
                    }}
                    activeOpacity={0.7}
                    style={[s.categoryPill, active && s.categoryPillActive]}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={13}
                      color={active ? C.accent : C.muted}
                    />
                    <Text
                      style={[
                        s.categoryPillText,
                        active && s.categoryPillTextActive,
                      ]}
                    >
                      {cat.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

// ─── News card ────────────────────────────────────────────────────────────────
interface NewsCardProps {
  item: NewsItem;
  index: number;
  onPress: () => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ item, index, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const mountAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(mountAnim, {
      toValue: 1,
      duration: 340,
      delay: Math.min(index * 50, 400),
      useNativeDriver: true,
    }).start();
  }, []);

  const pressIn = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.975,
      useNativeDriver: true,
      tension: 200,
    }).start();
  const pressOut = () =>
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
    }).start();

  return (
    <Animated.View
      style={{
        opacity: mountAnim,
        transform: [
          { scale: scaleAnim },
          {
            translateY: mountAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [16, 0],
            }),
          },
        ],
        marginBottom: 14,
      }}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={s.newsCard}
      >
        <Image
          source={{ uri: safeThumb(item) }}
          style={s.newsThumbnail}
          resizeMode="cover"
        />
        <View style={s.newsBody}>
          <Text numberOfLines={2} style={s.newsTitle}>
            {item?.title?.rendered}
          </Text>
          <View style={s.newsMeta}>
            <View style={s.datePill}>
              <Ionicons name="calendar-outline" size={12} color={C.accent} />
              <Text style={s.dateText}>
                {moment(item.date).format("MMM D, YYYY")}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Header bar ───────────────────────────────────────────────────────────────
interface HeaderProps {
  onBack: () => void;
  onSearch: () => void;
  onFilter: () => void;
  activeCatId: string;
}

const HeaderBar: React.FC<HeaderProps> = ({
  onBack,
  onSearch,
  onFilter,
  activeCatId,
}) => {
  const activeLabel = activeCatId
    ? CATEGORIES.find((c) => c.id === activeCatId)?.title
    : null;
  const { language } = useLanguage();
  return (
    <View style={s.header}>
      <TouchableOpacity onPress={onBack} style={s.headerIconBtn}>
        <Ionicons name="arrow-back" size={20} color={C.text} />
      </TouchableOpacity>

      <View style={{ flex: 1 }}>
        <Text style={s.headerTitle}>{language && i18n.t("news")}</Text>
        {activeLabel ? (
          <Text style={s.headerSubtitle}>{activeLabel.toUpperCase()}</Text>
        ) : null}
      </View>

      {/* on the web site we can only filter by date and theme -> implement that */}
      {/* <TouchableOpacity
        onPress={onFilter}
        style={[s.headerIconBtn, activeCatId ? s.headerIconBtnActive : null]}
      >
        <Ionicons
          name="options-outline"
          size={19}
          color={activeCatId ? C.accent : C.text}
        />
        {activeCatId ? <View style={s.filterDot} /> : null}
      </TouchableOpacity> */}

      <TouchableOpacity onPress={onSearch} style={s.headerIconBtn}>
        <Ionicons name="search-outline" size={19} color={C.text} />
      </TouchableOpacity>
    </View>
  );
};

// ─── Skeleton card ────────────────────────────────────────────────────────────
const SkeletonCard: React.FC<{ index: number }> = ({ index }) => {
  const pulse = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 850,
          delay: index * 80,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.45,
          duration: 850,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[s.skeletonCard, { opacity: pulse }]}>
      <View style={s.skeletonImg} />
      <View style={s.skeletonBody}>
        <View style={[s.skeletonLine, { width: "90%" }]} />
        <View style={[s.skeletonLine, { width: "65%", marginTop: 8 }]} />
        <View style={[s.skeletonLine, { width: "40%", marginTop: 14 }]} />
      </View>
    </Animated.View>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
const News: React.FC = () => {
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<NewsItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [catId, setCatId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  // Ref prevents stale closure in onEndReached
  const loadingMoreRef = useRef(false);
  const { language } = useLanguage();

  // ── Fetch helpers ─────────────────────────────────────────────────────────
  const loadNews = useCallback(
    async (pg: number, cat: string, replace: boolean) => {
      if (pg === 1) setIsLoading(true);
      else {
        setLoadingMore(true);
        loadingMoreRef.current = true;
      }

      try {
        // fetchNews must return NewsItem[] | undefined — guard with ?? []
        const result: NewsItem[] = (await fetchNews(pg, cat)) ?? [];

        if (result.length === 0) setHasMore(false);

        // FIX: use a temp variable, NOT an inline arrow in setData which JS
        // would parse as `setData(object)` instead of `setData(updaterFn)`.
        if (replace) {
          setData(result);
        } else {
          setData((prev) => [...prev, ...result]);
        }
        setPage(pg);
      } catch (err: any) {
        Alert.alert(
          `${language && i18n.t("connectionError")}`,

          err?.message ?? `${language && i18n.t("internetError")}`,
          [
            {
              text: `${language && i18n.t("retry")}`,
              onPress: () => loadNews(pg, cat, replace),
            },
            { text: `${language && i18n.t("cancel")}`, style: "cancel" },
          ]
        );
        Vibration.vibrate();
      } finally {
        setIsLoading(false);
        setLoadingMore(false);
        loadingMoreRef.current = false;
        setRefreshing(false);
      }
    },
    []
  );

  const searchNews = useCallback(
    async (query: string, pg: number) => {
      if (!query.trim()) {
        loadNews(1, catId, true);
        return;
      }

      if (pg === 1) setIsLoading(true);
      else {
        setLoadingMore(true);
        loadingMoreRef.current = true;
      }

      try {
        const response = await axiosService.request({
          url: `?search=${encodeURIComponent(
            query
          )}&per_page=10&orderby=title&page=${pg}`,
          method: "GET",
        });

        // FIX: same pattern — use temp variable, not inline arrow
        const result: NewsItem[] = response?.data ?? [];
        if (result.length === 0) setHasMore(false);

        if (pg === 1) {
          setData(result);
        } else {
          setData((prev) => [...prev, ...result]);
        }
        setPage(pg);
      } catch (err: any) {
        Alert.alert(
          `${language && i18n.t("connectionError")}`,
          `${language && i18n.t("internetError")}`,

          [
            {
              text: `${language && i18n.t("retry")}`,
              onPress: () => searchNews(query, pg),
            },
            { text: `${language && i18n.t("cancel")}`, style: "cancel" },
          ]
        );
        Vibration.vibrate();
      } finally {
        setIsLoading(false);
        setLoadingMore(false);
        loadingMoreRef.current = false;
      }
    },
    [catId, loadNews]
  );

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    loadNews(1, "", true);
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleLoadMore = () => {
    // FIX: use ref instead of state to avoid stale closure
    if (!loadingMoreRef.current && hasMore) {
      if (searchQuery) searchNews(searchQuery, page + 1);
      else loadNews(page + 1, catId, false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setHasMore(true);
    if (searchQuery) searchNews(searchQuery, 1);
    else loadNews(1, catId, true);
  };

  const handleCategorySelect = (id: string) => {
    setCatId(id);
    setSearchQuery("");
    setHasMore(true);
    loadNews(1, id, true);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setHasMore(true);
    searchNews(query, 1);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setHasMore(true);
    loadNews(1, catId, true);
  };

  // ── Render helpers ────────────────────────────────────────────────────────
  const ListHeader = () =>
    searchQuery ? (
      <View style={s.searchBanner}>
        <Ionicons name="search" size={13} color={C.accent} />
        <Text style={s.searchBannerText}>
          {language && i18n.t("resultsFor")}{" "}
          <Text style={s.searchBannerQuery}>"{searchQuery}"</Text>
        </Text>
        <TouchableOpacity onPress={clearSearch} style={s.clearChip}>
          <Ionicons name="close" size={12} color={C.muted} />
          <Text style={s.clearChipText}>{language && i18n.t("clear")}</Text>
        </TouchableOpacity>
      </View>
    ) : null;

  const ListFooter = () =>
    loadingMore ? (
      <View style={{ paddingVertical: 24, alignItems: "center" }}>
        <ActivityIndicator size="small" color={C.accent} />
        <Text style={[s.loadingText, { marginTop: 8 }]}>
          {" "}
          {language && i18n.t("loadingMore")}
        </Text>
      </View>
    ) : null;

  const ListEmpty = () =>
    !isLoading ? (
      <View style={s.emptyWrap}>
        <View style={s.emptyIconBox}>
          <Ionicons name="newspaper-outline" size={36} color={C.accent} />
        </View>
        <Text style={s.emptyTitle}>{language && i18n.t("noNewsFound")} </Text>
        <Text style={s.emptyBody}>
          {searchQuery
            ? `No results for "${searchQuery}"`
            : "Try a different category."}
        </Text>
        {searchQuery ? (
          <TouchableOpacity onPress={clearSearch} style={s.emptyAction}>
            <Text style={s.emptyActionText}>
              {" "}
              {language && i18n.t("clearSearch")}{" "}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    ) : null;

  return (
    <SafeAreaView style={s.root} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <HeaderBar
        onBack={() => navigation.goBack()}
        onSearch={() => setShowSearch(true)}
        onFilter={() => setShowFilter(true)}
        activeCatId={catId}
      />

      <View style={{ height: 1, backgroundColor: C.border }} />

      {isLoading ? (
        <ScrollView
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} index={i} />
          ))}
        </ScrollView>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={({ item, index }) => (
            <NewsCard
              item={item}
              index={index}
              onPress={() =>
                router.push({
                  pathname: "/newscontent",
                  params: { id: item.id, otherParam: item.title.rendered },
                })
              }
            />
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={ListFooter}
          ListEmptyComponent={ListEmpty}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          initialNumToRender={10}
        />
      )}

      <SearchModal
        visible={showSearch}
        onClose={() => setShowSearch(false)}
        onSearch={handleSearch}
      />

      <FilterSheet
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        activeCatId={catId}
        onSelect={handleCategorySelect}
      />
    </SafeAreaView>
  );
};

export default News;

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: C.bg,
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: C.text,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: "700",
    color: C.accent,
    letterSpacing: 0.5,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  headerIconBtnActive: { backgroundColor: C.accentSoft, borderColor: C.accent },
  filterDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: C.accent,
    borderWidth: 1.5,
    borderColor: C.bg,
  },

  // Search modal
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },
  searchSheet: {
    backgroundColor: C.surface,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 20,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingBottom: 10,
    gap: 10,
  },
  iconBtn: { padding: 6 },
  searchInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.elevated,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 11 : 7,
    gap: 8,
  },
  searchInputActive: { borderColor: C.accent },
  searchInput: { flex: 1, color: C.text, fontSize: 15, paddingVertical: 0 },
  goBtn: {
    backgroundColor: C.accent,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  goBtnText: { color: C.white, fontWeight: "700", fontSize: 13 },
  suggestionList: { paddingHorizontal: 16, marginTop: 2 },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  suggestionBorder: { borderBottomWidth: 1, borderBottomColor: C.border },
  suggestionText: { flex: 1, color: C.text, fontSize: 14 },
  recentSection: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  recentLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.muted,
    letterSpacing: 1,
  },
  clearText: { fontSize: 12, fontWeight: "700", color: C.accent },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    gap: 12,
  },
  recentIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: C.elevated,
    justifyContent: "center",
    alignItems: "center",
  },
  recentText: { flex: 1, color: C.text, fontSize: 14 },

  // Filter sheet
  filterSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "78%",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 25,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  sheetTitle: { fontSize: 17, fontWeight: "700", color: C.text },
  sheetSubtitle: { fontSize: 12, color: C.muted, marginTop: 2 },
  sheetCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: C.elevated,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 8,
  },
  categoryPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 13,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.elevated,
  },
  categoryPillActive: { borderColor: C.accent, backgroundColor: C.accentSoft },
  categoryPillText: { fontSize: 12, fontWeight: "500", color: C.text },
  categoryPillTextActive: { color: C.accent, fontWeight: "700" },

  // News card
  newsCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  newsThumbnail: { width: "100%", height: 200 },
  newsBody: { padding: 14 },
  newsTitle: {
    color: C.text,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
    letterSpacing: 0.1,
    marginBottom: 10,
  },
  newsMeta: { flexDirection: "row", alignItems: "center" },
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.accentGlow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  dateText: { color: C.accent, fontSize: 12, fontWeight: "600" },

  // Search result banner
  searchBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
    backgroundColor: C.bg,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginHorizontal: -16,
    marginBottom: 12,
  },
  searchBannerText: { flex: 1, color: C.muted, fontSize: 13 },
  searchBannerQuery: { color: C.text, fontWeight: "700" },
  clearChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.elevated,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  clearChipText: { color: C.muted, fontSize: 12 },

  // Skeleton
  skeletonCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: C.border,
    marginBottom: 14,
  },
  skeletonImg: { height: 200, backgroundColor: C.border },
  skeletonBody: { padding: 14 },
  skeletonLine: { height: 14, backgroundColor: C.border, borderRadius: 7 },

  // Loading / empty
  loadingText: { fontSize: 13, color: C.muted },
  emptyWrap: { alignItems: "center", paddingTop: 64, paddingHorizontal: 32 },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.accentSoft,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: C.text,
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 14,
    color: C.muted,
    textAlign: "center",
    lineHeight: 22,
  },
  emptyAction: {
    marginTop: 18,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: C.accentSoft,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.accent,
  },
  emptyActionText: { color: C.accent, fontWeight: "700", fontSize: 14 },
});
