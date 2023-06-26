import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';
import { ScrollView, TouchableOpacity, Text, View, StatusBar, Image, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { ThemeContext } from 'react-navigation';
import { ListItem, Avatar, Divider } from 'react-native-elements';

class DrawerContent extends Component {
  static contextType = ThemeContext;

  navigateToScreen = route => () => {
    const navigate = NavigationActions.navigate({
      routeName: route,
    });
    this.props.navigation.dispatch(navigate);
  };



  openLink(link){
    Linking.openURL(link).catch(err => console.log('Error', err));
  }



  render() {
    const theme = this.context;
    const colorss = theme === 'light' ? '#ff6600' : '#ff6600'
    return (

      <View style={styles.containerStyle}>
        
        <ScrollView>
        <View>


          <ListItem onPress={this.navigateToScreen('Home')} Component={TouchableOpacity} bottomDivider containerStyle={{backgroundColor: 'transparent', marginLeft: 20, marginTop: 20}} leftContent={()=><Icon name='home' size={20} color = '#ff6600' />}>
            <ListItem.Content>
              <ListItem.Title style={{ color: '#222', fontSize: 15, fontWeight: 'bold'}}>Main </ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>

          {/*<ListItem onPress={this.navigateToScreen('News')} Component={TouchableOpacity} bottomDivider containerStyle={{backgroundColor: 'transparent', marginLeft: 20, marginTop: 20}} leftContent={()=><Icon name='newspaper' size={20} color = '#ff6600' />}>
            <ListItem.Content>
              <ListItem.Title style={{ color: '#222', fontSize: 15, fontWeight: 'bold'}} >News </ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>

          <ListItem onPress={this.navigateToScreen('Events')} Component={TouchableOpacity} bottomDivider containerStyle={{backgroundColor: 'transparent', marginLeft: 20, marginTop: 20}} leftContent={()=><Icon name='calendar-alt' size={20} color = '#ff6600' />}>
            <ListItem.Content>
              <ListItem.Title style={{ color:'#222', fontSize: 15, fontWeight: 'bold'}} >Events </ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>


          <ListItem onPress={this.navigateToScreen('Projects')} Component={TouchableOpacity} bottomDivider containerStyle={{backgroundColor: 'transparent', marginLeft: 20, marginTop: 20}} leftContent={()=><Icon name='briefcase' size={20} color = '#ff6600' />}>
            <ListItem.Content>
              <ListItem.Title style={{ color: '#222', fontSize: 15, fontWeight: 'bold'}} >Projects </ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>


          <ListItem onPress={this.navigateToScreen('Projects')} Component={TouchableOpacity} bottomDivider containerStyle={{backgroundColor: 'transparent', marginLeft: 20, marginTop: 20}} leftContent={()=><Icon name='briefcase' size={20} color = '#ff6600' />}>
            <ListItem.Content>
              <ListItem.Title style={{ color: '#222', fontSize: 15, fontWeight: 'bold'}} >Projects </ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>



          <ListItem onPress={this.navigateToScreen('Publication')} Component={TouchableOpacity} bottomDivider containerStyle={{backgroundColor: 'transparent', marginLeft: 20, marginTop: 20}} leftContent={()=><Icon name='book-open' size={20} color = '#ff6600' />}>
            <ListItem.Content>
              <ListItem.Title style={{ color: '#222', fontSize: 15, fontWeight: 'bold'}} >Publications </ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>


          <ListItem onPress={this.navigateToScreen('DataSets')} Component={TouchableOpacity} bottomDivider containerStyle={{backgroundColor: 'transparent', marginLeft: 20, marginTop: 20}} leftContent={()=><Icon name='database' size={20} color = '#ff6600' />}>
            <ListItem.Content>
              <ListItem.Title style={{ color: '#222', fontSize: 15, fontWeight: 'bold'}} >Data </ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>

          <ListItem onPress={this.navigateToScreen('PhotosAlbulm')} Component={TouchableOpacity} bottomDivider containerStyle={{backgroundColor: 'transparent', marginLeft: 20, marginTop: 20}} leftContent={()=><Icon name='youtube' size={20} color = '#ff6600' />}>
            <ListItem.Content>
              <ListItem.Title style={{ color: '#222', fontSize: 15, fontWeight: 'bold'}} >Videos </ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>

          <ListItem onPress={this.navigateToScreen('Photos')} Component={TouchableOpacity} bottomDivider containerStyle={{backgroundColor: 'transparent', marginLeft: 20, marginTop: 20}} leftContent={()=><Icon name='youtube' size={20} color = '#ff6600' />}>
            <ListItem.Content>
              <ListItem.Title style={{ color:'#222', fontSize: 15, fontWeight: 'bold'}} >Photos </ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>

          <ListItem onPress={this.navigateToScreen('Databases')} Component={TouchableOpacity} bottomDivider containerStyle={{backgroundColor: 'transparent', marginLeft: 20, marginTop: 20}} leftContent={()=><Icon name='database' size={20} color = '#ff6600' />}>
            <ListItem.Content>
              <ListItem.Title style={{ color: '#222', fontSize: 15, fontWeight: 'bold'}} >Databases </ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>

          <ListItem onPress={this.navigateToScreen('iReportTab')} Component={TouchableOpacity} bottomDivider containerStyle={{backgroundColor: 'transparent', marginLeft: 20, marginTop: 20}} leftContent={()=><Icon name='camera-retro' size={20} color = '#ff6600' />}>
            <ListItem.Content>
              <ListItem.Title style={{ color: '#222', fontSize: 15, fontWeight: 'bold'}} >iReport </ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>

          <ListItem onPress={this.navigateToScreen('Settings')} Component={TouchableOpacity} bottomDivider containerStyle={{backgroundColor: 'transparent', marginLeft: 20, marginTop: 20}} leftContent={()=><Icon name='cogs' size={20} color = '#ff6600' />}>
            <ListItem.Content>
              <ListItem.Title style={{ color: '#222', fontSize: 15, fontWeight: 'bold'}} >Settings </ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>*/}

         <ListItem Component={TouchableOpacity} bottomDivider containerStyle={{backgroundColor: 'transparent', marginLeft: 20, marginTop: 20}} leftContent={()=><Icon name='google-play' size={20} color = '#ff6600' />}>
            <ListItem.Content>
              <ListItem.Title style={{ color: '#222', fontSize: 15, fontWeight: 'bold'}} onPress={this.navigateToScreen('OtherApps')}>Other IITA Apps </ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>

          
          <ListItem onPress={this.navigateToScreen('About')} Component={TouchableOpacity} bottomDivider containerStyle={{backgroundColor: 'transparent', marginLeft: 20, marginTop: 20}} leftContent={()=><Icon name='users' size={20} color = '#ff6600' />}>
            <ListItem.Content>
              <ListItem.Title style={{ color:'#222', fontSize: 15, fontWeight: 'bold'}} >About IITA </ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>

          <ListItem onPress={this.navigateToScreen('Privacy')} Component={TouchableOpacity} bottomDivider containerStyle={{backgroundColor: 'transparent', marginLeft: 20, marginTop: 20}} leftContent={()=><Icon name='user-lock' size={20} color = '#ff6600' />}>
            <ListItem.Content>
              <ListItem.Title style={{ color: '#222', fontSize: 15, fontWeight: 'bold'}} >Privacy policy</ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>


          <ListItem onPress={this.navigateToScreen('Terms')} Component={TouchableOpacity} bottomDivider containerStyle={{backgroundColor: 'transparent', marginLeft: 20, marginTop: 20}} leftContent={()=><Icon name='file-alt' size={20} color = '#ff6600' />}>
            <ListItem.Content>
              <ListItem.Title style={{ color:'#222', fontSize: 15, fontWeight: 'bold'}} >Terms of use </ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>

          <Text style={{color:'#555',  paddingLeft: 20, paddingTop: 30, fontSize: 15, fontWeight:'bold'}}> Stay connected with us </Text>
          <View style={{flexDirection:'row', justifyContent: 'center'}}>

              <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', borderRadius: 5,paddingVertical: 10}} onPress={()=>{this.openLink('https://www.facebook.com/IITA.CGIAR')}}>
                  <Image source={require('./image/facebook.png')} style={{ width: 40, height: 40, resizeMode: 'contain',}}></Image>
              </TouchableOpacity>

              <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', borderRadius: 5,paddingVertical: 10}} onPress={()=>{this.openLink('https://twitter.com/IITA_CGIAR')}}>
                  <Image source={require('./image/twitter.png')} style={{ width: 40, height: 40, resizeMode: 'contain',}}></Image>
              </TouchableOpacity>

              <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', borderRadius: 5,paddingVertical: 10}} onPress={()=>{this.openLink('https://ng.linkedin.com/company/iita')}}>
                  <Image source={require('./image/linkedin.png')} style={{ width: 40, height: 40, resizeMode: 'contain',}}></Image>
              </TouchableOpacity>

              <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', borderRadius: 5,paddingVertical: 10}} onPress={()=>{this.openLink('https://youtube.com/user/IITAPUBLISHING')}}>
                  <Image source={require('./image/youtube.png')} style={{ width: 40, height: 40, resizeMode: 'contain',}}></Image>
              </TouchableOpacity>

              <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', borderRadius: 5,paddingVertical: 10}} onPress={()=>{this.openLink('https://www.researchgate.net/institution/International_Institute_of_Tropical_Agriculture')}}>
                  <Image source={require('./image/rsg.png')} style={{ width: 40, height: 40, resizeMode: 'contain',}}></Image>
              </TouchableOpacity>

              <TouchableOpacity style={{ justifyContent: 'center', alignItems: 'center', borderRadius: 5,paddingVertical: 10}} onPress={()=>{this.openLink('https://flickr.com/photos/iita-media-library/')}}>
                  <Image source={require('./image/flickr.png')} style={{ width: 40, height: 40, resizeMode: 'contain',}}></Image>
              </TouchableOpacity>

          </View>
        </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = {
  containerStyle: {
    flex: 1,
    marginTop: 50,
  },
};

export default DrawerContent;

/*

<ListItem
        Component = {TouchableOpacity}
        leftIcon = {<Icon name='bell' size={20} color = {colorss} />}
        title="Notifications" onPress={this.navigateToScreen('Notifications')}
        titleStyle={{ color: theme === 'light' ? '#000' : '#fff', fontSize: 15, fontWeight: 'bold'}}
        containerStyle={{backgroundColor: 'transparent', marginBottom: 20, marginLeft: 20}}
        bottomDivider
        />


 <ListItem
        Component = {TouchableOpacity}
        leftIcon = {<Icon name='question-circle' size={20} color = {colorss} />}
        title="Help" onPress={this.navigateToScreen('Help')}
        titleStyle={{ color: theme === 'light' ? '#000' : '#fff', fontSize: 15, fontWeight: 'bold'}}
        containerStyle={{backgroundColor: 'transparent', marginLeft: 20}}
        
        />


        <ListItem
        Component = {TouchableOpacity}
        leftIcon = {<Icon name="info-circle" size={20} color = {colorss} />}
        title="Faq" onPress={this.navigateToScreen('Faq')}
        titleStyle={{ color: theme === 'light' ? '#000' : '#fff', fontSize: 15, fontWeight: 'bold'}}
        containerStyle={{backgroundColor: 'transparent', marginLeft: 20}}
        
        />
*/