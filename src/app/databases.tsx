import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackArrow from "../components/BackArrow";
import CustomHeader from "../components/CustomHeader";
import { baseStyle } from "../utils/BaseStyle";

const Databases = () => {
  const router = useRouter();

  const handlePressButtonAsync = (url: string) => {
    router.push({
      pathname: "/inappbrowser",
      params: {
        url,
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <CustomHeader
        LeftIcon={<BackArrow />}
        RightIcon={null}
        title={"Databases"}
        onPressL={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: 40,
          flexGrow: 1,
        }}
        style={[baseStyle.paddingHorizontal, { flex: 1 }]}
      >
        {/* Yam Base */}
        <TouchableOpacity
          style={styles.databaseCatgeoryStyle}
          onPress={() => handlePressButtonAsync("https://yambase.org")}
        >
          <View style={styles.imageAndTextContainer}>
            <Image
              source={require("../../assets/icons/Yambase.png")}
              style={styles.categoryImageStyle}
            />
            <Text style={styles.title}>Yam Base</Text>
          </View>

          <Ionicons
            name="chevron-forward-circle-outline"
            size={25}
            color={"black"}
          />
        </TouchableOpacity>

        {/* Cassava Base */}
        <TouchableOpacity
          style={styles.databaseCatgeoryStyle}
          onPress={() => handlePressButtonAsync("https://cassavabase.org")}
        >
          <View style={styles.imageAndTextContainer}>
            <Image
              source={require("../../assets/icons/Cassavabase.png")}
              style={styles.categoryImageStyle}
            />
            <Text style={styles.title}>Cassava Base</Text>
          </View>

          <Ionicons
            name="chevron-forward-circle-outline"
            size={25}
            color={"black"}
          />
        </TouchableOpacity>

        {/* Musa Base */}
        <TouchableOpacity
          style={styles.databaseCatgeoryStyle}
          onPress={() => handlePressButtonAsync("https://cassavabase.org")}
        >
          <View style={styles.imageAndTextContainer}>
            <Image
              source={require("../../assets/icons/Musabas.png")}
              style={styles.categoryImageStyle}
            />
            <Text style={styles.title}>Musa Base</Text>
          </View>

          <Ionicons
            name="chevron-forward-circle-outline"
            size={25}
            color={"black"}
          />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  databaseCatgeoryStyle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    height: 45,
    borderRadius: 10,
    backgroundColor: "#ccc",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  imageAndTextContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  categoryImageStyle: {
    width: 25,
    height: 25,
    marginRight: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: "bold",
  },
});

export default Databases;
