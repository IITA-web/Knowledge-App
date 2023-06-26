import * as React from 'react';
import { FlatList, ActivityIndicator, Text, View, ScrollView, TouchableOpacity, StyleSheet, Image, Dimensions, Alert, Vibration } from 'react-native';
import { Badge, withBadge, ListItem, SearchBar  } from 'react-native-elements'
import EStyleSheet from 'react-native-extended-stylesheet';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Avatar, Button, Card, Title, Paragraph, Divider } from 'react-native-paper';
import { ThemeContext } from 'react-navigation';
import { FlatGrid } from 'react-native-super-grid';
//import DeviceInfo from 'react-native-device-info';
//import sha1s from 'crypto-js/sha1';

const { width, height } = Dimensions.get('window');

export default class Presentations extends React.Component {
  static contextType = ThemeContext;
static navigationOptions = ({ navigation, navigationOptions }) => {
    return {
      title: "Presentations",
      headerStyle: {
      backgroundColor: '#ff6600',
    },
     
    headerTintColor: '#fff',
    headerTitleStyle: {
    fontWeight: 'bold',
    },
  };
};

  constructor(props){
    super(props);
}





  componentDidMount(){

  }




  render(){
    return  (
      <View/>
    );
  }
}

