// import { Ionicons } from "@expo/vector-icons";
// import { useLocalSearchParams, useNavigation } from "expo-router";
// import React, { useCallback, useRef, useState } from "react";
// import {
//   Alert,
//   Animated,
//   ScrollView,
//   Share,
//   StatusBar,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import YoutubePlayer from "react-native-youtube-iframe";

// // ─── Design Tokens ─────────────────────────────────────────────────────────────
// const COLORS = {
//   bg: "rgb(242, 242, 242)",
//   surface: "#FFFFFF",
//   surfaceElevated: "#F5F5F5",
//   border: "#E8E8E8",
//   accent: "#FF6B35",
//   accentSoft: "rgba(255,107,53,0.10)",
//   text: "#1A1A1A",
//   textMuted: "#888899",
//   textDim: "#BBBBCC",
//   white: "#FFFFFF",
//   playerBg: "#0F0F0F",
// };

// // ─── Header ────────────────────────────────────────────────────────────────────
// const Header = ({ title, onBack, onShare }: any) => (
//   <View
//     style={{
//       flexDirection: "row",
//       alignItems: "center",
//       paddingHorizontal: 16,
//       paddingVertical: 12,
//       borderBottomWidth: 1,
//       borderBottomColor: COLORS.border,
//       backgroundColor: COLORS.bg,
//       gap: 12,
//     }}
//   >
//     <TouchableOpacity
//       onPress={onBack}
//       style={{
//         width: 38,
//         height: 38,
//         borderRadius: 10,
//         backgroundColor: COLORS.surface,
//         justifyContent: "center",
//         alignItems: "center",
//         elevation: 2,
//         shadowColor: "#000",
//         shadowOpacity: 0.07,
//         shadowRadius: 4,
//       }}
//     >
//       <Ionicons name="arrow-back" size={20} color={COLORS.text} />
//     </TouchableOpacity>

//     <Text
//       numberOfLines={1}
//       style={{
//         flex: 1,
//         color: COLORS.text,
//         fontSize: 17,
//         fontWeight: "800",
//         letterSpacing: -0.3,
//       }}
//     >
//       {title || "Video"}
//     </Text>

//     <TouchableOpacity
//       onPress={onShare}
//       style={{
//         width: 38,
//         height: 38,
//         borderRadius: 10,
//         backgroundColor: COLORS.surface,
//         borderWidth: 1,
//         borderColor: COLORS.border,
//         justifyContent: "center",
//         alignItems: "center",
//         elevation: 2,
//         shadowColor: "#000",
//         shadowOpacity: 0.07,
//         shadowRadius: 4,
//       }}
//     >
//       <Ionicons name="share-social-outline" size={19} color={COLORS.text} />
//     </TouchableOpacity>
//   </View>
// );

// // ─── Action Button ─────────────────────────────────────────────────────────────
// const ActionButton = ({ icon, label, onPress }: any) => {
//   const scaleAnim = useRef(new Animated.Value(1)).current;

//   const onPressIn = () =>
//     Animated.spring(scaleAnim, {
//       toValue: 0.93,
//       useNativeDriver: true,
//       tension: 200,
//     }).start();
//   const onPressOut = () =>
//     Animated.spring(scaleAnim, {
//       toValue: 1,
//       useNativeDriver: true,
//       tension: 200,
//     }).start();

//   return (
//     <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
//       <TouchableOpacity
//         onPress={onPress}
//         onPressIn={onPressIn}
//         onPressOut={onPressOut}
//         activeOpacity={1}
//         style={{
//           flexDirection: "row",
//           alignItems: "center",
//           gap: 7,
//           paddingHorizontal: 18,
//           paddingVertical: 11,
//           borderRadius: 12,
//           backgroundColor: COLORS.surface,
//           borderWidth: 1,
//           borderColor: COLORS.border,
//           elevation: 2,
//           shadowColor: "#000",
//           shadowOpacity: 0.06,
//           shadowRadius: 4,
//         }}
//       >
//         <Ionicons name={icon} size={18} color={COLORS.accent} />
//         <Text style={{ color: COLORS.text, fontSize: 13, fontWeight: "700" }}>
//           {label}
//         </Text>
//       </TouchableOpacity>
//     </Animated.View>
//   );
// };

// // ─── Main Screen ───────────────────────────────────────────────────────────────
// const Videoplay = () => {
//   const { id: itemId, otherParam } = useLocalSearchParams();
//   const navigation = useNavigation();

//   const [playing, setPlaying] = useState(true);
//   const [playerReady, setPlayerReady] = useState(false);
//   const [ended, setEnded] = useState(false);
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   const onReady = useCallback(() => {
//     setPlayerReady(true);
//     Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 400,
//       useNativeDriver: true,
//     }).start();
//   }, []);

//   const onStateChange = useCallback((state: any) => {
//     if (state === "ended") {
//       setPlaying(false);
//       setEnded(true);
//     }
//     if (state === "playing") setEnded(false);
//   }, []);

//   const togglePlaying = useCallback(() => {
//     setPlaying((prev) => !prev);
//     setEnded(false);
//   }, []);

//   const onShare = async () => {
//     try {
//       await Share.share({
//         message: `${
//           otherParam ?? "Watch this video"
//         }. https://youtube.com/watch?v=${itemId}`,
//       });
//     } catch (error: any) {
//       Alert.alert("Share failed", error.message);
//     }
//   };

//   const openOnYouTube = () => {
//     const { Linking } = require("react-native");
//     Linking.openURL(`https://youtube.com/watch?v=${itemId}`).catch(() =>
//       Alert.alert("Could not open YouTube")
//     );
//   };

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
//       <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

//       <Header
//         title={otherParam}
//         onBack={() => navigation.goBack()}
//         onShare={onShare}
//       />

//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ paddingBottom: 48 }}
//       >
//         {/* ── Player Card ── */}
//         <View
//           style={{
//             marginHorizontal: 16,
//             marginTop: 16,
//             borderRadius: 20,
//             overflow: "hidden",
//             backgroundColor: COLORS.playerBg,
//             shadowColor: "#000",
//             shadowOffset: { width: 0, height: 6 },
//             shadowOpacity: 0.18,
//             shadowRadius: 16,
//             elevation: 8,
//           }}
//         >
//           {/* Player top bar */}
//           <View
//             style={{
//               flexDirection: "row",
//               alignItems: "center",
//               gap: 6,
//               paddingHorizontal: 14,
//               paddingVertical: 10,
//               borderBottomWidth: 1,
//               borderBottomColor: "rgba(255,255,255,0.06)",
//             }}
//           >
//             <View
//               style={{
//                 width: 8,
//                 height: 8,
//                 borderRadius: 4,
//                 backgroundColor: COLORS.accent,
//               }}
//             />
//             <Text
//               style={{
//                 color: "rgba(255,255,255,0.55)",
//                 fontSize: 11,
//                 fontWeight: "700",
//                 letterSpacing: 1.2,
//                 textTransform: "uppercase",
//                 flex: 1,
//               }}
//             >
//               Now Playing
//             </Text>
//             {/* Live indicator dot */}
//             {playing && !ended && (
//               <View
//                 style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
//               >
//                 <View
//                   style={{
//                     width: 6,
//                     height: 6,
//                     borderRadius: 3,
//                     backgroundColor: "#22C55E",
//                   }}
//                 />
//                 <Text
//                   style={{
//                     color: "#22C55E",
//                     fontSize: 10,
//                     fontWeight: "700",
//                     letterSpacing: 0.8,
//                   }}
//                 >
//                   PLAYING
//                 </Text>
//               </View>
//             )}
//           </View>

//           {/* YouTube Player */}
//           <Animated.View style={{ opacity: playerReady ? fadeAnim : 1 }}>
//             <YoutubePlayer
//               height={220}
//               play={playing}
//               videoId={itemId}
//               onChangeState={onStateChange}
//               onReady={onReady}
//               webViewStyle={{ opacity: 0.99 }}
//             />
//           </Animated.View>

//           {/* Loading placeholder */}
//           {!playerReady && (
//             <View
//               style={{
//                 position: "absolute",
//                 top: 38,
//                 left: 0,
//                 right: 0,
//                 height: 220,
//                 justifyContent: "center",
//                 alignItems: "center",
//                 backgroundColor: COLORS.playerBg,
//               }}
//             >
//               <View
//                 style={{
//                   width: 52,
//                   height: 52,
//                   borderRadius: 26,
//                   backgroundColor: COLORS.accentSoft,
//                   justifyContent: "center",
//                   alignItems: "center",
//                 }}
//               >
//                 <Ionicons
//                   name="play"
//                   size={24}
//                   color={COLORS.accent}
//                   style={{ marginLeft: 3 }}
//                 />
//               </View>
//             </View>
//           )}
//         </View>

//         {/* ── Video Info Card ── */}
//         <View
//           style={{
//             marginHorizontal: 16,
//             marginTop: 14,
//             backgroundColor: COLORS.surface,
//             borderRadius: 16,
//             padding: 16,
//             elevation: 2,
//             shadowColor: "#000",
//             shadowOpacity: 0.06,
//             shadowRadius: 8,
//           }}
//         >
//           <Text
//             style={{
//               color: COLORS.text,
//               fontSize: 15,
//               fontWeight: "700",
//               lineHeight: 22,
//               letterSpacing: 0.1,
//               marginBottom: 10,
//             }}
//           >
//             {otherParam || "Untitled Video"}
//           </Text>

//           <View
//             style={{
//               flexDirection: "row",
//               alignItems: "center",
//               gap: 6,
//               paddingTop: 10,
//               borderTopWidth: 1,
//               borderTopColor: COLORS.border,
//             }}
//           >
//             <View
//               style={{
//                 flexDirection: "row",
//                 alignItems: "center",
//                 gap: 5,
//                 backgroundColor: COLORS.accentSoft,
//                 paddingHorizontal: 10,
//                 paddingVertical: 4,
//                 borderRadius: 20,
//               }}
//             >
//               <Ionicons name="logo-youtube" size={13} color={COLORS.accent} />
//               <Text
//                 style={{
//                   color: COLORS.accent,
//                   fontSize: 11,
//                   fontWeight: "700",
//                   letterSpacing: 0.3,
//                 }}
//               >
//                 YouTube
//               </Text>
//             </View>

//             <Text style={{ color: COLORS.textDim, fontSize: 11 }}>
//               ID: {itemId}
//             </Text>
//           </View>
//         </View>

//         {/* ── Controls Card ── */}
//         <View
//           style={{
//             marginHorizontal: 16,
//             marginTop: 12,
//             backgroundColor: COLORS.surface,
//             borderRadius: 16,
//             padding: 16,
//             elevation: 2,
//             shadowColor: "#000",
//             shadowOpacity: 0.06,
//             shadowRadius: 8,
//           }}
//         >
//           <Text
//             style={{
//               color: COLORS.textMuted,
//               fontSize: 11,
//               fontWeight: "700",
//               letterSpacing: 1,
//               textTransform: "uppercase",
//               marginBottom: 12,
//             }}
//           >
//             Controls
//           </Text>

//           <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
//             <ActionButton
//               icon={ended ? "refresh" : playing ? "pause" : "play"}
//               label={ended ? "Replay" : playing ? "Pause" : "Play"}
//               onPress={togglePlaying}
//             />
//             <ActionButton
//               icon="share-social-outline"
//               label="Share"
//               onPress={onShare}
//             />
//             <ActionButton
//               icon="logo-youtube"
//               label="Open in YouTube"
//               onPress={openOnYouTube}
//             />
//           </View>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default Videoplay;

import { useLanguage } from "@/context/LanguageContext";
import i18n from "@/i18n";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  Animated,
  ScrollView,
  Share,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import YoutubePlayer from "react-native-youtube-iframe";

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
  playerBg: "#0F0F0F",
};

// ─── Header ────────────────────────────────────────────────────────────────────
const Header = ({ title, onBack, onShare }: any) => {
  const { language } = useLanguage();
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
          elevation: 2,
          shadowColor: "#000",
          shadowOpacity: 0.07,
          shadowRadius: 4,
        }}
      >
        <Ionicons name="arrow-back" size={20} color={COLORS.text} />
      </TouchableOpacity>

      <Text
        numberOfLines={1}
        style={{
          flex: 1,
          color: COLORS.text,
          fontSize: 17,
          fontWeight: "800",
          letterSpacing: -0.3,
        }}
      >
        {title || (language ? i18n.t("videoplay.video") : "Video")}
      </Text>

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
          elevation: 2,
          shadowColor: "#000",
          shadowOpacity: 0.07,
          shadowRadius: 4,
        }}
      >
        <Ionicons name="share-social-outline" size={19} color={COLORS.text} />
      </TouchableOpacity>
    </View>
  );
};

// ─── Action Button ─────────────────────────────────────────────────────────────
const ActionButton = ({ icon, label, onPress }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const onPressIn = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.93,
      useNativeDriver: true,
      tension: 200,
    }).start();
  const onPressOut = () =>
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
    }).start();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 7,
          paddingHorizontal: 18,
          paddingVertical: 11,
          borderRadius: 12,
          backgroundColor: COLORS.surface,
          borderWidth: 1,
          borderColor: COLORS.border,
          elevation: 2,
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 4,
        }}
      >
        <Ionicons name={icon} size={18} color={COLORS.accent} />
        <Text style={{ color: COLORS.text, fontSize: 13, fontWeight: "700" }}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Main Screen ───────────────────────────────────────────────────────────────
const Videoplay = () => {
  const { id: itemId, otherParam } = useLocalSearchParams();
  const navigation = useNavigation();
  const { language } = useLanguage();

  const [playing, setPlaying] = useState(true);
  const [playerReady, setPlayerReady] = useState(false);
  const [ended, setEnded] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const onReady = useCallback(() => {
    setPlayerReady(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const onStateChange = useCallback((state: any) => {
    if (state === "ended") {
      setPlaying(false);
      setEnded(true);
    }
    if (state === "playing") setEnded(false);
  }, []);

  const togglePlaying = useCallback(() => {
    setPlaying((prev) => !prev);
    setEnded(false);
  }, []);

  const onShare = async () => {
    try {
      await Share.share({
        message: `${
          otherParam ?? i18n.t("videoplay.watchThis")
        }. https://youtube.com/watch?v=${itemId}`,
      });
    } catch (error: any) {
      Alert.alert(i18n.t("videoplay.shareFailed"), error.message);
    }
  };

  const openOnYouTube = () => {
    const { Linking } = require("react-native");
    Linking.openURL(`https://youtube.com/watch?v=${itemId}`).catch(() =>
      Alert.alert(i18n.t("videoplay.couldNotOpenYouTube"))
    );
  };

  // ── Derived labels ──────────────────────────────────────────────────────────
  const playPauseIcon = ended ? "refresh" : playing ? "pause" : "play";
  const playPauseLabel = language
    ? i18n.t(
        ended
          ? "videoplay.replay"
          : playing
          ? "videoplay.pause"
          : "videoplay.play"
      )
    : ended
    ? "Replay"
    : playing
    ? "Pause"
    : "Play";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <Header
        title={otherParam}
        onBack={() => navigation.goBack()}
        onShare={onShare}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        {/* ── Player Card ── */}
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 16,
            borderRadius: 20,
            overflow: "hidden",
            backgroundColor: COLORS.playerBg,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.18,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          {/* Player top bar */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderBottomColor: "rgba(255,255,255,0.06)",
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: COLORS.accent,
              }}
            />
            <Text
              style={{
                color: "rgba(255,255,255,0.55)",
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 1.2,
                textTransform: "uppercase",
                flex: 1,
              }}
            >
              {language ? i18n.t("videoplay.nowPlaying") : "Now Playing"}
            </Text>
            {playing && !ended && (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: "#22C55E",
                  }}
                />
                <Text
                  style={{
                    color: "#22C55E",
                    fontSize: 10,
                    fontWeight: "700",
                    letterSpacing: 0.8,
                  }}
                >
                  {language ? i18n.t("videoplay.playing") : "PLAYING"}
                </Text>
              </View>
            )}
          </View>

          {/* YouTube Player */}
          <Animated.View style={{ opacity: playerReady ? fadeAnim : 1 }}>
            <YoutubePlayer
              height={220}
              play={playing}
              videoId={itemId}
              onChangeState={onStateChange}
              onReady={onReady}
              webViewStyle={{ opacity: 0.99 }}
            />
          </Animated.View>

          {/* Loading placeholder */}
          {!playerReady && (
            <View
              style={{
                position: "absolute",
                top: 38,
                left: 0,
                right: 0,
                height: 220,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: COLORS.playerBg,
              }}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: COLORS.accentSoft,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name="play"
                  size={24}
                  color={COLORS.accent}
                  style={{ marginLeft: 3 }}
                />
              </View>
            </View>
          )}
        </View>

        {/* ── Video Info Card ── */}
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 14,
            backgroundColor: COLORS.surface,
            borderRadius: 16,
            padding: 16,
            elevation: 2,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 8,
          }}
        >
          <Text
            style={{
              color: COLORS.text,
              fontSize: 15,
              fontWeight: "700",
              lineHeight: 22,
              letterSpacing: 0.1,
              marginBottom: 10,
            }}
          >
            {otherParam ||
              (language ? i18n.t("videoplay.untitledVideo") : "Untitled Video")}
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingTop: 10,
              borderTopWidth: 1,
              borderTopColor: COLORS.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                backgroundColor: COLORS.accentSoft,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 20,
              }}
            >
              <Ionicons name="logo-youtube" size={13} color={COLORS.accent} />
              <Text
                style={{
                  color: COLORS.accent,
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 0.3,
                }}
              >
                YouTube
              </Text>
            </View>
            <Text style={{ color: COLORS.textDim, fontSize: 11 }}>
              {language ? i18n.t("videoplay.id") : "ID"}: {itemId}
            </Text>
          </View>
        </View>

        {/* ── Controls Card ── */}
        <View
          style={{
            marginHorizontal: 16,
            marginTop: 12,
            backgroundColor: COLORS.surface,
            borderRadius: 16,
            padding: 16,
            elevation: 2,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 8,
          }}
        >
          <Text
            style={{
              color: COLORS.textMuted,
              fontSize: 11,
              fontWeight: "700",
              letterSpacing: 1,
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            {language ? i18n.t("videoplay.controls") : "Controls"}
          </Text>

          <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
            <ActionButton
              icon={playPauseIcon}
              label={playPauseLabel}
              onPress={togglePlaying}
            />
            <ActionButton
              icon="share-social-outline"
              label={language ? i18n.t("videoplay.share") : "Share"}
              onPress={onShare}
            />
            <ActionButton
              icon="logo-youtube"
              label={
                language ? i18n.t("videoplay.openInYouTube") : "Open in YouTube"
              }
              onPress={openOnYouTube}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Videoplay;
