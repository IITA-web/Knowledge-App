import React from "react";
import { View, Text, Platform, StatusBar as RNStatusBar } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * ⚠️ STATUS BAR BACKGROUND COLOR IN EXPO ROUTER WITH EDGE-TO-EDGE LAYOUT
 *
 * Expo SDK 50+ enables edge-to-edge layout by default. In this mode, the status bar
 * overlays your screen content. As a result, using:
 *
 *    <StatusBar backgroundColor="#D85016" />
 *
 * will NOT work as expected and will produce the warning:
 *
 *    "StatusBar backgroundColor is not supported with edge-to-edge enabled.
 *     Render a view under the status bar to change its background."
 *
 * ✅ WHY IT HAPPENS:
 * The status bar is translucent and floats on top of your content.
 * To set a background color for it, you must render a view behind it.
 *
 * ✅ SOLUTION:
 * Manually add a view at the top of your layout with the same height as the status bar.
 * Use `StatusBar.currentHeight` (Android) or `useSafeAreaInsets().top` (cross-platform).
 */

/**
 * ✅ RECOMMENDED:
 * For best cross-platform results, use react-native-safe-area-context like so:
 *
 * import { useSafeAreaInsets } from "react-native-safe-area-context";
 * const insets = useSafeAreaInsets();
 *
 * <View style={{ height: insets.top, backgroundColor: "#D85016" }} />
 *
 * ✅ SUMMARY:
 * - Don't use `StatusBar.backgroundColor` with edge-to-edge enabled.
 * - Use a custom `View` to fake the background color.
 * - Use `StatusBar.translucent` and `style="light"` or `"dark"` as needed.
 */

const CustomStatusBar = () => {
  const insets = useSafeAreaInsets();
  return (
    <>
      <View
        style={{
          //   height: Platform.OS === "android" ? RNStatusBar.currentHeight : 44, // fallback for iOS
          backgroundColor: "#D85016",
          height: insets.top,
        }}
      />

      {/* Status bar configured to be translucent */}
      <StatusBar style="dark" translucent />
    </>
  );
};

export default CustomStatusBar;
