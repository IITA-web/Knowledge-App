import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Image, StatusBar, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { screenHeight, screenWidth } from "../utils/Dimension";

const ACCENT = "#FF6B35";
const ACCENT_DARK = "#D85016";

const Splashscreen = () => {
  const router = useRouter();

  // ── Animation values ──────────────────────────────────────────────────────
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.82)).current;
  const bottomSlide = useRef(new Animated.Value(screenHeight * 0.3)).current;
  const bottomOpacity = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(-screenWidth)).current;

  useEffect(() => {
    // Staggered entrance sequence
    Animated.sequence([
      // 1. Logo fades + scales in
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 55,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      // 2. Bottom section slides up
      Animated.parallel([
        Animated.timing(bottomSlide, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bottomOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Shimmer loop on the logo area
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: screenWidth * 2,
        duration: 2200,
        useNativeDriver: true,
      })
    ).start();

    // Navigate after delay
    const timer = setTimeout(() => {
      router.replace("/welcome");
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: ACCENT_DARK,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <StatusBar barStyle="light-content" backgroundColor={ACCENT_DARK} />

      {/* ── Background radial glow ── */}
      <View
        style={{
          position: "absolute",
          top: screenHeight * 0.15,
          alignSelf: "center",
          width: screenWidth * 0.85,
          height: screenWidth * 0.85,
          borderRadius: (screenWidth * 0.85) / 2,
          backgroundColor: "rgba(255,107,53,0.18)",
        }}
      />
      <View
        style={{
          position: "absolute",
          top: screenHeight * 0.22,
          alignSelf: "center",
          width: screenWidth * 0.5,
          height: screenWidth * 0.5,
          borderRadius: (screenWidth * 0.5) / 2,
          backgroundColor: "rgba(255,255,255,0.06)",
        }}
      />

      {/* ── Logo container ── */}
      <Animated.View
        style={{
          justifyContent: "center",
          alignItems: "center",
          height: screenHeight * 0.7,
          opacity: logoOpacity,
          transform: [{ scale: logoScale }],
        }}
      >
        {/* Logo card glow ring */}
        <View
          style={{
            width: 180,
            height: 180,
            borderRadius: 36,
            backgroundColor: "rgba(255,255,255,0.08)",
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.15)",
          }}
        >
          <Image
            source={require("../../assets/images/iita_and_cg.png")}
            style={{
              width: 130,
              height: 130,
              resizeMode: "contain",
            }}
          />

          {/* Shimmer sweep */}
          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: 60,
              transform: [{ translateX: shimmerAnim }],
              backgroundColor: "rgba(255,255,255,0.12)",
              borderRadius: 36,
              // skewX: "-20deg",
            }}
            pointerEvents="none"
          />
        </View>

        {/* Dot indicators below logo */}
        <View
          style={{
            flexDirection: "row",
            gap: 6,
            marginTop: 32,
          }}
        >
          {[0, 1, 2].map((i) => {
            const dotOpacity = useRef(
              new Animated.Value(i === 0 ? 1 : 0.35)
            ).current;

            useEffect(() => {
              Animated.loop(
                Animated.sequence([
                  Animated.delay(i * 280),
                  Animated.timing(dotOpacity, {
                    toValue: 1,
                    duration: 350,
                    useNativeDriver: true,
                  }),
                  Animated.timing(dotOpacity, {
                    toValue: 0.35,
                    duration: 350,
                    useNativeDriver: true,
                  }),
                ])
              ).start();
            }, []);

            return (
              <Animated.View
                key={i}
                style={{
                  width: i === 1 ? 18 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "rgba(255,255,255,0.85)",
                  opacity: dotOpacity,
                }}
              />
            );
          })}
        </View>
      </Animated.View>

      {/* ── Bottom section ── */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: screenHeight * 0.3,
          opacity: bottomOpacity,
          transform: [{ translateY: bottomSlide }],
        }}
      >
        {/* Bottom image */}
        <Image
          source={require("../../assets/images/splash_btm.png")}
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: "100%",
            resizeMode: "cover",
          }}
        />

        {/* Gradient overlay */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(216, 80, 22, 0.82)",
          }}
        />

        {/* Brand text */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
            gap: 4,
          }}
        >
          <View
            style={{
              width: 36,
              height: 2,
              borderRadius: 1,
              backgroundColor: "rgba(255,255,255,0.5)",
              marginBottom: 8,
            }}
          />
          <Animated.Text
            style={{
              color: "rgba(255,255,255,0.95)",
              fontSize: 13,
              fontWeight: "700",
              letterSpacing: 4,
              textTransform: "uppercase",
              opacity: bottomOpacity,
            }}
          >
            IITA
          </Animated.Text>
          <Animated.Text
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: 10,
              fontWeight: "500",
              letterSpacing: 2.5,
              textTransform: "uppercase",
              opacity: bottomOpacity,
            }}
          >
            International Institute of Tropical Agriculture
          </Animated.Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default Splashscreen;
