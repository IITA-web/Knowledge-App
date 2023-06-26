import React, { Component } from 'react';
import { AppRegistry, StyleSheet, Text, View, Platform, Alert, ActivityIndicator, NativeAppEventEmitter, DeviceEventEmitter, NativeModules, NativeEventEmitter, TouchableHighlight, TouchableOpacity, ScrollView, Linking, Vibration, Picker } from 'react-native';
import { ListItem } from 'react-native-elements';
import moment from 'moment';
import Modal from 'react-native-modal';
import RNPickerSelect, { defaultStyles } from 'react-native-picker-select';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Button } from 'react-native-paper';
import ActionSheet from 'react-native-action-sheet';


var RNFS = require('react-native-fs');
var SavePath = Platform.OS === 'ios' ? RNFS.MainBundlePath : RNFS.DocumentDirectoryPath;
export default class DataFile extends Component {
    static navigationOptions = ({ navigation, navigationOptions }) => {
      const Itemss = navigation.getParam('otherParam')
    return {
      title: Itemss['title'],
       headerTitleContainerStyle: {
        marginLeft: 80,
        marginRight: 60
      },
    };
  };
  constructor(props) {
    super(props);
     this.inputRefs = {};

    this.state = {
      isLoading: true,
      animating: false,
      progress: "",
      donebuttonclicked: false,
      embargo: false,
      isModalVisible: false,
      citationStyle: "apa",
      citationStyleName: 'APA',
      citationLoader: false,
      resources: [],
    }
   /*
    this.eventEmitter = new NativeEventEmitter(NativeModules.RNReactNativeDocViewer);
    this.eventEmitter.addListener('DoneButtonEvent', (data) => {
     
      *Done Button Clicked
      * return true
      
      console.log(data.close);
      this.setState({donebuttonclicked: data.close});
    })*/
    //this.didPressToObjcButton = this.didPressToObjcButton.bind(this);

  }

  toggleModal = () => {
    this.setState({isModalVisible: !this.state.isModalVisible});
  };


  componentDidMount(){
    const { navigation } = this.props;
    const Itemss = navigation.getParam('otherParam')
    // download progress
    /*this.eventEmitter.addListener(
      'RNDownloaderProgress',
      (Event) => {
        this.setState({progress: Event.progress + " %"});
      } 
      
    );*/

      var date = new Date().getDate();
      var month = new Date().getMonth() + 1;
      var year = new Date().getFullYear();

      var edate = new Date().getTime() / 1000;
      var embargo_end_date = new Date(Itemss['embargo_end_date']).getTime() / 1000;

        if (embargo_end_date > edate) {
        this.setState({embargo: true, embargoEnd: Itemss['embargo_end_date']});
       }
        this.setState({
          dataSource: Itemss,
          creator: Itemss['creator'],
          resources: Itemss['resources']
        });
      this.fetchCitation();
  }


fetchCitation(){
  this.setState({citationLoader: true});
  const { navigation } = this.props;
  const Itemss = navigation.getParam('otherParam')
  fetch(Itemss['identifier'], {"headers": { "Accept": "text/x-bibliography; style="+this.state.citationStyle}})
      .then((response) => response.text())
      .then((responseJson) => {
        const responseData = responseJson.replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, "");
        this.setState({
          citationLoader: false,
          isLoading: false,
          citation: responseData,
        }, function(){
        });
      })
      .catch((error) =>{
        Alert.alert(error);
         Vibration.vibrate();
      });
}
  componentWillUnmount (){
    //this.eventEmitter.removeListener();
  }

  didPressToObjcButton() {
    // We'll sent event press button to ObjetiveC
    //NativeModules.RNReactNativeDocViewer.showAlert('This is react-native');
  }

  /*
  * Handle WWW File Method
  * fileType Default == "" you can use it, to set the File Extension (pdf,doc,xls,ppt etc) when in the Url the File Extension is missing.
  */
   handlePress(uri, name, format){
    //console.log(uri);
    this.setState({animating: true});
   /* if(Platform.OS === 'ios'){
      OpenFile.openDoc([{
        url: uri,
        fileNameOptional: name,
        fileType: format
      }], (error, url) => {
         if (error) {
           Vibration.vibrate();
          this.setState({animating: false});
         } else {
          this.setState({animating: false});
           //console.log(url)
         }
       })
    }else{
      //Android
      this.setState({animating: true});
      OpenFile.openDoc([{
        url: uri, // Local "file://" + filepath
        fileName: name,
        cache:false,
        fileType: format
      }], (error, url) => {
         if (error) {
          this.setState({animating: false});
          Alert.alert(
      "Unknown Error",
      "Please install a document Viewer like microsoft excel or WPS office from playstore to view this document. Tap ok to Install or cancel to close this dialog",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { text: "OK", onPress: () =>  Linking.openURL("market://search?q=microsoft office suite&c=apps")}
      ],
      { cancelable: false }
    );

           Vibration.vibrate();

           //console.error(error);
         } else {
          this.setState({animating: false});
           //console.log(url)
         }
       })
    }*/
   
  }

onChange = (query) => {
  this.setState({ citationStyle: query });
  this.fetchCitation();

}


_citationDialog = () => {
      var BUTTONS = ["Apa", "Harvard", "MLA", "Chicago", "IEEE", "CSE", "AMA", "NLM", "Turabian", "Cancel"];
      const theme = this.context;
 
      var DESTRUCTIVE_INDEX = 9;
      var CANCEL_INDEX = 9;
 
  ActionSheet.showActionSheetWithOptions({
  options: BUTTONS,
  cancelButtonIndex: CANCEL_INDEX,
  destructiveButtonIndex: DESTRUCTIVE_INDEX,
  tintColor: '#555'
},
(buttonIndex) => {
        if (buttonIndex === 0) {
          this.setState({citationStyle: "apa", citationStyleName: 'APA'});
          this.fetchCitation();
        }
        else if (buttonIndex === 1) {
          this.setState({citationStyle: "harvard-cite-them-right", citationStyleName: 'Harvard'});
          this.fetchCitation();
        } 
       else if (buttonIndex === 2) {
          this.setState({citationStyle: "modern-language-association", citationStyleName: 'MLA'});
          this.fetchCitation();
        } else if (buttonIndex === 3) {
          this.setState({citationStyle: "chicago-fullnote-bibliography", citationStyleName: 'Chicago'});
          this.fetchCitation();
        }
        else if (buttonIndex === 4) {
          this.setState({citationStyle: "ieee", citationStyleName: 'IEEE'});
          this.fetchCitation();
        }
        else if (buttonIndex === 5) {
          this.setState({citationStyle: "council-of-science-editors", citationStyleName: 'CSE'});
          this.fetchCitation();
        }
        else if (buttonIndex === 6) {
          this.setState({citationStyle: "american-medical-association", citationStyleName: 'AMA'});
          this.fetchCitation();
        }
        else if (buttonIndex === 7) {
          this.setState({citationStyle: "national-library-of-medicine-grant-proposals", citationStyleName: 'NLM'});
          this.fetchCitation();
        }
        else if (buttonIndex === 8) {
          this.setState({citationStyle: "urabian-fullnote-bibliography", citationStyleName: 'Turabian'});
          this.fetchCitation();
        }
        else if (buttonIndex === 9) {
          
        }
      });
  }


  
    setToggleTimeout() {
      this.setTimeout(() => {
        this.setState({animating: !this.state.animating});
        this.setToggleTimeout();
      }, 2000);
    }
  
  render() {
      const { navigate } = this.props.navigation;
    const theme = this.context;

    if(this.state.isLoading){
      return(
        <View style={{flex: 1, justifyContent: 'center',
              alignItems: 'center'}}>
          <ActivityIndicator  color = '#ff6600' size='large' ></ActivityIndicator>
        </View>
      )
    }

    if(this.state.embargo){
      return(
      <ScrollView>
      <View style={{margin: 10, padding: 10}}>
      <Text style={{fontWeight: 'bold', fontSize: 17, padding: 10, color:'#000'}}> {this.state.dataSource.title}</Text>
      <Text style={{fontSize: 16, padding: 10, color: '#222'}}> {this.state.dataSource.notes}</Text>
</View>


    <View style={{marginRight: 10, marginLeft: 10, padding: 10}}>
      <View style={{flex: 1, flexDirection: 'row'}}>
      <Text style={{fontSize: 20, paddingLeft: 10, paddingRight: 10, color: '#ff6600', width: 150}}> Citation</Text>
        <Text onPress={() => this._citationDialog()} style={{ fontSize: 20, width: 150, padding: 10, color: '#ff6600', marginTop: -10 }}>{this.state.citationStyleName }  <Icon name='chevron-circle-down' size={15} color='#ff6600' ></Icon> </Text>
        
        </View>
        <Text style={{color:'#222',paddingLeft: 10, paddingRight: 10, fontSize: 20}}>{this.state.citation}</Text>  
    </View>
      <Text style={{fontSize: 20, padding: 10, color: '#ff6600'}}>Data and Resources</Text>    
      <ListItem
        leftIcon = {{name: 'ios-book', type: 'ionicon', color: '#ff6600'}}
        title={"This dataset is under embargo and the files will be available on " +   moment(this.state.embargoEnd).format("MMMM Do, YYYY")}  
        titleStyle={{ color: theme === 'light' ? '#000' : '#fff'}}
        containerStyle={{backgroundColor: 'transparent'}}
        bottomDivider
      ></ListItem>
      </ScrollView>
      )
    }

    return (
      <ScrollView>
      <View style={{ padding: 10, margin: 10}}>
      <Text style={{ color: '#222', fontWeight: 'bold', fontSize: 16, padding: 10}}> {this.state.dataSource.title}</Text>
      <Text style={{ color: '#222', fontSize: 16, padding: 10}}> {this.state.dataSource.notes}</Text>
</View>



    <View style={{marginRight: 10, marginLeft: 10, padding: 10}}>
      <View style={{flex: 1, flexDirection: 'row'}}>
      <Text style={{fontSize: 20, paddingLeft: 10, paddingRight: 10, color: '#ff6600', width: 150}}> Citation</Text>
        <Text onPress={() => this._citationDialog()} style={{ fontSize: 20, width: 150, padding: 10, color: '#ff6600', marginTop: -8 }}>{this.state.citationStyleName }  <Icon name='chevron-circle-down' size={15} color='#ff6600' ></Icon> </Text>
        <ActivityIndicator style={{marginTop: -3 }} animating={this.state.citationLoader} color="#ff6600"/>
        </View>

        <Text style={{color: '#555', paddingLeft: 10, paddingRight: 10, fontSize: 20}}>{this.state.citation}</Text>  
    </View>
       <ActivityIndicator
        animating={this.state.animating}
        size="large"/>
        <Text style={{fontSize: 20, paddingLeft: 10, paddingRight: 10, color: '#ff6600'}}>Data and Resources</Text>
        { this.state.resources ?
      this.state.resources.map((item, i) => (

       <TouchableOpacity>
      {/*<ListItem
        key={i}
        Component={TouchableOpacity}
        leftIcon = {<Icon name={'file-' + item.format} color='#ff6600' size={30}></Icon>}
        title={item.name}  onPress={this.handlePress.bind(this, item.url, item.name, item.format)}
        titleStyle={{ color: '#222'}}
        containerStyle={{backgroundColor: 'transparent'}}
        chevron
        bottomDivider

      />*/}

      <ListItem Component={TouchableOpacity} key={item.id} bottomDivider containerStyle={{backgroundColor: 'transparent'}}>
        <ListItem.Content>
          <ListItem.Title style={{ color: '#222'}} onPress={this.handlePress.bind(this, item.url, item.name, item.format)}>{item.name}</ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>

      </TouchableOpacity> 
      
    ))
  : 
  <Text style={{fontSize: 20, paddingLeft: 10, paddingRight: 10, padding:30, color: '#999'}}>No resources available for this dataset </Text>
}
      </ScrollView>
    );
  }
}
AppRegistry.registerComponent('DataFile', () => DataFile);