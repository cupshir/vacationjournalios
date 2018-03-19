import React, { Component } from "react";
import { connect } from 'react-redux';
import { 
  View, 
  Text,
  TouchableOpacity, 
  StyleSheet 
} from "react-native";
import * as userActions from '../../store/actions/userActions';

// temp for dev
import * as parkActions from '../../store/actions/parkActions';
import * as attractionActions from '../../store/actions/attractionActions';

import LoadingMickey from '../../components/LoadingMickey';

class Profile extends Component {
  componentDidMount() {
    // Check if user in local storage and load user
    // TODO: Change function to better reflect this
    this.props.dispatch(userActions.loadUserFromRealm());

    // TODO: Update to load from realm, but leave for populating realm (until better way is finished)
    this.props.dispatch(parkActions.requestParks());
    this.props.dispatch(attractionActions.requestAttractions());
  }


  handleItemPress = (item) => {
    switch(item) {
        case 'signIn': {
          this.props.navigator.showModal({
            screen: 'vacationjournalios.SignIn',
            title: 'Sign In',
            animated: true
          });
          break;
        }
        case 'signUp': {
          this.props.navigator.showModal({
            screen: 'vacationjournalios.SignUp',
            title: 'Sign Up',
            animated: true
          });
          break;
        }
        case 'signOut': {
          this.handleSignOut();
          break;
        }
    }
  }

  handleSignOut = () => {
    this.props.dispatch(userActions.signOutUser());
  }

  render() {
    if(this.props.user.authenticated == false) {
      return (
        <View style={styles.signInContainer}>
          <View style={styles.upperContainer}>
            <Text style={styles.upperText}>Profile Graphc</Text>
          </View>
          <View style={styles.middleContainer}>
            <TouchableOpacity style={styles.button} onPress={() => this.handleItemPress('signIn')}>
                <Text>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => this.handleItemPress('signUp')}>
                <Text>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    }
    return (
      <View style={styles.container}>
        <View style={styles.upperContainer}>
          <Text style={styles.upperText}>Pic goes here</Text>
        </View>
        <View style={styles.middleContainer}>
          <Text >email: {this.props.user.email}</Text>
          <Text>First Name: {this.props.user.firstName}</Text>
          <Text>Last Name: {this.props.user.lastName}</Text>
          <Text>User ID: {this.props.user.userId}</Text>
        </View>
        <View style={styles.lowerContainer}>
          <TouchableOpacity style={styles.button} onPress={() => this.handleItemPress('signOut')}>
            <Text>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  signInContainer: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  upperContainer: {
    flex: .5,
    justifyContent: 'center',
    borderStyle: 'solid',
    borderWidth: 1,
    width: 300,
  },
  upperText: {
    textAlign: 'center'
  },
  middleContainer: {
    flex: .3
  },
  lowerContainer: {
    flex: .1,
    justifyContent: 'flex-end'
  },
  button: {
    width: 100,
    height: 50,
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10
  }
});

function mapStateToProps(state) {
  return {
    user: state.user
  }
}

export default connect(mapStateToProps)(Profile);