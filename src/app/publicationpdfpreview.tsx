import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Pdf from "react-native-pdf";
import * as Progress from "react-native-progress";

const PublicationPdfPreview = () => {
  const { url: downloadLink, name } = useLocalSearchParams();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showModal, setSHowModal] = useState(false);
  const [showDownload, setSHowDownload] = useState(false);

  const downloadFile = async () => {
    setSHowDownload(true);
    // setSHowModal(true);
    const downloadCallback = (downloadProgress) => {
      const progress =
        downloadProgress.totalBytesWritten /
        downloadProgress.totalBytesExpectedToWrite;
      setProgress(progress);
    };

    const downloadResumable = FileSystem.createDownloadResumable(
      downloadLink,
      FileSystem.documentDirectory + name,
      {},
      downloadCallback
    );

    try {
      const { uri } = await downloadResumable.downloadAsync();
      // console.log('Finished downloading to ', uri);
      saveFile(uri, name, "application/pdf");
    } catch (e) {
      console.error(e);
    }
  };
  const saveFile = async (uri, filename, mimetype) => {
    if (Platform.OS === "android") {
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (permissions.granted) {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          filename,
          mimetype
        )
          .then(async (uri) => {
            await FileSystem.writeAsStringAsync(uri, base64, {
              encoding: FileSystem.EncodingType.Base64,
            });
          })
          .catch((e) => console.log(e));
      } else {
        shareAsync(uri);
      }
    } else {
      shareAsync(uri);
    }
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#ccc" }}>
      {name ? (
        <View style={{ flex: 1 }}>
          <Pdf
            trustAllCerts={false}
            source={{
              uri: `${"https://dx.doi.org/10.3390/d13020064"}`,
              cache: true,
            }}
            onLoadComplete={(numberOfPages, filePath) => {}}
            onPageChanged={(page, numberOfPages) => {}}
            onError={(error) => {
              // console.log(error);
            }}
            onPressLink={(uri) => {}}
            onLoadProgress={() => "Loading"}
            style={{ flex: 1 }}
          />
          <TouchableOpacity
            //   style={{position:"absolute", bottom:80, right:20, width:56,height:56, borderRadius:56,backgroundColor:}}
            className="absolute bottom-20 right-5 w-14 h-14 rounded-full bg-[#13234B] flex items-center justify-center"
            onPress={downloadFile}
          >
            <Ionicons name="download" size={22} color={"#fff"} />
          </TouchableOpacity>
          {/* progress button */}

          {showDownload ? (
            <TouchableOpacity
              className="absolute bottom-20 right-5 w-14 h-14 rounded-full bg-[#13234B] flex items-center justify-center"
              onPress={() => setSHowModal(!showModal)}
            >
              <Progress.Circle
                size={48}
                progress={progress}
                showsText
                formatText={() => Math.floor(progress * 100) + "%"}
                thickness={3}
                unfilledColor="#E4E4E4"
                borderWidth={0}
                color="#05AD0C"
                textStyle={{ fontSize: 12, fontWeight: "600" }}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      ) : (
        // </ScrollView>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 40,
          }}
        >
          <ActivityIndicator size="large" color={color} />
        </View>
      )}
      {showModal && (
        <Modal visible={showModal} transparent={true} animationType="slide">
          <View className="  h-full w-full ">
            <Pressable
              className="h-[70%] "
              style={{ marginTop: headerHeight }}
              onPress={() => setSHowModal(!showModal)}
            />
            <View className="absolute bottom-0 h-[35%] bg-white rounded-t-3xl w-full justify-center items-center px-5">
              <Text style={{ marginBottom: 10 }}>{name}</Text>
              <Text style={{ marginBottom: 10 }}>
                {Math.floor(progress * 100) + "%"}
              </Text>
              <Progress.Bar
                progress={progress}
                width={deviceWidth - 10}
                height={10}
                borderRadius={20}
                unfilledColor="#E4E4E4"
                borderWidth={0}
                color="#05AD0C"
              />
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  newContainer: {
    width: "100%",
  },

  description: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    marginTop: 20,
  },

  items: {
    flex: 1,
    flexDirection: "row",
    padding: 10,
    borderRadius: 5,
    width: "98%",
    marginBottom: 8,
    alignSelf: "center",
  },

  input: {
    alignItems: "center",
    backgroundColor: "#F7F8F8",
    padding: 10,
    height: 54,
    borderRadius: 5,
    width: "100%",
    marginTop: 5,
  },
});

export default PublicationPdfPreview;
