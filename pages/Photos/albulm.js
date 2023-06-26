import * as React from 'react';
import { FlatList, ActivityIndicator, Text, View, ScrollView, TouchableOpacity, StyleSheet, Image, Dimensions, Alert, Vibration } from 'react-native';
import { Badge, withBadge, ListItem, SearchBar  } from 'react-native-elements'
import EStyleSheet from 'react-native-extended-stylesheet';
import { Avatar, Button, Card, Title, Paragraph, Divider } from 'react-native-paper';
import { ThemeContext } from 'react-navigation';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { FlatGrid } from 'react-native-super-grid';
//import DeviceInfo from 'react-native-device-info';
const { width, height } = Dimensions.get('window');

export default class PhotosAlbulm extends React.Component {
  static contextType = ThemeContext;
static navigationOptions = ({ navigation, navigationOptions }) => {
    return {
      title: "Photos Albulms",
     
    headerTitleStyle: {
    },
  };
};

  constructor(props){
    super(props);
    this.state ={ isLoading: true,
                  loadingMore: false, 
                  page: 1,
                  refreshing: false,
                  data: [],
                  photoData: [],
                  ImageData : [],
                  activeTab: 0,
                  imageIndex: 0,
                  isImageViewVisible: false,
                  search: '',
                  SearchVisible: false,
                  isLoadingSearch: false,
                  searchActive: false
            }
    this.Footers = this.Footers.bind(this);
}





  componentDidMount(){
    this.props.navigation.setParams({ searchIcon: this._setSearchVisible });
    this.setState({imagDimension: 150});
   this.fetchPhotos();
  }

  _setSearchVisible = () => {
    const { SearchVisible } = this.state;

    if (SearchVisible){
      this.setState({ SearchVisible: false });
      this.setState({searchActive: false})
      this.fetchPhotos();
    }
    if(!SearchVisible){
    this.setState({ SearchVisible: true });
  }
  }

  fetchPhotos = () => {
    const { page } = this.state;
    fetch('https://www.flickr.com/services/rest/?method=flickr.photosets.getList&api_key=f150eb83ccc18bfae28b269e0d2f6e0f&user_id=45796762%40N03&per_page=30&primary_photo_extras=url_m&format=json&nojsoncallback=1&page='+page)
      .then((response) => response.json())
      .then((responseJson) => {
        const photoData = responseJson['photosets']['photoset'];
        console.log(photoData)
         var resdata = responseJson['photosets']['photoset'].length;
         if (resdata > 0){
        this.setState((prevState, nextProps) => ({
          data:
            page === 1
              ? Array.from(photoData)
              : [...this.state.data, ...photoData],
          isLoading: false,
          loadingMore: false,
          refreshing: false,
          //ImageViewData: ImageDataArray,
        }));}
        else{
           this.setState({
          isLoading: false,
          loadingMore: false,
          refreshing: false,
        });
        }
      })
      .catch(error => {
        this.setState({ error, isLoading: false });
        console.log(error);
         Alert.alert(
      "Unknown Error",
      "Please check your internet connection and try again",
      [
        {
          text: "Ok",
          onPress: () =>  this.props.navigation.navigate('Home'),
          style: "cancel"
        },
        { text: "Retry", onPress: () =>  this.retry()}
      ],
      { cancelable: false }
    );
          Vibration.vibrate();
      });
}

retry = () =>{
  this.fetchPhotos();
}


onChangeText = (query) => {
  this.setState({ page: 1 });
  this.setState({ search: query });
  clearTimeout(this.timeout); // clears the old timer
  this.timeout = setTimeout(() => this.SearchPhotos(), 500);

}

 SearchPhotos = () => {
    const { page } = this.state;
if (this.state.search !== ""){
  this.setState({ isLoadingSearch: true });
  fetch('https://www.flickr.com/services/rest?method=flickr.photos.search&api_key=f150eb83ccc18bfae28b269e0d2f6e0f&user_id=45796762%40N03&text='+ this.state.search + '&min_upload_date=&max_upload_date=&min_taken_date=&max_taken_date=&extras=date_upload,date_taken,last_update,geo,tags,views,media,url_m,url_l,url_o&per_page=30&format=json&nojsoncallback=1&page=' + page)
      .then((response) => response.json())
      .then((responseJson) => {
        const photoData = responseJson['photos']['photo'];
         var resdata = responseJson['photosets']['photoset'].length;
         if (resdata >= 1){
        this.setState((prevState, nextProps) => ({
          data:
            page === 1
              ? Array.from(photoData)
              : [...this.state.data, ...photoData],
          isLoading: false,
          loadingMore: false,
          refreshing: false,
          isLoadingSearch: false,
          searchActive: true
        }));}

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
  this.SearchPhotos();
}



  ShowSearch = () => {
      const theme = this.context;
      if(this.state.SearchVisible === true){
      return(
      <SearchBar
        placeholder="Search Photos..."
        onChangeText={(query: string) => this.onChangeText(query)}
        value={this.state.search}
        containerStyle={{backgroundColor: 'transparent'}}
        platform='ios'
        onCancel={() => this._setSearchVisible()}
        showLoading={this.state.isLoadingSearch}
        lightTheme={false}
        inputContainerStyle={{backgroundColor: theme === 'light' ? '#ccc' : '#222'}}
        inputStyle= {{color: theme === 'light' ? '#222' : '#ccc'}}
        placeholderTextColor= { theme === 'light' ? '#222' : '#ccc'}
      />
      )
    }else { return null}
}

  handleRefresh = () => {
    this.setState(
      {
        page: 1,
        refreshing: true
      },
      () => {
        this.fetchPhotos();
      }
    );
  };


  handleLoadMore = () => {
    var resdata = Object.keys(this.state.data).length;
        if (resdata >= 1){
    this.setState(
      (prevState, nextProps) => ({
        page: prevState.page + 1,
        loadingMore: true
      }),
      () => {
        if (this.state.searchActive === true && resdata > 0) {this.SearchPhotos(); }
        if (this.state.searchActive === false){this.fetchPhotos();}
        if (resdata < 10) {this.setState({loadingMore: false})}
      }
    );
  }
  };



 Footers({title}) {
        const {likes} = this.state;
        return (
            <View style={styles.footer}>
                <Text style={styles.footerText}>{title}</Text>
            </View>
        );
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
    const {isImageViewVisible, activeTab, imageIndex, imagDimension} = this.state;

    if(this.state.isLoading){
      return(
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', color: '#222'}}>
          <ActivityIndicator size="large" color = '#222' ></ActivityIndicator>
        </View>
      )
    }  
    return  (
      <View>
      <ShowSearchs />
      <FlatGrid
      itemDimension={imagDimension}
      spacing={1}
        data={this.state.data}
        renderItem={({ item }) => (
        <View>
          <View>

            <TouchableOpacity onPress={() => { navigate('Photos', { id: item.id, title: item.title._content })}}>
            <Image source={{ uri: item.primary_photo_extras.url_m }} style={{width: '100%', height: 150}}/>
             <Badge containerStyle={{ position: 'absolute', top: 10, right: 10, }} badgeStyle={{backgroundColor: "#222"}} size="large"  value={<Icon name='camera' color='#fff' > { item.count_photos } </Icon> } />
            <View style={{marginTop: -60, height: 60, color: '#fff', backgroundColor: 'rgba(0, 0, 0, 0.5)', alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{color: '#fff', textAlign: 'center', padding: 5}}>{item.title._content}</Text>
            </View> 
            </TouchableOpacity>
          </View>
        </View>
        )}
        keyExtractor={item => item.id.toString()}
        ListFooterComponent={this.renderFooter}
        onRefresh={this.handleRefresh}
        refreshing={this.state.refreshing}
        onEndReached={this.handleLoadMore}
        onEndReachedThreshold={0.5}
        initialNumToRender={30}
      />
      </View>
    );
  }
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
        paddingTop: Platform.select({ios: 0, android: 10}),
    },
    tabs: {
        flexDirection: 'row',
    },
    tab: {
        flex: 1,
        height: 30,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    tabTitle: {
        color: '#EEE',
    },
    tabTitleActive: {
        fontWeight: '700',
        color: '#FFF',
    },
    footer: {
        width,
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    footerButton: {
        flexDirection: 'row',
        marginLeft: 15,
    },
    footerText: {
        fontSize: 16,
        color: '#FFF',
        textAlign: 'center',
    },
});