
import React, { useCallback } from 'react';
import { View, ScrollView, Appearance, Image, Text, StyleSheet, Dimensions, Alert, Linking, TouchableOpacity, SafeAreaView, Platform, Vibration } from 'react-native';
import { ThemeContext } from 'react-navigation';
import { Avatar, Button, Card, Title, Paragraph, TouchableRipple, Divider, List, Colors, Searchbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/Ionicons';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import SendIntentAndroid from 'react-native-send-intent';
const { width, height } = Dimensions.get('window');


export default class OtherApps extends React.Component {
  static contextType = ThemeContext;
  static navigationOptions = ({ navigation, navigationOptions }) => {
    return {
      title: "Other IITA Apps",
    };
  };

  componentDidMount(){

}


openApp = (url, packageName) => {
    SendIntentAndroid.openApp(packageName).then((wasOpened) => {
      if (wasOpened === false){
        Linking.openURL(url);
      }
  });
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
  const { navigate } = this.props.navigation;
  return (

<ScrollView contentContainerStyle={styles.mainContainer}>

        {
          Platform.OS == 'android'?
          <Card style={{padding: 10, alignItems: 'center', width: "47%", borderWidth:0, marginBottom:10, marginLeft:5, marginRight:5, borderColor:'#808080', marginTop:10, backgroundColor: '#fff'}} elevation={3}>
            <Image source={require('../assets/icons/newsapp.png')} style={{width: 70, height: 70}} onPress={() => this.openApp('https://play.google.com/store/apps/details?id=com.newsapp.demo&hl=en', 'com.newsapp.demo')}/>
              <Text style={styles.ratingText}>IITA News</Text>
              <Divider />
              <View style={{flexDirection: 'row'}}>
              <Button color={'#ff6600'} style={{width:'100%'}} onPress={() => this.openApp('https://play.google.com/store/apps/details?id=com.newsapp.demo&hl=en', 'com.newsapp.demo')}><Icon name='md-open' size={20} color='#ff6600' ></Icon></Button>
              </View>
          </Card>
          : null
        }


          <Card style={{padding: 10, alignItems: 'center', width: "47%", borderWidth:0, marginBottom:10, marginLeft:5, marginRight:5, borderColor:'#808080', marginTop:10, backgroundColor: '#fff' }} elevation={3} >
              <Image source={require('../assets/icons/seedtracker.png')} style={{width: 70, height: 70}} />
              <Text style={styles.ratingText}>Seed Tracker</Text>
              <Divider />
              <View style={{flexDirection: 'row'}}>
              <Button color={'#ff6600'} style={{width: '50%'}} onPress={() => this._handlePressButtonAsync('https://seedtracker.org')}><Icon name='md-globe' size={20} color='#0062e3' ></Icon></Button>
             { Platform.OS == 'android' ? <Button  color={'#ff6600'} style={{width: '50%'}} onPress={() => this.openApp('https://play.google.com/store/apps/details?id=com.teqpace.seedtracker&hl=en', 'com.teqpace.seedtracker')} ><Icon name='md-open' size={20} color='#ff6600' ></Icon></Button>: null}
              </View>

          </Card>
        



          <Card style={{padding: 10, alignItems: 'center', width: "47%", borderWidth:0, marginBottom:10, marginLeft:5, marginRight:5, borderColor:'#808080', marginTop:10, backgroundColor: '#fff'}} elevation={3} >
            <Image source={require('../assets/icons/akilimo.png')} style={{width: 70, height: 70}}/>
              <Text style={styles.ratingText}>Akilimo</Text>
              <Divider />
              <View style={{flexDirection: 'row'}}>
              <Button color={'#ff6600'} style={{width: '50%'}}  onPress={() => this._handlePressButtonAsync('https://acai-project.org')}><Icon name='ios-globe' size={20} color='#0062e3' ></Icon></Button>
               { Platform.OS == 'android' ? <Button color={'#ff6600'}  style={{width: '50%'}} onPress={() => this.openApp('https://play.google.com/store/apps/details?id=com.akilimo.mobile&hl=en', 'com.akilimo.mobile')}><Icon name='md-open' size={20} color='#ff6600' ></Icon></Button>: null}
              </View>
          </Card>


        {
          Platform.OS == 'android'?

          <Card style={{padding: 10, alignItems: 'center', width: "47%", borderWidth:0, marginBottom:10, marginLeft:5, marginRight:5, borderColor:'#808080', marginTop:10, backgroundColor: '#fff'}} elevation={3} >
              <Image source={require('../assets/icons/ireport.png')} style={{width: 70, height: 70}}/>
              <Text style={styles.ratingText}>IITA iReport</Text>
              <Divider />
              <View style={{flexDirection: 'row'}}>
              <Button color={'#ff6600'}  style={{width: '100%'}}  onPress={() => this.openApp('https://play.google.com/store/apps/details?id=com.iitaireport.org&hl=en', 'com.iitaireport.org')}><Icon name='md-open' size={20} color='#ff6600' ></Icon></Button>
              </View>
          </Card>
          :null
        }


        {
          Platform.OS == 'android'?

        <Card style={{padding: 10, alignItems: 'center', width: "47%", borderWidth:0, marginBottom:10, marginLeft:5, marginRight:5, borderColor:'#808080', marginTop:10, backgroundColor: '#fff'}} elevation={3} >
            <Image source={require('../assets/icons/herb.png')} style={{width: 70, height: 70}}/>
            <Text style={styles.ratingText}>IITA Habicide Calculator</Text>
            <Divider />
            <View style={{flexDirection: 'row'}}>
            <Button  color={'#ff6600'} style={{width: '100%'}}  onPress={() => this.openApp('https://play.google.com/store/apps/details?id=com.famtem.dev&hl=en', 'com.famtem.dev')}><Icon name='md-open' size={20} color='#ff6600' ></Icon></Button>
            </View>
        </Card>: null
        }


        <Card style={{padding: 10, alignItems: 'center', width: "47%", borderWidth:0, marginBottom:10, marginLeft:5, marginRight:5, borderColor:'#808080', marginTop:10, backgroundColor: '#fff'}} elevation={3} >
            <Image source={require('../assets/icons/shadetree.png')} style={{width: 70, height: 70}}/>
            <Text style={styles.ratingText}>Shade Tree Tool</Text>
            <Divider />
            <View style={{flexDirection: 'row'}}>
            <Button color={'#ff6600'} style={{width: '50%'}} onPress={() => this._handlePressButtonAsync('http://www.shadetreeadvice.org')}><Icon name='ios-globe' size={20} color='#0062e3' ></Icon></Button>
            { Platform.OS == 'android'? <Button  color={'#ff6600'} style={{width: '50%'}} onPress={() => this.openApp('https://play.google.com/store/apps/details?id=com.iita.shadetreetool&hl=en', 'com.iita.shadetreetool')}><Icon name='md-open' size={20} color='#ff6600' ></Icon></Button>: null}
            </View>
        </Card>

        {
          Platform.OS == 'android'?

          <Card style={{padding: 10, alignItems: 'center', width: "47%", borderWidth:0, marginBottom:10, marginLeft:5, marginRight:5, borderColor:'#808080', marginTop:10, backgroundColor: '#fff'}} elevation={3} >
              <Image source={require('../assets/icons/stepwise.png')} style={{width: 70, height: 70}}/>
              <Text style={styles.ratingText}>Stepwise Smartphone Mobile Application</Text>
              <Divider />
              <View style={{flexDirection: 'row'}}>
              <Button  color={'#ff6600'} style={{width: '100%'}} onPress={() => this.openApp('https://play.google.com/store/apps/details?id=com.mangotree.stepwise&hl=en', 'com.mangotree.stepwise')}><Icon name='md-open' size={20} color='#ff6600' ></Icon></Button>
              </View>
          </Card>: null
        }

        <Card style={{padding: 10, alignItems: 'center', width: "47%", borderWidth:0, marginBottom:10, marginLeft:5, marginRight:5, borderColor:'#808080', marginTop:10, backgroundColor: '#fff'}} elevation={3} >
            <Image source={require('../assets/icons/ICT4BXWTRANS.png')} style={{width: 70, height: 70}}/>
            <Text style={styles.ratingText}>ICT4BXW/ BXW App</Text>
            <Divider />
            <View style={{flexDirection: 'row'}}>
            <Button  color={'#ff6600'} style={{width: '50%'}}  onPress={() => this._handlePressButtonAsync('http://www.ict4bxw.com')}><Icon name='ios-globe' size={20} color='#0062e3' ></Icon></Button>
            { Platform.OS == 'android'?<Button  color={'#ff6600'} style={{width: '50%'}} onPress={() => this.openApp('https://play.google.com/store/apps/details?id=com.bxw.app&hl=en', 'com.bxw.app')}><Icon name='md-open' size={20} color='#ff6600' ></Icon></Button>: null}
            </View>
        </Card>

        <Card style={{padding: 10, alignItems: 'center', width: "47%", borderWidth:0, marginBottom:10, marginLeft:5, marginRight:5, borderColor:'#808080', marginTop:10, backgroundColor: '#fff'}} elevation={3} >
            <Image source={require('../assets/icons/plantvillage.png')} style={{width: 70, height: 70}}/>
            <Text style={styles.ratingText}>PlantVillage Nuru</Text>
            <Divider />
            <View style={{flexDirection: 'row'}}>
            <Button  color={'#ff6600'} style={{width: '50%'}} onPress={() => this._handlePressButtonAsync('https://plantvillage.psu.edu')}><Icon name='ios-globe' size={20} color='#0062e3' ></Icon></Button>
            { Platform.OS == 'android'?<Button  color={'#ff6600'} style={{width: '50%'}}  onPress={() => this.openApp('https://play.google.com/store/apps/details?id=plantvillage.nuru&hl=en', 'plantvillage.nuru')}><Icon name='md-open' size={20} color='#ff6600' ></Icon></Button>: null}
            </View>
        </Card>
   </ScrollView>   
 ) 
  }
}

styles = StyleSheet.create({
  subtitleView: {
    flexDirection: 'row',
    paddingLeft: 10,
    paddingTop: 5
  },
  ratingImage: {
    height: 19.21,
    width: 100
  },
  ratingText: {
    //paddingLeft: 10,
    color: 'grey',
    textAlign: 'center',
    paddingBottom: 5,
    paddingTop: 10
  },
    mainContainer: {
        flexWrap: 'wrap',
        flexDirection: 'row'
  },
  containerStyle: {
        padding: 10,
        alignItems: 'center',
        width: "47%",
        borderWidth:0,
        marginBottom:10,
        marginLeft:5,
        marginRight:5,
        borderColor:'#808080',
        marginTop:10,
        elevation: 5
    }

})