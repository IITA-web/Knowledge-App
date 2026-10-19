// Shared pieces for the AI feature screens (same look as climaterisk.tsx).
import { MANDATE_CROPS } from "@/app/home";
import CropIcon from "@/components/CropIcon";
import { useLanguage } from "@/context/LanguageContext";
import i18n from "@/i18n";
import { AiApiError } from "@/utils/aiApi";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Theme (same palette as the Weather and Climate Risk screens) ─────────────
export const T = {
  bg0: "rgb(242, 242, 242)",
  bg1: "#FFFFFF",
  accent: "#D85016",
  accentDim: "rgba(216, 80, 22, 0.10)",
  accentDimBorder: "rgba(216, 80, 22, 0.25)",
  blue: "#1A6FBF",
  green: "#2E7D32",
  gold: "#B85C00",
  red: "#C0392B",
  white: "#FFFFFF",
  muted: "#7A6A60",
  mutedDark: "#B5A49A",
  text: "#2C1A10",
  textSub: "#5C4A40",
  border: "#E8E8E8",
};

export const STATUS_COLOR: any = { good: T.green, fair: T.gold, poor: T.red };

// ─── Errors → a message for the user ──────────────────────────────────────────
export const errorText = (e: any) => {
  if (e instanceof AiApiError) {
    if (e.status === 0) return i18n.t("ai.errorOffline");
    if (e.status === 503) return i18n.t("ai.errorUnavailable");
  }
  return i18n.t("ai.errorGeneric");
};

// The API's own explanation, shown under the message for request errors (4xx).
export const errorDetail = (e: any) =>
  e instanceof AiApiError && e.status >= 400 && e.status < 500 ? e.message : null;

// ─── Icons (MaterialCommunityIcons) ──────────────────────────────────────────
export type AiIconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

export function AiIcon({
  name,
  size = 16,
  color = T.accent,
  style,
}: {
  name: AiIconName;
  size?: number;
  color?: string;
  style?: any;
}) {
  return <MaterialCommunityIcons name={name} size={size} color={color} style={style} />;
}

// An icon in a tinted rounded square (tool tiles, card icons).
export function IconTile({
  name,
  size = 36,
  color = T.accent,
  bg = T.accentDim,
}: {
  name: AiIconName;
  size?: number;
  color?: string;
  bg?: string;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <MaterialCommunityIcons name={name} size={size * 0.55} color={color} />
    </View>
  );
}

// Icons for the search/assistant content types.
export const CONTENT_TYPE_ICON: Record<string, AiIconName> = {
  news: "newspaper-variant-outline",
  project: "folder-outline",
  publication: "book-open-page-variant-outline",
};
export const contentTypeIcon = (type: string): AiIconName =>
  CONTENT_TYPE_ICON[type] ?? "file-document-outline";

// A section heading with an icon in front.
export function SectionTitle({
  icon,
  children,
  style,
}: {
  icon?: AiIconName;
  children: React.ReactNode;
  style?: any;
}) {
  return (
    <View style={[k.sectionTitleRow, style]}>
      {icon && <AiIcon name={icon} size={17} />}
      <Text style={[k.sectionTitle, { marginHorizontal: 0, marginBottom: 0, marginTop: 0, flexShrink: 1 }]}>
        {children}
      </Text>
    </View>
  );
}

// Icon + label on one line, for buttons and small headings.
export function IconLabel({
  icon,
  label,
  color = T.accent,
  textStyle,
  size = 16,
}: {
  icon: AiIconName;
  label: string;
  color?: string;
  textStyle?: any;
  size?: number;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}>
      <AiIcon name={icon} size={size} color={color} />
      <Text style={textStyle}>{label}</Text>
    </View>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
export function AiHeader({ titleKey, onBack }: { titleKey: string; onBack?: () => void }) {
  const navigation = useNavigation();
  const { language } = useLanguage();
  return (
    <View style={k.header}>
      <TouchableOpacity
        onPress={onBack ?? (() => navigation.goBack())}
        style={k.headerBackBtn}
      >
        <Ionicons name="arrow-back" size={20} color={"#000"} />
      </TouchableOpacity>
      <Text style={k.headerTitle} numberOfLines={1}>
        {language && i18n.t(titleKey)}
      </Text>
    </View>
  );
}

// ─── Dropdown ─────────────────────────────────────────────────────────────────
// A select field that opens an animated panel anchored under (or above) itself.
export type DropdownOption<V> = {
  value: V;
  label: string;
  sub?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
};

const PANEL_MAX_HEIGHT = 320;
const PANEL_GAP = 6;

export function Dropdown<V>({
  label,
  value,
  options,
  onChange,
  placeholder,
  style,
}: {
  label?: string;
  value: V;
  options: DropdownOption<V>[];
  onChange: (value: V) => void;
  placeholder?: string;
  style?: any;
}) {
  const window = useWindowDimensions();
  const triggerRef = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const progress = useRef(new Animated.Value(0)).current;
  const items = useRef<Animated.Value[]>([]).current;

  const selected = options.find((o) => o.value === value);
  const panelHeight = Math.min(PANEL_MAX_HEIGHT, options.length * 52 + 12);
  const below = anchor.y + anchor.h + PANEL_GAP + panelHeight < window.height - 24;
  const panelWidth = Math.min(Math.max(anchor.w, 220), window.width - 32);
  const panelLeft = Math.min(Math.max(16, anchor.x), window.width - panelWidth - 16);

  options.forEach((_, i) => {
    if (!items[i]) items[i] = new Animated.Value(0);
  });

  const show = () => {
    triggerRef.current?.measureInWindow((x, y, w, h) => {
      setAnchor({ x, y, w, h });
      progress.setValue(0);
      items.forEach((v) => v.setValue(0));
      setOpen(true);
      Animated.parallel([
        Animated.spring(progress, {
          toValue: 1,
          useNativeDriver: true,
          damping: 18,
          stiffness: 220,
          mass: 0.8,
        }),
        Animated.stagger(
          28,
          items.slice(0, options.length).map((v) =>
            Animated.timing(v, {
              toValue: 1,
              duration: 220,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            })
          )
        ),
      ]).start();
    });
  };

  const hide = (then?: () => void) => {
    Animated.timing(progress, {
      toValue: 0,
      duration: 150,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setOpen(false);
      then?.();
    });
  };

  const chevron = progress.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const dir = below ? 1 : -1;

  return (
    <View style={[k.ddWrap, style]}>
      <Pressable
        ref={triggerRef}
        onPress={show}
        style={({ pressed }) => [k.ddTrigger, (open || pressed) && k.ddTriggerOpen]}
      >
        {selected?.icon}
        <View style={{ flex: 1 }}>
          {label ? <Text style={k.ddCaption} numberOfLines={1}>{label}</Text> : null}
          <Text style={[k.ddValue, !selected && { color: T.mutedDark }]} numberOfLines={1}>
            {selected?.label ?? placeholder ?? ""}
          </Text>
        </View>
        <Animated.View style={{ transform: [{ rotate: chevron }] }}>
          <Ionicons name="chevron-down" size={16} color={open ? T.accent : T.muted} />
        </Animated.View>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => hide()}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={() => hide()}>
          <Animated.View
            style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(44,26,16,0.18)", opacity: progress }]}
          />
        </Pressable>
        <Animated.View
          style={[
            k.ddPanel,
            {
              left: panelLeft,
              width: panelWidth,
              maxHeight: panelHeight,
              ...(below
                ? { top: anchor.y + anchor.h + PANEL_GAP }
                : { bottom: window.height - anchor.y + PANEL_GAP }),
              opacity: progress,
              transform: [
                {
                  translateY: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-10 * dir, 0],
                  }),
                },
                {
                  scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }),
                },
              ],
            },
          ]}
        >
          <ScrollView bounces={false} contentContainerStyle={{ padding: 6 }}>
            {options.map((o, i) => {
              const active = o.value === value;
              const v = items[i];
              return (
                <Animated.View
                  key={String(o.value ?? i)}
                  style={{
                    opacity: v,
                    transform: [
                      { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [8 * dir, 0] }) },
                    ],
                  }}
                >
                  <Pressable
                    disabled={o.disabled}
                    onPress={() => hide(() => o.value !== value && onChange(o.value))}
                    style={({ pressed }) => [
                      k.ddItem,
                      active && k.ddItemActive,
                      pressed && !active && { backgroundColor: "rgba(0,0,0,0.04)" },
                      o.disabled && { opacity: 0.4 },
                    ]}
                  >
                    {o.icon}
                    <View style={{ flex: 1 }}>
                      <Text style={[k.ddItemText, active && k.ddItemTextActive]} numberOfLines={1}>
                        {o.label}
                      </Text>
                      {o.sub ? <Text style={k.mutedSmall} numberOfLines={1}>{o.sub}</Text> : null}
                    </View>
                    {active && <Ionicons name="checkmark-circle" size={18} color={T.accent} />}
                  </Pressable>
                </Animated.View>
              );
            })}
          </ScrollView>
        </Animated.View>
      </Modal>
    </View>
  );
}

// Two dropdowns side by side (e.g. crop and farm location).
export function PickerRow({ children }: { children: React.ReactNode }) {
  return (
    <View style={k.pickerRow}>
      {React.Children.map(children, (c) =>
        React.isValidElement(c)
          ? React.cloneElement(c as React.ReactElement<any>, { style: k.pickerRowItem })
          : c
      )}
    </View>
  );
}

export function CropPicker({
  value,
  onChange,
  isEnabled,
  style,
}: {
  value: string;
  onChange: (key: string) => void;
  isEnabled?: (key: string) => boolean;
  style?: any;
}) {
  return (
    <Dropdown
      label={i18n.t("ai.pick.crop")}
      value={value}
      onChange={onChange}
      style={style}
      options={MANDATE_CROPS.map((c) => ({
        value: c.key,
        label: i18n.t(c.labelKey),
        icon: <CropIcon crop={c} size={16} />,
        disabled: isEnabled ? !isEnabled(c.key) : false,
      }))}
    />
  );
}

// ─── Farm locations: one passed in, saved farms (Weather screen), or GPS ──────
const STORAGE_KEY = "farm_locations_v1"; // shared with the Weather screen

export function useFarmLocations() {
  const params = useLocalSearchParams();
  const [locations, setLocations] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      let saved: any[] = [];
      try {
        const r = await AsyncStorage.getItem(STORAGE_KEY);
        saved = r ? JSON.parse(r) : [];
      } catch {}
      if (params?.lat && params?.lon) {
        const passed = {
          id: "passed",
          name: String(params.locName || i18n.t("weather.myFarm")),
          lat: Number(params.lat),
          lon: Number(params.lon),
        };
        setLocations([
          passed,
          ...saved.filter((l: any) => !(l.lat === passed.lat && l.lon === passed.lon)),
        ]);
        return;
      }
      if (saved.length) {
        setLocations(saved);
        return;
      }
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") throw new Error("denied");
        const pos = await Location.getCurrentPositionAsync({});
        setLocations([
          {
            id: "gps",
            name: i18n.t("weather.myFarm"),
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          },
        ]);
      } catch {
        setError(i18n.t("weather.locationRequired"));
      }
    })();
  }, []);

  return { locations, location: locations[index], index, setIndex, error };
}

export function LocationPicker({ locations, index, setIndex, style }: any) {
  if (!locations.length) return null;
  return (
    <Dropdown
      label={i18n.t("ai.pick.location")}
      value={index}
      onChange={setIndex}
      style={style}
      options={locations.map((l: any, i: number) => ({
        value: i,
        label: l.name,
        sub: `${l.lat.toFixed(2)}°, ${l.lon.toFixed(2)}°`,
        icon: <AiIcon name="map-marker" size={18} />,
      }))}
    />
  );
}

// ─── States ───────────────────────────────────────────────────────────────────
export function Loading({ text }: { text?: string }) {
  return (
    <View style={k.center}>
      <ActivityIndicator size="large" color={T.accent} />
      {text ? <Text style={[k.mutedText, { textAlign: "center" }]}>{text}</Text> : null}
    </View>
  );
}

export function ErrorState({
  icon = "alert-circle-outline",
  error,
  detail,
  onRetry,
}: {
  icon?: AiIconName;
  error: string;
  detail?: string | null;
  onRetry?: () => void;
}) {
  return (
    <View style={k.center}>
      <IconTile name={icon} size={56} />
      <Text style={[k.mutedText, { textAlign: "center" }]}>{error}</Text>
      {detail ? (
        <Text style={[k.mutedSmall, { textAlign: "center" }]}>{detail}</Text>
      ) : null}
      {onRetry && (
        <TouchableOpacity style={k.primaryBtn} onPress={onRetry}>
          <Text style={k.primaryBtnText}>{i18n.t("ai.retry")}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function PrimaryButton({ label, onPress, disabled, loading, style }: any) {
  return (
    <TouchableOpacity
      style={[k.primaryBtn, k.primaryBtnWide, (disabled || loading) && { opacity: 0.5 }, style]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={T.white} />
      ) : (
        <Text style={k.primaryBtnText}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────
export const k = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg0 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: T.border,
    backgroundColor: T.bg0,
    gap: 12,
  },
  headerBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: T.bg1,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  headerTitle: {
    flex: 1,
    color: T.text,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },

  locLine: { color: T.muted, fontSize: 12, marginHorizontal: 16, marginBottom: 10 },

  pickerRow: { flexDirection: "row", gap: 10, marginHorizontal: 16, marginTop: 12, marginBottom: 12 },
  pickerRowItem: { flex: 1, marginHorizontal: 0, marginBottom: 0 },
  ddWrap: { marginHorizontal: 16, marginBottom: 12 },
  ddTrigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: T.bg1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: T.border,
  },
  ddTriggerOpen: { borderColor: T.accentDimBorder, backgroundColor: "#FFFBF8" },
  ddCaption: {
    color: T.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  ddValue: { color: T.text, fontSize: 14, fontWeight: "700", marginTop: 1 },
  ddPanel: {
    position: "absolute",
    backgroundColor: T.bg1,
    borderRadius: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#2C1A10",
        shadowOpacity: 0.18,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
      },
      default: { elevation: 10 },
    }),
  },
  ddItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 11,
  },
  ddItemActive: { backgroundColor: T.accentDim },
  ddItemText: { color: T.text, fontSize: 14, fontWeight: "500" },
  ddItemTextActive: { color: T.accent, fontWeight: "700" },

  segment: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: T.bg1,
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  segmentBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: "center" },
  segmentBtnActive: { backgroundColor: T.accent },
  segmentText: { color: T.text, fontSize: 13, fontWeight: "700" },
  segmentTextActive: { color: T.white },

  center: { alignItems: "center", justifyContent: "center", padding: 40, gap: 10 },
  mutedText: { color: T.muted, fontSize: 14, marginTop: 6 },
  mutedSmall: { color: T.muted, fontSize: 12, lineHeight: 17 },
  primaryBtn: {
    marginTop: 10,
    backgroundColor: T.accent,
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnWide: { marginHorizontal: 16, marginBottom: 16 },
  primaryBtnText: { color: T.white, fontWeight: "700", fontSize: 14 },
  secondaryBtn: {
    backgroundColor: T.accentDim,
    borderColor: T.accentDimBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: "center",
  },
  secondaryBtnText: { color: T.accent, fontWeight: "700", fontSize: 13 },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    color: T.text,
    fontSize: 14,
    fontWeight: "700",
    marginHorizontal: 16,
    marginBottom: 10,
    marginTop: 4,
    letterSpacing: 0.3,
  },
  intro: {
    color: T.textSub,
    fontSize: 13,
    lineHeight: 19,
    marginHorizontal: 16,
    marginTop: 12,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: T.bg1,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(216,80,22,0.10)",
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  cardIcon: { fontSize: 24, width: 32 },
  cardTitle: { color: T.text, fontSize: 14, fontWeight: "700" },
  cardText: { color: T.textSub, fontSize: 13, lineHeight: 19, marginTop: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: "800", textTransform: "uppercase" },
  actionsTitle: { color: T.text, fontSize: 12, fontWeight: "700", marginBottom: 4 },
  actionItem: { color: T.textSub, fontSize: 13, lineHeight: 19 },

  barBg: {
    height: 8,
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 4,
    marginTop: 6,
    overflow: "hidden",
  },
  barFill: { height: 8, borderRadius: 4 },

  input: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: T.bg1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: T.border,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: T.text,
  },
  label: {
    color: T.text,
    fontSize: 12,
    fontWeight: "700",
    marginHorizontal: 16,
    marginBottom: 6,
  },

  footnote: {
    color: T.mutedDark,
    fontSize: 11,
    lineHeight: 16,
    marginHorizontal: 16,
    marginTop: 12,
  },
});
