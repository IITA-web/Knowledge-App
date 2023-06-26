import React, { Component } from 'react';
import { StyleSheet, Text, View, Vibration } from 'react-native';

export default class Viewer extends Component {

 constructor(props){
    super(props);
    this.state ={ isLoading: true,
                  loadingMore: false, 
                  page: 1,
                  refreshing: false,
                  data: [],
                }
  }




  componentDidMount(){

   this.fetchEvents();

  }

  fetchEvents = () => {
    return fetch("https://doi.org/10.25502/9W9X-Q697/D", {"headers": { "Accept": "text/x-bibliography; style=apa"}})
      .then((response) => response.text())
      .then((responseJson) => {
      	console.log(responseJson);
      	this.setState({ isLoading: false, data: responseJson });
      })
      .catch((error) =>{
        alert(error);
         Vibration.vibrate();
         this.setState({ error, isLoading: false });
      });
	}

render(){
	return(
		<View>
			<Text>{this.state.data} </Text>
		</View>
	)
}
}