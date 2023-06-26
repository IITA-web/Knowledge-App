
import React, { Component } from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';

//import { WebView } from "react-native-webview";

export default class YamBase extends Component {
  constructor(props) {
    super(props);
    this.state = { visible: true };
  }

  showSpinner() {
    this.setState({ visible: true });
  }

  hideSpinner() {
    this.setState({ visible: false });
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