import { Ionicons } from "@expo/vector-icons";

const SearchIcon = (color = "#959595") => {
  return (
    <Ionicons name="search-outline" size={25} color={color ? color : "#fff"} />
  );
};

export default SearchIcon;
