// import { Ionicons } from "@expo/vector-icons";
// import {
//   setAudioModeAsync,
//   useAudioPlayer,
//   useAudioPlayerStatus,
// } from "expo-audio";
// import { LinearGradient } from "expo-linear-gradient";
// import LottieView from "lottie-react-native";
// import React, { useEffect, useRef, useState } from "react";
// import {
//   Animated,
//   Dimensions,
//   Image,
//   PanResponder,
//   Pressable,
//   Text,
//   View,
// } from "react-native";

// const streamUrl = "https://s3.radio.co/sb3fb8fe8d/listen";
// const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// const GlobalRadio = () => {
//   const [trackTitle, setTrackTitle] = useState("");
//   const [collapsed, setCollapsed] = useState(false);

//   const equalizerRefs = useRef<(LottieView | null)[]>([]);
//   const pulseAnim = useRef(new Animated.Value(1)).current;
//   const rotateAnim = useRef(new Animated.Value(0)).current;
//   const liveDotAnim = useRef(new Animated.Value(1)).current;

//   // Drag position — start bottom-right
//   const pan = useRef(
//     new Animated.ValueXY({ x: SCREEN_W - 280, y: SCREEN_H - 160 })
//   ).current;

//   const player = useAudioPlayer({ uri: streamUrl });
//   const status = useAudioPlayerStatus(player);
//   const playing = status.playing;

//   /* AUDIO MODE */
//   useEffect(() => {
//     setAudioModeAsync({
//       playsInSilentMode: true,
//       shouldPlayInBackground: true,
//       interruptionMode: "doNotMix",
//     });
//   }, []);

//   /* FETCH CURRENT TRACK */
//   useEffect(() => {
//     const fetchTrack = () => {
//       fetch("https://ireport.iita.org/dontdelete.php")
//         .then((res) => res.json())
//         .then((json) => {
//           if (json?.title) setTrackTitle(json.title);
//         })
//         .catch(console.error);
//     };
//     fetchTrack();
//     const interval = setInterval(fetchTrack, 10000);
//     return () => clearInterval(interval);
//   }, []);

//   /* LIVE DOT PULSE — always */
//   useEffect(() => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(liveDotAnim, {
//           toValue: 0.3,
//           duration: 700,
//           useNativeDriver: true,
//         }),
//         Animated.timing(liveDotAnim, {
//           toValue: 1,
//           duration: 700,
//           useNativeDriver: true,
//         }),
//       ])
//     ).start();
//   }, []);

//   /* PLAY ANIMATIONS */
//   useEffect(() => {
//     if (playing) {
//       Animated.loop(
//         Animated.sequence([
//           Animated.timing(pulseAnim, {
//             toValue: 1.06,
//             duration: 900,
//             useNativeDriver: true,
//           }),
//           Animated.timing(pulseAnim, {
//             toValue: 1,
//             duration: 900,
//             useNativeDriver: true,
//           }),
//         ])
//       ).start();
//       Animated.loop(
//         Animated.timing(rotateAnim, {
//           toValue: 1,
//           duration: 10000,
//           useNativeDriver: true,
//         })
//       ).start();
//       equalizerRefs.current.forEach((ref) => ref?.play?.());
//     } else {
//       pulseAnim.stopAnimation();
//       pulseAnim.setValue(1);
//       rotateAnim.stopAnimation();
//       equalizerRefs.current.forEach((ref) => ref?.pause?.());
//     }
//   }, [playing]);

//   const rotate = rotateAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: ["0deg", "360deg"],
//   });

//   /* DRAG */
//   const panResponder = useRef(
//     PanResponder.create({
//       onMoveShouldSetPanResponder: (_, gs) =>
//         Math.abs(gs.dx) > 4 || Math.abs(gs.dy) > 4,
//       onPanResponderGrant: () => {
//         pan.setOffset({ x: (pan.x as any)._value, y: (pan.y as any)._value });
//         pan.setValue({ x: 0, y: 0 });
//       },
//       onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
//         useNativeDriver: false,
//       }),
//       onPanResponderRelease: () => {
//         pan.flattenOffset();
//       },
//     })
//   ).current;

//   const togglePlayback = () => {
//     if (playing) player.pause();
//     else player.play();
//   };

//   const PILL_HEIGHT = 60;
//   const PILL_WIDTH_EXPANDED = 252;
//   const PILL_WIDTH_COLLAPSED = 60;

//   return (
//     <Animated.View
//       style={{
//         position: "absolute",
//         zIndex: 999,
//         transform: [{ translateX: pan.x }, { translateY: pan.y }],
//       }}
//       {...panResponder.panHandlers}
//     >
//       <View
//         style={{
//           width: collapsed ? PILL_WIDTH_COLLAPSED : PILL_WIDTH_EXPANDED,
//           height: PILL_HEIGHT,
//           borderRadius: 60,
//           backgroundColor: "#0f0f14",
//           borderWidth: 0.5,
//           borderColor: "rgba(255,255,255,0.12)",
//           flexDirection: "row",
//           alignItems: "center",
//           paddingHorizontal: collapsed ? 10 : 8,
//           overflow: "hidden",
//         }}
//       >
//         {/* DISC */}
//         <Animated.View
//           style={{
//             transform: [{ rotate }, { scale: pulseAnim }],
//           }}
//         >
//           <LinearGradient
//             colors={["#FFB406", "#F34900", "#1a1a1a"]}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 1 }}
//             style={{
//               width: 42,
//               height: 42,
//               borderRadius: 21,
//               justifyContent: "center",
//               alignItems: "center",
//             }}
//           >
//             <Image
//               source={require("../../assets/images/radio.png")}
//               style={{ width: 32, height: 32, borderRadius: 16 }}
//             />
//             <View
//               style={{
//                 position: "absolute",
//                 width: 10,
//                 height: 10,
//                 borderRadius: 5,
//                 backgroundColor: "#0f0f14",
//                 borderWidth: 1.5,
//                 borderColor: "rgba(255,255,255,0.2)",
//               }}
//             />
//           </LinearGradient>
//         </Animated.View>

//         {/* LIVE DOT on disc */}
//         <Animated.View
//           style={{
//             position: "absolute",
//             top: 8,
//             left: 42,
//             width: 9,
//             height: 9,
//             borderRadius: 5,
//             backgroundColor: "#FF3B30",
//             borderWidth: 1.5,
//             borderColor: "#0f0f14",
//             opacity: liveDotAnim,
//           }}
//         />

//         {/* INFO — hidden when collapsed */}
//         {!collapsed && (
//           <View style={{ flex: 1, marginLeft: 10, marginRight: 6 }}>
//             <Text
//               style={{
//                 color: "#fff",
//                 fontSize: 12,
//                 fontWeight: "800",
//                 letterSpacing: 0.4,
//               }}
//             >
//               Radio IITA
//             </Text>

//             <Text
//               numberOfLines={1}
//               style={{
//                 color: "rgba(255,255,255,0.45)",
//                 fontSize: 10,
//                 marginTop: 1,
//                 fontFamily: "monospace",
//               }}
//             >
//               {trackTitle || "Knowledge for Agriculture"}
//             </Text>

//             {/* EQUALIZER BARS */}
//             {playing && (
//               <View style={{ flexDirection: "row", marginTop: 4 }}>
//                 {[0, 1, 2].map((_, index) => (
//                   <LottieView
//                     key={index}
//                     ref={(ref) => {
//                       equalizerRefs.current[index] = ref;
//                     }}
//                     source={require("../../assets/images/equalizer.json")}
//                     autoPlay
//                     loop
//                     style={{ width: 28, height: 14, marginRight: -4 }}
//                   />
//                 ))}
//               </View>
//             )}
//           </View>
//         )}

//         {/* PLAY BUTTON */}
//         <Pressable onPress={togglePlayback}>
//           <LinearGradient
//             colors={playing ? ["#FF5F6D", "#FFC371"] : ["#FFB406", "#F34900"]}
//             style={{
//               width: collapsed ? 40 : 34,
//               height: collapsed ? 40 : 34,
//               borderRadius: 20,
//               justifyContent: "center",
//               alignItems: "center",
//             }}
//           >
//             <Ionicons
//               name={playing ? "pause" : "play"}
//               size={collapsed ? 18 : 15}
//               color="#fff"
//             />
//           </LinearGradient>
//         </Pressable>

//         {/* COLLAPSE TOGGLE */}
//         {!collapsed && (
//           <Pressable
//             onPress={() => setCollapsed(true)}
//             style={{ marginLeft: 6 }}
//           >
//             <Ionicons
//               name="chevron-forward"
//               size={14}
//               color="rgba(255,255,255,0.3)"
//             />
//           </Pressable>
//         )}
//       </View>

//       {/* EXPAND BUTTON — shown only when collapsed, outside pill */}
//       {collapsed && (
//         <Pressable
//           onPress={() => setCollapsed(false)}
//           style={{
//             position: "absolute",
//             top: -6,
//             right: -4,
//             width: 18,
//             height: 18,
//             borderRadius: 9,
//             backgroundColor: "#1e1e28",
//             borderWidth: 0.5,
//             borderColor: "rgba(255,255,255,0.15)",
//             justifyContent: "center",
//             alignItems: "center",
//           }}
//         >
//           <Ionicons
//             name="chevron-back"
//             size={10}
//             color="rgba(255,255,255,0.5)"
//           />
//         </Pressable>
//       )}
//     </Animated.View>
//   );
// };

// export default GlobalRadio;

import { useRadio } from "@/context/RadioContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  Pressable,
  Text,
  View,
} from "react-native";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const GlobalRadio = () => {
  const { playing, togglePlayback, trackTitle } = useRadio();

  const [collapsed, setCollapsed] = useState(false);

  const equalizerRefs = useRef<(LottieView | null)[]>([]);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  const rotateAnim = useRef(new Animated.Value(0)).current;

  const liveDotAnim = useRef(new Animated.Value(1)).current;

  /* START POSITION */
  const pan = useRef(
    new Animated.ValueXY({
      x: SCREEN_W - 270,
      y: SCREEN_H - 180,
    })
  ).current;

  /* LIVE DOT ANIMATION */
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(liveDotAnim, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),

        Animated.timing(liveDotAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  /* PLAYING ANIMATIONS */
  useEffect(() => {
    if (playing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.06,
            duration: 900,
            useNativeDriver: true,
          }),

          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      ).start();

      rotateAnim.setValue(0);

      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: true,
        })
      ).start();

      equalizerRefs.current.forEach((ref) => ref?.play?.());
    } else {
      pulseAnim.stopAnimation();

      pulseAnim.setValue(1);

      rotateAnim.stopAnimation();

      equalizerRefs.current.forEach((ref) => ref?.pause?.());
    }
  }, [playing]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  /* DRAG */
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) => {
        return Math.abs(gs.dx) > 4 || Math.abs(gs.dy) > 4;
      },

      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });

        pan.setValue({ x: 0, y: 0 });
      },

      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),

      onPanResponderRelease: () => {
        pan.flattenOffset();

        const currentX = (pan.x as any)._value;

        const currentY = (pan.y as any)._value;

        const snapX = currentX > SCREEN_W / 2 ? SCREEN_W - 270 : 10;

        Animated.spring(pan, {
          toValue: {
            x: snapX,
            y: currentY,
          },

          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  /* HIDE COMPONENT WHEN NOT PLAYING */
  if (!playing) return null;

  const PILL_HEIGHT = 60;

  const PILL_WIDTH_EXPANDED = 250;

  const PILL_WIDTH_COLLAPSED = 60;

  return (
    <Animated.View
      style={{
        position: "absolute",
        zIndex: 9999,
        elevation: 9999,

        transform: [{ translateX: pan.x }, { translateY: pan.y }],
      }}
      {...panResponder.panHandlers}
    >
      <View
        style={{
          width: collapsed ? PILL_WIDTH_COLLAPSED : PILL_WIDTH_EXPANDED,

          height: PILL_HEIGHT,

          borderRadius: 100,

          backgroundColor: "#0f0f14",

          borderWidth: 1,

          borderColor: "rgba(255,255,255,0.08)",

          flexDirection: "row",

          alignItems: "center",

          paddingHorizontal: collapsed ? 10 : 8,

          overflow: "hidden",

          shadowColor: "#000",

          shadowOffset: {
            width: 0,
            height: 8,
          },

          shadowOpacity: 0.3,

          shadowRadius: 12,

          elevation: 10,
        }}
      >
        {/* DISC */}
        <Animated.View
          style={{
            transform: [{ rotate }, { scale: pulseAnim }],
          }}
        >
          <LinearGradient
            colors={["#FFB406", "#F34900", "#1a1a1a"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,

              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={require("../../assets/images/radio.png")}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
              }}
            />

            {/* CENTER DOT */}
            <View
              style={{
                position: "absolute",

                width: 10,
                height: 10,

                borderRadius: 5,

                backgroundColor: "#0f0f14",

                borderWidth: 1.5,

                borderColor: "rgba(255,255,255,0.2)",
              }}
            />
          </LinearGradient>
        </Animated.View>

        {/* LIVE DOT */}
        <Animated.View
          style={{
            position: "absolute",

            top: 8,
            left: 42,

            width: 9,
            height: 9,

            borderRadius: 5,

            backgroundColor: "#FF3B30",

            borderWidth: 1.5,

            borderColor: "#0f0f14",

            opacity: liveDotAnim,
          }}
        />

        {/* INFO */}
        {!collapsed && (
          <View
            style={{
              flex: 1,

              marginLeft: 10,

              marginRight: 6,
            }}
          >
            <Text
              style={{
                color: "#fff",

                fontSize: 12,

                fontWeight: "800",

                letterSpacing: 0.4,
              }}
            >
              Radio IITA
            </Text>

            <Text
              numberOfLines={1}
              style={{
                color: "rgba(255,255,255,0.45)",

                fontSize: 10,

                marginTop: 1,

                fontFamily: "monospace",
              }}
            >
              {trackTitle || "Knowledge for Agriculture"}
            </Text>

            {/* EQUALIZER */}
            {playing && (
              <View
                style={{
                  flexDirection: "row",

                  marginTop: 4,
                }}
              >
                {[0, 1, 2].map((_, index) => (
                  <LottieView
                    key={index}
                    ref={(ref) => {
                      equalizerRefs.current[index] = ref;
                    }}
                    source={require("../../assets/images/equalizer.json")}
                    autoPlay
                    loop
                    style={{
                      width: 28,
                      height: 14,

                      marginRight: -4,
                    }}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {/* PLAY/PAUSE */}
        <Pressable onPress={togglePlayback}>
          <LinearGradient
            colors={playing ? ["#FF5F6D", "#FFC371"] : ["#FFB406", "#F34900"]}
            style={{
              width: collapsed ? 40 : 34,

              height: collapsed ? 40 : 34,

              borderRadius: 20,

              justifyContent: "center",

              alignItems: "center",
            }}
          >
            <Ionicons
              name={playing ? "pause" : "play"}
              size={collapsed ? 18 : 15}
              color="#fff"
            />
          </LinearGradient>
        </Pressable>

        {/* COLLAPSE */}
        {!collapsed && (
          <Pressable
            onPress={() => setCollapsed(true)}
            style={{
              marginLeft: 6,
            }}
          >
            <Ionicons
              name="chevron-forward"
              size={14}
              color="rgba(255,255,255,0.3)"
            />
          </Pressable>
        )}
      </View>

      {/* EXPAND */}
      {collapsed && (
        <Pressable
          onPress={() => setCollapsed(false)}
          style={{
            position: "absolute",

            top: -6,
            right: -4,

            width: 18,
            height: 18,

            borderRadius: 9,

            backgroundColor: "#1e1e28",

            borderWidth: 0.5,

            borderColor: "rgba(255,255,255,0.15)",

            justifyContent: "center",

            alignItems: "center",
          }}
        >
          <Ionicons
            name="chevron-back"
            size={10}
            color="rgba(255,255,255,0.5)"
          />
        </Pressable>
      )}
    </Animated.View>
  );
};

export default GlobalRadio;
