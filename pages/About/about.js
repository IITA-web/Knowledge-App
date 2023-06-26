import * as React from 'react';
import { FlatList, Share, ActivityIndicator, StatusBar, Text, View, Appearance, ScrollView, Dimensions, TouchableOpacity, StyleSheet, Image, Alert, Vibration } from 'react-native';
//import { ListItem, Image } from 'react-native-elements';
import HTMLView from 'react-native-htmlview';
import EStyleSheet from 'react-native-extended-stylesheet';
import { ThemeContext } from 'react-navigation';
import Icon from 'react-native-vector-icons/FontAwesome5';
import InAppBrowser from 'react-native-inappbrowser-reborn'

const colorScheme = Appearance.getColorScheme();

export default class About extends React.Component {
static contextType = ThemeContext;
static navigationOptions = ({ navigation, navigationOptions }) => {
    console.log(navigationOptions);
    return {
      title: 'About Us',
    };
  };

  constructor(props){
    super(props);  }

  componentDidMount(){
    
    const { navigation } = this.props;
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
    const content = "<h2><strong>Mission</strong></h2><p> <em><strong>“To offer leading research partnership that facilitates agricultural solutions to hunger, poverty, and natural resource degradation throughout sub-Saharan Africa.”</strong></em> IITA’s mission is to assure food security for some of the world’s poorest people and provide them with viable strategies that create real, long-term results for economic development and community stability, while building an ecologically sound future that takes into account the issues of climate change. At IITA, we are dedicated to alleviating these problems and working to transform agriculture in Africa.</p> <h2><strong>Vision</strong></h2> <p><strong><em>“The lead research partner facilitating agricultural solutions to overcome hunger and poverty in the tropics.”</em></strong> IITA sees a bright future for Africa. We see a continent that can become a world leader in agriculture and sustainability. We understand that Africa needs a proactive CGIAR-supported Center that is closely linked to the demands of this continent. Our core beliefs and strategy reflect this. In line with the new CGIAR, IITA is focused on four System-Level Outcomes described in the Strategic Results Framework.<p> <ol class='listmar'> <li>Increase food security</li> <li>Reduce rural poverty</li> <li>Reduce the prevalence of under-nutrition</li> <li>Introduce sustainable natural resource management</li> </ol></p> IITA will advance these System Level Outcomes within five impact zones in sub-Saharan Africa by increasing major staple food yields in target R4D regions by two-thirds. Focusing on cassava, yam, maize, banana and plantain, soybean, and cowpea is the fastest and easiest way to impact farmers and increase the average farm income by half. As rural, farming communities in Africa are among the poorest in the world, these increases will lift over 11 million Africans or almost a fifth of households above the poverty line. Our vision of the future sees the region’s farms commit to restoring natural resources and sustainable farming practices for seven and a half million hectares of degraded farmlands, conserving them for future generations of farmers and food producers.</p> <h2><strong>Looking to 2020 and beyond</strong></h2><p> IITA operates through decentralized but integrated regional research programs, each working on major agricultural constraints in Africa. We concentrate on crops, farming systems, and maintaining the natural resource base within a flourishing socioeconomic environment. Through the CGIAR Research Programs we will foster innovative partnerships and outscale the technologies developed in sub-Saharan Africa by IITA to the rest of the global tropics. Through a doubling of the current human and financial resources by 2020, we aim to substantially narrow yield gaps of key crops in several African countries in a sustainable manner. We are confident in our ability to deliver on these goals and make a real difference to the people of Africa.</p><p>&nbsp;</p>";
    return (
          <View >
                 <StatusBar barStyle="dark-content"  />

            <ScrollView style={{ padding: 10 }}>
                <HTMLView value={'<body>'+content+'</body>'} onLinkPress={(url) => this._handlePressButtonAsync(url)}  stylesheet={styles} />
            </ScrollView>
          </View>
        );
  }
}


const styles = StyleSheet.create({
  a: {
    fontWeight: '300',
    color: '#ff6600',
  },
  body: {
    fontSize: 18,
    lineHeight: 30,
    color: '#555'
  },
  paragraph: {
    marginVertical: 15,
  },
  h3:{
    color: '#ff6600',
    fontSize: 24,
    fontWeight: 'bold'
  },
  h4:{
    color: '#ff6600',
    fontSize: 24,
    fontWeight: 'bold'
  },
  h5:{
    color: '#ff6600',
    fontSize: 24,
    fontWeight: 'bold'
  },
  h2:{
    color: '#ff6600',
    fontSize: 24,
    fontWeight: 'bold'
  },
  h1:{
    color: '#ff6600',
    fontSize: 24,
    fontWeight: 'bold'
  },
  h6:{
    color: '#ff6600',
    fontSize: 24,
    fontWeight: 'bold'
  }
});
