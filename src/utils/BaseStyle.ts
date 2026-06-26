import { Platform, StyleSheet } from "react-native";
import { status_bar_height } from "./Dimension";

export const baseStyle = StyleSheet.create({
  marginTop: {
    marginTop: Platform.OS === "ios" ? 16 : status_bar_height,
  },
  paddingTop: {
    paddingTop: Platform.OS === "ios" ? 16 : status_bar_height,
  },
  paddingHorizontal: {
    paddingHorizontal: 10,
  },
  marginHorizontal: {
    marginHorizontal: 10,
  },
  flexRowAndBetween: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  flexRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  rowCardStyle: {
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#f2f2f2",
    marginBottom: 20,
  },
  primaryColor: {
    color: "#ECF0FC",
  },
});
