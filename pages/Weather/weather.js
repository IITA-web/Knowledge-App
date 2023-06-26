import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Dimensions, PermissionsAndroid, Platform, Alert, StatusBar, Text, TouchableOpacity, ActivityIndicator, Vibration } from 'react-native';
import MapView, { Marker, ProviderPropType, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';


const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;

const LATITUDE_DELTA = 0.0922
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO
const SPACE = 0.01;

function log(eventName, e) {
  console.log(eventName, e.nativeEvent);
}

export default class Weather extends React.Component {

   static navigationOptions = ({ navigation, navigationOptions }) => {

    return {
      title: "Weather",
      //headerTransparent: true
    };
  };
   constructor(props) {
    super(props);
    this.state = {
      initialPosition: {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0,
        longitudeDelta: 0,
      },
    };
  }


 componentDidMount = () => {
  this.props.navigation.setParams({ searchLocation: this.GooglePlacesInput });
  var that =this;
  //Checking for the permission just after component loaded
  if(Platform.OS === 'ios'){
    this.callLocation(that);
  }else{
    async function requestLocationPermission() {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,{
            'title': 'Location Access Required',
            'message': 'This App needs to Access your location'
          }
        )
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          //To Check, If Permission is granted
          that.callLocation(that);
        } else {
          alert("Permission Denied");
        }
      } catch (err) {
        //alert("err",err);
        Alert.alert(
      "ERROR",
      err,
      [
        {
          text: "Go Back",
          onPress: () =>  this.props.navigation.navigate('Home'),
          style: "cancel"
        }
      ],
      { cancelable: false }
    );
      }
    }
    requestLocationPermission();
  }    
 }


 callLocation(that){
    Geolocation.getCurrentPosition(
       (position) => {
          const currentLongitude = JSON.stringify(position.coords.longitude);
          const currentLatitude = JSON.stringify(position.coords.latitude);

          
        var initialRegion = {
        latitude: Number(currentLatitude),
        longitude: Number(currentLongitude),
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }
      //console.log(initialRegion);
      this.setState({
        position : position,
        initialPosition: initialRegion,
        a: {
        latitude: Number(initialRegion.latitude),
        longitude: Number(initialRegion.longitude),
      }})
       },
       (error) => 
         Alert.alert(
      "ERROR",
      error.message,
      [
        {
          text: "Go Back",
          onPress: () =>  this.props.navigation.navigate('Home'),
          style: "cancel"
        }
      ],
      { cancelable: false }
    ),
       { enableHighAccuracy: true, forceRequestLocation: true, timeout: 20000, maximumAge: 1000 }
    );

  }




lastPosition(e){
  const latitude =  e['nativeEvent']['coordinate']['latitude'];
  const longitude = e['nativeEvent']['coordinate']['longitude'];
  Alert.alert(
      "Location Selected",
      "Tap Continue to proceed or cancel to pick another Location",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "Continue", onPress: () =>  this.props.navigation.navigate('WeatherData', { latitude: latitude , longitude: longitude })}
      ],
      { cancelable: false }
    );
}

searchBars = () => {
  return(
    <GooglePlacesAutocomplete
      placeholder='Search location'
      onPress={(data, details = null) => {

        console.log(details);

        var initialRegion = {
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      }
      this.setState({NewPosition: initialRegion, a: {
        latitude: initialRegion.latitude,
        longitude: initialRegion.longitude,
      }})

      }}
      query={{
        key: 'AIzaSyAiQKaAOUMw4nBZzUfdsBTw8D4Km3uWiEw',
        language: 'en',
      }}
      minLength={2}
      autoFocus={false}
      returnKeyType={'default'}
      fetchDetails={true}
      currentLocation={true} 
        filterReverseGeocodingByTypes={[
          'locality',
          'administrative_area_level_3',
        ]}
      styles={{
      textInputContainer: {
      backgroundColor: 'rgba(0,0,0,0)',
      borderTopWidth: 0,
      borderBottomWidth: 0,
    },
    textInput: {
      marginLeft: 10,
      marginRight: 10,
      color: '#5d5d5d',
      fontSize: 16,
      height: 40,
    },
    row:{
      backgroundColor: 'rgba(0,0,0,0.5)',
      color: '#fff',
      marginLeft: 10,
      marginRight: 10,
    },
    description: {
      color: '#fff',
      fontWeight: 'bold',
    },
    poweredContainer: {
      height: 0,
      width: 0,
      backgroundColor: 'rgba(0,0,0,0)',
    },
    powered: {
      height: 0,
      width: 0,
      backgroundColor: 'rgba(0,0,0,0)',
    },
    predefinedPlacesDescription: {
      color: '#1faadb',
    },
  }}
    />
    )
}


  render() {
    const PlaceSearch = this.searchBars;
    <StatusBar translucent backgroundColor="transparent" barStyle="light-content"  />
    return this.state.position ? (
      <View style={styles.container}>
      
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={this.state.NewPosition}
          showsUserLocation
          showsMyLocationButton
          initialRegion={this.state.initialPosition}
          enableZoomControl={true}
        >
    
      
          <Marker
            coordinate={this.state.a}
            //onSelect={e => log('onSelect', e)}
            //onDrag={e => log('onDrag', e)}
            //onDragStart={e => log('onDragStart', e)}
            onDragEnd={e => this.lastPosition(e)}
            onPress={e => this.lastPosition(e)}
            draggable
          />
        </MapView>
        <View style={{top: 5, width: '98%', borderRadius: 10, position: 'absolute'}}>
      <PlaceSearch />
      </View>

      <View style={{bottom: 20, backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: 10, marginLeft: '2%', marginRight: '2%', borderRadius: 10}}>
        <Text style={{textAlign: 'center', color: '#5d5d5d'}}>Drag or Tap the Marker to confirm Location</Text>
      </View>
      </View>
    ): (
        <View style={{flex: 1, justifyContent: 'center',
              alignItems: 'center', color: '#ff6600'}}>
          <ActivityIndicator color = '#ff6600' ></ActivityIndicator>
        </View>);
  }
}

Weather.propTypes = {
  provider: ProviderPropType,
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  search: {
    ...StyleSheet.absoluteFillObject,
    marginLeft: 50
  }
});