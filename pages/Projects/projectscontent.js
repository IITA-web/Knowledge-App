import * as React from 'react';
import { FlatList, Share, ActivityIndicator, Text, View, Appearance, ScrollView, Dimensions, TouchableOpacity, StyleSheet, Image, Alert, Vibration, SafeAreaView } from 'react-native';
//import { ListItem, Image } from 'react-native-elements';
import { Avatar, Button, Card, Title, Paragraph, Divider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { HtmlParseAndView, HtmlParseAndViewProps, HtmlStyles } from '@react-native-html/renderer';

export default class ProjectsContent extends React.Component {
static navigationOptions = ({ navigation, navigationOptions }) => {
    return {
      title: navigation.getParam('otherParam', 'News'),
      headerRight: () => (

        <TouchableOpacity  style={{ paddingRight: 20}} onPress={navigation.getParam('share')}>
          <Icon name='share-alt' size={20} color='#555' ></Icon>
        </TouchableOpacity>
      ),
    };
  };

  constructor(props){
    super(props);
    this.state ={ isLoading: true}
  }

  componentDidMount(){
    
    const { navigation } = this.props;
    const itemId = navigation.getParam('id', 'NO-ID');
    this.props.navigation.setParams({ share: this.onShare });
    return fetch('https://iita.org/wp-json/wp/v2/iita-project/' + itemId)
      .then((response) => response.json())
      .then((responseJson) => {

        this.setState({
          isLoading: false,
          dataSource: responseJson,
          description: responseJson['post-meta-fields']['wpcf-project-description']
          //descriptions: '<body>'+ description + '</body>',
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
  }

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
              alignItems: 'center', color: '#ff6600'}}>
          <ActivityIndicator size='large' color = '#ff6600'></ActivityIndicator>
        </View>
      )
    }

    if(this.state.description == null){
      return(
        <View style={{flex: 1, justifyContent: 'center',
              alignItems: 'center', color: '#222', paddingLeft: 25, paddingRight:25}}>
          <Text> No description for this Project</Text>
        </View>
      )
    }

    return (
          <SafeAreaView>
            <ScrollView style={{ padding: 25, paddingBottom: 50 }}>
                <Text style={{fontSize: 25, paddingBottom: 50}}>{this.state.dataSource.title.rendered.toUpperCase()}</Text>

                <HtmlParseAndView
                  rawHtml={this.state.description}
                  htmlStyles={htmlStyles}
                  containerStyle={styles.container}

                />
            </ScrollView>
          </SafeAreaView>
        );
  }
}



const htmlStyles: HtmlStyles = {
  text: {
    fontSize: 18,
    lineHeight: 30,
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
    color: '#ff6600',
  },
  h2: {
    fontSize: 26,
    lineHeight: 26 * 1.4,
    marginTop: 10,
    fontWeight: '500',
    color: '#ff6600',
  },
  h3: {
    fontSize: 24,
    lineHeight: 24 * 1.4,
    marginTop: 10,
    fontWeight: '500',
    color: '#ff6600',
  },
  listItem: {
    marginVertical: 2,
  },
  listItemContent: {},
};



const styles = StyleSheet.create({
  a: {
    fontWeight: '300',
    color: '#ff6600',
  },
  body: {
    color: '#222',
    fontSize: 17,
  },
  h3:{
    color: '#ff6600',
    fontSize: 24,
    fontWeight: 'bold'
  },
  h4:{
    color: '#ff6600',
    fontSize: 24,
    fontWeight: 'bold'
  },
  h5:{
    color: '#ff6600',
    fontSize: 24,
    fontWeight: 'bold'
  },
  h2:{
    color: '#ff6600',
    fontSize: 24,
    fontWeight: 'bold'
  },
  h1:{
    color: '#ff6600',
    fontSize: 24,
    fontWeight: 'bold'
  },
  h6:{
    color: '#ff6600',
    fontSize: 24,
    fontWeight: 'bold'
  }
});
