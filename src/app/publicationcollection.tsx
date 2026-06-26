/**
 * app/publicationcollection.tsx
 *
 * IITA Publication Collections screen — "Field Intelligence" aesthetic.
 * Matches projects.tsx / projectscontent.tsx design system:
 * light BG, green accents, animated cards, skeleton loader.
 *
 * TypeScript + Expo Router.
 */

import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BackArrow from "../components/BackArrow";
import CustomHeader from "../components/CustomHeader";
import { Service } from "../utils/service";

// ─── Design tokens (shared system) ───────────────────────────────────────────
const GREEN = "#2D7D46";
const GREEN_LT = "#E8F5ED";
const ORANGE = "#F26522";
const DARK = "#111A14";
const BODY = "#3D4A41";
const MUTED = "#8A9E90";
const BORDER = "#E2EBE5";
const BG = "#F4F7F5";
const WHITE = "#FFFFFF";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Collection {
  uuid: string;
  name: string;
  archivedItemsCount?: number;
  type?: string;
  metadata?: Array<{ key: string; value: string }>;
  parentCollection?: { name: string };
}

// ─── Skeleton loader card ─────────────────────────────────────────────────────
const SkeletonCard: React.FC<{ index: number }> = ({ index }) => {
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          delay: index * 80,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.card, { opacity: pulse }]}>
      <View style={{ flex: 1 }}>
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonSub} />
      </View>
      <View style={styles.skeletonBadge} />
    </Animated.View>
  );
};

// ─── Collection card ──────────────────────────────────────────────────────────
interface CollectionCardProps {
  item: Collection;
  index: number;
  onPress: () => void;
}

const CollectionCard: React.FC<CollectionCardProps> = ({
  item,
  index,
  onPress,
}) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 340,
      delay: Math.min(index * 50, 500),
      useNativeDriver: true,
    }).start();
  }, []);

  const count = item?.archivedItemsCount ?? 0;
  const parent = item?.parentCollection?.name ?? "";
  const hasItems = count > 0;

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [
          {
            translateY: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [16, 0],
            }),
          },
        ],
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.76}
        style={styles.card}
      >
        {/* Left: icon tile */}
        <View style={styles.cardIconTile}>
          <Ionicons name="library-outline" size={18} color={GREEN} />
        </View>

        {/* Centre: text */}
        <View style={styles.cardBody}>
          {parent ? (
            <Text style={styles.cardParent} numberOfLines={1}>
              {parent}
            </Text>
          ) : null}
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item?.name}
          </Text>
          <View style={styles.cardMeta}>
            <Ionicons name="documents-outline" size={11} color={MUTED} />
            <Text style={styles.cardMetaText}>
              {hasItems ? `${count} item${count !== 1 ? "s" : ""}` : "No items"}
            </Text>
          </View>
        </View>

        {/* Right: count badge + arrow */}
        <View style={styles.cardRight}>
          {hasItems ? (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>
                {count > 999 ? "999+" : count}
              </Text>
            </View>
          ) : null}
          <View style={styles.arrowWrap}>
            <Ionicons name="arrow-forward" size={14} color={GREEN} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState: React.FC = () => (
  <View style={styles.empty}>
    <View style={styles.emptyIcon}>
      <Ionicons name="library-outline" size={36} color={GREEN} />
    </View>
    <Text style={styles.emptyTitle}>No collections found</Text>
    <Text style={styles.emptyBody}>
      Publication collections will appear here once available.
    </Text>
  </View>
);

// ─── List header ──────────────────────────────────────────────────────────────
interface ListHeaderProps {
  count: number;
}

const ListHeader: React.FC<ListHeaderProps> = ({ count }) => (
  <View style={styles.listHeader}>
    <View style={styles.listHeaderLeft}>
      <Ionicons name="folder-open-outline" size={14} color={GREEN} />
      <Text style={styles.listHeaderTag}>COLLECTIONS</Text>
    </View>
    {count > 0 ? (
      <Text style={styles.listHeaderCount}>{count} total</Text>
    ) : null}
  </View>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
const PublicationCollection: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const headerAnim = useRef(new Animated.Value(0)).current;

  const getData = () => {
    setLoading(true);
    setError(null);
    fetch(Service.CgsPace)
      .then((res) => res.json())
      .then((resp) => {
        setCollections(resp?._embedded?.collections ?? []);
        setLoading(false);
        Animated.timing(headerAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      })
      .catch((e: Error) => {
        setError(e.message ?? "Something went wrong");
        setLoading(false);
      });
  };

  useEffect(() => {
    if (collections.length === 0) getData();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />

      {/* Header */}
      <SafeAreaView style={{ backgroundColor: WHITE }}>
        <CustomHeader
          LeftIcon={<BackArrow />}
          onPressL={() => navigation.goBack()}
          title="Publications"
          RightIcon={
            !loading ? (
              <TouchableOpacity
                onPress={getData}
                style={styles.refreshBtn}
                activeOpacity={0.75}
              >
                <Ionicons name="refresh-outline" size={18} color={GREEN} />
              </TouchableOpacity>
            ) : undefined
          }
          onPressR={getData}
        />
      </SafeAreaView>

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: BORDER }} />

      {/* ── Loading skeletons ──────────────────────────────────────────── */}
      {loading ? (
        <View style={styles.skeletonWrap}>
          <View style={styles.skeletonHeaderBar} />
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} index={i} />
          ))}
        </View>
      ) : error ? (
        /* ── Error state ──────────────────────────────────────────────── */
        <View style={styles.errorWrap}>
          <View style={styles.errorIcon}>
            <Ionicons name="cloud-offline-outline" size={36} color={MUTED} />
          </View>
          <Text style={styles.errorTitle}>Failed to load</Text>
          <Text style={styles.errorBody}>{error}</Text>
          <TouchableOpacity
            onPress={getData}
            activeOpacity={0.8}
            style={styles.retryBtn}
          >
            <Ionicons name="refresh-outline" size={16} color={WHITE} />
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* ── Collection list ──────────────────────────────────────────── */
        <Animated.View
          style={{
            flex: 1,
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 0],
                }),
              },
            ],
          }}
        >
          <FlatList
            data={collections}
            keyExtractor={(item) => item.uuid}
            renderItem={({ item, index }) => (
              <CollectionCard
                item={item}
                index={index}
                onPress={() =>
                  router.push({
                    pathname: "/publicationcollectioncontent",
                    params: {
                      id: item.uuid,
                      otherParam: JSON.stringify(item), // serialize object
                    },
                  })
                }
              />
            )}
            ListHeaderComponent={<ListHeader count={collections.length} />}
            ListEmptyComponent={<EmptyState />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            initialNumToRender={15}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          />
        </Animated.View>
      )}
    </View>
  );
};

export default PublicationCollection;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },

  // ── List ──────────────────────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 48,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    paddingBottom: 12,
  },
  listHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  listHeaderTag: {
    fontSize: 10,
    fontWeight: "800",
    color: GREEN,
    letterSpacing: 1.2,
  },
  listHeaderCount: {
    fontSize: 11,
    fontWeight: "700",
    color: MUTED,
    letterSpacing: 0.3,
  },

  // ── Collection card ───────────────────────────────────────────────────────
  card: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: 12,
  },
  cardIconTile: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: GREEN_LT,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  cardBody: {
    flex: 1,
  },
  cardParent: {
    fontSize: 10,
    fontWeight: "700",
    color: MUTED,
    letterSpacing: 0.4,
    marginBottom: 3,
    textTransform: "uppercase",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: DARK,
    lineHeight: 20,
    marginBottom: 5,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardMetaText: {
    fontSize: 11,
    color: MUTED,
    fontWeight: "500",
  },
  cardRight: {
    alignItems: "flex-end",
    gap: 6,
    flexShrink: 0,
  },
  countBadge: {
    backgroundColor: ORANGE,
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 28,
    alignItems: "center",
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: WHITE,
  },
  arrowWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: GREEN_LT,
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Refresh button ────────────────────────────────────────────────────────
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: GREEN_LT,
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Skeleton ──────────────────────────────────────────────────────────────
  skeletonWrap: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: BG,
    paddingTop: 16,
    gap: 10,
  },
  skeletonHeaderBar: {
    height: 14,
    width: 120,
    backgroundColor: BORDER,
    borderRadius: 7,
    marginBottom: 6,
  },
  skeletonTitle: {
    height: 14,
    width: "75%",
    backgroundColor: BORDER,
    borderRadius: 7,
    marginBottom: 8,
  },
  skeletonSub: {
    height: 11,
    width: "40%",
    backgroundColor: BORDER,
    borderRadius: 6,
  },
  skeletonBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BORDER,
  },

  // ── Empty state ───────────────────────────────────────────────────────────
  empty: {
    alignItems: "center",
    paddingTop: 72,
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

  // ── Error state ───────────────────────────────────────────────────────────
  errorWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  errorIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F5F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: DARK,
    marginBottom: 8,
  },
  errorBody: {
    fontSize: 14,
    color: MUTED,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: GREEN,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: GREEN,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  retryText: {
    fontSize: 15,
    fontWeight: "700",
    color: WHITE,
  },
});
