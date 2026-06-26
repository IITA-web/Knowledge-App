import { useLanguage } from "@/context/LanguageContext";
import i18n from "@/i18n";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useNavigation, useRouter } from "expo-router";
import moment from "moment";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FeaturedNews from "../components/FeaturedNews";
import Radio from "../components/RadioScreen";
import { baseStyle } from "../utils/BaseStyle";
import { screenWidth, status_bar_height } from "../utils/Dimension";
import axiosService from "../utils/lib/axiosService";
import { Service } from "../utils/service";

const pub = require("../../assets/images/books.png");
const pubIcon = Image.resolveAssetSource(pub).uri;
const newsi = require("../../assets/images/news.png");
const newsIcon = Image.resolveAssetSource(newsi).uri;
const vid = require("../../assets/images/videos.png");
const vidIcon = Image.resolveAssetSource(vid).uri;
const eveni = require("../../assets/images/event.png");
const evenIcon = Image.resolveAssetSource(eveni).uri;
const datbi = require("../../assets/images/databases.png");
const datbIcon = Image.resolveAssetSource(datbi).uri;
const photi = require("../../assets/images/photos.png");
const photoIcon = Image.resolveAssetSource(photi).uri;
const tv = require("../../assets/images/tv.png");
const tvIcon = Image.resolveAssetSource(tv).uri;
const digitaltools = require("../../assets/images/digitaltoolsicon.png");
const digitaltoolsIcon = Image.resolveAssetSource(digitaltools).uri;
const weather = require("../../assets/images/weather.png");
const weatherIcon = Image.resolveAssetSource(weather).uri;

export const MANDATE_CROPS = [
  {
    key: "cassava",
    labelKey: "cassava",
    emoji: "🌿",
    bg: "#4CAF50",
  },

  {
    key: "maize",
    labelKey: "maize",
    emoji: "🌽",
    bg: "#FFC107",
  },

  {
    key: "cowpea",
    labelKey: "cowpea",
    emoji: "🫘",
    bg: "#8D6E63",
  },

  {
    key: "soybean",
    labelKey: "soybean",
    emoji: "🌱",
    bg: "#66BB6A",
  },

  {
    key: "yam",
    labelKey: "yam",
    emoji: "🍠",
    bg: "#FF7043",
  },

  {
    key: "banana_plantain",
    labelKey: "bananaPlantain",
    emoji: "🍌",
    bg: "#F9A825",
  },

  {
    key: "cocoa",
    labelKey: "cocoa",
    emoji: "🌰",
    bg: "#5D4037",
  },

  {
    key: "coffee",
    labelKey: "coffee",
    emoji: "🍒",
    bg: "#C62828",
  },
];

export const navItems = [
  {
    titleKey: "publications",
    navigationItem: "publications",
    emoji: "📚",
    bg: "#4CAF50",
  },

  {
    titleKey: "news",
    navigationItem: "news",
    emoji: "📰",
    bg: "#F26522",
  },

  {
    titleKey: "events",
    navigationItem: "events",
    emoji: "📅",
    bg: "#9C27B0",
  },

  {
    titleKey: "videos",
    navigationItem: "videoplaylist",
    emoji: "🎥",
    bg: "#E91E63",
  },

  {
    titleKey: "pictures",
    navigationItem: "photosalbum",
    emoji: "📸",
    bg: "#03A9F4",
  },

  {
    titleKey: "digitalTools",
    navigationItem: "digitaltools",
    emoji: "🧰",
    bg: "#607D8B",
  },

  {
    titleKey: "technologies",
    navigationItem: "technology",
    emoji: "🤖",
    bg: "#3F51B5",
  },

  {
    titleKey: "tv",
    navigationItem: "tv",
    emoji: "📺",
    bg: "#795548",
  },

  {
    titleKey: "weather",
    navigationItem: "weather",
    emoji: "🌤️",
    bg: "#FFC107",
  },
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "yo", label: "Yorùbá" },
  { code: "ha", label: "Hausa" },
  { code: "ig", label: "Igbo" },
  { code: "fr", label: "Français" },
  { code: "sw", label: "Kiswahili" },
  { code: "pt", label: "Português" },
];

const axiosIreportService = axios.create({
  baseURL: "http://ireport.iita.org/ireport/",
  timeout: 50000,
  headers: { "Content-Type": "application/json" },
});

const HomeScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingNews, setLoadingNews] = useState(false);
  const [news, setNews] = useState([]);
  const [infographics, setInfographics] = useState<any>({});
  const [loadingInfographics, setLoadingInfographics] = useState(false);
  const [toggleFeaturedNews, setToggleFeaturedNews] = useState(false);

  /* MODALS */
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [contactModal, setContactModal] = useState(false);

  /* LANGUAGE */
  const { language, setLanguage } = useLanguage();

  /* CONTACT FORM */
  const [form, setForm] = useState({
    type: "feedback",
    subject: "",
    message: "",
  });

  const [sendingFeedback, setSendingFeedback] = useState(false);

  const smallScreen = screenWidth <= 300;
  const resourceWidth = smallScreen ? screenWidth / 3.5 : screenWidth / 4.5;

  const CARD_WIDTH = screenWidth * 0.8;
  const SPACING = 20;

  const handleNavPress = (item: any) => {
    if (item.navigationItem) {
      router.push(item.navigationItem);
    } else {
      try {
        router.push({
          pathname: "/inappbrowser",
          params: {
            url: item.link,
          },
        });
      } catch (error: any) {
        Alert.alert(error.message);
      }
    }
  };

  const handleCropPress = (crop: any) => {
    router.push({
      pathname: "/cropdetails",
      params: {
        cropKey: crop.key,
        cropLabel: crop.labelKey,
        cropEmoji: crop.emoji,
        cropBg: crop.bg,
      },
    });
  };

  const handleHorizontalScroll = (event: any) => {
    const slideSize = CARD_WIDTH + SPACING;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentIndex(index);
  };

  const fetchNews = () => {
    setLoadingNews(true);

    axiosService
      .request({ url: `?per_page=10&_embed&page=1`, method: "GET" })
      .then((res) => {
        setNews(res.data);
        // console.log("news data ==>> ", res.data);

        setLoadingNews(false);
      })
      .catch(() => {
        setLoadingNews(false);

        Alert.alert(
          "",
          "Please check your internet connection and try again",
          [
            { text: "Ok", onPress: () => null, style: "cancel" },
            { text: "Retry", onPress: fetchNews },
          ],
          { cancelable: true }
        );
      });
  };

  const fetchInfoGraphics = async () => {
    try {
      setLoadingInfographics(true);

      const res = await fetch(Service.infographicsUrl);
      const data = await res.json();

      setLoadingInfographics(false);
      setInfographics(data[0]);
    } catch {
      setLoadingInfographics(false);
    }
  };

  const handleToggleFeaturedNews = () => setToggleFeaturedNews((p) => !p);

  // const handleContactSubmit = async () => {
  //   if (!form.type) {
  //     return Alert.alert("Missing field", "Please select a type.");
  //   }

  //   if (!form.subject?.trim()) {
  //     return Alert.alert("Missing field", "Please enter a subject.");
  //   }

  //   if (!form.message?.trim()) {
  //     return Alert.alert("Missing field", "Please enter a message.");
  //   }

  //   try {
  //     const response = await fetch(
  //       "https://taat-backend.onrender.com/v1/api/contact",
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           type: form.type,
  //           subject: form.subject,
  //           message: form.message,
  //         }),
  //       }
  //     );

  //     const data = await response.json();

  //     if (!response.ok || !data.success) {
  //       throw new Error(data.message || "Failed to send message");
  //     }

  //     Alert.alert("Success", data.message || "Message sent successfully");

  //     setForm({
  //       type: "feedback",
  //       subject: "",
  //       message: "",
  //     });

  //     setContactModal(false);
  //   } catch (error: any) {
  //     Alert.alert("Error", error?.message || "Failed to send message");
  //   }
  // };

  const handleContactSubmit = async () => {
    if (sendingFeedback) return;

    if (!form.type) {
      return Alert.alert("Missing field", "Please select a type.");
    }

    if (!form.subject?.trim()) {
      return Alert.alert("Missing field", "Please enter a subject.");
    }

    if (!form.message?.trim()) {
      return Alert.alert("Missing field", "Please enter a message.");
    }

    setSendingFeedback(true);

    try {
      const response = await fetch(
        "https://taat-backend.onrender.com/v1/api/knowledge-app",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: form.type,
            subject: form.subject,
            message: form.message,
          }),
        }
      );

      console.log(" handleContactSubmit ===>>> ", response);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to send message");
      }

      Alert.alert("Success", data.message || "Message sent successfully");

      setForm({
        type: "feedback",
        subject: "",
        message: "",
      });

      setContactModal(false);
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to send message");
    } finally {
      setSendingFeedback(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    fetchInfoGraphics();
  }, []);

  const safeNewsImg = (item: any) => {
    const raw =
      item?.metadata?.["wpcf-news-thumbnail"]?.[0] ||
      item?._embedded?.["wp:featuredmedia"]?.[0]?.source_url;

    if (!raw) return "https://s.ytimg.com/yts/img/no_thumbnail-vfl4t3-4R.jpg";

    return encodeURI(
      raw.startsWith("http://") ? raw.replace("http://", "https://") : raw
    );
  };

  const infImg =
    infographics?.["toolset-meta"]?.["featured-posts"]?.["featured-image"]?.raw;

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View
            style={[
              {
                marginBottom: 20,
                maxWidth: "100%",
              },
              baseStyle.marginHorizontal,
            ]}
          >
            {/* Banner and language button */}
            <View
              style={[
                {
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                },
                baseStyle.marginHorizontal,
              ]}
            >
              {/* Banner */}
              <View style={{ flex: 1 }}>
                <Image
                  source={require("../../assets/images/home_title_banner.png")}
                  style={{
                    width: "100%",
                    height: 60,
                    resizeMode: "contain",
                  }}
                />
              </View>

              {/* 🌍 Language Button */}
              <TouchableOpacity
                onPress={() => setLangModalVisible(true)}
                style={{
                  backgroundColor: "#111",
                  padding: 10,
                  borderRadius: 30,
                  marginLeft: 10,
                }}
              >
                <Ionicons name="language-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* What's New */}
            <View style={{ width: "100%" }}>
              {loadingNews ? (
                <ActivityIndicator size="small" color="#F26522" />
              ) : (
                <View>
                  <View style={baseStyle.flexRowAndBetween}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "700",
                        color: "#000",
                      }}
                    >
                      {language && i18n.t("whatsNew")}
                    </Text>

                    <TouchableOpacity
                      style={[{ paddingVertical: 4 }, baseStyle.flexRow]}
                      onPress={() => router.push("/news")}
                    >
                      <Text
                        style={{
                          color: "#F26522",
                          fontWeight: "700",
                          fontSize: 10,
                        }}
                      >
                        {language && i18n.t("viewAll")}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    decelerationRate="fast"
                    snapToInterval={CARD_WIDTH + SPACING}
                    snapToAlignment="start"
                    onMomentumScrollEnd={handleHorizontalScroll}
                    contentContainerStyle={{
                      paddingHorizontal: 10,
                    }}
                  >
                    {news.slice(0, 5).map((item: any, index: number) => (
                      <TouchableOpacity
                        key={index}
                        style={{
                          width: CARD_WIDTH,
                          height: screenWidth * 0.75,
                          borderRadius: 10,
                          paddingVertical: 10,
                          marginRight: SPACING,

                          // 🔥 IMPORTANT FIX
                          flexShrink: 0,
                          flexGrow: 0,
                        }}
                        onPress={() =>
                          router.push({
                            pathname: "/newscontent",
                            params: {
                              id: item.id,
                              otherParam: item.title?.rendered,
                            },
                          })
                        }
                      >
                        <View
                          style={{ backgroundColor: "#fff", marginBottom: 10 }}
                        >
                          <Image
                            source={{ uri: safeNewsImg(item) }}
                            style={{
                              width: "100%",
                              height: screenWidth * 0.5,
                              borderRadius: 5,
                            }}
                          />

                          <View style={{ width: "100%", marginTop: 6 }}>
                            <Text
                              style={{
                                flexWrap: "wrap",
                                color: "#000",
                                fontWeight: "700",
                              }}
                            >
                              {item?.title?.rendered}
                            </Text>

                            <View
                              style={[
                                { marginVertical: 10 },
                                baseStyle.flexRow,
                              ]}
                            >
                              <Text
                                style={{
                                  color: "#F26522",
                                  fontSize: 10,
                                  fontWeight: "700",
                                  marginRight: 5,
                                }}
                              >
                                {language && i18n.t("news")}
                              </Text>

                              <Ionicons name="ellipse" color="#000" size={6} />

                              <Text
                                style={{
                                  color: "#000",
                                  fontSize: 10,
                                  fontWeight: "400",
                                  marginLeft: 3,
                                }}
                              >
                                {moment(item?.date).format("MMM. Do, YYYY")}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* Dots */}
                  <View
                    style={{
                      marginTop: 10,
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    {news.slice(0, 5).map((_, i) => (
                      <View
                        key={i}
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 50,
                          backgroundColor:
                            currentIndex === i ? "#D85016" : "#E7EDE7",
                        }}
                      />
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Resources Section */}
            <View
              style={{
                backgroundColor: "#0D0D12",
                borderRadius: 16,
                paddingVertical: 20,
                paddingHorizontal: 10,
                marginTop: 30,
              }}
            >
              <Text
                style={{
                  fontWeight: "700",
                  fontSize: 18,
                  color: "#fff",
                  marginBottom: 15,
                }}
              >
                {language && i18n.t("resources")}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                }}
              >
                {navItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={{
                      width: "23%",
                      alignItems: "center",
                      marginVertical: 12,
                    }}
                    onPress={() => handleNavPress(item)}
                  >
                    <View
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "#23232D",
                        height: 45,
                        width: 45,
                        borderRadius: 16,
                      }}
                    >
                      {/* <Image
                        source={{ uri: item.image }}
                        style={{
                          width: 20,
                          height: 20,
                          resizeMode: "contain",
                        }}
                      /> */}
                      <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
                    </View>

                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 10,
                        marginTop: 10,
                        textAlign: "center",
                      }}
                    >
                      {/* {item.title} */}
                      {language && i18n.t(item.titleKey)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Mandate Crops */}
            <View style={{ marginBottom: 8 }}>
              <Text
                style={{
                  fontWeight: "700",
                  fontSize: 18,
                  color: "#000",
                  marginBottom: 4,
                  marginTop: 20,
                }}
              >
                {language && i18n.t("mandateCrops")}
              </Text>

              <Text
                style={{
                  fontSize: 12,
                  color: "#888",
                  marginBottom: 8,
                }}
              >
                {language && i18n.t("mandateDescription")}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  justifyContent: "space-between", // 🔥 key fix
                }}
              >
                {MANDATE_CROPS.map((crop) => (
                  <TouchableOpacity
                    key={crop.key}
                    style={{
                      width: "23%", // 🔥 ensures equal distribution (4 per row)
                      alignItems: "center",
                      marginVertical: 12,
                    }}
                    onPress={() => handleCropPress(crop)}
                  >
                    <View
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: crop.bg,
                        height: 45,
                        width: 45,
                        borderRadius: 16,
                      }}
                    >
                      <Text style={{ fontSize: 22 }}>{crop.emoji}</Text>
                    </View>

                    <Text
                      style={{
                        color: "#000",
                        fontSize: 10,
                        marginTop: 8,
                        textAlign: "center",
                        fontWeight: "500",
                      }}
                    >
                      {/* {crop.label} */}
                      {language && i18n.t(crop.labelKey)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Infographics */}
            <View
              style={{
                width: "100%",
                marginBottom: 20,
                marginTop: 10,
              }}
            >
              {loadingInfographics ? (
                <ActivityIndicator size="small" color="#F26522" />
              ) : infImg ? (
                <>
                  <Text
                    style={{
                      fontWeight: "600",
                      marginBottom: 6,
                    }}
                  >
                    {infographics?.title?.rendered}
                  </Text>

                  <TouchableOpacity
                    style={{
                      width: screenWidth - 20,
                      height: screenWidth * 0.5,
                      borderRadius: 10,
                      paddingVertical: 10,
                    }}
                    onPress={handleToggleFeaturedNews}
                  >
                    <Image
                      source={{
                        uri: encodeURI(
                          infImg.startsWith("http://")
                            ? infImg.replace("http://", "https://")
                            : infImg
                        ),
                      }}
                      style={{
                        width: "100%",
                        height: screenWidth * 0.5,
                        borderRadius: 5,
                      }}
                    />
                  </TouchableOpacity>
                </>
              ) : null}
            </View>

            {/* Radio */}
            <View style={{ paddingVertical: 10 }}>
              <Radio />

              <TouchableOpacity
                style={[{ marginTop: 20 }, baseStyle.flexRowAndBetween]}
                onPress={() => router.push("/radio")}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: "#000",
                  }}
                >
                  {language && i18n.t("listenPrograms")}
                </Text>

                <TouchableOpacity
                  style={[{ paddingVertical: 4 }, baseStyle.flexRow]}
                  onPress={() => router.push("/radio")}
                >
                  <Text
                    style={{
                      color: "#F26522",
                      fontWeight: "700",
                      fontSize: 10,
                    }}
                  >
                    {language && i18n.t("viewAll")}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* CONTACT BUTTON */}
        <TouchableOpacity
          onPress={() => setContactModal(true)}
          style={{
            position: "absolute",
            bottom: 60,
            right: 20,
            backgroundColor: "#F26522",
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderRadius: 30,
            flexDirection: "row",
            alignItems: "center",

            // shadow (iOS)
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 6,

            // elevation (Android)
            elevation: 6,
          }}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={18} color="#fff" />

          <Text
            style={{
              color: "#fff",
              fontWeight: "700",
              marginLeft: 8,
              fontSize: 13,
            }}
          >
            {language && i18n.t("contact")}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>

      <Modal visible={toggleFeaturedNews}>
        <View style={{ flex: 1 }}>
          <FeaturedNews
            url={
              infographics?.["toolset-meta"]?.["featured-posts"]?.[
                "featured-link"
              ]?.raw
            }
            title={infographics?.title?.rendered}
            setToggleModal={handleToggleFeaturedNews}
          />
        </View>
      </Modal>

      {/* ---------------- LANGUAGE MODAL ---------------- */}
      <Modal visible={langModalVisible} transparent animationType="slide">
        <Pressable
          onPress={() => setLangModalVisible(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              padding: 20,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700" }}>
              {language && i18n.t("selectLanguage")}
            </Text>

            {LANGUAGES.map((l) => (
              <TouchableOpacity
                key={l.code}
                onPress={() => {
                  setLanguage(l.code);
                  setLangModalVisible(false);
                }}
                style={{
                  paddingVertical: 12,
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text>{l.label}</Text>
                {language === l.code && (
                  <Ionicons name="checkmark-circle" size={20} color="#F26522" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* ---------------- CONTACT MODAL ---------------- */}
      <Modal visible={contactModal} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              padding: 20,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          >
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text style={{ fontSize: 18, fontWeight: "700" }}>
                {language && i18n.t("contactUs")}
              </Text>
              <TouchableOpacity onPress={() => setContactModal(false)}>
                <Ionicons name="close" size={24} />
              </TouchableOpacity>
            </View>

            {/* TYPE */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {["feedback", "bug", "request"].map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setForm({ ...form, type: t })}
                  style={{
                    padding: 8,
                    marginRight: 10,
                    backgroundColor: form.type === t ? "#F26522" : "#eee",
                    borderRadius: 20,
                    marginTop: 10,
                  }}
                >
                  <Text style={{ color: form.type === t ? "#fff" : "#000" }}>
                    {language && i18n.t(t)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              placeholder={i18n.t("subject")}
              value={form.subject}
              placeholderTextColor={"#6B7280"}
              onChangeText={(v) => setForm({ ...form, subject: v })}
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                marginTop: 15,
                padding: 10,
                borderRadius: 10,
              }}
            />

            <TextInput
              placeholder={i18n.t("message")}
              placeholderTextColor={"#6B7280"}
              multiline
              value={form.message}
              onChangeText={(v) => setForm({ ...form, message: v })}
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                marginTop: 10,
                padding: 10,
                height: 100,
                borderRadius: 10,
              }}
            />

            <TouchableOpacity
              onPress={handleContactSubmit}
              style={{
                backgroundColor: "#111",
                padding: 15,
                marginTop: 15,
                borderRadius: 12,
                alignItems: "center",
                marginBottom: status_bar_height ? status_bar_height + 10 : 40,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                {sendingFeedback
                  ? i18n.t("cropDetail.loading")
                  : i18n.t("send")}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

export default HomeScreen;
