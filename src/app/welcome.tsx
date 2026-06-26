import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const home = () => {
  const router = useRouter();
  return (
    <SafeAreaView
      style={{
        flex: 1,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        alignItems: "center",
      }}
    >
      <View style={{ width: "100%" }}>
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 40,
          }}
        >
          <Image
            source={require("../../assets/images/iita_logo.png")}
            style={{ width: "50%", objectFit: "contain" }}
          ></Image>
        </View>
        <Text
          style={{
            marginTop: 10,
            fontWeight: "700",
            fontSize: 36,
            textAlign: "center",
          }}
        >
          Welcome
        </Text>
        <Text
          style={{
            marginTop: 6,
            fontWeight: "600",
            fontSize: 14,
            textAlign: "center",
          }}
        >
          Connecting You to Agricultural Insights
        </Text>
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={require("../../assets/images/home_title_banner.png")}
            style={{ marginTop: 10, width: "70%", objectFit: "contain" }}
          />
        </View>
      </View>
      <View style={{ width: "90%", marginHorizontal: 16 }}>
        <TouchableOpacity
          style={{
            width: "100%",
            marginBottom: 40,
            backgroundColor: "#D85016",
            height: 60,
            borderRadius: 8,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => router.push({ pathname: "/home" })}
        >
          <Text
            style={{ textAlign: "center", fontWeight: "700", color: "#fff" }}
          >
            Let's go
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default home;
