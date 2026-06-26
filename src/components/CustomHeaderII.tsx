import { useNavigation } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { baseStyle } from "../utils/BaseStyle";
import ChevronBackArrow from "./ChevronBackArrow";

const CustomHeaderII = ({ title }: any) => {
  const navigation = useNavigation();
  return (
    <View
      style={[
        { marginTop: 16, marginHorizontal: 16, marginBottom: 16 },
        baseStyle.flexRowAndBetween,
      ]}
    >
      {/* left div */}
      <View style={[baseStyle.flexRowAndBetween]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            paddingRight: 10,
            paddingVertical: 8,
          }}
        >
          <ChevronBackArrow />
        </TouchableOpacity>

        <Text style={{ fontWeight: "700", fontSize: 18, marginLeft: 20 }}>
          {title}
        </Text>
      </View>
      {/* right div */}
      {/* <TouchableOpacity onPress={OnClickSearch}>
        <SearchIcon />
      </TouchableOpacity> */}
    </View>
  );
};

export default CustomHeaderII;
