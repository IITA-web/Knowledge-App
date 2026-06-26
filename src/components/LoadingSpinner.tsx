import React from "react";
import { ActivityIndicator, View } from "react-native";

import { screenHeight, screenWidth } from "../utils/Dimension";

const LoadingSpinner = ({ color }: any) => {
  return (
    <View
      style={{
        flex: 1,
        position: "absolute",
        top: 0,
        left: 0,
        display: "flex",
        width: screenWidth,
        height: screenHeight,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ActivityIndicator color={color ? color : "#222"} size="small" />
    </View>
  );
};

export default LoadingSpinner;
