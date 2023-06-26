

//This is an example code to React Native Show Progress bar While Loading WebView//
import React, { Component } from 'react';
//import react in our code.

import { StyleSheet, ActivityIndicator, View } from 'react-native';
//import all the components we are going to use.


export default class PresentationDetails extends Component {

  static navigationOptions = ({ navigation, navigationOptions }) => {
    return {
      title: navigation.getParam('otherParam', 'Presentation Details'),
    };
  };

  constructor(props) {
    super(props);
    this.state = { visible: true, url: '' };
  }

  showSpinner() {
    this.setState({ visible: true });
  }

  hideSpinner() {
    this.setState({ visible: false });
  }

  componentDidMount(){
  const { navigation } = this.props;
    const url = navigation.getParam('url', 'NO-ID');
    this.setState({ url: url });
  }

  render() {
    return (
      <View/>
    );
  }
}
const styles = StyleSheet.create({
  stylOld: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  styleNew: {
    flex: 1,
  },
  WebViewStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginTop: -1,
  },
  ActivityIndicatorStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
  },
});