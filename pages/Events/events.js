
import React from 'react';
import { FlatList, ActivityIndicator, Text, View, ScrollView, StyleSheet, TouchableOpacity, Vibration, Alert } from 'react-native';
import { ListItem } from 'react-native-elements';
import { ThemeContext } from 'react-navigation';
import ActionSheet from 'react-native-action-sheet';
import Icon from 'react-native-vector-icons/FontAwesome5';
import moment from 'moment';
import { Button, Paragraph, Dialog, Portal } from 'react-native-paper';
export default class Events extends React.Component {
static contextType = ThemeContext;
static navigationOptions = ({navigation, navigationOptions}) => {
    return {
      title: 'Events',
      headerRight: () => (

        <TouchableOpacity  style={{ paddingRight: 20}} onPress={navigation.getParam('showDialog')}>
          <Icon name='sliders-h' size={20} color='#fff' ></Icon>
        </TouchableOpacity>
      ),

    }
  }

  


  constructor(props){
    super(props);
    this.state ={ isLoading: true, EventType: "https://iita.org/wp-json/wp/v2/ajde_events", dataSource: []}
  }

  componentDidMount(){
    this.props.navigation.setParams({ showDialog: this._showDialog, EventList: [] });
    this.fetchEvents();
  }

  fetchEvents = () => {
    this.setState({
    isLoading: true,
  })
    return fetch(this.state.EventType)
      .then((response) => response.json())
      .then((responseJson) => {

    var sort = function (prop, arr) {
    prop = prop.split('.');
    var len = prop.length;

    arr.sort(function (a, b) {
        var i = 0;
        while( i < len ) { a = a[prop[i]]; b = b[prop[i]]; i++; }
        if (a < b) {
            return 1;
        } else if (a > b) {
            return -1;
        } else {
            return 0;
        }
    });
    return arr;
    };

    if(sort.length > 0){

      EventList = sort("metadata.evcal_srow", responseJson);
      var time_in_millis = Date.now();
      var date = Math.round(time_in_millis / 1000);
      //alert(date);
       EventList = EventList.filter(function (el) {
        return el.metadata.evcal_srow >= date;

    });

    console.log(JSON.stringify(EventList[0]));

   this.setState({
      isLoading: false,
      dataSource: EventList,
      EventList: EventList
    }, function(){

    });
  }

     /* var yahooOnly = JSON.parse(jsondata).filter(function (entry) {
      return entry.website === 'yahoo';
      });*/

      
        

      })
      .catch((error) =>{
        alert(error);
         Vibration.vibrate();
      });
}

_showDialog = () => {
      var BUTTONS = ["All", "Western Africa Hub", "Central Africa Hub", "Eastern Africa Hub", "Southern Africa Hub", "Close"];
      const theme = this.context;
 
      var DESTRUCTIVE_INDEX = 5;
      var CANCEL_INDEX = 5;
 
  ActionSheet.showActionSheetWithOptions({
  options: BUTTONS,
  cancelButtonIndex: CANCEL_INDEX,
  destructiveButtonIndex: DESTRUCTIVE_INDEX,
  tintColor: '#fff'
},
(buttonIndex) => {
        if (buttonIndex === 0) {
          this.setState({EventType: "https://iita.org/wp-json/wp/v2/ajde_events"});
          this.fetchEvents();
        } 
       else if (buttonIndex === 1) {
          this.setState({EventType: "https://iita.org/wp-json/wp/v2/ajde_events?filter[event_type]=western-africa"});
          this.fetchEvents();
        } else if (buttonIndex === 2) {
          this.setState({EventType: "https://iita.org/wp-json/wp/v2/ajde_events?filter[event_type]=central-africa"});
          this.fetchEvents();
        }
        else if (buttonIndex === 3) {
          this.setState({EventType: "https://iita.org/wp-json/wp/v2/ajde_events?filter[event_type]=eastern-africa"});
          this.fetchEvents();
        }
        else if (buttonIndex === 4) {
          this.setState({EventType: "https://iita.org/wp-json/wp/v2/ajde_events?filter[event_type]=southern-africa"});
          this.fetchEvents();
        }
      });
  }

render(){
  const { navigate } = this.props.navigation;
  const theme = this.context;
  //alert(EventList.length)

    if(this.state.isLoading){
      return(
        <View style={{flex: 1, justifyContent: 'center',
              alignItems: 'center'}}>
          <ActivityIndicator  color = '#222' ></ActivityIndicator>
        </View>
      )
    }

    if(EventList.length === 0){
      return(
        <View style={{flex: 1, justifyContent: 'center',
              alignItems: 'center'}}>
          <Text style={{color: '#777'}}>No Upcoming Event Found</Text>
        </View>
      )
    }
return(
<View>
      <ScrollView>
    {
    this.state.dataSource.map((item, i) => (
      <ListItem Component={TouchableOpacity} key={item.id + item.title.rendered} bottomDivider containerStyle={{backgroundColor: 'transparent'}} onPress={() => { navigate('EventDetails', { id: item.id , title: item.title.rendered, content : item.content.rendered })}}>
        <Icon name='calendar' size={20} color='#222' ></Icon>
        <ListItem.Content>
          <ListItem.Title style={{ color: '#222'}} >{item.title.rendered} { item.pure_taxonomies.event_type ? '('+item.pure_taxonomies.event_type[0].name+')': null}</ListItem.Title>
          { item.pure_taxonomies.event_location ? <ListItem.Subtitle>{item.pure_taxonomies.event_location[0].description + ' ' + item.pure_taxonomies.event_location[0].name + '   ' + moment(item.metadata.evcal_srow * 1000).format("MMM. Do, YYYY")}</ListItem.Subtitle>: null}
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
    ))
  }
  </ScrollView>

</View>


    );
  }
}
