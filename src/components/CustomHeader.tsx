import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MenuIcon from "../icons/MenuIcon";

// ─── Props ────────────────────────────────────────────────────────────────────
interface CustomHeaderProps {
  /** Screen title shown when displayLogo is false */
  title?: string;
  /** Component rendered as the left icon (defaults to MenuIcon) */
  LeftIcon?: React.ReactNode;
  /** First right-side icon component */
  RightIcon?: React.ReactNode;
  /** Second right-side icon component */
  Right2Icon?: React.ReactNode;
  /** Called when the first right icon is pressed */
  onPressR?: any;
  /** Called when the second right icon is pressed */
  onPressR2?: () => void | null;
  /** Called when the left icon is pressed */
  onPressL?: () => void | null;
  /** Called when the title text is pressed */
  onTitlePress?: () => void | null;
  /** When true, renders the IITA logo in the centre instead of the title */
  displayLogo?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
const CustomHeader: React.FC<CustomHeaderProps> = ({
  title,
  LeftIcon,
  RightIcon,
  Right2Icon,
  onPressR,
  onPressR2,
  onPressL,
  onTitlePress,
  displayLogo = false,
}) => {
  return (
    <View style={styles.container}>
      {/* Left Section (Icon + Title) */}
      <View style={styles.leftSection}>
        <TouchableOpacity onPress={onPressL} style={styles.iconBtn}>
          {LeftIcon ?? <MenuIcon />}
        </TouchableOpacity>

        {!displayLogo && title ? (
          <TouchableOpacity onPress={onTitlePress}>
            <Text numberOfLines={1} style={styles.title}>
              {title}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Centre Logo (optional) */}
      {displayLogo && (
        <View style={styles.center}>
          <Image
            source={require("../../assets/images/new_iita_logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      )}

      {/* Right Icons */}
      <View style={styles.right}>
        {RightIcon ? (
          <TouchableOpacity onPress={onPressR} style={styles.iconBtn}>
            {RightIcon}
          </TouchableOpacity>
        ) : null}

        {Right2Icon ? (
          <TouchableOpacity onPress={onPressR2} style={styles.iconBtn}>
            {Right2Icon}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

export default CustomHeader;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  iconBtn: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    marginLeft: 6,
    maxWidth: "90%",
  },
  logo: {
    height: 50,
    width: 120,
  },
});
