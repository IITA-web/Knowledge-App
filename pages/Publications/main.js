
import React from 'react';
import { FlatList, Image, ActivityIndicator, Dimensions, SafeAreaView, RefreshControl, Alert, Text, View, ScrollView, StyleSheet, TouchableOpacity, Vibration } from 'react-native';
import { ListItem, Icon, Badge } from 'react-native-elements';
import InAppBrowser from 'react-native-inappbrowser-reborn';

export default class PublicationIndex extends React.Component {
  static navigationOptions = ({ navigation, navigationOptions }) => {
    return {
      title: navigation.getParam('Publications', 'Publications'),
    };
  };
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
    return  (
      <SafeAreaView style={{ flex:1 }} >
        <View style={{flex:1, justifyContent:'center', alignItems:'center', flexDirection:'row'}}>

          <TouchableOpacity onPress={()=>{navigate('PublicationCollection')}} style={{padding:10}}>
            <Image source={require('../../image/biblio.png')} style={{width: 120, height:100}}/>
          </TouchableOpacity>

          <TouchableOpacity style={{padding:10}} onPress={()=>{this._handlePressButtonAsync('https://cgspace.cgiar.org')}}>
            <Image source={require('../../image/cgspace.jpg')} style={{width: 120, height:100}} />
          </TouchableOpacity>

        </View>
      </SafeAreaView>
    ) 
  }
}
