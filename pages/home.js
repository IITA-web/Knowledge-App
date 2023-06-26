import React, { Component, useEffect, useState } from 'react';
import { StyleSheet, Pressable, View, SafeAreaView, Text, Image, Appearance, ImageBackground, TouchableOpacity, Touchablewithoutfeedback, Platform, AppRegistry, ListView, Dimensions, Slider, TouchableHighlight, StatusBar, ScrollView} from 'react-native';
import { Avatar, Card, Title, Paragraph, Divider, TouchableRipple, Button } from 'react-native-paper';
//import { Icon } from 'react-native-elements'
//import DeviceInfo from 'react-native-device-info';
import Icon from 'react-native-vector-icons/FontAwesome5';
import RadioScreen from './Radio';
//import OneSignal from 'react-native-onesignal';
import { FlatGrid } from 'react-native-super-grid';
import TrackPlayer, { State, Capability } from 'react-native-track-player';
import InAppBrowser from 'react-native-inappbrowser-reborn'


const pub = require('../image/books.png');
const pubIcon = Image.resolveAssetSource(pub).uri

const dat = require('../image/data-red.png');
const dataIcon = Image.resolveAssetSource(dat).uri

const proj = require('../image/projects1.png');
const projIcon = Image.resolveAssetSource(proj).uri

const newsi = require('../image/news.png');
const newsIcon = Image.resolveAssetSource(newsi).uri

const vid = require('../image/videos.png');
const vidIcon = Image.resolveAssetSource(vid).uri

const eveni = require('../image/event.png');
const evenIcon = Image.resolveAssetSource(eveni).uri

const datbi = require('../image/databases.png');
const datbIcon = Image.resolveAssetSource(datbi).uri

const irepi = require('../image/ireport.png');
const irepIcon = Image.resolveAssetSource(irepi).uri

const photi = require('../image/photos.png');
const photoIcon = Image.resolveAssetSource(photi).uri

var propas = require('../image/propas.png');
propas = Image.resolveAssetSource(propas).uri

const gplay = require('../image/GooglePlay.png');
const appsIcon = Image.resolveAssetSource(gplay).uri

const data =[{title: "News", navigation:"News", image:newsIcon},{title: "Events", navigation:"Events", image:evenIcon},{title:"Publications", navigation:"PublicationIndex", image:pubIcon},{title:"Data", navigation:"DataSets", image:dataIcon},{title: "Videos", navigation:"VideosTab", image:vidIcon}, {title:"Photos", navigation:"PhotosAlbulm", image:photoIcon}, {title:"Databases", navigation:"Databases", image:datbIcon},{title: "Projects", navigation:"Projects", image:projIcon},{title:"IITA Apps", navigation:"OtherApps", image:appsIcon},{title:"Propas", link:"https://propas.iita.org", image:propas}];
//const data =[{title: "News", navigation:"News", image:newsIcon},{title: "Events", navigation:"Events", image:evenIcon},{title:"Publications", navigation:"PublicationCollection", image:pubIcon},{title:"Data", navigation:"DataSets", image:dataIcon},{title: "Videos", navigation:"VideosTab", image:vidIcon}, {title:"Photos", navigation:"PhotosAlbulm", image:photoIcon}, {title:"Databases", navigation:"Databases", image:datbIcon},{title: "Projects", navigation:"Projects", image:projIcon},{title:"IITA Apps", navigation:"OtherApps", image:appsIcon},{title:"iReport", navigation:"iReportTab", image:irepIcon}];

export default class NewHome extends React.Component {

  static navigationOptions = ({navigation, navigationOptions}) => {
    return {
      title: '',
      headerLeft: () =>(
        <TouchableOpacity style={{ marginLeft: 20}} onPress = {navigation.toggleDrawer}>
          <Icon name='bars' size={20} color='#ffffff' ></Icon>
        </TouchableOpacity>
      ),
      headerTitle: ()=>(
        <View style={{ paddingRight: 30}}>
          <Image source={require('../image/app_logo.png')} style={{width: 80, height: 40}}/>
        </View>
      ),
    }
  }
  constructor(props) {

    super(props);
    /*OneSignal.addEventListener('received', this.onReceived);
    OneSignal.addEventListener('opened', this.onOpened.bind(this));
    OneSignal.addEventListener('ids', this.onIds);
    OneSignal.inFocusDisplaying(2);*/
  
    this.state = {
      AudioStatus: true,
      CurrentPlayTitle : '',
      CurrentPlayArtist : '',
      CurrentPlayImage : require('../image/radio.png'),
      Volume : 80,
      imageWidth: 100,
      sectionHeight: 240,
      fontSize: 14,
      title: '',
    };

  }

  componentDidMount() {
    TrackPlayer.updateOptions({
    // Media controls capabilities
    capabilities: [
        Capability.Play,
        Capability.Stop,
        Capability.Pause,
    ],

    // Capabilities that will show up when the notification is in the compact form on Android
    compactCapabilities: [Capability.Play, Capability.Stop, Capability.Pause],

  });

  }


  onReceived(notification) {
    //console.log("Notification received: ", notification);
  }

  onOpened(openResult) {
    const { navigate } = this.props.navigation;
    const category = openResult.notification.payload.additionalData.category;

     if (category == 'news'){
        var str = openResult.notification.payload.additionalData.id;
        var n = str.lastIndexOf('=');
        var result = str.substring(n + 1);
      this.props.navigation.navigate('NewsContent', { id: result, otherParam: openResult.notification.payload.body })
    }

    if (category == 'data'){
        var str = openResult.notification.payload.additionalData.id;
        var n = str.lastIndexOf('/');
        var result = str.substring(n + 1);
      this.props.navigation.navigate('DataFile', { id: result, otherParam: openResult.notification.payload.body })
    }

    if (category == 'project'){
        var str = openResult.notification.payload.additionalData.id;
        var n = str.lastIndexOf('=');
        var result = str.substring(n + 1);
      this.props.navigation.navigate('ProjectsContent', { id: result, otherParam: openResult.notification.payload.body })
    }

     if (category == 'publication'){
        var str = openResult.notification.payload.additionalData.id;
        var secondLastIndex = str.lastIndexOf('/', str.lastIndexOf('/')-1);
        var result = str.substring(secondLastIndex + 1);
      this.props.navigation.navigate('Publication', { id: result, otherParam: openResult.notification.payload.body })
    }

    //console.log('Message: ', openResult.notification.payload.body);
    console.log(openResult.notification.payload.additionalData.id);
   // console.log('isActive: ', openResult.notification.isAppInFocus);
    //console.log('openResult: ', openResult);
  }


 _handlePressButtonAsync = async (url) => {

   if(url.navigation){
     this.props.navigation.navigate(url.navigation);
   }else{
      try {
        if (await InAppBrowser.isAvailable()) {
          const result = await InAppBrowser.open(url.link, {
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
        else Linking.openURL(url.link)
      } catch (error) {
        Alert.alert(error.message)
      }
    }
  };



  render() {
    const theme = this.context;
    const { navigate } = this.props.navigation;
    
    return (
    <View style={{flex:1, backgroundColor: 'transparent'}}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content"  />
      <View style={{flex:1, backgroundColor: 'transparent'}}>
        <FlatGrid
          itemDimension={160}
          spacing={10}
            data={data}
            renderItem={({ item }) => (
                <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 5,paddingVertical: 10}} onPress={() =>{ this._handlePressButtonAsync(item) }}>

                  <View style={{ justifyContent: 'center', alignItems:'center', borderRadius: 5, backgroundColor: '#E5E5E5', width: '90%', padding: 50}}>
                    <Image source={{uri:item.image}} style={{ width: 50, height: 50, resizeMode: 'contain',}}></Image>
                  </View>
                      <Text style={{ color: '#222', fontSize: this.state.fontSize, paddingVertical: 15, textAlign: 'center', fontWeight: 'bold'}} >{item.title}</Text>
                </TouchableOpacity>
            )
          }
            keyExtractor={item => item.title}
            onEndReachedThreshold={0.5}
            initialNumToRender={20}
          />
      <RadioScreen/>
      </View>
    </View>
    );
  }
}



