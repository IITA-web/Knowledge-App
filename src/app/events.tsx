import { useLanguage } from "@/context/LanguageContext";
import i18n from "@/i18n";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Service } from "../utils/service";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: "rgb(242, 242, 242)",
  surface: "#FFFFFF",
  elevated: "#F5F5F5",
  border: "#E8E8E8",
  accent: "#FF6B35",
  accentSoft: "rgba(255,107,53,0.10)",
  accentGlow: "rgba(255,107,53,0.06)",
  green: "#10B981",
  greenSoft: "rgba(16,185,129,0.10)",
  amber: "#F59E0B",
  amberSoft: "rgba(245,158,11,0.10)",
  muted: "#888899",
  dim: "#BBBBCC",
  text: "#1A1A1A",
  white: "#FFFFFF",
  pastOverlay: "rgba(136,136,153,0.08)",
};

const { width: SW } = Dimensions.get("window");

// ─── Hub Filters ───────────────────────────────────────────────────────────────
const HUBS = [
  {
    label: "All",
    labelKey: "events.allRegions",
    url: "https://iita.org/wp-json/wp/v2/event",
    icon: "globe-outline",
    short: "All Regions",
  },
  {
    label: "Western Africa",
    labelKey: "events.westernAfrica",
    url: "https://iita.org/wp-json/wp/v2/event?filter[event_type]=western-africa",
    icon: "location-outline",
    short: "W. Africa Hub",
  },
  {
    label: "Central Africa",
    labelKey: "events.centralAfrica",
    url: "https://iita.org/wp-json/wp/v2/event?filter[event_type]=central-africa",
    icon: "location-outline",
    short: "C. Africa Hub",
  },
  {
    label: "Eastern Africa",
    labelKey: "events.easternAfrica",
    url: "https://iita.org/wp-json/wp/v2/event?filter[event_type]=eastern-africa",
    icon: "location-outline",
    short: "E. Africa Hub",
  },
  {
    label: "Southern Africa",
    labelKey: "events.southernAfrica",
    url: "https://iita.org/wp-json/wp/v2/event?filter[event_type]=southern-africa",
    icon: "location-outline",
    short: "S. Africa Hub",
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

const getBadge = (dateStr: string, isPast: boolean) => {
  if (!dateStr) return { label: "—", color: C.muted, bg: C.elevated };

  const diff = moment(dateStr).diff(moment(), "days");

  if (isPast) {
    const ago = moment().diff(moment(dateStr), "days");
    if (ago === 0)
      return { label: i18n.t("events.today"), color: C.muted, bg: C.elevated };
    if (ago === 1)
      return {
        label: i18n.t("events.yesterday"),
        color: C.muted,
        bg: C.elevated,
      };
    return {
      label: `${ago} ${i18n.t("events.daysAgo")}`,
      color: C.muted,
      bg: C.elevated,
    };
  }

  if (diff === 0)
    return { label: i18n.t("events.today"), color: C.accent, bg: C.accentSoft };
  if (diff === 1)
    return {
      label: i18n.t("events.tomorrow"),
      color: C.amber,
      bg: C.amberSoft,
    };
  if (diff <= 7)
    return {
      label: i18n.t("events.inDays").replace("{{count}}", String(diff)),
      color: C.green,
      bg: C.greenSoft,
    };

  return {
    label: moment(dateStr).format("MMM D"),
    color: C.muted,
    bg: C.elevated,
  };
};

// ─── Event Card ────────────────────────────────────────────────────────────────

const EventCard = ({ item, onPress, index, isPast }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 340,
        delay: Math.min(index * 55, 420),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 340,
        delay: Math.min(index * 55, 420),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onPressIn = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.975,
      useNativeDriver: true,
      tension: 200,
    }).start();
  const onPressOut = () =>
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
    }).start();

  const title = item.title?.rendered ?? "";
  const eventDate = item.date ?? ""; // ISO string — replaces metadata.evcal_srow
  const badge = getBadge(eventDate, isPast);

  // Location — extract from class_list e.g. "location-rwanda" → "Rwanda"
  const locationSlug = item.class_list?.find((cls: string) =>
    cls.startsWith("location-")
  );
  const locationLabel = locationSlug
    ? locationSlug
        .replace("location-", "")
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c: string) => c.toUpperCase())
    : null;

  // Event type — extract from class_list e.g. "event-type-hybrid" → "Hybrid"
  const eventTypeSlug = item.class_list?.find((cls: string) =>
    cls.startsWith("event-type-")
  );
  const eventTypeLabel = eventTypeSlug
    ? eventTypeSlug
        .replace("event-type-", "")
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c: string) => c.toUpperCase())
    : null;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
        marginBottom: 12,
      }}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={{
          backgroundColor: isPast ? C.elevated : C.surface,
          borderRadius: 16,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isPast ? 0.03 : 0.06,
          shadowRadius: 8,
          elevation: isPast ? 1 : 3,
          opacity: isPast ? 0.82 : 1,
        }}
      >
        {/* Left accent bar */}
        <View
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            backgroundColor: isPast ? C.dim : C.accent,
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
          }}
        />

        <View
          style={{ paddingLeft: 20, paddingRight: 16, paddingVertical: 16 }}
        >
          {/* Top row — badge + event type pill */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: badge.bg,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 20,
                gap: 5,
              }}
            >
              <Ionicons
                name={isPast ? "time-outline" : "calendar-outline"}
                size={12}
                color={badge.color}
              />
              <Text
                style={{
                  color: badge.color,
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 0.3,
                }}
              >
                {badge.label}
              </Text>
            </View>

            {eventTypeLabel && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: C.elevated,
                  paddingHorizontal: 9,
                  paddingVertical: 4,
                  borderRadius: 20,
                  gap: 4,
                }}
              >
                <Ionicons name="radio-button-on" size={8} color={C.muted} />
                <Text
                  style={{ color: C.muted, fontSize: 11, fontWeight: "600" }}
                >
                  {eventTypeLabel}
                </Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text
            numberOfLines={2}
            style={{
              color: isPast ? C.muted : C.text,
              fontSize: 15,
              fontWeight: "700",
              lineHeight: 21,
              letterSpacing: 0.1,
              marginBottom: 10,
            }}
          >
            {title}
          </Text>

          {/* Footer — date + location */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            {eventDate ? (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
              >
                <Ionicons name="time-outline" size={13} color={C.muted} />
                <Text
                  style={{ color: C.muted, fontSize: 12, fontWeight: "500" }}
                >
                  {moment(eventDate).format("MMM D, YYYY")}
                </Text>
              </View>
            ) : null}

            {locationLabel && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  flex: 1,
                }}
              >
                <Ionicons name="location-outline" size={13} color={C.muted} />
                <Text
                  numberOfLines={1}
                  style={{
                    color: C.muted,
                    fontSize: 12,
                    fontWeight: "500",
                    flex: 1,
                  }}
                >
                  {locationLabel}
                </Text>
              </View>
            )}

            <Ionicons
              name="chevron-forward"
              size={16}
              color={isPast ? C.dim : C.accent}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Tab Bar ───────────────────────────────────────────────────────────────────
const TabBar = ({ activeTab, onTabChange, upcomingCount, pastCount }: any) => {
  const { language } = useLanguage();
  const indicatorX = useRef(new Animated.Value(0)).current;
  const TAB_W = (SW - 32) / 2;

  const switchTab = (tab: "upcoming" | "past") => {
    Animated.spring(indicatorX, {
      toValue: tab === "upcoming" ? 0 : TAB_W,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
    onTabChange(tab);
  };

  return (
    <View style={{ marginHorizontal: 16, marginTop: 14, marginBottom: 4 }}>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: C.elevated,
          borderRadius: 14,
          padding: 4,
          position: "relative",
        }}
      >
        {/* Sliding pill */}
        <Animated.View
          style={{
            position: "absolute",
            top: 4,
            left: 4,
            width: TAB_W,
            height: 40,
            backgroundColor: C.surface,
            borderRadius: 10,
            shadowColor: "#000",
            shadowOpacity: 0.07,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
            transform: [{ translateX: indicatorX }],
          }}
        />

        {[
          {
            key: "upcoming",
            labelKey: "events.upcoming",
            count: upcomingCount,
            icon: "calendar-outline",
          },
          {
            key: "past",
            labelKey: "events.past",
            count: pastCount,
            icon: "archive-outline",
          },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => switchTab(tab.key as any)}
              activeOpacity={0.8}
              style={{
                flex: 1,
                height: 40,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                zIndex: 1,
              }}
            >
              <Ionicons
                name={tab.icon as any}
                size={15}
                color={isActive ? C.accent : C.muted}
              />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? "700" : "500",
                  color: isActive ? C.accent : C.muted,
                }}
              >
                {language && i18n.t(tab.labelKey)}
              </Text>
              {tab.count > 0 && (
                <View
                  style={{
                    backgroundColor: isActive ? C.accentSoft : C.border,
                    borderRadius: 10,
                    paddingHorizontal: 6,
                    paddingVertical: 1,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "700",
                      color: isActive ? C.accent : C.muted,
                    }}
                  >
                    {tab.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// ─── Filter Bottom Sheet ───────────────────────────────────────────────────────
const FilterSheet = ({ visible, onClose, activeUrl, onSelect }: any) => {
  const { language } = useLanguage();
  const slideAnim = useRef(new Animated.Value(500)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: visible ? 0 : 500,
        useNativeDriver: true,
        tension: 68,
        friction: 12,
      }),
      Animated.timing(backdropAnim, {
        toValue: visible ? 1 : 0,
        useNativeDriver: true,
        duration: 220,
      }),
    ]).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Pressable style={{ flex: 1 }} onPress={onClose}>
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.35)",
            opacity: backdropAnim,
          }}
        >
          <Animated.View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: C.surface,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              transform: [{ translateY: slideAnim }],
              shadowColor: "#000",
              shadowOpacity: 0.12,
              shadowRadius: 20,
              elevation: 25,
              paddingBottom: Platform.OS === "ios" ? 36 : 28,
            }}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              {/* Handle */}
              <View
                style={{
                  alignItems: "center",
                  paddingTop: 14,
                  paddingBottom: 4,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: C.border,
                  }}
                />
              </View>

              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: C.border,
                  marginBottom: 6,
                }}
              >
                <View>
                  <Text
                    style={{ color: C.text, fontSize: 18, fontWeight: "800" }}
                  >
                    {language && i18n.t("events.filterByHub")}
                  </Text>
                  <Text style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>
                    {HUBS.find((h) => h.url === activeUrl)?.label ??
                      i18n.t("events.allRegions")}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: C.elevated,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="close" size={20} color={C.text} />
                </TouchableOpacity>
              </View>

              {/* Hub options */}
              <SafeAreaView style={{ paddingHorizontal: 16, gap: 8 }}>
                <ScrollView style={{ flex: 1 }}>
                  {HUBS.map((hub, i) => {
                    const isActive = activeUrl === hub.url;
                    return (
                      <TouchableOpacity
                        key={i}
                        onPress={() => {
                          onSelect(hub.url);
                          onClose();
                        }}
                        activeOpacity={0.7}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 12,
                          paddingVertical: 14,
                          paddingHorizontal: 16,
                          borderRadius: 14,
                          borderWidth: 1.5,
                          borderColor: isActive ? C.accent : C.border,
                          backgroundColor: isActive ? C.accentSoft : C.surface,
                          marginBottom: 4,
                        }}
                      >
                        <View
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            backgroundColor: isActive ? C.accent : C.elevated,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Ionicons
                            name={hub.icon as any}
                            size={18}
                            color={isActive ? C.white : C.muted}
                          />
                        </View>
                        <Text
                          style={{
                            flex: 1,
                            fontSize: 15,
                            fontWeight: isActive ? "700" : "500",
                            color: isActive ? C.accent : C.text,
                          }}
                        >
                          {language && i18n.t(hub.labelKey)}
                        </Text>
                        {isActive && (
                          <View
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 11,
                              backgroundColor: C.accent,
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <Ionicons
                              name="checkmark"
                              size={13}
                              color={C.white}
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </SafeAreaView>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

// ─── Header ────────────────────────────────────────────────────────────────────
const Header = ({ onBack, onFilter, activeUrl }: any) => {
  const { language } = useLanguage();
  const isFiltered = activeUrl !== HUBS[0].url;
  const activeHub = HUBS.find((h) => h.url === activeUrl);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
        backgroundColor: C.bg,
        gap: 12,
      }}
    >
      <TouchableOpacity
        onPress={onBack}
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          backgroundColor: C.surface,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Ionicons name="arrow-back" size={20} color={C.text} />
      </TouchableOpacity>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: C.text,
            fontSize: 18,
            fontWeight: "800",
            letterSpacing: -0.3,
          }}
        >
          {language && i18n.t("events.screenTitle")}
        </Text>
        {isFiltered && (
          <Text
            style={{
              color: C.accent,
              fontSize: 11,
              fontWeight: "600",
              letterSpacing: 0.5,
            }}
          >
            {activeHub?.short?.toUpperCase()}
          </Text>
        )}
      </View>

      <TouchableOpacity
        onPress={onFilter}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingHorizontal: 14,
          paddingVertical: 9,
          borderRadius: 10,
          backgroundColor: isFiltered ? C.accentSoft : C.surface,
          borderWidth: 1.5,
          borderColor: isFiltered ? C.accent : C.border,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Ionicons
          name="options-outline"
          size={17}
          color={isFiltered ? C.accent : C.text}
        />
        <Text
          style={{
            fontSize: 13,
            fontWeight: "700",
            color: isFiltered ? C.accent : C.text,
          }}
        >
          {language && i18n.t("events.filter")}
        </Text>
        {isFiltered && (
          <View
            style={{
              width: 7,
              height: 7,
              borderRadius: 3.5,
              backgroundColor: C.accent,
            }}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

// ─── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = ({ isPast }: { isPast: boolean }) => {
  const { language } = useLanguage();
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -8,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 80,
      }}
    >
      <Animated.View
        style={{
          transform: [{ translateY: bounceAnim }],
          width: 80,
          height: 80,
          borderRadius: 24,
          backgroundColor: isPast ? C.elevated : C.accentSoft,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <Ionicons
          name={isPast ? "archive-outline" : "calendar-outline"}
          size={36}
          color={isPast ? C.muted : C.accent}
        />
      </Animated.View>
      <Text
        style={{
          color: C.text,
          fontSize: 17,
          fontWeight: "700",
          marginBottom: 8,
        }}
      >
        {language &&
          i18n.t(isPast ? "events.noPastTitle" : "events.noUpcomingTitle")}
      </Text>
      <Text
        style={{
          color: C.muted,
          fontSize: 14,
          textAlign: "center",
          paddingHorizontal: 40,
          lineHeight: 20,
        }}
      >
        {language &&
          i18n.t(isPast ? "events.noPastBody" : "events.noUpcomingBody")}
      </Text>
    </View>
  );
};

// ─── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonCard = ({ index }: { index: number }) => {
  const pulse = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 750,
          delay: index * 80,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={{
        opacity: pulse,
        backgroundColor: C.surface,
        borderRadius: 16,
        padding: 16,
        paddingLeft: 20,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: C.border,
      }}
    >
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
        <View
          style={{
            width: 72,
            height: 22,
            borderRadius: 11,
            backgroundColor: C.elevated,
          }}
        />
        <View
          style={{
            width: 90,
            height: 22,
            borderRadius: 11,
            backgroundColor: C.elevated,
          }}
        />
      </View>
      <View
        style={{
          height: 16,
          borderRadius: 8,
          backgroundColor: C.elevated,
          marginBottom: 6,
          width: "88%",
        }}
      />
      <View
        style={{
          height: 16,
          borderRadius: 8,
          backgroundColor: C.elevated,
          width: "55%",
        }}
      />
      <View
        style={{
          height: 14,
          borderRadius: 7,
          backgroundColor: C.elevated,
          width: "65%",
          marginTop: 12,
        }}
      />
    </Animated.View>
  );
};

// ─── Section Header ────────────────────────────────────────────────────────────
const SectionDivider = ({ label, count }: { label: string; count: number }) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
      gap: 10,
    }}
  >
    <Text
      style={{
        fontSize: 12,
        fontWeight: "700",
        color: C.muted,
        letterSpacing: 1,
      }}
    >
      {label.toUpperCase()}
    </Text>
    <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
    <View
      style={{
        backgroundColor: C.elevated,
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: "700", color: C.muted }}>
        {count}
      </Text>
    </View>
  </View>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
const Events = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const { language } = useLanguage();

  const [isLoading, setIsLoading] = useState(false);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [past, setPast] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [eventType, setEventType] = useState(Service.eventsUrl ?? HUBS[0].url);
  const [filterVisible, setFilterVisible] = useState(false);

  // Slide animation for tab content
  const slideX = useRef(new Animated.Value(0)).current;

  const switchTab = (tab: "upcoming" | "past") => {
    const toValue = tab === "upcoming" ? 0 : -SW;
    Animated.spring(slideX, {
      toValue,
      useNativeDriver: true,
      tension: 70,
      friction: 12,
    }).start();
    setActiveTab(tab);
  };

  const getEventTimestamp = (event: any): number | null => {
    const acfStart = event?.acf?.start_date || event?.acf?.event_start;
    if (acfStart) {
      const t = new Date(acfStart).getTime();
      if (!isNaN(t)) return t;
    }
    const evcalSrow = event?.metadata?.evcal_srow;
    if (evcalSrow) {
      const t = Number(evcalSrow) * 1000; // evcal_srow is epoch seconds
      if (!isNaN(t)) return t;
    }
    if (event?.date) {
      const t = new Date(event.date).getTime();
      if (!isNaN(t)) return t;
    }
    return null;
  };

  // const fetchEvents = useCallback(async () => {
  //   setIsLoading(true);

  //   try {
  //     // Always fetch all events
  //     const response = await fetch(HUBS[0].url);
  //     let json: any[] = await response.json();

  //     // Fallback local filtering if not "All"
  //     if (eventType !== HUBS[0].url) {
  //       const selectedHub = HUBS.find((h) => h.url === eventType);

  //       if (selectedHub) {
  //         const hubSlugMap = {
  //           "Western Africa": "western-africa",
  //           "Central Africa": "central-africa",
  //           "Eastern Africa": "eastern-africa",
  //           "Southern Africa": "southern-africa",
  //         };

  //         const slug = hubSlugMap[selectedHub.label as keyof typeof hubSlugMap];

  //         json = json.filter((event) =>
  //           // Hub is only ever expressed as a "hub-<slug>" class in
  //           // class_list now — pure_taxonomies doesn't exist on this API.
  //           slug ? event.class_list?.includes(`hub-${slug}`) : false
  //         );
  //         // console.log("json ==>> ", json);
  //       }
  //     }

  //     const now = Date.now();

  //     const upcomingList = json
  //       .filter((e) => {
  //         const t = getEventTimestamp(e);
  //         return t !== null && t >= now;
  //       })
  //       .sort(
  //         (a, b) => (getEventTimestamp(a) ?? 0) - (getEventTimestamp(b) ?? 0)
  //       );

  //     const pastList = json
  //       .filter((e) => {
  //         const t = getEventTimestamp(e);
  //         return t !== null && t < now;
  //       })
  //       .sort(
  //         (a, b) => (getEventTimestamp(b) ?? 0) - (getEventTimestamp(a) ?? 0)
  //       );

  //     setUpcoming(upcomingList);
  //     setPast(pastList);
  //   } catch {
  //     Vibration.vibrate();
  //     Alert.alert(
  //       i18n.t("events.connectionError"),
  //       i18n.t("events.checkConnection"),
  //       [
  //         {
  //           text: i18n.t("events.cancel"),
  //           onPress: () => navigation.goBack(),
  //           style: "cancel",
  //         },
  //         { text: i18n.t("events.retry"), onPress: fetchEvents },
  //       ],
  //       { cancelable: false }
  //     );
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, [eventType]);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch(HUBS[0].url);
      let json: any[] = await response.json();

      // Filter by hub/region using class_list slugs
      if (eventType !== HUBS[0].url) {
        const selectedHub = HUBS.find((h) => h.url === eventType);

        if (selectedHub) {
          // Map hub label to the class_list prefix used in the API response
          const hubClassMap: Record<string, string> = {
            "Western Africa": "location-", // adjust these slugs to match
            "Central Africa": "location-", // actual class_list values
            "Eastern Africa": "location-", // e.g. "location-nigeria", "location-ghana"
            "Southern Africa": "location-",
          };

          // Actually, filter by the location taxonomy id is more reliable.
          // But since we don't have a hub→location-id map, use class_list.
          // The class_list slugs follow the pattern "location-{slug}".
          // You need to define which location slugs belong to each hub.

          const hubLocationSlugs: Record<string, string[]> = {
            "Western Africa": [
              "location-nigeria",
              "location-ghana",
              "location-benin",
              "location-senegal",
              "location-mali",
              "location-burkina-faso",
              "location-ivory-coast",
              "location-cameroon",
            ],
            "Central Africa": [
              "location-drc",
              "location-congo",
              "location-central-african-republic",
              "location-gabon",
            ],
            "Eastern Africa": [
              "location-kenya",
              "location-ethiopia",
              "location-tanzania",
              "location-uganda",
              "location-rwanda",
            ],
            "Southern Africa": [
              "location-zambia",
              "location-zimbabwe",
              "location-mozambique",
              "location-malawi",
              "location-south-africa",
            ],
          };

          const allowedSlugs = hubLocationSlugs[selectedHub.label] ?? [];

          json = json.filter((event) =>
            event.class_list?.some((cls: string) => allowedSlugs.includes(cls))
          );
        }
      }

      // Date comparison — use ISO date string, not unix timestamp
      const now = new Date().toISOString();

      const upcomingList = json
        .filter((e) => e.date >= now)
        .sort((a, b) => a.date.localeCompare(b.date));

      const pastList = json
        .filter((e) => e.date < now)
        .sort((a, b) => b.date.localeCompare(a.date));

      setUpcoming(upcomingList);
      setPast(pastList);
    } catch {
      Vibration.vibrate();
      Alert.alert(
        i18n.t("events.connectionError"),
        i18n.t("events.checkConnection"),
        [
          {
            text: i18n.t("events.cancel"),
            onPress: () => navigation.goBack(),
            style: "cancel",
          },
          { text: i18n.t("events.retry"), onPress: fetchEvents },
        ],
        { cancelable: false }
      );
    } finally {
      setIsLoading(false);
    }
  }, [eventType]);

  useEffect(() => {
    fetchEvents();
  }, [eventType]);

  const navigateToEvent = (item: any) =>
    router.push({
      pathname: "/eventscontent",
      params: {
        id: item.id,
        title: item.title?.rendered,
        content: item.content?.rendered,
        link: item.link,
      },
    });

  const activeList = activeTab === "upcoming" ? upcoming : past;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <Header
        onBack={() => navigation.goBack()}
        onFilter={() => setFilterVisible(true)}
        activeUrl={eventType}
      />

      <TabBar
        activeTab={activeTab}
        onTabChange={switchTab}
        upcomingCount={upcoming.length}
        pastCount={past.length}
      />

      {isLoading ? (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingTop: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} index={i} />
          ))}
        </ScrollView>
      ) : activeList.length === 0 ? (
        <EmptyState isPast={activeTab === "past"} />
      ) : (
        <FlatList
          data={activeList}
          keyExtractor={(item, i) => `${item?.id}-${activeTab}-${i}`}
          contentContainerStyle={{
            padding: 16,
            paddingTop: 12,
            paddingBottom: 48,
          }}
          ListHeaderComponent={
            <SectionDivider
              label={
                language
                  ? i18n.t(
                      activeTab === "upcoming"
                        ? "events.upcoming"
                        : "events.past"
                    )
                  : activeTab
              }
              count={activeList.length}
            />
          }
          renderItem={({ item, index }) => (
            <EventCard
              item={item}
              index={index}
              isPast={activeTab === "past"}
              onPress={() => navigateToEvent(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FilterSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        activeUrl={eventType}
        onSelect={(url: string) => {
          setEventType(url);
        }}
      />
    </SafeAreaView>
  );
};

export default Events;
