// import { useLanguage } from "@/context/LanguageContext";
// import i18n from "@/i18n";
// import {
//   cacheImage,
//   checkInternet,
//   getCachedData,
//   initializeData,
//   saveToCache,
// } from "@/utils/offlineStorage";
// import { Ionicons } from "@expo/vector-icons";
// import NetInfo from "@react-native-community/netinfo";
// import { useRouter } from "expo-router";
// import React, { useEffect, useRef, useState } from "react";
// import {
//   Alert,
//   Animated,
//   Dimensions,
//   FlatList,
//   Image,
//   Linking,
//   Modal,
//   Pressable,
//   SectionList,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   useWindowDimensions,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import WebView from "react-native-webview";
// import { Service } from "../utils/service";

// // ─── Types ────────────────────────────────────────────────────────────────────

// interface DigitalToolsMeta {
//   "digital-thumbnail"?: { raw?: string };
//   "download-link"?: { raw?: string };
// }

// // interface ToolItem {
// //   id: number;
// //   link: string;
// //   title: { rendered: string };
// //   content: { rendered: string };
// //   "toolset-meta": { "digital-tools": DigitalToolsMeta };
// //   pure_taxonomies: { "digital-tools-category": Array<{ name: string }> };
// // }

// interface ToolItem {
//   id: number;
//   link: string;
//   title: { rendered: string };
//   content: { rendered: string };
//   class_list: string[]; // taxonomy slugs live here now
//   "digital-tool-tax": number[];
//   platform: number[];
//   hub: number[];
//   crop: number[];
//   _links: {
//     "wp:featuredmedia"?: WpLink[];
//     [key: string]: WpLink[] | undefined;
//   };
//   // resolved client-side after fetching featured media
//   thumbnailUri?: string;
// }

// interface Section {
//   title: string;
//   data: ToolItem[];
// }

// // ─── Constants ────────────────────────────────────────────────────────────────

// const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// const COLORS = {
//   bg: "#FFFFFF",
//   surface: "#F8F9FA",
//   surfaceElevated: "#FFFFFF",
//   border: "#E5E5EA",
//   accent: "#FF6B2B",
//   accentMuted: "rgba(255,107,43,0.08)",
//   accentBorder: "rgba(255,107,43,0.25)",
//   textPrimary: "#1C1C1E",
//   textSecondary: "#555555",
//   textMuted: "#8E8E93",
//   white: "#FFFFFF",
//   text: "#1A1A1A",
// };

// const PALETTE = [
//   "#FF6B6B",
//   "#FF9F1C",
//   "#6BCB77",
//   "#4D96FF",
//   "#9D4EDD",
//   "#FF922B",
//   "#38A3A5",
//   "#F15BB5",
//   "#00BBF9",
//   "#FF66D8",
//   "#8338EC",
//   "#FFB703",
//   "#06D6A0",
//   "#EF476F",
//   "#118AB2",
// ];

// function getAvatarColor(name: string): string {
//   const idx =
//     (name.charCodeAt(0) + name.charCodeAt(name.length - 1)) % PALETTE.length;
//   return PALETTE[idx];
// }

// // ─── Avatar ───────────────────────────────────────────────────────────────────

// const LetterAvatar: React.FC<{ name: string; size: number }> = ({
//   name,
//   size,
// }) => {
//   const bg = getAvatarColor(name);
//   return (
//     <View
//       style={{
//         width: size,
//         height: size,
//         borderRadius: size * 0.22,
//         backgroundColor: bg + "22",
//         borderWidth: 1.5,
//         borderColor: bg + "44",
//         alignItems: "center",
//         justifyContent: "center",
//       }}
//     >
//       <Text style={{ fontSize: size * 0.42, fontWeight: "800", color: bg }}>
//         {name.charAt(0).toUpperCase()}
//       </Text>
//     </View>
//   );
// };

// // ─── Platform badge ───────────────────────────────────────────────────────────

// const PlatformBadge: React.FC<{ classList: string[] }> = ({ classList }) => {
//   const isAndroid = classList.some((c) => c.includes("android"));
//   const isWeb = classList.some((c) => c.includes("website"));
//   const isIOS = classList.some((c) => c.includes("ios"));

//   const tags: Array<{ icon: string; label: string }> = [];
//   if (isAndroid) tags.push({ icon: "logo-android", label: "Android" });
//   if (isIOS) tags.push({ icon: "logo-apple", label: "iOS" });
//   if (isWeb) tags.push({ icon: "globe-outline", label: "Web" });

//   if (tags.length === 0) return null;

//   return (
//     <View
//       style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 5 }}
//     >
//       {tags.map((t) => (
//         <View key={t.label} style={styles.platformBadge}>
//           <Ionicons name={t.icon as any} size={9} color={COLORS.accent} />
//           <Text style={styles.platformBadgeText}>{t.label}</Text>
//         </View>
//       ))}
//     </View>
//   );
// };

// // ─── ToolCard ─────────────────────────────────────────────────────────────────

// const ToolCard: React.FC<{
//   item: ToolItem;
//   onPress: () => void;
//   index: number;
// }> = ({ item, onPress, index }) => {
//   const fade = useRef(new Animated.Value(0)).current;
//   const slide = useRef(new Animated.Value(20)).current;

//   useEffect(() => {
//     Animated.parallel([
//       Animated.timing(fade, {
//         toValue: 1,
//         duration: 280,
//         delay: Math.min(index * 50, 400),
//         useNativeDriver: true,
//       }),
//       Animated.timing(slide, {
//         toValue: 0,
//         duration: 280,
//         delay: Math.min(index * 50, 400),
//         useNativeDriver: true,
//       }),
//     ]).start();
//   }, []);

//   const rawUrl =
//     item?.["toolset-meta"]?.["digital-tools"]?.["digital-thumbnail"]?.raw;
//   const imageUri = rawUrl
//     ? encodeURI(
//         rawUrl.startsWith("http://")
//           ? rawUrl.replace("http://", "https://")
//           : rawUrl
//       )
//     : null;
//   const name = item.title.rendered;

//   return (
//     <Animated.View
//       style={{ opacity: fade, transform: [{ translateX: slide }] }}
//     >
//       <Pressable
//         onPress={onPress}
//         style={({ pressed }) => [styles.toolCard, pressed && { opacity: 0.75 }]}
//       >
//         <View style={styles.toolCardImageWrap}>
//           {imageUri ? (
//             <Image
//               source={{ uri: imageUri }}
//               style={styles.toolCardImage}
//               resizeMode="contain"
//             />
//           ) : (
//             <LetterAvatar name={name} size={44} />
//           )}
//         </View>
//         <Text style={styles.toolCardTitle} numberOfLines={2}>
//           {name}
//         </Text>
//       </Pressable>
//     </Animated.View>
//   );
// };

// // ─── Section Header ───────────────────────────────────────────────────────────

// const SectionHeader: React.FC<{
//   title: string;
//   count: number;
//   onViewAll: () => void;
// }> = ({ title, count, onViewAll }) => {
//   const { language } = useLanguage();
//   const toolLabel =
//     count !== 1
//       ? `${count} ${language ? i18n.t("digitalTools.tools") : "tools"}`
//       : `1 ${language ? i18n.t("digitalTools.tool") : "tool"}`;

//   return (
//     <View style={styles.sectionHeader}>
//       <View style={{ flex: 1 }}>
//         <Text style={styles.sectionTitle}>{title}</Text>
//         <Text style={styles.sectionCount}>{toolLabel}</Text>
//       </View>
//       <Pressable onPress={onViewAll} style={styles.viewAllBtn}>
//         <Text style={styles.viewAllText}>
//           {language ? i18n.t("digitalTools.viewAll") : "View all"}
//         </Text>
//         <Ionicons name="chevron-forward" size={12} color={COLORS.accent} />
//       </Pressable>
//     </View>
//   );
// };

// // ─── Skeleton ─────────────────────────────────────────────────────────────────

// const SkeletonSection: React.FC<{ index: number }> = ({ index }) => {
//   const pulse = useRef(new Animated.Value(0.3)).current;
//   useEffect(() => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(pulse, {
//           toValue: 0.85,
//           duration: 750,
//           delay: index * 120,
//           useNativeDriver: true,
//         }),
//         Animated.timing(pulse, {
//           toValue: 0.3,
//           duration: 750,
//           useNativeDriver: true,
//         }),
//       ])
//     ).start();
//   }, []);
//   return (
//     <Animated.View
//       style={{ opacity: pulse, paddingHorizontal: 16, marginBottom: 28 }}
//     >
//       <View
//         style={{
//           width: 140,
//           height: 13,
//           borderRadius: 6,
//           backgroundColor: "#E5E5EA",
//           marginBottom: 6,
//         }}
//       />
//       <View
//         style={{
//           width: 60,
//           height: 10,
//           borderRadius: 5,
//           backgroundColor: "#E5E5EA",
//           marginBottom: 14,
//         }}
//       />
//       <View style={{ flexDirection: "row", gap: 10 }}>
//         {[0, 1, 2, 3].map((i) => (
//           <View
//             key={i}
//             style={{
//               width: 96,
//               height: 120,
//               borderRadius: 14,
//               backgroundColor: COLORS.surface,
//               borderWidth: 1,
//               borderColor: COLORS.border,
//             }}
//           />
//         ))}
//       </View>
//     </Animated.View>
//   );
// };

// // ─── Detail Sheet ─────────────────────────────────────────────────────────────

// const DetailSheet: React.FC<{ item: ToolItem | null; onClose: () => void }> = ({
//   item,
//   onClose,
// }) => {
//   const { language } = useLanguage();
//   const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
//   const { width } = useWindowDimensions();
//   const visible = !!item;

//   useEffect(() => {
//     Animated.spring(slideAnim, {
//       toValue: visible ? 0 : SCREEN_HEIGHT,
//       useNativeDriver: true,
//       tension: 60,
//       friction: 11,
//     }).start();
//   }, [visible]);

//   if (!item) return null;

//   const name = item.title.rendered;
//   const linkUrl = item.link;
//   const rawUrl =
//     item?.["toolset-meta"]?.["digital-tools"]?.["digital-thumbnail"]?.raw;
//   const imageUri = rawUrl
//     ? encodeURI(
//         rawUrl.startsWith("http://")
//           ? rawUrl.replace("http://", "https://")
//           : rawUrl
//       )
//     : null;
//   const downloadLink =
//     item?.["toolset-meta"]?.["digital-tools"]?.["download-link"]?.raw;
//   // const linkUrl = downloadLink || item.link;
//   const linkLabel = language
//     ? i18n.t(
//         downloadLink ? "digitalTools.downloadApp" : "digitalTools.visitWebsite"
//       )
//     : downloadLink
//     ? "Download the app"
//     : "Visit website";

//   const htmlContent = `
//     <html>
//       <head>
//         <meta name="viewport" content="width=device-width, initial-scale=1" />
//         <style>
//           * { box-sizing: border-box; }
//           body { font-family: -apple-system, sans-serif; padding: 16px; margin: 0; background: #FFFFFF; color: #555555; font-size: 15px; line-height: 1.7; }
//           img { max-width: 100%; height: auto; border-radius: 8px; }
//           a { color: #FF6B2B; }
//           h1,h2,h3 { color: #1C1C1E; font-weight: 700; }
//           p { margin: 0 0 14px; }
//         </style>
//       </head>
//       <body>${
//         item.content?.rendered ||
//         `<p>${
//           language ? i18n.t("digitalTools.noContent") : "No content available."
//         }</p>`
//       }</body>
//     </html>
//   `;

//   const handleLink = async () => {
//     try {
//       await Linking.openURL(linkUrl);
//     } catch (e: any) {
//       Alert.alert("", e.message);
//     }
//   };

//   // Parse platform from class_list for the link label
//   const isAndroid = item.class_list.some((c) => c.includes("android"));
//   // const linkLabel = isAndroid ? "Download the app" : "Visit website";
//   const linkIcon: any = isAndroid ? "cloud-download-outline" : "globe-outline";

//   return (
//     <Modal visible={visible} transparent animationType="none">
//       <Pressable style={styles.backdrop} onPress={onClose} />
//       <Animated.View
//         style={[styles.detailSheet, { transform: [{ translateY: slideAnim }] }]}
//       >
//         <View style={styles.sheetHandle} />

//         <View style={styles.detailHeader}>
//           <View style={styles.detailThumbnail}>
//             {imageUri ? (
//               <Image
//                 source={{ uri: imageUri }}
//                 style={{ width: 52, height: 52 }}
//                 resizeMode="contain"
//               />
//             ) : (
//               <LetterAvatar name={name} size={52} />
//             )}
//           </View>
//           <View style={{ flex: 1 }}>
//             <Text style={styles.detailTitle} numberOfLines={2}>
//               {name}
//             </Text>
//             <PlatformBadge classList={item.class_list} />
//           </View>
//           <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
//             <Ionicons name="close" size={18} color={COLORS.textSecondary} />
//           </Pressable>
//         </View>
// {/* link button */}
//         <Pressable onPress={handleLink} style={styles.linkBtn}>
//           {/* <Ionicons
//             name={downloadLink ? "cloud-download-outline" : "globe-outline"}
//             size={16}
//             color={COLORS.accent}
//           /> */}
//                     <Ionicons name={linkIcon} size={16} color={COLORS.accent} />
//           <Text style={styles.linkBtnText}>{linkLabel}</Text>
//           <Ionicons
//             name="open-outline"
//             size={14}
//             color={COLORS.accentBorder}
//             style={{ marginLeft: "auto" }}
//           />
//         </Pressable>

//         <WebView
//           originWhitelist={["*"]}
//           source={{ html: htmlContent }}
//           style={{ flex: 1, backgroundColor: "#FFFFFF" }}
//           javaScriptEnabled
//           domStorageEnabled
//         />
//       </Animated.View>
//     </Modal>
//   );
// };

// // ─── Main Screen ──────────────────────────────────────────────────────────────

// const DigitalTools: React.FC = () => {
//   const router = useRouter();
//   const { language } = useLanguage();

//   const [loading, setLoading] = useState(false);
//   const [sections, setSections] = useState<Section[]>([]);
//   const [selectedItem, setSelectedItem] = useState<ToolItem | null>(null);
//   const [isOffline, setIsOffline] = useState(false);

//     // Resolve featured media thumbnail for a single item
//     const resolveThumbnail = async (item: ToolItem): Promise<ToolItem> => {
//       const mediaLink = item._links["wp:featuredmedia"]?.[0]?.href;
//       if (!mediaLink) return item;
//       try {
//         const res = await fetch(mediaLink);
//         const json = await res.json();
//         const raw: string =
//           json.source_url ??
//           json.media_details?.sizes?.thumbnail?.source_url ??
//           "";
//         if (!raw) return item;
//         const secure = raw.startsWith("http://")
//           ? raw.replace("http://", "https://")
//           : raw;
//         return { ...item, thumbnailUri: encodeURI(secure) };
//       } catch {
//         return item;
//       }
//     };
//     const processAndGroup = (items: ToolItem[]): Section[] => {
//       const acc: Section[] = [];
//       for (const item of items) {
//         // Extract category slugs from class_list, e.g. "digital-tool-tax-crop-management-and-agronomy"
//         const taxClasses = item.class_list.filter(
//           (c) => c.startsWith(TAX_SLUG_PREFIX) && !c.includes(EXCLUDED_CATEGORY)
//         );
//         if (taxClasses.length === 0) {
//           // Uncategorised — put in a catch-all
//           let sec = acc.find((s) => s.title === "Other");
//           if (!sec) {
//             sec = { title: "Other", data: [] };
//             acc.push(sec);
//           }
//           sec.data.push(item);
//         } else {
//           for (const cls of taxClasses) {
//             const catTitle = slugToTitle(cls.replace(TAX_SLUG_PREFIX, ""));
//             let sec = acc.find((s) => s.title === catTitle);
//             if (!sec) {
//               sec = { title: catTitle, data: [] };
//               acc.push(sec);
//             }
//             sec.data.push(item);
//           }
//         }
//       }
//       return acc;
//     };
//   // const processData = (json: ToolItem[]) => {
//   //   const grouped = json.reduce<Section[]>((acc, item) => {
//   //     item.pure_taxonomies["digital-tools-category"].forEach((cat) => {
//   //       let sec = acc.find((s) => s.title === cat.name);
//   //       if (!sec) {
//   //         sec = { title: cat.name, data: [] };
//   //         acc.push(sec);
//   //       }
//   //       sec.data.push(item);
//   //     });
//   //     return acc;
//   //   }, []);
//   //   setSections(
//   //     grouped.filter((s) => s.title !== "Information and Communication")
//   //   );
//   // };

//   // useEffect(() => {
//   //   const init = async () => {
//   //     await initializeData();
//   //     fetchData();
//   //   };
//   //   init();
//   // }, []);

//   // const fetchData = async () => {
//   //   setLoading(true);
//   //   const hasInternet = await checkInternet();
//   //   try {
//   //     if (hasInternet) {
//   //       const res = await fetch(Service.Technology);
//   //       if (res.ok) {
//   //         const freshData: ToolItem[] = await res.json();
//   //         for (const item of freshData) {
//   //           const rawUrl =
//   //             item?.["toolset-meta"]?.["digital-tools"]?.["digital-thumbnail"]
//   //               ?.raw;
//   //           if (rawUrl) await cacheImage(rawUrl);
//   //         }
//   //         await saveToCache(freshData);
//   //         processData(freshData);
//   //       }
//   //     } else {
//   //       const cached = await getCachedData();
//   //       if (cached) processData(cached);
//   //     }
//   //   } catch (e) {
//   //     // console.log(e);
//   //     const cached = await getCachedData();
//   //     if (cached) processData(cached);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   // const fetchData = async () => {
//   //   setLoading(true);
//   //   try {
//   //     const res = await fetch(Service.Technology);
//   //     const json: ToolItem[] = await res.json();

//   //     // Group first so UI can render immediately, then resolve thumbnails lazily
//   //     const grouped = processAndGroup(json);

//   //     setSections(grouped);
//   //     setLoading(false);

//   //     // Resolve thumbnails in the background and update sections
//   //     const resolved = await Promise.all(
//   //       json.map((item) => resolveThumbnail(item))
//   //     );
//   //     setSections(processAndGroup(resolved));
//   //   } catch (e: any) {
//   //     setLoading(false);
//   //     Alert.alert("Error", e.message);
//   //   }
//   // };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   useEffect(() => {
//     const unsubscribe = NetInfo.addEventListener((state) =>
//       setIsOffline(!state.isConnected)
//     );
//     return unsubscribe;
//   }, []);

//   const headerSub =
//     sections.length > 0
//       ? `${sections.length} ${
//           language ? i18n.t("digitalTools.categories") : "categories"
//         }`
//       : language
//       ? i18n.t("digitalTools.browseAll")
//       : "Browse all tools";

//   return (
//     <SafeAreaView style={styles.safe} edges={["top"]}>
//       <StatusBar barStyle="dark-content" />

//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity
//           onPress={() => router.back()}
//           style={styles.headerIconBtn}
//         >
//           <Ionicons name="arrow-back" size={20} color={COLORS.text} />
//         </TouchableOpacity>
//         <View>
//           <Text style={styles.headerTitle}>
//             {language ? i18n.t("digitalTools.screenTitle") : "Digital Tools"}
//           </Text>
//           <Text style={styles.headerSub}>{headerSub}</Text>
//         </View>
//         <Pressable onPress={fetchData} style={styles.refreshBtn} hitSlop={10}>
//           <Ionicons
//             name="refresh-outline"
//             size={18}
//             color={COLORS.textSecondary}
//           />
//         </Pressable>
//       </View>

//       {/* Content */}
//       {loading ? (
//         <FlatList
//           data={[0, 1, 2, 3]}
//           keyExtractor={(i) => i.toString()}
//           renderItem={({ index }) => <SkeletonSection index={index} />}
//           contentContainerStyle={{ paddingTop: 20 }}
//           showsVerticalScrollIndicator={false}
//         />
//       ) : (
//         <SectionList
//           sections={sections}
//           keyExtractor={(item, index) => String(item.id) + index}
//           showsVerticalScrollIndicator={false}
//           stickySectionHeadersEnabled={false}
//           contentContainerStyle={styles.listContent}
//           renderItem={() => null}
//           renderSectionHeader={({ section }) => (
//             <View style={styles.sectionBlock}>
//               <SectionHeader
//                 title={section.title}
//                 count={section.data.length}
//                 onViewAll={() =>
//                   router.push({
//                     pathname: "../digitaltoolscontent",
//                     params: {
//                       stringData: JSON.stringify(section.data),
//                       title: section.title,
//                     },
//                   })
//                 }
//               />
//               <FlatList
//                 data={section.data}
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 keyExtractor={(item, i) => String(item.id) + i}
//                 renderItem={({ item, index }) => (
//                   <ToolCard
//                     item={item}
//                     index={index}
//                     onPress={() => setSelectedItem(item)}
//                   />
//                 )}
//                 contentContainerStyle={styles.horizontalList}
//                 ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
//               />
//             </View>
//           )}
//           ListEmptyComponent={
//             <View style={styles.emptyState}>
//               <Ionicons
//                 name="construct-outline"
//                 size={40}
//                 color={COLORS.textMuted}
//               />
//               <Text style={styles.emptyText}>
//                 {language
//                   ? i18n.t("digitalTools.noTools")
//                   : "No tools available"}
//               </Text>
//               <Pressable onPress={fetchData} style={styles.retryBtn}>
//                 <Text style={styles.retryText}>
//                   {language ? i18n.t("digitalTools.retry") : "Retry"}
//                 </Text>
//               </Pressable>
//             </View>
//           }
//         />
//       )}

//       <DetailSheet item={selectedItem} onClose={() => setSelectedItem(null)} />
//     </SafeAreaView>
//   );
// };

// // ─── Styles (unchanged) ───────────────────────────────────────────────────────

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: COLORS.bg },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.border,
//   },
//   headerIconBtn: {
//     width: 38,
//     height: 38,
//     borderRadius: 10,
//     backgroundColor: COLORS.surface,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     justifyContent: "center",
//     alignItems: "center",
//     position: "relative",
//   },
//   headerTitle: {
//     fontSize: 22,
//     fontWeight: "800",
//     color: COLORS.textPrimary,
//     letterSpacing: -0.3,
//   },
//   headerSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
//   refreshBtn: {
//     width: 38,
//     height: 38,
//     borderRadius: 11,
//     backgroundColor: COLORS.surface,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   listContent: { paddingTop: 8, paddingBottom: 40 },
//   sectionBlock: { marginBottom: 8 },
//   sectionHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingTop: 20,
//     paddingBottom: 12,
//   },
//   sectionTitle: { fontSize: 15, fontWeight: "700", color: COLORS.textPrimary },
//   sectionCount: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
//   viewAllBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 3,
//     backgroundColor: COLORS.accentMuted,
//     borderWidth: 1,
//     borderColor: COLORS.accentBorder,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 20,
//   },
//   viewAllText: { fontSize: 12, fontWeight: "700", color: COLORS.accent },
//   horizontalList: { paddingHorizontal: 20, paddingBottom: 4 },
//   toolCard: {
//     width: 96,
//     backgroundColor: COLORS.surface,
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     padding: 10,
//     alignItems: "center",
//     justifyContent: "flex-start",
//     gap: 8,
//     minHeight: 118,
//   },
//   toolCardImageWrap: {
//     width: 48,
//     height: 48,
//     alignItems: "center",
//     justifyContent: "center",
//     borderRadius: 12,
//     overflow: "hidden",
//   },
//   toolCardImage: { width: 44, height: 44, borderRadius: 10 },
//   toolCardTitle: {
//     fontSize: 10,
//     fontWeight: "600",
//     color: COLORS.textSecondary,
//     textAlign: "center",
//     lineHeight: 14,
//   },
//   emptyState: { alignItems: "center", paddingVertical: 80, gap: 12 },
//   emptyText: { fontSize: 15, fontWeight: "600", color: COLORS.textSecondary },
//   retryBtn: {
//     paddingHorizontal: 20,
//     paddingVertical: 9,
//     borderRadius: 20,
//     backgroundColor: COLORS.accentMuted,
//     borderWidth: 1,
//     borderColor: COLORS.accentBorder,
//   },
//   retryText: { fontSize: 14, fontWeight: "700", color: COLORS.accent },
//   backdrop: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(0,0,0,0.45)",
//   },
//   detailSheet: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     height: SCREEN_HEIGHT * 0.82,
//     backgroundColor: COLORS.surfaceElevated,
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     borderTopWidth: 1,
//     borderColor: COLORS.border,
//   },
//   sheetHandle: {
//     width: 36,
//     height: 4,
//     borderRadius: 2,
//     backgroundColor: "#D1D1D6",
//     alignSelf: "center",
//     marginTop: 12,
//     marginBottom: 4,
//   },
//   detailHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 14,
//     paddingHorizontal: 20,
//     paddingVertical: 14,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.border,
//   },
//   detailThumbnail: {
//     width: 56,
//     height: 56,
//     borderRadius: 14,
//     backgroundColor: COLORS.surface,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     alignItems: "center",
//     justifyContent: "center",
//     overflow: "hidden",
//   },
//   detailTitle: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: COLORS.textPrimary,
//     lineHeight: 22,
//   },
//   closeBtn: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: COLORS.surface,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   linkBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     marginHorizontal: 20,
//     marginVertical: 12,
//     backgroundColor: COLORS.accentMuted,
//     borderWidth: 1,
//     borderColor: COLORS.accentBorder,
//     borderRadius: 12,
//     paddingHorizontal: 14,
//     paddingVertical: 11,
//   },
//   linkBtnText: { fontSize: 14, fontWeight: "700", color: COLORS.accent },
//   platformBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 3,
//     backgroundColor: COLORS.accentMuted,
//     borderWidth: 1,
//     borderColor: COLORS.accentBorder,
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 10,
//   },
//   platformBadgeText: { fontSize: 9, fontWeight: "700", color: COLORS.accent },

// });

// export default DigitalTools;

// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import React, { useEffect, useRef, useState } from "react";
// import {
//   Alert,
//   Animated,
//   Dimensions,
//   FlatList,
//   Image,
//   Linking,
//   Modal,
//   Pressable,
//   SectionList,
//   StatusBar,
//   StyleSheet,
//   Text,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import WebView from "react-native-webview";
// import { Service } from "../utils/service";

// // ─── Types ────────────────────────────────────────────────────────────────────

// interface WpLink {
//   href: string;
//   embeddable?: boolean;
// }

// interface ToolItem {
//   id: number;
//   link: string;
//   title: { rendered: string };
//   content: { rendered: string };
//   class_list: string[]; // taxonomy slugs live here now
//   "digital-tool-tax": number[];
//   platform: number[];
//   hub: number[];
//   crop: number[];
//   _links: {
//     "wp:featuredmedia"?: WpLink[];
//     [key: string]: WpLink[] | undefined;
//   };
//   // resolved client-side after fetching featured media
//   thumbnailUri?: string;
// }

// interface Section {
//   title: string;
//   data: ToolItem[];
// }

// // ─── Constants ────────────────────────────────────────────────────────────────

// const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// const COLORS = {
//   bg: "#0D0D12",
//   surface: "#161620",
//   surfaceElevated: "#1E1E2E",
//   border: "#2A2A3D",
//   accent: "#FF6B2B",
//   accentMuted: "rgba(255,107,43,0.13)",
//   accentBorder: "rgba(255,107,43,0.35)",
//   textPrimary: "#F0EEF8",
//   textSecondary: "#9997B0",
//   textMuted: "#5A5870",
//   white: "#FFFFFF",
// };

// const PALETTE = [
//   "#FF6B6B",
//   "#FFD93D",
//   "#6BCB77",
//   "#4D96FF",
//   "#9D4EDD",
//   "#FF922B",
//   "#38A3A5",
//   "#F15BB5",
//   "#00BBF9",
//   "#FF66D8",
//   "#8338EC",
//   "#FFB703",
//   "#06D6A0",
//   "#EF476F",
//   "#118AB2",
// ];

// // Maps class_list slug prefix → human-readable category name
// const TAX_SLUG_PREFIX = "digital-tool-tax-";
// const EXCLUDED_CATEGORY = "information-and-communication";

// function slugToTitle(slug: string): string {
//   return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
// }

// function getAvatarColor(name: string): string {
//   const idx =
//     (name.charCodeAt(0) + (name.charCodeAt(name.length - 1) || 0)) %
//     PALETTE.length;
//   return PALETTE[idx];
// }

// // ─── LetterAvatar ─────────────────────────────────────────────────────────────

// const LetterAvatar: React.FC<{ name: string; size: number }> = ({
//   name,
//   size,
// }) => {
//   const bg = getAvatarColor(name);
//   return (
//     <View
//       style={{
//         width: size,
//         height: size,
//         borderRadius: size * 0.22,
//         backgroundColor: bg + "33",
//         borderWidth: 1.5,
//         borderColor: bg + "66",
//         alignItems: "center",
//         justifyContent: "center",
//       }}
//     >
//       <Text style={{ fontSize: size * 0.42, fontWeight: "800", color: bg }}>
//         {name.charAt(0).toUpperCase()}
//       </Text>
//     </View>
//   );
// };

// // ─── Platform badge ───────────────────────────────────────────────────────────

// const PlatformBadge: React.FC<{ classList: string[] }> = ({ classList }) => {
//   const isAndroid = classList.some((c) => c.includes("android"));
//   const isWeb = classList.some((c) => c.includes("website"));
//   const isIOS = classList.some((c) => c.includes("ios"));

//   const tags: Array<{ icon: string; label: string }> = [];
//   if (isAndroid) tags.push({ icon: "logo-android", label: "Android" });
//   if (isIOS) tags.push({ icon: "logo-apple", label: "iOS" });
//   if (isWeb) tags.push({ icon: "globe-outline", label: "Web" });

//   if (tags.length === 0) return null;

//   return (
//     <View
//       style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 5 }}
//     >
//       {tags.map((t) => (
//         <View key={t.label} style={styles.platformBadge}>
//           <Ionicons name={t.icon as any} size={9} color={COLORS.accent} />
//           <Text style={styles.platformBadgeText}>{t.label}</Text>
//         </View>
//       ))}
//     </View>
//   );
// };

// // ─── ToolCard (horizontal tile) ───────────────────────────────────────────────

// const ToolCard: React.FC<{
//   item: ToolItem;
//   onPress: () => void;
//   index: number;
// }> = ({ item, onPress, index }) => {
//   const fade = useRef(new Animated.Value(0)).current;
//   const slide = useRef(new Animated.Value(20)).current;

//   useEffect(() => {
//     Animated.parallel([
//       Animated.timing(fade, {
//         toValue: 1,
//         duration: 280,
//         delay: Math.min(index * 50, 400),
//         useNativeDriver: true,
//       }),
//       Animated.timing(slide, {
//         toValue: 0,
//         duration: 280,
//         delay: Math.min(index * 50, 400),
//         useNativeDriver: true,
//       }),
//     ]).start();
//   }, []);

//   const name = item.title.rendered;

//   return (
//     <Animated.View
//       style={{ opacity: fade, transform: [{ translateX: slide }] }}
//     >
//       <Pressable
//         onPress={onPress}
//         style={({ pressed }) => [styles.toolCard, pressed && { opacity: 0.72 }]}
//       >
//         <View style={styles.toolCardImageWrap}>
//           {item.thumbnailUri ? (
//             <Image
//               source={{ uri: item.thumbnailUri }}
//               style={styles.toolCardImage}
//               resizeMode="contain"
//             />
//           ) : (
//             <LetterAvatar name={name} size={44} />
//           )}
//         </View>
//         <Text style={styles.toolCardTitle} numberOfLines={2}>
//           {name}
//         </Text>
//       </Pressable>
//     </Animated.View>
//   );
// };

// // ─── Section header ───────────────────────────────────────────────────────────

// const SectionHeader: React.FC<{
//   title: string;
//   count: number;
//   onViewAll: () => void;
// }> = ({ title, count, onViewAll }) => (
//   <View style={styles.sectionHeader}>
//     <View style={{ flex: 1 }}>
//       <Text style={styles.sectionTitle}>{title}</Text>
//       <Text style={styles.sectionCount}>
//         {count} tool{count !== 1 ? "s" : ""}
//       </Text>
//     </View>
//     <Pressable onPress={onViewAll} style={styles.viewAllBtn}>
//       <Text style={styles.viewAllText}>View all</Text>
//       <Ionicons name="chevron-forward" size={12} color={COLORS.accent} />
//     </Pressable>
//   </View>
// );

// // ─── Skeleton ─────────────────────────────────────────────────────────────────

// const SkeletonSection: React.FC<{ index: number }> = ({ index }) => {
//   const pulse = useRef(new Animated.Value(0.3)).current;
//   useEffect(() => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(pulse, {
//           toValue: 0.85,
//           duration: 750,
//           delay: index * 120,
//           useNativeDriver: true,
//         }),
//         Animated.timing(pulse, {
//           toValue: 0.3,
//           duration: 750,
//           useNativeDriver: true,
//         }),
//       ])
//     ).start();
//   }, []);
//   return (
//     <Animated.View
//       style={{ opacity: pulse, paddingHorizontal: 16, marginBottom: 28 }}
//     >
//       <View
//         style={{
//           width: 160,
//           height: 13,
//           borderRadius: 6,
//           backgroundColor: COLORS.border,
//           marginBottom: 6,
//         }}
//       />
//       <View
//         style={{
//           width: 60,
//           height: 10,
//           borderRadius: 5,
//           backgroundColor: COLORS.border,
//           marginBottom: 14,
//         }}
//       />
//       <View style={{ flexDirection: "row", gap: 10 }}>
//         {[0, 1, 2, 3].map((i) => (
//           <View
//             key={i}
//             style={{
//               width: 96,
//               height: 120,
//               borderRadius: 14,
//               backgroundColor: COLORS.surface,
//               borderWidth: 1,
//               borderColor: COLORS.border,
//             }}
//           />
//         ))}
//       </View>
//     </Animated.View>
//   );
// };

// const DetailSheet: React.FC<{ item: ToolItem | null; onClose: () => void }> = ({
//   item,
//   onClose,
// }) => {
//   const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
//   const visible = !!item;

//   useEffect(() => {
//     Animated.spring(slideAnim, {
//       toValue: visible ? 0 : SCREEN_HEIGHT,
//       useNativeDriver: true,
//       tension: 60,
//       friction: 11,
//     }).start();
//   }, [visible]);

//   if (!item) return null;

//   const name = item.title.rendered;
//   const linkUrl = item.link;

//   const htmlContent = `
//     <html>
//       <head>
//         <meta name="viewport" content="width=device-width, initial-scale=1" />
//         <style>
//           * { box-sizing: border-box; }
//           body { font-family: -apple-system, sans-serif; padding: 16px; margin: 0;
//             background: #0D0D12; color: #9997B0; font-size: 14px; line-height: 1.75; }
//           img { max-width: 100%; height: auto; border-radius: 8px; }
//           a { color: #FF6B2B; }
//           h1,h2,h3 { color: #F0EEF8; font-weight: 700; }
//           p { margin: 0 0 12px; }
//         </style>
//       </head>
//       <body>${item.content?.rendered || "<p>No content available.</p>"}</body>
//     </html>
//   `;

//   // Parse platform from class_list for the link label
//   const isAndroid = item.class_list.some((c) => c.includes("android"));
//   const linkLabel = isAndroid ? "Download the app" : "Visit website";
//   const linkIcon: any = isAndroid ? "cloud-download-outline" : "globe-outline";

//   const handleLink = async () => {
//     try {
//       await Linking.openURL(linkUrl);
//     } catch (e: any) {
//       Alert.alert("", e.message);
//     }
//   };

//   return (
//     <Modal visible={visible} transparent animationType="none">
//       <Pressable style={styles.backdrop} onPress={onClose} />
//       <Animated.View
//         style={[styles.detailSheet, { transform: [{ translateY: slideAnim }] }]}
//       >
//         <View style={styles.sheetHandle} />

//         {/* Header */}
//         <View style={styles.detailHeader}>
//           <View style={styles.detailThumbnail}>
//             {item.thumbnailUri ? (
//               <Image
//                 source={{ uri: item.thumbnailUri }}
//                 style={{ width: 52, height: 52 }}
//                 resizeMode="contain"
//               />
//             ) : (
//               <LetterAvatar name={name} size={52} />
//             )}
//           </View>
//           <View style={{ flex: 1 }}>
//             <Text style={styles.detailTitle} numberOfLines={2}>
//               {name}
//             </Text>
//             <PlatformBadge classList={item.class_list} />
//           </View>
//           <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
//             <Ionicons name="close" size={18} color={COLORS.textSecondary} />
//           </Pressable>
//         </View>

//         {/* Link button */}
//         <Pressable onPress={handleLink} style={styles.linkBtn}>
//           <Ionicons name={linkIcon} size={16} color={COLORS.accent} />
//           <Text style={styles.linkBtnText}>{linkLabel}</Text>
//           <Ionicons
//             name="open-outline"
//             size={14}
//             color={COLORS.accentBorder}
//             style={{ marginLeft: "auto" }}
//           />
//         </Pressable>

//         <WebView
//           originWhitelist={["*"]}
//           source={{ html: htmlContent }}
//           style={{ flex: 1, backgroundColor: "transparent" }}
//           javaScriptEnabled
//           domStorageEnabled
//         />
//       </Animated.View>
//     </Modal>
//   );
// };

// // ─── Main Screen ──────────────────────────────────────────────────────────────

// const DigitalTools: React.FC = () => {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [sections, setSections] = useState<Section[]>([]);
//   const [selectedItem, setSelectedItem] = useState<ToolItem | null>(null);

//   // Resolve featured media thumbnail for a single item
//   const resolveThumbnail = async (item: ToolItem): Promise<ToolItem> => {
//     const mediaLink = item._links["wp:featuredmedia"]?.[0]?.href;
//     if (!mediaLink) return item;
//     try {
//       const res = await fetch(mediaLink);
//       const json = await res.json();
//       const raw: string =
//         json.source_url ??
//         json.media_details?.sizes?.thumbnail?.source_url ??
//         "";
//       if (!raw) return item;
//       const secure = raw.startsWith("http://")
//         ? raw.replace("http://", "https://")
//         : raw;
//       return { ...item, thumbnailUri: encodeURI(secure) };
//     } catch {
//       return item;
//     }
//   };

//   const processAndGroup = (items: ToolItem[]): Section[] => {
//     const acc: Section[] = [];
//     for (const item of items) {
//       // Extract category slugs from class_list, e.g. "digital-tool-tax-crop-management-and-agronomy"
//       const taxClasses = item.class_list.filter(
//         (c) => c.startsWith(TAX_SLUG_PREFIX) && !c.includes(EXCLUDED_CATEGORY)
//       );
//       if (taxClasses.length === 0) {
//         // Uncategorised — put in a catch-all
//         let sec = acc.find((s) => s.title === "Other");
//         if (!sec) {
//           sec = { title: "Other", data: [] };
//           acc.push(sec);
//         }
//         sec.data.push(item);
//       } else {
//         for (const cls of taxClasses) {
//           const catTitle = slugToTitle(cls.replace(TAX_SLUG_PREFIX, ""));
//           let sec = acc.find((s) => s.title === catTitle);
//           if (!sec) {
//             sec = { title: catTitle, data: [] };
//             acc.push(sec);
//           }
//           sec.data.push(item);
//         }
//       }
//     }
//     return acc;
//   };

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(Service.Technology);
//       const json: ToolItem[] = await res.json();

//       // Group first so UI can render immediately, then resolve thumbnails lazily
//       const grouped = processAndGroup(json);

//       setSections(grouped);
//       setLoading(false);

//       // Resolve thumbnails in the background and update sections
//       const resolved = await Promise.all(
//         json.map((item) => resolveThumbnail(item))
//       );
//       setSections(processAndGroup(resolved));
//     } catch (e: any) {
//       setLoading(false);
//       Alert.alert("Error", e.message);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   return (
//     <SafeAreaView style={styles.safe} edges={["top"]}>
//       <StatusBar barStyle="light-content" />

//       {/* ── Header ── */}
//       <View style={styles.header}>
//         <View>
//           <Text style={styles.headerTitle}>Digital Tools</Text>
//           <Text style={styles.headerSub}>
//             {sections.length > 0
//               ? `${sections.length} categories`
//               : "Browse all tools"}
//           </Text>
//         </View>
//         <Pressable onPress={fetchData} style={styles.refreshBtn} hitSlop={10}>
//           <Ionicons
//             name="refresh-outline"
//             size={18}
//             color={COLORS.textSecondary}
//           />
//         </Pressable>
//       </View>

//       {/* ── Content ── */}
//       {loading ? (
//         <FlatList
//           data={[0, 1, 2, 3]}
//           keyExtractor={(i) => i.toString()}
//           renderItem={({ index }) => <SkeletonSection index={index} />}
//           contentContainerStyle={{ paddingTop: 20 }}
//           showsVerticalScrollIndicator={false}
//         />
//       ) : (
//         <SectionList
//           sections={sections}
//           keyExtractor={(item, index) => String(item.id) + index}
//           showsVerticalScrollIndicator={false}
//           stickySectionHeadersEnabled={false}
//           contentContainerStyle={styles.listContent}
//           renderItem={() => null}
//           renderSectionHeader={({ section }) => (
//             <View style={styles.sectionBlock}>
//               <SectionHeader
//                 title={section.title}
//                 count={section.data.length}
//                 onViewAll={() =>
//                   router.push({
//                     pathname: "../digitaltoolscontent",
//                     params: {
//                       stringData: JSON.stringify(section.data),
//                       title: section.title,
//                     },
//                   })
//                 }
//               />
//               <FlatList
//                 data={section.data}
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 keyExtractor={(item, i) => String(item.id) + i}
//                 renderItem={({ item, index }) => (
//                   <ToolCard
//                     item={item}
//                     index={index}
//                     onPress={() => setSelectedItem(item)}
//                   />
//                 )}
//                 contentContainerStyle={styles.horizontalList}
//                 ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
//               />
//             </View>
//           )}
//           ListEmptyComponent={
//             <View style={styles.emptyState}>
//               <Ionicons
//                 name="construct-outline"
//                 size={40}
//                 color={COLORS.textMuted}
//               />
//               <Text style={styles.emptyText}>No tools available</Text>
//               <Pressable onPress={fetchData} style={styles.retryBtn}>
//                 <Text style={styles.retryText}>Retry</Text>
//               </Pressable>
//             </View>
//           }
//         />
//       )}

//       <DetailSheet item={selectedItem} onClose={() => setSelectedItem(null)} />
//     </SafeAreaView>
//   );
// };

// // ─── Styles ───────────────────────────────────────────────────────────────────

// const styles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: COLORS.bg },

//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 20,
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.border,
//   },
//   headerTitle: {
//     fontSize: 22,
//     fontWeight: "800",
//     color: COLORS.textPrimary,
//     letterSpacing: -0.3,
//   },
//   headerSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
//   refreshBtn: {
//     width: 38,
//     height: 38,
//     borderRadius: 11,
//     backgroundColor: COLORS.surface,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   listContent: { paddingTop: 8, paddingBottom: 40 },
//   sectionBlock: { marginBottom: 8 },
//   sectionHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 20,
//     paddingTop: 20,
//     paddingBottom: 12,
//   },
//   sectionTitle: { fontSize: 15, fontWeight: "700", color: COLORS.textPrimary },
//   sectionCount: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
//   viewAllBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 3,
//     backgroundColor: COLORS.accentMuted,
//     borderWidth: 1,
//     borderColor: COLORS.accentBorder,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 20,
//   },
//   viewAllText: { fontSize: 12, fontWeight: "700", color: COLORS.accent },
//   horizontalList: { paddingHorizontal: 20, paddingBottom: 4 },

//   toolCard: {
//     width: 96,
//     backgroundColor: COLORS.surface,
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     padding: 10,
//     alignItems: "center",
//     justifyContent: "flex-start",
//     gap: 8,
//     minHeight: 118,
//   },
//   toolCardImageWrap: {
//     width: 48,
//     height: 48,
//     alignItems: "center",
//     justifyContent: "center",
//     borderRadius: 12,
//     overflow: "hidden",
//   },
//   toolCardImage: { width: 44, height: 44, borderRadius: 10 },
//   toolCardTitle: {
//     fontSize: 10,
//     fontWeight: "600",
//     color: COLORS.textSecondary,
//     textAlign: "center",
//     lineHeight: 14,
//   },

//   platformBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 3,
//     backgroundColor: COLORS.accentMuted,
//     borderWidth: 1,
//     borderColor: COLORS.accentBorder,
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 10,
//   },
//   platformBadgeText: { fontSize: 9, fontWeight: "700", color: COLORS.accent },

//   emptyState: { alignItems: "center", paddingVertical: 80, gap: 12 },
//   emptyText: { fontSize: 15, fontWeight: "600", color: COLORS.textSecondary },
//   retryBtn: {
//     paddingHorizontal: 20,
//     paddingVertical: 9,
//     borderRadius: 20,
//     backgroundColor: COLORS.accentMuted,
//     borderWidth: 1,
//     borderColor: COLORS.accentBorder,
//   },
//   retryText: { fontSize: 14, fontWeight: "700", color: COLORS.accent },

//   backdrop: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: "rgba(0,0,0,0.65)",
//   },
//   detailSheet: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     height: SCREEN_HEIGHT * 0.82,
//     backgroundColor: COLORS.surfaceElevated,
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     borderTopWidth: 1,
//     borderColor: COLORS.border,
//   },
//   sheetHandle: {
//     width: 36,
//     height: 4,
//     borderRadius: 2,
//     backgroundColor: COLORS.border,
//     alignSelf: "center",
//     marginTop: 12,
//     marginBottom: 4,
//   },
//   detailHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 14,
//     paddingHorizontal: 20,
//     paddingVertical: 14,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.border,
//   },
//   detailThumbnail: {
//     width: 56,
//     height: 56,
//     borderRadius: 14,
//     backgroundColor: COLORS.surface,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     alignItems: "center",
//     justifyContent: "center",
//     overflow: "hidden",
//   },
//   detailTitle: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: COLORS.textPrimary,
//     lineHeight: 22,
//   },
//   closeBtn: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: COLORS.surface,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   linkBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     marginHorizontal: 20,
//     marginVertical: 12,
//     backgroundColor: COLORS.accentMuted,
//     borderWidth: 1,
//     borderColor: COLORS.accentBorder,
//     borderRadius: 12,
//     paddingHorizontal: 14,
//     paddingVertical: 11,
//   },
//   linkBtnText: { fontSize: 14, fontWeight: "700", color: COLORS.accent },
// });

// export default DigitalTools;

import { useLanguage } from "@/context/LanguageContext";
import i18n from "@/i18n";
import {
  cacheImage,
  checkInternet,
  getCachedData,
  saveToCache,
} from "@/utils/offlineStorage";
import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  Pressable,
  SectionList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";
import { Service } from "../utils/service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WpLink {
  href: string;
  embeddable?: boolean;
  [key: string]: any;
}

interface ToolItem {
  id: number;
  link: string;
  title: { rendered: string };
  content: { rendered: string };
  class_list: string[]; // taxonomy + platform slugs live here
  "digital-tool-tax": number[];
  platform: number[];
  hub: number[];
  crop: number[];
  _links: {
    "wp:featuredmedia"?: WpLink[];
    [key: string]: WpLink[] | undefined;
  };
  // resolved client-side after fetching featured media
  thumbnailUri?: string;
}

interface Section {
  title: string;
  data: ToolItem[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const TAX_SLUG_PREFIX = "digital-tool-tax-";
const EXCLUDED_CATEGORY = "information-and-communication";

const COLORS = {
  bg: "#FFFFFF",
  surface: "#F8F9FA",
  surfaceElevated: "#FFFFFF",
  border: "#E5E5EA",
  accent: "#FF6B2B",
  accentMuted: "rgba(255,107,43,0.08)",
  accentBorder: "rgba(255,107,43,0.25)",
  textPrimary: "#1C1C1E",
  textSecondary: "#555555",
  textMuted: "#8E8E93",
  white: "#FFFFFF",
  text: "#1A1A1A",
};

const PALETTE = [
  "#FF6B6B",
  "#FF9F1C",
  "#6BCB77",
  "#4D96FF",
  "#9D4EDD",
  "#FF922B",
  "#38A3A5",
  "#F15BB5",
  "#00BBF9",
  "#FF66D8",
  "#8338EC",
  "#FFB703",
  "#06D6A0",
  "#EF476F",
  "#118AB2",
];

function getAvatarColor(name: string): string {
  const idx =
    (name.charCodeAt(0) + name.charCodeAt(name.length - 1)) % PALETTE.length;
  return PALETTE[idx];
}

// Turns "crop-management-and-agronomy" into "Crop Management and Agronomy"
function slugToTitle(slug: string): string {
  const smallWords = new Set(["and", "or", "of", "the", "a", "an", "in"]);
  return slug
    .split("-")
    .map((word, i) =>
      i > 0 && smallWords.has(word)
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

const LetterAvatar: React.FC<{ name: string; size: number }> = ({
  name,
  size,
}) => {
  const bg = getAvatarColor(name);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        backgroundColor: bg + "22",
        borderWidth: 1.5,
        borderColor: bg + "44",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: size * 0.42, fontWeight: "800", color: bg }}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
};

// ─── Platform badge ───────────────────────────────────────────────────────────

const PlatformBadge: React.FC<{ classList: string[] }> = ({ classList }) => {
  const isAndroid = classList.some((c) => c.includes("android"));
  const isWeb = classList.some((c) => c.includes("website"));
  const isIOS = classList.some((c) => c.includes("ios"));

  const tags: Array<{ icon: string; label: string }> = [];
  if (isAndroid) tags.push({ icon: "logo-android", label: "Android" });
  if (isIOS) tags.push({ icon: "logo-apple", label: "iOS" });
  if (isWeb) tags.push({ icon: "globe-outline", label: "Web" });

  if (tags.length === 0) return null;

  return (
    <View
      style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 5 }}
    >
      {tags.map((t) => (
        <View key={t.label} style={styles.platformBadge}>
          <Ionicons name={t.icon as any} size={9} color={COLORS.accent} />
          <Text style={styles.platformBadgeText}>{t.label}</Text>
        </View>
      ))}
    </View>
  );
};

// ─── ToolCard ─────────────────────────────────────────────────────────────────

const ToolCard: React.FC<{
  item: ToolItem;
  onPress: () => void;
  index: number;
}> = ({ item, onPress, index }) => {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 280,
        delay: Math.min(index * 50, 400),
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 280,
        delay: Math.min(index * 50, 400),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const imageUri = item.thumbnailUri ?? null;
  const name = item.title.rendered;

  return (
    <Animated.View
      style={{ opacity: fade, transform: [{ translateX: slide }] }}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.toolCard, pressed && { opacity: 0.75 }]}
      >
        <View style={styles.toolCardImageWrap}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.toolCardImage}
              resizeMode="contain"
            />
          ) : (
            <LetterAvatar name={name} size={44} />
          )}
        </View>
        <Text style={styles.toolCardTitle} numberOfLines={2}>
          {name}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader: React.FC<{
  title: string;
  count: number;
  onViewAll: () => void;
}> = ({ title, count, onViewAll }) => {
  const { language } = useLanguage();
  const toolLabel =
    count !== 1
      ? `${count} ${language ? i18n.t("digitalTools.tools") : "tools"}`
      : `1 ${language ? i18n.t("digitalTools.tool") : "tool"}`;

  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionCount}>{toolLabel}</Text>
      </View>
      <Pressable onPress={onViewAll} style={styles.viewAllBtn}>
        <Text style={styles.viewAllText}>
          {language ? i18n.t("digitalTools.viewAll") : "View all"}
        </Text>
        <Ionicons name="chevron-forward" size={12} color={COLORS.accent} />
      </Pressable>
    </View>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonSection: React.FC<{ index: number }> = ({ index }) => {
  const pulse = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.85,
          duration: 750,
          delay: index * 120,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.3,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={{ opacity: pulse, paddingHorizontal: 16, marginBottom: 28 }}
    >
      <View
        style={{
          width: 140,
          height: 13,
          borderRadius: 6,
          backgroundColor: "#E5E5EA",
          marginBottom: 6,
        }}
      />
      <View
        style={{
          width: 60,
          height: 10,
          borderRadius: 5,
          backgroundColor: "#E5E5EA",
          marginBottom: 14,
        }}
      />
      <View style={{ flexDirection: "row", gap: 10 }}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              width: 96,
              height: 120,
              borderRadius: 14,
              backgroundColor: COLORS.surface,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          />
        ))}
      </View>
    </Animated.View>
  );
};

// ─── Detail Sheet ─────────────────────────────────────────────────────────────

const DetailSheet: React.FC<{ item: ToolItem | null; onClose: () => void }> = ({
  item,
  onClose,
}) => {
  const { language } = useLanguage();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const visible = !!item;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : SCREEN_HEIGHT,
      useNativeDriver: true,
      tension: 60,
      friction: 11,
    }).start();
  }, [visible]);

  if (!item) return null;

  const name = item.title.rendered;
  const linkUrl = item.link;
  const imageUri = item.thumbnailUri ?? null;

  // Platform comes from class_list now — no separate download-link field.
  const isAndroid = item.class_list.some((c) => c.includes("android"));
  const isIOS = item.class_list.some((c) => c.includes("ios"));
  const isApp = isAndroid || isIOS;

  const linkLabel = language
    ? i18n.t(isApp ? "digitalTools.downloadApp" : "digitalTools.visitWebsite")
    : isApp
    ? "Download the app"
    : "Visit website";
  const linkIcon: any = isApp ? "cloud-download-outline" : "globe-outline";

  const htmlContent = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          * { box-sizing: border-box; }
          body { font-family: -apple-system, sans-serif; padding: 16px; margin: 0; background: #FFFFFF; color: #555555; font-size: 15px; line-height: 1.7; }
          img { max-width: 100%; height: auto; border-radius: 8px; }
          a { color: #FF6B2B; }
          h1,h2,h3 { color: #1C1C1E; font-weight: 700; }
          p { margin: 0 0 14px; }
        </style>
      </head>
      <body>${
        item.content?.rendered ||
        `<p>${
          language ? i18n.t("digitalTools.noContent") : "No content available."
        }</p>`
      }</body>
    </html>
  `;

  const handleLink = async () => {
    try {
      await Linking.openURL(linkUrl);
    } catch (e: any) {
      Alert.alert("", e.message);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View
        style={[styles.detailSheet, { transform: [{ translateY: slideAnim }] }]}
      >
        <View style={styles.sheetHandle} />

        <View style={styles.detailHeader}>
          <View style={styles.detailThumbnail}>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={{ width: 52, height: 52 }}
                resizeMode="contain"
              />
            ) : (
              <LetterAvatar name={name} size={52} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.detailTitle} numberOfLines={2}>
              {name}
            </Text>
            <PlatformBadge classList={item.class_list} />
          </View>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={12}>
            <Ionicons name="close" size={18} color={COLORS.textSecondary} />
          </Pressable>
        </View>

        <Pressable onPress={handleLink} style={styles.linkBtn}>
          <Ionicons name={linkIcon} size={16} color={COLORS.accent} />
          <Text style={styles.linkBtnText}>{linkLabel}</Text>
          <Ionicons
            name="open-outline"
            size={14}
            color={COLORS.accentBorder}
            style={{ marginLeft: "auto" }}
          />
        </Pressable>

        <WebView
          originWhitelist={["*"]}
          source={{ html: htmlContent }}
          style={{ flex: 1, backgroundColor: "#FFFFFF" }}
          javaScriptEnabled
          domStorageEnabled
        />
      </Animated.View>
    </Modal>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const DigitalTools: React.FC = () => {
  const router = useRouter();
  const { language } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedItem, setSelectedItem] = useState<ToolItem | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  // Resolve featured media thumbnail for a single item
  const resolveThumbnail = async (item: ToolItem): Promise<ToolItem> => {
    const mediaLink = item._links["wp:featuredmedia"]?.[0]?.href;
    if (!mediaLink) return item;
    try {
      const res = await fetch(mediaLink);
      const json = await res.json();
      const raw: string =
        json.source_url ??
        json.media_details?.sizes?.thumbnail?.source_url ??
        "";
      if (!raw) return item;
      const secure = raw.startsWith("http://")
        ? raw.replace("http://", "https://")
        : raw;
      return { ...item, thumbnailUri: encodeURI(secure) };
    } catch {
      return item;
    }
  };

  const processAndGroup = (items: ToolItem[]): Section[] => {
    const acc: Section[] = [];
    for (const item of items) {
      // Extract category slugs from class_list, e.g. "digital-tool-tax-crop-management-and-agronomy"
      const taxClasses = item.class_list.filter(
        (c) => c.startsWith(TAX_SLUG_PREFIX) && !c.includes(EXCLUDED_CATEGORY)
      );
      if (taxClasses.length === 0) {
        // Uncategorised — put in a catch-all
        let sec = acc.find((s) => s.title === "Other");
        if (!sec) {
          sec = { title: "Other", data: [] };
          acc.push(sec);
        }
        sec.data.push(item);
      } else {
        for (const cls of taxClasses) {
          const catTitle = slugToTitle(cls.replace(TAX_SLUG_PREFIX, ""));
          let sec = acc.find((s) => s.title === catTitle);
          if (!sec) {
            sec = { title: catTitle, data: [] };
            acc.push(sec);
          }
          sec.data.push(item);
        }
      }
    }
    return acc;
  };

  const fetchData = async () => {
    setLoading(true);
    const hasInternet = await checkInternet();
    try {
      if (hasInternet) {
        const res = await fetch(Service.Technology);
        if (res.ok) {
          const freshData: ToolItem[] = await res.json();

          // Group first so the UI can render immediately, then resolve
          // thumbnails lazily since each one needs its own fetch.
          setSections(processAndGroup(freshData));
          setLoading(false);

          const resolved = await Promise.all(
            freshData.map((item) => resolveThumbnail(item))
          );
          for (const item of resolved) {
            if (item.thumbnailUri) await cacheImage(item.thumbnailUri);
          }
          await saveToCache(resolved);
          setSections(processAndGroup(resolved));
          return;
        }
      }
      const cached = await getCachedData();
      if (cached) setSections(processAndGroup(cached));
    } catch (e) {
      const cached = await getCachedData();
      if (cached) setSections(processAndGroup(cached));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) =>
      setIsOffline(!state.isConnected)
    );
    return unsubscribe;
  }, []);

  const headerSub =
    sections.length > 0
      ? `${sections.length} ${
          language ? i18n.t("digitalTools.categories") : "categories"
        }`
      : language
      ? i18n.t("digitalTools.browseAll")
      : "Browse all tools";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerIconBtn}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>
            {language ? i18n.t("digitalTools.screenTitle") : "Digital Tools"}
          </Text>
          <Text style={styles.headerSub}>{headerSub}</Text>
        </View>
        <Pressable onPress={fetchData} style={styles.refreshBtn} hitSlop={10}>
          <Ionicons
            name="refresh-outline"
            size={18}
            color={COLORS.textSecondary}
          />
        </Pressable>
      </View>

      {/* Content */}
      {loading ? (
        <FlatList
          data={[0, 1, 2, 3]}
          keyExtractor={(i) => i.toString()}
          renderItem={({ index }) => <SkeletonSection index={index} />}
          contentContainerStyle={{ paddingTop: 20 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => String(item.id) + index}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.listContent}
          renderItem={() => null}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionBlock}>
              <SectionHeader
                title={section.title}
                count={section.data.length}
                onViewAll={() =>
                  router.push({
                    pathname: "../digitaltoolscontent",
                    params: {
                      stringData: JSON.stringify(section.data),
                      title: section.title,
                    },
                  })
                }
              />
              <FlatList
                data={section.data}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, i) => String(item.id) + i}
                renderItem={({ item, index }) => (
                  <ToolCard
                    item={item}
                    index={index}
                    onPress={() => setSelectedItem(item)}
                  />
                )}
                contentContainerStyle={styles.horizontalList}
                ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
              />
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="construct-outline"
                size={40}
                color={COLORS.textMuted}
              />
              <Text style={styles.emptyText}>
                {language
                  ? i18n.t("digitalTools.noTools")
                  : "No tools available"}
              </Text>
              <Pressable onPress={fetchData} style={styles.retryBtn}>
                <Text style={styles.retryText}>
                  {language ? i18n.t("digitalTools.retry") : "Retry"}
                </Text>
              </Pressable>
            </View>
          }
        />
      )}

      <DetailSheet item={selectedItem} onClose={() => setSelectedItem(null)} />
    </SafeAreaView>
  );
};

// ─── Styles (unchanged) ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  headerSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: { paddingTop: 8, paddingBottom: 40 },
  sectionBlock: { marginBottom: 8 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: COLORS.textPrimary },
  sectionCount: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: COLORS.accentMuted,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  viewAllText: { fontSize: 12, fontWeight: "700", color: COLORS.accent },
  horizontalList: { paddingHorizontal: 20, paddingBottom: 4 },
  toolCard: {
    width: 96,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 10,
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
    minHeight: 118,
  },
  toolCardImageWrap: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    overflow: "hidden",
  },
  toolCardImage: { width: 44, height: 44, borderRadius: 10 },
  toolCardTitle: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 14,
  },
  emptyState: { alignItems: "center", paddingVertical: 80, gap: 12 },
  emptyText: { fontSize: 15, fontWeight: "600", color: COLORS.textSecondary },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: COLORS.accentMuted,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
  },
  retryText: { fontSize: 14, fontWeight: "700", color: COLORS.accent },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  detailSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.82,
    backgroundColor: COLORS.surfaceElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D1D6",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailThumbnail: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  linkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    marginVertical: 12,
    backgroundColor: COLORS.accentMuted,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  linkBtnText: { fontSize: 14, fontWeight: "700", color: COLORS.accent },
  platformBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: COLORS.accentMuted,
    borderWidth: 1,
    borderColor: COLORS.accentBorder,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  platformBadgeText: { fontSize: 9, fontWeight: "700", color: COLORS.accent },
});

export default DigitalTools;
