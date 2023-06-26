
import React from 'react';
import { FlatList, Image, Text, ActivityIndicator, View, ScrollView, StyleSheet, Dimensions, Alert, TouchableOpacity, Pressable, SafeAreaView, RefreshControl, Vibration, Modal } from 'react-native';
import { ThemeContext } from 'react-navigation';
import { ListItem, Icon, Avatar, SearchBar } from 'react-native-elements';
const { width, height } = Dimensions.get('window');
import Service from '../utils/service';
import SelectDropdown from 'react-native-select-dropdown'

export default class PublicationCollection extends React.Component {
static contextType = ThemeContext;
  static navigationOptions = ({ navigation, navigationOptions }) => {
    return {
      title: navigation.getParam('otherParam', 'Publications'),
      headerRight: () => (
        <View  style={{flex:1, justifyContent: "center",alignItems: "center"}}>
        <TouchableOpacity  style={{ paddingRight: 80, top: 10}} onPress={navigation.getParam('showDialog')}>
          <Icon name='options' type='ionicon' size={20} color='#fff' ></Icon>
        </TouchableOpacity>

        <TouchableOpacity  style={{ paddingRight: 0, bottom: 10}} onPress={navigation.getParam('searchIcon')}>
          <Icon name='search' size={20} color='#fff' />
        </TouchableOpacity>
        </View>
      ),
    };
  };

  constructor(props){
    super(props);
    this.state ={ isLoading: true, modalVisible: false, selectedCollections:'',selectedResearchtheme:'',selectedSubject:'',selectedIitasubject:'',selectedRegion:'',selectedYear:'', years:[], selectedCountry:'',selectedAuthor:'',selectedAudience:'',loadingMore: false, page: 1, per_page:20, refreshing: false, data: [], search: '', SearchVisible: false, isLoadingSearch: false, searchActive: false, researchthemesData: [], regionsData:[], subjectsData: [], countriesData: [], targetAudienceData:[], iitasubjectData: [], authorsData: [], collectionListData:[], collections:'',researchtheme:'',subject:'',iitasubject:'',region:'',year:'', country:'',author:'',audience:'', }
    URL = new Service();
  }

  componentDidMount(){
    this.props.navigation.setParams({ searchIcon: this._setSearchVisible });
    this.props.navigation.setParams({ showDialog: this._setModalVisible });
    this.getFilterLists();
    this.fetchCollections();
    this.getYear();
  }

  _setModalVisible = (visible) => {
    if (visible){
      this.setState({ modalVisible: true, SearchVisible: false, searchActive: false, search: ''});
    }
    if(!visible){
      this.setState({ modalVisible: false });
    }
  }


 getFilterLists = () => {
  const { navigation } = this.props;
  const itemId = navigation.getParam('id', 'NO-ID');
  const { page } = this.state;
  console.log('fetch')
  fetch(`${URL.Publications()}filter_lists`)
    .then((response) => response.json())
    .then((responseJson) => {
      this.setState({isLoading: false, researchthemesData: responseJson.researchtheme, regionsData: responseJson.coverageRegion, subjectsData: responseJson.subject, countriesData: responseJson.countries, targetAudienceData: responseJson.targetAudience, iitasubjectData: responseJson.iita_subject, authorsData: responseJson.contributorAuthor, collectionListData: responseJson.collections});
    })
    .catch(error => {
      this.setState({ error, isLoading: false });
      console.log(error)
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
    this.setState({isLoading: true });
    this.getFilterLists();
  }


 fetchCollections = () => {
  const { navigation } = this.props;
  const itemId = navigation.getParam('id', 'NO-ID');
  const { page } = this.state;
  console.log(`${URL.Publications()}filter?${this.state.selectedCollections}${this.state.selectedResearchtheme}${this.state.selectedSubject}${this.state.selectedIitasubject}${this.state.selectedRegion}${this.state.selectedYear}${this.state.selectedCountry}${this.state.selectedAuthor}${this.state.selectedAudience}per_page=${this.state.per_page}&page=${this.state.page}`)

  fetch(`${URL.Publications()}filter?${this.state.selectedCollections}${this.state.selectedResearchtheme}${this.state.selectedSubject}${this.state.selectedIitasubject}${this.state.selectedRegion}${this.state.selectedYear}${this.state.selectedCountry}${this.state.selectedAuthor}${this.state.selectedAudience}per_page=${this.state.per_page}&page=${this.state.page}`)
    .then((response) => response.json())
    .then((responseJson) => {
       var resdata = responseJson.items.length;
       if (resdata > 0){
      this.setState((prevState, nextProps) => ({
        data:
          page ==1
            ? Array.from(responseJson.items)
            : [...this.state.data, ...responseJson.items],
        isLoading: false,
        loadingMore: false,
        refreshing: false,
        responseData: resdata,
      }))}
    })
    .catch(error => {
      this.setState({ error, isLoading: false });
      console.log(error)
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
    this.setState({isLoading: true });
    this.fetchCollections();
  }

  Search = () => {
    const { page } = this.state;
    if (this.state.search !== ""){
      this.setState({ isLoadingSearch: true });
        fetch(`${URL.Publications()}search_items?query=${this.state.search}&per_page=${this.state.per_page}&page=${page}`)
          .then((response) => response.json())
          .then((responseJson) => {
             var resdata = responseJson.items.length;
             if (resdata >= 1){
            this.setState((prevState, nextProps) => ({
              data:
                page === 1
                  ? Array.from(responseJson.items)
                  : [...this.state.data, ...responseJson.items],
              isLoading: false,
              loadingMore: false,
              refreshing: false,
              responseData: resdata,
            }))}
          })
          .catch(error => {
            this.setState({ error, isLoading: false });
            console.log(error)
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
}

retrySearch = () =>{
  this.setState({isLoading: true });
  this.SearchNews();
}

  handleRefresh = () => {
    this.setState(
      {
        page: 1,
        refreshing: true
      }
    );
    this.fetchCollections();
  };


  handleLoadMore = () => {
    var resdata = Object.keys(this.state.data).length;
        //console.log(resdata);
        if (this.state.responseData == 20 ){
    this.setState(
      (prevState, nextProps) => ({
        page: prevState.page + 20,
        loadingMore: true
      }),
      () => {
        this.fetchCollections();
      }
    );
    }
};


_setSearchVisible = () => {
    const { SearchVisible } = this.state;

    if (SearchVisible){
      this.setState({ SearchVisible: false });
      this.setState({searchActive: false})
    }
    if(!SearchVisible){
    this.setState({ SearchVisible: true });
  }
 }


    ShowSearch = () => {
        const theme = this.context;
      if(this.state.SearchVisible === true){
      return(
      <SearchBar
        placeholder="Search ..."
        onChangeText={(query: string) => this.onChangeText(query)}
        value={this.state.search}
        containerStyle={{backgroundColor: 'transparent'}}
        platform='ios'
        onCancel={() => this._setSearchVisible()}
        onClear={() => this.fetchCollections()}
        showLoading={this.state.isLoadingSearch}
        lightTheme={false}
        inputContainerStyle={{backgroundColor: theme === 'light' ? '#ccc' : '#222'}}
        inputStyle= {{color: theme === 'light' ? '#222' : '#ccc'}}
        placeholderTextColor= { theme === 'light' ? '#222' : '#ccc'}
      />
      )
    }else { return null}
}


  onChangeText = (query) => {
    this.setState({ page: 1 });
    this.setState({ search: query });
    clearTimeout(this.timeout); // clears the old timer
    this.timeout = setTimeout(()=>{this.Search()}, 500);
  }

  async getYear(){
  try {
    var max = new Date().getFullYear();
    var min = max - 60;
    var y = await [];
    for (var i = max; i >= min; i--) {
     y.push({label:i.toString(), value:i})
    }
    console.log(JSON.stringify(y))
    this.setState({years:y})
    }catch (error) {
      console.log(error);
    }
  }


  renderFooter = () => {
    if (!this.state.loadingMore) return null;

    return (
      <View
        style={{
          position: 'relative',
          width: width,
          height: height,
          paddingVertical: 40,
          borderTopWidth: 0,
          marginTop: 10,
          marginBottom: 20,
        }}
      >
        <ActivityIndicator animating  color = '#ff6600' ></ActivityIndicator>
      </View>
    );
  };


  resetFilter = ()=>{
    this.setState({modalVisible: false, data:[], isLoading:true, page:1, selectedCollections: '', collections: '', selectedCountry: '', country: '', selectedYear: '', year: '', selectedAuthor: '', author: '', selectedSubject: '', subject:'', selectedAudience: '', audience: '', selectedIitasubject: '', iitasubject:'', selectedResearchtheme:'', researchtheme:'', selectedRegion: '', region: ''});
    this.fetchCollections();
  }

  render(){
      const { navigate } = this.props.navigation;
      const theme = this.context;
      const ShowSearchs = this.ShowSearch;
      const { modalVisible } = this.state;
      const {selectedCollections, authorsData, collectionListData, selectedCountry, countriesData, researchthemesData, subjectsData, iitasubjectData, targetAudienceData, years, collections,researchtheme, subject, iitasubject, region, year, country, author, audience} = this.state

      
    return !this.state.isLoading ? (
      <SafeAreaView>
      <ShowSearchs />
      <FlatList
        refreshControl={
          <RefreshControl
           refreshing={this.state.refreshing}
           onRefresh={this.handleRefresh}
           title="Refreshing"
           color="#ff6600"
           tintColor="#ff6600"
           titleColor="#ff6600"
        />
        }
        data={this.state.data}
        renderItem={({ item }) => (

        <ListItem onPress={() => { navigate('PublicationFile', { id: item.uuid, otherParam: item.name })}} Component={TouchableOpacity} bottomDivider containerStyle={{backgroundColor: 'transparent'}} leftContent={<Icon name='sort' size={20} color='#fff' ></Icon>}>
        <Image source={{uri: item.thumbnail ? item.thumbnail+'?isAllowed=y' : "https://biblio1.iita.org/bitstream/handle/20.500.12478/7351/S18ArtKaboleEvaluationNothomDev.pdf.jpg?sequence=4&isAllowed=y"}} style={{width: 70, height: 90}}/>
          <ListItem.Content>
            <ListItem.Title style={{ color:'#222'}}>{item.name} </ListItem.Title>
            <ListItem.Subtitle>{item.citation}</ListItem.Subtitle>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
              )}
        keyExtractor={item => item.uuid.toString()}
        ListFooterComponent={this.renderFooter}
        onEndReached={this.handleLoadMore}
        onEndReachedThreshold={0.9}
        initialNumToRender={20}
      />


      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        statusBarTranslucent={false}
        onRequestClose={() => {
          this.setState({modalVisible: false})
        }}
      >
        <View style={styles.centeredView}>
        <View style={styles.modalHeader}>
          <Pressable onPress={() => this.setState({modalVisible: false})} style={{flexDirection: 'row'}}>
            <Icon name='arrow-back' type='ionicon' color='#222' size={24} />
          </Pressable>

          <Text style={{color: '#222', fontSize:18, textAlign: 'center', alignSelf:'center'}}>   Filter</Text>
        </View>

        <ScrollView style={{flex:1, padding: 20}}>

          <SelectDropdown
            data={collectionListData}
            defaultButtonText= {collections ? collections : 'Collection'}
            buttonStyle={{width: '100%', marginBottom: 20}}
            buttonTextStyle={{textAlign: 'left'}}
            dropdownStyle={{padding: 20}}
            rowTextStyle={{textAlign: 'left'}}
            onSelect={(selectedItem, index) => {
              this.setState({selectedCollections: `collection=${selectedItem.uuid}&`, page:1, collections:selectedItem.name, data:[],});
              setTimeout(()=> { this.fetchCollections() }, 200);

            }}
            buttonTextAfterSelection={(selectedItem, index) => {
              return selectedItem.name
            }}
            rowTextForSelection={(item, index) => {
              return item.name
            }}
            renderDropdownIcon={(isOpened) => {
              return (
                <Icon type='font-awesome'
                  name={isOpened ? "chevron-up" : "chevron-down"}
                  color={"#444"}
                  size={18}
                />
              );
            }}
            dropdownIconPosition={"right"}
          />


          <SelectDropdown
            data={authorsData}
            defaultButtonText={author ? author: 'Author'}
            buttonStyle={{width: '100%', marginBottom: 20}}
            buttonTextStyle={{textAlign: 'left'}}
            dropdownStyle={{padding: 20}}
            rowTextStyle={{textAlign: 'left'}}
            onSelect={(selectedItem, index) => {
              this.setState({selectedAuthor: `author=${selectedItem.name}&`, page:1, author:selectedItem.name, data:[]});
              setTimeout(()=> { this.fetchCollections() }, 200);

            }}
            buttonTextAfterSelection={(selectedItem, index) => {
              return selectedItem.name
            }}
            rowTextForSelection={(item, index) => {
              return item.name
            }}
            renderDropdownIcon={(isOpened) => {
              return (
                <Icon type='font-awesome'
                  name={isOpened ? "chevron-up" : "chevron-down"}
                  color={"#444"}
                  size={18}
                />
              );
            }}
            dropdownIconPosition={"right"}
          />


          <SelectDropdown
            data={countriesData}
            defaultButtonText= {country? country :'Country'}
            buttonStyle={{width: '100%', marginBottom: 20}}
            buttonTextStyle={{textAlign: 'left'}}
            dropdownStyle={{padding: 20}}
            rowTextStyle={{textAlign: 'left'}}
            onSelect={(selectedItem, index) => {
              this.setState({selectedCountry: `country=${selectedItem.name}&`, page:1, country:selectedItem.name, data:[]});
              setTimeout(()=> { this.fetchCollections() }, 200);

            }}
            buttonTextAfterSelection={(selectedItem, index) => {
              return selectedItem.name
            }}
            rowTextForSelection={(item, index) => {
              return item.name
            }}
            renderDropdownIcon={(isOpened) => {
              return (
                <Icon type='font-awesome'
                  name={isOpened ? "chevron-up" : "chevron-down"}
                  color={"#444"}
                  size={18}
                />
              );
            }}
            dropdownIconPosition={"right"}
          />

          <SelectDropdown
            data={researchthemesData}
            defaultButtonText={researchtheme ? researchtheme:'Research theme'}
            buttonStyle={{width: '100%', marginBottom: 20}}
            buttonTextStyle={{textAlign: 'left'}}
            dropdownStyle={{padding: 20}}
            rowTextStyle={{textAlign: 'left'}}
            onSelect={(selectedItem, index) => {
              this.setState({selectedResearchtheme: `researchtheme=${selectedItem.name}&`, page:1, researchtheme:selectedItem.name, data:[]});
              setTimeout(()=> { this.fetchCollections() }, 200);

            }}
            buttonTextAfterSelection={(selectedItem, index) => {
              return selectedItem.name
            }}
            rowTextForSelection={(item, index) => {
              return item.name
            }}
            renderDropdownIcon={(isOpened) => {
              return (
                <Icon type='font-awesome'
                  name={isOpened ? "chevron-up" : "chevron-down"}
                  color={"#444"}
                  size={18}
                />
              );
            }}
            dropdownIconPosition={"right"}
          />


          <SelectDropdown
            data={subjectsData}
            defaultButtonText= {subject ? subject: 'Subject'}
            buttonStyle={{width: '100%', marginBottom: 20}}
            buttonTextStyle={{textAlign: 'left'}}
            dropdownStyle={{padding: 20}}
            rowTextStyle={{textAlign: 'left'}}
            onSelect={(selectedItem, index) => {
              this.setState({selectedSubject: `subject=${selectedItem.name}&`, page:1, subject: selectedItem.name, data:[]});
              setTimeout(()=> { this.fetchCollections() }, 200);

            }}
            buttonTextAfterSelection={(selectedItem, index) => {
              return selectedItem.name
            }}
            rowTextForSelection={(item, index) => {
              return item.name
            }}
            renderDropdownIcon={(isOpened) => {
              return (
                <Icon type='font-awesome'
                  name={isOpened ? "chevron-up" : "chevron-down"}
                  color={"#444"}
                  size={18}
                />
              );
            }}
            dropdownIconPosition={"right"}
          />

          <SelectDropdown
            data={ iitasubjectData }
            defaultButtonText= {iitasubject? iitasubject: 'IITA Subject'}
            buttonStyle={{width: '100%', marginBottom: 20}}
            buttonTextStyle={{textAlign: 'left'}}
            dropdownStyle={{padding: 20}}
            rowTextStyle={{textAlign: 'left'}}
            onSelect={(selectedItem, index) => {
              this.setState({selectedIitasubject: `iitasubject=${selectedItem.name}&`, page:1, iitasubject: selectedItem.name, data:[]});
              setTimeout(()=> { this.fetchCollections() }, 200);

            }}
            buttonTextAfterSelection={(selectedItem, index) => {
              return selectedItem.name
            }}
            rowTextForSelection={(item, index) => {
              return item.name
            }}
            renderDropdownIcon={(isOpened) => {
              return (
                <Icon type='font-awesome'
                  name={isOpened ? "chevron-up" : "chevron-down"}
                  color={"#444"}
                  size={18}
                />
              );
            }}
            dropdownIconPosition={"right"}
          />

          <SelectDropdown
            data={ targetAudienceData }
            defaultButtonText={audience?audience : 'Target Audience'}
            buttonStyle={{width: '100%', marginBottom: 20}}
            buttonTextStyle={{textAlign: 'left'}}
            dropdownStyle={{padding: 20}}
            rowTextStyle={{textAlign: 'left'}}
            onSelect={(selectedItem, index) => {
              this.setState({selectedAudience: `audience=${selectedItem.name}&`, page:1, audience: selectedItem.name, data:[]});
              setTimeout(()=> { this.fetchCollections() }, 200);

            }}
            buttonTextAfterSelection={(selectedItem, index) => {
              return selectedItem.name
            }}
            rowTextForSelection={(item, index) => {
              return item.name
            }}
            renderDropdownIcon={(isOpened) => {
              return (
                <Icon type='font-awesome'
                  name={isOpened ? "chevron-up" : "chevron-down"}
                  color={"#444"}
                  size={18}
                />
              );
            }}
            dropdownIconPosition={"right"}
          />

          <SelectDropdown
            data={ years }
            defaultButtonText={year? year: 'Year'}
            buttonStyle={{width: '100%', marginBottom: 20}}
            buttonTextStyle={{textAlign: 'left'}}
            dropdownStyle={{padding: 20}}
            rowTextStyle={{textAlign: 'left'}}
            onSelect={(selectedItem, index) => {
              this.setState({selectedYear: `year=${selectedItem.value}&`, page:1, year:selectedItem.value, data:[]});
              setTimeout(()=> { this.fetchCollections() }, 200);

            }}
            buttonTextAfterSelection={(selectedItem, index) => {
              return selectedItem.label
            }}
            rowTextForSelection={(item, index) => {
              return item.label
            }}
            renderDropdownIcon={(isOpened) => {
              return (
                <Icon type='font-awesome'
                  name={isOpened ? "chevron-up" : "chevron-down"}
                  color={"#444"}
                  size={18}
                />
              );
            }}
            dropdownIconPosition={"right"}
          />

        </ScrollView>
          <View style={{flexDirection: 'row', position: 'absolute', bottom:0, padding: 5, width: width, alignItems: 'center', justifyContent:'center'}}>
            <Pressable style={styles.submitButton} onPress={() => this.resetFilter()}>
              <Text style={styles.modalText}>Reset</Text>
            </Pressable>

            <Pressable style={styles.submitButton} onPress={() => this.setState({modalVisible: false})}>
              <Text style={styles.modalText}>Submit</Text>
            </Pressable>
          </View>
        </View>
      </Modal>


      </SafeAreaView>
    ) : (
      <View style={{flex: 1, justifyContent: 'center',
              alignItems: 'center', color: '#ff6600'}}>
          <ActivityIndicator size='large' color = '#ff6600' />
        </View>
    );
  }
}



const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    backgroundColor: '#fff',
    width: width,
    height: height
  },
  submitButton: {
    backgroundColor: "black",
    width: '40%',
    margin:20,
    padding: 10,
    borderRadius: 10,
    alignSelf: 'center',
    textAlign:'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },

  modalHeader: {
    backgroundColor: "white",
    padding: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
    height: 60,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },

  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    textAlign: "center",
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20
  }
});
