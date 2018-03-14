import React, { Component } from "react";
import { 
  View, 
  Text,
  FlatList, 
  StyleSheet,
  TouchableOpacity,
  AlertIOS 
} from "react-native";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as journalActions from '../../store/actions/journalActions';
import realm from '../../database/realm'
import ListItem from "../../components/ListItem";

class JournalList extends Component {
  static navigatorButtons = {
    rightButtons: [
      {
        title: '+',
        id: 'addJournal'
      }
    ]
  };

  constructor(props) {
    super(props);  
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  // Navigator button event
  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {
      if (event.id == 'addJournal') {
        this.props.navigator.push({
          screen: 'vacationjournalios.CreateJournal',
          title: 'Create Journal',
          animated: true,
          animationType: 'fade'
        });
      }
    }
  }

  // row on press event
  onPress = (id, name) => {
    this.props.dispatch(journalActions.setSelectedJournalId(id));
    this.props.navigator.push({
      screen: 'vacationjournalios.Journal',
      title: name,
      animated: true,
      animationType: 'fade'
    });
  }

  // row edit press event
  onEditPress = (id) => {
    AlertIOS.alert('TODO: Edit Journal id: ', id);
  }

  // row delete press event
  onDeletePress = (id, name) => {
    // display confirm prompt, user must type matching name to delete
    AlertIOS.prompt(
      'Confirm Delete',
      'Type exact Journal Name to proceed with deletion',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          onPress: (enteredName) => this.handleDeleteJournal(id, name, enteredName)
        }
      ]
    );
  }

  // handle delete journal
  handleDeleteJournal = (id, name, enteredName) => {
    // verify typed name matches journal name
    if(enteredName === name ) {
      // match, delete journal by id
      this.props.dispatch(journalActions.deleteJournal(id));
    } else {
      // dont match, display alert and do nothing
      AlertIOS.alert('Names dont match. Journal not deleted!')
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

  // render list
  render() {
    // if user not logged in, display signin message
    if(!this.props.user.authenticated) {
      return (
        <View style={styles.signInMessage}>
          <Text>TODO: Sign In Message with modal button</Text>
        </View>
      );
    }
    
    return (
      <View style={styles.container}>
        <FlatList
          data={this.props.journal.journals}
          renderItem={this.renderItem}
          keyExtractor={item => item.id}
          />
      </View>
    );
  }
}

var styles = StyleSheet.create({
  signInMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    flex: 1,
    alignItems: 'center',
  },
  listView: {
    padding: 5,
    borderBottomColor: 'lightgrey',
    borderBottomWidth: 1,
    width: 300
  },
  listText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 20
  }
})

function mapStateToProps(state) {
  return {
    user: state.user,
    journal: state.journal
  }
}

export default connect(mapStateToProps)(JournalList);
