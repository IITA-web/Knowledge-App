import * as React from 'react';
import { FlatList, Share, ActivityIndicator, StatusBar, Text, View, Appearance, ScrollView, Dimensions, TouchableOpacity, StyleSheet, Image, Alert, Vibration } from 'react-native';
//import { ListItem, Image } from 'react-native-elements';
import HTMLView from 'react-native-htmlview';
import EStyleSheet from 'react-native-extended-stylesheet';
import { ThemeContext } from 'react-navigation';
import Icon from 'react-native-vector-icons/FontAwesome5';
import InAppBrowser from 'react-native-inappbrowser-reborn'

const colorScheme = Appearance.getColorScheme();

export default class Privacy extends React.Component {
static contextType = ThemeContext;
static navigationOptions = ({ navigation, navigationOptions }) => {
    console.log(navigationOptions);
    return {
      title: 'Privacy Policy',
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
    const content = "<p> International Institute of Tropical Agriculture (IITA) built the app as a Free app. This SERVICE is provided by IITA at no cost and is intended for use as is.</p> <p>This page is used to inform visitors regarding our policies with the collection, use, and disclosureof Personal Information if anyone decided to use our Service.</p> <p>If you choose to use our Service, then you agree to the collection and use of information inrelation to this policy. The Personal Information that we collect is used for providing and improvingthe Service. We will not use or share your information with anyone except as describedin this Privacy Policy.</p> <p><strong> Information Collection and Use</strong></p> <p>For a better experience, while using our Service, we may require you to provide us with certainpersonally identifiable information. The information that we request will be retained by us and used as described in this privacy policy.</p> <p>The app does use third party services that may collect information used to identify you.</p> <div><p>Link to privacy policy of third party service providers used by the app</p> <ul><li><a href='https://radio.co/privacy'>Radio.co</a></li><li><a href='https://www.google.com/policies/privacy'>Google Play Services</a></li><li><a href='https://policies.google.com/privacy?hl=en-US'>Youtube/Google</a></li><li><a href='https://www.flickr.com/help/privacy'>Flickr</a></li><!----><!----><!----><!----><!----><!----><!----></ul></div> <p><strong>Log Data</strong></p> <p> We want to inform you that whenever you use our Service, in a case ofan error in the app we collect data and information (through third party products) on your phonecalled Log Data. This Log Data may include information such as your device Internet Protocol (“IP”) address, device name, operating system version, the configuration of the app when utilizing our Service, the time and date of your use of the Service, and other statistics. </p> <p><strong>Cookies</strong></p> <p>Cookies are files with a small amount of data that are commonly used as anonymous unique identifiers. These are sent to your browser from the websites that you visit and are stored on your device's internal memory. </p> <p>This Service does not use these “cookies” explicitly. However, the app may use third party code and libraries that use “cookies” to collect information and improve their services. You have the option to either accept or refuse these cookies and know when a cookie is being sent to your device. If you choose to refuse our cookies, you may not be able to use some portions of this Service. </p> <p><strong>Service Providers</strong></p> <p> We may employ third-party companies and individuals due to the following reasons:</p> <ul><li>To facilitate our Service;</li> <li>To provide the Service on our behalf;</li> <li>To perform Service-related services; or</li> <li>To assist us in analyzing how our Service is used.</li></ul> <p> We want to inform users of this Service that these third parties have access to your Personal Information. The reason is to perform the tasks assigned to them on our behalf. However, they are obligated not to disclose or use the information for any other purpose. </p> <p><strong>Security</strong></p> <p> We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security. </p> <p><strong>Links to Other Sites</strong></p> <p>This Service may contain links to other sites. If you click on a third-party link, you will be directed to that site. Note that these external sites are not operated by us. Therefore, we strongly advise you to review the Privacy Policy of these websites. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services. </p> <p><strong>Children’s Privacy</strong></p> <p>These Services do not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13. In the case we discover that a child under 13 has provided us with personal information, we immediately delete this from our servers. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so that we will be able to do necessary actions. </p> <p><strong>Changes to This Privacy Policy</strong></p> <p> We may update our Privacy Policy from time to time. Thus, you are advised to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page. These changes are effective immediately after they are posted onn this page. </p> <p><strong>Contact Us</strong></p> <p>If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us. </p> <p><a href='http://www.iita.org'>www.iita.org</a></p><p>&nbsp;</p>";
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
