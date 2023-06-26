import * as React from 'react';
import { FlatList, ActivityIndicator, Text, View, ScrollView, TouchableOpacity, StyleSheet, Image, Dimensions, Alert, Vibration } from 'react-native';
//import { ListItem, Image } from 'react-native-elements';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Avatar, Button, Card, Title, Paragraph, Divider } from 'react-native-paper';
import { ThemeContext } from 'react-navigation';
import axios from 'axios';
import { FlatGrid } from 'react-native-super-grid';

const { width, height } = Dimensions.get('window');

const axiosService = axios.create({
  baseURL: 'https://www.googleapis.com/youtube/v3/playlistItems?key=AIzaSyAi5WzxpF2E6wmz-e1yu2nAg9lQWEM43Zg&part=snippet,id&',
  timeout: 50000,
  headers: {
    'Content-Type': 'application/json'
  }
});
export default class VideosPlaylistItems extends React.Component {
static contextType = ThemeContext;
static navigationOptions = ({ navigation, navigationOptions }) => {
    return {
      title: navigation.getParam('otherParam', 'Videos Playlist'),
    };
  };
  constructor(props){
    super(props);
    this.state ={ isLoading: true,
                  loadingMore: false, 
                  page: '',
                  refreshing: false,
                  data: [],
                }
  }





  componentDidMount(){

   this.fetchVideos();

  }

   fetchVideos = () => {

    const { page } = this.state;
    const { navigation } = this.props;
    const itemId = navigation.getParam('id', 'NO-ID');
    const URL = 'maxResults=10&playlistId='+ itemId + '&pageToken=' + page + '&maxResults=20';

    axiosService
      .request({
        url: URL,
        method: 'GET'
      })
      .then(response => {
        var resdata = Object.keys(response.data).length;
         if (resdata >0){
           var videosItem = response['data']['items'].filter(vid => {
          return vid.snippet.title != 'Private video' && vid.snippet.title != 'Deleted video';
        });

           console.log(JSON.stringify(videosItem));
        
        var nextPageToken = response.data['nextPageToken'];
        var resultsPerPage = response.data['pageInfo']['resultsPerPage'];
        //console.log(nextPageToken);
        //console.log(resultsPerPage);
        this.setState((prevState, nextProps) => ({
          data:
            page === ''
              ? Array.from(videosItem)
              : [...this.state.data, ...videosItem],
          isLoading: false,
          pageToken: nextPageToken,
          loadingMore: false,
          refreshing: false
        }));
      }
      })
      .catch(error => {
        alert(error);
        console.log(error);
         Vibration.vibrate();
        this.setState({ error, isLoading: false });
      });

}


  handleRefresh = () => {
    this.setState(
      {
        page: '',
        refreshing: true
      },
      () => {
        this.fetchVideos();
      }
    );
  };


  handleLoadMore = () => {
    if (this.state.pageToken){
    this.setState(
      (prevState, nextProps) => ({
        page: prevState.pageToken,
        loadingMore: true
      }),
      () => {
        this.fetchVideos();
        
      }
    );
  }
  };


 renderFooter = () => {
    if (!this.state.loadingMore) return null;

    return (
      <View
        style={{
          position: 'relative',
          width: width,
          height: height,
          paddingVertical: 20,
          borderTopWidth: 1,
          marginTop: 10,
          marginBottom: 10,
        }}
      >
        <ActivityIndicator animating color = '#ff6600' ></ActivityIndicator>
      </View>
    );
  };








  render(){
    const { navigate } = this.props.navigation;
    const theme = this.context;

    return !this.state.isLoading ? (


      <FlatGrid
        itemDimension={300}
        spacing={20}
        data={this.state.data}
        renderItem={({ item }) => (
          <View>
           
    <Card style={{backgroundColor: '#fff'}} elevation={4} onPress={() =>navigate('VideoPlay', { id: item.snippet.resourceId.videoId, otherParam: item.snippet.title })}>
        <Card.Cover source={{ uri: item.snippet.thumbnails ? item.snippet.thumbnails.default.url : item.snippet.thumbnails.maxres.url ? item.snippet.thumbnails.maxres.url :"http://s.ytimg.com/yts/img/no_thumbnail-vfl4t3-4R.jpg" }} />
          <Image source={require('./../assets/icons/plays.png')} style={{marginTop: -195, width: "100%", height: 195}}/>
        <Card.Title title="" subtitle={item.snippet.title}  subtitleStyle={{color: theme === 'light' ? '#222' : '#ccc'}}/>
    </Card>
          </View>
        )}
        keyExtractor={item => item.id.toString()}
        // ListHeaderComponent={this._renderHeader}
        ListFooterComponent={this.renderFooter}
        onRefresh={this.handleRefresh}
        refreshing={this.state.refreshing}
        onEndReached={this.handleLoadMore}
        onEndReachedThreshold={0.5}
        initialNumToRender={20}
      />

    ) : (
      <View style={{flex: 1, justifyContent: 'center',
              alignItems: 'center', color: '#ff6600'}}>
          <ActivityIndicator  color = '#ff6600'/>
        </View>
    );
  }
}
