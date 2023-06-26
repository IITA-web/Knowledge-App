import React, { useEffect, useState } from "react";
import { StyleSheet, Pressable, View, SafeAreaView, Text, Image, Appearance, ImageBackground, TouchableOpacity, Touchablewithoutfeedback, Platform, AppRegistry, ListView, Dimensions, Slider, TouchableHighlight, StatusBar, ScrollView} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import LottieView from 'lottie-react-native';
import TrackPlayer, { State } from "react-native-track-player";
const localTrack = 'https://s3.radio.co/sb3fb8fe8d/listen';


const RadioScreen = () =>{

    const [trackTitle, setTrackTitle] = useState('');
    const [playing, setPlaying] = useState(false);
    const playerState = ''

      useEffect(() => {
        _icy();
        watchPlayer();
        setup()
      }, []);


    async function watchPlayer(){
      const state = await TrackPlayer.getState();
      setInterval(() => {
        //console.log(State)
        if (state == State.Playing) {
          setPlaying(true);
          console.log('The player is playing');
        }
      }, 100); 
    }


      async function setup() {
        await TrackPlayer.setupPlayer();

        // Add a track to the queue
        await TrackPlayer.add({
            id: 'trackId',
            url: localTrack,
            title: 'Radio IITA',
            artist: trackTitle,
            artwork: require('../image/radio.png')
        });

        // Start playing it
        //await TrackPlayer.play();
      }

    function _icy(){
      setInterval(() => {
       fetch('https://ireport.iita.org/dontdelete.php')
          .then((response) => response.json())
          .then((responseJson) => {
            let title = responseJson['title'];
            console.log(title);
            if (title != null){
              setTrackTitle(title);

              TrackPlayer.updateOptions({
                  setTrackTitle: title
              });
            }
          })
          .catch((error) =>{
            //console.error(error);
          }); 

      }, 10000); 
    }

      async function togglePlayback() {
        const playerState = await TrackPlayer.getState();
        const currentTrack = await TrackPlayer.getCurrentTrack();
        const artworkss = require('../image/radio.png');
        //console.log(playerState);
        if (currentTrack == null) {
          await TrackPlayer.reset();
          setup();
          setPlaying(true);
        } else {
          if (playerState == State.Playing) {
            await TrackPlayer.stop();
            setPlaying(false);
          }else{
          	await TrackPlayer.play();
            setPlaying(true);
          }
        }
      }

      return (
        <Pressable style={{backgroundColor:'#fff', width: '100%', height: 200, borderTopRightRadius : 50,borderTopLeftRadius : 50, padding: 20, shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 8,
          },
          shadowOpacity: 0.90,
          shadowRadius: 8,

          elevation: 10,}}>
            <View style={{flexDirection: 'row', alignItems:'center', justifyContent:'space-between' }}>
              <View style={{flexDirection: 'row', width:'80%' }}>
                <Image source={require('../image/radio.png')} style={{width: 75, height: 80}}/>
                <View style={{flexDirection: 'column', justifyContent: 'center'}}>
                  <Text style={{fontWeight: 'bold', fontSize: 20, color: '#555'}}>Listen to Radio IITA</Text>
                  { trackTitle && playing ? <Text numberOfLines={1} style={{fontSize: 15, color: '#555', width:'100%'}}>{trackTitle}</Text>:<Text numberOfLines={1} style={{fontSize: 15, color: '#555', width:'100%'}}>Knowledge for agriculture</Text>}
                </View>
              </View>

              { !playing ?

                <View style={{borderColor: '#666', borderWidth: 1, width: 35, height: 35, borderRadius: 50, justifyContent:'center', alignItems:'center'}}>
                  <View style={{backgroundColor: '#666', width: 17, height: 17, borderRadius: 50}}>
                  </View>
                </View>
                :
                <LottieView source={require('../image/equalizer.json')} autoPlay loop style={{width: 70, height: 70, marginBottom: 10}} />
              }
            </View>

            <View style={{flexDirection: 'row', alignItems:'center', justifyContent:'center', paddingTop: 15 }}>
              <Icon name='step-backward' style={{paddingRight: 60}} size={22} color='#999' ></Icon>
              { !playing ? <TouchableOpacity style={{backgroundColor: '#ff6600', width: 50, height: 50, borderRadius: 100, justifyContent:'center', alignItems:'center'}} onPress={()=>togglePlayback()}><Icon name='play' size={20} color='#fff' ></Icon></TouchableOpacity>
                :
                <TouchableOpacity style={{backgroundColor: '#ff6600', width: 50, height: 50, borderRadius: 100, justifyContent:'center', alignItems:'center'}} onPress={()=>togglePlayback()}><Icon name='pause' size={20} color='#fff' ></Icon></TouchableOpacity>
              }
              <Icon name='step-forward' style={{paddingLeft: 60}} size={22} color='#999' ></Icon>
            </View>
        </Pressable>

      );    
}

export default RadioScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    borderRadius: 8
  },
});