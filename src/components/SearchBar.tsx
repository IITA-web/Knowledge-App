import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { baseStyle } from "../utils/BaseStyle";

const SearchBar = ({
  placeholder,
  value,
  onchange,
  loading,
  onPressFilter,
  onPresscancel,
  showFilter,
}: any) => {
  return (
    <View
      style={[
        baseStyle.marginHorizontal,
        {
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderWidth: 2,
          borderColor: "gray",
          paddingVertical: 4,
          paddingHorizontal: 6,
          borderRadius: 10,
          height: 60,
          marginVertical: 10,
        },
      ]}
    >
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          width: "90%",
        }}
      >
        <Ionicons name="search" size={25} color={"black"} />
        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onchange}
          style={{ flex: 1, marginLeft: 4 }}
          placeholderTextColor={"gray"}
          cursorColor={"gray"}
        />
      </View>
      {showFilter && value.length === 0 && (
        <TouchableOpacity onPress={onPressFilter}>
          <Ionicons name="filter" size={25} color={"black"} />
        </TouchableOpacity>
      )}

      {loading ? (
        <ActivityIndicator size={"small"} color={"black"} />
      ) : value.length > 0 ? (
        <TouchableOpacity onPress={onPresscancel}>
          <Ionicons name="close" size={25} color={"black"} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default SearchBar;
