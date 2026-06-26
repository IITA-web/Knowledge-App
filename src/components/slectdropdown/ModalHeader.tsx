import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const ModalHeader = ({ title, onPress }: any) => {
  return (
    <View style={{ padding: 15, flexDirection: "row", alignItems: "center" }}>
      <Text
        style={{
          flex: 1,
          color: "#222",
          fontSize: 18,
          marginLeft: 10,
          textAlign: "center",
          alignSelf: "center",
        }}
      >
        {title}
      </Text>
      <TouchableOpacity onPress={onPress} style={{ flexDirection: "row" }}>
        <Ionicons name="close-circle-outline" color="#222" size={24} />
      </TouchableOpacity>
    </View>
  );
};

export default ModalHeader;
