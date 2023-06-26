
import React, { useState } from 'react';
import { FlatList, ActivityIndicator, Text, View, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Alert, Vibration, Animated } from 'react-native';
import { ListItem, SearchBar } from 'react-native-elements';
import { Modal, Dialog, Provider, Portal, Paragraph, Button } from 'react-native-paper';
import { ThemeContext } from 'react-navigation';
//import SearchBar from 'react-native-search-bar';
import Icon from 'react-native-vector-icons/FontAwesome5';
import axiosService from '../utils/lib/projects';
import ActionSheet from 'react-native-action-sheet';

const { width, height } = Dimensions.get('window');

export default class Projects extends React.Component {
static contextType = ThemeContext;

   static navigationOptions = ({navigation, navigationOptions}) => {
    return {
      title: 'Projects',
      headerLeftContainerStyle: {
        paddingRight: 40
      },
      headerRight: () => (
        <View  style={{flex:1, justifyContent: "center",alignItems: "center"}}>
        <TouchableOpacity  style={{ paddingRight: 80, top: 10}} onPress={navigation.getParam('showDialog')}>
          <Icon name='sliders-h' size={20} color='#fff' ></Icon>
        </TouchableOpacity>

        <TouchableOpacity  style={{ paddingRight: 0, bottom: 10}} onPress={navigation.getParam('searchIcon')}>
          <Icon name='search' size={20} color='#fff' />
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
                  showModal: false,
                  hub: 'https://iita.org/wp-json/wp/v2/iita-project?per_page=20&_embed&page='
                }
  }




  componentDidMount(){
this.props.navigation.setParams({ searchIcon: this._setSearchVisible });

this.props.navigation.setParams({ showDialog: this.showModal });
//this.props.navigation.setParams({ showDialog: this._showDialog, EventList: [] });
   this.fetchProjects();
   //this.refs.searchBar.focus();
}

  UNSAFE_componentWillUnmount() {
  clearTimeout(this.timeout);
}

fetchProjects = () => {
const { page } = this.state;
fetch(this.state.hub)
 return fetch(this.state.hub+page)
      .then((response) => response.json())
      .then((responseJson) => {
         this.setState((prevState, nextProps) => ({
          data:
            page === 1
              ? responseJson
              : [...this.state.data, ...responseJson],
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
  this.fetchProjects();
}

_filterByHub = () => {
  this.setState({ showModal: false });
      var BUTTONS = ["All", "Western Africa Hub", "Central Africa Hub", "Eastern Africa Hub", "Southern Africa Hub", "Close"];
      const theme = this.context;
 
      var DESTRUCTIVE_INDEX = 5;
      var CANCEL_INDEX = 5;
 
  ActionSheet.showActionSheetWithOptions({
  options: BUTTONS,
  cancelButtonIndex: CANCEL_INDEX,
  destructiveButtonIndex: DESTRUCTIVE_INDEX,
  tintColor: theme === 'light' ? '#000' : '#fff'
},
(buttonIndex) => {
        if (buttonIndex === 0) {
          this.setState({hub: "https://iita.org/wp-json/wp/v2/iita-project?per_page=20&_embed&page=", isLoading: true});
          this.fetchProjects();
        } 
       else if (buttonIndex === 1) {
          this.setState({hub: "https://iita.org/wp-json/wp/v2/iita-project?filter[project-hub]=western-africa&per_page=20", isLoading: true});
          this.fetchProjects();
        } else if (buttonIndex === 2) {
          this.setState({hub: "https://iita.org/wp-json/wp/v2/iita-project?filter[project-hub]=central-africa&per_page=20", isLoading: true});
          this.fetchProjects();
        }
        else if (buttonIndex === 3) {
          this.setState({hub: "https://iita.org/wp-json/wp/v2/iita-project?filter[project-hub]=eastern-africa&per_page=20", isLoading: true});
          this.fetchProjects();
        }
        else if (buttonIndex === 4) {
          this.setState({hub: "https://iita.org/wp-json/wp/v2/iita-project?filter[project-hub]=southern-africa&per_page=20", isLoading: true});
          this.fetchProjects();
        }
      });
  }

_filterByCrop = () => {
  this.setState({ showModal: false });
      var BUTTONS = ["All", "Banana", "Cassava", "Cocoa", "Coffee", "Cowpea", "Maize", "Soybean", "Yam", "Close"];
      const theme = this.context;
 
      var DESTRUCTIVE_INDEX = 9;
      var CANCEL_INDEX = 9;
 
  ActionSheet.showActionSheetWithOptions({
  options: BUTTONS,
  cancelButtonIndex: CANCEL_INDEX,
  destructiveButtonIndex: DESTRUCTIVE_INDEX,
  tintColor: theme === 'light' ? '#000' : '#fff'
},
(buttonIndex) => {
        if (buttonIndex === 0) {
          this.setState({hub: "https://iita.org/wp-json/wp/v2/iita-project?per_page=20&_embed&page=", isLoading: true});
          this.fetchProjects();
        } 
       else if (buttonIndex === 1) {
          this.setState({hub: "https://iita.org/wp-json/wp/v2/iita-project?filter[project-crop]=banana&per_page=20", isLoading: true});
          this.fetchProjects();
        } else if (buttonIndex === 2) {
          this.setState({hub: "https://iita.org/wp-json/wp/v2/iita-project?filter[project-crop]=cassava&per_page=20", isLoading: true});
          this.fetchProjects();
        }

        else if (buttonIndex === 3) {
          this.setState({hub: "https://iita.org/wp-json/wp/v2/iita-project?filter[project-crop]=cocoa&per_page=20", isLoading: true});
          this.fetchProjects();
        }
        else if (buttonIndex === 4) {
          this.setState({hub: "https://iita.org/wp-json/wp/v2/iita-project?filter[project-crop]=coffee&per_page=20", isLoading: true});
          this.fetchProjects();
        }
        else if (buttonIndex === 5) {
          this.setState({hub: "https://iita.org/wp-json/wp/v2/iita-project?filter[project-crop]=coepea&per_page=20", isLoading: true});
          this.fetchProjects();
        }
        else if (buttonIndex === 6) {
          this.setState({hub: "https://iita.org/wp-json/wp/v2/iita-project?filter[project-crop]=maize&per_page=20", isLoading: true});
          this.fetchProjects();
        }
        else if (buttonIndex === 7) {
          this.setState({hub: "https://iita.org/wp-json/wp/v2/iita-project?filter[project-crop]=soybean&per_page=20", isLoading: true});
          this.fetchProjects();
        }
        else if (buttonIndex === 8) {
          this.setState({hub: "https://iita.org/wp-json/wp/v2/iita-project?filter[project-crop]=yam&per_page=20", isLoading: true});
          this.fetchProjects();
        }
      });
  }




onChangeText = (query) => {
  this.setState({ page: 1 });
  this.setState({ search: query });
  clearTimeout(this.timeout); // clears the old timer
  this.timeout = setTimeout(() => this.SearchProjects(this.state.search), 500);
}

 SearchProjects = () => {   
 const { page } = this.state;
if (this.state.search !== ""){
  this.setState({ isLoadingSearch: true });
    const URL = 'iita-project?search='+ this.state.search + '&per_page=20&_embed&page='+page;
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
  this.SearchProjects();
}




 _setSearchVisible = () => {
    const { SearchVisible } = this.state;

    if (SearchVisible){
      this.setState({ SearchVisible: false });
      this.fetchProjects();
    }
    if(!SearchVisible){
    this.setState({ SearchVisible: true });
  }
}


 showModal = () => {

  const { showModal } = this.state;

    if (showModal){
      this.setState({ showModal: false });
    }
    if(!showModal){
    this.setState({ showModal: true });
  }
}

  handleRefresh = () => {
    this.setState(
      {
        page: 1,
        refreshing: true
      },
      () => {
        this.fetchProjects();
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

          if (this.state.searchActive === true && resdata > 0) {this.SearchProjects(); }

        if (!this.state.searchActive){this.fetchProjects()}

          if (resdata < 20) {this.setState({loadingMore: false})}
      }
    );
  }
};


  ShowSearch = () => {
      const theme = this.context;
      if(this.state.SearchVisible === true){
      return(
      <SearchBar
        placeholder="Search projects..."
        onChangeText={(query: string) => this.onChangeText(query)}
        value={this.state.search}
        containerStyle={{backgroundColor: 'transparent'}}
        platform='ios'
        onCancel={() => this._setSearchVisible()}
        showLoading={this.state.isLoadingSearch}
        lightTheme={false}
        inputContainerStyle={{backgroundColor: theme === 'light' ? '#ccc' : '#222'}}
        inputStyle= {{color: theme === 'light' ? '#222' : '#ccc'}}
        placeholderTextColor= {theme === 'light' ? '#222' : '#ccc'}
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
          borderTopWidth: 0,
          marginTop: 15,
          marginBottom: 15,
        }}
      >
        <ActivityIndicator animating  color = '#222' ></ActivityIndicator>
      </View>
    );
  };

  render(){
      const { navigate } = this.props.navigation;
      const theme = this.context;
      const ShowSearchs = this.ShowSearch;

      if(this.state.isLoading){
      return(
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', color: '#222'}}>
          <ActivityIndicator color = '#222' size='large' ></ActivityIndicator>
        </View>
      )
    }

    return (
      <Provider>
      <Portal>
      <ShowSearchs />
      <FlatList
        data={this.state.data}
        renderItem={({ item }) => (
      
    <View>
      {/*<ListItem
      Component = {TouchableOpacity}
        leftIcon = {{name: 'ios-briefcase', type: 'ionicon', color: '#222'}}
        title={item.title.rendered}  onPress={() => { navigate('ProjectsContent', { id: item.id , otherParam: item.title.rendered })}}
        titleStyle={{ color: theme === 'light' ? '#222' : '#fff'}}
        containerStyle={{backgroundColor: 'transparent'}}
        chevron
        bottomDivider
      ></ListItem>*/}


      <ListItem Component={TouchableOpacity} key={item.id} bottomDivider containerStyle={{backgroundColor: 'transparent'}} leftContent={<Icon name='sort' size={20} color='#fff' ></Icon>}>
        <ListItem.Content>
          <ListItem.Title style={{ color: theme == 'light' ? '#222' : '#ffffff'}}  onPress={() => { navigate('ProjectsContent', { id: item.id , otherParam: item.title.rendered })}}>{item.title.rendered} </ListItem.Title>
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
        initialNumToRender={20}
      />


      <Dialog visible={this.state.showModal} onDismiss={ () => {this.setState({ showModal: false })}}>
          <Dialog.Title>Filter Projects</Dialog.Title>
          <Dialog.Content>
             <Button icon="door-closed" mode="outlined" color={'#222'} onPress={this._filterByHub}>Filter By Hubs</Button>

                <Paragraph></Paragraph>

            <Button icon="leaf" mode="outlined" color={'#222'} onPress={this._filterByCrop}>Filter By Crops</Button>

          </Dialog.Content>
          <Dialog.Actions>
            <Button  onPress={ () => {this.setState({ showModal: false })}}>Close</Button>
          </Dialog.Actions>
        </Dialog>

      </Portal>
      </Provider>

    );
  }
}
