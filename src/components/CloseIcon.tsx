import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

const CloseIcon = ({ onpress }) => {
  return (
    <TouchableOpacity onPress={onpress} style={{ paddin }}>
      <Ionicons name="close-circle-outline" size={25} color={"#222"} />
    </TouchableOpacity>
  );
};

export default CloseIcon;
