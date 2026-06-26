// import { screenWidth } from "@/utils/Dimension";
// import { Ionicons } from "@expo/vector-icons";
// import { Audio } from "expo-av";
// import { LinearGradient } from "expo-linear-gradient";
// import LottieView from "lottie-react-native";
// import React, { useEffect, useRef, useState } from "react";
// import {
//   Image,
//   ImageBackground,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// const Radio = () => {
//   const [sound, setSound] = useState<Audio.Sound | null>(null);
//   const [playing, setPlaying] = useState(false);
//   const [trackTitle, setTrackTitle] = useState("");

//   const equalizerRefs = useRef<(LottieView | null)[]>([]);

//   const streamUrl = "https://s3.radio.co/sb3fb8fe8d/listen";

//   // Fetch radio metadata
//   useEffect(() => {
//     const interval = setInterval(() => {
//       fetch("https://ireport.iita.org/dontdelete.php")
//         .then((res) => res.json())
//         .then((json) => {
//           if (json?.title) setTrackTitle(json.title);
//         })
//         .catch(console.error);
//     }, 10000);

//     return () => clearInterval(interval);
//   }, []);

//   const onPlaybackStatusUpdate = (status: any) => {
//     if (status?.didJustFinish) {
//       setPlaying(false);
//       equalizerRefs.current.forEach((ref) => ref?.pause?.());
//     }
//   };

//   const togglePlayback = async () => {
//     if (!sound) {
//       const { sound: newSound } = await Audio.Sound.createAsync(
//         { uri: streamUrl },
//         { shouldPlay: true },
//         onPlaybackStatusUpdate
//       );

//       setSound(newSound);
//       setPlaying(true);

//       equalizerRefs.current.forEach((ref) => ref?.play?.());
//       return;
//     }

//     const status = await sound.getStatusAsync();

//     if (status.isLoaded && status.isPlaying) {
//       await sound.pauseAsync();
//       setPlaying(false);
//       equalizerRefs.current.forEach((ref) => ref?.pause?.());
//     } else {
//       await sound.playAsync();
//       setPlaying(true);
//       equalizerRefs.current.forEach((ref) => ref?.play?.());
//     }
//   };

//   // Cleanup
//   useEffect(() => {
//     return () => {
//       sound?.unloadAsync();
//     };
//   }, [sound]);

//   return (
//     <View>
//       <ImageBackground
//         source={require("../../assets/images/radio_banner.png")}
//         style={{
//           width: "100%",
//           height: 100,
//           justifyContent: "center",
//           borderRadius: 8,
//           overflow: "hidden",
//         }}
//         imageStyle={{ borderRadius: 8 }}
//       >
//         <View
//           style={{
//             flexDirection: "row",
//             justifyContent: "space-between",
//             alignItems: "center",
//             paddingHorizontal: 12,
//             paddingVertical: 8,
//           }}
//         >
//           {/* Left */}
//           <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
//             <Image
//               source={require("../../assets/images/radio.png")}
//               style={{
//                 width: 60,
//                 height: 60,
//                 borderRadius: 8,
//                 resizeMode: "contain",
//               }}
//             />

//             <View style={{ width: "60%" }}>
//               <Text style={{ fontWeight: "700", fontSize: 18, color: "#fff" }}>
//                 Live
//               </Text>
//               <Text style={{ fontSize: 13, color: "#fff", opacity: 0.9 }}>
//                 {trackTitle || "Listen to Radio IITA"}
//               </Text>
//               <Text style={{ fontSize: 13, color: "#fff", opacity: 0.9 }}>
//                 Knowledge for agriculture
//               </Text>
//             </View>
//           </View>

//           {/* Button */}
//           <TouchableOpacity
//             onPress={togglePlayback}
//             style={{
//               width: 60,
//               height: 60,
//               borderRadius: 30,
//               overflow: "hidden",
//             }}
//           >
//             <LinearGradient
//               colors={["#FFB406", "#F34900", "#E74E00"]}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 0, y: 1 }}
//               style={{
//                 flex: 1,
//                 justifyContent: "center",
//                 alignItems: "center",
//               }}
//             >
//               <Ionicons
//                 name={playing ? "pause-sharp" : "play-sharp"}
//                 size={25}
//                 color="#fff"
//               />
//             </LinearGradient>
//           </TouchableOpacity>
//         </View>
//       </ImageBackground>

//       {/* Equalizer */}
//       {playing && (
//         <View
//           style={{
//             flexDirection: "row",
//             alignItems: "center",
//             backgroundColor: "#722301",
//             borderRadius: 8,
//             marginTop: 10,
//           }}
//         >
//           {[0, 1, 2].map((_, index) => (
//             <LottieView
//               key={index}
//               ref={(ref) => {
//                 equalizerRefs.current[index] = ref;
//               }}
//               source={require("../../assets/images/equalizer.json")}
//               autoPlay
//               loop
//               style={{
//                 width: screenWidth / 3,
//                 height: 50,
//               }}
//             />
//           ))}
//         </View>
//       )}
//     </View>
//   );
// };

// export default Radio;

// import { screenWidth } from "@/utils/Dimension";
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
//   Image,
//   ImageBackground,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// const streamUrl = "https://s3.radio.co/sb3fb8fe8d/listen";

// const Radio = () => {
//   const [trackTitle, setTrackTitle] = useState("");
//   const equalizerRefs = useRef<(LottieView | null)[]>([]);

//   const player = useAudioPlayer({ uri: streamUrl });
//   const status = useAudioPlayerStatus(player);

//   const playing = status.playing;

//   // Configure audio session on mount
//   useEffect(() => {
//     setAudioModeAsync({
//       playsInSilentMode: true,
//       shouldPlayInBackground: true,
//       interruptionMode: "doNotMix",
//     });
//   }, []);

//   // Fetch radio metadata
//   useEffect(() => {
//     const interval = setInterval(() => {
//       fetch("https://ireport.iita.org/dontdelete.php")
//         .then((res) => res.json())
//         .then((json) => {
//           if (json?.title) setTrackTitle(json.title);
//         })
//         .catch(console.error);
//     }, 10000);

//     return () => clearInterval(interval);
//   }, []);

//   // Sync equalizer with playback state
//   useEffect(() => {
//     if (playing) {
//       equalizerRefs.current.forEach((ref) => ref?.play?.());
//     } else {
//       equalizerRefs.current.forEach((ref) => ref?.pause?.());
//     }
//   }, [playing]);

//   const togglePlayback = () => {
//     if (playing) {
//       player.pause();
//     } else {
//       player.play();
//     }
//   };

//   return (
//     <View>
//       <ImageBackground
//         source={require("../../assets/images/radio_banner.png")}
//         style={{
//           width: "100%",
//           height: 100,
//           justifyContent: "center",
//           borderRadius: 8,
//           overflow: "hidden",
//         }}
//         imageStyle={{ borderRadius: 8 }}
//       >
//         <View
//           style={{
//             flexDirection: "row",
//             justifyContent: "space-between",
//             alignItems: "center",
//             paddingHorizontal: 12,
//             paddingVertical: 8,
//           }}
//         >
//           {/* Left */}
//           <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
//             <Image
//               source={require("../../assets/images/radio.png")}
//               style={{
//                 width: 60,
//                 height: 60,
//                 borderRadius: 8,
//                 resizeMode: "contain",
//               }}
//             />
//             <View style={{ width: "60%" }}>
//               <Text style={{ fontWeight: "700", fontSize: 18, color: "#fff" }}>
//                 Live
//               </Text>
//               <Text style={{ fontSize: 13, color: "#fff", opacity: 0.9 }}>
//                 {trackTitle || "Listen to Radio IITA"}
//               </Text>
//               <Text style={{ fontSize: 13, color: "#fff", opacity: 0.9 }}>
//                 Knowledge for agriculture
//               </Text>
//             </View>
//           </View>

//           {/* Button */}
//           <TouchableOpacity
//             onPress={togglePlayback}
//             style={{
//               width: 60,
//               height: 60,
//               borderRadius: 30,
//               overflow: "hidden",
//             }}
//           >
//             <LinearGradient
//               colors={["#FFB406", "#F34900", "#E74E00"]}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 0, y: 1 }}
//               style={{
//                 flex: 1,
//                 justifyContent: "center",
//                 alignItems: "center",
//               }}
//             >
//               <Ionicons
//                 name={playing ? "pause-sharp" : "play-sharp"}
//                 size={25}
//                 color="#fff"
//               />
//             </LinearGradient>
//           </TouchableOpacity>
//         </View>
//       </ImageBackground>

//       {/* Equalizer */}
//       {playing && (
//         <View
//           style={{
//             flexDirection: "row",
//             alignItems: "center",
//             backgroundColor: "#722301",
//             borderRadius: 8,
//             marginTop: 10,
//           }}
//         >
//           {[0, 1, 2].map((_, index) => (
//             <LottieView
//               key={index}
//               ref={(ref) => {
//                 equalizerRefs.current[index] = ref;
//               }}
//               source={require("../../assets/images/equalizer.json")}
//               autoPlay
//               loop
//               style={{
//                 width: screenWidth / 3,
//                 height: 50,
//               }}
//             />
//           ))}
//         </View>
//       )}
//     </View>
//   );
// };

// export default Radio;

import { useRadio } from "@/context/RadioContext"; // adjust path if needed
import { screenWidth } from "@/utils/Dimension";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import {
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Radio = () => {
  const { playing, trackTitle, togglePlayback } = useRadio();

  const equalizerRefs = useRef<(LottieView | null)[]>([]);

  // Sync equalizer with playback state
  useEffect(() => {
    if (playing) {
      equalizerRefs.current.forEach((ref) => ref?.play?.());
    } else {
      equalizerRefs.current.forEach((ref) => ref?.pause?.());
    }
  }, [playing]);

  return (
    <View>
      <ImageBackground
        source={require("../../assets/images/radio_banner.png")}
        style={{
          width: "100%",
          height: 100,
          justifyContent: "center",
          borderRadius: 8,
          overflow: "hidden",
        }}
        imageStyle={{ borderRadius: 8 }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        >
          {/* Left */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Image
              source={require("../../assets/images/radio.png")}
              style={{
                width: 60,
                height: 60,
                borderRadius: 8,
                resizeMode: "contain",
              }}
            />

            <View style={{ width: "60%" }}>
              <Text style={{ fontWeight: "700", fontSize: 18, color: "#fff" }}>
                Live
              </Text>

              <Text style={{ fontSize: 13, color: "#fff", opacity: 0.9 }}>
                {trackTitle || "Listen to Radio IITA"}
              </Text>

              <Text style={{ fontSize: 13, color: "#fff", opacity: 0.9 }}>
                Knowledge for agriculture
              </Text>
            </View>
          </View>

          {/* Button */}
          <TouchableOpacity
            onPress={togglePlayback}
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              overflow: "hidden",
            }}
          >
            <LinearGradient
              colors={["#FFB406", "#F34900", "#E74E00"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons
                name={playing ? "pause-sharp" : "play-sharp"}
                size={25}
                color="#fff"
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ImageBackground>

      {/* Equalizer */}
      {playing && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#722301",
            borderRadius: 8,
            marginTop: 10,
          }}
        >
          {[0, 1, 2].map((_, index) => (
            <LottieView
              key={index}
              ref={(ref) => {
                equalizerRefs.current[index] = ref;
              }}
              source={require("../../assets/images/equalizer.json")}
              loop
              style={{
                width: screenWidth / 3,
                height: 50,
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default Radio;
