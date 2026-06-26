import { View, Text, SafeAreaView } from "react-native";
import React from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import CustomHeader from "../components/CustomHeader";
import BackArrow from "../components/BackArrow";

const publicationcollectioncontent = () => {
  const { id: itemId } = useLocalSearchParams();
  const navigation = useNavigation();
  return (
    <SafeAreaView>
      <CustomHeader
        LeftIcon={<BackArrow />}
        RightIcon={null}
        title={"Publications Content"}
        onPressL={() => navigation.goBack()}
      />
      <Text>publicationcollectioncontent</Text>
    </SafeAreaView>
  );
};

export default publicationcollectioncontent;
