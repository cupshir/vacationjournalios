import React, { Component } from 'react';
import {
    View,
    StyleSheet
} from 'react-native';

import StatBoxLarge from '../components/StatBoxLarge'
import StatBoxSmall from '../components/StatBoxSmall'

class Dashboard extends Component {
  // static navigatorButtons = {
  //   rightButtons: [
  //     {
  //         title: 'Add',
  //         id: 'add' // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
  //     }
  //   ],
  //   leftButtons: [
  //     {
  //         title: 'Menu',
  //         id: 'menu'
  //     }
  //   ]
  // };

  constructor(props) {
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }
  
  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {
      if (event.id == 'menu') {
        this.props.navigator.toggleDrawer({
          side: 'left',
          animated: true,
        });
      }
      if (event.id == 'add') {
        this.props.navigator.push({
          screen: 'vacationjournalios.JournalEntry',
          title: 'Add Journal Entry',
          animated: true,
          animationType: 'fade'
        });
      }
    }
    if (event.type == 'DeepLink') {
      const parts = event.link;
      switch(parts) {
        case 'journal': {
          this.props.navigator.push({
            screen: 'vacationjournalios.Journal',
            title: 'Journal', 
            animated: true, 
            animationType: 'fade' 
          });
          break;
        }
        case 'journalEntry': {
          this.props.navigator.push({
            screen: 'vacationjournalios.JournalEntry',
            title: 'Add Journal Entry',
            animated: true,
            animationType: 'fade'
          });
          break;
        }
        case 'signUp': {
          this.props.navigator.push({
            screen: 'vacationjournalios.SignUp',
            title: 'Sign Up',
            animated: true,
            animationType: 'fade'
          });
          break;
        }
        case 'signIn': {
          this.props.navigator.showModal({
            screen: 'vacationjournalios.SignIn',
            title: 'Sign In',
            animated: true
          });
          break;
        }
        case 'signOut': {
          break;
        }
      }
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.upper}>
          <StatBoxLarge style={styles.largeBox} title="Most Ridden Today" journalEntry="Journal Entry Object" />
          <StatBoxLarge style={styles.largeBox} title="Most Ridden Today" journalEntry="Journal Entry Object" />
          <StatBoxLarge style={styles.largeBox} title="Most Ridden Today" journalEntry="Journal Entry Object" />
        </View>
        <View style={styles.lower}>
          <StatBoxSmall style={styles.largeBox} title="Most Ridden Today" journalEntry="Journal Entry Object" />
          <StatBoxSmall style={styles.largeBox} title="Most Ridden Today" journalEntry="Journal Entry Object" />
          <StatBoxSmall style={styles.largeBox} title="Most Ridden Today" journalEntry="Journal Entry Object" />
          <StatBoxSmall style={styles.largeBox} title="Most Ridden Today" journalEntry="Journal Entry Object" />
          <StatBoxSmall style={styles.largeBox} title="Most Ridden Today" journalEntry="Journal Entry Object" />
          <StatBoxSmall style={styles.largeBox} title="Most Ridden Today" journalEntry="Journal Entry Object" />
        </View>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    flex: 1
  },
  upper: {
    marginTop: 5
  },
  lower: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginLeft: 5,
    marginRight: 5
  }
})

export default Dashboard;
