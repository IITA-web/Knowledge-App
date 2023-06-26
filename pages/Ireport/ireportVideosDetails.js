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
//import Video from 'react-native-video';

import Icon from 'react-native-vector-icons/FontAwesome5';
const colorScheme = Appearance.getColorScheme();
const { width } = Dimensions.get('window');
export default class iReportVideosDetails extends React.Component {
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
    this.state ={ isLoading: true, dataSource: [], imageData: [], modalVisible: false, rate: 1,
volume: 1,
muted: false,
resizeMode: 'contain',
duration: 0.0,
currentTime: 0.0,
controls: false,
paused: true,
skin: 'custom',
ignoreSilentSwitch: null,
isBuffering: false,}
     this.onLoad = this.onLoad.bind(this); 
 this.onProgress = this.onProgress.bind(this);
 this.onBuffer = this.onBuffer.bind(this);
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

onLoad(data) {
this.setState({duration: data.duration});
}
onProgress(data) {
this.setState({currentTime: data.currentTime});
}
onBuffer({ isBuffering }: { isBuffering: boolean }) {
this.setState({ isBuffering });
}
getCurrentTimePercentage() {
if (this.state.currentTime > 0) {return parseFloat(this.state.currentTime) / parseFloat(this.state.duration);} else {return 0;}}
renderSkinControl(skin) {
const isSelected = this.state.skin == skin;
const selectControls = skin == 'native' || skin == 'embed';
return (
<TouchableOpacity onPress={() => { this.setState({
controls: selectControls,
skin: skin
}) }}>
<Text style={[styles.controlOption, {fontWeight: isSelected ? "bold" : "normal"}]}>
{skin}
</Text>
</TouchableOpacity>
);
}
renderRateControl(rate) {
const isSelected = (this.state.rate == rate);
return (
<TouchableOpacity onPress={() => { this.setState({rate: rate}) }}><Text style={[styles.controlOption, {fontWeight: isSelected ? "bold" : "normal"}]}>
{rate}x
</Text>
</TouchableOpacity>
)
}
renderResizeModeControl(resizeMode) {
const isSelected = (this.state.resizeMode == resizeMode);
return (
<TouchableOpacity onPress={() => { this.setState({resizeMode: resizeMode}) }}>
<Text style={[styles.controlOption, {fontWeight: isSelected ? "bold" : "normal"}]}>
{resizeMode}
</Text>
</TouchableOpacity>
)
}
renderVolumeControl(volume) {
const isSelected = (this.state.volume == volume);
return (
<TouchableOpacity onPress={() => { this.setState({volume: volume}) }}>
<Text style={[styles.controlOption, {fontWeight: isSelected ? "bold" : "normal"}]}>
{volume * 100}%
</Text>
</TouchableOpacity>
)
}
renderIgnoreSilentSwitchControl(ignoreSilentSwitch) {
const isSelected = (this.state.ignoreSilentSwitch == ignoreSilentSwitch);
return (
<TouchableOpacity onPress={() => { this.setState({ignoreSilentSwitch: ignoreSilentSwitch}) }}>
<Text style={[styles.controlOption, {fontWeight: isSelected ? "bold" : "normal"}]}>
{ignoreSilentSwitch}
</Text>
</TouchableOpacity>
)
}
renderCustomSkin() {
const flexCompleted = this.getCurrentTimePercentage() * 100;
const flexRemaining = (1 - this.getCurrentTimePercentage()) * 100;
return (
<View style={styles.container}>
<TouchableOpacity style={styles.fullScreen} onPress={() => {this.setState({paused: !this.state.paused})}}>
<Video
source={{uri: this.state.dataSource.original}}
style={styles.fullScreen}
rate={this.state.rate}
paused={this.state.paused}
volume={this.state.volume}
muted={this.state.muted}
ignoreSilentSwitch={this.state.ignoreSilentSwitch}
resizeMode={this.state.resizeMode}
onLoad={this.onLoad}
onBuffer={this.onBuffer}
onProgress={this.onProgress}
onEnd={() => { AlertIOS.alert('Done!') }}
repeat={true}
/>
</TouchableOpacity>
<View style={styles.controls}>
<View style={styles.generalControls}>
<View style={styles.skinControl}>
{this.renderSkinControl('custom')}
{this.renderSkinControl('native')}
{this.renderSkinControl('embed')}
</View>
</View>
<View style={styles.generalControls}>
<View style={styles.rateControl}>
{this.renderRateControl(0.5)}
{this.renderRateControl(1.0)}
{this.renderRateControl(2.0)}
</View>
<View style={styles.volumeControl}>
{this.renderVolumeControl(0.5)}
{this.renderVolumeControl(1)}
{this.renderVolumeControl(1.5)}
</View>
<View style={styles.resizeModeControl}>
{this.renderResizeModeControl('cover')}{this.renderResizeModeControl('contain')}{this.renderResizeModeControl('stretch')}
</View>
</View>
<View style={styles.generalControls}>
{(Platform.OS === 'ios') ?<View style={styles.ignoreSilentSwitchControl}>{this.renderIgnoreSilentSwitchControl('ignore')}{this.renderIgnoreSilentSwitchControl('obey')}</View> : null}
</View>
<View style={styles.trackingControls}>
 <View style={styles.progress}>
 <View style={[styles.innerProgressCompleted, {flex: flexCompleted}]} />
 <View style={[styles.innerProgressRemaining, {flex: flexRemaining}]} />
</View>
</View>
</View>
</View>);}
renderNativeSkin() {
 const videoStyle = this.state.skin == 'embed' ?    styles.nativeVideoControls : styles.fullScreen;
 return (
<View style={styles.container}>
<View style={styles.fullScreen}>
 {/*<Video
  source={{uri: this.state.dataSource.original}}
 style={videoStyle}
 rate={this.state.rate}
 paused={this.state.paused}
 volume={this.state.volume} 
 muted={this.state.muted} 
 ignoreSilentSwitch={this.state.ignoreSilentSwitch}
 resizeMode={this.state.resizeMode} 
 onLoad={this.onLoad}
 onBuffer={this.onBuffer}
 onProgress={this.onProgress}
 onEnd={() => { AlertIOS.alert('Done!') }} 
 repeat={true}
 controls={this.state.controls}
/>*/}
</View>
<View style={styles.controls}>
 <View style={styles.generalControls}>
 <View style={styles.skinControl}>
 {this.renderSkinControl('custom')}
 {this.renderSkinControl('native')}
 {this.renderSkinControl('embed')}
 </View>
</View>
<View style={styles.generalControls}>
  <View style={styles.rateControl}>
    {this.renderRateControl(0.5)}
    {this.renderRateControl(1.0)} 
    {this.renderRateControl(2.0)}
  </View>
 <View style={styles.volumeControl}>         {this.renderVolumeControl(0.5)}
   {this.renderVolumeControl(1)}
   {this.renderVolumeControl(1.5)}
</View>
<View style={styles.resizeModeControl}>{this.renderResizeModeControl('cover')}{this.renderResizeModeControl('contain')}{this.renderResizeModeControl('stretch')}
</View>
</View>
<View style={styles.generalControls}>
{(Platform.OS === 'ios') ?<View style={styles.ignoreSilentSwitchControl}>
{this.renderIgnoreSilentSwitchControl('ignore')}{this.renderIgnoreSilentSwitchControl('obey')}</View> : null}
</View>
</View>
</View>);}

  render(){
    const theme = this.context;
     return this.state.controls ? this.renderNativeSkin() : this.renderCustomSkin();}
          
          
  
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

container: {
    flex: 1,
  },
  toolbar: {
    marginTop: 30,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
  },
  mediaPlayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'black',
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
  },
  container: {
 flex: 1,
 justifyContent: 'center',
 alignItems: 'center',
 backgroundColor: 'black'
},
fullScreen: {
 position: 'absolute',
 top: 0,
 left: 0,
 bottom: 0,
 right: 0,
},
controls: {
 backgroundColor: "transparent",
 borderRadius: 5,
 position: 'absolute', 
 bottom: 44,
 left: 4,
 right: 4,
},
progress: {
 flex: 1,
 flexDirection: 'row',
 borderRadius: 3,
 overflow: 'hidden',
},
innerProgressCompleted: {
 height: 20,
 backgroundColor: '#cccccc'
},
innerProgressRemaining: {
 height: 20,
 backgroundColor: '#2C2C2C',
},
generalControls: {
 flex: 1,
 flexDirection: 'row',
 overflow: 'hidden', 
 paddingBottom: 10,
},
skinControl: {
  flex: 1,
  flexDirection: 'row',
  justifyContent: 'center',
},
rateControl: {
 flex: 1,
 flexDirection: 'row',
 justifyContent: 'center',
},
volumeControl: {
 flex: 1,
 flexDirection: 'row',
 justifyContent: 'center',
},
resizeModeControl: {
 flex: 1,
 flexDirection: 'row',
 alignItems: 'center',
 justifyContent: 'center'
},
ignoreSilentSwitchControl: {
 flex: 1,
 flexDirection: 'row',
 alignItems: 'center',
 justifyContent: 'center'
},
controlOption: {
 alignSelf: 'center',
 fontSize: 11,
 color: "white",
 paddingLeft: 2,
 paddingRight: 2,
 lineHeight: 12,
},
nativeVideoControls: {
  top: 184,
  height: 300
}
});


/*

<View >
            <ScrollView style={{ color: theme === 'light' ? '#fff' : '#000', padding: 10 }}>

            

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
            
            </ScrollView>
          </View>*/
