import React, { Component } from "react";
import { 
  View, 
  Text,
  FlatList, 
  AlertIOS, 
  StyleSheet 
} from "react-native";
import { connect } from 'react-redux';
import * as journalActions from '../../store/actions/journalActions';

import ListItem from "../../components/ListItem";
import LoadingMickey from '../../components/LoadingMickey';

class Journal extends Component {
    static navigatorButtons = {
      rightButtons: [
        {
          title: '+',
          id: 'addEntry'
        }
      ],
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
      isLoading: false
    };
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {
      if (event.id == 'journals') {
        this.props.navigator.push({
          screen: 'vacationjournalios.JournalList',
          title: 'Journals',
          animated: true,
          animationType: 'fade'
        })
      }
      if (event.id == 'addEntry') {
        if (this.props.journal.journal) {
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

  // row on press event
  onPress = (id) => {

  }

  // row edit press event
  onEditPress = (id) => {
    AlertIOS.alert('TODO: Edit Journal Entry id: ', id);
  }

  // row delete press event
  onDeletePress = (id) => {
    // display confirm prompt, user must type matching name to delete
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
  handleDeleteJournal = (id, enteredText) => {
    // verify typed text is CONFIRM
    if(enteredText === 'CONFIRM' ) {
      // match, delete journal by id
      this.props.dispatch(journalActions.deleteJournalEntry(id));
    } else {
      // dont match, display alert and do nothing
      AlertIOS.alert('Incorrect CONFIRM text entered. Journal entry not deleted!')
    }
  }

  // render row item
  renderItem = ({ item }) => (
    <ListItem
      id={item.id}
      onPress={this.onPress}
      onEditPress={this.onEditPress}
      onDeletePress={this.onDeletePress}
      title={item.name}
      viewStyle={styles.listView}
      textStyle={styles.listText}
    />
  );
  
  
  render() {
    if (this.state.isLoading) {
      return (
        <View style={styles.container}>
          <LoadingMickey />
        </View>
      );
    }

    if (!this.props.journal.journal) {
      return (
        <View style={styles.container}>
        <Text>select journal button</Text>
      </View>
      );
    }

    return (
      <View>
        <Text>This will be journal page.</Text>
        <Text>Journal Name: {this.props.journal.journal ? this.props.journal.journal.name : null}</Text>
        <Text>Selected Journal is {this.props.journal.journal ? this.props.journal.journal.id : null}</Text>
        <Text>Journal Entries...</Text>
        <View style={styles.container}>
          <FlatList
            data={this.props.journal.journal.entries}
            renderItem={this.renderItem}
            keyExtractor={item => item.id}
            />
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
  listView: {
    padding: 5,
    borderBottomColor: 'lightgrey',
    borderBottomWidth: 1,
    width: 300
  },
  listText: {
    color: 'blue',
    textAlign: 'center',
    fontSize: 20
  }
})

function mapStateToProps(state) {
  return {
    user: state.user,
    journal: state.journal,
  }
}

export default connect(mapStateToProps)(Journal);