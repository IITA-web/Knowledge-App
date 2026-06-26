import { Service } from "@/utils/service";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  Vibration,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DatasetItem {
  id: string;
  title: string;
  notes: string;
  identifier: string;
  embargo_end_date: string;
  creator: string;
  resources: unknown[];
}

interface FilterOption {
  id?: string;
  name?: string;
  title?: string;
  label?: string;
  value?: string;
}

interface FilterLists {
  contributorProject: FilterOption[];
  subjectVocab: FilterOption[];
  subject: FilterOption[];
  contributorProjectleadInstitute: FilterOption[];
  contributorPerson: FilterOption[];
  contributioncrp: FilterOption[];
  source: FilterOption[];
  groups: FilterOption[];
}

interface FilterState {
  subjectVocab: string;
  subject: string;
  contributorPerson: string;
  contributioncrp: string;
  contributorProject: string;
  contributorProjectleadInstitute: string;
  source: string;
  groups: string;
}

interface FilterQueryState {
  selectedsubjectVocab: string;
  selectedsubject: string;
  selectedcontributorPerson: string;
  selectedcontributioncrp: string;
  selectedcontributorProject: string;
  selectedcontributorProjectleadInstitute: string;
  selectedsource: string;
  selectedgroups: string;
}

interface DropdownAction {
  title: string;
  value: keyof FilterState;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

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
};

const FILTER_ACTIONS: DropdownAction[] = [
  { title: "Subject Vocabulary", value: "subjectVocab" },
  { title: "Subject", value: "subject" },
  { title: "Contributor Person", value: "contributorPerson" },
  { title: "Contribution CRP", value: "contributioncrp" },
  { title: "Contributor Project", value: "contributorProject" },
  {
    title: "Contributor Project Lead Institute",
    value: "contributorProjectleadInstitute",
  },
  { title: "Source", value: "source" },
  { title: "Groups", value: "groups" },
];

const EMPTY_FILTER_STATE: FilterState = {
  subjectVocab: "",
  subject: "",
  contributorPerson: "",
  contributioncrp: "",
  contributorProject: "",
  contributorProjectleadInstitute: "",
  source: "",
  groups: "",
};

const EMPTY_QUERY_STATE: FilterQueryState = {
  selectedsubjectVocab: "",
  selectedsubject: "",
  selectedcontributorPerson: "",
  selectedcontributioncrp: "",
  selectedcontributorProject: "",
  selectedcontributorProjectleadInstitute: "",
  selectedsource: "",
  selectedgroups: "",
};

// ─── DatasetCard ──────────────────────────────────────────────────────────────

const DatasetCard: React.FC<{
  item: DatasetItem;
  onPress: () => void;
  index: number;
}> = ({ item, onPress, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 280,
        delay: Math.min(index * 40, 360),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        delay: Math.min(index * 40, 360),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.72 }]}
      >
        <View style={styles.cardInner}>
          <View style={styles.cardIcon}>
            <Ionicons name="layers-outline" size={15} color={COLORS.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            {!!item.notes && (
              <Text style={styles.cardNotes} numberOfLines={1}>
                {item.notes}
              </Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={15} color={COLORS.textMuted} />
        </View>
      </Pressable>
    </Animated.View>
  );
};

// ─── FilterChip ───────────────────────────────────────────────────────────────

const FilterChip: React.FC<{ label: string; onRemove: () => void }> = ({
  label,
  onRemove,
}) => (
  <View style={styles.chip}>
    <Text style={styles.chipText} numberOfLines={1}>
      {label}
    </Text>
    <Pressable onPress={onRemove} hitSlop={8}>
      <Ionicons name="close" size={11} color={COLORS.accent} />
    </Pressable>
  </View>
);

// ─── SkeletonCard ─────────────────────────────────────────────────────────────

const SkeletonCard: React.FC<{ index: number }> = ({ index }) => {
  const pulse = useRef(new Animated.Value(0.35)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.9,
          duration: 700,
          delay: index * 80,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.35,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[styles.card, { opacity: pulse }]}>
      <View style={styles.cardInner}>
        <View style={[styles.cardIcon, { backgroundColor: COLORS.border }]} />
        <View style={{ flex: 1, gap: 8 }}>
          <View
            style={{
              height: 13,
              width: "70%",
              borderRadius: 6,
              backgroundColor: COLORS.border,
            }}
          />
          <View
            style={{
              height: 10,
              width: "45%",
              borderRadius: 6,
              backgroundColor: COLORS.border,
            }}
          />
        </View>
      </View>
    </Animated.View>
  );
};

// ─── OptionSheet ──────────────────────────────────────────────────────────────

interface OptionSheetProps {
  visible: boolean;
  title: string;
  data: FilterOption[];
  selectedValue: string;
  labelKey: keyof FilterOption;
  onClose: () => void;
  onSelect: (item: FilterOption) => void;
}

const OptionSheet: React.FC<OptionSheetProps> = ({
  visible,
  title,
  data,
  selectedValue,
  labelKey,
  onClose,
  onSelect,
}) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [search, setSearch] = useState("");

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : SCREEN_HEIGHT,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
    if (!visible) setSearch("");
  }, [visible]);

  const filtered = data.filter((item) =>
    ((item[labelKey] as string) ?? "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <Modal visible={visible} transparent animationType="none">
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View
        style={[styles.optionSheet, { transform: [{ translateY: slideAnim }] }]}
      >
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <Pressable onPress={onClose} style={styles.iconBtn} hitSlop={12}>
            <Ionicons
              name="chevron-back"
              size={18}
              color={COLORS.textSecondary}
            />
          </Pressable>
          <Text style={styles.sheetTitle}>{title}</Text>
          <View style={{ width: 34 }} />
        </View>
        <View style={styles.sheetSearch}>
          <Ionicons name="search-outline" size={14} color={COLORS.textMuted} />
          <TextInput
            style={styles.sheetSearchInput}
            placeholder={`Search…`}
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {filtered.map((item, i) => {
            const label = (item[labelKey] as string) ?? "";
            const val = item.name ?? item.id ?? item.value ?? "";
            const active = selectedValue === val;
            return (
              <Pressable
                key={i}
                onPress={() => onSelect(item)}
                style={[styles.optionRow, active && styles.optionRowActive]}
              >
                <Text
                  style={[styles.optionText, active && styles.optionTextActive]}
                >
                  {label}
                </Text>
                {active && (
                  <Ionicons name="checkmark" size={14} color={COLORS.accent} />
                )}
              </Pressable>
            );
          })}
          {filtered.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons
                name="search-outline"
                size={26}
                color={COLORS.textMuted}
              />
              <Text style={styles.emptyText}>No results found</Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

// ─── FilterSheet ──────────────────────────────────────────────────────────────

interface FilterSheetProps {
  visible: boolean;
  filterLists: FilterLists | null;
  filterLabels: FilterState;
  filterQueries: FilterQueryState;
  loading: boolean;
  onClose: () => void;
  onReset: () => void;
  onApply: (queries: FilterQueryState, labels: FilterState) => void;
}

const FilterSheet: React.FC<FilterSheetProps> = ({
  visible,
  filterLists,
  filterLabels,
  filterQueries,
  loading,
  onClose,
  onReset,
  onApply,
}) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const [activeSubSheet, setActiveSubSheet] = useState<
    keyof FilterState | null
  >(null);
  const [localLabels, setLocalLabels] = useState<FilterState>(filterLabels);
  const [localQueries, setLocalQueries] =
    useState<FilterQueryState>(filterQueries);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : SCREEN_HEIGHT,
      useNativeDriver: true,
      tension: 55,
      friction: 11,
    }).start();
  }, [visible]);

  useEffect(() => {
    setLocalLabels(filterLabels);
    setLocalQueries(filterQueries);
  }, [filterLabels, filterQueries]);

  const activeCount = Object.values(localLabels).filter(Boolean).length;

  const getSheetData = (key: keyof FilterState): FilterOption[] => {
    if (!filterLists) return [];
    const map: Record<keyof FilterState, FilterOption[]> = {
      subjectVocab: filterLists.subjectVocab,
      subject: filterLists.subject,
      contributorPerson: filterLists.contributorPerson,
      contributioncrp: filterLists.contributioncrp,
      contributorProject: filterLists.contributorProject,
      contributorProjectleadInstitute:
        filterLists.contributorProjectleadInstitute,
      source: filterLists.source,
      groups: filterLists.groups,
    };
    return map[key] ?? [];
  };

  const getLabelKey = (key: keyof FilterState): keyof FilterOption =>
    key === "groups" ? "title" : key === "subjectVocab" ? "label" : "name";

  const handleSubSelect = (key: keyof FilterState, item: FilterOption) => {
    const queryMap: Record<keyof FilterState, string> = {
      subjectVocab: `subject_vocab=${item.value ?? item.name}&`,
      subject: `subject=${item.name}&`,
      contributorPerson: `contributor_person=${item.name}&`,
      contributioncrp: `contributioncrp=${item.name}&`,
      contributorProject: `contributor_project=${item.name}&`,
      contributorProjectleadInstitute: `contributor_projectlead_institute=${item.name}&`,
      source: `source=${item.name}&`,
      groups: `groups=${item.id}&`,
    };
    const labelMap: Record<keyof FilterState, string> = {
      subjectVocab: item.label ?? item.name ?? "",
      subject: item.name ?? "",
      contributorPerson: item.name ?? "",
      contributioncrp: item.name ?? "",
      contributorProject: item.name ?? "",
      contributorProjectleadInstitute: item.name ?? "",
      source: item.name ?? "",
      groups: item.title ?? "",
    };
    const qKey = `selected${key}` as keyof FilterQueryState;
    setLocalQueries((p) => ({ ...p, [qKey]: queryMap[key] }));
    setLocalLabels((p) => ({ ...p, [key]: labelMap[key] }));
    setActiveSubSheet(null);
  };

  const handleRemove = (key: keyof FilterState) => {
    const qKey = `selected${key}` as keyof FilterQueryState;
    setLocalQueries((p) => ({ ...p, [qKey]: "" }));
    setLocalLabels((p) => ({ ...p, [key]: "" }));
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="none">
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View
          style={[
            styles.filterSheet,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>
              Filters
              {activeCount > 0 && (
                <Text style={{ color: COLORS.accent }}> · {activeCount}</Text>
              )}
            </Text>
            <Pressable onPress={onClose} style={styles.iconBtn} hitSlop={12}>
              <Ionicons name="close" size={18} color={COLORS.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.filterSheetScroll}
          >
            {loading ? (
              <View style={styles.filterLoading}>
                <ActivityIndicator color={COLORS.accent} />
                <Text style={styles.filterLoadingText}>Loading filters…</Text>
              </View>
            ) : (
              FILTER_ACTIONS.map((action) => {
                const selected = localLabels[action.value];
                return (
                  <Pressable
                    key={action.value}
                    onPress={() => setActiveSubSheet(action.value)}
                    style={[
                      styles.filterRow,
                      !!selected && styles.filterRowActive,
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.filterRowLabel}>{action.title}</Text>
                      <Text
                        numberOfLines={1}
                        style={
                          selected
                            ? styles.filterRowSelected
                            : styles.filterRowPlaceholder
                        }
                      >
                        {selected || "Any"}
                      </Text>
                    </View>
                    {selected ? (
                      <Pressable
                        onPress={() => handleRemove(action.value)}
                        hitSlop={10}
                      >
                        <Ionicons
                          name="close-circle"
                          size={18}
                          color={COLORS.accent}
                        />
                      </Pressable>
                    ) : (
                      <Ionicons
                        name="chevron-forward"
                        size={15}
                        color={COLORS.textMuted}
                      />
                    )}
                  </Pressable>
                );
              })
            )}
          </ScrollView>

          <View style={styles.filterFooter}>
            <Pressable
              style={styles.resetBtn}
              onPress={() => {
                setLocalLabels(EMPTY_FILTER_STATE);
                setLocalQueries(EMPTY_QUERY_STATE);
                onReset();
              }}
            >
              <Text style={styles.resetBtnText}>Reset</Text>
            </Pressable>
            <Pressable
              style={styles.applyBtn}
              onPress={() => {
                onApply(localQueries, localLabels);
                onClose();
              }}
            >
              <Text style={styles.applyBtnText}>Apply Filters</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Modal>

      {FILTER_ACTIONS.map((action) => (
        <OptionSheet
          key={action.value}
          visible={activeSubSheet === action.value}
          title={action.title}
          data={getSheetData(action.value)}
          selectedValue={localLabels[action.value]}
          labelKey={getLabelKey(action.value)}
          onClose={() => setActiveSubSheet(null)}
          onSelect={(item) => handleSubSelect(action.value, item)}
        />
      ))}
    </>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const Datasets: React.FC = () => {
  const navigation = useNavigation();

  const [searchVisible, setSearchVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<DatasetItem[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [filterLists, setFilterLists] = useState<FilterLists | null>(null);
  const [filterListsLoading, setFilterListsLoading] = useState(false);
  const [filterLabels, setFilterLabels] =
    useState<FilterState>(EMPTY_FILTER_STATE);
  const [filterQueries, setFilterQueries] =
    useState<FilterQueryState>(EMPTY_QUERY_STATE);

  const searchBarAnim = useRef(new Animated.Value(0)).current;

  const activeFiltersCount = Object.values(filterLabels).filter(Boolean).length;

  const fetchData = async (
    reset = false,
    queries: FilterQueryState = filterQueries
  ) => {
    const currentPage = reset ? 1 : page;
    if (reset) {
      setPage(1);
      setIsLoading(true);
    } else {
      setLoadingMore(true);
    }

    const qStr =
      Object.values(queries).join("") + `per_page=20&page=${currentPage}`;
    try {
      const res = await fetch(`${Service.projectsUrl}filter?${qStr}`);
      const json = await res.json();
      const items: DatasetItem[] = json.items ?? [];
      setData((prev) =>
        reset || currentPage === 1 ? items : [...prev, ...items]
      );
      setTotalCount(json.total?.count ?? null);
    } catch (err: any) {
      Alert.alert(
        "Connection Error",
        "Check your internet and try again.",
        [
          {
            text: "Go back",
            onPress: () => navigation.goBack(),
            style: "cancel",
          },
          { text: "Retry", onPress: () => fetchData(reset, queries) },
        ],
        { cancelable: false }
      );
      Vibration.vibrate();
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const getFilterLists = async () => {
    setFilterListsLoading(true);
    try {
      const res = await fetch(`${Service.projectsUrl}filter_lists`);
      setFilterLists(await res.json());
    } catch {
      Alert.alert("Error", "Could not load filter options.");
    } finally {
      setFilterListsLoading(false);
    }
  };

  const handleApplyFilters = (
    queries: FilterQueryState,
    labels: FilterState
  ) => {
    setFilterQueries(queries);
    setFilterLabels(labels);
    fetchData(true, queries);
  };

  const handleResetFilters = () => {
    setFilterLabels(EMPTY_FILTER_STATE);
    setFilterQueries(EMPTY_QUERY_STATE);
    setFilterSheetVisible(false);
    fetchData(true, EMPTY_QUERY_STATE);
  };

  const handleRemoveChip = (key: keyof FilterState) => {
    const qKey = `selected${key}` as keyof FilterQueryState;
    const newQueries = { ...filterQueries, [qKey]: "" };
    const newLabels = { ...filterLabels, [key]: "" };
    setFilterQueries(newQueries);
    setFilterLabels(newLabels);
    fetchData(true, newQueries);
  };

  const handleSearch = useCallback(() => {
    if (!searchTerm.trim()) return fetchData(true);
    setIsLoading(true);
    fetch(
      `${Service.projectsUrl}search_items?query=${encodeURIComponent(
        searchTerm.trim()
      )}&per_page=20&page=1`
    )
      .then((r) => r.json())
      .then((json) => {
        setData(json.items ?? []);
        setTotalCount(json.total?.count ?? null);
      })
      .catch(() => Alert.alert("Search Error", "Could not complete search."))
      .finally(() => setIsLoading(false));
  }, [searchTerm]);

  const toggleSearch = () => {
    Animated.timing(searchBarAnim, {
      toValue: searchVisible ? 0 : 1,
      duration: 220,
      useNativeDriver: false,
    }).start();
    setSearchVisible((v) => !v);
    if (searchVisible) {
      setSearchTerm("");
      fetchData(true);
    }
  };

  useEffect(() => {
    fetchData(true);
  }, []);

  const searchBarHeight = searchBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 56],
  });
  const activeChips = FILTER_ACTIONS.filter((a) => filterLabels[a.value]);

  const renderItem = ({ item, index }: ListRenderItemInfo<DatasetItem>) => (
    <DatasetCard
      item={item}
      index={index}
      onPress={() =>
        (navigation as any).navigate("datafile", {
          id: item.id,
          identifier: item.identifier,
          embargo_end_date: item.embargo_end_date,
          creator: item.creator,
          title: item.title,
          notes: item.notes,
        })
      }
    />
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
        </Pressable>
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text style={styles.headerTitle}>Datasets</Text>
          {totalCount !== null && (
            <Text style={styles.headerSub}>
              {totalCount.toLocaleString()} records
            </Text>
          )}
        </View>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => {
              if (!filterLists) getFilterLists();
              setFilterSheetVisible(true);
            }}
            style={styles.iconBtn}
            hitSlop={8}
          >
            <Ionicons
              name="options-outline"
              size={20}
              color={COLORS.textPrimary}
            />
            {activeFiltersCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </Pressable>
          <Pressable
            onPress={toggleSearch}
            style={[styles.iconBtn, searchVisible && styles.iconBtnActive]}
            hitSlop={8}
          >
            <Ionicons
              name={searchVisible ? "close" : "search-outline"}
              size={20}
              color={searchVisible ? COLORS.accent : COLORS.textPrimary}
            />
          </Pressable>
        </View>
      </View>

      {/* ── Search bar ── */}
      <Animated.View style={{ height: searchBarHeight, overflow: "hidden" }}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={15} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search datasets…"
            placeholderTextColor={COLORS.textMuted}
            value={searchTerm}
            onChangeText={setSearchTerm}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus={searchVisible}
          />
          {searchTerm.length > 0 && (
            <Pressable
              onPress={() => {
                setSearchTerm("");
                fetchData(true);
              }}
              hitSlop={8}
            >
              <Ionicons
                name="close-circle"
                size={15}
                color={COLORS.textMuted}
              />
            </Pressable>
          )}
        </View>
      </Animated.View>

      {/* ── Active filter chips ── */}
      {activeChips.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {activeChips.map((a) => (
            <FilterChip
              key={a.value}
              label={filterLabels[a.value]}
              onRemove={() => handleRemoveChip(a.value)}
            />
          ))}
        </ScrollView>
      )}

      {/* ── List ── */}
      {isLoading ? (
        <ScrollView contentContainerStyle={styles.listContent}>
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} index={i} />
          ))}
        </ScrollView>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item, i) => item.id + i}
          contentContainerStyle={styles.listContent}
          onRefresh={() => {
            setRefreshing(true);
            fetchData(true);
          }}
          refreshing={refreshing}
          onEndReached={() => {
            if (!loadingMore && data.length >= 20) {
              setPage((p) => p + 1);
              fetchData(false);
            }
          }}
          onEndReachedThreshold={1.5}
          initialNumToRender={20}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="folder-open-outline"
                size={36}
                color={COLORS.textMuted}
              />
              <Text style={styles.emptyText}>No datasets found</Text>
              <Text style={styles.emptySubText}>
                Try adjusting your filters or search
              </Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 20, alignItems: "center" }}>
                <ActivityIndicator color={COLORS.accent} size="small" />
              </View>
            ) : null
          }
        />
      )}

      {/* ── Filter sheet ── */}
      <FilterSheet
        visible={filterSheetVisible}
        filterLists={filterLists}
        filterLabels={filterLabels}
        filterQueries={filterQueries}
        loading={filterListsLoading}
        onClose={() => setFilterSheetVisible(false)}
        onReset={handleResetFilters}
        onApply={handleApplyFilters}
      />
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textPrimary,
    letterSpacing: 0.2,
  },
  headerSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  headerActions: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconBtnActive: {
    backgroundColor: COLORS.accentMuted,
    borderColor: COLORS.accentBorder,
  },
  badge: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontSize: 9, fontWeight: "800", color: COLORS.white },

  // Search
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 40,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.textPrimary },

  // Chips
  chipsRow: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.accentMuted,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    maxWidth: 150,
  },
  chipText: { fontSize: 12, fontWeight: "600", color: COLORS.accent, flex: 1 },

  // List
  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 },

  // Card
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.accentMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: 2,
  },
  cardNotes: { fontSize: 12, color: COLORS.textSecondary },

  // Empty
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 10 },
  emptyText: { fontSize: 15, fontWeight: "600", color: COLORS.textSecondary },
  emptySubText: { fontSize: 13, color: COLORS.textMuted },

  // Sheet shared
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)" },
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sheetTitle: { fontSize: 16, fontWeight: "700", color: COLORS.textPrimary },
  sheetSearch: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 40,
  },
  sheetSearchInput: { flex: 1, fontSize: 14, color: COLORS.textPrimary },

  // Option sheet
  optionSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surfaceElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.72,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionRowActive: { backgroundColor: COLORS.accentMuted },
  optionText: { fontSize: 14, color: COLORS.textSecondary },
  optionTextActive: { color: COLORS.accent, fontWeight: "600" },

  // Filter sheet
  filterSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surfaceElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.78,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  filterSheetScroll: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterRowActive: {
    borderColor: COLORS.accentBorder,
    backgroundColor: COLORS.accentMuted,
  },
  filterRowLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMuted,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  filterRowSelected: { fontSize: 14, fontWeight: "600", color: COLORS.accent },
  filterRowPlaceholder: { fontSize: 14, color: COLORS.textMuted },
  filterLoading: { alignItems: "center", paddingVertical: 40, gap: 12 },
  filterLoadingText: { fontSize: 14, color: COLORS.textMuted },
  filterFooter: {
    flexDirection: "row",
    gap: 10,
    padding: 20,
    paddingBottom: 36,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  resetBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  applyBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    alignItems: "center",
  },
  applyBtnText: { fontSize: 15, fontWeight: "700", color: COLORS.white },
});

export default Datasets;
