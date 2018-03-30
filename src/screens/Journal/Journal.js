import React, { Component } from "react";
import { 
  View,
  Text,
  Button,
  FlatList,
  SectionList, 
  AlertIOS, 
  StyleSheet 
} from "react-native";
import {
  SearchBar
} from 'react-native-elements';
import { 
  IconsMap,
  IconsLoaded
} from '../../AppIcons';
import { connect } from 'react-redux';
import moment from 'moment';
import * as userActions from '../../store/actions/userActions';

import ListItemJournal from "../../components/ListItemJournal";
import SectionHeader from "../../components/SectionHeader";
import LoadingMickey from '../../components/LoadingMickey';

class Journal extends Component {
  static navigatorButtons = {
      leftButtons: [
        {
          title: 'Journals',
          id: 'journals'
        }
      ]
  };

  constructor(props) {
    super(props);
    this.state = { 
      filteredEntries: null,
      isLoading: false
    };
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {
      if (event.id == 'journals') {
        this.onJournalListPress();
      }
      if (event.id == 'addEntry') {
        if (this.props.user.activeJournal) {
          this.props.navigator.push({
            screen: 'vacationjournalios.CreateJournalEntry',
            title: 'Add Journal Entry',
            animated: true,
            animationType: 'fade'
          });
        } else {
          AlertIOS.alert('Please select a journal')
        }
      }
    }
  }

  componentDidUpdate() {
    // Update screen title
    if (this.props.user.activeJournal) {
      this.props.navigator.setTitle({
        title: (this.props.user.activeJournal ? this.props.user.activeJournal.name : 'Select A Journal')
      });
    }
  }

  // Hack to make nav bar look like native IOS with search under title without border
  componentDidMount() {
    this.props.navigator.setStyle({
      navBarNoBorder: true
    });

    IconsLoaded.then(() => {
      this.props.navigator.setButtons({
        rightButtons: [
          {
            id: 'addEntry',
            icon: IconsMap['add']
          }
        ]
      });
    });

    // Update screen title
    if (this.props.user.activeJournal) {
      this.props.navigator.setTitle({
        title: (this.props.user.activeJournal ? this.props.user.activeJournal.name : 'Select A Journal')
      });
    }
  }

  // navigate to journal list screen
  onJournalListPress = () => {
    this.props.navigator.push({
      screen: 'vacationjournalios.JournalList',
      title: 'Journals',
      backButtonTitle: '',
      animated: true,
      animationType: 'fade'
    })
  }

  // row on press event
  onPress = (id) => {

  }

  // row edit press event
  onEditPress = (id) => {
    AlertIOS.alert('TODO: Edit Journal Entry id: ', id);
  }

  // row delete press event
  onDeletePress = (id) => {
    // display confirm prompt, user must type CONFIRM to delete
    AlertIOS.prompt(
      'Confirm Delete',
      'Type CONFIRM (all caps) to proceed with deletion',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          onPress: (enteredText) => this.handleDeleteJournalEntry(id, enteredText)
        }
      ]
    );
  }

  // handle delete journal entry
  handleDeleteJournalEntry = (id, enteredText) => {
    // verify typed text is CONFIRM
    if(enteredText === 'CONFIRM' ) {
      // match, delete journal by id
      this.props.dispatch(userActions.deleteJournalEntry(id));
    } else {
      // dont match, display alert and do nothing
      AlertIOS.alert('Incorrect CONFIRM text entered. Journal entry not deleted!')
    }
  }

  handleSearch = (searchInput) => {
    // create filter object from all journal entries in props
    let filteredEntries = this.props.user.activeJournal.journalEntries;

    // if search input contains text, filter by that text
    if (searchInput !== '') {      
      filteredEntries = this.props.user.activeJournal.journalEntries.filtered('attraction.name CONTAINS[c] $0 || park.name CONTAINS[c] $0', searchInput);
    }

    // Save the updated filtered into state
    this.setState({
      ...this.state,
      filteredEntries: filteredEntries
    });
  }

  // render row item
  renderItem = ({ item }) => (
    <ListItemJournal
      item={item}
      onPress={this.onPress}
      onEditPress={this.onEditPress}
      onDeletePress={this.onDeletePress} />
  );

  // render Header row
  renderSectionHeader = ({ section }) => (
    <SectionHeader
      title={section.title} />
  );

  // Render Search Input (placed here to keep view below easier to read)
  renderSearchInput = () => {
    return (
      <SearchBar
        platform='ios'
        lightTheme
        containerStyle={styles.searchContainer}
        inputStyle={styles.searchInput}
        onChangeText={this.handleSearch}
        icon={{
          style: {
            marginLeft: 4
          }
        }}
        clearIcon={{
          name: 'close'
        }}
        placeholder='Search' />
    );
  }

  // return list of unique dates in journal entries
  getListOfUniqueDates = (journalEntries) => {
    let returnList = [];

    // loop through each entry and if dateJournaled does not exist in return array add it
    journalEntries.forEach(entry => {
      const date = moment(entry.dateJournaled).format("MM/DD/YYYY");
      if (!returnList.includes(date)) {
        const dateObject = [ date, entry.dateJournaled ];
        returnList.push(date);
      }
    });

    // return the list sorted descending
    return returnList.sort().reverse();
  }

  // split journal entries array into sections
  splitJournalEntriesIntoSections = (journalEntries) => {
    // Get section headers
    const sectionHeaders = this.getListOfUniqueDates(journalEntries);

    let returnArray = [];

    // for each section header create a filtered array
    for (i = 0; i < sectionHeaders.length; i++) {
      // return objects
      let array = [];
      
      // add title
      const title = sectionHeaders[i];
      array.push(title);

      // build data
      // start date for filter...midnight of date. x/x/xxxx 00:00
      const dateStart = new Date(sectionHeaders[i]);
      // create end date, which is next day with time of midnight
      const dateEnd = new Date(sectionHeaders[i]);
      dateEnd.setDate(dateEnd.getDate() + 1);

      // Filter journal entries using start time and end time of current section
      const data = journalEntries.filtered('dateJournaled >= $0 && dateJournaled < $1', dateStart, dateEnd);

      // add data
      array.push(data);

      // add array to return array
      returnArray.push(array);
    }

    return returnArray;
  }

  render() {
    // TODO: This isnt working, figure out why...
    if (this.props.user.status === 'saving') {
      return (
        <View style={styles.container}>
          <LoadingMickey />
        </View>
      );
    }

    // Check for active Journal
    if (!this.props.user.activeJournal) {
      return (
        <View style={styles.container}>
          <Button title='Select A Journal' onPress={this.onJournalListPress} />
        </View>
      );
    }

    // build search input
    const searchInput = this.renderSearchInput();

    // load journalEntries from props if filteredEntries in state is null (this is so something loads when view first renders) 
    const filteredEntries = this.state.filteredEntries !== null ? this.state.filteredEntries : this.props.user.activeJournal.journalEntries;

    // Split filtered array into sections array
    const journalEntriesBySection = this.splitJournalEntriesIntoSections(filteredEntries);

    return (
      <View>
          {searchInput}
          <View style={styles.listContainer}>
            <SectionList
              sections={journalEntriesBySection.map(function(object, i) {
                return { title: object[0], data: object[1] };
              })}
              renderItem={this.renderItem}
              renderSectionHeader={this.renderSectionHeader}
              keyExtractor={ (item, index) => index } />
        </View>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchContainer: {
    backgroundColor: 'white',
    alignSelf: 'stretch',
    borderTopColor: 'white',
    marginTop: -10
  },
  listContainer: {
    marginBottom: 75
  },
  searchInput: {
    backgroundColor: '#EEEEEE',
    color: 'black',
    borderRadius: 5,
    marginLeft: 15,
    marginRight: 15
  }
})

function mapStateToProps(state) {
  return {
    user: state.user
  }
}

export default connect(mapStateToProps)(Journal);