import { Ionicons } from "@expo/vector-icons";

const ShareIcon = ({ color }) => {
  return (
    <Ionicons name="share-social" size={25} color={color ? color : "#fff"} />
  );
};

export default ShareIcon;
