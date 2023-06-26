
import React from 'react';
import { View, ScrollView, Switch, StyleSheet, Alert, TouchableOpacity, SafeAreaView, Vibration } from 'react-native';
import { ThemeContext } from 'react-navigation';
import { ListItem, Icon, Avatar } from 'react-native-elements';
//import AsyncStorage from '@react-native-community/async-storage';
//import OneSignal from 'react-native-onesignal';

export default class Settings extends React.Component {
static contextType = ThemeContext;
  static navigationOptions = ({ navigation, navigationOptions }) => {
    return {
      title: "Settings",
    };
  };

  constructor(props){
    super(props);
    this.state = { isEnabled: true }
    //AsyncStorage.getItem('all_notification').then(value =>{
      //const val = JSON.parse(value);
    //this.setState({ isEnabled: val })
  //});

}

  componentDidMount(){

  }

setStringValue = async (value) => {
  try {
    //await AsyncStorage.setItem('all_notification', value)
    //if (value === "true")
      //OneSignal.setSubscription(true);
    //if (value === "false")
      //OneSignal.setSubscription(false);
  } catch(e) {
  }
}

 onNotificationValueChange = async (value) => {
  const values = JSON.stringify(value);
  //this.setStringValue(values);
  this.setState({isEnabled: value});
}

toggleNoti = () => {
  return (
    <View>
      <Switch
        trackColor={{ false: "#777", true: "#green" }}
        thumbColor={this.state.isEnabled ? "#ff6600" : "#ccc"}
        ios_backgroundColor="#3e3e3e"
        onValueChange={(value: string) => this.onNotificationValueChange(value)}
        value={this.state.isEnabled}
      />
    </View>
  );
}

render(){
  const theme = this.context;
  const ToggleNotification = this.toggleNoti;
return (
  <SafeAreaView>
    <ScrollView>
      <ListItem
        key={"1"}
        leftIcon = {{name: 'ios-notifications-outline', type: 'ionicon', color: '#ff6600'}}
        title={"Push Notifications"}
        titleStyle={{ color: theme === 'light' ? '#000' : '#fff'}}
        containerStyle={{backgroundColor: 'transparent'}}
        rightElement={ToggleNotification}
        bottomDivider
        
      />
    </ScrollView>
  </SafeAreaView>
    );
  }
}
