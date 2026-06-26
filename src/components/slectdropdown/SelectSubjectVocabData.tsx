import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { baseStyle } from "../../utils/BaseStyle";
import { screenHeight } from "../../utils/Dimension";
import ModalHeader from "./ModalHeader";

const SelectSubjectVocabData = ({
  data,
  handleSelectData,
  showModal,
  setModalVisible,
}: any) => {
  return (
    <Modal visible={showModal} animationType="fade" transparent={true}>
      <View
        style={{
          flex: 1,
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Pressable
          style={{ height: "40%" }}
          onPress={() => setModalVisible(false)}
        />
        <ScrollView
          style={[
            baseStyle.paddingHorizontal,
            {
              width: "100%",
              height: screenHeight,
              flex: 1,
              marginTop: -20,
              backgroundColor: "#ccc",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            },
          ]}
        >
          <ModalHeader
            title={"Select Vocabulary"}
            onPress={() => setModalVisible(false)}
          />
          {data.map((item: any, index: number) => (
            <TouchableOpacity
              style={[
                baseStyle.flexRow,
                {
                  padding: 10,
                  marginBottom: 10,
                  backgroundColor: "#ccc",
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: "#222",
                },
              ]}
              key={index}
              onPress={() => handleSelectData(item)}
            >
              <Text>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
};

export default SelectSubjectVocabData;
