// import React, { useState, useEffect } from "react";
// import {
//   TouchableOpacity,
//   StyleSheet,
//   View,
//   Text,
//   SafeAreaView,
//   Image,
//   ScrollView,
//   ActivityIndicator,
//   PermissionsAndroid,
//   Platform,
// } from "react-native";
// import { Searchbar } from "react-native-paper";
// import Service from "../../../utils/service";
// import { useNavigation } from "expo-router";
// // import kl from '../../../'
// const technology = ({}) => {
//   const [loading, setLoading] = useState(false);
//   const [data, setData] = useState([]);
//   const baseUrl = Service();
//   const navigation = useNavigation();

//   useEffect(() => {
//     if (data.length < 1) {
//       getData();
//     }
//   }, [data]);

//   const getData = () => {
//     const headers = {
//       "Content-Type": "application/json",
//       Accept: "application/json",
//     };
//     fetch(`${baseUrl}digital-library?kc-category=100&per_page=100`, {
//       method: "GET",
//       headers: headers,
//     })
//       .then((response) => response.json())
//       .then((responseJson) => {
//         setData(responseJson);
//         setLoading(false);
//       })
//       .catch((error) => {
//         setLoading(false);
//         console.log(error);
//       });
//   };

//   const removeTags = (str) => {
//     if (str === null || str === "") return false;
//     else str = str.toString();
//     return str.replace(/(<([^>]+)>)/gi, "");
//   };

//   // const checkPermission = async (FILE_URL, title) => {
//   //   if (Platform.OS === 'ios') {
//   //     ReactNativeBlobUtil.ios.openDocument(FILE_URL);
//   //     await analytics().logEvent('Download', {
//   //       title: title,
//   //       file: FILE_URL,
//   //     });
//   //   } else {
//   //     try {
//   //       const granted = await PermissionsAndroid.request(
//   //         PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
//   //         {
//   //           title: 'Storage Permission Required',
//   //           message:
//   //             'Application needs access to your storage to download File',
//   //         },
//   //       );
//   //       if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//   //         // Start downloading
//   //         downloadFile(FILE_URL);
//   //         console.log('Storage Permission Granted.');
//   //       } else {
//   //         // If permission denied then show alert
//   //         Alert.alert('Error', 'Storage Permission Not Granted');
//   //       }
//   //     } catch (err) {
//   //       // To handle permission related exception
//   //       console.log('++++' + err);
//   //     }
//   //   }
//   // };

//   // const downloadFile = async (FILE_URL, title) => {
//   //   await analytics().logEvent('Download', {
//   //     title: title,
//   //     file: FILE_URL,
//   //   });

//   //   // Get today's date to add the time suffix in filename
//   //   let date = new Date();
//   //   // File URL which we want to download
//   //   // Function to get extention of the file url
//   //   let file_ext = getFileExtention(FILE_URL);

//   //   file_ext = '.' + file_ext[0];

//   //   // config: To get response by passing the downloading related options
//   //   // fs: Root directory path to download
//   //   const {config, fs} = ReactNativeBlobUtil;
//   //   let RootDir = fs.dirs.PictureDir;
//   //   let options = {
//   //     fileCache: true,
//   //     addAndroidDownloads: {
//   //       path:
//   //         RootDir +
//   //         '/file_' +
//   //         Math.floor(date.getTime() + date.getSeconds() / 2) +
//   //         file_ext,
//   //       description: 'downloading file...',
//   //       notification: true,
//   //       // useDownloadManager works with Android only
//   //       useDownloadManager: true,
//   //     },
//   //   };
//   //   config(options)
//   //     .fetch('GET', FILE_URL)
//   //     .then(res => {
//   //       // Alert after successful downloading
//   //       console.log('res -> ', JSON.stringify(res));
//   //       alert('File Downloaded Successfully.');
//   //     });
//   // };

//   const getFileExtention = (fileUrl) => {
//     // To get the file extension
//     return /[.]/.exec(fileUrl) ? /[^.]+$/.exec(fileUrl) : undefined;
//   };

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: "#fafafa" }}>
//       {data.length > 0 ? (
//         <ScrollView style={{ flex: 1, backgroundColor: "#fff", padding: 20 }}>
//           <Searchbar
//             placeholder="Search"
//             style={{
//               backgroundColor: "#F7F8F8",
//               width: "98%",
//               alignSelf: "center",
//               marginBottom: 20,
//             }}
//           />
//           <View style={styles.newContainer}>
//             {data.map((item, i) => (
//               <TouchableOpacity
//                 key={i}
//                 style={styles.items}
//                 onPress={() => {
//                   navigation.navigate("technologycontent", { data: item });
//                 }}
//               >
//                 <Image
//                   style={{ width: 70, height: 100 }}
//                   source={
//                     item["toolset-meta"]["field-group-for-knowledge-center"][
//                       "kc-image"
//                     ].raw
//                       ? {
//                           uri: item["toolset-meta"][
//                             "field-group-for-knowledge-center"
//                           ]["kc-image"].raw,
//                         }
//                       : require("../../../assets/images/library.jpg")
//                   }
//                 />
//                 <View style={{ flex: 5, padding: 10 }}>
//                   <Text numberOfLines={1}>{item.title.rendered}</Text>
//                   <Text numberOfLines={1}>
//                     {removeTags(item.content.rendered)}
//                   </Text>
//                   <TouchableOpacity
//                     style={{
//                       flexDirection: "row",
//                       alignItems: "center",
//                       paddingTop: 10,
//                     }}
//                     // onPress={() => {
//                     //   checkPermission(
//                     //     item['toolset-meta'][
//                     //       'field-group-for-knowledge-center'
//                     //     ]['download-link'].raw,
//                     //     item.title.rendered,
//                     //   );
//                     // }}
//                   >
//                     <Image
//                       style={{ width: 22, height: 22 }}
//                       source={require("../../../assets/icons/download.webp")}
//                     />
//                     <Text style={{ color: "red" }}> Download</Text>
//                   </TouchableOpacity>
//                 </View>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </ScrollView>
//       ) : (
//         <View
//           style={{
//             flex: 1,
//             justifyContent: "center",
//             alignItems: "center",
//             padding: 40,
//           }}
//         >
//           <ActivityIndicator size="large" color={"green"} />
//         </View>
//       )}
//     </SafeAreaView>
//   );
// };
// const styles = StyleSheet.create({
//   newContainer: {
//     width: "100%",
//   },

//   items: {
//     flex: 1,
//     flexDirection: "row",
//     padding: 10,
//     borderWidth: 1,
//     borderColor: "#ECEEEE",
//     borderRadius: 5,
//     width: "98%",
//     marginBottom: 8,
//     alignSelf: "center",
//   },

//   input: {
//     alignItems: "center",
//     backgroundColor: "#F7F8F8",
//     padding: 10,
//     height: 54,
//     borderRadius: 5,
//     width: "100%",
//     marginTop: 5,
//   },
// });
// export default technology;

import React from "react";
import { Text } from "react-native";

const technology = () => {
  return <Text>technology</Text>;
};

export default technology;
