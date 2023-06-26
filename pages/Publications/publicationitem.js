
import React from 'react';
import { StyleSheet, TouchableHighlight, Dimensions, SafeAreaView, View, Text, ActivityIndicator, Vibration } from 'react-native';
//import Pdf from 'react-native-pdf';
import PDFView from 'react-native-view-pdf';
import InAppBrowser from 'react-native-inappbrowser-reborn'

const WIN_WIDTH = Dimensions.get('window').width;
const WIN_HEIGHT = Dimensions.get('window').height;
export default class PublicationItem extends React.Component {
  static navigationOptions = ({ navigation, navigationOptions }) => {
    return {
      title: navigation.getParam('otherParam', ''),
    };
  };
    constructor(props) {
        super(props);
        this.state = {
            page: 1,
            scale: 1,
            numberOfPages: 0,
            horizontal: false,
            width: WIN_WIDTH
        };
        this.pdf = null;
    }


    prePage = () => {
        let prePage = this.state.page > 1 ? this.state.page - 1 : 1;
        this.pdf.setPage(prePage);
    };

    nextPage = () => {
        let nextPage = this.state.page + 1 > this.state.numberOfPages ? this.state.numberOfPages : this.state.page + 1;
        this.pdf.setPage(nextPage);
    };

    zoomOut = () => {
        let scale = this.state.scale > 1 ? this.state.scale / 1.2 : 1;
        this.setState({scale: scale});
    };

    zoomIn = () => {
        let scale = this.state.scale * 1.2;
        scale = scale > 3 ? 3 : scale;
        this.setState({scale: scale});
    };

    switchHorizontal = () => {
        this.setState({horizontal: !this.state.horizontal, page: this.state.page});
    };

    isLoading = () => {
      return(
        <View style={{flex: 1, justifyContent: 'center',
              alignItems: 'center'}}>
          <ActivityIndicator  color = '#ff6600' ></ActivityIndicator>
        </View>
      )
    }


 _handlePressButtonAsync = async (url) => {
    try {
      if (await InAppBrowser.isAvailable()) {
        const result = await InAppBrowser.open(url, {
          // iOS Properties
          dismissButtonStyle: 'Back',
          preferredBarTintColor: '#ff6600',
          preferredControlTintColor: 'white',
          readerMode: false,
          animated: true,
          modalPresentationStyle: 'overFullScreen',
          modalTransitionStyle: 'partialCurl',
          modalEnabled: false,
          enableBarCollapsing: false,
          // Android Properties
          showTitle: true,
          toolbarColor: '#ff6600',
          secondaryToolbarColor: 'black',
          enableUrlBarHiding: true,
          enableDefaultShare: true,
          forceCloseOnRedirection: false,
          // Specify full animation resource identifier(package:anim/name)
          // or only resource name(in case of animation bundled with app).
          animations: {
            startEnter: 'slide_in_right',
            startExit: 'slide_out_left',
            endEnter: 'slide_in_left',
            endExit: 'slide_out_right'
          },
          headers: {
            'my-custom-header': 'my custom header value'
          }
        })
        //Alert.alert(JSON.stringify(result))
      }
      else Linking.openURL(url)
    } catch (error) {
      Alert.alert(error.message)
      Vibration.vibrate();
    }
  };


  render(){
 const theme = this.context;
    const { navigation } = this.props;
    const url = navigation.getParam('url', 'NO URL');
    const source = {uri: url,cache:true};

    return(
       <SafeAreaView style={styles.container}>
                <View style={{flex:1,width: this.state.width}}>
                    {/*<Pdf ref={(pdf) => {
                        this.pdf = pdf;
                    }}
                         source={source}
                         scale={this.state.scale}
                         onLoadProgress={this.isLoading}
                         horizontal={this.state.horizontal}
                         onPressLink={(uri) => this._handlePressButtonAsync(uri)}
                         onLoadComplete={(numberOfPages, filePath,{width,height},tableContents) => {
                             this.setState({
                                numberOfPages: numberOfPages 
                             });
                         }}
                         onPageChanged={(page, numberOfPages) => {
                             this.setState({
                                 page: page
                             });
                         }}
                         onError={(error) => {
                         }}
                         style={{flex:1}}
                         />*/}


                    <PDFView
                        ref={(pdf) => {this.pdf = pdf; }}
                        fadeInDuration={250.0}
                        style={{ flex: 1 }}
                        resource={source}
                        resourceType="url"
                        onLoad={() => console.log(`PDF rendered from ${resourceType}`)}
                        onError={(error) => console.log('Cannot render PDF', error)}
                    />
                </View>
            </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 0,
    },
    btn: {
        margin: 2,
        padding: 2,
        backgroundColor: "aqua",
    },
    btnDisable: {
        margin: 2,
        padding: 2,
        backgroundColor: "gray",
    },
    btnText: {
        margin: 2,
        padding: 2,
    }
});