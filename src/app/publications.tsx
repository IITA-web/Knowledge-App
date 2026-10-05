// import { useNavigation, useRouter } from "expo-router";
// import React, { useState } from "react";
// import { ActivityIndicator, Alert, Vibration, View } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import WebView from "react-native-webview";
// import BackArrow from "../components/BackArrow";
// import CustomHeader from "../components/CustomHeader";
// import { screenHeight, screenWidth } from "../utils/Dimension";
// import projectAxiosService from "../utils/lib/projectAxiosService";
// import { Service } from "../utils/service";

// const Publications = () => {
//   const navigation = useNavigation();
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [page, setPage] = useState(1);
//   const [refreshing, setRefreshing] = useState(false);
//   const [data, setData] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [SearchVisible, setSearchVisible] = useState(false);
//   const [isLoadingSearch, setIsLoadingSearch] = useState(false);
//   const [searchActive, setSearchActive] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [hub, setHub] = useState(
//     "https://iita.org/wp-json/wp/v2/iita-project?per_page=20&_embed&page="
//   );
//   const [responseData, setResData] = useState([]);

//   const fetchPublications = async () => {
//     // fetch(hub)
//     setIsLoading(true);
//     return fetch(Service.Publications + "filter")
//       .then((response) => response.json())
//       .then((responseJson) => {
//         console.log("publications responseJson  ==> ", responseJson.items[0]);
//         let resdata = Object.keys(responseJson.items).length;
//         setData((prevState) => [...prevState, ...responseJson.items]);
//         // if (resdata >= 1) {
//         //   setData((prevState) =>
//         //     page === 0
//         //       ? Array.from(responseJson.items)
//         //       : [...prevState, ...responseJson]
//         //   );
//         //   setResData(resdata);
//         // }
//         setIsLoading(false);
//         setLoadingMore(false);
//         setRefreshing(false);
//       })
//       .catch((error) => {
//         setIsLoading(false);
//         Alert.alert(
//           "Unknown Error",
//           "Please check your internet connection and try again ===> " +
//             error.message,
//           [
//             {
//               text: "Ok",
//               onPress: () => navigation.navigate("index"),
//               style: "cancel",
//             },
//             { text: "Retry", onPress: () => fetchPublications() },
//           ],
//           { cancelable: false }
//         );
//         Vibration.vibrate();
//       });
//   };

//   const searchProjects = () => {
//     if (search !== "") {
//       setIsLoadingSearch(true);
//       const URL =
//         "iita-project?search=" + search + "&per_page=20&_embed&page=" + page;
//       projectAxiosService
//         .request({
//           url: URL,
//           method: "GET",
//         })
//         .then((response) => {
//           var resdata = Object.keys(response.data).length;
//           if (resdata > 0) {
//             setData((prevState, nextProps) =>
//               page === 1 ? response.data : [...data, ...response.data]
//             );
//           } else {
//             setIsLoading(false);
//             setLoadingMore(false);
//             setRefreshing(false);
//             setIsLoadingSearch(false);
//           }
//         })
//         .catch((error) => {
//           setIsLoading(false);
//           setIsLoadingSearch(false);

//           Alert.alert(
//             "Unknown Error",
//             "Please check your internet connection and try again",
//             [
//               {
//                 text: "Ok",
//                 onPress: () => navigation.navigate("index"),
//                 style: "cancel",
//               },
//               { text: "Retry", onPress: () => searchProjects() },
//             ],
//             { cancelable: false }
//           );
//           Vibration.vibrate();
//         });
//     }
//   };
//   const filterByHub = () => {
//     setShowModal(true);
//   };

//   const filterByCrop = () => {};
//   const handleToggleSearchVisible = () => {
//     setSearchVisible(!SearchVisible);
//   };

//   const handleToggleModal = () => {
//     setShowModal(!showModal);
//   };

//   const handleRefresh = () => {
//     setPage(1);
//     setRefreshing(true);
//     fetchPublications();
//   };

//   const handleLoadMore = () => {
//     setLoadingMore(true);
//     const resdata = Object.keys(data).length;
//     if (responseData === 20) {
//       setPage((prevState) => prevState + 1);

//       fetchPublications();
//     }
//   };

//   const renderFooter = () => {
//     if (loadingMore) return null;
//     return (
//       <View
//         style={{
//           position: "relative",
//           width: screenWidth,
//           height: screenHeight,
//           paddingVertical: 20,
//           borderTopWidth: 0,
//           marginTop: 15,
//           marginBottom: 15,
//         }}
//       >
//         <ActivityIndicator animating color="#222"></ActivityIndicator>
//       </View>
//     );
//   };

//   // useEffect(() => {
//   //   fetchPublications();
//   // }, []);

//   return (
//     <SafeAreaView style={[{ flex: 1 }]}>
//       <CustomHeader
//         LeftIcon={<BackArrow color={"#000"} />}
//         RightIcon={null}
//         title={"Publications"}
//         onPressL={() => navigation.goBack()}
//       />

//       <View style={{ flex: 1 }}>
//         <WebView
//           style={{ flex: 1 }}
//           source={{
//             uri: "https://cgspace.cgiar.org/communities/0074d1e1-d1a0-4fa2-ae90-f9bfbd09ea7d",
//           }}
//           onLoadStart={() => setLoading(true)}
//           onLoadEnd={() => setLoading(false)}
//         />
//         {loading && (
//           <View
//             style={{
//               flex: 1,
//               position: "absolute",
//               top: 0,
//               left: 0,
//               right: 0,
//               bottom: 0,
//               justifyContent: "center",
//               alignItems: "center",
//               backgroundColor: "rgba(0,0,0,0.2)",
//               zIndex: 10,
//             }}
//           >
//             <ActivityIndicator size="large" color="black" />
//           </View>
//         )}
//       </View>
//     </SafeAreaView>
//   );
// };

// export default Publications;

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: "rgb(242, 242, 242)",
  surface: "#FFFFFF",
  border: "#E8E8E8",
  accent: "#FF6B35",
  accentSoft: "rgba(255,107,53,0.10)",
  text: "#1A1A1A",
  muted: "#888899",
  shadow: "rgba(0,0,0,0.07)",
};

// ─── Animated dot ─────────────────────────────────────────────────────────────
const PulsingDot = ({ delay }: { delay: number }) => {
  const scale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1,
          duration: 500,
          delay,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.6,
          duration: 500,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return <Animated.View style={[styles.dot, { transform: [{ scale }] }]} />;
};

// ─── Progress bar ─────────────────────────────────────────────────────────────
const ProgressBar = ({ visible }: { visible: boolean }) => {
  const translateX = useRef(new Animated.Value(-300)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      translateX.setValue(-300);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.timing(translateX, {
            toValue: 400,
            duration: 1400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          })
        ),
      ]).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => translateX.setValue(-300));
    }
  }, [visible]);

  return (
    <Animated.View style={[styles.progressTrack, { opacity }]}>
      <Animated.View
        style={[styles.progressBar, { transform: [{ translateX }] }]}
      />
    </Animated.View>
  );
};

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
const SkeletonLoader = () => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.9],
  });

  return (
    <Animated.View style={[styles.skeletonWrap, { opacity }]}>
      <View style={styles.skeletonImg} />

      <View style={{ padding: 20, gap: 10 }}>
        {[...Array(7)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.skeletonLine,
              {
                width: `${Math.floor(Math.random() * 40) + 50}%`,
              },
            ]}
          />
        ))}
      </View>

      <View style={{ flexDirection: "row", paddingHorizontal: 20, gap: 12 }}>
        {[0, 1].map((i) => (
          <View key={i} style={styles.skeletonCard} />
        ))}
      </View>
    </Animated.View>
  );
};

// ─── Error State ──────────────────────────────────────────────────────────────
const ErrorState = ({ onRetry }: { onRetry: () => void }) => {
  return (
    <View style={styles.errorWrap}>
      <View style={styles.errorIconBox}>
        <Ionicons name="cloud-offline-outline" size={38} color={C.accent} />
      </View>

      <Text style={styles.errorTitle}>Couldn't load publications</Text>
      <Text style={styles.errorBody}>
        Check your internet connection and try again.
      </Text>

      <TouchableOpacity
        onPress={onRetry}
        style={styles.retryBtn}
        activeOpacity={0.8}
      >
        <Ionicons
          name="refresh-outline"
          size={16}
          color={C.surface}
          style={{ marginRight: 6 }}
        />
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
};

// ─── Header ───────────────────────────────────────────────────────────────────
const Header = ({
  onBack,
  isLoading,
}: {
  onBack: () => void;
  isLoading: boolean;
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.headerBackBtn}>
        <Ionicons name="arrow-back" size={20} color={C.text} />
      </TouchableOpacity>

      <View style={{ flex: 1 }}>
        <Text style={styles.headerTitle}>Publications</Text>

        {isLoading && (
          <View style={styles.loadingRow}>
            {[0, 1, 2].map((i) => (
              <PulsingDot key={i} delay={i * 160} />
            ))}
            <Text style={styles.loadingLabel}>Loading…</Text>
          </View>
        )}
      </View>

      <View style={styles.accentDot} />
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const Publications = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [webviewKey, setWebviewKey] = useState(0);

  const webviewFade = useRef(new Animated.Value(0)).current;

  const handleLoadEnd = () => {
    setIsLoading(false);

    Animated.timing(webviewFade, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    webviewFade.setValue(0);
    setWebviewKey((prev) => prev + 1);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <ProgressBar visible={isLoading && !hasError} />

      <Header
        onBack={() => navigation.goBack()}
        isLoading={isLoading && !hasError}
      />

      <View style={styles.content}>
        {isLoading && !hasError && <SkeletonLoader />}

        {hasError && <ErrorState onRetry={handleRetry} />}

        {!hasError && (
          <Animated.View style={[styles.webviewWrap, { opacity: webviewFade }]}>
            <WebView
              key={webviewKey}
              style={styles.webview}
              originWhitelist={["*"]}
              source={{
                uri: "https://cgspace.cgiar.org/communities/0074d1e1-d1a0-4fa2-ae90-f9bfbd09ea7d",
              }}
              onLoadStart={() => {
                setIsLoading(true);
                setHasError(false);
                webviewFade.setValue(0);
              }}
              onLoadEnd={handleLoadEnd}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Publications;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  progressTrack: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(255,107,53,0.15)",
    zIndex: 99,
    overflow: "hidden",
  },
  progressBar: {
    width: 160,
    height: 3,
    borderRadius: 2,
    backgroundColor: C.accent,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.bg,
    gap: 12,
  },
  headerBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: C.surface,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: C.text,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  loadingLabel: {
    fontSize: 11,
    color: C.muted,
    marginLeft: 2,
  },
  accentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.accent,
  },

  content: { flex: 1, position: "relative" },
  webviewWrap: { ...StyleSheet.absoluteFillObject },
  webview: { flex: 1, marginTop: Platform.OS === "ios" ? 10 : 0 },

  skeletonWrap: { flex: 1, backgroundColor: C.bg },
  skeletonImg: { width: "100%", height: 200, backgroundColor: C.border },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    backgroundColor: C.border,
  },
  skeletonCard: {
    flex: 1,
    height: 120,
    borderRadius: 12,
    backgroundColor: C.border,
  },

  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: C.accent,
  },

  errorWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  errorIconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: C.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: C.text,
    marginBottom: 8,
  },
  errorBody: {
    fontSize: 14,
    color: C.muted,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 24,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: C.surface,
    fontWeight: "700",
    fontSize: 15,
  },
});
