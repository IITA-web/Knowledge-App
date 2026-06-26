import { Ionicons } from "@expo/vector-icons";

const BackArrow = ({ color }: { color?: string }) => {
  return (
    <Ionicons name="arrow-back" color={color ? color : "#fff"} size={25} />
  );
};

export default BackArrow;
