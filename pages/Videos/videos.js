import * as React from 'react';
import { FlatList, ActivityIndicator, StatusBar, Text, View, ScrollView, TouchableOpacity, StyleSheet, Image, Dimensions, Alert, Vibration } from 'react-native';
//import { ListItem, Image } from 'react-native-elements';
import { Icon, SearchBar } from 'react-native-elements';
//import DeviceInfo from 'react-native-device-info';
import { FlatGrid } from 'react-native-super-grid';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Avatar, Button, Card, Title, Paragraph, Divider, Searchbar } from 'react-native-paper';
import { ThemeContext } from 'react-navigation';
import axios from 'axios';


const { width, height } = Dimensions.get('window');

const axiosService = axios.create({
  baseURL: 'https://www.googleapis.com/youtube/v3/playlistItems?key=AIzaSyAi5WzxpF2E6wmz-e1yu2nAg9lQWEM43Zg&playlistId=UUWOAtXUd8F-MCx2-AfBE_8A&part=snippet,id&',
  timeout: 50000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const axiosSearch = axios.create({
  baseURL: 'https://www.googleapis.com/youtube/v3/search?key=AIzaSyAi5WzxpF2E6wmz-e1yu2nAg9lQWEM43Zg&channelId=UCWOAtXUd8F-MCx2-AfBE_8A&part=snippet,id&',
  timeout: 50000,
  headers: {
    'Content-Type': 'application/json'
  }
});
export default class Videos extends React.Component {
static contextType = ThemeContext;

static navigationOptions = ({navigation, navigationOptions}) => {
    return {
      headerTitle: 'Videos',
      tabBarLabel: "Videos",
      headerLeftContainerStyle: {
        paddingRight: 40
      },
    }
  }

  constructor(props){
    super(props);
    this.state ={ isLoading: true,
                  loadingMore: false, 
                  page: '',
                  refreshing: false,
                  data: [],
                  search: '',
                  modalVisible: false,
                  isLoadingSearch: false,
                  searchActive: false,
                  pageToken: ''
                }
  }

  componentDidMount(){
   this.fetchVideos();

  }

fetchVideos = () => {

    const { page } = this.state;
 return fetch('https://www.googleapis.com/youtube/v3/playlistItems?key=AIzaSyAi5WzxpF2E6wmz-e1yu2nAg9lQWEM43Zg&playlistId=UUWOAtXUd8F-MCx2-AfBE_8A&part=snippet,id&maxResults=10&pageToken='+page)
      .then((response) => response.json())
      .then((responseJson) => {
        var videosItem = responseJson['items'].filter(vid => {
          return vid.snippet.title != 'Private video' && vid.snippet.title != 'Deleted video';
        });
        var nextPageToken = responseJson.nextPageToken;
        var resultsPerPage = responseJson.pageInfo.resultsPerPage;
        console.log(nextPageToken);
        console.log(resultsPerPage);
        this.setState((prevState, nextProps) => ({
          data:
            page === ''
              ? videosItem
              : [...this.state.data, ...videosItem],
          isLoading: false,
          pageToken: nextPageToken,
          loadingMore: false,
          refreshing: false
        }));

      })
      .catch((error) =>{
        console.log(error);
        this.setState({ error, isLoading: false });
      Alert.alert(
      "Unknown Error",
      "Please check your internet connection and try again",
      [
        {
          text: "Cancel",
          onPress: () =>  this.props.navigation.navigate('Home'),
          style: "cancel"
        },
        { text: "Settings"}
      ],
      { cancelable: false }
    );
       Vibration.vibrate();
  });


}

onChangeText = (query) => {
  this.setState({ page: '' });
  this.setState({ search: query });
  clearTimeout(this.timeout); // clears the old timer
  this.timeout = setTimeout(() => this.SearchVideos(), 500);

}



 SearchVideos = () => {
    const { page } = this.state;
    if (this.state.search !== ""){
      this.setState({ isLoadingSearch: true });
    const url = 'https://www.googleapis.com/youtube/v3/search?key=AIzaSyAi5WzxpF2E6wmz-e1yu2nAg9lQWEM43Zg&channelId=UCWOAtXUd8F-MCx2-AfBE_8A&part=snippet,id&maxResults=10&q='+this.state.search+'&pageToken=' + page;
    console.log(url);
    return fetch(url)
      .then((response) => response.json())
      .then((responseJson) => {
        var videosItem = responseJson.items;
        videosItem = responseJson['items'].filter(vid => {
          return vid.snippet.title != 'Private video';
        });
        var resdata = Object.keys(videosItem).length;
        if (resdata > 0) {
        var nextPageToken = responseJson.nextPageToken;
        var resultsPerPage = responseJson.pageInfo.resultsPerPage;
        //console.log(nextPageToken);
        //console.log(resultsPerPage);
        this.setState((prevState, nextProps) => ({
          data:
            page === ''
              ? videosItem
              : [...this.state.data, ...videosItem],
          isLoading: false,
          pageToken: nextPageToken,
          loadingMore: false,
          refreshing: false,
          isLoadingSearch: false,
          searchActive: true
        }));
      }else{
        this.setState({
          isLoading: false,
          loadingMore: false,
          pageToken: '',
          refreshing: false,
          isLoadingSearch: false,
        });

      }

      })
      .catch(error => {
        this.setState({ error, isLoading: false, isLoadingSearch: false });
         Alert.alert(
      "Unknown Error",
      "Please check your internet connection and try again",
      [
        {
          text: "Ok",
          onPress: () =>  this.props.navigation.navigate('Home'),
          style: "cancel"
        },
        { text: "Retry", onPress: () =>  this.retrySearch()}
      ],
      { cancelable: false }
    );
          Vibration.vibrate();
      });
}
}

retrySearch = () =>{
  this.SearchVideos();
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
    var resdata = Object.keys(this.state.data).length;
        if (resdata > 0){
    this.setState(
      (prevState, nextProps) => ({
        page: prevState.pageToken,
        loadingMore: true
      }),
      () => {

         if (this.state.searchActive === true && resdata > 0) {this.SearchVideos(); }

        if (!this.state.searchActive){this.fetchVideos()}

          if (resdata < 20) {this.setState({loadingMore: false})}
        
      }
    );
  }
  };


ShowSearch = () => {
const theme = this.context;

    return (
        <SearchBar
        placeholder="Search videos..."
        onChangeText={(query) => this.onChangeText(query)}
        value={this.state.search}
        containerStyle={{backgroundColor: 'transparent'}}
        platform='ios'
        onCancel={() => this.fetchVideos()}
        showLoading={this.state.isLoadingSearch}
        lightTheme={false}
        inputContainerStyle={{backgroundColor: theme === 'light' ? '#ccc' : '#222'}}
        inputStyle= {{color: theme === 'light' ? '#222' : '#ccc'}}
        placeholderTextColor= {theme === 'light' ? '#222' : '#ccc'}
      />);
    
}

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
        <ActivityIndicator animating color = '#222' ></ActivityIndicator>
      </View>
    );
  };








  render(){
    const { navigate } = this.props.navigation;
    const theme = this.context;
    const ShowSearchs = this.ShowSearch;
    //const isTablet = DeviceInfo.isTablet();
    if(this.state.isLoading){
      return(
        <View style={{flex: 1, justifyContent: 'center',
              alignItems: 'center', color: '#222'}}>
          <ActivityIndicator color = '#222' size='large' ></ActivityIndicator>
        </View>
      )
    }


    return (
      <View>
       <StatusBar translucent backgroundColor="transparent" barStyle="light-content"  />

      <ShowSearchs />
      <FlatGrid
        itemDimension={300}
        spacing={20}
        data={this.state.data}
        renderItem={({ item }) => (
          <View>
           
    <Card style={{backgroundColor:'#fff'}} elevation={4} onPress={() =>navigate('VideoPlay', { id: item.snippet.resourceId.videoId, otherParam: item.snippet.title })}>
        <Card.Cover source={{ uri: item.snippet.thumbnails.high.url }} />
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


      </View>
    );
  }
}
