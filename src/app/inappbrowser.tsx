// import { Ionicons } from "@expo/vector-icons";
// import React, { useRef, useState } from "react";
// import {
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import WebView from "react-native-webview";

// import { useHeaderHeight } from "@react-navigation/elements";
// import { useLocalSearchParams, useNavigation } from "expo-router";
// import LoadingSpinner from "../components/LoadingSpinner";
// import { baseStyle } from "../utils/BaseStyle";
// import { screenHeight, screenWidth } from "../utils/Dimension";

// const InAppBrowser = ({}) => {
//   const webViewRef = useRef<WebView | null>(null);
//   const { url: passedUrl } = useLocalSearchParams();
//   const headerHeight = useHeaderHeight();
//   const navigation = useNavigation();
//   const [loading, setLoading] = useState(false);
//   const [url, setUrl] = useState(passedUrl);

//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//       {/* header */}
//       <View
//         style={[
//           baseStyle.paddingHorizontal,
//           baseStyle.marginTop,
//           {
//             height: 60,
//             width: screenWidth,
//             backgroundColor: "#ccc",
//             // position: "absolute",
//             // top: status_bar_height,
//             // left: 0,
//           },
//           styles.flexRowBetween,
//         ]}
//       >
//         <View style={[styles.flexRow, { maxWidth: "25%" }]}>
//           {/* back to previous screen */}
//           <TouchableOpacity onPress={() => navigation.goBack()}>
//             <Ionicons name="arrow-back" size={25} color={"black"} />
//           </TouchableOpacity>

//           {/* goback web history */}
//           <TouchableOpacity
//             onPress={() => webViewRef.current?.goBack()}
//             style={{ marginLeft: 20, marginRight: 10 }}
//           >
//             <Ionicons name="chevron-back-outline" size={25} color={"black"} />
//           </TouchableOpacity>
//           {/* goforward web history */}
//           <TouchableOpacity onPress={() => webViewRef.current?.goForward()}>
//             <Ionicons
//               name="chevron-forward-outline"
//               size={25}
//               color={"black"}
//             />
//           </TouchableOpacity>
//         </View>
//         <TouchableOpacity
//           style={{
//             maxWidth: "50%",
//           }}
//         >
//           <Text style={{}} numberOfLines={1} ellipsizeMode="tail">
//             {url}
//           </Text>
//         </TouchableOpacity>

//         {/* reload and stop */}
//         <View style={[styles.flexRow, { maxWidth: "25%" }]}>
//           <TouchableOpacity
//             onPress={() => webViewRef.current?.reload()}
//             style={{ marginRight: 10 }}
//           >
//             <Ionicons name="reload-sharp" size={25} color={"black"} />
//           </TouchableOpacity>
//           <TouchableOpacity onPress={() => webViewRef.current?.stopLoading()}>
//             <Ionicons name="close" size={25} color={"black"} />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {loading ? (
//         <LoadingSpinner />
//       ) : (
//         <WebView
//           ref={webViewRef}
//           // onLoadStart={() => setLoading(true)}
//           // onLoadEnd={() => setLoading(false)}
//           onNavigationStateChange={(event) => setUrl(event.url)}
//           renderLoading={() => <LoadingSpinner />}
//           source={{ uri: url } as any}
//           containerStyle={{
//             maxWidth: screenWidth,
//             height: screenHeight - headerHeight,
//             flexGrow: 1,
//           }}
//           style={[
//             baseStyle.paddingHorizontal,
//             {
//               flex: 1,
//               borderWidth: 2,
//               borderColor: "red",
//               maxWidth: screenWidth,
//             },
//           ]}
//         />
//       )}
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   flexRowBetween: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   flexRow: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
// });
// export default InAppBrowser;

import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import WebView, { WebViewNavigation } from "react-native-webview";

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = {
  bg: "#0D0D12",
  surface: "#161620",
  surfaceElevated: "#1E1E2E",
  border: "#2A2A3D",
  accent: "#FF6B2B",
  accentMuted: "rgba(255,107,43,0.13)",
  accentBorder: "rgba(255,107,43,0.35)",
  textPrimary: "#F0EEF8",
  textSecondary: "#9997B0",
  textMuted: "#5A5870",
};

// ─── Progress bar ─────────────────────────────────────────────────────────────

const ProgressBar: React.FC<{ progress: number; visible: boolean }> = ({
  progress,
  visible,
}) => {
  if (!visible) return null;
  return (
    <View style={styles.progressTrack}>
      <Animated.View
        style={[styles.progressFill, { width: `${progress * 100}%` }]}
      />
    </View>
  );
};

// ─── Icon button ──────────────────────────────────────────────────────────────

const NavBtn: React.FC<{
  icon: string;
  onPress: () => void;
  disabled?: boolean;
}> = ({ icon, onPress, disabled }) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={({ pressed }) => [
      styles.navBtn,
      pressed && { opacity: 0.6 },
      disabled && { opacity: 0.3 },
    ]}
    hitSlop={8}
  >
    <Ionicons
      name={icon as any}
      size={18}
      color={disabled ? COLORS.textMuted : COLORS.textPrimary}
    />
  </Pressable>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const InAppBrowser: React.FC = () => {
  const webViewRef = useRef<WebView | null>(null);
  const navigation = useNavigation();
  const { url: passedUrl } = useLocalSearchParams<{ url: string }>();

  const [currentUrl, setCurrentUrl] = useState(passedUrl ?? "");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [pageTitle, setPageTitle] = useState("");

  const handleNavChange = (event: WebViewNavigation) => {
    setCurrentUrl(event.url);
    setCanGoBack(event.canGoBack);
    setCanGoForward(event.canGoForward);
    if (event.title) setPageTitle(event.title);
  };

  const displayHost = (() => {
    try {
      return new URL(currentUrl).hostname.replace(/^www\./, "");
    } catch {
      return currentUrl;
    }
  })();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* ── Browser chrome ── */}
      <View style={styles.toolbar}>
        {/* Left: back to app + web history */}
        <View style={styles.toolbarGroup}>
          <NavBtn icon="arrow-back" onPress={() => navigation.goBack()} />
          <View style={styles.divider} />
          <NavBtn
            icon="chevron-back"
            onPress={() => webViewRef.current?.goBack()}
            disabled={!canGoBack}
          />
          <NavBtn
            icon="chevron-forward"
            onPress={() => webViewRef.current?.goForward()}
            disabled={!canGoForward}
          />
        </View>

        {/* Center: URL pill */}
        <View style={styles.urlPill}>
          <View style={styles.urlLockIcon}>
            <Ionicons
              name={
                currentUrl.startsWith("https")
                  ? "lock-closed"
                  : "lock-open-outline"
              }
              size={10}
              color={
                currentUrl.startsWith("https")
                  ? COLORS.accent
                  : COLORS.textMuted
              }
            />
          </View>
          <Text style={styles.urlText} numberOfLines={1} ellipsizeMode="tail">
            {pageTitle || displayHost}
          </Text>
        </View>

        {/* Right: reload / stop */}
        <View style={styles.toolbarGroup}>
          {loading ? (
            <NavBtn
              icon="close"
              onPress={() => webViewRef.current?.stopLoading()}
            />
          ) : (
            <NavBtn
              icon="refresh"
              onPress={() => webViewRef.current?.reload()}
            />
          )}
        </View>
      </View>

      {/* ── Progress bar ── */}
      <ProgressBar progress={progress} visible={loading} />

      {/* ── WebView ── */}
      <WebView
        ref={webViewRef}
        source={{ uri: currentUrl }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => {
          setLoading(false);
          setProgress(1);
        }}
        onLoadProgress={({ nativeEvent }) => setProgress(nativeEvent.progress)}
        onNavigationStateChange={handleNavChange}
        renderLoading={() => <View style={styles.webviewPlaceholder} />}
        startInLoadingState
        javaScriptEnabled
        domStorageEnabled
      />
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  // Toolbar
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  toolbarGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  divider: {
    width: 1,
    height: 18,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },

  // URL pill
  urlPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    minWidth: 0,
  },
  urlLockIcon: {
    width: 14,
    height: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  urlText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textSecondary,
    letterSpacing: 0.1,
  },

  // Progress
  progressTrack: {
    height: 2,
    width: "100%",
    backgroundColor: COLORS.border,
  },
  progressFill: {
    height: 2,
    backgroundColor: COLORS.accent,
    borderRadius: 1,
  },

  // WebView
  webview: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  webviewPlaceholder: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
});

export default InAppBrowser;
