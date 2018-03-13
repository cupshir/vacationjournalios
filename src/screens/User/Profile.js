import React, { Component } from "react";
import { connect } from 'react-redux';
import { 
  View, 
  Text,
  TouchableOpacity, 
  StyleSheet 
} from "react-native";
import * as userActions from '../../store/actions/userActions';

import LoadingMickey from '../../components/LoadingMickey';

class Profile extends Component {
  static navigatorButtons = {
    rightButtons: [
        {
          title: 'Sign Out',
          id: 'signOut'
        }
    ]
  };

  constructor(props) {
    super(props);
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  componentDidMount() {
    this.props.dispatch(userActions.loadUserFromRealm());
  }


  // handle navigation event
  onNavigatorEvent(event) {
    if (event.type == 'NavBarButtonPress') {
        if (event.id == 'signOut') {
            this.handleSignOut();
        }
    }
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
            <Text>Sign In Graphic?</Text>
          </View>
          <View style={styles.lowerContainer}>
            <TouchableOpacity style={styles.button} onPress={() => this.handleItemPress('signIn')}>
                <Text>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    }
    return (
      <View style={styles.container}>
        <View style={styles.upperContainer}>
          <Text>Pic goes here</Text>
        </View>
        <View style={styles.lowerContainer}>
          <Text>email: {this.props.user.email}</Text>
          <Text>First Name: {this.props.user.firstname}</Text>
          <Text>Last Name: {this.props.user.lastname}</Text>
          <Text>User ID: {this.props.user.userid}</Text>
        </View>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  signInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  upperContainer: {
    flex: .4,
    justifyContent: 'center'
  },
  lowerContainer: {
    flex: .6
  },
  button: {
    width: 100,
    height: 50,
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

function mapStateToProps(state) {
  return {
    user: state.user
  }
}

export default connect(mapStateToProps)(Profile);