import { useLanguage } from "@/context/LanguageContext";
import i18n from "@/i18n";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import WebView from "react-native-webview";
import { screenHeight, screenWidth } from "../utils/Dimension";
import { Service } from "../utils/service";
import { styledHtml } from "../utils/styledHtml";

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

const HERO_HEIGHT = screenHeight * 0.38;
const COLLAPSED_HEIGHT = 56;

// ─── Format date ───────────────────────────────────────────────────────────────
const formatDate = (raw: any) => {
  if (!raw) return "";
  try {
    return new Date(raw).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return raw;
  }
};

// ─── Stat Pill ─────────────────────────────────────────────────────────────────
const StatPill = ({ icon, value, color }: any) => (
  <View style={styles.statPill}>
    <Ionicons name={icon} size={14} color={color || COLORS.accent} />
    <Text style={styles.statPillText}>{value ?? "—"}</Text>
  </View>
);

// ─── Icon Button ───────────────────────────────────────────────────────────────
const IconBtn = ({ name, onPress, accent }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.iconBtn, accent && styles.iconBtnAccent]}
    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
  >
    <Ionicons
      name={name}
      size={20}
      color={accent ? COLORS.white : COLORS.text}
    />
  </TouchableOpacity>
);

// ─── Title Modal ───────────────────────────────────────────────────────────────
const TitleModal = ({ visible, onClose, title, date }: any) => {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 22,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.modalBackdrop, { opacity: opacityAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          style={[
            styles.titleSheet,
            {
              paddingBottom: insets.bottom + 20,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Handle */}
          <View style={styles.sheetHandle} />

          {/* Date chip */}
          {date ? (
            <View style={styles.dateChip}>
              <Ionicons
                name="calendar-outline"
                size={13}
                color={COLORS.accent}
              />
              <Text style={styles.dateChipText}>{formatDate(date)}</Text>
            </View>
          ) : null}

          {/* Title */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: 12,
              paddingBottom: 8,
            }}
          >
            <Text style={styles.titleSheetText}>{title}</Text>
          </ScrollView>

          {/* Close */}
          <TouchableOpacity style={styles.titleSheetCloseBtn} onPress={onClose}>
            <Text style={styles.titleSheetCloseText}>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ─── Top Nav Bar ───────────────────────────────────────────────────────────────
const NavBar = ({ title, scrollY, onBack, onShare, onTitlePress }: any) => {
  const titleOpacity = scrollY.interpolate({
    inputRange: [HERO_HEIGHT * 0.6, HERO_HEIGHT * 0.9],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const bgOpacity = scrollY.interpolate({
    inputRange: [HERO_HEIGHT * 0.5, HERO_HEIGHT * 0.85],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      style={[
        styles.navbar,
        {
          backgroundColor: bgOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: ["rgba(242,242,242,0)", "rgba(242,242,242,1)"],
          }),
          borderBottomColor: bgOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: ["rgba(232,232,232,0)", "rgba(232,232,232,1)"],
          }),
        },
      ]}
    >
      <IconBtn name="arrow-back" onPress={onBack} />

      <TouchableOpacity
        style={styles.navTitleWrap}
        onPress={onTitlePress}
        activeOpacity={0.7}
      >
        <Animated.Text
          style={[styles.navTitle, { opacity: titleOpacity }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Animated.Text>
      </TouchableOpacity>

      <IconBtn name="share-social-outline" onPress={onShare} />
    </Animated.View>
  );
};

// ─── Hero Image ────────────────────────────────────────────────────────────────
const HeroImage = ({ imageUri, scrollY }: any) => {
  const translateY = scrollY.interpolate({
    inputRange: [-HERO_HEIGHT, 0, HERO_HEIGHT],
    outputRange: [-HERO_HEIGHT / 2, 0, HERO_HEIGHT * 0.4],
    extrapolate: "clamp",
  });

  const opacity = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT * 0.7],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return (
    <Animated.Image
      source={{ uri: imageUri }}
      style={[styles.heroImage, { transform: [{ translateY }], opacity }]}
      resizeMode="cover"
    />
  );
};

// ─── Main Screen ───────────────────────────────────────────────────────────────
const NewsContent = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { id: itemId } = useLocalSearchParams();
  const { language } = useLanguage();

  const scrollY = useRef(new Animated.Value(0)).current;

  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [loadingViews, setLoadingViews] = useState(false);
  const [likes, setLikes] = useState(0);
  const [views, setViews] = useState(0);
  const [dataSource, setDataSource] = useState<any>({});
  const [showTitleModal, setShowTitleModal] = useState(false);
  // WebView auto-height
  const [webViewHeight, setWebViewHeight] = useState(screenHeight * 0.6);

  useEffect(() => {
    const getNewsItems = () => {
      setIsLoadingNews(true);
      fetch(Service.newsUrl + itemId)
        .then((r) => r.json())
        .then((json) => {
          let l = json.metadata?.likes ?? 0;
          setLikes(l.toString().replace(/[[\]]/g, ""));
          setDataSource(json);
          setIsLoadingNews(false);
        })
        .catch((err) => {
          setIsLoadingNews(false);

          if (err?.message) {
            Alert.alert(
              `${language && i18n.t("connectionError")}`,
              `${language && i18n.t("internetError")}`,
              [{ text: `${language && i18n.t("ok")}`, style: "cancel" }],
              { cancelable: false }
            );
          }
          Vibration.vibrate();
        });
    };

    const getViews = () => {
      setLoadingViews(true);
      fetch(Service.viewsUrl + itemId)
        .then((r) => r.json())
        .then((json) => {
          setViews(json);
          setLoadingViews(false);
        })
        .catch(() => setLoadingViews(false));
    };

    getNewsItems();
    getViews();
  }, []);

  const onShare = async () => {
    try {
      await Share.share({
        message:
          (dataSource?.title?.rendered ?? "") +
          "\nRead more: " +
          (dataSource?.link ?? ""),
      });
    } catch (e: any) {
      Alert.alert("Share failed", e.message);
    }
  };

  const imageUri = (() => {
    const raw = dataSource?.yoast_head_json?.og_image?.[0]?.url;
    if (!raw) return "https://s.ytimg.com/yts/img/no_thumbnail-vfl4t3-4R.jpg";
    return encodeURI(
      raw.startsWith("http://") ? raw.replace("http://", "https://") : raw
    );
  })();

  const title = dataSource?.title?.rendered ?? "";
  const date = dataSource?.date;
  const isLoading = isLoadingNews || loadingViews;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      {/* Floating Nav */}
      <NavBar
        title={title}
        scrollY={scrollY}
        onBack={() => navigation.goBack()}
        onShare={onShare}
        onTitlePress={() => setShowTitleModal(true)}
      />

      {isLoading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={COLORS.accent} size="large" />
          <Text style={styles.loaderText}>{language && i18n.t("loading")}</Text>
        </View>
      ) : dataSource.id ? (
        <Animated.ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={styles.heroWrap}>
            <HeroImage imageUri={imageUri} scrollY={scrollY} />
            {/* Scrim */}
            <View style={styles.heroScrim} />
          </View>

          {/* Article Card */}
          <View style={styles.articleCard}>
            {/* Category / date strip */}
            <View style={styles.metaRow}>
              <View style={styles.categoryChip}>
                <Text style={styles.categoryChipText}>
                  {language && i18n.t("news")}
                </Text>
              </View>
              {date ? (
                <Text style={styles.metaDate}>{formatDate(date)}</Text>
              ) : null}
            </View>

            {/* Title */}
            <TouchableOpacity
              onPress={() => setShowTitleModal(true)}
              activeOpacity={0.75}
            >
              <Text style={styles.articleTitle}>{title}</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Stats bar */}
            <View style={styles.statsBar}>
              <StatPill icon="eye-outline" value={views} />
              <StatPill icon="heart-outline" value={likes} color="#E05B5B" />
              <View style={{ flex: 1 }} />
              <TouchableOpacity style={styles.shareBtn} onPress={onShare}>
                <Ionicons
                  name="share-social-outline"
                  size={16}
                  color={COLORS.accent}
                />
                <Text style={styles.shareBtnText}>
                  {language && i18n.t("share")}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* WebView content — height driven by injected measurement */}
            <WebView
              originWhitelist={["*"]}
              source={{ html: styledHtml(dataSource?.content?.rendered || "") }}
              style={[styles.webview, { height: webViewHeight }]}
              scalesPageToFit={false}
              javaScriptEnabled
              domStorageEnabled
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              injectedJavaScript={`
                (function() {
                  function sendHeight() {
                    var h = Math.max(
                      document.body.scrollHeight,
                      document.documentElement.scrollHeight,
                      document.body.offsetHeight,
                      document.documentElement.offsetHeight
                    );
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'HEIGHT', height: h }));
                  }
                  // Fire immediately and again after images load
                  sendHeight();
                  window.addEventListener('load', sendHeight);
                  // Also watch for layout changes (e.g. lazy images)
                  if (window.ResizeObserver) {
                    new ResizeObserver(sendHeight).observe(document.body);
                  }
                  true;
                })();
              `}
              onMessage={(e) => {
                try {
                  const data = JSON.parse(e.nativeEvent.data);
                  if (data.type === "HEIGHT" && data.height > 0) {
                    setWebViewHeight(data.height + 32); // +32 padding buffer
                  }
                } catch {}
              }}
            />
          </View>
        </Animated.ScrollView>
      ) : (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="newspaper-outline"
              size={36}
              color={COLORS.textDim}
            />
          </View>
          <Text style={styles.emptyTitle}>
            {" "}
            {language && i18n.t("articleNotFound")}{" "}
          </Text>
          <Text style={styles.emptySubtitle}>
            {language && i18n.t("articleUnavailable")}
          </Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.emptyBtnText}>
              {language && i18n.t("goback")}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Title Modal */}
      <TitleModal
        visible={showTitleModal}
        onClose={() => setShowTitleModal(false)}
        title={title}
        date={date}
      />
    </SafeAreaView>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // Nav
  navbar: {
    position: "absolute",
    top: Platform.select({ ios: 44, android: StatusBar.currentHeight ?? 0 }),
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  navTitleWrap: {
    flex: 1,
    marginHorizontal: 10,
  },
  navTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBtnAccent: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },

  // Hero
  heroWrap: {
    height: HERO_HEIGHT,
    overflow: "hidden",
    position: "relative",
    backgroundColor: COLORS.surfaceElevated,
  },
  heroImage: {
    width: screenWidth,
    height: HERO_HEIGHT,
    position: "absolute",
    top: 0,
    left: 0,
  },
  heroScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.18)",
  },

  // Article Card
  articleCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: 20,
    paddingTop: 24,
    minHeight: screenHeight * 0.65,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  categoryChip: {
    backgroundColor: COLORS.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.accent,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  metaDate: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  articleTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
    lineHeight: 30,
    letterSpacing: -0.4,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },
  statsBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statPillText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
  },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: COLORS.accentSoft,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,107,53,0.2)",
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.accent,
  },
  webview: {
    width: "100%",
    backgroundColor: "transparent",
  },

  // Loader
  loaderWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loaderText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: "500",
  },

  // Empty
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyBtn: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.accentSoft,
    borderRadius: 12,
  },
  emptyBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.accent,
  },

  // Title Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  titleSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 14,
    maxHeight: screenHeight * 0.55,
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
  dateChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    marginHorizontal: 24,
    marginBottom: 4,
    backgroundColor: COLORS.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dateChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.accent,
  },
  titleSheetText: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
    lineHeight: 31,
    letterSpacing: -0.4,
    textAlign: "left",
  },
  titleSheetCloseBtn: {
    alignSelf: "center",
    marginTop: 16,
    marginBottom: 4,
    paddingHorizontal: 28,
    paddingVertical: 11,
    backgroundColor: COLORS.accentSoft,
    borderRadius: 14,
  },
  titleSheetCloseText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.accent,
  },
});

export default NewsContent;
