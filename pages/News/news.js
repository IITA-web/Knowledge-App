
import React from 'react';
import { FlatList, StatusBar, ActivityIndicator, Text, View, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Alert, Modal, TouchableHighlight, Vibration } from 'react-native';
import { ListItem, Image, SearchBar } from 'react-native-elements';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Avatar, Button, Card, Title, Paragraph, TouchableRipple, Divider, List, Colors, Searchbar } from 'react-native-paper';
import moment from 'moment';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { ThemeContext } from 'react-navigation';
import axiosService from '../utils/lib/axiosService';
//import DeviceInfo from 'react-native-device-info';
import { FlatGrid } from 'react-native-super-grid';
import ActionSheet from 'react-native-action-sheet';

const { width, height } = Dimensions.get('window');
//const isTablet = DeviceInfo.isTablet();

export default class News extends React.Component{
  static contextType = ThemeContext;
  static navigationOptions = ({navigation, navigationOptions}) => {
    return {
      title: 'News',
      headerRight: () => (
        <View  style={{flex:1, justifyContent: "center",alignItems: "center"}}>
        <TouchableOpacity  style={{ paddingRight: 80, top: 10}} onPress={navigation.getParam('showDialog')}>
          <Icon name='sliders-h' size={20} color='#ffffff' ></Icon>
        </TouchableOpacity>

        <TouchableOpacity  style={{ paddingRight: 0, bottom: 10}} onPress={navigation.getParam('searchIcon')}>
          <Icon name='search' size={20} color='#ffffff' />
        </TouchableOpacity>
        </View>
      ),
    }
  }

  constructor(props){
    super(props);
    this.state ={ isLoading: true,
        loadingMore: false,
        page: 1,
        refreshing: false,
        data: [],
        search: '',
        SearchVisible: false,
        isLoadingSearch: false,
        searchActive: false,
        catId: ''
      };
    }

  componentDidMount(){
    this.props.navigation.setParams({ searchIcon: this._setSearchVisible });
    this.props.navigation.setParams({ showDialog: this._filterByCategory });
    this.fetchNews();

  }


fetchNews = () => {
    const { page } = this.state;
    const URL = '?per_page=10&_embed&page='+page+'&'+this.state.catId;
    axiosService
      .request({
        url: URL,
        method: 'GET'
      })
      .then(response => {
        this.setState((prevState, nextProps) => ({
          data:
            page === 1
              ? Array.from(response.data)
              : [...this.state.data, ...response.data],
          isLoading: false,
          loadingMore: false,
          refreshing: false
        }));

        console.log(JSON.stringify(response.data));''
      })
      .catch(error => {
        this.setState({ error, isLoading: false });
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
          console.log(error);
      });
}

retry = () =>{
  this.fetchNews();
}

onChangeText = (query) => {
  this.setState({ page: 1 });
  this.setState({ search: query });
  clearTimeout(this.timeout); // clears the old timer
  this.timeout = setTimeout(() => this.SearchNews(), 500);

}

 SearchNews = () => {
    const { page } = this.state;
if (this.state.search !== ""){
  this.setState({ isLoadingSearch: true });
    const URL = '?search='+ this.state.search + '&per_page=10&orderby=title&page=' + page;

    axiosService
      .request({
        url: URL,
        method: 'GET'
      })
      .then(response => {
        var resdata = Object.keys(response.data).length;
         if (resdata > 0){
        this.setState((prevState, nextProps) => ({
          data:
            page === 1
              ? response.data
              : [...this.state.data, ...response.data],
          isLoading: false,
          loadingMore: false,
          refreshing: false,
          isLoadingSearch: false,
          searchActive: true
        }));
      }else{

          this.setState({
          isLoading: false,
          loadingMore: false,
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
  this.SearchNews();
}



  _setSearchVisible = () => {
    const { SearchVisible } = this.state;

    if (SearchVisible){
      this.setState({ SearchVisible: false });
      this.setState({searchActive: false})
      this.fetchNews();
    }
    if(!SearchVisible){
    this.setState({ SearchVisible: true });
  }
  }


_filterByCategory = () => {
  this.setState({ showModal: false });
      var BUTTONS = ["All", "Agribusiness", "Bulletin story", "Capacity development", "Climate", "Crop Breeding", "Crop Improvement", "Digital tools", "Featured", "Nutrition", "Partnerships", "Plant Health", "Soil Management", "Strategy", "Sustainability", "Youth", "Close"];
      const theme = this.context;
 
      var DESTRUCTIVE_INDEX = 16;
      var CANCEL_INDEX = 16;
 
  ActionSheet.showActionSheetWithOptions({
  options: BUTTONS,
  cancelButtonIndex: CANCEL_INDEX,
  destructiveButtonIndex: DESTRUCTIVE_INDEX,
  tintColor: theme == 'light' ? '#000' : '#fff'
},
(buttonIndex) => {
        if (buttonIndex == 0) {
          this.setState({catId: ''});
          //this.setState({ isLoading: true });
          this.fetchNews();
        } 
       else if (buttonIndex == 1) {
          this.setState({catId: 'categories=983', isLoading: true});
          //this.setState({ isLoading: true });
          this.fetchNews();
        } else if (buttonIndex == 2) {
          this.setState({catId: 'categories=8', isLoading: true});
         // this.setState({ isLoading: true });
          this.fetchNews();
        }
        else if (buttonIndex == 3) {
          this.setState({catId: 'categories=991', isLoading: true});
          //this.setState({ isLoading: true });
          this.fetchNews();
        }
        else if (buttonIndex == 4) {
          this.setState({catId: 'categories=987', isLoading: true});
          //this.setState({ isLoading: true });
          this.fetchNews();
        }
        else if (buttonIndex == 5) {
          this.setState({catId: 'categories=979', isLoading: true});
          //this.setState({ isLoading: true });
          this.fetchNews();
        } else if (buttonIndex == 6) {
          this.setState({catId: 'categories=980', isLoading: true});
          //this.setState({ isLoading: true });
          this.fetchNews();
        }
        else if (buttonIndex == 7) {
          this.setState({catId: 'categories=1001', isLoading: true});
         // this.setState({ isLoading: true });
          this.fetchNews();
        }
        else if (buttonIndex == 8) {
          this.setState({catId: 'categories=1', isLoading: true});
         // this.setState({ isLoading: true });
          this.fetchNews();
        }
        else if (buttonIndex == 9) {
          this.setState({catId: 'categories=990', isLoading: true});
          //this.setState({ isLoading: true });
          this.fetchNews();
        } else if (buttonIndex == 10) {
          this.setState({catId: 'categories=984', isLoading: true});
         // this.setState({ isLoading: true });
          this.fetchNews();
        }
        else if (buttonIndex == 11) {
          this.setState({catId: 'categories=978', isLoading: true});
          //this.setState({ isLoading: true });
          this.fetchNews();
        }
        else if (buttonIndex == 12) {
          this.setState({catId: 'categories=982', isLoading: true});
         // this.setState({ isLoading: true });
          this.fetchNews();
        }
        else if (buttonIndex == 13) {
          this.setState({catId: 'categories=1091', isLoading: true});
          //this.setState({ isLoading: true });
          this.fetchNews();
        } else if (buttonIndex == 14) {
          this.setState({catId: 'categories=981', isLoading: true});
         // this.setState({ isLoading: true });
          this.fetchNews();
        }
        else if (buttonIndex == 15) {
          this.setState({catId: 'categories=985', isLoading: true});
         // this.setState({ isLoading: true });
          this.fetchNews();
        }
      });
  }



  handleRefresh = () => {
    this.setState(
      {
        page: 1,
        refreshing: true
      },
      () => {
        this.fetchNews();
      }
    );
  };


  handleLoadMore = () => {
    var resdata = Object.keys(this.state.data).length;
        if (resdata > 1){
      this.setState(
        (prevState, nextProps) => ({
          page: prevState.page + 1,
          loadingMore: true
        }),
        () => {
          if (this.state.searchActive === true && resdata > 0) {this.SearchNews(); }
          if (this.state.searchActive === false){this.fetchNews();}
          if (resdata < 10) {this.setState({loadingMore: false})}
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
          borderTopWidth: 0,
          marginTop: 10,
          marginBottom: 10,
        }}>
          <ActivityIndicator animating={true} size='large' color = '#222' ></ActivityIndicator>
      </View>
    );
  };


  ShowSearch = () => {
        const theme = this.context;
      if(this.state.SearchVisible === true){
      return(
      <SearchBar
        placeholder="Search ..."
        onChangeText={(query) => this.onChangeText(query)}
        value={this.state.search}
        containerStyle={{backgroundColor: 'transparent'}}
        platform='ios'
        onCancel={() => this._setSearchVisible()}
        showLoading={this.state.isLoadingSearch}
        lightTheme={false}
        inputContainerStyle={{backgroundColor:'#222'}}
        inputStyle= {{color: '#ccc'}}
        placeholderTextColor= { '#ccc'}
      />
      )
    }else { return null}
}

  render(){
    const { navigate } = this.props.navigation;
    const theme = this.context;
    const ShowSearchs = this.ShowSearch;

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
       <StatusBar barStyle="light-content"  />

      <ShowSearchs />
      <FlatGrid
        itemDimension={300}
        spacing={20}
        data={this.state.data}
        renderItem={({ item }) => (
          <View>
            <Card style={{backgroundColor: '#fff'}} elevation={4} onPress={() => { navigate('NewsContent', { id: item.id , otherParam: item.title.rendered })}}>
                <Card.Cover source={{ uri: item.featured_image_url ? item.featured_image_url : "http://s.ytimg.com/yts/img/no_thumbnail-vfl4t3-4R.jpg" }} onPress={() => { navigate('NewsContent', { id: item.id , otherParam: item.title.rendered })}} />
                      <Text  style={{flexWrap: 'wrap', height: 70, padding: 15, color: '#555' }}  onPress={() => { navigate('NewsContent', { id: item.id , otherParam: item.title.rendered })}} >{item.title.rendered}</Text>
                    <Divider />
                  <Card.Actions style={{marginLeft: 15, marginRight: 10, marginTop: -15, marginBottom: -15}} >
                    <List.Icon color={Colors.orange800} icon="thumb-up" /> 
                      <Text style={{color: '#555', paddingRight: 20, marginLeft: -10}}>{item.metadata.likes ? item.metadata.likes : 0}</Text>
                      <List.Icon color={Colors.blue500} icon="eye" />
                      <Text style={{color: '#555', paddingRight: 30, marginLeft: -10}}>{item.metadata.views ? item.metadata.views: 0}</Text>
                      <Text style={{color: '#555'}}>{moment(item.date).format("MMM. Do, YYYY")} </Text>
                  </Card.Actions>
            </Card>
          </View>
        )}
        keyExtractor={item => item}
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

