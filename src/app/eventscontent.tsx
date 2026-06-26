import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Modal,
  Pressable,
  Share,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";
import { screenWidth } from "../utils/Dimension";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const COLORS = {
  bg: "rgb(242, 242, 242)",
  surface: "#FFFFFF",
  surfaceElevated: "#F5F5F5",
  border: "#E8E8E8",
  accent: "#FF6B35",
  accentSoft: "rgba(255,107,53,0.10)",
  text: "#1A1A1A",
  textMuted: "#888899",
  textDim: "#BBBBCC",
  white: "#FFFFFF",
  shadow: "rgba(0,0,0,0.07)",
};

// ─── Styled HTML for WebView ───────────────────────────────────────────────────
const buildHtml = (content: any) => `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <style>
      * {
        box-sizing: border-box;
        -webkit-text-size-adjust: 100%;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 15px;
        line-height: 1.75;
        color: #1A1A1A;
        background: rgb(242, 242, 242);
        padding: 20px 16px 48px;
        margin: 0;
        max-width: ${screenWidth}px;
        overflow-x: hidden;
      }
      h1, h2, h3, h4 {
        font-weight: 700;
        color: #1A1A1A;
        line-height: 1.3;
        margin-top: 24px;
        margin-bottom: 8px;
      }
      h1 { font-size: 22px; }
      h2 { font-size: 19px; }
      h3 { font-size: 16px; }
      p {
        margin: 0 0 14px;
        color: #333344;
      }
      a {
        color: #FF6B35;
        text-decoration: none;
        font-weight: 600;
      }
      img {
        display: block;
        width: 100%;
        height: auto;
        max-width: ${screenWidth - 32}px;
        border-radius: 12px;
        margin: 16px 0;
        object-fit: cover;
      }
      figure {
        margin: 16px 0;
      }
      figcaption {
        font-size: 12px;
        color: #888899;
        font-style: italic;
        margin-top: 6px;
        word-wrap: break-word;
      }
      blockquote {
        margin: 16px 0;
        padding: 12px 16px;
        border-left: 3px solid #FF6B35;
        background: rgba(255,107,53,0.06);
        border-radius: 0 8px 8px 0;
        color: #444;
        font-style: italic;
      }
      ul, ol {
        padding-left: 20px;
        margin-bottom: 14px;
      }
      li {
        margin-bottom: 6px;
        color: #333344;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 16px;
        font-size: 13px;
      }
      th {
        background: rgba(255,107,53,0.10);
        color: #FF6B35;
        font-weight: 700;
        padding: 10px 8px;
        text-align: left;
        border-bottom: 1px solid #E8E8E8;
      }
      td {
        padding: 10px 8px;
        border-bottom: 1px solid #F0F0F0;
        color: #333344;
      }
      hr {
        border: none;
        border-top: 1px solid #E8E8E8;
        margin: 24px 0;
      }
    </style>
  </head>
  <body>${content}</body>
</html>
`;

// ─── Header ────────────────────────────────────────────────────────────────────
const Header = ({ title, onBack, onShare, onTitlePress }: any) => (
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
        shadowColor: "#000",
        shadowOpacity: 0.07,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <Ionicons name="arrow-back" size={20} color={COLORS.text} />
    </TouchableOpacity>

    {/* Tappable title */}
    <TouchableOpacity
      style={{ flex: 1 }}
      onPress={onTitlePress}
      activeOpacity={0.7}
    >
      <Text
        numberOfLines={1}
        style={{
          color: COLORS.text,
          fontSize: 16,
          fontWeight: "700",
          letterSpacing: -0.2,
        }}
      >
        {title || "Event"}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          marginTop: 1,
        }}
      >
        <Ionicons name="calendar-outline" size={11} color={COLORS.accent} />
        <Text style={{ color: COLORS.accent, fontSize: 11, fontWeight: "600" }}>
          Event Details
        </Text>
      </View>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={onShare}
      style={{
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.07,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <Ionicons name="share-social-outline" size={19} color={COLORS.text} />
    </TouchableOpacity>
  </View>
);

// ─── Title Bottom Sheet ────────────────────────────────────────────────────────
const TitleSheet = ({ visible, title, onClose }: any) => {
  const slideAnim = useRef(new Animated.Value(400)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: visible ? 0 : 400,
        useNativeDriver: true,
        tension: 68,
        friction: 12,
      }),
      Animated.timing(opacityAnim, {
        toValue: visible ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
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
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          opacity: opacityAnim,
          justifyContent: "flex-end",
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            backgroundColor: COLORS.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 20,
            paddingBottom: 40,
          }}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            {/* Handle */}
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

            {/* Sheet header */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: COLORS.border,
                marginBottom: 16,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: COLORS.accentSoft,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={COLORS.accent}
                  />
                </View>
                <Text
                  style={{
                    color: COLORS.textMuted,
                    fontSize: 13,
                    fontWeight: "600",
                  }}
                >
                  Event Title
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: COLORS.surfaceElevated,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="close" size={18} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Title text */}
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: COLORS.text,
                textAlign: "center",
                paddingHorizontal: 24,
                lineHeight: 28,
                letterSpacing: -0.2,
              }}
            >
              {title}
            </Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ─── WebView Loading Bar ───────────────────────────────────────────────────────
const LoadingBar = ({ visible }: any) => {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      widthAnim.setValue(0);
      Animated.timing(widthAnim, {
        toValue: screenWidth * 0.85,
        duration: 1800,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(widthAnim, {
        toValue: screenWidth,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View
      style={{
        height: 3,
        backgroundColor: COLORS.border,
        width: "100%",
      }}
    >
      <Animated.View
        style={{
          height: 3,
          width: widthAnim,
          backgroundColor: COLORS.accent,
          borderRadius: 2,
        }}
      />
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
      No Content Available
    </Text>
    <Text
      style={{
        color: COLORS.textMuted,
        fontSize: 14,
        textAlign: "center",
        paddingHorizontal: 40,
      }}
    >
      Event details could not be loaded. Please try again.
    </Text>
  </View>
);

// ─── Main Screen ───────────────────────────────────────────────────────────────
const Eventscontent = () => {
  const navigation = useNavigation();
  const { id, title, content, link } = useLocalSearchParams();
  const [webViewLoading, setWebViewLoading] = useState(true);
  const [showTitleSheet, setShowTitleSheet] = useState(false);

  const onShare = async () => {
    try {
      await Share.share({
        message: title && link ? `${title}. Read more: ${link}` : title ?? "",
      } as any);
    } catch (error: any) {
      Alert.alert("Share failed", error.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <Header
        title={title}
        onBack={() => navigation.goBack()}
        onShare={onShare}
        onTitlePress={() => setShowTitleSheet(true)}
      />

      {/* Progress bar */}
      <LoadingBar visible={webViewLoading} />

      {content ? (
        <WebView
          originWhitelist={["*"]}
          source={{ html: buildHtml(content) }}
          style={{ flex: 1, backgroundColor: COLORS.bg }}
          scalesPageToFit={false}
          javaScriptEnabled
          domStorageEnabled
          onLoadStart={() => setWebViewLoading(true)}
          onLoadEnd={() => setWebViewLoading(false)}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState />
      )}

      <TitleSheet
        visible={showTitleSheet}
        title={title}
        onClose={() => setShowTitleSheet(false)}
      />
    </SafeAreaView>
  );
};

export default Eventscontent;
