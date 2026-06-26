import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import CustomHeaderII from "../components/CustomHeaderII";

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  bg0: "rgb(242, 242, 242)", // page background
  bg1: "#FFFFFF", // surface / tab bar
  bg2: "#F5F0ED", // secondary surface
  card: "rgba(216, 80, 22, 0.05)",
  cardBorder: "rgba(216, 80, 22, 0.12)",
  accent: "#D85016", // primary brand orange
  accentDark: "#B84010",
  accentDim: "rgba(216, 80, 22, 0.10)",
  accentDimBorder: "rgba(216, 80, 22, 0.25)",
  accentText: "#FFFFFF", // text on accent bg
  gold: "#B85C00", // warm amber (on light)
  blue: "#1A6FBF",
  blueLight: "#0A4F8F",
  red: "#C0392B",
  white: "#FFFFFF",
  muted: "#7A6A60",
  mutedDark: "#B5A49A",
  text: "#2C1A10", // primary body text (dark brown)
  textSub: "#5C4A40", // secondary text
};

// ─── WMO weather-code to label ─────────────────────────────────────────────
const WMO: any = {
  0: "Clear Sky",
  1: "Mainly Clear",
  2: "Partly Cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Icy Fog",
  51: "Light Drizzle",
  53: "Drizzle",
  55: "Heavy Drizzle",
  61: "Light Rain",
  63: "Rain",
  65: "Heavy Rain",
  71: "Light Snow",
  73: "Snow",
  75: "Heavy Snow",
  80: "Rain Showers",
  81: "Heavy Showers",
  82: "Violent Showers",
  95: "Thunderstorm",
};

const WMO_ICON: any = {
  0: "☀️",
  1: "🌤",
  2: "⛅",
  3: "☁️",
  45: "🌫",
  48: "🌫",
  51: "🌦",
  53: "🌧",
  55: "🌧",
  61: "🌦",
  63: "🌧",
  65: "⛈",
  71: "🌨",
  73: "❄️",
  75: "❄️",
  80: "🌦",
  81: "⛈",
  82: "⛈",
  95: "⛈",
};

const weatherIcon = (code: any) => WMO_ICON[code] ?? "🌡";
const weatherLabel = (code: any) => WMO[code] ?? "Unknown";

// ─── Advice engine ────────────────────────────────────────────────────────────
const getAdvice = (rain: any, temp: any, wind: any, wmoCode: any) => {
  if ([95, 81, 82, 65].includes(wmoCode))
    return {
      icon: "⛈",
      text: "Severe weather. Stay indoors, do not work outside.",
      color: T.red,
    };
  if (rain > 70)
    return {
      icon: "🌱",
      text: "High chance of rain. Great for planting; skip irrigation.",
      color: T.blue,
    };
  if (temp > 35)
    return {
      icon: "🔥",
      text: "Extreme heat. Irrigate early morning before 7 AM.",
      color: T.gold,
    };
  if (wind > 25)
    return {
      icon: "🌬",
      text: "Strong winds. Avoid spraying pesticides or fertilisers.",
      color: "#FFA94D",
    };
  if (temp < 10)
    return {
      icon: "❄️",
      text: "Cold conditions. Protect sensitive seedlings overnight.",
      color: T.blueLight,
    };
  if (rain < 10 && temp > 28)
    return {
      icon: "💧",
      text: "Dry and warm. Irrigate crops in the evening.",
      color: T.accent,
    };
  return {
    icon: "✅",
    text: "Conditions are stable. A good day for most farm activities.",
    color: T.accent,
  };
};

// ─── Storage helpers ──────────────────────────────────────────────────────────
const STORAGE_KEY = "farm_locations_v1";

const loadLocations = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocations = async (locs: any) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(locs));
  } catch (e) {
    console.error(e);
  }
};

// ─── Fetch weather for a coordinate ──────────────────────────────────────────
const fetchWeatherForCoord = async (lat: any, lon: any) => {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current_weather=true&hourly=relative_humidity_2m` +
      `&daily=weathercode,temperature_2m_max,temperature_2m_min,` +
      `precipitation_probability_max,precipitation_sum,windspeed_10m_max` +
      `&timezone=auto`
  );
  return res.json();
};

// ─── Day abbreviation ─────────────────────────────────────────────────────────
const dayLabel = (dateStr: any, index: number) => {
  if (index === 0) return "Today";
  if (index === 1) return "Tmrw";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short" });
};

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════
export default function FarmWeatherScreen() {
  const [locations, setLocations] = useState<any>([]); // saved location list
  const [activeIdx, setActiveIdx] = useState(0); // which location is shown
  const [weatherMap, setWeatherMap] = useState<any>({}); // id → weather data
  const [loading, setLoading] = useState(true);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [gettingGPS, setGettingGPS] = useState(false);
  const [manageMode, setManageMode] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  useEffect(() => {
    bootstrap();
  }, []);

  const bootstrap = async () => {
    const saved = await loadLocations();
    if (saved.length) {
      setLocations(saved);
      await loadAllWeather(saved);
    } else {
      // first launch: auto-add current location
      await addCurrentLocation("My Farm", saved);
    }
    setLoading(false);
  };

  const loadAllWeather = async (locs: any) => {
    const map: any = {};
    await Promise.all(
      locs.map(async (loc: any) => {
        try {
          map[loc.id] = await fetchWeatherForCoord(loc.lat, loc.lon);
        } catch {
          /* skip */
        }
      })
    );
    setWeatherMap(map);
  };

  // ── Animate when active location changes ─────────────────────────────────
  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(24);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 380,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeIdx]);

  // ── Add current GPS location ──────────────────────────────────────────────
  const addCurrentLocation = async (label: any, existingLocs = locations) => {
    setGettingGPS(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission is required.");
        setGettingGPS(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const newLoc = {
        id: Date.now().toString(),
        name: label || "Farm Location",
        lat: loc.coords.latitude,
        lon: loc.coords.longitude,
      };
      const updated = [...existingLocs, newLoc];
      setLocations(updated);
      await saveLocations(updated);
      const data = await fetchWeatherForCoord(newLoc.lat, newLoc.lon);
      setWeatherMap((prev: any) => ({ ...prev, [newLoc.id]: data }));
      setActiveIdx(updated.length - 1);
    } catch (e) {
      Alert.alert("Error", "Could not get location.");
    }
    setGettingGPS(false);
  };

  const handleAddLocation = async () => {
    if (!newName.trim()) return;
    setAddModalVisible(false);
    await addCurrentLocation(newName.trim());
    setNewName("");
  };

  const handleDeleteLocation = (id: any) => {
    Alert.alert("Remove Location", "Remove this location from your list?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          const updated = locations.filter((l: any) => l.id !== id);
          setLocations(updated);
          await saveLocations(updated);
          const newMap: any = { ...weatherMap };
          delete newMap[id];
          setWeatherMap(newMap);
          setActiveIdx(Math.max(0, activeIdx - 1));
        },
      },
    ]);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER STATES
  // ─────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={s.loadingBg}>
        <ActivityIndicator size="large" color={T.accent} />
        <Text style={s.loadingText}>Fetching weather data…</Text>
      </View>
    );
  }

  if (!locations.length) {
    return (
      <View style={s.loadingBg}>
        <Text style={{ fontSize: 40 }}>🌾</Text>
        <Text style={[s.loadingText, { marginTop: 12, fontSize: 16 }]}>
          No locations saved
        </Text>
        <TouchableOpacity
          style={s.emptyBtn}
          onPress={() => setAddModalVisible(true)}
        >
          <Text style={s.emptyBtnText}>+ Add Location</Text>
        </TouchableOpacity>
        <AddModal
          visible={addModalVisible}
          name={newName}
          loading={gettingGPS}
          onChangeName={setNewName}
          onConfirm={handleAddLocation}
          onClose={() => setAddModalVisible(false)}
        />
      </View>
    );
  }

  const activeLoc = locations[activeIdx];
  const weather = weatherMap[activeLoc?.id];

  return (
    <SafeAreaView style={s.root}>
      <CustomHeaderII title="Weather" />

      {/* ── Location Tabs ─────────────────────────────────────────────── */}
      <View style={s.tabBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.tabScroll}
        >
          {locations.map((loc: any, i: number) => (
            <TouchableOpacity
              key={loc.id}
              style={[s.tab, i === activeIdx && s.tabActive]}
              onPress={() => {
                setActiveIdx(i);
                setManageMode(false);
              }}
              onLongPress={() => {
                setActiveIdx(i);
                setManageMode(true);
              }}
            >
              <Text style={[s.tabText, i === activeIdx && s.tabTextActive]}>
                {manageMode && i === activeIdx ? "✕ " : ""}
                {loc.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity
          style={s.addTabBtn}
          onPress={() => {
            setManageMode(false);
            setAddModalVisible(true);
          }}
        >
          <Text style={s.addTabBtnText}>＋</Text>
        </TouchableOpacity>
      </View>

      {manageMode && (
        <View style={s.manageBanner}>
          <Text style={s.manageBannerText}>Long-press a tab to manage · </Text>
          <TouchableOpacity onPress={() => handleDeleteLocation(activeLoc.id)}>
            <Text
              style={[s.manageBannerText, { color: T.red, fontWeight: "700" }]}
            >
              Remove "{activeLoc.name}"
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.manageDone}
            onPress={() => setManageMode(false)}
          >
            <Text style={[s.manageBannerText, { color: T.accent }]}>Done</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Weather Content ────────────────────────────────────────────── */}
      {!weather ? (
        <View style={s.center}>
          <ActivityIndicator size="small" color={T.accent} />
          <Text style={s.loadingText}>Loading…</Text>
        </View>
      ) : (
        <Animated.ScrollView
          style={[
            s.scroll,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <WeatherHero location={activeLoc} weather={weather} />
          <FarmingAdvice weather={weather} />
          <HourlyHumidity weather={weather} />
          <WeekForecast weather={weather} />
        </Animated.ScrollView>
      )}

      {/* ── Add Location Modal ─────────────────────────────────────────── */}
      <AddModal
        visible={addModalVisible}
        name={newName}
        loading={gettingGPS}
        onChangeName={setNewName}
        onConfirm={handleAddLocation}
        onClose={() => setAddModalVisible(false)}
      />
    </SafeAreaView>
  );
}

function WeatherHero({ location, weather }: any) {
  const cw = weather.current_weather;
  const daily = weather.daily;
  const rain = daily.precipitation_probability_max[0];
  const code = cw.weathercode;

  return (
    <LinearGradient
      colors={["#D85016", "#A83A08"]}
      style={s.hero}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Decorative ring */}
      <View style={s.heroRing} />

      <View style={s.heroTop}>
        <View>
          <Text style={s.heroLocation}>{location.name}</Text>
          <Text style={s.heroCoord}>
            {location.lat.toFixed(3)}°N, {location.lon.toFixed(3)}°E
          </Text>
        </View>
        <Text style={s.heroIcon}>{weatherIcon(code)}</Text>
      </View>

      <Text style={s.heroTemp}>{cw.temperature}°</Text>
      <Text style={s.heroCondition}>{weatherLabel(code)}</Text>

      <View style={s.heroPills}>
        <Pill icon="💨" value={`${cw.windspeed} km/h`} label="Wind" />
        <Pill icon="🌧" value={`${rain}%`} label="Rain" />
        <Pill
          icon="🌡"
          value={`${daily.temperature_2m_max[0]}° / ${daily.temperature_2m_min[0]}°`}
          label="Hi / Lo"
        />
      </View>
    </LinearGradient>
  );
}

function Pill({ icon, value, label }: any) {
  return (
    <View style={s.pill}>
      <Text style={s.pillIcon}>{icon}</Text>
      <Text style={s.pillValue}>{value}</Text>
      <Text style={s.pillLabel}>{label}</Text>
    </View>
  );
}

// ── Farming Advice ────────────────────────────────────────────────────────
function FarmingAdvice({ weather }: any) {
  const cw = weather.current_weather;
  const daily = weather.daily;
  const rain = daily.precipitation_probability_max[0];
  const advice = getAdvice(rain, cw.temperature, cw.windspeed, cw.weathercode);

  return (
    <View style={[s.adviceCard, { borderColor: advice.color + "55" }]}>
      <View style={[s.adviceDot, { backgroundColor: advice.color }]} />
      <View style={{ flex: 1 }}>
        <Text style={[s.adviceTitle, { color: advice.color }]}>
          {advice.icon} Farming Advice
        </Text>
        <Text style={s.adviceText}>{advice.text}</Text>
      </View>
    </View>
  );
}

// ── Hourly Humidity Strip ──────────────────────────────────────────────────
function HourlyHumidity({ weather }: any) {
  const hourly = weather.hourly;
  if (!hourly?.time) return null;

  // Show next 12 hours starting from current hour
  const now = new Date();
  const currentHour = now.getHours();
  const slots = hourly.time
    .map((t: any, i: number) => ({
      time: t,
      humidity: hourly.relative_humidity_2m[i],
    }))
    .filter((_: any, i: number) => {
      const h = new Date(hourly.time[i]).getHours();
      return true; // just show first 12 slots for simplicity
    })
    .slice(0, 12);

  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>💧 Humidity Today</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {slots.map((slot: any, i: number) => {
          const hour = new Date(slot.time).getHours();
          const hum = slot.humidity;
          const barH = Math.max(4, (hum / 100) * 44);
          return (
            <View key={i} style={s.humSlot}>
              <Text style={s.humPct}>{hum}%</Text>
              <View style={s.humBarBg}>
                <View
                  style={[
                    s.humBarFill,
                    {
                      height: barH,
                      backgroundColor: hum > 70 ? T.blue : T.accent,
                    },
                  ]}
                />
              </View>
              <Text style={s.humHour}>
                {hour.toString().padStart(2, "0")}:00
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ── 7-Day Forecast ─────────────────────────────────────────────────────────
function WeekForecast({ weather }: any) {
  const daily = weather.daily;
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>📅 7-Day Forecast</Text>
      {daily.time.map((date: any, i: number) => {
        const code = daily.weathercode?.[i] ?? 0;
        const hi = daily.temperature_2m_max[i];
        const lo = daily.temperature_2m_min[i];
        const rain = daily.precipitation_probability_max[i];
        const wind = daily.windspeed_10m_max[i];
        const precip = daily.precipitation_sum?.[i];

        return (
          <View key={date} style={s.forecastRow}>
            <Text style={s.forecastIcon}>{weatherIcon(code)}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.forecastDay}>{dayLabel(date, i)}</Text>
              <Text style={s.forecastCond}>{weatherLabel(code)}</Text>
            </View>
            <View style={s.forecastStats}>
              <Text style={s.forecastRain}>🌧 {rain}%</Text>
              <Text style={s.forecastWind}>💨 {wind} km/h</Text>
            </View>
            <View style={s.forecastTemps}>
              <Text style={s.tempHi}>{hi}°</Text>
              <Text style={s.tempLo}>{lo}°</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ── Add Location Modal ────────────────────────────────────────────────────
function AddModal({
  visible,
  name,
  loading,
  onChangeName,
  onConfirm,
  onClose,
}: any) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={s.modalOverlay} onPress={onClose}>
        <Pressable style={s.modalBox} onPress={() => {}}>
          <Text style={s.modalTitle}>📍 Add Location</Text>
          <Text style={s.modalSub}>
            Give this farm spot a name, then tap Capture to use your current GPS
            position.
          </Text>
          <TextInput
            style={s.modalInput}
            placeholder="e.g. North Field, Home Farm…"
            placeholderTextColor={T.mutedDark}
            value={name}
            onChangeText={onChangeName}
            autoFocus
          />
          <TouchableOpacity
            style={[s.modalBtn, (!name.trim() || loading) && { opacity: 0.5 }]}
            onPress={onConfirm}
            disabled={!name.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color={T.bg0} size="small" />
            ) : (
              <Text style={s.modalBtnText}>📡 Capture GPS & Save</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={s.modalCancel} onPress={onClose}>
            <Text style={s.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg0 },

  // Loading
  loadingBg: {
    flex: 1,
    backgroundColor: T.bg0,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: { color: T.muted, marginTop: 10, fontSize: 14 },
  emptyBtn: {
    marginTop: 20,
    backgroundColor: T.accent,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyBtnText: { color: T.white, fontWeight: "700", fontSize: 15 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  // Tab bar
  tabBar: {
    flexDirection: "row",
    backgroundColor: T.bg1,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(216,80,22,0.12)",
    paddingVertical: 8,
    paddingLeft: 12,
    shadowColor: "#D85016",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  tabScroll: { alignItems: "center", gap: 6 },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  tabActive: {
    backgroundColor: T.accentDim,
    borderWidth: 1.5,
    borderColor: T.accentDimBorder,
  },
  tabText: { color: T.muted, fontSize: 13, fontWeight: "500" },
  tabTextActive: { color: T.accent, fontWeight: "700" },
  addTabBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: T.accent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    alignSelf: "center",
    shadowColor: "#D85016",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  addTabBtnText: { color: T.white, fontSize: 18, lineHeight: 20 },

  // Manage banner
  manageBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(216,80,22,0.07)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(216,80,22,0.15)",
  },
  manageBannerText: { color: T.muted, fontSize: 12 },
  manageDone: { marginLeft: "auto" },

  // Scroll
  scroll: { flex: 1 },

  // Hero  (gradient set inline; only structural styles here)
  hero: {
    margin: 16,
    borderRadius: 24,
    padding: 24,
    overflow: "hidden",
    shadowColor: "#D85016",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroRing: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    top: -60,
    right: -60,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  heroLocation: { color: T.white, fontSize: 18, fontWeight: "700" },
  heroCoord: { color: "rgba(255,255,255,0.55)", fontSize: 11, marginTop: 2 },
  heroIcon: { fontSize: 40 },
  heroTemp: { fontSize: 72, fontWeight: "300", color: T.white, lineHeight: 76 },
  heroCondition: {
    color: "rgba(255,255,255,0.70)",
    fontSize: 15,
    marginTop: 2,
    marginBottom: 24,
  },

  // Pills
  heroPills: { flexDirection: "row", gap: 10 },
  pill: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
  },
  pillIcon: { fontSize: 18, marginBottom: 4 },
  pillValue: { color: T.white, fontSize: 13, fontWeight: "600" },
  pillLabel: { color: "rgba(255,255,255,0.60)", fontSize: 10, marginTop: 2 },

  // Advice
  adviceCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: T.bg1,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  adviceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  adviceTitle: { fontSize: 13, fontWeight: "700", marginBottom: 4 },
  adviceText: { color: T.textSub, fontSize: 14, lineHeight: 20 },

  // Sections
  section: { marginHorizontal: 16, marginBottom: 20 },
  sectionTitle: {
    color: T.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 12,
    letterSpacing: 0.3,
  },

  // Humidity
  humSlot: { alignItems: "center", marginRight: 14, width: 44 },
  humPct: { color: T.muted, fontSize: 10, marginBottom: 4 },
  humBarBg: {
    width: 8,
    height: 44,
    backgroundColor: "rgba(216,80,22,0.10)",
    borderRadius: 4,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  humBarFill: { width: 8, borderRadius: 4 },
  humHour: { color: T.mutedDark, fontSize: 9, marginTop: 4 },

  // Forecast
  forecastRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: T.bg1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(216,80,22,0.10)",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  forecastIcon: { fontSize: 26, width: 34 },
  forecastDay: { color: T.text, fontSize: 14, fontWeight: "600" },
  forecastCond: { color: T.muted, fontSize: 11, marginTop: 1 },
  forecastStats: { alignItems: "flex-end", gap: 2 },
  forecastRain: { color: T.blue, fontSize: 11 },
  forecastWind: { color: T.muted, fontSize: 11 },
  forecastTemps: { alignItems: "flex-end", minWidth: 52 },
  tempHi: { color: T.accent, fontSize: 15, fontWeight: "700" },
  tempLo: { color: T.blueLight, fontSize: 13 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(44,26,16,0.55)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: T.bg1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    borderTopWidth: 1,
    borderColor: "rgba(216,80,22,0.15)",
  },
  modalTitle: {
    color: T.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  modalSub: { color: T.muted, fontSize: 13, lineHeight: 18, marginBottom: 20 },
  modalInput: {
    backgroundColor: T.bg0,
    borderWidth: 1.5,
    borderColor: "rgba(216,80,22,0.20)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: T.text,
    fontSize: 15,
    marginBottom: 14,
  },
  modalBtn: {
    backgroundColor: T.accent,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#D85016",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  modalBtnText: { color: T.white, fontWeight: "700", fontSize: 15 },
  modalCancel: { alignItems: "center", paddingVertical: 10 },
  modalCancelText: { color: T.muted, fontSize: 14 },
});
