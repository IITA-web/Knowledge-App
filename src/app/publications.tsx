import { useNavigation, useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Vibration, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";
import BackArrow from "../components/BackArrow";
import CustomHeader from "../components/CustomHeader";
import { screenHeight, screenWidth } from "../utils/Dimension";
import projectAxiosService from "../utils/lib/projectAxiosService";
import { Service } from "../utils/service";

const Publications = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [SearchVisible, setSearchVisible] = useState(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hub, setHub] = useState(
    "https://iita.org/wp-json/wp/v2/iita-project?per_page=20&_embed&page="
  );
  const [responseData, setResData] = useState([]);

  const fetchPublications = async () => {
    // fetch(hub)
    setIsLoading(true);
    return fetch(Service.Publications + "filter")
      .then((response) => response.json())
      .then((responseJson) => {
        console.log("publications responseJson  ==> ", responseJson.items[0]);
        let resdata = Object.keys(responseJson.items).length;
        setData((prevState) => [...prevState, ...responseJson.items]);
        // if (resdata >= 1) {
        //   setData((prevState) =>
        //     page === 0
        //       ? Array.from(responseJson.items)
        //       : [...prevState, ...responseJson]
        //   );
        //   setResData(resdata);
        // }
        setIsLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      })
      .catch((error) => {
        setIsLoading(false);
        Alert.alert(
          "Unknown Error",
          "Please check your internet connection and try again ===> " +
            error.message,
          [
            {
              text: "Ok",
              onPress: () => navigation.navigate("index"),
              style: "cancel",
            },
            { text: "Retry", onPress: () => fetchPublications() },
          ],
          { cancelable: false }
        );
        Vibration.vibrate();
      });
  };

  const searchProjects = () => {
    if (search !== "") {
      setIsLoadingSearch(true);
      const URL =
        "iita-project?search=" + search + "&per_page=20&_embed&page=" + page;
      projectAxiosService
        .request({
          url: URL,
          method: "GET",
        })
        .then((response) => {
          var resdata = Object.keys(response.data).length;
          if (resdata > 0) {
            setData((prevState, nextProps) =>
              page === 1 ? response.data : [...data, ...response.data]
            );
          } else {
            setIsLoading(false);
            setLoadingMore(false);
            setRefreshing(false);
            setIsLoadingSearch(false);
          }
        })
        .catch((error) => {
          setIsLoading(false);
          setIsLoadingSearch(false);

          Alert.alert(
            "Unknown Error",
            "Please check your internet connection and try again",
            [
              {
                text: "Ok",
                onPress: () => navigation.navigate("index"),
                style: "cancel",
              },
              { text: "Retry", onPress: () => searchProjects() },
            ],
            { cancelable: false }
          );
          Vibration.vibrate();
        });
    }
  };
  const filterByHub = () => {
    setShowModal(true);
  };

  const filterByCrop = () => {};
  const handleToggleSearchVisible = () => {
    setSearchVisible(!SearchVisible);
  };

  const handleToggleModal = () => {
    setShowModal(!showModal);
  };

  const handleRefresh = () => {
    setPage(1);
    setRefreshing(true);
    fetchPublications();
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    const resdata = Object.keys(data).length;
    if (responseData === 20) {
      setPage((prevState) => prevState + 1);

      fetchPublications();
    }
  };

  const renderFooter = () => {
    if (loadingMore) return null;
    return (
      <View
        style={{
          position: "relative",
          width: screenWidth,
          height: screenHeight,
          paddingVertical: 20,
          borderTopWidth: 0,
          marginTop: 15,
          marginBottom: 15,
        }}
      >
        <ActivityIndicator animating color="#222"></ActivityIndicator>
      </View>
    );
  };

  // useEffect(() => {
  //   fetchPublications();
  // }, []);

  return (
    <SafeAreaView style={[{ flex: 1 }]}>
      <CustomHeader
        LeftIcon={<BackArrow color={"#000"} />}
        RightIcon={null}
        title={"Publications"}
        onPressL={() => navigation.goBack()}
      />

      <View style={{ flex: 1 }}>
        <WebView
          style={{ flex: 1 }}
          source={{
            uri: "https://cgspace.cgiar.org/communities/0074d1e1-d1a0-4fa2-ae90-f9bfbd09ea7d",
          }}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
        />
        {loading && (
          <View
            style={{
              flex: 1,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.2)",
              zIndex: 10,
            }}
          >
            <ActivityIndicator size="large" color="black" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Publications;
