import { Ionicons } from "@expo/vector-icons";
const ChevronBackArrow = (color) => {
  return (
    <Ionicons
      name="arrow-back-outline"
      size={24}
      color={color ? color : "#000"}
    />
  );
};

export default ChevronBackArrow;
