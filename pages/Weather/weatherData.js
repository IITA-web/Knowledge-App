
import React from 'react';
import { FlatList, LayoutAnimation, processColor, AppRegistry, ActivityIndicator, Text, View, ScrollView, StyleSheet, Dimensions, Alert, TouchableOpacity, StatusBar, Vibration } from 'react-native';
import { ThemeContext } from 'react-navigation';
import { ListItem, Icon } from 'react-native-elements';
import update from "immutability-helper";
import moment from 'moment';
import { LineChart } from "react-native-charts-wrapper";
import { Modal, Portal, Button, Provider } from 'react-native-paper';
//import Orientation from 'react-native-orientation-locker';

const petrel = "rgb(59, 145, 153)";

export default class WeatherData extends React.Component {
static contextType = ThemeContext;
  static navigationOptions = ({ navigation, navigationOptions }) => {
    return {
      title: navigation.getParam('otherParam', 'Meteorological Weather Forecast'),
    };
  };
  constructor(props){
    super(props);
    this.state ={ isLoading: true,
                  loadingMore: false, 
                  page: 0,
                  refreshing: false,
                  visible: false,
                }
  }

 _showModal = () => this.setState({ visible: true });
  _hideModal = () => this.setState({ visible: false });


  handleSelect(event) {
    let entry = event.nativeEvent;
    if (entry == null) {
      this.setState({ ...this.state, selectedEntry: null });
    } else {
      this.setState({ ...this.state, selectedEntry: JSON.stringify(entry) });
    }

    console.log(event.nativeEvent);
  }
/*componentWillUnmount() {
Orientation.unlockAllOrientations();
}*/
  componentDidMount(){
    //Orientation.lockToLandscape();
    const { navigation } = this.props;
    const latitude = navigation.getParam('latitude', 'NO Latitude Provided');
    const longitude = navigation.getParam('longitude', 'NO Latitude Provided');
    const url = 'https://api.weatherbit.io/v2.0/forecast/agweather?lat='+latitude+'&lon='+longitude+'&key=e965de432199434b8702a29d6e6f7819';
    return fetch(url)
      .then((response) => response.json())
      .then((responseJson) => {
          console.log(responseJson);
          console.log(url);
        
        /*const wd = {"data": [{"bulk_soil_density": 1520, "dlwrf_avg": 287.714, "dlwrf_max": 313, "dlwrf_net": -124.737, "dswrf_avg": 377.429, "dswrf_max": 970, "dswrf_net": 322.571, "evapotranspiration": 6.286, "precip": 0, "pres_avg": 1008.4, "skin_temp_avg": 19.4, "skin_temp_max": 29.9, "skin_temp_min": 11.3, "soilm_0_10cm": 27.925, "soilm_100_200cm": 291, "soilm_10_40cm": 84.364, "soilm_40_100cm": 168.633, "soilt_0_10cm": 18.9, "soilt_100_200cm": 15, "soilt_10_40cm": 17.8, "soilt_40_100cm": 16.8, "specific_humidity": 0.0041524998378009, "temp_2m_avg": 17.6, "v_soilm_0_10cm": 0.279, "v_soilm_100_200cm": 0.291, "v_soilm_10_40cm": 0.281, "v_soilm_40_100cm": 0.281, "valid_date": "2020-05-04", "wind_10m_spd_avg": 2.243}, {"bulk_soil_density": 1520, "dlwrf_avg": 299.009, "dlwrf_max": 326, "dlwrf_net": -110.826, "dswrf_avg": 329.5, "dswrf_max": 950, "dswrf_net": 282.5, "evapotranspiration": 6.072, "precip": 0, "pres_avg": 1007.731, "skin_temp_avg": 19.6, "skin_temp_max": 28.8, "skin_temp_min": 13.3, "soilm_0_10cm": 27.8, "soilm_100_200cm": 291, "soilm_10_40cm": 84.402, "soilm_40_100cm": 168.108, "soilt_0_10cm": 19.4, "soilt_100_200cm": 15, "soilt_10_40cm": 18.3, "soilt_40_100cm": 16.9, "specific_humidity": 0.0051775668398477, "temp_2m_avg": 17.9, "v_soilm_0_10cm": 0.278, "v_soilm_100_200cm": 0.291, "v_soilm_10_40cm": 0.281, "v_soilm_40_100cm": 0.28, "valid_date": "2020-05-05", "wind_10m_spd_avg": 3.544}, {"bulk_soil_density": 1520, "dlwrf_avg": 304.125, "dlwrf_max": 329, "dlwrf_net": -110.168, "dswrf_avg": 330.875, "dswrf_max": 960, "dswrf_net": 283.875, "evapotranspiration": 6.086, "precip": 0, "pres_avg": 1007.157, "skin_temp_avg": 20.9, "skin_temp_max": 29.9, "skin_temp_min": 12.4, "soilm_0_10cm": 27.663, "soilm_100_200cm": 290.75, "soilm_10_40cm": 84.214, "soilm_40_100cm": 167.883, "soilt_0_10cm": 20, "soilt_100_200cm": 15.1, "soilt_10_40cm": 18.4, "soilt_40_100cm": 16.9, "specific_humidity": 0.0060599998687394, "temp_2m_avg": 19.4, "v_soilm_0_10cm": 0.277, "v_soilm_100_200cm": 0.291, "v_soilm_10_40cm": 0.281, "v_soilm_40_100cm": 0.28, "valid_date": "2020-05-06", "wind_10m_spd_avg": 2.636}, {"bulk_soil_density": 1520, "dlwrf_avg": 315.033, "dlwrf_max": 341, "dlwrf_net": -118.952, "dswrf_avg": 317.125, "dswrf_max": 920, "dswrf_net": 269.875, "evapotranspiration": 5.589, "precip": 0, "pres_avg": 1002.321, "skin_temp_avg": 23.9, "skin_temp_max": 34.2, "skin_temp_min": 15.9, "soilm_0_10cm": 27.6, "soilm_100_200cm": 290, "soilm_10_40cm": 84.214, "soilm_40_100cm": 167.733, "soilt_0_10cm": 22.9, "soilt_100_200cm": 15.2, "soilt_10_40cm": 19.5, "soilt_40_100cm": 17.1, "specific_humidity": 0.0054837499046698, "temp_2m_avg": 22.3, "v_soilm_0_10cm": 0.276, "v_soilm_100_200cm": 0.29, "v_soilm_10_40cm": 0.281, "v_soilm_40_100cm": 0.28, "valid_date": "2020-05-07", "wind_10m_spd_avg": 1.742}, {"bulk_soil_density": 1520, "dlwrf_avg": 329.25, "dlwrf_max": 359, "dlwrf_net": -112.532, "dswrf_avg": 307, "dswrf_max": 920, "dswrf_net": 262.625, "evapotranspiration": 5.777, "precip": 0, "pres_avg": 1000.331, "skin_temp_avg": 25.4, "skin_temp_max": 36.2, "skin_temp_min": 17, "soilm_0_10cm": 27.513, "soilm_100_200cm": 290, "soilm_10_40cm": 84.102, "soilm_40_100cm": 167.883, "soilt_0_10cm": 24.2, "soilt_100_200cm": 15.3, "soilt_10_40cm": 20.6, "soilt_40_100cm": 17.4, "specific_humidity": 0.0059612498735078, "temp_2m_avg": 23.8, "v_soilm_0_10cm": 0.275, "v_soilm_100_200cm": 0.29, "v_soilm_10_40cm": 0.28, "v_soilm_40_100cm": 0.28, "valid_date": "2020-05-08", "wind_10m_spd_avg": 1.719}, {"bulk_soil_density": 1520, "dlwrf_avg": 326.125, "dlwrf_max": 354, "dlwrf_net": -122.545, "dswrf_avg": 329.625, "dswrf_max": 940, "dswrf_net": 281.5, "evapotranspiration": 6.366, "precip": 0, "pres_avg": 999.761, "skin_temp_avg": 26, "skin_temp_max": 36.7, "skin_temp_min": 18.4, "soilm_0_10cm": 27.45, "soilm_100_200cm": 290, "soilm_10_40cm": 83.914, "soilm_40_100cm": 167.658, "soilt_0_10cm": 25.3, "soilt_100_200cm": 15.4, "soilt_10_40cm": 21.6, "soilt_40_100cm": 17.8, "specific_humidity": 0.0053349998779595, "temp_2m_avg": 24.3, "v_soilm_0_10cm": 0.275, "v_soilm_100_200cm": 0.29, "v_soilm_10_40cm": 0.28, "v_soilm_40_100cm": 0.279, "valid_date": "2020-05-09", "wind_10m_spd_avg": 1.845}, {"bulk_soil_density": 1520, "dlwrf_avg": 334.375, "dlwrf_max": 375, "dlwrf_net": -99.959, "dswrf_avg": 282, "dswrf_max": 780, "dswrf_net": 239.875, "evapotranspiration": 5.563, "precip": 0, "pres_avg": 998.297, "skin_temp_avg": 23.6, "skin_temp_max": 31.5, "skin_temp_min": 16.4, "soilm_0_10cm": 27.613, "soilm_100_200cm": 290, "soilm_10_40cm": 83.914, "soilm_40_100cm": 167.283, "soilt_0_10cm": 23.7, "soilt_100_200cm": 15.6, "soilt_10_40cm": 22, "soilt_40_100cm": 18.2, "specific_humidity": 0.0064224998932332, "temp_2m_avg": 21.7, "v_soilm_0_10cm": 0.276, "v_soilm_100_200cm": 0.29, "v_soilm_10_40cm": 0.28, "v_soilm_40_100cm": 0.279, "valid_date": "2020-05-10", "wind_10m_spd_avg": 2.767}, {"bulk_soil_density": 1520, "dlwrf_avg": 303.284, "dlwrf_max": 329.611, "dlwrf_net": -110.337, "dswrf_avg": 339.5, "dswrf_max": 970, "dswrf_net": 291.25, "evapotranspiration": 6.818, "precip": 0, "pres_avg": 998.72, "skin_temp_avg": 20.6, "skin_temp_max": 28.8, "skin_temp_min": 14.5, "soilm_0_10cm": 27.688, "soilm_100_200cm": 290, "soilm_10_40cm": 83.914, "soilm_40_100cm": 167.283, "soilt_0_10cm": 20.7, "soilt_100_200cm": 15.7, "soilt_10_40cm": 20.9, "soilt_40_100cm": 18.5, "specific_humidity": 0.0056532368762419, "temp_2m_avg": 18.7, "v_soilm_0_10cm": 0.277, "v_soilm_100_200cm": 0.29, "v_soilm_10_40cm": 0.28, "v_soilm_40_100cm": 0.279, "valid_date": "2020-05-11", "wind_10m_spd_avg": 4.217}, {"bulk_soil_density": 1520, "dlwrf_avg": 334.375, "dlwrf_max": 379, "dlwrf_net": -68.037, "dswrf_avg": 166.5, "dswrf_max": 352, "dswrf_net": 139.25, "evapotranspiration": 3.276, "precip": 0, "pres_avg": 999.626, "skin_temp_avg": 18, "skin_temp_max": 22.5, "skin_temp_min": 14.7, "soilm_0_10cm": 29.55, "soilm_100_200cm": 290, "soilm_10_40cm": 84.402, "soilm_40_100cm": 167.283, "soilt_0_10cm": 18.8, "soilt_100_200cm": 15.8, "soilt_10_40cm": 19.9, "soilt_40_100cm": 18.5, "specific_humidity": 0.0069662498426624, "temp_2m_avg": 16.6, "v_soilm_0_10cm": 0.296, "v_soilm_100_200cm": 0.29, "v_soilm_10_40cm": 0.281, "v_soilm_40_100cm": 0.279, "valid_date": "2020-05-12", "wind_10m_spd_avg": 4.048}], "lat": 37.92, "lon": -122.26};
*/
        this.setState({
          isLoading: false,
          dataSource: responseJson['data'],
        }, function(){

        });

    })
      .catch((error) =>{
        //console.error(error);
      Alert.alert(
      "Unknown Error",
      "Please check your internet connection and try again",
      [
        {
          text: "Cancel",
          onPress: () =>  this.props.navigation.navigate('Weather'),
          style: "cancel"
        },
        { text: "OK", onPress: () =>  this.props.navigation.navigate('Weather')}
      ],
      { cancelable: false }
    );
       Vibration.vibrate();
      });

  }



  render(){
    <StatusBar backgroundColor="#db5800" barStyle="light-content" />
      const { navigate } = this.props.navigation;
      const theme = this.context;
      const { visible } = this.state;

     if(this.state.isLoading){
      return(
        <View style={{flex: 1, justifyContent: 'center',
              alignItems: 'center'}}>
          <ActivityIndicator  color = '#ff6600' ></ActivityIndicator>
        </View>
      )
    }

return (
  <Provider>
    <Portal>
      <View style={{ flex: 1 }}>
        <View style={styles.container}>
          <LineChart
            style={styles.chart}
            data={{
              dataSets: [
                {
                  values: [
                    {
                      y: this.state.dataSource[0].soilt_0_10cm,
                      x: 0,
                      marker: 'Average Soil temperature at 0 to 10 cm depth '+this.state.dataSource[0].soilt_0_10cm +" c"
                    },
                    {
                      y: this.state.dataSource[1].soilt_0_10cm,
                      x: 1,
                      marker: 'Average Soil temperature at 0 to 10 cm depth '+this.state.dataSource[1].soilt_0_10cm+" c"
                    },
                    {
                      y: this.state.dataSource[2].soilt_0_10cm,
                      x: 2,
                      marker: 'Average Soil temperature at 0 to 10 cm depth '+this.state.dataSource[2].soilt_0_10cm+" c"
                    },
                    {
                      y: this.state.dataSource[3].soilt_0_10cm,
                      x: 3,
                      marker: 'Average Soil temperature at 0 to 10 cm depth '+this.state.dataSource[3].soilt_0_10cm+" c"
                    },
                    {
                      y: this.state.dataSource[4].soilt_0_10cm,
                      x: 4,
                      marker: 'Average Soil temperature at 0 to 10 cm depth '+this.state.dataSource[4].soilt_0_10cm+" c"
                    }
                  ],
                  label: "Average Soil temperature 10 cm",
                  config: {
                    mode: "CUBIC_BEZIER",
                    drawValues: false,
                    lineWidth: 2,
                    drawCircles: true,
                    circleColor: processColor('#ef5350'),
                    drawCircleHole: false,
                    circleRadius: 4,
                    highlightColor: processColor("transparent"),
                    color: processColor('#ef5350'),
                    drawFilled: false,
                    fillAlpha: 1000,
                    valueTextSize: 15
                  }
                },

                {
                  values: [
                    {
                      y: this.state.dataSource[0].bulk_soil_density / 100,
                      x: 0,
                      marker: 'Bulk soil density '+this.state.dataSource[0].bulk_soil_density+" kg/m^3"
                    },
                    {
                      y: this.state.dataSource[1].bulk_soil_density / 100,
                      x: 1,
                      marker: 'Bulk soil density '+this.state.dataSource[1].bulk_soil_density+" kg/m^3"
                    },
                    {
                      y: this.state.dataSource[2].bulk_soil_density / 100,
                      x: 2,
                      marker: 'Bulk soil density '+this.state.dataSource[2].bulk_soil_density+" kg/m^3"
                    },
                    {
                      y: this.state.dataSource[3].bulk_soil_density / 100,
                      x: 3,
                      marker: 'Bulk soil density '+this.state.dataSource[3].bulk_soil_density+" kg/m^3"
                    },
                    {
                      y: this.state.dataSource[4].bulk_soil_density / 100,
                      x: 4,
                      marker: 'Bulk soil density '+this.state.dataSource[4].bulk_soil_density+" kg/m^3"
                    }
                  ],
                  label: "Bulk soil density",
                  config: {
                    mode: "CUBIC_BEZIER",
                    drawValues: false,
                    lineWidth: 2,
                    drawCircles: true,
                    circleColor: processColor(petrel),
                    drawCircleHole: false,
                    circleRadius: 4,
                    highlightColor: processColor("transparent"),
                    color: processColor(petrel),
                    drawFilled: false,
                    fillAlpha: 1000,
                    valueTextSize: 15
                  }
                },
                {
                  values: [
                    {
                      y: this.state.dataSource[0].soilm_0_10cm,
                      x: 0,
                      marker: 'Average Soil moisture content 0 to 10 cm depth '+this.state.dataSource[0].soilm_0_10cm +" mm"
                    },
                    {
                      y: this.state.dataSource[1].soilm_0_10cm,
                      x: 1,
                      marker: 'Average Soil moisture content 0 to 10 cm depth '+this.state.dataSource[1].soilm_0_10cm +" mm"
                    },
                    {
                      y: this.state.dataSource[2].soilm_0_10cm,
                      x: 2,
                      marker: 'Average Soil moisture content 0 to 10 cm depth '+this.state.dataSource[2].soilm_0_10cm+" mm"
                    },
                    {
                      y: this.state.dataSource[3].soilm_0_10cm,
                      x: 3,
                      marker: 'Average Soil moisture content 0 to 10 cm depth '+this.state.dataSource[3].soilm_0_10cm+" mm"
                    },
                    {
                      y: this.state.dataSource[4].soilm_0_10cm,
                      x: 4,
                      marker: 'Average Soil moisture content 0 to 10 cm depth '+this.state.dataSource[4].soilm_0_10cm+" mm"
                    }
                  ],
                  label: "Average Soil moisture content 10 cm",
                  config: {
                   mode: "CUBIC_BEZIER",
                    drawValues: false,
                    lineWidth: 2,
                    drawCircles: true,
                    circleColor: processColor('brown'),
                    drawCircleHole: false,
                    circleRadius: 4,
                    highlightColor: processColor("transparent"),
                    color: processColor('brown'),
                    drawFilled: false,
                    fillAlpha: 1000,
                    valueTextSize: 15
                  }
                },

                
                {
                  values: [
                    {
                      y: this.state.dataSource[0].precip,
                      x: 0,
                      marker: 'Accumulated precipitation '+this.state.dataSource[0].precip+" mm"
                    },
                    {
                      y: this.state.dataSource[1].precip,
                      x: 1,
                      marker: 'Accumulated precipitation '+this.state.dataSource[1].precip+" mm"
                    },
                    {
                      y: this.state.dataSource[2].precip,
                      x: 2,
                      marker: 'Accumulated precipitation '+this.state.dataSource[2].precip+" mm"
                    },
                    {
                      y: this.state.dataSource[3].precip,
                      x: 3,
                      marker: 'Accumulated precipitation '+this.state.dataSource[3].precip+" mm"
                    },
                    {
                      y: this.state.dataSource[4].precip,
                      x: 4,
                      marker: 'Accumulated precipitation '+this.state.dataSource[4].precip+" mm"
                    }
                  ],
                  label: "Accumulated precipitation",
                  config: {
                    mode: "CUBIC_BEZIER",
                    drawValues: false,
                    lineWidth: 2,
                    drawCircles: true,
                    circleColor: processColor('skyblue'),
                    drawCircleHole: false,
                    circleRadius: 4,
                    highlightColor: processColor("transparent"),
                    color: processColor('skyblue'),
                    drawFilled: false,
                    fillAlpha: 1000,
                    valueTextSize: 15
                  }
                },

                {
                  values: [
                    {
                      y: this.state.dataSource[0].evapotranspiration,
                      x: 0,
                      marker: 'Reference evapotranspiration - ET0  '+this.state.dataSource[0].evapotranspiration+" mm"
                    },
                    {
                      y: this.state.dataSource[1].evapotranspiration,
                      x: 1,
                      marker: 'Reference evapotranspiration - ET0  '+this.state.dataSource[1].evapotranspiration+" mm"
                    },
                    {
                      y: this.state.dataSource[2].evapotranspiration,
                      x: 2,
                      marker: 'Reference evapotranspiration - ET0  '+this.state.dataSource[2].evapotranspiration+" mm"
                    },
                    {
                      y: this.state.dataSource[3].evapotranspiration,
                      x: 3,
                      marker: 'Reference evapotranspiration - ET0  '+this.state.dataSource[3].evapotranspiration+" mm"
                    },
                    {
                      y: this.state.dataSource[4].evapotranspiration,
                      x: 4,
                      marker: 'Reference evapotranspiration - ET0 '+this.state.dataSource[4].evapotranspiration+" mm"
                    }
                  ],
                  label: "Reference evapotranspiration - ET0",
                  config: {
                    mode: "CUBIC_BEZIER",
                    drawValues: false,
                    lineWidth: 2,
                    drawCircles: true,
                    circleColor: processColor('#ff6d00'),
                    drawCircleHole: false,
                    circleRadius: 2,
                    highlightColor: processColor("transparent"),
                    color: processColor('#ff6d00'),
                    drawFilled: false,
                    fillAlpha: 1000,
                    valueTextSize: 15
                  }
                },

                {
                  values: [
                    {
                      y: this.state.dataSource[0].specific_humidity * 100,
                      x: 0,
                      marker: 'Average specific humidity   '+this.state.dataSource[0].specific_humidity+" kg/kg"
                    },
                    {
                      y: this.state.dataSource[1].specific_humidity * 100,
                      x: 1,
                      marker: 'Average specific humidity   '+this.state.dataSource[1].specific_humidity+" kg/kg"
                    },
                    {
                      y: this.state.dataSource[2].specific_humidity * 100,
                      x: 2,
                      marker: 'Average specific humidity   '+this.state.dataSource[2].specific_humidity+" kg/kg"
                    },
                    {
                      y: this.state.dataSource[3].specific_humidity * 100,
                      x: 3,
                      marker: 'Average specific humidity   '+this.state.dataSource[3].specific_humidity+" kg/kg"
                    },
                    {
                      y: this.state.dataSource[4].specific_humidity * 100,
                      x: 4,
                      marker: 'Average specific humidity  '+this.state.dataSource[4].specific_humidity+" kg/kg"
                    }
                  ],
                  label: "Average specific humidity",
                  config: {
                    mode: "CUBIC_BEZIER",
                    drawValues: false,
                    lineWidth: 2,
                    drawCircles: true,
                    circleColor: processColor('#ba68c8'),
                    drawCircleHole: false,
                    circleRadius: 2,
                    highlightColor: processColor("transparent"),
                    color: processColor('#ba68c8'),
                    drawFilled: false,
                    fillAlpha: 1000,
                    valueTextSize: 15
                  }
                },
                {
                  values: [
                    {
                      y: this.state.dataSource[0].pres_avg / 100,
                      x: 0,
                      marker: 'Average Surface pressure '+this.state.dataSource[0].pres_avg+" mb"
                    },
                    {
                      y: this.state.dataSource[1].pres_avg / 100,
                      x: 1,
                      marker: 'Average Surface pressure  '+this.state.dataSource[1].pres_avg+" mb"
                    },
                    {
                      y: this.state.dataSource[2].pres_avg / 100,
                      x: 2,
                      marker: 'Average Surface pressure   '+this.state.dataSource[2].pres_avg+" mb"
                    },
                    {
                      y: this.state.dataSource[3].pres_avg / 100,
                      x: 3,
                      marker: 'Average Surface pressure   '+this.state.dataSource[3].pres_avg+" mb"
                    },
                    {
                      y: this.state.dataSource[4].pres_avg / 100,
                      x: 4,
                      marker: 'Average Surface pressure  '+this.state.dataSource[4].pres_avg+" mb"
                    }
                  ],
                  label: "Average Surface pressure",
                  config: {
                    mode: "CUBIC_BEZIER",
                    drawValues: false,
                    lineWidth: 2,
                    drawCircles: true,
                    circleColor: processColor('#b39ddb'),
                    drawCircleHole: false,
                    circleRadius: 4,
                    highlightColor: processColor("transparent"),
                    color: processColor('#b39ddb'),
                    drawFilled: false,
                    fillAlpha: 1000,
                    valueTextSize: 15
                  }
                },
                {
                  values: [
                    {
                      y: this.state.dataSource[0].wind_10m_spd_avg,
                      x: 0,
                      marker: 'Average 10 meter wind speed '+this.state.dataSource[0].wind_10m_spd_avg+" m/s"
                    },
                    {
                      y: this.state.dataSource[1].wind_10m_spd_avg,
                      x: 1,
                      marker: 'Average 10 meter wind speed '+this.state.dataSource[1].wind_10m_spd_avg+" m/s"
                    },
                    {
                      y: this.state.dataSource[2].wind_10m_spd_avg,
                      x: 2,
                      marker: 'Average 10 meter wind speed '+this.state.dataSource[2].wind_10m_spd_avg+" m/s"
                    },
                    {
                      y: this.state.dataSource[3].wind_10m_spd_avg,
                      x: 3,
                      marker: 'Average 10 meter wind speed '+this.state.dataSource[3].wind_10m_spd_avg+" m/s"
                    },
                    {
                      y: this.state.dataSource[4].wind_10m_spd_avg,
                      x: 4,
                      marker: 'Average 10 meter wind speed '+this.state.dataSource[4].wind_10m_spd_avg+" m/s"
                    }
                  ],
                  label: "Average 10 meter wind speed",
                  config: {
                    mode: "CUBIC_BEZIER",
                    drawValues: false,
                    lineWidth: 2,
                    drawCircles: true,
                    circleColor: processColor('#4caf50'),
                    drawCircleHole: false,
                    circleRadius: 4,
                    highlightColor: processColor("transparent"),
                    color: processColor('#4caf50'),
                    drawFilled: false,
                    fillAlpha: 1000,
                    valueTextSize: 15
                  }
                },
                {
                  values: [
                    {
                      y: this.state.dataSource[0].skin_temp_min,
                      x: 0,
                      marker: 'Min skin temperature '+this.state.dataSource[0].skin_temp_min+" c"
                    },
                    {
                      y: this.state.dataSource[1].skin_temp_min,
                      x: 1,
                      marker: 'Min skin temperature '+this.state.dataSource[1].skin_temp_min+" c"
                    },
                    {
                      y: this.state.dataSource[2].skin_temp_min,
                      x: 2,
                      marker: 'Min skin temperature '+this.state.dataSource[2].skin_temp_min+" c"
                    },
                    {
                      y: this.state.dataSource[3].skin_temp_min,
                      x: 3,
                      marker: 'Min skin temperature '+this.state.dataSource[3].skin_temp_min+" c"
                    },
                    {
                      y: this.state.dataSource[4].skin_temp_min,
                      x: 4,
                      marker: 'Min skin temperature '+this.state.dataSource[4].wind_10m_spd_avg+" c"
                    }
                  ],
                  label: "Min skin temperature",
                  config: {
                    mode: "CUBIC_BEZIER",
                    drawValues: false,
                    lineWidth: 2,
                    drawCircles: true,
                    circleColor: processColor('#ffca28'),
                    drawCircleHole: false,
                    circleRadius: 4,
                    highlightColor: processColor("transparent"),
                    color: processColor('#ffca28'),
                    drawFilled: false,
                    fillAlpha: 1000,
                    valueTextSize: 15
                  }
                },
                {
                  values: [
                    {
                      y: this.state.dataSource[0].skin_temp_max,
                      x: 0,
                      marker: 'Max skin temperature '+this.state.dataSource[0].skin_temp_max+" c"
                    },
                    {
                      y: this.state.dataSource[1].skin_temp_max,
                      x: 1,
                      marker: 'Max skin temperature '+this.state.dataSource[1].skin_temp_max+" c"
                    },
                    {
                      y: this.state.dataSource[2].skin_temp_max,
                      x: 2,
                      marker: 'Max skin temperature '+this.state.dataSource[2].skin_temp_max+" c"
                    },
                    {
                      y: this.state.dataSource[3].skin_temp_max,
                      x: 3,
                      marker: 'Max skin temperature '+this.state.dataSource[3].skin_temp_max+" c"
                    },
                    {
                      y: this.state.dataSource[4].skin_temp_max,
                      x: 4,
                      marker: 'Max skin temperature '+this.state.dataSource[4].wind_10m_spd_avg+" c"
                    }
                  ],
                  label: "Max skin temperature",
                  config: {
                    mode: "CUBIC_BEZIER",
                    drawValues: false,
                    lineWidth: 2,
                    drawCircles: true,
                    circleColor: processColor('#e65100'),
                    drawCircleHole: false,
                    circleRadius: 4,
                    highlightColor: processColor("transparent"),
                    color: processColor('#e65100'),
                    drawFilled: false,
                    fillAlpha: 1000,
                    valueTextSize: 15
                  }
                },
                {
                  values: [
                    {
                      y: this.state.dataSource[0].skin_temp_avg,
                      x: 0,
                      marker: 'Average skin temperature '+this.state.dataSource[0].skin_temp_avg+" c"
                    },
                    {
                      y: this.state.dataSource[1].skin_temp_avg,
                      x: 1,
                      marker: 'Average skin temperature '+this.state.dataSource[1].skin_temp_avg+" c"
                    },
                    {
                      y: this.state.dataSource[2].skin_temp_avg,
                      x: 2,
                      marker: 'Average skin temperature '+this.state.dataSource[2].skin_temp_avg+" c"
                    },
                    {
                      y: this.state.dataSource[3].skin_temp_avg,
                      x: 3,
                      marker: 'Average skin temperature '+this.state.dataSource[3].skin_temp_avg+" c"
                    },
                    {
                      y: this.state.dataSource[4].skin_temp_avg,
                      x: 4,
                      marker: 'Average skin temperature '+this.state.dataSource[4].wind_10m_spd_avg+" c"
                    }
                  ],
                  label: "Average skin temperature",
                  config: {
                    mode: "CUBIC_BEZIER",
                    drawValues: false,
                    lineWidth: 2,
                    drawCircles: true,
                    circleColor: processColor('#9e9d24'),
                    drawCircleHole: false,
                    circleRadius: 4,
                    highlightColor: processColor("transparent"),
                    color: processColor('#9e9d24'),
                    drawFilled: false,
                    fillAlpha: 1000,
                    valueTextSize: 15
                  }
                },
              ]
            }}
            chartDescription={{ text: "Soil Data" }}
            legend={{
              enabled: true
            }}
            marker={{
              enabled: true,
              markerColor: processColor("white"),
              textColor: processColor("black")
            }}
            xAxis={{
              enabled: true,
              granularity: 1,
              drawLabels: true,
              position: "BOTTOM",
              drawAxisLine: true,
              drawGridLines: false,
              fontFamily: "HelveticaNeue-Medium",
              fontWeight: "bold",
              textSize: 12,
              textColor: processColor("gray"),
              valueFormatter: [moment(this.state.dataSource[0].valid_date).format("MMM. D, YY"), moment(this.state.dataSource[1].valid_date).format("MMM. D, YY"), moment(this.state.dataSource[2].valid_date).format("MMM. D, YY"), moment(this.state.dataSource[3].valid_date).format("MMM. D, YY"), moment(this.state.dataSource[4].valid_date).format("MMM. D, YY"),]
            }}
            yAxis={{
              left: {
                enabled: true
              },
              right: {
                enabled: true
              }
            }}
            autoScaleMinMaxEnabled={true}
            animation={{
              durationX: 0,
              durationY: 1500,
              easingY: "EaseInOutQuart"
            }}
            drawGridBackground={false}
            borderColor={processColor('teal')}
            borderWidth={1}
            drawBorders={true}
            autoScaleMinMaxEnabled={false}
            touchEnabled={true}
            dragEnabled={true}
            scaleEnabled={true}
            scaleXEnabled={true}
            scaleYEnabled={true}
            pinchZoom={true}
            doubleTapToZoomEnabled={true}
            highlightPerTapEnabled={true}
            highlightPerDragEnabled={false}
            // visibleRange={this.state.visibleRange}
            dragDecelerationEnabled={true}
            dragDecelerationFrictionCoef={0.99}
            ref="chart"
            keepPositionOnRotation={false}
            //onSelect={this.handleSelect.bind(this)}
            //onChange={event => console.log(event.nativeEvent)}
          />
          <Button onPress={this._showModal}>View Raw Data </Button>
        </View>
      </View>
      <Modal visible={visible} onDismiss={this._hideModal}>
             <Button  style={{backgroundColor: '#fff', padding: 10}} onPress={this._hideModal}>Go Back </Button>
    <ScrollView style={{backgroundColor: '#fff', padding: 10}}>
    {
    this.state.dataSource.map((item, i) => (
    <View>
      <ListItem
        key={i}
        title={item.valid_date}
        titleStyle={{ fontWeight: 'bold', color: '#ff6600', textAlign: 'center', fonntSize: 25}}
        containerStyle={{backgroundColor: 'transparent'}}
        bottomDivider

      />


      <ListItem
        key={i}
        leftIcon = {{name: 'logo-buffer', type: 'ionicon', color: '#ff6600'}}
        title={"Bulk Soil Density (kg/m^3)"}
        titleStyle={{ color: theme === 'light' ? '#000' : '#fff'}}
        containerStyle={{backgroundColor: 'transparent'}}
        badge={{ value: item.bulk_soil_density, status: 'primary', textStyle: { color: '#fff', fontWeight: 'bold' }}}
        chevron
        bottomDivider

      />

       <ListItem
        key={i}
        leftIcon = {{name: 'logo-buffer', type: 'ionicon', color: '#ff6600'}}
        title={"Average Soil moisture content 0 to 10 cm depth (mm)"}
        titleStyle={{ color: theme === 'light' ? '#000' : '#fff'}}
        containerStyle={{backgroundColor: 'transparent'}}
        badge={{ value: item.soilm_0_10cm, status: 'primary', textStyle: { color: '#fff', fontWeight: 'bold' }}}
        chevron
        bottomDivider

      />

      <ListItem
        key={i}
        leftIcon = {{name: 'logo-buffer', type: 'ionicon', color: '#ff6600'}}
        title={"Average Soil moisture content 10 to 40 cm depth (mm)"}
        titleStyle={{ color: theme === 'light' ? '#000' : '#fff'}}
        containerStyle={{backgroundColor: 'transparent'}}
        badge={{ value: item.soilm_10_40cm, status: 'primary', textStyle: { color: '#fff', fontWeight: 'bold' }}}
        chevron
        bottomDivider

      />

      <ListItem
        key={i}
        leftIcon = {{name: 'logo-buffer', type: 'ionicon', color: '#ff6600'}}
        title={"Average Soil moisture content 40 to 100 cm depth (mm)"}
        titleStyle={{ color: theme === 'light' ? '#000' : '#fff'}}
        containerStyle={{backgroundColor: 'transparent'}}
        badge={{ value: item.soilm_40_100cm, status: 'primary', textStyle: { color: '#fff', fontWeight: 'bold' }}}
        chevron
        bottomDivider

      />

      <ListItem
        key={i}
        leftIcon = {{name: 'logo-buffer', type: 'ionicon', color: '#ff6600'}}
        title={"Average Soil moisture content 100 to 200 cm depth (mm)"}
        titleStyle={{ color: theme === 'light' ? '#000' : '#fff'}}
        containerStyle={{backgroundColor: 'transparent'}}
        badge={{ value: item.soilm_100_200cm, status: 'primary', textStyle: { color: '#fff', fontWeight: 'bold' }}}
        chevron
        bottomDivider

      />

      <ListItem
        key={i}
        leftIcon = {{name: 'logo-buffer', type: 'ionicon', color: '#ff6600'}}
        title={"Average Volumetric soil moisture content 0 to 10 cm depth (fraction)"}
        titleStyle={{ color: theme === 'light' ? '#000' : '#fff'}}
        containerStyle={{backgroundColor: 'transparent'}}
        badge={{ value: item.v_soilm_0_10cm, status: 'primary', textStyle: { color: '#fff', fontWeight: 'bold' }}}
        chevron
        bottomDivider

      />

      <ListItem
        key={i}
        leftIcon = {{name: 'logo-buffer', type: 'ionicon', color: '#ff6600'}}
        title={"Average Volumetric soil moisture content 10 to 40 cm depth (fraction)"}
        titleStyle={{ color: theme === 'light' ? '#000' : '#fff'}}
        containerStyle={{backgroundColor: 'transparent'}}
        badge={{ value: item.v_soilm_10_40cm, status: 'primary', textStyle: { color: '#fff', fontWeight: 'bold' }}}
        chevron
        bottomDivider

      />

      <ListItem
        key={i}
        leftIcon = {{name: 'logo-buffer', type: 'ionicon', color: '#ff6600'}}
        title={"Average Volumetric soil moisture content 40 to 100 cm depth (fraction)"}
        titleStyle={{ color: theme === 'light' ? '#000' : '#fff'}}
        containerStyle={{backgroundColor: 'transparent'}}
        badge={{ value: item.v_soilm_40_100cm, status: 'primary', textStyle: { color: '#fff', fontWeight: 'bold' }}}
        chevron
        bottomDivider

      />

      <ListItem
        key={i}
        leftIcon = {{name: 'logo-buffer', type: 'ionicon', color: '#ff6600'}}
        title={"Average Volumetric soil moisture content 100 to 200 cm depth (fraction)"}
        titleStyle={{ color: theme === 'light' ? '#000' : '#fff'}}
        containerStyle={{backgroundColor: 'transparent'}}
        badge={{ value: item.v_soilm_100_200cm, status: 'primary', textStyle: { color: '#fff', fontWeight: 'bold' }}}
        chevron
        bottomDivider

      />

      <ListItem
        key={i}
        leftIcon = {{name: 'logo-buffer', type: 'ionicon', color: '#ff6600'}}
        title={"Average Soil temperature at 0 to 10 cm depth (C)"}
        titleStyle={{ color: theme === 'light' ? '#000' : '#fff'}}
        containerStyle={{backgroundColor: 'transparent'}}
        badge={{ value: item.soilt_0_10cm, status: 'primary', textStyle: { color: '#fff', fontWeight: 'bold' }}}
        chevron
        bottomDivider

      />

      <ListItem
        key={i}
        leftIcon = {{name: 'logo-buffer', type: 'ionicon', color: '#ff6600'}}
        title={"Average Soil temperature at 10 to 40 cm depth (C)"}
        titleStyle={{ color: theme === 'light' ? '#000' : '#fff'}}
        containerStyle={{backgroundColor: 'transparent'}}
        badge={{ value: item.soilt_10_40cm, status: 'primary', textStyle: { color: '#fff', fontWeight: 'bold' }}}
        chevron
        bottomDivider

      />

      <ListItem
        key={i}
        leftIcon = {{name: 'logo-buffer', type: 'ionicon', color: '#ff6600'}}
        title={"Average Soil temperature at 40 to 100 cm depth (C)"}
        titleStyle={{ color: theme === 'light' ? '#000' : '#fff'}}
        containerStyle={{backgroundColor: 'transparent'}}
        badge={{ value: item.soilt_40_100cm, status: 'primary', textStyle: { color: '#fff', fontWeight: 'bold' }}}
        chevron
        bottomDivider

      />

      <ListItem
        key={i}
        leftIcon = {{name: 'logo-buffer', type: 'ionicon', color: '#ff6600'}}
        title={"Average Soil temperature at 100 to 200 cm depth (C)"}
        titleStyle={{ color: theme === 'light' ? '#000' : '#fff'}}
        containerStyle={{backgroundColor: 'transparent'}}
        badge={{ value: item.soilt_100_200cm, status: 'primary', textStyle: { color: '#fff', fontWeight: 'bold' }}}
        chevron
        bottomDivider

      />

      <ListItem
        key={i}
        leftIcon = {{name: 'logo-buffer', type: 'ionicon', color: '#ff6600'}}
        title={"Accumulated precipitation (mm)"}
        titleStyle={{ color: theme === 'light' ? '#000' : '#fff'}}
        containerStyle={{backgroundColor: 'transparent'}}
        badge={{ value: item.precip, status: 'primary', textStyle: { color: '#fff', fontWeight: 'bold' }}}
        chevron
        bottomDivider

      />

      <ListItem
        key={i}
        leftIcon = {{name: 'logo-buffer', type: 'ionicon', color: '#ff6600'}}
        title={"Reference evapotranspiration - ET0 (mm)"}
        titleStyle={{ color: theme === 'light' ? '#000' : '#fff'}}
        containerStyle={{backgroundColor: 'transparent'}}
        badge={{ value: item.evapotranspiration, status: 'primary', textStyle: { color: '#fff', fontWeight: 'bold' }}}
        chevron
        bottomDivider

      />


      <ListItem
        key={i}
        leftIcon = {{name: 'logo-buffer', type: 'ionicon', color: '#ff6600'}}
        title={"Average specific humidity (kg/kg)"}
        titleStyle={{ color: theme === 'light' ? '#000' : '#fff'}}
        containerStyle={{backgroundColor: 'transparent'}}
        badge={{ value: item.specific_humidity, status: 'primary', textStyle: { color: '#fff', fontWeight: 'bold' }}}
        chevron
        bottomDivider

      />

      <ListItem
        key={i}
        leftIcon = {{name: 'logo-buffer', type: 'ionicon', color: '#ff6600'}}
        title={"Average Surface pressure (mb)"}
        titleStyle={{ color: theme === 'light' ? '#000' : '#fff'}}
        containerStyle={{backgroundColor: 'transparent'}}
        badge={{ value: item.pres_avg, status: 'primary', textStyle: { color: '#fff', fontWeight: 'bold' }}}
        chevron
        bottomDivider

      />

      <ListItem
        key={i}
        leftIcon = {{name: 'logo-buffer', type: 'ionicon', color: '#ff6600'}}
        title={"Average 10 meter wind speed (m/s)"}
        titleStyle={{ color: theme === 'light' ? '#000' : '#fff'}}
        containerStyle={{backgroundColor: 'transparent'}}
        badge={{ value: item.wind_10m_spd_avg, status: 'primary', textStyle: { color: '#fff', fontWeight: 'bold' }}}
        chevron
        bottomDivider

      />

      <ListItem
        key={i}
        leftIcon = {{name: 'logo-buffer', type: 'ionicon', color: '#ff6600'}}
        title={"Min skin temperature (C)"}
        titleStyle={{ color: theme === 'light' ? '#000' : '#fff'}}
        containerStyle={{backgroundColor: 'transparent'}}
        badge={{ value: item.skin_temp_min, status: 'primary', textStyle: { color: '#fff', fontWeight: 'bold' }}}
        chevron
        bottomDivider

      />

      <ListItem
        key={i}
        leftIcon = {{name: 'logo-buffer', type: 'ionicon', color: '#ff6600'}}
        title={"Average skin temperature (C)"}
        titleStyle={{ color: theme === 'light' ? '#000' : '#fff'}}
        containerStyle={{backgroundColor: 'transparent'}}
        badge={{ value: item.skin_temp_avg, status: 'primary', textStyle: { color: '#fff', fontWeight: 'bold' }}}
        chevron
        bottomDivider

      />

      <ListItem
        key={i}
        leftIcon = {{name: 'logo-buffer', type: 'ionicon', color: '#ff6600'}}
        title={"Max skin temperature (C)"}
        titleStyle={{ color: theme === 'light' ? '#000' : '#fff'}}
        containerStyle={{backgroundColor: 'transparent'}}
        badge={{ value: item.skin_temp_max, status: 'primary', textStyle: { color: '#fff', fontWeight: 'bold' }}}
        chevron
        bottomDivider

      />

      <ListItem
        key={i}
        leftIcon = {{name: 'logo-buffer', type: 'ionicon', color: '#ff6600'}}
        title={"Average 2 meter temperature (C)"}
        titleStyle={{ color: theme === 'light' ? '#000' : '#fff'}}
        containerStyle={{backgroundColor: 'transparent'}}
        badge={{ value: item.temp_2m_avg, status: 'primary', textStyle: { color: '#fff', fontWeight: 'bold' }}}
        chevron
        bottomDivider

      />

      <ListItem
        key={i}
        leftIcon = {{name: 'logo-buffer', type: 'ionicon', color: '#ff6600'}}
        title={"Average hourly downward long-wave solar radiation (W/m^2 · H)"}
        titleStyle={{ color: theme === 'light' ? '#000' : '#fff'}}
        containerStyle={{backgroundColor: 'transparent'}}
        badge={{ value: item.dlwrf_avg, status: 'primary', textStyle: { color: '#fff', fontWeight: 'bold' }}}
        chevron
        bottomDivider

      />


       <ListItem
        key={i}
        leftIcon = {{name: 'logo-buffer', type: 'ionicon', color: '#ff6600'}}
        title={"Maximum hourly downward long-wave solar radiation (W/m^2 · H)"}
        titleStyle={{ color: theme === 'light' ? '#000' : '#fff'}}
        containerStyle={{backgroundColor: 'transparent'}}
        badge={{ value: item.dlwrf_max, status: 'primary', textStyle: { color: '#fff', fontWeight: 'bold' }}}
        chevron
        bottomDivider

      />

      <ListItem
        key={i}
        leftIcon = {{name: 'logo-buffer', type: 'ionicon', color: '#ff6600'}}
        title={"Average hourly downward short-wave solar radiation (W/m^2 · H)"}
        titleStyle={{ color: theme === 'light' ? '#000' : '#fff'}}
        containerStyle={{backgroundColor: 'transparent'}}
        badge={{ value: item.dswrf_avg, status: 'primary', textStyle: { color: '#fff', fontWeight: 'bold' }}}
        chevron
        bottomDivider

      />

      <ListItem
        key={i}
        leftIcon = {{name: 'logo-buffer', type: 'ionicon', color: '#ff6600'}}
        title={"Maximum hourly downward short-wave solar radiation (W/m^2 · H)"}
        titleStyle={{ color: theme === 'light' ? '#000' : '#fff'}}
        containerStyle={{backgroundColor: 'transparent'}}
        badge={{ value: item.dswrf_max, status: 'primary', textStyle: { color: '#fff', fontWeight: 'bold' }}}
        chevron
        bottomDivider

      />

      <ListItem
        key={i}
        leftIcon = {{name: 'logo-buffer', type: 'ionicon', color: '#ff6600'}}
        title={"Net longwave solar radiation (W/m^2 · D)"}
        titleStyle={{ color: theme === 'light' ? '#000' : '#fff'}}
        containerStyle={{backgroundColor: 'transparent'}}
        badge={{ value: item.dlwrf_net, status: 'primary', textStyle: { color: '#fff', fontWeight: 'bold' }}}
        chevron
        bottomDivider

      />

      <ListItem
        key={i}
        leftIcon = {{name: 'logo-buffer', type: 'ionicon', color: '#ff6600'}}
        title={"Net shortwave solar radiation (W/m^2 · D)"}
        titleStyle={{ color: theme === 'light' ? '#000' : '#fff'}}
        containerStyle={{backgroundColor: 'transparent'}}
        badge={{ value: item.dswrf_net, status: 'primary', textStyle: { color: '#fff', fontWeight: 'bold' }}}
        chevron
        bottomDivider

      />
      </View>
    ))
  }
  </ScrollView>
           </Modal>
    </Portal>
  </Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 9,
  },
  chart: {
    height: '90%'
  }
});
