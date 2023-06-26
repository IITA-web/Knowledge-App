import * as React from 'react';
import { FlatList, Animated, Platform, Share, StatusBar, ImageBackground, ActivityIndicator, Text, View, ScrollView, Dimensions, TouchableOpacity, StyleSheet, Image, Linking, Alert, Vibration, Appearance } from 'react-native';
import InAppBrowser from 'react-native-inappbrowser-reborn'
import { Avatar, Button, Card, Title, Paragraph, Divider, List, Colors } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { ThemeContext } from 'react-navigation';
import moment from 'moment';
import ParallaxScrollView from 'react-native-parallax-scroll-view-fix';
import { Header } from 'react-navigation-stack';
import { HtmlParseAndView, HtmlParseAndViewProps, HtmlStyles } from '@react-native-html/renderer';

const windowHeight = Dimensions.get('window').height;
const { event, ValueXY } = Animated;
const scrollY = new ValueXY();
const MIN_HEIGHT = Header.HEIGHT;
const MAX_HEIGHT = 300;
const contextType = ThemeContext;
const colorScheme = Appearance.getColorScheme();
export default class NewsContent extends React.Component {
static contextType = ThemeContext;
static navigationOptions = ({ navigation, navigationOptions }) => {
    console.log(navigationOptions);
    return {
       title: ' ',
        headerTitleContainerStyle: {
        marginLeft: 80,
        marginRight: 60
      },
      headerTransparent: true,
      headerTintColor: '#999',
    };
  };

  constructor(props){
    super(props);
    this.state ={ isLoading: true, views: 0}
  }

  componentDidMount(){
    
    const { navigation } = this.props;
    const itemId = navigation.getParam('id', 'NO-ID');

    fetch('https://www.iita.org/wp-json/wp/v2/news-item/' + itemId)
      .then((response) => response.json())
      .then((responseJson) => {
        var likess = responseJson.metadata.likes ? responseJson.metadata.likes : 0;
         likess = likess.toString();
        likess =  likess.replace(/[]/g, '');
        this.setState({
          isLoading: false,
          dataSource: responseJson,
          likes: likess
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
        }
      ],
      { cancelable: false }
    );
          Vibration.vibrate();
      });




    fetch('https://www.iita.org/wp-json/wp/v2/views/' + itemId)
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson);
        this.setState({
          views: responseJson
        }, function(){

        });
      })
      .catch(error => {
        console.log(error)
      });
  }


  postLike = () => {
    const { navigation } = this.props;
    const itemId = navigation.getParam('id', 'NO-ID');
    return fetch('https://www.iita.org/wp-json/wp/v2/likes/' + itemId)
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState({
          likes: responseJson

        }, function(){
        });
      })
      .catch((error) =>{
        //console.error(error);
        alert(error);
      });
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
    }
  };


  onShare = async () => {
    try {
      const result = await Share.share({
        message:
          this.state.dataSource.title.rendered + ". Readmore... " + this.state.dataSource.link,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };


  render(){
    const theme = this.context;
    if(this.state.isLoading){
      return(
        <View style={{flex: 1, justifyContent: 'center',
              alignItems: 'center', color: '#222'}}>
          <ActivityIndicator  color = '#222' size='large' ></ActivityIndicator>
        </View>
      )
    }

    return (
      <View style={{ flex: 1 }}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content"  />
        {/*<HeaderImageScrollView
          maxHeight={MAX_HEIGHT}
          minHeight={MIN_HEIGHT}
          maxOverlayOpacity={0.7}
          minOverlayOpacity={0.4}
          showsVerticalScrollIndicator={false}
          scrollViewBackgroundColor ={{backgroundColor: theme === 'light' ? '#fff' : '#000'}}
          fadeOutForeground
          renderHeader={() => <Image source={ this.state.dataSource.featured_image_url ? {uri: this.state.dataSource.featured_image_url} : require('../../image/library.jpg')} style={styles.image} />}
          renderFixedForeground={() => (
            <Animatable.View
              style={styles.navTitleView}
              ref={navTitleView => {
                this.navTitleView = navTitleView;
              }}
            >
              <Text numberOfLines={1} style={styles.navTitle}>
                {this.state.dataSource.title.rendered}
              </Text>
              <Icon  style={Istyles.share} name='share-alt' size={20} color="#fff" onPress={this.onShare} ></Icon>
            </Animatable.View>
          )}
          renderForeground={() => (
            <View style={styles.titleContainer}>
              <Text style={Istyles.title}>{this.state.dataSource.title.rendered}</Text>
            <Icon  style={Istyles.viewsText} name='eye' size={20} color={Colors.blue500} >  <Text style={{color: '#fff', fontSize: 14,}}>{this.state.views}</Text></Icon>
              
            <Icon  style={Istyles.likesText} name='thumbs-up' size={20} color="#ff6600" onPress={this.postLike}>  <Text style={{color: '#fff', fontSize: 14,}}>{this.state.likes }</Text></Icon>

             <Icon  style={Istyles.share} name='share-alt' size={20} color="#ff6600" onPress={this.onShare} ></Icon>
              <Text style={Istyles.dateText}>{moment(this.state.dataSource.date).format("MMM. Do, YYYY")} </Text>
              <Text style={Istyles.date}>{moment(this.state.dataSource.date).format("MMM. Do, YYYY")} </Text>
              
            </View>
          )}
        >
          <TriggeringView
            onHide={() => this.navTitleView.fadeInUp(200)}
            onDisplay={() => this.navTitleView.fadeOut(100)}
          >
          </TriggeringView>*/}




    <ParallaxScrollView
      backgroundColor="#13234b"
      contentBackgroundColor="white"
      headerBackgroundColor="#333"
      stickyHeaderHeight={ STICKY_HEADER_HEIGHT }
      parallaxHeaderHeight={PARALLAX_HEADER_HEIGHT}
      backgroundSpeed={10}


      renderForeground={() => (
        <ImageBackground source={ this.state.dataSource.featured_image_url ? {uri: this.state.dataSource.featured_image_url} : require('../../image/library.jpg')} key="parallax-header" style={ styles.parallaxHeader }>
          <View style={{width:'100%', height:'100%', backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'center', paddingLeft: 20, paddingRight: '20%'}}>

              <View style={{width: 155, marginBottom:20, backgroundColor: '#000'}}>
                <Text style={Istyles.dateText}>{moment(this.state.dataSource.date).format("MMM. Do, YYYY")} </Text>
              </View>

              <Text style={Istyles.title}>{this.state.dataSource.title.rendered}</Text>
              <Icon  style={Istyles.viewsText} name='eye' size={20} color={Colors.blue500} >  <Text style={{color: '#fff', fontSize: 14,}}>{this.state.views}</Text></Icon>
              
              <Icon  style={Istyles.likesText} name='thumbs-up' size={20} color="#ff6600" onPress={this.postLike}>  <Text style={{color: '#fff', fontSize: 14,}}>{this.state.likes }</Text></Icon>

              <Icon  style={Istyles.share} name='share-alt' size={30} color="#ff6600" onPress={this.onShare} ></Icon>
              
        
          </View>
        </ImageBackground>
      )}

      renderStickyHeader={() => (
        <View key="sticky-header" style={styles.stickySection}>
          <Text numberOfLines={1} style={styles.stickySectionText}>{this.state.dataSource.title.rendered}</Text>
        </View>
      )}

      >

         <HtmlParseAndView
            rawHtml={this.state.dataSource.content.rendered}
            htmlStyles={htmlStyles}
            containerStyle={styles.container}

          />

      </ParallaxScrollView>

         
      </View>
    );
  }
}


const window = Dimensions.get('window');

const ROW_HEIGHT = 60;
const PARALLAX_HEADER_HEIGHT = 380;
const STICKY_HEADER_HEIGHT = 90;


const Istyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column"
  },
  image: {
    flex: 1,
    resizeMode: "cover",
    width: '100%',
    height: 300,
    backgroundColor: '#000',
    marginBottom: 20
  },
  title: {
    color: "#fff",
    fontSize: 25,
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 10,
    textShadowColor: 'black',
  },
  share: {
    bottom: Platform.OS === 'android' ? 16 : 10,
    right: 30,
    position: 'absolute'
  },

  text: {
    color: "white",
    fontSize: 30,
    position: 'absolute',
    bottom: 0
  },

  dateText: {
    color: '#fff',
    padding: 5,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center'
  },


  viewsText: {
    position: 'absolute',
    bottom: 16,
    left: 10
  },

  likesText: {
    position: 'absolute',
    bottom: 16,
    left: 90
  }

});







const htmlStyles: HtmlStyles = {
  text: {
    fontSize: 18,
    lineHeight: 30,
    color: '#555'
  },
  paragraph: {
    marginVertical: 15,
  },
  a: {
    color: '#ff6600',
    fontSize: 18,
  },
  image: {
    marginVertical: 5
  },
  list: {
    marginVertical: 5,
  },
  h1: {
    fontSize: 30,
    lineHeight: 30 * 1.4,
    marginTop: 10,
    fontWeight: '500',
  },
  h2: {
    fontSize: 26,
    lineHeight: 26 * 1.4,
    marginTop: 10,
    fontWeight: '500',
  },
  h3: {
    fontSize: 24,
    lineHeight: 24 * 1.4,
    marginTop: 10,
    fontWeight: '500',
  },
  listItem: {
    marginVertical: 2,
  },
  listItemContent: {},
};





const styles = StyleSheet.create({

  container: {
    marginTop: 40,
    marginHorizontal: 20,
  },

   background: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: window.width,
    height: PARALLAX_HEADER_HEIGHT
  },
  stickySection: {
    height: STICKY_HEADER_HEIGHT,
    justifyContent: 'flex-end'
  },
  stickySectionText: {
    color: '#fff',
    fontSize: 20,
    position: 'absolute',
    bottom: 12,
    left: 50
  },
  fixedSection: {
    position: 'absolute',
    bottom: 10,
    right: 10
  },
  fixedSectionText: {
    color: '#999',
    fontSize: 20
  },
  parallaxHeader: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column',
  },

  sectionSpeakerText: {
    color: 'white',
    fontSize: 24,
    paddingVertical: 20
  },
  sectionTitleText: {
    color: 'white',
    fontSize: 18,
    paddingVertical: 5
  },
});


