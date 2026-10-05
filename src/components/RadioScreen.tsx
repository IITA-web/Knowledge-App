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
