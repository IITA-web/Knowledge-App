/**
 * app/projects.tsx
 *
 * IITA Projects screen — "Field Intelligence" aesthetic.
 * Clean editorial light theme, bold green accents, animated list cards,
 * polished bottom-sheet filter drawer with hub & crop selectors.
 *
 * TypeScript + Expo Router.
 */

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackArrow from "../components/BackArrow";
import CustomHeader from "../components/CustomHeader";
import projectAxiosService from "../utils/lib/projectAxiosService";

// ─── Design tokens ────────────────────────────────────────────────────────────
const GREEN = "#2D7D46"; // IITA primary green
const GREEN_LT = "#E8F5ED"; // green tint
const ORANGE = "#F26522"; // IITA orange accent
const DARK = "#111A14";
const BODY = "#3D4A41";
const MUTED = "#8A9E90";
const BORDER = "#E2EBE5";
const BG = "#F4F7F5";
const WHITE = "#FFFFFF";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FilterItem {
  title: string;
  url: string;
}

interface ProjectItem {
  id: number;
  title: { rendered: string };
  acf?: {
    project_status?: string;
    donor?: string;
    start_year?: string;
    end_year?: string;
    project_crop?: string;
    project_hub?: string;
  };
  excerpt?: { rendered: string };
}

// ─── Filter data ──────────────────────────────────────────────────────────────
const BASE = "https://iita.org/wp-json/wp/v2/iita-project";

const HUB_FILTERS: FilterItem[] = [
  { title: "All Hubs", url: `${BASE}?per_page=20&_embed&page=` },
  {
    title: "Western Africa",
    url: `${BASE}?filter[project-hub]=western-africa&per_page=20&_embed&page=`,
  },
  {
    title: "Central Africa",
    url: `${BASE}?filter[project-hub]=central-africa&per_page=20&_embed&page=`,
  },
  {
    title: "Eastern Africa",
    url: `${BASE}?filter[project-hub]=eastern-africa&per_page=20&_embed&page=`,
  },
  {
    title: "Southern Africa",
    url: `${BASE}?filter[project-hub]=southern-africa&per_page=20&_embed&page=`,
  },
];

const CROP_FILTERS: FilterItem[] = [
  { title: "All Crops", url: `${BASE}?per_page=20&_embed&page=` },
  {
    title: "Banana",
    url: `${BASE}?filter[project-crop]=banana&per_page=20&_embed&page=`,
  },
  {
    title: "Cassava",
    url: `${BASE}?filter[project-crop]=cassava&per_page=20&_embed&page=`,
  },
  {
    title: "Cocoa",
    url: `${BASE}?filter[project-crop]=cocoa&per_page=20&_embed&page=`,
  },
  {
    title: "Coffee",
    url: `${BASE}?filter[project-crop]=coffee&per_page=20&_embed&page=`,
  },
  {
    title: "Cowpea",
    url: `${BASE}?filter[project-crop]=cowpea&per_page=20&_embed&page=`,
  },
  {
    title: "Maize",
    url: `${BASE}?filter[project-crop]=maize&per_page=20&_embed&page=`,
  },
  {
    title: "Soybean",
    url: `${BASE}?filter[project-crop]=soybean&per_page=20&_embed&page=`,
  },
  {
    title: "Yam",
    url: `${BASE}?filter[project-crop]=yam&per_page=20&_embed&page=`,
  },
];

const CROP_EMOJIS: Record<string, string> = {
  "All Crops": "🌍",
  Banana: "🍌",
  Cassava: "🌿",
  Cocoa: "🍫",
  Coffee: "☕",
  Cowpea: "🫘",
  Maize: "🌽",
  Soybean: "🌱",
  Yam: "🍠",
};

const HUB_ICONS: Record<string, string> = {
  "All Hubs": "globe-outline",
  "Western Africa": "flag-outline",
  "Central Africa": "flag-outline",
  "Eastern Africa": "flag-outline",
  "Southern Africa": "flag-outline",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const stripHtml = (html: string = "") =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

// ─── Animated project card ────────────────────────────────────────────────────
interface ProjectCardProps {
  item: ProjectItem;
  index: number;
  onPress: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ item, index, onPress }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const title = stripHtml(item?.title?.rendered ?? "Untitled Project");
  const status = item?.acf?.project_status ?? "";
  const donor = item?.acf?.donor ?? "";
  const start = item?.acf?.start_year ?? "";
  const end = item?.acf?.end_year ?? "";
  const isActive = status.toLowerCase().includes("active");

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 350,
      delay: Math.min(index * 55, 400),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [18, 0],
            }),
          },
        ],
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.78}
        style={styles.card}
      >
        {/* Top row: status badge + index number */}
        <View style={styles.cardTop}>
          <Text style={styles.cardIndex}>
            #{String(index + 1).padStart(2, "0")}
          </Text>
          {status ? (
            <View
              style={[
                styles.statusBadge,
                isActive ? styles.statusActive : styles.statusInactive,
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isActive ? GREEN : MUTED },
                ]}
              />
              <Text
                style={[styles.statusText, { color: isActive ? GREEN : MUTED }]}
              >
                {status.toUpperCase()}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Title */}
        <Text style={styles.cardTitle} numberOfLines={3}>
          {title}
        </Text>

        {/* Meta row */}
        <View style={styles.cardMeta}>
          {donor ? (
            <View style={styles.metaItem}>
              <Ionicons name="business-outline" size={12} color={MUTED} />
              <Text style={styles.metaText} numberOfLines={1}>
                {donor}
              </Text>
            </View>
          ) : null}
          {start ? (
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={12} color={MUTED} />
              <Text style={styles.metaText}>
                {start}
                {end ? `–${end}` : ""}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Arrow */}
        <View style={styles.cardArrow}>
          <Ionicons name="arrow-forward" size={16} color={GREEN} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Filter chip (horizontal scroll) ─────────────────────────────────────────
interface ChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  emoji?: string;
}

const Chip: React.FC<ChipProps> = ({ label, active, onPress, emoji }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={[styles.chip, active && styles.chipActive]}
  >
    {emoji ? (
      <Text style={{ fontSize: 13, marginRight: 5 }}>{emoji}</Text>
    ) : null}
    <Text style={[styles.chipText, active && styles.chipTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// ─── Search bar ───────────────────────────────────────────────────────────────
interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
  loading: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  loading,
}) => (
  <View style={styles.searchWrap}>
    <Ionicons
      name="search-outline"
      size={18}
      color={MUTED}
      style={{ marginRight: 8 }}
    />
    <TextInput
      style={styles.searchInput}
      placeholder="Search projects…"
      placeholderTextColor={MUTED}
      value={value}
      onChangeText={onChange}
      returnKeyType="search"
      autoCorrect={false}
    />
    {loading ? (
      <ActivityIndicator size="small" color={GREEN} />
    ) : value.length > 0 ? (
      <TouchableOpacity
        onPress={onClear}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="close-circle" size={18} color={MUTED} />
      </TouchableOpacity>
    ) : null}
  </View>
);

// ─── Filter bottom sheet ──────────────────────────────────────────────────────
interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  selectedHub: FilterItem;
  selectedCrop: FilterItem;
  onSelectHub: (f: FilterItem) => void;
  onSelectCrop: (f: FilterItem) => void;
  onApply: () => void;
}

const FilterSheet: React.FC<FilterSheetProps> = ({
  visible,
  onClose,
  selectedHub,
  selectedCrop,
  onSelectHub,
  onSelectCrop,
  onApply,
}) => {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : 600,
      useNativeDriver: true,
      tension: 68,
      friction: 12,
    }).start();
  }, [visible]);

  const SectionHead: React.FC<{ icon: string; label: string }> = ({
    icon,
    label,
  }) => (
    <View style={styles.sheetSectionHead}>
      <Ionicons name={icon as any} size={14} color={GREEN} />
      <Text style={styles.sheetSectionHeadText}>{label.toUpperCase()}</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View
        style={[
          styles.sheet,
          {
            transform: [{ translateY: slideAnim }],
            paddingBottom: insets.bottom + 16,
          },
        ]}
      >
        {/* Handle */}
        <View style={styles.sheetHandle} />

        {/* Header */}
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Filter Projects</Text>
          <TouchableOpacity onPress={onClose} style={styles.sheetCloseBtn}>
            <Ionicons name="close" size={18} color={BODY} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        >
          {/* Hub filter */}
          <SectionHead icon="globe-outline" label="By Region / Hub" />
          <View style={styles.filterGrid}>
            {HUB_FILTERS.map((item) => (
              <TouchableOpacity
                key={item.title}
                onPress={() => onSelectHub(item)}
                activeOpacity={0.72}
                style={[
                  styles.filterOption,
                  selectedHub.title === item.title && styles.filterOptionActive,
                ]}
              >
                <Ionicons
                  name={(HUB_ICONS[item.title] ?? "flag-outline") as any}
                  size={14}
                  color={selectedHub.title === item.title ? WHITE : MUTED}
                />
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedHub.title === item.title &&
                      styles.filterOptionTextActive,
                  ]}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Crop filter */}
          <SectionHead icon="leaf-outline" label="By Mandate Crop" />
          <View style={styles.filterGrid}>
            {CROP_FILTERS.map((item) => (
              <TouchableOpacity
                key={item.title}
                onPress={() => onSelectCrop(item)}
                activeOpacity={0.72}
                style={[
                  styles.filterOption,
                  selectedCrop.title === item.title &&
                    styles.filterOptionActive,
                ]}
              >
                <Text style={{ fontSize: 14 }}>
                  {CROP_EMOJIS[item.title] ?? "🌱"}
                </Text>
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedCrop.title === item.title &&
                      styles.filterOptionTextActive,
                  ]}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Apply button */}
        <View style={{ paddingHorizontal: 20 }}>
          <TouchableOpacity
            onPress={onApply}
            activeOpacity={0.85}
            style={styles.applyBtn}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color={WHITE} />
            <Text style={styles.applyBtnText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
const Project: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [data, setData] = useState<ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  // Active filter state (committed when Apply is pressed)
  const [activeHub, setActiveHub] = useState<FilterItem>(HUB_FILTERS[0]);
  const [activeCrop, setActiveCrop] = useState<FilterItem>(CROP_FILTERS[0]);

  // Pending filter state (changed inside the sheet, committed on Apply)
  const [pendingHub, setPendingHub] = useState<FilterItem>(HUB_FILTERS[0]);
  const [pendingCrop, setPendingCrop] = useState<FilterItem>(CROP_FILTERS[0]);

  // Active URL: crop filter takes precedence over hub if both are non-default
  const activeUrl = useMemo(() => {
    if (activeCrop.title !== "All Crops") return activeCrop.url;
    return activeHub.url;
  }, [activeHub, activeCrop]);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchProjects = useCallback(
    async (pg: number = 1, reset = false) => {
      if (pg === 1) setIsLoading(true);
      else setLoadingMore(true);

      try {
        const res = await fetch(`${activeUrl}${pg}`);
        const json: ProjectItem[] = await res.json();
        setData((prev) => (reset || pg === 1 ? json : [...prev, ...json]));
        setPage(pg);
      } catch (err: any) {
        Alert.alert(
          "Connection Error",
          "Please check your internet connection and try again.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Retry", onPress: () => fetchProjects(pg, reset) },
          ]
        );
        Vibration.vibrate();
      } finally {
        setIsLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    [activeUrl]
  );

  // ── Search ────────────────────────────────────────────────────────────────
  const searchProjects = useCallback(
    async (pg: number = 1) => {
      if (!searchTerm.trim()) return;
      setSearchLoading(true);
      try {
        const res = await projectAxiosService.request({
          url: `iita-project?search=${encodeURIComponent(
            searchTerm
          )}&per_page=20&_embed&page=${pg}`,
          method: "GET",
        });
        setData((prev) => (pg === 1 ? res.data : [...prev, ...res.data]));
        setPage(pg);
      } catch (err: any) {
        Alert.alert("Search Error", "Please check your internet connection.");
      } finally {
        setSearchLoading(false);
      }
    },
    [searchTerm]
  );

  useEffect(() => {
    fetchProjects(1, true);
  }, [activeUrl]);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchTerm.trim().length > 1) searchProjects(1);
      else if (searchTerm === "") fetchProjects(1, true);
    }, 420);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProjects(1, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && data.length >= 20) {
      const next = page + 1;
      if (searchTerm.trim()) searchProjects(next);
      else fetchProjects(next);
    }
  };

  const handleApplyFilter = () => {
    setActiveHub(pendingHub);
    setActiveCrop(pendingCrop);
    setShowFilter(false);
  };

  const handleOpenFilter = () => {
    setPendingHub(activeHub);
    setPendingCrop(activeCrop);
    setShowFilter(true);
    Keyboard.dismiss();
  };

  // Active filter labels for the quick-chip strip
  const activeHubLabel =
    activeHub.title !== "All Hubs" ? activeHub.title : null;
  const activeCropLabel =
    activeCrop.title !== "All Crops" ? activeCrop.title : null;
  const hasActiveFilter = !!activeHubLabel || !!activeCropLabel;

  // ── Empty state ────────────────────────────────────────────────────────────
  const ListEmpty = () => (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name="briefcase-outline" size={36} color={GREEN} />
      </View>
      <Text style={styles.emptyTitle}>No projects found</Text>
      <Text style={styles.emptyBody}>
        {searchTerm
          ? `No results for "${searchTerm}"`
          : "Try adjusting your filters."}
      </Text>
    </View>
  );

  // ── List footer ────────────────────────────────────────────────────────────
  const ListFooter = () =>
    loadingMore ? (
      <View style={{ paddingVertical: 24, alignItems: "center" }}>
        <ActivityIndicator color={GREEN} size="small" />
        <Text style={[styles.metaText, { marginTop: 8 }]}>Loading more…</Text>
      </View>
    ) : null;

  // ── List header ────────────────────────────────────────────────────────────
  const ListHeader = () => (
    <View style={{ paddingTop: 8, paddingBottom: 4 }}>
      {/* Active filter chips */}
      {hasActiveFilter ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 10,
            gap: 8,
          }}
        >
          {activeHubLabel ? (
            <Chip
              label={activeHubLabel}
              active
              onPress={() => {
                setActiveHub(HUB_FILTERS[0]);
                setPendingHub(HUB_FILTERS[0]);
              }}
              emoji="🌍"
            />
          ) : null}
          {activeCropLabel ? (
            <Chip
              label={activeCropLabel}
              active
              onPress={() => {
                setActiveCrop(CROP_FILTERS[0]);
                setPendingCrop(CROP_FILTERS[0]);
              }}
              emoji={CROP_EMOJIS[activeCropLabel]}
            />
          ) : null}
          <Chip
            label="Clear all"
            active={false}
            onPress={() => {
              setActiveHub(HUB_FILTERS[0]);
              setActiveCrop(CROP_FILTERS[0]);
            }}
          />
        </ScrollView>
      ) : null}

      {/* Count label */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingBottom: 10,
        }}
      >
        <Text style={styles.countLabel}>
          {data.length > 0
            ? `${data.length} project${data.length !== 1 ? "s" : ""}`
            : ""}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

      {/* Header */}
      <SafeAreaView style={{ backgroundColor: WHITE }}>
        <CustomHeader
          LeftIcon={<BackArrow />}
          onPressL={() => navigation.goBack()}
          title="Projects"
          RightIcon={
            <TouchableOpacity
              onPress={handleOpenFilter}
              style={styles.filterBtn}
            >
              <Ionicons
                name="options-outline"
                size={20}
                color={hasActiveFilter ? WHITE : GREEN}
              />
              {hasActiveFilter ? <View style={styles.filterDot} /> : null}
            </TouchableOpacity>
          }
          onPressR={handleOpenFilter}
        />

        {/* Search */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            onClear={() => setSearchTerm("")}
            loading={searchLoading}
          />
        </View>
      </SafeAreaView>

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: BORDER }} />

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={GREEN} />
          <Text style={[styles.metaText, { marginTop: 14 }]}>
            Loading projects…
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={({ item, index }) => (
            <ProjectCard
              item={item}
              index={index}
              onPress={() =>
                router.push({
                  pathname: "/projectscontent",
                  params: {
                    id: String(item.id),
                    otherParam: item.title?.rendered ?? "",
                  },
                })
              }
            />
          )}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmpty}
          ListFooterComponent={ListFooter}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          initialNumToRender={15}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Filter sheet */}
      <FilterSheet
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        selectedHub={pendingHub}
        selectedCrop={pendingCrop}
        onSelectHub={setPendingHub}
        onSelectCrop={setPendingCrop}
        onApply={handleApplyFilter}
      />
    </View>
  );
};

export default Project;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },

  // ── Search ────────────────────────────────────────────────────────────────
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BG,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    borderWidth: 1.5,
    borderColor: BORDER,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: DARK,
    paddingVertical: 0,
  },

  // ── Filter button ─────────────────────────────────────────────────────────
  filterBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: GREEN_LT,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  filterDot: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: ORANGE,
    borderWidth: 1,
    borderColor: WHITE,
  },

  // ── Chips ─────────────────────────────────────────────────────────────────
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 100,
    backgroundColor: WHITE,
    borderWidth: 1.5,
    borderColor: BORDER,
  },
  chipActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: BODY,
  },
  chipTextActive: {
    color: WHITE,
  },

  // ── Count ─────────────────────────────────────────────────────────────────
  countLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: MUTED,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  // ── List ──────────────────────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  // ── Project card ──────────────────────────────────────────────────────────
  card: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    position: "relative",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardIndex: {
    fontSize: 11,
    fontWeight: "800",
    color: MUTED,
    letterSpacing: 0.8,
    fontFamily: Platform.OS === "ios" ? "Courier New" : "monospace",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
    gap: 4,
  },
  statusActive: {
    backgroundColor: GREEN_LT,
  },
  statusInactive: {
    backgroundColor: "#F0F0F0",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: DARK,
    lineHeight: 22,
    marginBottom: 10,
    paddingRight: 28,
  },
  cardMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: MUTED,
    fontWeight: "500",
  },
  cardArrow: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: GREEN_LT,
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Loading / empty ───────────────────────────────────────────────────────
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: GREEN_LT,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: DARK,
    marginBottom: 8,
  },
  emptyBody: {
    fontSize: 14,
    color: MUTED,
    textAlign: "center",
    lineHeight: 22,
  },

  // ── Filter bottom sheet ───────────────────────────────────────────────────
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: WHITE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "82%",
    paddingTop: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -6 },
    elevation: 20,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: BORDER,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: DARK,
  },
  sheetCloseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: BG,
    justifyContent: "center",
    alignItems: "center",
  },
  sheetSectionHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    marginTop: 20,
  },
  sheetSectionHeadText: {
    fontSize: 10,
    fontWeight: "800",
    color: GREEN,
    letterSpacing: 1.2,
  },
  filterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 4,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: BG,
    borderWidth: 1.5,
    borderColor: BORDER,
  },
  filterOptionActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  filterOptionText: {
    fontSize: 13,
    fontWeight: "600",
    color: BODY,
  },
  filterOptionTextActive: {
    color: WHITE,
  },

  // ── Apply button ──────────────────────────────────────────────────────────
  applyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: GREEN,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8,
    shadowColor: GREEN,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  applyBtnText: {
    fontSize: 16,
    fontWeight: "800",
    color: WHITE,
    letterSpacing: 0.3,
  },
});
