import { useNavigation } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";
import CustomHeaderII from "../components/CustomHeaderII";

const Technology = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeaderII title="Technology" />

      {isLoading && !hasError && (
        <View style={styles.loader}>
          <ActivityIndicator size="small" color="#000" />
        </View>
      )}

      {hasError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Failed to load page. Check your internet connection.
          </Text>
        </View>
      ) : (
        <WebView
          style={styles.webview}
          originWhitelist={["*"]}
          source={{ uri: "https://taat.africa/xzl/" }}
          onLoadStart={() => {
            setIsLoading(true);
            setHasError(false);
          }}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      )}
    </SafeAreaView>
  );
};

export default Technology;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    marginTop: Platform.OS === "ios" ? 10 : 0,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 14,
    color: "red",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
