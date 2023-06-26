import * as React from 'react';
import { FlatList, ActivityIndicator, useColorScheme, Appearance, Text, View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { ListItem, Icon, Image, Badge, Avatar } from 'react-native-elements';
import EStyleSheet from 'react-native-extended-stylesheet';
import { ThemeContext } from 'react-navigation';

const colorScheme = Appearance.getColorScheme();
export default class VideoPlaylist extends React.Component {

static contextType = ThemeContext;

static navigationOptions = ({ navigation, navigationOptions }) => {
    return {
      title: navigation.getParam('otherParam', 'Videos Playlist'),
    };
  };
  constructor(props){
    super(props);
    this.state ={ isLoading: true, dataSource:[]}
  }



  componentDidMount(){
    return fetch('https://www.googleapis.com/youtube/v3/playlists?key=AIzaSyAi5WzxpF2E6wmz-e1yu2nAg9lQWEM43Zg&channelId=UCWOAtXUd8F-MCx2-AfBE_8A&part=snippet%2CcontentDetails%2CcontentDetails&maxResults=50')
      .then((response) => response.json())
      .then((responseJson) => {

        this.setState({
          isLoading: false,
          dataSource: responseJson['items'],
        }, function(){

        });

      })
      .catch((error) =>{
        //console.error(error);
        alert(error);
      });
  }



  render(){
    const theme = this.context;
    const { navigate } = this.props.navigation;
    if(this.state.isLoading){
      return(
        <View style={{flex: 1, justifyContent: 'center',
              alignItems: 'center', color: '#ff6600'}}>
          <ActivityIndicator color = '#ff6600'></ActivityIndicator>
        </View>
      )
    }

    return(
      <View>
      
      <ScrollView>
    {
    this.state.dataSource.map((item, i) => (

      <ListItem Component={TouchableOpacity} key={item.id} bottomDivider containerStyle={{backgroundColor: 'transparent'}} onPress={() =>navigate('VideosPlaylistItems', { id: item.id, otherParam: item.snippet.title })}>
      <Avatar source={{ uri: item.snippet.thumbnails.high ? item.snippet.thumbnails.high.url: item.snippet.thumbnails.default  }} />
        <ListItem.Content>
          <ListItem.Title style={{ color: '#222'}} >{item.snippet.title}</ListItem.Title>
        </ListItem.Content>
        <Badge value={item.contentDetails.itemCount}  textStyle={{ color: '#fff', fontWeight: 'bold' }}/>
        <ListItem.Chevron />
      </ListItem>

      
    ))
  }
  </ScrollView>
      </View>


    );
  }
}
