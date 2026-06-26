import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity } from "react-native";

const CustomActionButton = ({ title, onPress }: any) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        height: 40,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: "gray",
        display: "flex",
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginBottom: 10,
      }}
    >
      <Text style={{ fontSize: 14, color: "black" }}>{title}</Text>
      <Ionicons
        name="chevron-forward-circle-outline"
        size={25}
        color={"black"}
      />
    </TouchableOpacity>
  );
};

export default CustomActionButton;
