import React, { Component } from "react";
import { 
  View, 
  Text,
  List,
  ListItem,
  ActivityIndicator, 
  StyleSheet 
} from "react-native";
import { connect } from 'react-redux';
import * as journalActions from '../../store/actions/journalActions';

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
      activeJournalId: '',
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
        this.props.navigator.push({
          screen: 'vacationjournalios.JournalEntry',
          title: 'Add Journal Entry',
          animated: true,
          animationType: 'fade'
        });
      }
    }
  }
  
  
  render() {
    if (this.state.isLoading) {
      return (
        <View style={styles.container}>
          <ActivityIndicator />
        </View>
      );
    }
    return (
      <View>
          <Text>This will be journal page.</Text>
          <Text>Journal Name: {this.props.journal.journal ? this.props.journal.journal.name : null}</Text>
          <Text>Selected Journal is {this.props.journal.selectedJournalId}</Text>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center'
  }
})

function mapStateToProps(state) {
  return {
    user: state.user,
    journal: state.journal,
  }
}

export default connect(mapStateToProps)(Journal);