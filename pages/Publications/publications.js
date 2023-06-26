
import React from 'react';
import { FlatList, ActivityIndicator, Dimensions, SafeAreaView, RefreshControl, Alert, Text, View, ScrollView, StyleSheet, TouchableOpacity, Vibration } from 'react-native';
import { ListItem, Icon, Badge } from 'react-native-elements';
import { ThemeContext } from 'react-navigation';
import Service from '../utils/service';
const { width, height } = Dimensions.get('window');

export default class Publication extends React.Component {
static contextType = ThemeContext;
  static navigationOptions = ({ navigation, navigationOptions }) => {
    return {
      title: navigation.getParam('otherParam', 'Publications'),
    };
  };
  constructor(props){
    super(props);
    this.state ={ isLoading: true,
                  loadingMore: false, 
                  page: 0,
                  refreshing: false,
                  data: [],}

    URL = new Service();
  }




  componentDidMount(){

   this.fetchCollections();

  }

   fetchCollections = () => {
    const { navigation } = this.props;
    const itemId = navigation.getParam('id', 'NO-ID');

    const { page } = this.state;
    //console.log(URL.Publications());

    fetch(URL.Publications()+'filter')
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson)
         var resdata = Object.keys(responseJson.items).length;
         if (resdata >= 1){
        this.setState((prevState, nextProps) => ({
          data:
            page === 0
              ? Array.from(responseJson.items)
              : [...this.state.data, ...responseJson.items],
          isLoading: false,
          loadingMore: false,
          refreshing: false,
          responseData: resdata,
        }))}
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
  this.fetchCollections();
}


  handleRefresh = () => {
    this.setState(
      {
        page: 0,
        refreshing: true
      },
      () => {
        this.fetchCollections();
      }
    );
  };


  handleLoadMore = () => {
    var resdata = Object.keys(this.state.data).length;
        //console.log(resdata);
        if (this.state.responseData == 20 ){
    this.setState(
      (prevState, nextProps) => ({
        page: prevState.page + 20,
        loadingMore: true
      }),
      () => {
        this.fetchCollections();
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
        }}
      >
        <ActivityIndicator animating  color = '#ff6600' ></ActivityIndicator>
      </View>
    );
  };



  render(){
      const { navigate } = this.props.navigation;
      const theme = this.context;
    return !this.state.isLoading ? (
      <SafeAreaView>
      <ScrollView
        refreshControl={
        <RefreshControl
         refreshing={this.state.refreshing}
         onRefresh={this.handleRefresh}
         title="Refreshing"
         color="#ff6600"
         tintColor="#ff6600"
         titleColor="#ff6600"
      />
      }
      >



      <FlatList
        data={this.state.data}
        renderItem={({ item }) => (

        <ListItem Component={TouchableOpacity} key={item.uuid} bottomDivider containerStyle={{backgroundColor: 'transparent'}}>
          <ListItem.Content>
            <ListItem.Title style={{ color: theme == 'light' ? '#222' : '#ffffff'}}  onPress={() => { navigate('PublicationFile', { id: item.uuid, otherParam: item })}}>{item.name} </ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>

              )}
        keyExtractor={item => item.uuid.toString()}
        ListFooterComponent={this.renderFooter}
        onEndReached={this.handleLoadMore}
        onEndReachedThreshold={0.5}
        initialNumToRender={20}
      />
      </ScrollView>
      </SafeAreaView>
    ) : (
      <View style={{flex: 1, justifyContent: 'center',
              alignItems: 'center', color: '#ff6600'}}>
          <ActivityIndicator  color = '#ff6600' />
        </View>
    );
  }
}
