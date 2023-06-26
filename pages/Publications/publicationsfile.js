import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Platform,
  Button,
  Alert,
  FlatList,
  ActivityIndicator,
  NativeModules,
  NativeEventEmitter,
  TouchableOpacity,
  ScrollView,
  Share,
  StatusBar,
  Dimensions,
  Image,
  Animated,
  ImageBackground,
  Vibration
} from 'react-native';
import { ListItem } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Header } from 'react-navigation-stack';
import ParallaxScrollView from 'react-native-parallax-scroll-view-fix';



const windowHeight = Dimensions.get('window').height;
const { event, ValueXY } = Animated;
const scrollY = new ValueXY();


const MIN_HEIGHT = Header.HEIGHT;
const MAX_HEIGHT = 300;



var RNFS = require('react-native-fs');
var SavePath = Platform.OS === 'ios' ? RNFS.MainBundlePath : RNFS.DocumentDirectoryPath;
export default class publicationFile extends Component {
    static navigationOptions = ({ navigation, navigationOptions }) => {

    return {
      title: ' ',
        headerTitleContainerStyle: {
        marginLeft: 80,
        marginRight: 60
      },
      headerTransparent: true,
      headerTintColor: '#fff',
    };
  };


  constructor(props) {
    super(props);
    this.state = { 
      isLoading: true,
      animating: false,
      data: '',
      progress: "",
      resources:'',
      donebuttonclicked: false,
      showNavTitle: false
    }
    const item = this.props.navigation.getParam('otherParam');
  }




  componentDidMount(){
    this.GetData();
  }


  GetData = () => {
    const { navigation } = this.props;
    const itemId = navigation.getParam('id');

    const { page } = this.state;
    //console.log(URL.Publications());

    fetch(`${URL.Publications()}get_item?uuid=${itemId}`)
      .then((response) => response.json())
      .then((responseJson) => {
       // console.log(responseJson);
        this.setState({
          data:responseJson,
          isLoading: false,
        });

        let resources = responseJson['bitstream'];

          if(resources.length > 0){
          let fdoc = resources.filter(doc => {
              return doc['bundleName'] == "ORIGINAL";
          });

         if(fdoc.length > 0){
           console.log(fdoc[0])
            //let filedoc = fdoc[0]['retrieveLink']+'?isAllowed=y';
            this.setState({resources: fdoc[0]})
          }
        }

        
      })
      .catch(error => {
        this.setState({ error, isLoading: false });
         Alert.alert(
          "Unknown Error",
          "",
          [
            {
              text: "Go back",
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
  this.GetData();
}


  handleRefresh = () => {
    this.setState(
      {
        page: 0,
        refreshing: true
      },
      () => {
        this.GetData();
      }
    );
  };


  /*
  * Handle WWW File Method
  * fileType Default == "" you can use it, to set the File Extension (pdf,doc,xls,ppt etc) when in the Url the File Extension is missing.
  */
   handlePress(uri, name){
    var suffix_s = name.substring(name.length-3);
    this.setState({animating: true});
    /*if(Platform.OS === 'ios'){
      OpenFile.openDocBinaryinUrl([{
        //url:"https://calibre-ebook.com/downloads/demos/demo.docx",
        url: uri,
        fileNameOptional: name,
        fileType: suffix_s
      }], (error, url) => {
         if (error) {
          this.setState({animating: false});
         } else {
          this.setState({animating: false});
         }
       })
    }else{
      //Android
      this.setState({animating: true});
      OpenFile.openDoc([{
        url:uri, // Local "file://" + filepath
        fileName: name,
        cache:true,
        fileType: suffix_s
      }], (error, url) => {
         if (error) {
          this.setState({animating: false});
         } else {
          this.setState({animating: false});
         }
       })
    }*/
   
  }
  
 onShare = async () => {
    try {
      const result = await Share.share({
        message:
          this.state.data.name + ". Resource link: ",
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


  renderCitation = () => {
    if (this.state.data.citation) {
    return(
      <View >

        <Text style={{ color:'#ff6600', textAlign: 'center', fontWeight: 'bold', fontSize: 25, padding: 20}}>Citation</Text>

        <ListItem containerStyle={{backgroundColor: 'transparent'}}>
          <ListItem.Content>
            <ListItem.Title style={{ color: '#555', marginBottom:20, fontSize: 20, lineHeight: 30}}>{this.state.data.citation} </ListItem.Title>
          </ListItem.Content>
        </ListItem>

      </View>
      )}
      return(
      null
      )
  }

  renderDescription = () => {
    
      if (this.state.data.description) {
    return(
      <View>

       <Text style={{ color:'#ff6600', textAlign: 'center', fontWeight: 'bold', fontSize: 25, padding: 20}}>Description</Text>

        <ListItem containerStyle={{backgroundColor: 'transparent'}}>
          <ListItem.Content>
            <ListItem.Title style={{ color: '#555', marginBottom:20, fontSize: 18, lineHeight: 30}}>{this.state.data.description} </ListItem.Title>
          </ListItem.Content>
        </ListItem>

      </View>
      )}

      return(
      null
      )
  }

  renderResources = () => {
    const { navigate } = this.props.navigation;

    return this.state.resources ? (
      <View style={{flex: 1}}> 
        <View style={{flex: 1}}>
          <Text style={{ color:'#ff6600', textAlign: 'center', fontWeight: 'bold', fontSize: 25, paddingTop: 20}}>Resources</Text>
        </View>

        <ActivityIndicator  color = '#ff6600'
        animating={this.state.animating}/>

            <ListItem containerStyle={{backgroundColor: 'transparent'}} onPress={() => { navigate('PublicationItem', { url: this.state.resources.retrieveLink, otherParam: this.state.data.name })}}>
              <Icon name='file-pdf' size={24} color='#ff6600'/>
              <ListItem.Content>
                <ListItem.Title style={{ color:'#555', marginBottom:20}}>{this.state.resources.name}</ListItem.Title>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem>

        </View>
      ) : (
      <View style={{flex: 1, marginBottom: 20, padding: 10}}> 
        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-around'}}>

           <Text style={{ color:'#ff6600', textAlign: 'center', fontWeight: 'bold', fontSize: 25, padding: 20}}>Resources</Text>
        </View>

        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>

          <Text style={{ color:'#ccc', textAlign: 'center', fontSize: 20}}>No Resource(s) Available Please contact IITA Knowledge center</Text>

      </View>
    </View>
    )
  }
  
    setToggleTimeout() {
      this.setTimeout(() => {
        this.setState({animating: !this.state.animating});
        this.setToggleTimeout();
      }, 2000);
    }


  render() {

    const { navigate } = this.props.navigation;
    //const MetaData = this.metaData;
    const RenderResources = this.renderResources;
    const RenderDescription = this.renderDescription;
    const RenderCitation = this.renderCitation;
    

    if(this.state.isLoading){
      return(
        <View style={{flex: 1, justifyContent: 'center',
              alignItems: 'center'}}>
          <ActivityIndicator size='large' color = '#ff6600' ></ActivityIndicator>
        </View>
      )
    }
    return(
     <View style={{ flex: 1 }}>
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content"  />
        <ParallaxScrollView
         backgroundColor="#13234b"
          contentBackgroundColor="white"
          headerBackgroundColor="#333"
          stickyHeaderHeight={ STICKY_HEADER_HEIGHT }
          parallaxHeaderHeight={PARALLAX_HEADER_HEIGHT}
          backgroundSpeed={10}


          renderForeground={() => (
            <ImageBackground source={ this.state.data.thumbnail ? {uri: this.state.data.thumbnail} : require('../../image/library.jpg')} key="parallax-header" style={ styles.parallaxHeader }>
              <View style={{width:'100%', height:'100%', backgroundColor:'rgba(0,0,0,0.5)',justifyContent:'center', paddingLeft: 20, paddingRight: '20%'}}>

                  <Text style={Istyles.title}>{this.state.data.name}</Text>
                  
                  <Icon  style={Istyles.share} name='share-alt' size={30} color="#ff6600" onPress={this.onShare} ></Icon>
                  
            
              </View>
            </ImageBackground>
          )}

          renderStickyHeader={() => (
            <View key="sticky-header" style={styles.stickySection}>
              <Text numberOfLines={1} style={styles.stickySectionText}>{this.state.data.name}</Text>
            </View>
          )}

          >

          <RenderDescription/>

          <RenderCitation/>

          <RenderResources/>

      </ParallaxScrollView>

      </View>
    )
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

const styles = StyleSheet.create({
  image: {
    height: MAX_HEIGHT,
    width: Dimensions.get('window').width,
    alignSelf: 'stretch',
    resizeMode: 'cover',
  },
  title: {
    fontSize: 20,
  },
  name: {
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionContent: {
    fontSize: 16,
    textAlign: 'justify',
  },
  keywords: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  keywordContainer: {
    backgroundColor: '#999999',
    borderRadius: 10,
    margin: 10,
    padding: 10,
  },
  keyword: {
    fontSize: 16,
    color: 'white',
  },
  titleContainer: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10
  },
  imageTitle: {
    color: 'white',
    backgroundColor: 'transparent',
    fontSize: 21,
  },
  navTitleView: {
    height: MIN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
    opacity: 0,
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
  navTitle: {
    color: 'white',
    fontSize: 18,
    paddingRight: 50,
    paddingLeft: 70, 
    backgroundColor: 'transparent',
  },
  sectionLarge: {
    height: 600,
  },
});


