/**
 * photosviewer.tsx
 *
 * Full-screen photo viewer with pinch-to-zoom, pan, share, and download.
 * Route params: uri (string), title (string)
 */

import { Ionicons } from "@expo/vector-icons";
import { File, Paths } from "expo-file-system";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PinchGestureHandler,
  State,
  TapGestureHandler,
} from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SW, height: SH } = Dimensions.get("window");

const PhotosViewer = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { uri, title } = useLocalSearchParams<{ uri: string; title: string }>();

  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [uiVisible, setUiVisible] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // ── Gesture state ─────────────────────────────────────────────────────────
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const baseScale = useRef(1);
  const lastScale = useRef(1);
  const lastX = useRef(0);
  const lastY = useRef(0);

  const pinchRef = useRef<PinchGestureHandler>(null);
  const panRef = useRef<PanGestureHandler>(null);
  const doubleTapRef = useRef<TapGestureHandler>(null);

  const uiOpacity = useRef(new Animated.Value(1)).current;

  // ── Toggle UI chrome ──────────────────────────────────────────────────────
  const toggleUI = () => {
    const next = !uiVisible;
    setUiVisible(next);
    Animated.timing(uiOpacity, {
      toValue: next ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // ── Double-tap to zoom ────────────────────────────────────────────────────
  const onDoubleTap = ({ nativeEvent }: any) => {
    if (nativeEvent.state !== State.ACTIVE) return;
    const targetScale = lastScale.current > 1.5 ? 1 : 2.5;
    lastScale.current = targetScale;
    baseScale.current = targetScale;
    Animated.parallel([
      Animated.spring(scale, {
        toValue: targetScale,
        useNativeDriver: true,
        damping: 14,
        stiffness: 120,
      }),
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        damping: 14,
        stiffness: 120,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 14,
        stiffness: 120,
      }),
    ]).start();
  };

  // ── Pinch gesture ─────────────────────────────────────────────────────────
  const onPinch = Animated.event([{ nativeEvent: { scale: scale } }], {
    useNativeDriver: true,
    listener: ({ nativeEvent }: any) => {
      const s = Math.max(
        0.5,
        Math.min(5, baseScale.current * nativeEvent.scale)
      );
      scale.setValue(s);
    },
  });

  const onPinchState = ({ nativeEvent }: any) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      lastScale.current = Math.max(
        1,
        Math.min(5, lastScale.current * nativeEvent.scale)
      );
      baseScale.current = lastScale.current;
      scale.setValue(lastScale.current);

      if (lastScale.current <= 1) {
        lastX.current = 0;
        lastY.current = 0;
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            damping: 14,
          }),
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 14,
          }),
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            damping: 14,
          }),
        ]).start();
      }
    }
  };

  // ── Pan gesture ───────────────────────────────────────────────────────────
  const onPan = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    {
      useNativeDriver: true,
      listener: ({ nativeEvent }: any) => {
        translateX.setValue(lastX.current + nativeEvent.translationX);
        translateY.setValue(lastY.current + nativeEvent.translationY);
      },
    }
  );

  const onPanState = ({ nativeEvent }: any) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      lastX.current += nativeEvent.translationX;
      lastY.current += nativeEvent.translationY;

      // Snap back if zoomed out
      if (lastScale.current <= 1) {
        lastX.current = 0;
        lastY.current = 0;
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            damping: 14,
          }),
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 14,
          }),
        ]).start();
      }
    }
  };

  // ── Download / Share ──────────────────────────────────────────────────────
  const handleShare = async () => {
    if (!uri) return;
    try {
      setDownloading(true);
      const fileName = uri.split("/").pop() || "image.jpg";
      const cachedFile = new File(Paths.cache, fileName);

      const response = await fetch(uri);
      const buffer = await response.arrayBuffer();
      cachedFile.create({ overwrite: true });
      cachedFile.write(new Uint8Array(buffer));

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(cachedFile.uri);
      } else {
        Alert.alert("Sharing not available on this device.");
      }
    } catch {
      Alert.alert("Error", "Could not share the image.");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownload = async () => {
    if (!uri) return;
    try {
      setDownloading(true);
      const fileName = uri.split("/").pop() || "image.jpg";

      const response = await fetch(uri);
      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      const destFile = new File(Paths.document, fileName);
      destFile.create({ overwrite: true });
      destFile.write(bytes);

      Alert.alert("Saved", `Image saved: ${fileName}`);
    } catch {
      Alert.alert("Error", "Could not save the image.");
    } finally {
      setDownloading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar hidden />

      {/* Background tap to toggle UI */}
      <TapGestureHandler
        ref={doubleTapRef}
        numberOfTaps={2}
        onHandlerStateChange={onDoubleTap}
      >
        <TapGestureHandler
          numberOfTaps={1}
          onActivated={toggleUI}
          waitFor={doubleTapRef}
        >
          <View style={{ flex: 1 }}>
            {/* ── Image with gestures ── */}
            <PinchGestureHandler
              ref={pinchRef}
              onGestureEvent={onPinch}
              onHandlerStateChange={onPinchState}
              simultaneousHandlers={panRef}
            >
              <PanGestureHandler
                ref={panRef}
                onGestureEvent={onPan}
                onHandlerStateChange={onPanState}
                simultaneousHandlers={pinchRef}
                avgTouches
                minPointers={1}
                maxPointers={2}
              >
                <Animated.View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    transform: [{ scale }, { translateX }, { translateY }],
                  }}
                >
                  {!error ? (
                    <Animated.Image
                      source={{ uri }}
                      style={{ width: SW, height: SH, resizeMode: "contain" }}
                      onLoad={() => setLoaded(true)}
                      onError={() => setError(true)}
                    />
                  ) : (
                    <View style={{ alignItems: "center", gap: 12 }}>
                      <Ionicons name="image-outline" size={64} color="#555" />
                      <Text style={{ color: "#555", fontSize: 14 }}>
                        Could not load image
                      </Text>
                    </View>
                  )}

                  {!loaded && !error && (
                    <View
                      style={{
                        position: "absolute",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <ActivityIndicator size="large" color="#fff" />
                    </View>
                  )}
                </Animated.View>
              </PanGestureHandler>
            </PinchGestureHandler>

            {/* ── Top bar ── */}
            <Animated.View
              pointerEvents={uiVisible ? "auto" : "none"}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                opacity: uiOpacity,
                paddingTop: insets.top + 8,
                paddingHorizontal: 16,
                paddingBottom: 16,
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.55)",
              }}
            >
              {/* Back */}
              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "rgba(255,255,255,0.12)",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="arrow-back" size={22} color="#fff" />
              </TouchableOpacity>

              {/* Title */}
              <Text
                numberOfLines={1}
                style={{
                  flex: 1,
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: "600",
                  marginHorizontal: 12,
                }}
              >
                {title || "Photo"}
              </Text>

              {/* Share */}
              <TouchableOpacity
                onPress={handleShare}
                disabled={downloading}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "rgba(255,255,255,0.12)",
                  justifyContent: "center",
                  alignItems: "center",
                  marginLeft: 8,
                }}
              >
                {downloading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="share-outline" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* ── Bottom bar ── */}
            <Animated.View
              pointerEvents={uiVisible ? "auto" : "none"}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                opacity: uiOpacity,
                paddingBottom: insets.bottom + 16,
                paddingTop: 16,
                paddingHorizontal: 24,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 24,
                backgroundColor: "rgba(0,0,0,0.55)",
              }}
            >
              {/* Download */}
              <TouchableOpacity
                onPress={handleDownload}
                disabled={downloading}
                style={{ alignItems: "center", gap: 4 }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: "rgba(255,255,255,0.12)",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="download-outline" size={22} color="#fff" />
                </View>
                <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 11 }}>
                  Save
                </Text>
              </TouchableOpacity>

              {/* Share */}
              <TouchableOpacity
                onPress={handleShare}
                disabled={downloading}
                style={{ alignItems: "center", gap: 4 }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: "rgba(255,255,255,0.12)",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons
                    name="share-social-outline"
                    size={22}
                    color="#fff"
                  />
                </View>
                <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 11 }}>
                  Share
                </Text>
              </TouchableOpacity>

              {/* Open in browser */}
              {uri ? (
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/inappbrowser",
                      params: { url: uri },
                    })
                  }
                  style={{ alignItems: "center", gap: 4 }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: "rgba(255,255,255,0.12)",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name="open-outline" size={22} color="#fff" />
                  </View>
                  <Text
                    style={{ color: "rgba(255,255,255,0.65)", fontSize: 11 }}
                  >
                    Open
                  </Text>
                </TouchableOpacity>
              ) : null}
            </Animated.View>

            {/* ── Zoom hint ── */}
            {loaded && uiVisible && (
              <View
                style={{
                  position: "absolute",
                  bottom: insets.bottom + 110,
                  alignSelf: "center",
                  backgroundColor: "rgba(0,0,0,0.45)",
                  borderRadius: 100,
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Ionicons
                  name="expand-outline"
                  size={13}
                  color="rgba(255,255,255,0.6)"
                />
                <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>
                  Pinch or double-tap to zoom
                </Text>
              </View>
            )}
          </View>
        </TapGestureHandler>
      </TapGestureHandler>
    </GestureHandlerRootView>
  );
};

export default PhotosViewer;
