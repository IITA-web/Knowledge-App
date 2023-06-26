import * as React from 'react';
import { FlatList, Share, ActivityIndicator, Text, View, Appearance, ScrollView, Dimensions, TouchableOpacity, TouchableHighlight, StyleSheet, Alert, Vibration, Modal } from 'react-native';
import { Image } from 'react-native-elements';
import ImageViewer from 'react-native-image-zoom-viewer';
import HTMLView from 'react-native-htmlview';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Avatar, Button, Card, Title, Paragraph, Divider } from 'react-native-paper';
import { ThemeContext } from 'react-navigation';
import InAppBrowser from 'react-native-inappbrowser-reborn'
import moment from 'moment';

import Icon from 'react-native-vector-icons/FontAwesome5';
const colorScheme = Appearance.getColorScheme();
const { width } = Dimensions.get('window');
export default class iReportPhotosDetails extends React.Component {
static contextType = ThemeContext;
static navigationOptions = ({ navigation, navigationOptions }) => {
    return {
      title: navigation.getParam('title', 'iReport'),
      headerRight: () => (
        <TouchableOpacity  style={{ paddingRight: 20}} onPress={navigation.getParam('share')}>
          <Icon name='share-alt' size={20} color='#ffffff' ></Icon>
        </TouchableOpacity>
      ),
    };
  };

  constructor(props){
    super(props);
    this.state ={ isLoading: true, dataSource: [], imageData: [], modalVisible: false}
  }


setModalVisible = (visible) => {
    this.setState({ modalVisible: visible });
  }

  componentDidMount(){
    
    const { navigation } = this.props;
    const item = navigation.getParam('data', 'NO-ID');
    this.props.navigation.setParams({ share: this.onShare });

    const images = [{
    // Simplest usage.
    url: item.original,

    // width: number
    // height: number
    // Optional, if you know the image size, you can set the optimization performance

    // You can pass props to <Image />.
    props: {
        // headers: ...
    }
  }];

    var str = item.time;
        str = str.toString();
        str = str.slice(0, -3);
        str = parseInt(str);
        this.setState({
          isLoading: false,
          dataSource: item,
          date: str,
          imageData: images
        })
  }


 _handlePressButtonAsync = async (url) => {
  if(url.length > 1){
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
  }
  };



  onShare = async () => {
    try {
      const result = await Share.share({
        message:
          this.state.dataSource.title + "" + this.state.dataSource.original,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };



  render(){
    const theme = this.context;
    const { modalVisible } = this.state;
    //alert(this.state.date)
    return (
          <View >
            <ScrollView style={{ color: theme === 'light' ? '#fff' : '#000', padding: 10 }}>
            <TouchableOpacity onPress={() => {this.setModalVisible(true)}} >
            <Image
                source={{ uri: this.state.dataSource.original }}
                style={styles.image}
                PlaceholderContent={<ActivityIndicator />}
                
            />
            </TouchableOpacity>

            <Text onPress = {() => this._handlePressButtonAsync(this.state.dataSource.link)} style={{color: '#ff6600', fontSize: 18, textAlign: 'center', marginBottom: 10}}>{this.state.dataSource.title}</Text>
            
            <View style={{
            paddingVertical: 25,
            paddingHorizontal: 10,
            flexDirection: "row",
            alignItems: "center"}}>

            <Icon name='flag' size={15} color='#ff6600' ></Icon>
            <Text> { this.state.dataSource.country} </Text>

            <Icon style={{paddingLeft: 10}} name='city' size={15} color='#ff6600' > </Icon>
            <Text> { this.state.dataSource.city} </Text>

            <Icon style={{paddingLeft: 10}} name='calendar-day' size={15} color='#ff6600' > </Icon>
            <Text> {moment.unix(this.state.date).format('ddd, MMM Do, YYYY ')} </Text>

        </View>

            <Text>{this.state.dataSource.description}</Text>
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
            <TouchableHighlight style={{backgroundColor: '#000'}}
              onPress={() => {
                this.setModalVisible(!modalVisible);
              }}
            >
            <View style={{
            flexDirection: "row",
            alignItems: "center"}}>
            <Icon style={{margin: 10}} name='chevron-left' size={25} color='#ffffff' ></Icon>
            <Text style={{color: '#fff', fontSize: 18}}>Back </Text>
            </View>
            </TouchableHighlight>
                <ImageViewer imageUrls={this.state.imageData}/>
                <View style={styles.centeredView}>
          
        </View>
            </Modal>
            </ScrollView>
          </View>
          
        );
  }
}


const styles = StyleSheet.create({
  image: {
    flex: 1,
    width: width,
    height: width,
    resizeMode: 'cover',
    marginBottom: 40
  },

  fitImage: {
    borderRadius: 20,
  },
  fitImageWithSize: {
    height: 100,
    width: 30,
  },



  a: {
    fontWeight: '300',
    color: '#ff6600',
  },
  body: {
    color: colorScheme === 'dark' ? '#fff' : '#222',
    fontSize: 17,
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
