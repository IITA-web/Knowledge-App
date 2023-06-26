import * as React from 'react';
import { FlatList, ActivityIndicator, Text, View, ScrollView, TouchableOpacity, StyleSheet, Image, Dimensions, Alert, Vibration } from 'react-native';
//import { ListItem, Image } from 'react-native-elements';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Avatar, Button, Card, Title, Paragraph, Divider } from 'react-native-paper';
import { ThemeContext } from 'react-navigation';
import { FlatGrid } from 'react-native-super-grid';

import axios from 'axios';

const { width, height } = Dimensions.get('window');

const axiosService = axios.create({
  baseURL: 'http://ireport.iita.org/ireport/',
  timeout: 50000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default class iReportVideo extends React.Component {
  static contextType = ThemeContext;
static navigationOptions = ({ navigation, navigationOptions }) => {
    return {
      title: "iReport Videos",
      
    };
  };

  constructor(props){
    super(props);
    this.state ={ isLoading: true,
                  loadingMore: false, 
                  page: 1,
                  refreshing: false,
                  data: [],}
  }




  componentDidMount(){

   this.fetchIreportVideos();

  }

   fetchIreportVideos = () => {

    const { page } = this.state;

    const URL = 'videoJson.php?page='+page;

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
      });
}

retry = () =>{
  this.fetchIreportVideos();
}




  handleRefresh = () => {

    this.setState(
      {
        page: 1,
        refreshing: true
      },
      () => {
        this.fetchIreportVideos();
      }
    );
  };


  handleLoadMore = () => {
    var resdata = Object.keys(this.state.data).length;
        if (resdata == 20){
    this.setState(
      (prevState, nextProps) => ({
        page: prevState.page + 1,
        loadingMore: true
      }),
      () => {
        this.fetchIreportVideos();
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
        <ActivityIndicator animating color = '#ff6600' />
      </View>
    );
  };




    render(){
    const { navigate } = this.props.navigation;
    const theme = this.context;

    return !this.state.isLoading ? (

      <FlatGrid
      itemDimension={130}
        data={this.state.data}
        renderItem={({ item }) => (
          <View>
           
    <Card style={{backgroundColor: theme === 'light' ? '#fff' : '#222'}} elevation={4} onPress={() => { navigate('iReportVideosDetails', { title: item.title , data: item })}}>
        <Card.Cover source={{ uri: item.downloadurl }}/>
        <Card.Title title="" subtitle={item.title}  subtitleStyle={{color: theme === 'light' ? '#222' : '#ccc'}} />
    </Card>
          </View>
        )}
        keyExtractor={item => item.id.toString()}
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