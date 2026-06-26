import { screenHeight, screenWidth } from "@/utils/Dimension";
import { useNavigation } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";
import BackArrow from "./BackArrow";
import CustomHeader from "./CustomHeader";

const FeaturedNews = ({ url, title, setToggleModal }: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <CustomHeader
        LeftIcon={<BackArrow color={"#000"} />}
        RightIcon={null}
        title={title}
        onPressL={setToggleModal}
      />
      {isLoading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            flex: 1,
            width: screenWidth,
            height: screenHeight,
            zIndex: 10,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="small" color="black" />
        </View>
      )}

      <WebView
        style={{ flex: 1, marginTop: Platform.OS === "ios" ? 20 : 0 }}
        originWhitelist={["*"]}
        source={{ uri: url }}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
      />
    </SafeAreaView>
  );
};

export default FeaturedNews;
