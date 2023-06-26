
import React, { useState } from 'react';
import { FlatList, ActivityIndicator, Text, View, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Alert, Vibration, Animated } from 'react-native';
import { ListItem, SearchBar, Avatar } from 'react-native-elements';
import { Searchbar } from 'react-native-paper';
import InAppBrowser from 'react-native-inappbrowser-reborn'

import { ThemeContext } from 'react-navigation';
//import SearchBar from 'react-native-search-bar';
import Icon from 'react-native-vector-icons/FontAwesome5';

const { width, height } = Dimensions.get('window');

export default class Databases extends React.Component {
static contextType = ThemeContext;

   static navigationOptions = ({navigation, navigationOptions}) => {
    return {
      title: 'Databases',
      headerLeftContainerStyle: {
        paddingRight: 40
      },
    }
  }
  constructor(props){
    super(props);

}

 componentDidMount(){

  }
  

 _handlePressButtonAsync = async (url) => {
    try {
      if (await InAppBrowser.isAvailable()) {
        const result = await InAppBrowser.open(url, {
          // iOS Properties
          dismissButtonStyle: 'Close',
          preferredBarTintColor: '#ff6600',
          preferredControlTintColor: 'white',
          readerMode: false,
          animated: true,
          modalPresentationStyle: 'overFullScreen',
          modalTransitionStyle: 'partialCurl',
          modalEnabled: false,
          enableBarCollapsing: false,
          // Android Properties
          showTitle: false,
          toolbarColor: '#ff6600',
          secondaryToolbarColor: '#ffffff',
          enableUrlBarHiding: true,
          enableDefaultShare: true,
          forceCloseOnRedirection: false,
          // Specify full animation resource identifier(package:anim/name)
          // or only resource name(in case of animation bundled with app).
          animations: {
            startEnter: 'slide_in_right',
            startExit: 'slide_out_left',
            endEnter: 'slide_in_left',
            endExit: 'slide_out_right'
          },
          headers: {
            'my-custom-header': 'my custom header value'
          }
        })
        //Alert.alert(JSON.stringify(result))
      }
      else Linking.openURL(url)
    } catch (error) {
      Alert.alert(error.message)
    }
  };




  render(){
      const { navigate } = this.props.navigation;
      const theme = this.context;

    return (
    <ScrollView>


    <ListItem Component={TouchableOpacity} bottomDivider containerStyle={{backgroundColor: 'transparent', marginLeft: 20, marginTop: 20}}>
      <Avatar source={require('../assets/icons/Yambase.png')} size={30} />
      <ListItem.Content>
        <ListItem.Title style={{ color: theme === 'light' ? '#000' : '#fff', fontSize: 15, fontWeight: 'bold'}} onPress={() => this._handlePressButtonAsync('https://yambase.org')}>Yam Base </ListItem.Title>
      </ListItem.Content>
      <ListItem.Chevron />
    </ListItem>

    <ListItem Component={TouchableOpacity} bottomDivider containerStyle={{backgroundColor: 'transparent', marginLeft: 20, marginTop: 20}}>
      <Avatar source={require('../assets/icons/Cassavabase.png')} size={30} />
      <ListItem.Content>
        <ListItem.Title style={{ color: theme === 'light' ? '#000' : '#fff', fontSize: 15, fontWeight: 'bold'}} onPress={() => this._handlePressButtonAsync('https://cassavabase.org')}>Cassava Base </ListItem.Title>
      </ListItem.Content>
      <ListItem.Chevron />
    </ListItem>

    <ListItem Component={TouchableOpacity} bottomDivider containerStyle={{backgroundColor: 'transparent', marginLeft: 20, marginTop: 20}}>
      <Avatar source={require('../assets/icons/Musabas.png')} size={30} />
      <ListItem.Content>
        <ListItem.Title style={{ color: theme === 'light' ? '#000' : '#fff', fontSize: 15, fontWeight: 'bold'}} onPress={() => this._handlePressButtonAsync('https://cassavabase.org')}>Musa Base </ListItem.Title>
      </ListItem.Content>
      <ListItem.Chevron />
    </ListItem>
    </ScrollView>
    );
  }
}
