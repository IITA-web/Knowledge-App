import React, { Component } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ActivityIndicator, Alert, Vibration } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Avatar, Button, Card, Title, Paragraph, Divider, TouchableRipple, Badge } from 'react-native-paper';
import { Icon } from 'react-native-elements'
import { ThemeContext } from 'react-navigation';

export default class BigData extends Component {
 static contextType = ThemeContext;
  static navigationOptions = ({navigation, navigationOptions}) => {
    return {
      title: 'Groups'
    }    
  }
  
    constructor(props){
    super(props);
    this.state ={ isLoading: true}
  }


  componentDidMount() {
    this.fetchData();
}


fetchData = () => {
    fetch('http://data.iita.org/api/3/action/group_list?all_fields=true')
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          isLoading: false,
          dataSource: responseJson['result'],
        }, function(){
        });
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



render() {
  const theme = this.context;
  if(this.state.isLoading){
  return(
    <View style={{flex: 1, justifyContent: 'center',
        alignItems: 'center', color: '#ff6600'}}>
      <ActivityIndicator color = '#ff6600'/>
    </View>
    )
  }
    const { navigate } = this.props.navigation;
    return (
      <View style={{flex: 1,
        flexDirection: 'column', height: '90%', backgroundColor: 'transparent', padding: 5}}>
      

        </View>
      
    );
  }
}