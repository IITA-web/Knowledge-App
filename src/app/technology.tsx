import { useLanguage } from "@/context/LanguageContext";
import i18n from "@/i18n";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: "rgb(242, 242, 242)",
  surface: "#FFFFFF",
  border: "#E8E8E8",
  accent: "#FF6B35",
  accentSoft: "rgba(255,107,53,0.10)",
  text: "#1A1A1A",
  muted: "#888899",
  shadow: "rgba(0,0,0,0.07)",
};

// ─── Animated dot for the "loading" bar ───────────────────────────────────────
const PulsingDot: React.FC<{ delay: number }> = ({ delay }) => {
  const scale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1,
          duration: 500,
          delay,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.6,
          duration: 500,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return <Animated.View style={[styles.dot, { transform: [{ scale }] }]} />;
};

// ─── Progress bar that animates across the top while loading ──────────────────
const ProgressBar: React.FC<{ visible: boolean }> = ({ visible }) => {
  const translateX = useRef(new Animated.Value(-300)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      translateX.setValue(-300);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.timing(translateX, {
            toValue: 400,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          })
        ),
      ]).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => translateX.setValue(-300));
    }
  }, [visible]);

  return (
    <Animated.View style={[styles.progressTrack, { opacity }]}>
      <Animated.View
        style={[styles.progressBar, { transform: [{ translateX }] }]}
      />
    </Animated.View>
  );
};

// ─── Skeleton shimmer shown while the page loads ──────────────────────────────
const SkeletonLoader: React.FC = () => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.9],
  });

  const rows = [
    { w: "75%", h: 18 },
    { w: "55%", h: 12 },
    { w: "90%", h: 12 },
    { w: "40%", h: 12 },
    { w: "80%", h: 18 },
    { w: "65%", h: 12 },
    { w: "85%", h: 12 },
  ];

  return (
    <Animated.View style={[styles.skeletonWrap, { opacity }]}>
      {/* Image placeholder */}
      <View style={styles.skeletonImg} />

      {/* Text lines */}
      <View style={{ padding: 20, gap: 10 }}>
        {rows.map((r, i) => (
          <View
            key={i}
            style={[styles.skeletonLine, { width: r.w as any, height: r.h }]}
          />
        ))}
      </View>

      {/* Card placeholders */}
      <View style={{ flexDirection: "row", paddingHorizontal: 20, gap: 12 }}>
        {[0, 1].map((i) => (
          <View key={i} style={styles.skeletonCard} />
        ))}
      </View>
    </Animated.View>
  );
};

// ─── Error state ──────────────────────────────────────────────────────────────
const ErrorState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
  const { language } = useLanguage();
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.errorWrap,
        { opacity: fadeAnim, transform: [{ scale: bounceAnim }] },
      ]}
    >
      <View style={styles.errorIconBox}>
        <Ionicons name="cloud-offline-outline" size={38} color={C.accent} />
      </View>
      <Text style={styles.errorTitle}>
        {language ? i18n.t("technology.errorTitle") : "Couldn't load page"}
      </Text>
      <Text style={styles.errorBody}>
        {language
          ? i18n.t("technology.errorBody")
          : "Check your internet connection and try again."}
      </Text>
      <TouchableOpacity
        onPress={onRetry}
        style={styles.retryBtn}
        activeOpacity={0.8}
      >
        <Ionicons
          name="refresh-outline"
          size={16}
          color={C.surface}
          style={{ marginRight: 6 }}
        />
        <Text style={styles.retryText}>
          {language ? i18n.t("technology.retry") : "Retry"}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Header — matches news/events/videos style ────────────────────────────────
const Header: React.FC<{ onBack: () => void; isLoading: boolean }> = ({
  onBack,
  isLoading,
}) => {
  const { language } = useLanguage();
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.headerBackBtn}>
        <Ionicons name="arrow-back" size={20} color={C.text} />
      </TouchableOpacity>

      <View style={{ flex: 1 }}>
        <Text style={styles.headerTitle}>
          {language ? i18n.t("technology.screenTitle") : "Technology"}
        </Text>
        {isLoading && (
          <View style={styles.loadingRow}>
            {[0, 1, 2].map((i) => (
              <PulsingDot key={i} delay={i * 160} />
            ))}
            <Text style={styles.loadingLabel}>
              {language ? i18n.t("technology.loading") : "Loading…"}
            </Text>
          </View>
        )}
      </View>

      {/* Accent dot — decorative, matches the photosalbum TopBar style */}
      <View style={styles.accentDot} />
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const Technology: React.FC = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [webviewKey, setWebviewKey] = useState(0);

  const webviewFade = useRef(new Animated.Value(0)).current;

  const handleLoadEnd = () => {
    setIsLoading(false);
    Animated.timing(webviewFade, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    webviewFade.setValue(0);
    setWebviewKey((k) => k + 1);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Progress bar across very top */}
      <ProgressBar visible={isLoading && !hasError} />

      <Header
        onBack={() => navigation.goBack()}
        isLoading={isLoading && !hasError}
      />

      <View style={styles.content}>
        {/* Skeleton shown while loading */}
        {isLoading && !hasError && <SkeletonLoader />}

        {/* Error state */}
        {hasError && <ErrorState onRetry={handleRetry} />}

        {/* WebView — fades in once loaded */}
        {!hasError && (
          <Animated.View style={[styles.webviewWrap, { opacity: webviewFade }]}>
            <WebView
              key={webviewKey}
              style={styles.webview}
              originWhitelist={["*"]}
              source={{
                uri: "https://e-catalogs.taat-africa.org/toolkits/ready-to-scale-technologies-from-iita",
              }}
              onLoadStart={() => {
                setIsLoading(true);
                setHasError(false);
                webviewFade.setValue(0);
              }}
              onLoadEnd={handleLoadEnd}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Technology;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // Progress bar
  progressTrack: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(255,107,53,0.15)",
    zIndex: 99,
    overflow: "hidden",
  },
  progressBar: {
    width: 160,
    height: 3,
    borderRadius: 2,
    backgroundColor: C.accent,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.bg,
    gap: 12,
  },
  headerBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: C.surface,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: C.shadow,
    shadowOpacity: 1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: C.text,
    letterSpacing: -0.3,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  loadingLabel: { fontSize: 11, color: C.muted, marginLeft: 2 },
  accentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.accent,
  },

  // Content
  content: { flex: 1, position: "relative" },
  webviewWrap: { ...StyleSheet.absoluteFillObject },
  webview: { flex: 1, marginTop: Platform.OS === "ios" ? 10 : 0 },

  // Skeleton
  skeletonWrap: { flex: 1, backgroundColor: C.bg },
  skeletonImg: { width: "100%", height: 200, backgroundColor: C.border },
  skeletonLine: { borderRadius: 6, backgroundColor: C.border },
  skeletonCard: {
    flex: 1,
    height: 120,
    borderRadius: 12,
    backgroundColor: C.border,
  },

  // Pulsing dot
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.accent },

  // Error
  errorWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  errorIconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: C.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: C.text,
    marginBottom: 8,
    textAlign: "center",
  },
  errorBody: {
    fontSize: 14,
    color: C.muted,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 24,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: C.accent,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  retryText: { color: C.surface, fontWeight: "700", fontSize: 15 },
});
