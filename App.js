import React, { Component, useEffect } from 'react';
import { Platform, StyleSheet, Text, View, Button, TouchableOpacity, Image, ImageBackground, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { createStackNavigator, TransitionSpecs, HeaderStyleInterpolators, TransitionPresets, Header } from 'react-navigation-stack';
import { createDrawerNavigator } from './react-navigation-drawer';
import SplashScreen from "react-native-splash-screen";
import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import { createMaterialTopTabNavigator } from 'react-navigation-tabs';
import News from './pages/News/news';
import NewsContent from "./pages/News/newscontent";
import Home from "./pages/home";
import Projects from "./pages/Projects/projects";
import ProjectsContent from "./pages/Projects/projectscontent";

import Events from "./pages/Events/events";
import EventDetails from "./pages/Events/eventDetails";

import Videos from "./pages/Videos/videos";
import VideoPlay from "./pages/Videos/videoplay";
import VideoPlaylist from "./pages/Videos/videoplaylist";
import VideosPlaylistItems from "./pages/Videos/videoplaylistitems";

import iReportPhoto from "./pages/Ireport/ireportPhoto";
import iReportVideo from "./pages/Ireport/ireportVideo";
import iReportPhotosDetails  from "./pages/Ireport/ireportPhotosDetails";
import iReportVideosDetails  from "./pages/Ireport/ireportVideosDetails";

import Publication from "./pages/Publications/publications";
import PublicationCollection from "./pages/Publications/publicationcollection";
import PublicationItem from "./pages/Publications/publicationitem";
import PublicationFile from "./pages/Publications/publicationsfile";
import PublicationIndex from "./pages/Publications/main";

import Presentations from "./pages/Presentations/Presentations";
import PresentationDetails from "./pages/Presentations/PresentationDetails";

import BigData from "./pages/BigData/bigdata";
import DataList from "./pages/BigData/datalist";
import DataFile from "./pages/BigData/datafile";
import DataSets from "./pages/BigData/datasets";
//import RadioScreen from "./pages/radio";

//import Weather from "./pages/Weather/weather";
//import WeatherData from "./pages/Weather/weatherData";

import Databases from "./pages/Databases/Databases";
import MusaBase from "./pages/Databases/Musabase";
import CassavaBase from "./pages/Databases/Cassavabase";
import YamBase from "./pages/Databases/Yambase";

import Photos from "./pages/Photos/photos";
import PhotosAlbulm from "./pages/Photos/albulm";
import Viewer from "./pages/BigData/viewer";
import Settings from "./pages/Settings/Settings";
import OtherApps from "./pages/OtherApps/otherapps";
import Privacy from "./pages/About/privacy";
import About from "./pages/About/about";
import Terms from "./pages/About/terms";
import DrawerContent from "./SideMenu";

/*

 function Root() {
  return (
    <Stack.Navigator  initialRouteName="Home" screenOptions={{
          gestureEnabled: true,
          headerStyle: {
            backgroundColor: '#101010'
          },
          headerTitleStyle: {
            fontWeight: 'bold'
          },
          headerTintColor: '#ffd700',
          headerBackTitle: 'Back',
          headerTitleAlign: 'center',
          gestureEnabled: true,
          headerStyleInterpolator: HeaderStyleInterpolators.forUIKit,
          ...TransitionPresets.SlideFromRightIOS,
          headerMode:'screen',
          headerTranslucent: true,
          transitionSpec: {
          open: TransitionSpecs.TransitionIOSSpec,
          close: TransitionSpecs.TransitionIOSSpec,
          },
        }}
        >
      <Stack.Screen name="Home" component={Home} options={({ navigation, route }) => ({
          title: 'IITA',
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTintColor: '#222',
          headerTitleStyle: {
            fontWeight: 'bold',
            textAlign: 'center',
          },
          headerLeft: () => (
        <TouchableOpacity
         onPress = {navigation.toggleDrawer}
        >
          <Image source={require('./image/drawer.png')} style={{ width: 25, height: 25, marginLeft: 10 }}></Image>
        </TouchableOpacity>
      ),
        })}/>

*/



const iReportTab = createMaterialTopTabNavigator(
  {
    iReportPhoto: { screen: iReportPhoto },
    iReportVideo: { screen: iReportVideo },
  },
  {
    initialRouteName: 'iReportPhoto',
    lazy: true,
   // tabBarPosition: 'bottom',
    tabBarOptions: {
      indicatorStyle:{color: '#fff', backgroundColor: '#13234b', elevation: 2, height: 3},
      labelStyle: {
     fontSize: 12,
      },
      style: {
        backgroundColor: '#13234b',
      },
  }
}
);


const BigDataTab = createMaterialTopTabNavigator(
  {
    DataSets: { screen: DataSets },
    BigData: { screen: BigData },
  },
  {
    initialRouteName: 'DataSets',
    lazy: true,
    //tabBarPosition: 'bottom',
    tabBarOptions: {
      indicatorStyle:{color: '#fff', backgroundColor: '#13234b', elevation: 2, height: 3},
      labelStyle: {
     fontSize: 12,
      },
      style: {
        backgroundColor: '#13234b',
      },
  }
}
);




const VideosTab = createMaterialTopTabNavigator(
  {
    Videos: { screen: Videos, tabBarOptions: {title: 'All Videos', headerStyle: {
          backgroundColor: '#13234b', headerTintColor: '#fff'}, showIcon: true, icon: ''} },
    VideoPlaylist: { screen: VideoPlaylist, navigationOptions: {title: 'Playlist', headerStyle: {
          backgroundColor: '#13234b', headerTintColor: '#fff'}, showIcon: true} },
  },
  {
    initialRouteName: 'Videos',
    lazy: true,
   // tabBarPosition: 'bottom',
    tabBarOptions: {
      indicatorStyle:{color: '#fff', backgroundColor: '#fff', elevation: 2, height: 3},
      labelStyle: {
     fontSize: 12,
      },
      style: {
        backgroundColor: '#13234b',
      },
}
  }
);


const DashboardStack = createStackNavigator({
  Home: Home,
  News: News,
  Projects: Projects,
  Publication: Publication,
  Presentations: Presentations,
  PresentationDetails: PresentationDetails,
  Events: Events,
  DataSets: DataSets,
  NewsContent: NewsContent,
  Videos: Videos,
  Photos: Photos,
  PhotosAlbulm: PhotosAlbulm,
  OtherApps: OtherApps,
  Settings: Settings,
  Privacy: Privacy,
  About: About,
  Terms: Terms,
  Databases: Databases,
  CassavaBase: CassavaBase,
  YamBase: YamBase,
  MusaBase: MusaBase,
  VideoPlaylist: VideoPlaylist,
  iReportPhotosDetails: iReportPhotosDetails,
  iReportVideosDetails: iReportVideosDetails,
  iReportTab: {
      screen: iReportTab,
      //You can set the header image and title for the screen from here also
      navigationOptions: {
        title: 'iReport',
        headerStyle: {
          backgroundColor: '#13234b',
          //height: 60
        },
        headerTintColor: '#ffffff',
      }
    },
    VideosTab: {
      screen: VideosTab,
      //You can set the header image and title for the screen from here also
      navigationOptions: {
        title: 'Videos',
        headerStyle: {
          backgroundColor: '#13234b',
          //height: 60
        },
        headerTintColor: '#ffffff',
      }
    },
     BigDataTab: {
      screen: BigDataTab,
      //You can set the header image and title for the screen from here also
      navigationOptions: {
        title: 'Big Data',
        headerStyle: {
          backgroundColor: '#13234b',
          //height: 60
        },
        headerTintColor: '#ffffff',
      }
    },
  ProjectsContent: ProjectsContent,
  PublicationCollection: PublicationCollection,
  PublicationItem: PublicationItem,
  PublicationFile: PublicationFile,
  PublicationIndex:PublicationIndex,
  DataList: DataList,
  DataFile: DataFile,
  //Weather: Weather,
  //WeatherData: WeatherData,
  Viewer: Viewer,
  //RadioScreen: RadioScreen,
  VideoPlay: VideoPlay,
  EventDetails: EventDetails,
  VideosPlaylistItems: VideosPlaylistItems
}, {
  initialRouteName: 'Home',
  defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: '#13234b',
      },
      headerTintColor: '#ffffff',
      headerTitleStyle: {
      //paddingLeft: 50,
      },
      headerTitleContainerStyle: {
        marginLeft: 80,
        marginRight: 60
      },
      headerTitleAlign: 'center',
      headerBackTitle: 'Back',
      headerTitleAllowFontScaling: true,
      headerLeftContainerStyle: {
      marginRight: 50,
      },
      transitionSpec: {
        open: TransitionSpecs.TransitionIOSSpec,
        close: TransitionSpecs.TransitionIOSSpec,
      },
      //gestureEnabled: true,
      headerStyleInterpolator: HeaderStyleInterpolators.forUIKit,
      ...TransitionPresets.SlideFromRightIOS,
      //headerMode:'screen',
    },
})


const DrawerNav = createDrawerNavigator({

  Home: DashboardStack,
  Projects: Projects,

}, {
  contentComponent: DrawerContent
});


 let Navigation = createAppContainer(DrawerNav);

export default class App extends React.Component {

  componentDidMount(){
    SplashScreen.hide();
  }
  render(){
    return (
      <Navigation />
    )
  }
}


export  class OnesignalPush extends React.Component {

  constructor(props) {
    super(props);
  }

  

  onIds(device) {
    console.log('Device info: ', device);
  }

  render(){
    return (<App />)
  }
}



