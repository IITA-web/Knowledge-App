import React from "react";
import { ScrollView, Share, StyleSheet, View, TouchableOpacity, Text, ToastAndroid, Dimensions } from "react-native";
//import YouTubePlayer from "react-native-youtube-sdk";
import Icon from 'react-native-vector-icons/FontAwesome5';
import YouTube from 'react-native-youtube';
import Service from '../utils/service';

const { width, height } = Dimensions.get('window');

export default class VideoPlay extends React.Component {

static navigationOptions = ({ navigation, navigationOptions }) => {
    return {
      title: navigation.getParam('otherParam', 'Video'),
      headerRight: () => (
        <TouchableOpacity  style={{ paddingRight: 20}} onPress={navigation.getParam('share')}>
          <Icon name='share-alt' size={20} color='#ffffff' ></Icon>
        </TouchableOpacity>
      ),
    };
  };
  constructor(props){
    super(props);
    
  }
componentDidMount(){
this.props.navigation.setParams({ share: this.onShare });
}

  onShare = async () => {
    try {
      const result = await Share.share({
        message:
          this.props.navigation.getParam('otherParam') + ". " + 'https://youtube.com/watch?v='+this.props.navigation.getParam('id'),
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


  render() {
    const APIKEY = new Service();
    const { navigation } = this.props;
    const itemId = navigation.getParam('id', 'NO-ID');
    return (
      <View style={styles.container}>
        <ScrollView>
          {/*<YouTubePlayer
            ref={ref => (this.youTubePlayer = ref)}
            videoId= {itemId}
            autoPlay={true}
            fullscreen={false}
            showFullScreenButton={true}
            showSeekBar={true}
            showPlayPauseButton={true}
            startTime={5}
            style={{ width: "100%", height: 300 }}
            onReady={e => console.log("onReady", e.type)}
            onError={e => console.log("onError", e.error)}
            onChangeState={e => console.log("onChangeState", e.state)}
            onChangeFullscreen={e => console.log("onChangeFullscreen", e.isFullscreen)}
          />*/

            <YouTube
              apiKey= {APIKEY.YoutubeAPI()}
              videoId={itemId} // The YouTube video ID
              play = {true}
              fullscreen = {true}
              loop ={false}
              onReady={e => this.setState({ isReady: true })}
              onChangeState={e => this.setState({ status: e.state })}
              onChangeQuality={e => this.setState({ quality: e.quality })}
              onError={e => this.setState({ error: e.error })}
              style={{ alignSelf: 'stretch', height: width }}
            />
          }
        </ScrollView>
      </View>
    );
  }
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    backgroundColor: "red",
    margin: 12,
    padding: 12,
    borderRadius: 4,
  },
});