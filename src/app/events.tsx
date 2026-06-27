// import { Ionicons } from "@expo/vector-icons";
// import { useNavigation, useRouter } from "expo-router";
// import moment from "moment";
// import React, { useCallback, useEffect, useRef, useState } from "react";
// import {
//   Alert,
//   Animated,
//   FlatList,
//   Modal,
//   Pressable,
//   StatusBar,
//   Text,
//   TouchableOpacity,
//   Vibration,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Service } from "../utils/service";

// // ─── Design Tokens ─────────────────────────────────────────────────────────────
// const COLORS = {
//   bg: "rgb(242, 242, 242)",
//   surface: "#FFFFFF",
//   surfaceElevated: "#F5F5F5",
//   border: "#E8E8E8",
//   accent: "#FF6B35",
//   accentSoft: "rgba(255,107,53,0.10)",
//   accentGlow: "rgba(255,107,53,0.06)",
//   text: "#1A1A1A",
//   textMuted: "#888899",
//   textDim: "#BBBBCC",
//   white: "#FFFFFF",
//   shadow: "rgba(0,0,0,0.07)",
// };

// // ─── Hub Filters ───────────────────────────────────────────────────────────────
// const HUBS = [
//   {
//     label: "All",
//     url: "https://iita.org/wp-json/wp/v2/ajde_events",
//     icon: "globe-outline",
//     short: "All Regions",
//   },
//   {
//     label: "Western Africa",
//     url: "https://iita.org/wp-json/wp/v2/ajde_events?filter[event_type]=western-africa",
//     icon: "location-outline",
//     short: "W. Africa Hub",
//   },
//   {
//     label: "Central Africa",
//     url: "https://iita.org/wp-json/wp/v2/ajde_events?filter[event_type]=central-africa",
//     icon: "location-outline",
//     short: "C. Africa Hub",
//   },
//   {
//     label: "Eastern Africa",
//     url: "https://iita.org/wp-json/wp/v2/ajde_events?filter[event_type]=eastern-africa",
//     icon: "location-outline",
//     short: "E. Africa Hub",
//   },
//   {
//     label: "Southern Africa",
//     url: "https://iita.org/wp-json/wp/v2/ajde_events?filter[event_type]=southern-africa",
//     icon: "location-outline",
//     short: "S. Africa Hub",
//   },
// ];

// // ─── Helpers ───────────────────────────────────────────────────────────────────
// const sortByDate = (arr: any) =>
//   [...arr].sort((a, b) => b.metadata.evcal_srow - a.metadata.evcal_srow);

// const getDaysUntil = (unixSeconds: any) => {
//   const diff = moment(unixSeconds * 1000).diff(moment(), "days");
//   if (diff === 0) return { label: "Today", color: COLORS.accent };
//   if (diff === 1) return { label: "Tomorrow", color: "#F59E0B" };
//   if (diff <= 7) return { label: `In ${diff} days`, color: "#10B981" };
//   return {
//     label: moment(unixSeconds * 1000).format("MMM D"),
//     color: COLORS.textMuted,
//   };
// };

// // ─── Event Card ────────────────────────────────────────────────────────────────
// const EventCard = ({ item, onPress, index }: any) => {
//   const scaleAnim = useRef(new Animated.Value(1)).current;
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const slideAnim = useRef(new Animated.Value(18)).current;

//   useEffect(() => {
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 320,
//         delay: index * 60,
//         useNativeDriver: true,
//       }),
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 320,
//         delay: index * 60,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   }, []);

//   const handlePressIn = () =>
//     Animated.spring(scaleAnim, {
//       toValue: 0.975,
//       useNativeDriver: true,
//       tension: 200,
//     }).start();
//   const handlePressOut = () =>
//     Animated.spring(scaleAnim, {
//       toValue: 1,
//       useNativeDriver: true,
//       tension: 200,
//     }).start();

//   const eventTitle = item.title?.rendered ?? "";
//   const hub = item.pure_taxonomies?.event_type?.[0]?.name;
//   const location = item.pure_taxonomies?.event_location?.[0];
//   const unixSec = item.metadata?.evcal_srow;
//   const badge = getDaysUntil(unixSec);

//   return (
//     <Animated.View
//       style={{
//         opacity: fadeAnim,
//         transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
//         marginBottom: 12,
//       }}
//     >
//       <TouchableOpacity
//         activeOpacity={1}
//         onPress={onPress}
//         onPressIn={handlePressIn}
//         onPressOut={handlePressOut}
//         style={{
//           backgroundColor: COLORS.surface,
//           borderRadius: 16,
//           overflow: "hidden",
//           shadowColor: COLORS.shadow,
//           shadowOffset: { width: 0, height: 2 },
//           shadowOpacity: 1,
//           shadowRadius: 8,
//           elevation: 3,
//         }}
//       >
//         {/* Orange left accent bar */}
//         <View
//           style={{
//             position: "absolute",
//             left: 0,
//             top: 0,
//             bottom: 0,
//             width: 4,
//             backgroundColor: COLORS.accent,
//             borderTopLeftRadius: 16,
//             borderBottomLeftRadius: 16,
//           }}
//         />

//         <View
//           style={{ paddingLeft: 20, paddingRight: 16, paddingVertical: 16 }}
//         >
//           {/* Top row: badge + chevron */}
//           <View
//             style={{
//               flexDirection: "row",
//               justifyContent: "space-between",
//               alignItems: "center",
//               marginBottom: 8,
//             }}
//           >
//             <View
//               style={{
//                 flexDirection: "row",
//                 alignItems: "center",
//                 backgroundColor: COLORS.accentSoft,
//                 paddingHorizontal: 10,
//                 paddingVertical: 4,
//                 borderRadius: 20,
//                 gap: 5,
//               }}
//             >
//               <Ionicons
//                 name="calendar-outline"
//                 size={12}
//                 color={COLORS.accent}
//               />
//               <Text
//                 style={{
//                   color: COLORS.accent,
//                   fontSize: 11,
//                   fontWeight: "700",
//                   letterSpacing: 0.3,
//                 }}
//               >
//                 {badge.label}
//               </Text>
//             </View>

//             {hub && (
//               <View
//                 style={{
//                   flexDirection: "row",
//                   alignItems: "center",
//                   backgroundColor: COLORS.surfaceElevated,
//                   paddingHorizontal: 9,
//                   paddingVertical: 4,
//                   borderRadius: 20,
//                   gap: 4,
//                 }}
//               >
//                 <Ionicons
//                   name="radio-button-on"
//                   size={8}
//                   color={COLORS.textMuted}
//                 />
//                 <Text
//                   style={{
//                     color: COLORS.textMuted,
//                     fontSize: 11,
//                     fontWeight: "600",
//                   }}
//                 >
//                   {hub}
//                 </Text>
//               </View>
//             )}
//           </View>

//           {/* Title */}
//           <Text
//             numberOfLines={2}
//             style={{
//               color: COLORS.text,
//               fontSize: 15,
//               fontWeight: "700",
//               lineHeight: 21,
//               letterSpacing: 0.1,
//               marginBottom: 10,
//             }}
//           >
//             {eventTitle}
//           </Text>

//           {/* Footer row */}
//           <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
//             {unixSec && (
//               <View
//                 style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
//               >
//                 <Ionicons
//                   name="time-outline"
//                   size={13}
//                   color={COLORS.textMuted}
//                 />
//                 <Text
//                   style={{
//                     color: COLORS.textMuted,
//                     fontSize: 12,
//                     fontWeight: "500",
//                   }}
//                 >
//                   {moment(unixSec * 1000).format("MMM D, YYYY")}
//                 </Text>
//               </View>
//             )}

//             {location && (
//               <View
//                 style={{
//                   flexDirection: "row",
//                   alignItems: "center",
//                   gap: 5,
//                   flex: 1,
//                 }}
//               >
//                 <Ionicons
//                   name="location-outline"
//                   size={13}
//                   color={COLORS.textMuted}
//                 />
//                 <Text
//                   numberOfLines={1}
//                   style={{
//                     color: COLORS.textMuted,
//                     fontSize: 12,
//                     fontWeight: "500",
//                     flex: 1,
//                   }}
//                 >
//                   {location.description ? `${location.description}, ` : ""}
//                   {location.name}
//                 </Text>
//               </View>
//             )}

//             <Ionicons name="chevron-forward" size={16} color={COLORS.accent} />
//           </View>
//         </View>
//       </TouchableOpacity>
//     </Animated.View>
//   );
// };

// // ─── Filter Bottom Sheet ───────────────────────────────────────────────────────
// const FilterSheet = ({ visible, onClose, activeUrl, onSelect }: any) => {
//   const slideAnim = useRef(new Animated.Value(500)).current;

//   useEffect(() => {
//     Animated.spring(slideAnim, {
//       toValue: visible ? 0 : 500,
//       useNativeDriver: true,
//       tension: 68,
//       friction: 12,
//     }).start();
//   }, [visible]);

//   if (!visible) return null;

//   return (
//     <Modal
//       visible={visible}
//       transparent
//       animationType="none"
//       statusBarTranslucent
//     >
//       <Pressable
//         style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }}
//         onPress={onClose}
//       >
//         <Animated.View
//           style={{
//             position: "absolute",
//             bottom: 0,
//             left: 0,
//             right: 0,
//             backgroundColor: COLORS.surface,
//             borderTopLeftRadius: 24,
//             borderTopRightRadius: 24,
//             transform: [{ translateY: slideAnim }],
//             shadowColor: "#000",
//             shadowOpacity: 0.12,
//             shadowRadius: 20,
//             elevation: 25,
//             paddingBottom: 32,
//           }}
//         >
//           <Pressable onPress={(e) => e.stopPropagation()}>
//             {/* Drag handle */}
//             <View
//               style={{ alignItems: "center", paddingTop: 14, paddingBottom: 4 }}
//             >
//               <View
//                 style={{
//                   width: 36,
//                   height: 4,
//                   borderRadius: 2,
//                   backgroundColor: COLORS.border,
//                 }}
//               />
//             </View>

//             {/* Header */}
//             <View
//               style={{
//                 flexDirection: "row",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 paddingHorizontal: 20,
//                 paddingVertical: 14,
//                 borderBottomWidth: 1,
//                 borderBottomColor: COLORS.border,
//                 marginBottom: 6,
//               }}
//             >
//               <View>
//                 <Text
//                   style={{
//                     color: COLORS.text,
//                     fontSize: 18,
//                     fontWeight: "800",
//                   }}
//                 >
//                   Filter by Hub
//                 </Text>
//                 <Text
//                   style={{
//                     color: COLORS.textMuted,
//                     fontSize: 13,
//                     marginTop: 2,
//                   }}
//                 >
//                   {HUBS.find((h) => h.url === activeUrl)?.label ??
//                     "All regions"}
//                 </Text>
//               </View>
//               <TouchableOpacity
//                 onPress={onClose}
//                 style={{
//                   width: 36,
//                   height: 36,
//                   borderRadius: 10,
//                   backgroundColor: COLORS.surfaceElevated,
//                   justifyContent: "center",
//                   alignItems: "center",
//                 }}
//               >
//                 <Ionicons name="close" size={20} color={COLORS.text} />
//               </TouchableOpacity>
//             </View>

//             {/* Options */}
//             <View style={{ paddingHorizontal: 16, gap: 8 }}>
//               {HUBS.map((hub: any, i: number) => {
//                 const isActive = activeUrl === hub.url;
//                 return (
//                   <TouchableOpacity
//                     key={i}
//                     onPress={() => {
//                       onSelect(hub.url);
//                       onClose();
//                     }}
//                     activeOpacity={0.7}
//                     style={{
//                       flexDirection: "row",
//                       alignItems: "center",
//                       gap: 12,
//                       paddingVertical: 14,
//                       paddingHorizontal: 16,
//                       borderRadius: 14,
//                       borderWidth: 1.5,
//                       borderColor: isActive ? COLORS.accent : COLORS.border,
//                       backgroundColor: isActive
//                         ? COLORS.accentSoft
//                         : COLORS.surface,
//                       marginBottom: 4,
//                     }}
//                   >
//                     <View
//                       style={{
//                         width: 36,
//                         height: 36,
//                         borderRadius: 10,
//                         backgroundColor: isActive
//                           ? COLORS.accent
//                           : COLORS.surfaceElevated,
//                         justifyContent: "center",
//                         alignItems: "center",
//                       }}
//                     >
//                       <Ionicons
//                         name={hub.icon}
//                         size={18}
//                         color={isActive ? COLORS.white : COLORS.textMuted}
//                       />
//                     </View>

//                     <Text
//                       style={{
//                         flex: 1,
//                         fontSize: 15,
//                         fontWeight: isActive ? "700" : "500",
//                         color: isActive ? COLORS.accent : COLORS.text,
//                         letterSpacing: 0.1,
//                       }}
//                     >
//                       {hub.label}
//                     </Text>

//                     {isActive && (
//                       <View
//                         style={{
//                           width: 22,
//                           height: 22,
//                           borderRadius: 11,
//                           backgroundColor: COLORS.accent,
//                           justifyContent: "center",
//                           alignItems: "center",
//                         }}
//                       >
//                         <Ionicons
//                           name="checkmark"
//                           size={13}
//                           color={COLORS.white}
//                         />
//                       </View>
//                     )}
//                   </TouchableOpacity>
//                 );
//               })}
//             </View>
//           </Pressable>
//         </Animated.View>
//       </Pressable>
//     </Modal>
//   );
// };

// // ─── Header ────────────────────────────────────────────────────────────────────
// const Header = ({ onBack, onFilter, activeUrl }: any) => {
//   const isFiltered = activeUrl !== HUBS[0].url;
//   const activeHub = HUBS.find((h) => h.url === activeUrl);

//   return (
//     <View
//       style={{
//         flexDirection: "row",
//         alignItems: "center",
//         paddingHorizontal: 16,
//         paddingVertical: 12,
//         borderBottomWidth: 1,
//         borderBottomColor: COLORS.border,
//         backgroundColor: COLORS.bg,
//         gap: 12,
//       }}
//     >
//       <TouchableOpacity
//         onPress={onBack}
//         style={{
//           width: 38,
//           height: 38,
//           borderRadius: 10,
//           backgroundColor: COLORS.surface,
//           justifyContent: "center",
//           alignItems: "center",
//           shadowColor: COLORS.shadow,
//           shadowOpacity: 1,
//           shadowRadius: 4,
//           elevation: 2,
//         }}
//       >
//         <Ionicons name="arrow-back" size={20} color={COLORS.text} />
//       </TouchableOpacity>

//       <View style={{ flex: 1 }}>
//         <Text
//           style={{
//             color: COLORS.text,
//             fontSize: 18,
//             fontWeight: "800",
//             letterSpacing: -0.3,
//           }}
//         >
//           Events
//         </Text>
//         {isFiltered && (
//           <Text
//             style={{
//               color: COLORS.accent,
//               fontSize: 11,
//               fontWeight: "600",
//               letterSpacing: 0.5,
//             }}
//           >
//             {activeHub?.short?.toUpperCase()}
//           </Text>
//         )}
//       </View>

//       <TouchableOpacity
//         onPress={onFilter}
//         style={{
//           flexDirection: "row",
//           alignItems: "center",
//           gap: 6,
//           paddingHorizontal: 14,
//           paddingVertical: 9,
//           borderRadius: 10,
//           backgroundColor: isFiltered ? COLORS.accentSoft : COLORS.surface,
//           borderWidth: 1.5,
//           borderColor: isFiltered ? COLORS.accent : COLORS.border,
//           shadowColor: COLORS.shadow,
//           shadowOpacity: 1,
//           shadowRadius: 4,
//           elevation: 2,
//         }}
//       >
//         <Ionicons
//           name="options-outline"
//           size={17}
//           color={isFiltered ? COLORS.accent : COLORS.text}
//         />
//         <Text
//           style={{
//             fontSize: 13,
//             fontWeight: "700",
//             color: isFiltered ? COLORS.accent : COLORS.text,
//           }}
//         >
//           Filter
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// // ─── Empty State ───────────────────────────────────────────────────────────────
// const EmptyState = () => (
//   <View
//     style={{
//       flex: 1,
//       justifyContent: "center",
//       alignItems: "center",
//       paddingBottom: 60,
//     }}
//   >
//     <View
//       style={{
//         width: 80,
//         height: 80,
//         borderRadius: 24,
//         backgroundColor: COLORS.accentSoft,
//         justifyContent: "center",
//         alignItems: "center",
//         marginBottom: 16,
//       }}
//     >
//       <Ionicons name="calendar-outline" size={36} color={COLORS.accent} />
//     </View>
//     <Text
//       style={{
//         color: COLORS.text,
//         fontSize: 17,
//         fontWeight: "700",
//         marginBottom: 6,
//       }}
//     >
//       No Upcoming Events
//     </Text>
//     <Text
//       style={{
//         color: COLORS.textMuted,
//         fontSize: 14,
//         textAlign: "center",
//         paddingHorizontal: 40,
//       }}
//     >
//       There are no scheduled events for this hub right now. Check back soon.
//     </Text>
//   </View>
// );

// // ─── Loading Skeleton ──────────────────────────────────────────────────────────
// const SkeletonCard = () => {
//   const pulseAnim = useRef(new Animated.Value(0.4)).current;

//   useEffect(() => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(pulseAnim, {
//           toValue: 1,
//           duration: 700,
//           useNativeDriver: true,
//         }),
//         Animated.timing(pulseAnim, {
//           toValue: 0.4,
//           duration: 700,
//           useNativeDriver: true,
//         }),
//       ])
//     ).start();
//   }, []);

//   return (
//     <Animated.View
//       style={{
//         opacity: pulseAnim,
//         backgroundColor: COLORS.surface,
//         borderRadius: 16,
//         padding: 16,
//         paddingLeft: 20,
//         marginBottom: 12,
//         borderLeftWidth: 4,
//         borderLeftColor: COLORS.border,
//       }}
//     >
//       <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
//         <View
//           style={{
//             width: 72,
//             height: 22,
//             borderRadius: 11,
//             backgroundColor: COLORS.surfaceElevated,
//           }}
//         />
//         <View
//           style={{
//             width: 90,
//             height: 22,
//             borderRadius: 11,
//             backgroundColor: COLORS.surfaceElevated,
//           }}
//         />
//       </View>
//       <View
//         style={{
//           height: 16,
//           borderRadius: 8,
//           backgroundColor: COLORS.surfaceElevated,
//           marginBottom: 6,
//           width: "88%",
//         }}
//       />
//       <View
//         style={{
//           height: 16,
//           borderRadius: 8,
//           backgroundColor: COLORS.surfaceElevated,
//           width: "55%",
//         }}
//       />
//       <View
//         style={{
//           height: 14,
//           borderRadius: 7,
//           backgroundColor: COLORS.surfaceElevated,
//           width: "65%",
//           marginTop: 12,
//         }}
//       />
//     </Animated.View>
//   );
// };

// // ─── Main Screen ───────────────────────────────────────────────────────────────
// const Events = () => {
//   const navigation = useNavigation();
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);
//   const [eventLists, setEventLists] = useState<any>([]);
//   const [eventType, setEventType] = useState(Service.eventsUrl ?? HUBS[0].url);
//   const [filterVisible, setFilterVisible] = useState(false);

//   const sortByStartDate = useCallback(
//     (arr: any) =>
//       [...arr].sort((a, b) => a.metadata.evcal_srow - b.metadata.evcal_srow),
//     []
//   );

//   const fetchEvents = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const response = await fetch(eventType);
//       const json = await response.json();
//       const now = Math.round(Date.now() / 1000);
//       const upcoming = sortByStartDate(
//         json.filter((el: any) => el.metadata?.evcal_srow >= now)
//       );
//       setEventLists(upcoming);
//     } catch (error) {
//       Vibration.vibrate();
//       Alert.alert(
//         "Connection Error",
//         "Please check your internet connection and try again.",
//         [
//           {
//             text: "Cancel",
//             onPress: () => navigation.goBack(),
//             style: "cancel",
//           },
//           { text: "Retry", onPress: fetchEvents },
//         ],
//         { cancelable: false }
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   }, [eventType]);

//   useEffect(() => {
//     fetchEvents();
//   }, [eventType]);

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
//       <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

//       <Header
//         onBack={() => navigation.goBack()}
//         onFilter={() => setFilterVisible(true)}
//         activeUrl={eventType}
//       />

//       {isLoading ? (
//         <View style={{ flex: 1, padding: 16, paddingTop: 20 }}>
//           {[...Array(5)].map((_, i) => (
//             <SkeletonCard key={i} />
//           ))}
//         </View>
//       ) : eventLists.length === 0 ? (
//         <EmptyState />
//       ) : (
//         <FlatList
//           data={eventLists}
//           keyExtractor={(item, index) =>
//             `${item?.id?.toString()}-${item?.title?.rendered ?? ""}-${index}`
//           }
//           contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
//           renderItem={({ item, index }) => (
//             <EventCard
//               item={item}
//               index={index}
//               onPress={() =>
//                 router.push({
//                   pathname: "/eventscontent",
//                   params: {
//                     id: item.id,
//                     title: item.title?.rendered,
//                     content: item.content?.rendered,
//                     link: item.link,
//                   },
//                 })
//               }
//             />
//           )}
//           showsVerticalScrollIndicator={false}
//         />
//       )}

//       <FilterSheet
//         visible={filterVisible}
//         onClose={() => setFilterVisible(false)}
//         activeUrl={eventType}
//         onSelect={setEventType}
//       />
//     </SafeAreaView>
//   );
// };

// export default Events;

import { useLanguage } from "@/context/LanguageContext";
import i18n from "@/i18n";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Service } from "../utils/service";

// ─── Translations ──────────────────────────────────────────────────────────────
// Add these keys to your i18n translation files (en, yo, ha, ig, fr, sw, pt)
//
// events: {
//   screenTitle, upcoming, past, filterByHub, allRegions,
//   today, tomorrow, inNDays, noUpcomingTitle, noUpcomingBody,
//   noPastTitle, noPastBody, connectionError, checkConnection,
//   retry, cancel, filter, checkBackSoon, daysAgo, yesterday
// }
//
// English reference:
// screenTitle:     "Events"
// upcoming:        "Upcoming"
// past:            "Past"
// filterByHub:     "Filter by Hub"
// allRegions:      "All regions"
// today:           "Today"
// tomorrow:        "Tomorrow"
// inNDays:         "In {{count}} days"      (replace {{count}} in code)
// yesterday:       "Yesterday"
// daysAgo:         "{{count}} days ago"     (replace {{count}} in code)
// noUpcomingTitle: "No Upcoming Events"
// noUpcomingBody:  "No scheduled events for this hub right now. Check back soon."
// noPastTitle:     "No Past Events"
// noPastBody:      "Past events will appear here once they conclude."
// connectionError: "Connection Error"
// checkConnection: "Please check your internet connection and try again."
// retry:           "Retry"
// cancel:          "Cancel"
// filter:          "Filter"
// checkBackSoon:   "Check back soon"

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: "rgb(242, 242, 242)",
  surface: "#FFFFFF",
  elevated: "#F5F5F5",
  border: "#E8E8E8",
  accent: "#FF6B35",
  accentSoft: "rgba(255,107,53,0.10)",
  accentGlow: "rgba(255,107,53,0.06)",
  green: "#10B981",
  greenSoft: "rgba(16,185,129,0.10)",
  amber: "#F59E0B",
  amberSoft: "rgba(245,158,11,0.10)",
  muted: "#888899",
  dim: "#BBBBCC",
  text: "#1A1A1A",
  white: "#FFFFFF",
  pastOverlay: "rgba(136,136,153,0.08)",
};

const { width: SW } = Dimensions.get("window");

// ─── Hub Filters ───────────────────────────────────────────────────────────────
const HUBS = [
  {
    label: "All",
    labelKey: "events.allRegions",
    url: "https://iita.org/wp-json/wp/v2/ajde_events",
    icon: "globe-outline",
    short: "All Regions",
  },
  {
    label: "Western Africa",
    labelKey: "events.westernAfrica",
    url: "https://iita.org/wp-json/wp/v2/ajde_events?filter[event_type]=western-africa",
    icon: "location-outline",
    short: "W. Africa Hub",
  },
  {
    label: "Central Africa",
    labelKey: "events.centralAfrica",
    url: "https://iita.org/wp-json/wp/v2/ajde_events?filter[event_type]=central-africa",
    icon: "location-outline",
    short: "C. Africa Hub",
  },
  {
    label: "Eastern Africa",
    labelKey: "events.easternAfrica",
    url: "https://iita.org/wp-json/wp/v2/ajde_events?filter[event_type]=eastern-africa",
    icon: "location-outline",
    short: "E. Africa Hub",
  },
  {
    label: "Southern Africa",
    labelKey: "events.southernAfrica",
    url: "https://iita.org/wp-json/wp/v2/ajde_events?filter[event_type]=southern-africa",
    icon: "location-outline",
    short: "S. Africa Hub",
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const getBadge = (unixSec: number, isPast: boolean) => {
  const diff = moment(unixSec * 1000).diff(moment(), "days");
  if (isPast) {
    const ago = moment().diff(moment(unixSec * 1000), "days");
    if (ago === 0)
      return {
        label: i18n.t("events.yesterday"),
        color: C.muted,
        bg: C.elevated,
      };
    if (ago === 1)
      return {
        label: i18n.t("events.yesterday"),
        color: C.muted,
        bg: C.elevated,
      };
    return {
      label: `${ago} ${i18n.t("events.daysAgo")}`,
      color: C.muted,
      bg: C.elevated,
    };
  }
  if (diff === 0)
    return { label: i18n.t("events.today"), color: C.accent, bg: C.accentSoft };
  if (diff === 1)
    return {
      label: i18n.t("events.tomorrow"),
      color: C.amber,
      bg: C.amberSoft,
    };
  if (diff <= 7)
    return {
      label: `${i18n.t("events.inDays").replace("{{count}}", String(diff))}`,
      color: C.green,
      bg: C.greenSoft,
    };
  return {
    label: moment(unixSec * 1000).format("MMM D"),
    color: C.muted,
    bg: C.elevated,
  };
};

// ─── Event Card ────────────────────────────────────────────────────────────────
const EventCard = ({ item, onPress, index, isPast }: any) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 340,
        delay: Math.min(index * 55, 420),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 340,
        delay: Math.min(index * 55, 420),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onPressIn = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.975,
      useNativeDriver: true,
      tension: 200,
    }).start();
  const onPressOut = () =>
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
    }).start();

  const title = item.title?.rendered ?? "";
  const hub = item.pure_taxonomies?.event_type?.[0]?.name;
  const location = item.pure_taxonomies?.event_location?.[0];
  const unixSec = item.metadata?.evcal_srow;
  const badge = getBadge(unixSec, isPast);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
        marginBottom: 12,
      }}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={{
          backgroundColor: isPast ? C.elevated : C.surface,
          borderRadius: 16,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isPast ? 0.03 : 0.06,
          shadowRadius: 8,
          elevation: isPast ? 1 : 3,
          opacity: isPast ? 0.82 : 1,
        }}
      >
        {/* Left accent bar — solid orange for upcoming, dashed-look muted for past */}
        <View
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            backgroundColor: isPast ? C.dim : C.accent,
            borderTopLeftRadius: 16,
            borderBottomLeftRadius: 16,
          }}
        />

        <View
          style={{ paddingLeft: 20, paddingRight: 16, paddingVertical: 16 }}
        >
          {/* Top row */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: badge.bg,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 20,
                gap: 5,
              }}
            >
              <Ionicons
                name={isPast ? "time-outline" : "calendar-outline"}
                size={12}
                color={badge.color}
              />
              <Text
                style={{
                  color: badge.color,
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 0.3,
                }}
              >
                {badge.label}
              </Text>
            </View>

            {hub && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: C.elevated,
                  paddingHorizontal: 9,
                  paddingVertical: 4,
                  borderRadius: 20,
                  gap: 4,
                }}
              >
                <Ionicons name="radio-button-on" size={8} color={C.muted} />
                <Text
                  style={{ color: C.muted, fontSize: 11, fontWeight: "600" }}
                >
                  {hub}
                </Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text
            numberOfLines={2}
            style={{
              color: isPast ? C.muted : C.text,
              fontSize: 15,
              fontWeight: "700",
              lineHeight: 21,
              letterSpacing: 0.1,
              marginBottom: 10,
            }}
          >
            {title}
          </Text>

          {/* Footer */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            {unixSec && (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
              >
                <Ionicons name="time-outline" size={13} color={C.muted} />
                <Text
                  style={{ color: C.muted, fontSize: 12, fontWeight: "500" }}
                >
                  {moment(unixSec * 1000).format("MMM D, YYYY")}
                </Text>
              </View>
            )}
            {location && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  flex: 1,
                }}
              >
                <Ionicons name="location-outline" size={13} color={C.muted} />
                <Text
                  numberOfLines={1}
                  style={{
                    color: C.muted,
                    fontSize: 12,
                    fontWeight: "500",
                    flex: 1,
                  }}
                >
                  {location.description ? `${location.description}, ` : ""}
                  {location.name}
                </Text>
              </View>
            )}
            <Ionicons
              name="chevron-forward"
              size={16}
              color={isPast ? C.dim : C.accent}
            />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Tab Bar ───────────────────────────────────────────────────────────────────
const TabBar = ({ activeTab, onTabChange, upcomingCount, pastCount }: any) => {
  const { language } = useLanguage();
  const indicatorX = useRef(new Animated.Value(0)).current;
  const TAB_W = (SW - 32) / 2;

  const switchTab = (tab: "upcoming" | "past") => {
    Animated.spring(indicatorX, {
      toValue: tab === "upcoming" ? 0 : TAB_W,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
    onTabChange(tab);
  };

  return (
    <View style={{ marginHorizontal: 16, marginTop: 14, marginBottom: 4 }}>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: C.elevated,
          borderRadius: 14,
          padding: 4,
          position: "relative",
        }}
      >
        {/* Sliding pill */}
        <Animated.View
          style={{
            position: "absolute",
            top: 4,
            left: 4,
            width: TAB_W,
            height: 40,
            backgroundColor: C.surface,
            borderRadius: 10,
            shadowColor: "#000",
            shadowOpacity: 0.07,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
            transform: [{ translateX: indicatorX }],
          }}
        />

        {[
          {
            key: "upcoming",
            labelKey: "events.upcoming",
            count: upcomingCount,
            icon: "calendar-outline",
          },
          {
            key: "past",
            labelKey: "events.past",
            count: pastCount,
            icon: "archive-outline",
          },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => switchTab(tab.key as any)}
              activeOpacity={0.8}
              style={{
                flex: 1,
                height: 40,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                zIndex: 1,
              }}
            >
              <Ionicons
                name={tab.icon as any}
                size={15}
                color={isActive ? C.accent : C.muted}
              />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? "700" : "500",
                  color: isActive ? C.accent : C.muted,
                }}
              >
                {language && i18n.t(tab.labelKey)}
              </Text>
              {tab.count > 0 && (
                <View
                  style={{
                    backgroundColor: isActive ? C.accentSoft : C.border,
                    borderRadius: 10,
                    paddingHorizontal: 6,
                    paddingVertical: 1,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "700",
                      color: isActive ? C.accent : C.muted,
                    }}
                  >
                    {tab.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// ─── Filter Bottom Sheet ───────────────────────────────────────────────────────
const FilterSheet = ({ visible, onClose, activeUrl, onSelect }: any) => {
  const { language } = useLanguage();
  const slideAnim = useRef(new Animated.Value(500)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: visible ? 0 : 500,
        useNativeDriver: true,
        tension: 68,
        friction: 12,
      }),
      Animated.timing(backdropAnim, {
        toValue: visible ? 1 : 0,
        useNativeDriver: true,
        duration: 220,
      }),
    ]).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Pressable style={{ flex: 1 }} onPress={onClose}>
        <Animated.View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.35)",
            opacity: backdropAnim,
          }}
        >
          <Animated.View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: C.surface,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              transform: [{ translateY: slideAnim }],
              shadowColor: "#000",
              shadowOpacity: 0.12,
              shadowRadius: 20,
              elevation: 25,
              paddingBottom: Platform.OS === "ios" ? 36 : 28,
            }}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              {/* Handle */}
              <View
                style={{
                  alignItems: "center",
                  paddingTop: 14,
                  paddingBottom: 4,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: C.border,
                  }}
                />
              </View>

              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingHorizontal: 20,
                  paddingVertical: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: C.border,
                  marginBottom: 6,
                }}
              >
                <View>
                  <Text
                    style={{ color: C.text, fontSize: 18, fontWeight: "800" }}
                  >
                    {language && i18n.t("events.filterByHub")}
                  </Text>
                  <Text style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>
                    {HUBS.find((h) => h.url === activeUrl)?.label ??
                      i18n.t("events.allRegions")}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    backgroundColor: C.elevated,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="close" size={20} color={C.text} />
                </TouchableOpacity>
              </View>

              {/* Hub options */}
              <SafeAreaView style={{ paddingHorizontal: 16, gap: 8 }}>
                <ScrollView style={{ flex: 1 }}>
                  {HUBS.map((hub, i) => {
                    const isActive = activeUrl === hub.url;
                    return (
                      <TouchableOpacity
                        key={i}
                        onPress={() => {
                          onSelect(hub.url);
                          onClose();
                        }}
                        activeOpacity={0.7}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 12,
                          paddingVertical: 14,
                          paddingHorizontal: 16,
                          borderRadius: 14,
                          borderWidth: 1.5,
                          borderColor: isActive ? C.accent : C.border,
                          backgroundColor: isActive ? C.accentSoft : C.surface,
                          marginBottom: 4,
                        }}
                      >
                        <View
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            backgroundColor: isActive ? C.accent : C.elevated,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Ionicons
                            name={hub.icon as any}
                            size={18}
                            color={isActive ? C.white : C.muted}
                          />
                        </View>
                        <Text
                          style={{
                            flex: 1,
                            fontSize: 15,
                            fontWeight: isActive ? "700" : "500",
                            color: isActive ? C.accent : C.text,
                          }}
                        >
                          {language && i18n.t(hub.labelKey)}
                        </Text>
                        {isActive && (
                          <View
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 11,
                              backgroundColor: C.accent,
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <Ionicons
                              name="checkmark"
                              size={13}
                              color={C.white}
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </SafeAreaView>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

// ─── Header ────────────────────────────────────────────────────────────────────
const Header = ({ onBack, onFilter, activeUrl }: any) => {
  const { language } = useLanguage();
  const isFiltered = activeUrl !== HUBS[0].url;
  const activeHub = HUBS.find((h) => h.url === activeUrl);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
        backgroundColor: C.bg,
        gap: 12,
      }}
    >
      <TouchableOpacity
        onPress={onBack}
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          backgroundColor: C.surface,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Ionicons name="arrow-back" size={20} color={C.text} />
      </TouchableOpacity>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: C.text,
            fontSize: 18,
            fontWeight: "800",
            letterSpacing: -0.3,
          }}
        >
          {language && i18n.t("events.screenTitle")}
        </Text>
        {isFiltered && (
          <Text
            style={{
              color: C.accent,
              fontSize: 11,
              fontWeight: "600",
              letterSpacing: 0.5,
            }}
          >
            {activeHub?.short?.toUpperCase()}
          </Text>
        )}
      </View>

      <TouchableOpacity
        onPress={onFilter}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingHorizontal: 14,
          paddingVertical: 9,
          borderRadius: 10,
          backgroundColor: isFiltered ? C.accentSoft : C.surface,
          borderWidth: 1.5,
          borderColor: isFiltered ? C.accent : C.border,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Ionicons
          name="options-outline"
          size={17}
          color={isFiltered ? C.accent : C.text}
        />
        <Text
          style={{
            fontSize: 13,
            fontWeight: "700",
            color: isFiltered ? C.accent : C.text,
          }}
        >
          {language && i18n.t("events.filter")}
        </Text>
        {isFiltered && (
          <View
            style={{
              width: 7,
              height: 7,
              borderRadius: 3.5,
              backgroundColor: C.accent,
            }}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

// ─── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = ({ isPast }: { isPast: boolean }) => {
  const { language } = useLanguage();
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -8,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 80,
      }}
    >
      <Animated.View
        style={{
          transform: [{ translateY: bounceAnim }],
          width: 80,
          height: 80,
          borderRadius: 24,
          backgroundColor: isPast ? C.elevated : C.accentSoft,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <Ionicons
          name={isPast ? "archive-outline" : "calendar-outline"}
          size={36}
          color={isPast ? C.muted : C.accent}
        />
      </Animated.View>
      <Text
        style={{
          color: C.text,
          fontSize: 17,
          fontWeight: "700",
          marginBottom: 8,
        }}
      >
        {language &&
          i18n.t(isPast ? "events.noPastTitle" : "events.noUpcomingTitle")}
      </Text>
      <Text
        style={{
          color: C.muted,
          fontSize: 14,
          textAlign: "center",
          paddingHorizontal: 40,
          lineHeight: 20,
        }}
      >
        {language &&
          i18n.t(isPast ? "events.noPastBody" : "events.noUpcomingBody")}
      </Text>
    </View>
  );
};

// ─── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonCard = ({ index }: { index: number }) => {
  const pulse = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 750,
          delay: index * 80,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View
      style={{
        opacity: pulse,
        backgroundColor: C.surface,
        borderRadius: 16,
        padding: 16,
        paddingLeft: 20,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: C.border,
      }}
    >
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
        <View
          style={{
            width: 72,
            height: 22,
            borderRadius: 11,
            backgroundColor: C.elevated,
          }}
        />
        <View
          style={{
            width: 90,
            height: 22,
            borderRadius: 11,
            backgroundColor: C.elevated,
          }}
        />
      </View>
      <View
        style={{
          height: 16,
          borderRadius: 8,
          backgroundColor: C.elevated,
          marginBottom: 6,
          width: "88%",
        }}
      />
      <View
        style={{
          height: 16,
          borderRadius: 8,
          backgroundColor: C.elevated,
          width: "55%",
        }}
      />
      <View
        style={{
          height: 14,
          borderRadius: 7,
          backgroundColor: C.elevated,
          width: "65%",
          marginTop: 12,
        }}
      />
    </Animated.View>
  );
};

// ─── Section Header ────────────────────────────────────────────────────────────
const SectionDivider = ({ label, count }: { label: string; count: number }) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
      gap: 10,
    }}
  >
    <Text
      style={{
        fontSize: 12,
        fontWeight: "700",
        color: C.muted,
        letterSpacing: 1,
      }}
    >
      {label.toUpperCase()}
    </Text>
    <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
    <View
      style={{
        backgroundColor: C.elevated,
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: "700", color: C.muted }}>
        {count}
      </Text>
    </View>
  </View>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
const Events = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const { language } = useLanguage();

  const [isLoading, setIsLoading] = useState(false);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [past, setPast] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [eventType, setEventType] = useState(Service.eventsUrl ?? HUBS[0].url);
  const [filterVisible, setFilterVisible] = useState(false);

  // Slide animation for tab content
  const slideX = useRef(new Animated.Value(0)).current;

  const switchTab = (tab: "upcoming" | "past") => {
    const toValue = tab === "upcoming" ? 0 : -SW;
    Animated.spring(slideX, {
      toValue,
      useNativeDriver: true,
      tension: 70,
      friction: 12,
    }).start();
    setActiveTab(tab);
  };

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(eventType);
      const json: any[] = await response.json();
      const now = Math.round(Date.now() / 1000);

      const upcomingList = [
        ...json.filter((e) => e.metadata?.evcal_srow >= now),
      ].sort((a, b) => a.metadata.evcal_srow - b.metadata.evcal_srow);

      const pastList = [
        ...json.filter((e) => e.metadata?.evcal_srow < now),
      ].sort((a, b) => b.metadata.evcal_srow - a.metadata.evcal_srow);

      setUpcoming(upcomingList);
      setPast(pastList);
    } catch {
      Vibration.vibrate();
      Alert.alert(
        i18n.t("events.connectionError"),
        i18n.t("events.checkConnection"),
        [
          {
            text: i18n.t("events.cancel"),
            onPress: () => navigation.goBack(),
            style: "cancel",
          },
          { text: i18n.t("events.retry"), onPress: fetchEvents },
        ],
        { cancelable: false }
      );
    } finally {
      setIsLoading(false);
    }
  }, [eventType]);

  useEffect(() => {
    fetchEvents();
  }, [eventType]);

  const navigateToEvent = (item: any) =>
    router.push({
      pathname: "/eventscontent",
      params: {
        id: item.id,
        title: item.title?.rendered,
        content: item.content?.rendered,
        link: item.link,
      },
    });

  const activeList = activeTab === "upcoming" ? upcoming : past;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <Header
        onBack={() => navigation.goBack()}
        onFilter={() => setFilterVisible(true)}
        activeUrl={eventType}
      />

      <TabBar
        activeTab={activeTab}
        onTabChange={switchTab}
        upcomingCount={upcoming.length}
        pastCount={past.length}
      />

      {isLoading ? (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingTop: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} index={i} />
          ))}
        </ScrollView>
      ) : activeList.length === 0 ? (
        <EmptyState isPast={activeTab === "past"} />
      ) : (
        <FlatList
          data={activeList}
          keyExtractor={(item, i) => `${item?.id}-${activeTab}-${i}`}
          contentContainerStyle={{
            padding: 16,
            paddingTop: 12,
            paddingBottom: 48,
          }}
          ListHeaderComponent={
            <SectionDivider
              label={
                language
                  ? i18n.t(
                      activeTab === "upcoming"
                        ? "events.upcoming"
                        : "events.past"
                    )
                  : activeTab
              }
              count={activeList.length}
            />
          }
          renderItem={({ item, index }) => (
            <EventCard
              item={item}
              index={index}
              isPast={activeTab === "past"}
              onPress={() => navigateToEvent(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FilterSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        activeUrl={eventType}
        onSelect={(url: string) => {
          setEventType(url);
        }}
      />
    </SafeAreaView>
  );
};

export default Events;
