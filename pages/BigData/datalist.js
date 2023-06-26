
import React from 'react';
import { FlatList, ActivityIndicator, View, ScrollView, StyleSheet, Alert, TouchableOpacity, Dimensions, Vibration } from 'react-native';
import { ThemeContext } from 'react-navigation';
import { ListItem, SearchBar } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
const { width, height } = Dimensions.get('window');
export default class DataList extends React.Component {
static contextType = ThemeContext;
  static navigationOptions = ({ navigation, navigationOptions }) => {

    return {
      title: navigation.getParam('otherParam', 'Big Data'),

      headerTitleContainerStyle: {
        marginLeft: 80,
        marginRight: 60
      },
     
    }
  };
  constructor(props){
    super(props);
    this.state ={ isLoading: true,
                  loadingMore: false, 
                  page: 0,
                  refreshing: false,
                  data: [],
                  search: '',
                  SearchVisible: false
                }
  }


  componentDidMount(){
    this.props.navigation.setParams({ searchIcon: this._setSearchVisible });
    this.fetchData();
  }

fetchData = () => {
    const { navigation } = this.props;
    const { page } = this.state;
     const itemId = navigation.getParam('id', 'NO-ID');
     

 return fetch("http://data.iita.org/api/3/action/group_package_show?id=" +itemId + "&limit=10")
      .then((response) => response.json())
      .then((responseJson) => {
         this.setState((prevState, nextProps) => ({
          data:
            page === 0
              ? responseJson.result
              : [...this.state.data, ...responseJson.result],
          isLoading: false,
          isLoadingSearch: false,
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
  this.fetchData();
}

onChangeText = (query) => {
  this.setState({ page: 0 });
  this.setState({ search: query });
  clearTimeout(this.timeout); // clears the old timer
  this.timeout = setTimeout(() => this.SearchData(this.state.search), 500);
}


 SearchData = (query) => {
    const { page } = this.state;
    if (query !== ""){
      this.setState({ isLoadingSearch: true });
    const url = 'http://data.iita.org/api/3/action/package_search?q='+ query + '&rows=10&start=' +page;
    return fetch(url)
      .then((response) => response.json())
      .then((responseJson) => {
         this.setState((prevState, nextProps) => ({
          data:
            page === 0
              ? responseJson.result.results
               : [...this.state.data, ...responseJson.result.results],
          isLoading: false,
          loadingMore: false,
          refreshing: false,
          isLoadingSearch: false
        }));

      })
      .catch((error) =>{
        this.setState({ error, isLoading: false, isLoadingSearch: false });
      Alert.alert(
      "Unknown Error",
      "Please check your internet connection and try again",
      [
        {
          text: "Cancel",
          onPress: () =>  this.props.navigation.navigate('Home'),
          style: "cancel"
        },
        { text: "OK"}
      ],
      { cancelable: false }
    );

       Vibration.vibrate();
      });
}
}



 _setSearchVisible = () => {
    const { SearchVisible } = this.state;

    if (SearchVisible){
      this.setState({ SearchVisible: false });
      this.fetchData();
    }
    if(!SearchVisible){
    this.setState({ SearchVisible: true });
  }
  }


  handleRefresh = () => {
    this.setState(
      {
        page: 0,
        refreshing: true
      },
      () => {
        this.fetchData();
      }
    );
  };


  handleLoadMore = () => {
    var resdata = Object.keys(this.state.data).length;
        if (resdata >= 1){
    this.setState(
      (prevState, nextProps) => ({
        page: prevState.page + 10,
        loadingMore: true
      }),
      () => {
        this.fetchData();
      }
    );
  }
  };


  ShowSearch = () => {
        const theme = this.context;

      if(this.state.SearchVisible === true){
      return(
     

      <SearchBar
        placeholder="Search ..."
        onChangeText={(query: string) => this.onChangeText(query)}
        value={this.state.search}
        containerStyle={{backgroundColor: 'transparent', elevation: 5}}
        platform='ios'
        onCancel={() => this._setSearchVisible()}
        showLoading={this.state.isLoadingSearch}
        lightTheme={false}
        inputContainerStyle={{backgroundColor: theme === 'light' ? '#fff' : '#222'}}
        inputStyle= {{color: theme === 'light' ? '#222' : '#ccc'}}
        placeholderTextColor= {{color: theme === 'light' ? '#222' : '#fff'}}
      />
      )
    }else { return null}
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
        <ActivityIndicator animating  color = '#ff6600' ></ActivityIndicator>
      </View>
    );
  };


  render(){
      const { navigate } = this.props.navigation;
      const theme = this.context;
      const ShowSearchs = this.ShowSearch;

      if(this.state.isLoading){
      return(
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', color: '#ff6600'}}>
          <ActivityIndicator color = '#ff6600' ></ActivityIndicator>
        </View>
      )
    }

    return (
      <View>
      <ShowSearchs />
      <FlatList
        data={this.state.data}
        renderItem={({ item }) => (
      
    <View>
      {/*<ListItem
      Component = {TouchableOpacity}
        leftIcon = {{name: 'database', type: 'font-awesome', color: '#ff6600'}}
        title={item.title}  onPress={() => { navigate('DataFile', { id: item.id , otherParam: item })}}
        titleStyle={{ color: theme === 'light' ? '#222' : '#fff'}}
        containerStyle={{backgroundColor: 'transparent'}}
        chevron
        bottomDivider
      ></ListItem>*/}


      <ListItem Component={TouchableOpacity} key={item.id} bottomDivider containerStyle={{backgroundColor: 'transparent'}}>
        <ListItem.Content>
          <ListItem.Title style={{ color: theme == 'light' ? '#222' : '#ffffff'}} onPress={() => { navigate('DataFile', { id: item.id , otherParam: item })}}>{item.title}</ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>

    </View>
        )}
        keyExtractor={item => item.id.toString()}
        ListFooterComponent={this.renderFooter}
        onRefresh={this.handleRefresh}
        refreshing={this.state.refreshing}
        onEndReached={this.handleLoadMore}
        onEndReachedThreshold={0.5}
        initialNumToRender={10}
      /></View>

    );
  }
}
