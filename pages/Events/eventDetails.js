import * as React from 'react';
import { StatusBar, ActivityIndicator, Appearance, Text, View, ScrollView, TouchableOpacity, StyleSheet, Image, Linking, Alert, Vibration } from 'react-native';
//import { ListItem, Image } from 'react-native-elements';
import InAppBrowser from 'react-native-inappbrowser-reborn'

import HTMLView from 'react-native-htmlview';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Avatar, Button, Card, Title, Paragraph, Divider, List, Colors } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { ThemeContext } from 'react-navigation';
import moment from 'moment';
const colorScheme = Appearance.getColorScheme();
const contextType = ThemeContext;

export default class EventDetails extends React.Component{
static contextType = ThemeContext;
static navigationOptions = ({ navigation, navigationOptions }) => {
    return {
       title: navigation.getParam('title', 'Events'),
        headerTitleContainerStyle: {
        marginLeft: 80,
        marginRight: 60
      },

    };
  };

  constructor(props){
    super(props);
  }

 _handlePressButtonAsync = async (url) => {
    try {
      if (await InAppBrowser.isAvailable()) {
        const result = await InAppBrowser.open(url, {
          // iOS Properties
          dismissButtonStyle: 'Back',
          preferredBarTintColor: '#ff6600',
          preferredControlTintColor: 'white',
          readerMode: false,
          animated: true,
          modalPresentationStyle: 'overFullScreen',
          modalTransitionStyle: 'partialCurl',
          modalEnabled: false,
          enableBarCollapsing: false,
          // Android Properties
          showTitle: true,
          toolbarColor: '#ff6600',
          secondaryToolbarColor: 'black',
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
    const theme = this.context;
    const noEvent = "<html><head></head><body><h3>No Description for this Event</h3></body></html>";
    <StatusBar backgroundColor="transparent" barStyle="light-content" />

    return (
      <ScrollView>
          <View style={{paddingTop: 20}}>
            <HTMLView value={this.props.navigation.getParam('content') !== '' ?this.props.navigation.getParam('content').replace(/<(\/)?p class=\"wp-caption-text\">/g , '<span>') : noEvent} onLinkPress={(url) => this._handlePressButtonAsync(url)} stylesheet={styles} />
          </View>
      </ScrollView>
    );
  }
}


const styles = StyleSheet.create({
  a: {
    fontWeight: '300',
    color: '#ff6600',
    fontSize: 18,
  },
  p: {
    color: '#555',
    fontSize: 18,
    paddingRight: 10,
    paddingLeft: 10,
    marginBottom: -60
  },
  span: {
    color: 'transparent',
    fontSize: 18,
    paddingRight: 10,
    paddingLeft: 10,
    marginBottom: -60
  },

   h1: {
    fontSize: 30,
    paddingRight: 10,
    paddingLeft: 10,
    marginBottom: -60,
    color: '#ff6600',
    textAlign: 'center'
  },

  h2: {
    fontSize: 25,
    paddingRight: 10,
    paddingLeft: 10,
    marginBottom: -60,
    color: '#ff6600',
    textAlign: 'center'
  },

   h3: {
    fontSize: 20,
    paddingRight: 10,
    paddingLeft: 10,
    marginBottom: -60,
    color: '#ff6600',
    textAlign: 'center'
  },

   h4: {
    fontSize: 18,
    paddingRight: 10,
    paddingLeft: 10,
    marginBottom: -60,
    color: '#ff6600',
    textAlign: 'center'
  },

   h5: {
    fontSize: 16,
    paddingRight: 10,
    paddingLeft: 10,
    marginBottom: -60,
    color: '#ff6600',
  },

   h6: {
    fontSize: 14,
    paddingRight: 10,
    paddingLeft: 10,
    marginBottom: -60,
    color: '#ff6600',
  },
  img:{
    padding: 20,
    alignSelf: 'center',
  },
});


