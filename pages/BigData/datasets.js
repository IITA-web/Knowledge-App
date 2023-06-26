
import React, { useState } from 'react';
import { FlatList, ActivityIndicator, StatusBar, Modal, Text, View, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Alert, SafeAreaView, Vibration, Pressable } from 'react-native';
import { ListItem, Icon, SearchBar } from 'react-native-elements';
import { Searchbar } from 'react-native-paper';
import { ThemeContext } from 'react-navigation';
import Service from '../utils/service';
import SelectDropdown from 'react-native-select-dropdown'

//import SearchBar from 'react-native-search-bar';

//import axiosService from '../utils/lib/projects';
const { width, height } = Dimensions.get('window');

export default class Datasets extends React.Component {
static contextType = ThemeContext;

   static navigationOptions = ({navigation, navigationOptions}) => {
    return {
      title: 'Datasets',
      headerLeftContainerStyle: {
        paddingRight: 40
      },
      headerRight: () => (
        <View  style={{flex:1, justifyContent: "center",alignItems: "center"}}>
        <TouchableOpacity  style={{ paddingRight: 80, top: 10}} onPress={navigation.getParam('showDialog')}>
          <Icon name='options' type='ionicon' size={20} color='#ffffff' ></Icon>
        </TouchableOpacity>

        <TouchableOpacity  style={{ paddingRight: 0, bottom: 10}} onPress={navigation.getParam('searchIcon')}>
          <Icon name='search' size={20} color='#ffffff' />
        </TouchableOpacity>
        </View>
      ),
    }
  }
  constructor(props){
    super(props);

this.state ={ isLoading: true,
    loadingMore: false, 
    page: 0,
    refreshing: false,
    data: [],
    search: '',
    SearchVisible: false,
    isLoadingSearch: false,
    searchCount: '',
    modalVisible: false,
    searchActive: false, selectedcontributorProject: '', selectedsubjectVocab:'', selectedsubject:'', selectedcontributorProjectleadInstitute:'', selectedcontributorPerson:'', selectedcontributioncrp:'', selectedsource:'', selectedgroups: '', per_page:20, page:1, contributorProjectData:[], subjectVocabData: [], subjectData: [], contributorProjectleadInstituteData:[], contributorPersonData: [], contributioncrpData: [], sourceData: [], groupsData: [], contributorProject: '', subjectVocab:'', subject:'', contributorProjectleadInstitute:'', contributorPerson:'', contributioncrp:'', source:'', groups: ''
  }
    URL = new Service();
  }




  componentDidMount(){
    this.getFilterLists();
   this.fetchData();

   this.props.navigation.setParams({ searchIcon: this._setSearchVisible });
    this.props.navigation.setParams({ showDialog: this._setModalVisible });
   //this.refs.searchBar.focus();
  }

  componentWillUnmount() {
  clearTimeout(this.timeout);
}

   fetchData() {
    const { page } = this.state;
    return fetch(`${URL.Data()}filter?${this.state.selectedcontributorProject}${this.state.selectedsubjectVocab}${this.state.selectedsubject}${this.state.selectedcontributorProjectleadInstitute}${this.state.selectedcontributorPerson}${this.state.selectedcontributioncrp}${this.state.selectedsource}${this.state.selectedgroups}per_page=${this.state.per_page}&page=${this.state.page}`).then((response) => response.json()).then((responseJson) => {
        var resdata = responseJson.items.length;
        if (resdata > 0) {
          //console.log(responseJson.items)
         this.setState((prevState, nextProps) => ({
          data:
            page == 1
              ? responseJson.items
              : [...this.state.data, ...responseJson.items],
          isLoading: false,
          loadingMore: false,
          refreshing: false,
          responseData: resdata,
        }));
        }
      })
      .catch(error => {
        this.setState({ error, isLoading: false });
        console.log(error.message)
         Alert.alert(
          "Unknown Error",
          "Please check your internet connection and try again",
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
  this.fetchData();
}



 getFilterLists = () => {
  const { navigation } = this.props;
  const itemId = navigation.getParam('id', 'NO-ID');
  const { page } = this.state;
  fetch(`${URL.Data()}filter_lists`)
    .then((response) => response.json())
    .then((responseJson) => {

      this.setState({isLoading: false, contributorProjectData: responseJson.contributorProject, subjectVocabData: responseJson.subjectVocab, subjectData: responseJson.subject, contributorProjectleadInstituteData: responseJson.contributorProjectleadInstitute, contributorPersonData: responseJson.contributorPerson, contributioncrpData: responseJson.contributioncrp, sourceData: responseJson.source, groupsData: responseJson.groups});
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
    this.getFilterLists();
  }

onChangeText = (query) => {
  this.setState({ page: 1, search: query });
  clearTimeout(this.timeout); // clears the old timer
  this.timeout = setTimeout(() => this.searchData(), 500);
}

 searchData = () => {
    const { page } = this.state;
    if (this.state.search !== ""){
      this.setState({ isLoadingSearch: true });
    const url = `${URL.Data()}search_items?query=${this.state.search}&per_page=${this.state.per_page}&page=${page}`;
   console.log(url)
    return fetch(url)
      .then((response) => response.json())
      .then((responseJson) => {
        //console.log(responseJson.result.count)
        var resdata = Object.keys(responseJson.items).length;
        if (resdata > 0) {
         this.setState((prevState, nextProps) => ({
          data: page == 1
              ? responseJson.total.count
              : [...this.state.data, ...responseJson.items],
          isLoading: false,
          loadingMore: false,
          refreshing: false,
          isLoadingSearch: false,
          searchActive: true,
          responseData: resdata,
          searchCount: responseJson.total.count + " Datasets found",
          searchResultCount: responseJson.total.count
        }))
       }
      })
      .catch(error => {
        this.setState({ error, isLoading: false, isLoadingSearch: false });
         Alert.alert(
      "Unknown Error",
      "Please check your internet connection and try again",
      [
        {
          text: "Ok",
          onPress: () =>{},
          style: "cancel"
        },
        { text: "Retry", onPress: () =>  this.retrySearch()}
      ],
      { cancelable: false }
    );
          Vibration.vibrate();
      });
}
}

retrySearch = () =>{
  this.searchData();
}

 _setSearchVisible = () => {
    const { SearchVisible } = this.state;

    if (SearchVisible){
      this.setState({ SearchVisible: false, searchCount: '' });

    }
    if(!SearchVisible){
      this.setState({ SearchVisible: true });
    }
  }


  _setModalVisible = (visible) => {
    if (visible){
      this.setState({ modalVisible: true, SearchVisible: false, searchCount: ''});
    }
    if(!visible){
      this.setState({ modalVisible: false });
    }
  }


  handleRefresh = () => {
    this.setState(
      {
        page: 1,
        refreshing: true
      },
      () => {
        this.fetchData();
      }
    );
  };


  handleLoadMore = () => {
    var resdata = Object.keys(this.state.data).length;
        if (this.state.responseData == 20){
    this.setState(
      (prevState, nextProps) => ({
        page: prevState.page + 20,
        loadingMore: true
      }),
      () => {
        if (this.state.searchActive === true && this.state.responseData === 20) {this.searchData(); }

        if (!this.state.searchActive){this.fetchData()}

          if (this.state.responseData === 20) {this.setState({loadingMore: false})}
      }
    );
  }
  };


  ShowSearch = () => {
        const theme = this.context;

      return(
      <SearchBar
        placeholder="Search datasets..."
        onChangeText={(query: string) => this.onChangeText(query)}
        value={this.state.search}
        containerStyle={{backgroundColor: 'transparent'}}
        platform='ios'
        onCancel={() => this._setSearchVisible()}
        showLoading={this.state.isLoadingSearch}
        lightTheme={false}
        inputContainerStyle={{backgroundColor: theme === 'light' ? '#ccc' : '#222'}}
        inputStyle= {{color: theme === 'light' ? '#222' : '#ccc'}}
        placeholderTextColor= {theme === 'light' ? '#222' : '#ccc'}
      />
      )
}

 renderFooter = () => {
    if (!this.state.loadingMore) return null;
    return (
      <View
        style={{
          position: 'relative',
          width: width,
          height: height + 100,
          paddingVertical: 20,
          borderTopWidth: 0,
          //marginTop: 10,
          //marginBottom: 10,
        }}
      >
        <ActivityIndicator animating={true} size='large' color = '#222' ></ActivityIndicator>
      </View>
    );
  };

  resetFilter = ()=>{
    this.setState({modalVisible: false, page:1, selectedcontributorProject: '', selectedsubjectVocab:'', selectedsubject:'', selectedcontributorProjectleadInstitute:'', selectedcontributorPerson:'', selectedcontributioncrp:'', selectedsource:'', selectedgroups: '', contributorProject: '', subjectVocab:'', subject:'', contributorProjectleadInstitute:'', contributorPerson:'', contributioncrp:'', source:'', groups: ''});
    this.fetchCollections();
  }

  render(){
      const { navigate } = this.props.navigation;
      const theme = this.context;
      const ShowSearchs = this.ShowSearch;

      const {modalVisible, contributorProjectData, subjectVocabData, subjectData, contributorProjectleadInstituteData, contributorPersonData, contributioncrpData, sourceData, groupsData, contributorProject, subjectVocab, subject, contributorProjectleadInstitute, contributorPerson, contributioncrp, source, groups}= this.state;

      if(this.state.isLoading){
      return(
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', color: '#222'}}>
          <ActivityIndicator color = '#222' size='large' ></ActivityIndicator>
        </View>
      )
    }

    return (
      <SafeAreaView>
       <StatusBar translucent backgroundColor="transparent" barStyle="light-content"  />

      <ShowSearchs />
      
      <FlatList

        data={this.state.data}
        renderItem={({ item }) => (
      
    <View>
      {/*<ListItem
      Component={TouchableOpacity}
        leftIcon = {{name: 'database', type: 'font-awesome', color: '#222'}}
        title={item.title}  onPress={() => { navigate('DataFile', { id: item.id , otherParam: item, })}}
        titleStyle={{ color: theme == 'light' ? '#222' : '#ffffff'}}
        containerStyle={{backgroundColor: 'transparent'}}
        chevron
        bottomDivider
      ></ListItem>*/}

      <ListItem onPress={() => { navigate('DataFile', { id: item.id , otherParam: item, })}} Component={TouchableOpacity} key={item.id} bottomDivider containerStyle={{backgroundColor: 'transparent'}}>
        <ListItem.Content>
          <ListItem.Title style={{ color: theme == 'light' ? '#222' : '#ffffff'}} >{item.title}</ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>

    </View>
        )}
        keyExtractor={item => item.id}
        ListFooterComponent={this.renderFooter}
        onRefresh={this.handleRefresh}
        refreshing={this.state.refreshing}
        onEndReached={this.handleLoadMore}
        onEndReachedThreshold={1.5}
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
            data={groupsData}
            defaultButtonText= {groups?groups:'Group'}
            buttonStyle={{width: '100%', marginBottom: 20}}
            buttonTextStyle={{textAlign: 'left'}}
            dropdownStyle={{padding: 20}}
            rowTextStyle={{textAlign: 'left'}}
            onSelect={(selectedItem, index) => {
              this.setState({selectedgroups: `groups=${selectedItem.id}&`, page:1, groups: selectedItem.title});
              setTimeout(()=> { this.fetchData() }, 200);

            }}
            buttonTextAfterSelection={(selectedItem, index) => {
              return selectedItem.title
            }}
            rowTextForSelection={(item, index) => {
              return item.title
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
            data={contributorPersonData}
            defaultButtonText={contributorPerson?contributorPerson:'Contributor Person'}
            buttonStyle={{width: '100%', marginBottom: 20}}
            buttonTextStyle={{textAlign: 'left'}}
            dropdownStyle={{padding: 20}}
            rowTextStyle={{textAlign: 'left'}}
            onSelect={(selectedItem, index) => {
              this.setState({selectedcontributorPerson: `contributor_person=${selectedItem.name}&`, page:1, contributorPerson: selectedItem.name});
              setTimeout(()=> { this.fetchData() }, 200);

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
            data={contributioncrpData}
            defaultButtonText={contributioncrp?contributioncrp:'Contribution Crop'}
            buttonStyle={{width: '100%', marginBottom: 20}}
            buttonTextStyle={{textAlign: 'left'}}
            dropdownStyle={{padding: 20}}
            rowTextStyle={{textAlign: 'left'}}
            onSelect={(selectedItem, index) => {
              this.setState({selectedcontributioncrp: `contributioncrp=${selectedItem.name}&`, page:1, contributioncrp:selectedItem.name });
              setTimeout(()=> { this.fetchData() }, 200);

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
            data={contributorProjectData}
            defaultButtonText={contributorProject?contributorProject:'Contributor Project'}
            buttonStyle={{width: '100%', marginBottom: 20}}
            buttonTextStyle={{textAlign: 'left'}}
            dropdownStyle={{padding: 20}}
            rowTextStyle={{textAlign: 'left'}}
            onSelect={(selectedItem, index) => {
              this.setState({selectedcontributorProject: `contributor_project=${selectedItem.name}&`, page:1, contributorProject: selectedItem.name});
              setTimeout(()=> { this.fetchData() }, 200);

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
            data={contributorProjectleadInstituteData}
            defaultButtonText={contributorProjectleadInstitute?contributorProjectleadInstitute:'Contributor Project Lead InstituteData'}
            buttonStyle={{width: '100%', marginBottom: 20}}
            buttonTextStyle={{textAlign: 'left'}}
            dropdownStyle={{padding: 20}}
            rowTextStyle={{textAlign: 'left'}}
            onSelect={(selectedItem, index) => {
              this.setState({selectedcontributorProjectleadInstitute: `contributor_projectlead_institute=${selectedItem.name}&`, page:1, contributorProjectleadInstitute:selectedItem.name});
              setTimeout(()=> { this.fetchData() }, 200);

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
            data={ subjectData }
            defaultButtonText={subject?subject:'Subject'}
            buttonStyle={{width: '100%', marginBottom: 20}}
            buttonTextStyle={{textAlign: 'left'}}
            dropdownStyle={{padding: 20}}
            rowTextStyle={{textAlign: 'left'}}
            onSelect={(selectedItem, index) => {
              this.setState({selectedSubject: `subject=${selectedItem.name}&`, page:1, subject:selectedItem.name});
              setTimeout(()=> { this.fetchData() }, 200);

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
            data={ sourceData }
            defaultButtonText={source?source:'Source'}
            buttonStyle={{width: '100%', marginBottom: 20}}
            buttonTextStyle={{textAlign: 'left'}}
            dropdownStyle={{padding: 20}}
            rowTextStyle={{textAlign: 'left'}}
            onSelect={(selectedItem, index) => {
              this.setState({selectedsource: `source=${selectedItem.name}&`, page:1,source:selectedItem.name});
              setTimeout(()=> { this.fetchData() }, 200);

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
            data={ subjectVocabData }
            defaultButtonText={subjectVocab?subjectVocab:'Subject Vocabulary'}
            buttonStyle={{width: '100%', marginBottom: 20}}
            buttonTextStyle={{textAlign: 'left'}}
            dropdownStyle={{padding: 20}}
            rowTextStyle={{textAlign: 'left'}}
            onSelect={(selectedItem, index) => {
              this.setState({selectedsubjectVocab: `subject_vocab=${selectedItem.value}&`, page:1,subjectVocab:selectedItem.value});
              setTimeout(()=> { this.fetchData() }, 200);

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
