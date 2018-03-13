import React, { Component } from "react";
import { 
  View, 
  Text,
  List,
  ListItem,
  ActivityIndicator, 
  StyleSheet 
} from "react-native";

class Journal extends Component {
    static navigatorButtons = {
      rightButtons: [
        {
          title: '+',
          id: 'add'
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
      if (event.id == 'add') {
        this.props.navigator.push({
          screen: 'vacationjournalios.CreateJournal',
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
          <Text>This will be journal</Text>
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

export default Journal;