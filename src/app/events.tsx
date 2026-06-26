import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  Modal,
  Pressable,
  StatusBar,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Service } from "../utils/service";

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

// ─── Hub Filters ───────────────────────────────────────────────────────────────
const HUBS = [
  {
    label: "All",
    url: "https://iita.org/wp-json/wp/v2/ajde_events",
    icon: "globe-outline",
    short: "All Regions",
  },
  {
    label: "Western Africa",
    url: "https://iita.org/wp-json/wp/v2/ajde_events?filter[event_type]=western-africa",
    icon: "location-outline",
    short: "W. Africa Hub",
  },
  {
    label: "Central Africa",
    url: "https://iita.org/wp-json/wp/v2/ajde_events?filter[event_type]=central-africa",
    icon: "location-outline",
    short: "C. Africa Hub",
  },
  {
    label: "Eastern Africa",
    url: "https://iita.org/wp-json/wp/v2/ajde_events?filter[event_type]=eastern-africa",
    icon: "location-outline",
    short: "E. Africa Hub",
  },
  {
    label: "Southern Africa",
    url: "https://iita.org/wp-json/wp/v2/ajde_events?filter[event_type]=southern-africa",
    icon: "location-outline",
    short: "S. Africa Hub",
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const sortByDate = (arr: any) =>
  [...arr].sort((a, b) => b.metadata.evcal_srow - a.metadata.evcal_srow);

const getDaysUntil = (unixSeconds: any) => {
  const diff = moment(unixSeconds * 1000).diff(moment(), "days");
  if (diff === 0) return { label: "Today", color: COLORS.accent };
  if (diff === 1) return { label: "Tomorrow", color: "#F59E0B" };
  if (diff <= 7) return { label: `In ${diff} days`, color: "#10B981" };
  return {
    label: moment(unixSeconds * 1000).format("MMM D"),
    color: COLORS.textMuted,
  };
};

// ─── Event Card ────────────────────────────────────────────────────────────────
const EventCard = ({ item, onPress, index }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 320,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 320,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.975,
      useNativeDriver: true,
      tension: 200,
    }).start();
  const handlePressOut = () =>
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
    }).start();

  const eventTitle = item.title?.rendered ?? "";
  const hub = item.pure_taxonomies?.event_type?.[0]?.name;
  const location = item.pure_taxonomies?.event_location?.[0];
  const unixSec = item.metadata?.evcal_srow;
  const badge = getDaysUntil(unixSec);

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
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          backgroundColor: COLORS.surface,
          borderRadius: 16,
          overflow: "hidden",
          shadowColor: COLORS.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        {/* Orange left accent bar */}
        <View
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            backgroundColor: COLORS.accent,
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
          }}
        />

        <View
          style={{ paddingLeft: 20, paddingRight: 16, paddingVertical: 16 }}
        >
          {/* Top row: badge + chevron */}
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
                backgroundColor: COLORS.accentSoft,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 20,
                gap: 5,
              }}
            >
              <Ionicons
                name="calendar-outline"
                size={12}
                color={COLORS.accent}
              />
              <Text
                style={{
                  color: COLORS.accent,
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 0.3,
                }}
              >
                {badge.label}
              </Text>
            </View>

            {hub && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: COLORS.surfaceElevated,
                  paddingHorizontal: 9,
                  paddingVertical: 4,
                  borderRadius: 20,
                  gap: 4,
                }}
              >
                <Ionicons
                  name="radio-button-on"
                  size={8}
                  color={COLORS.textMuted}
                />
                <Text
                  style={{
                    color: COLORS.textMuted,
                    fontSize: 11,
                    fontWeight: "600",
                  }}
                >
                  {hub}
                </Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text
            numberOfLines={2}
            style={{
              color: COLORS.text,
              fontSize: 15,
              fontWeight: "700",
              lineHeight: 21,
              letterSpacing: 0.1,
              marginBottom: 10,
            }}
          >
            {eventTitle}
          </Text>

          {/* Footer row */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            {unixSec && (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
              >
                <Ionicons
                  name="time-outline"
                  size={13}
                  color={COLORS.textMuted}
                />
                <Text
                  style={{
                    color: COLORS.textMuted,
                    fontSize: 12,
                    fontWeight: "500",
                  }}
                >
                  {moment(unixSec * 1000).format("MMM D, YYYY")}
                </Text>
              </View>
            )}

            {location && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  flex: 1,
                }}
              >
                <Ionicons
                  name="location-outline"
                  size={13}
                  color={COLORS.textMuted}
                />
                <Text
                  numberOfLines={1}
                  style={{
                    color: COLORS.textMuted,
                    fontSize: 12,
                    fontWeight: "500",
                    flex: 1,
                  }}
                >
                  {location.description ? `${location.description}, ` : ""}
                  {location.name}
                </Text>
              </View>
            )}

            <Ionicons name="chevron-forward" size={16} color={COLORS.accent} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Filter Bottom Sheet ───────────────────────────────────────────────────────
const FilterSheet = ({ visible, onClose, activeUrl, onSelect }: any) => {
  const slideAnim = useRef(new Animated.Value(500)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : 500,
      useNativeDriver: true,
      tension: 68,
      friction: 12,
    }).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Pressable
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }}
        onPress={onClose}
      >
        <Animated.View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: COLORS.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            transform: [{ translateY: slideAnim }],
            shadowColor: "#000",
            shadowOpacity: 0.12,
            shadowRadius: 20,
            elevation: 25,
            paddingBottom: 32,
          }}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            {/* Drag handle */}
            <View
              style={{ alignItems: "center", paddingTop: 14, paddingBottom: 4 }}
            >
              <View
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: COLORS.border,
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
                borderBottomColor: COLORS.border,
                marginBottom: 6,
              }}
            >
              <View>
                <Text
                  style={{
                    color: COLORS.text,
                    fontSize: 18,
                    fontWeight: "800",
                  }}
                >
                  Filter by Hub
                </Text>
                <Text
                  style={{
                    color: COLORS.textMuted,
                    fontSize: 13,
                    marginTop: 2,
                  }}
                >
                  {HUBS.find((h) => h.url === activeUrl)?.label ??
                    "All regions"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: COLORS.surfaceElevated,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="close" size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Options */}
            <View style={{ paddingHorizontal: 16, gap: 8 }}>
              {HUBS.map((hub: any, i: number) => {
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
                      borderColor: isActive ? COLORS.accent : COLORS.border,
                      backgroundColor: isActive
                        ? COLORS.accentSoft
                        : COLORS.surface,
                      marginBottom: 4,
                    }}
                  >
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        backgroundColor: isActive
                          ? COLORS.accent
                          : COLORS.surfaceElevated,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Ionicons
                        name={hub.icon}
                        size={18}
                        color={isActive ? COLORS.white : COLORS.textMuted}
                      />
                    </View>

                    <Text
                      style={{
                        flex: 1,
                        fontSize: 15,
                        fontWeight: isActive ? "700" : "500",
                        color: isActive ? COLORS.accent : COLORS.text,
                        letterSpacing: 0.1,
                      }}
                    >
                      {hub.label}
                    </Text>

                    {isActive && (
                      <View
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 11,
                          backgroundColor: COLORS.accent,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Ionicons
                          name="checkmark"
                          size={13}
                          color={COLORS.white}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

// ─── Header ────────────────────────────────────────────────────────────────────
const Header = ({ onBack, onFilter, activeUrl }: any) => {
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
          Events
        </Text>
        {isFiltered && (
          <Text
            style={{
              color: COLORS.accent,
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
          backgroundColor: isFiltered ? COLORS.accentSoft : COLORS.surface,
          borderWidth: 1.5,
          borderColor: isFiltered ? COLORS.accent : COLORS.border,
          shadowColor: COLORS.shadow,
          shadowOpacity: 1,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Ionicons
          name="options-outline"
          size={17}
          color={isFiltered ? COLORS.accent : COLORS.text}
        />
        <Text
          style={{
            fontSize: 13,
            fontWeight: "700",
            color: isFiltered ? COLORS.accent : COLORS.text,
          }}
        >
          Filter
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// ─── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = () => (
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
      <Ionicons name="calendar-outline" size={36} color={COLORS.accent} />
    </View>
    <Text
      style={{
        color: COLORS.text,
        fontSize: 17,
        fontWeight: "700",
        marginBottom: 6,
      }}
    >
      No Upcoming Events
    </Text>
    <Text
      style={{
        color: COLORS.textMuted,
        fontSize: 14,
        textAlign: "center",
        paddingHorizontal: 40,
      }}
    >
      There are no scheduled events for this hub right now. Check back soon.
    </Text>
  </View>
);

// ─── Loading Skeleton ──────────────────────────────────────────────────────────
const SkeletonCard = () => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
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
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 16,
        paddingLeft: 20,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.border,
      }}
    >
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
        <View
          style={{
            width: 72,
            height: 22,
            borderRadius: 11,
            backgroundColor: COLORS.surfaceElevated,
          }}
        />
        <View
          style={{
            width: 90,
            height: 22,
            borderRadius: 11,
            backgroundColor: COLORS.surfaceElevated,
          }}
        />
      </View>
      <View
        style={{
          height: 16,
          borderRadius: 8,
          backgroundColor: COLORS.surfaceElevated,
          marginBottom: 6,
          width: "88%",
        }}
      />
      <View
        style={{
          height: 16,
          borderRadius: 8,
          backgroundColor: COLORS.surfaceElevated,
          width: "55%",
        }}
      />
      <View
        style={{
          height: 14,
          borderRadius: 7,
          backgroundColor: COLORS.surfaceElevated,
          width: "65%",
          marginTop: 12,
        }}
      />
    </Animated.View>
  );
};

// ─── Main Screen ───────────────────────────────────────────────────────────────
const Events = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [eventLists, setEventLists] = useState<any>([]);
  const [eventType, setEventType] = useState(Service.eventsUrl ?? HUBS[0].url);
  const [filterVisible, setFilterVisible] = useState(false);

  const sortByStartDate = useCallback(
    (arr: any) =>
      [...arr].sort((a, b) => a.metadata.evcal_srow - b.metadata.evcal_srow),
    []
  );

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(eventType);
      const json = await response.json();
      const now = Math.round(Date.now() / 1000);
      const upcoming = sortByStartDate(
        json.filter((el: any) => el.metadata?.evcal_srow >= now)
      );
      setEventLists(upcoming);
    } catch (error) {
      Vibration.vibrate();
      Alert.alert(
        "Connection Error",
        "Please check your internet connection and try again.",
        [
          {
            text: "Cancel",
            onPress: () => navigation.goBack(),
            style: "cancel",
          },
          { text: "Retry", onPress: fetchEvents },
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <Header
        onBack={() => navigation.goBack()}
        onFilter={() => setFilterVisible(true)}
        activeUrl={eventType}
      />

      {isLoading ? (
        <View style={{ flex: 1, padding: 16, paddingTop: 20 }}>
          {[...Array(5)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </View>
      ) : eventLists.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={eventLists}
          keyExtractor={(item, index) =>
            `${item?.id?.toString()}-${item?.title?.rendered ?? ""}-${index}`
          }
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          renderItem={({ item, index }) => (
            <EventCard
              item={item}
              index={index}
              onPress={() =>
                router.push({
                  pathname: "/eventscontent",
                  params: {
                    id: item.id,
                    title: item.title?.rendered,
                    content: item.content?.rendered,
                    link: item.link,
                  },
                })
              }
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FilterSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        activeUrl={eventType}
        onSelect={setEventType}
      />
    </SafeAreaView>
  );
};

export default Events;
