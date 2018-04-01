import React, { Component } from "react";
import { 
  View, 
  Text,
  TouchableOpacity, 
  StyleSheet 
} from "react-native";

import {
    currentUser,
    loadUserFromCache,
    signOutUser
} from '../../realm/userService';

import LoadingMickey from '../../components/LoadingMickey';

class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            currentUser: null,
            authenticated: false,
            isLoading: true
        };
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    // on mount try to load user from cache
    componentDidMount() {
        loadUserFromCache().then((user) => {
            // Success - update user in state
            this.setState({
                ...this.state,
                isLoading: true
            })
            this.updateCurrentUserInState(user);
        }).catch((error) => {
            // Failed no cache user - clear user in state
            this.setState({
                ...this.state,
                authenticated: false,
                isLoading: false
            });
        });
    }

    // Navigator button event
    onNavigatorEvent(event) {
        if (event.id === 'willAppear') {
            if (currentUser) {
                this.updateCurrentUserInState(currentUser);
            }
        }
    }

    // Update user info in state
    updateCurrentUserInState = (user) => {
        if (user) {
            this.setState({
                ...this.state,
                currentUser: user,
                authenticated: true,
                isLoading: false
            });
        } else {
            this.setState({
                ...this.state,
                currentUser: null,
                authenticated: false,
                isLoading: false
            })
        }
    }

    // Press Events
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

    // Sign out user
    handleSignOut = () => {
        this.setState({
            ...this.state,
            isLoading: true
        });
        signOutUser().then(() => {
            // Success - clear user from state
            this.setState({
                ...this.state,
                currentUser: null,
                authenticated: false,
                isLoading: false
            });
        }).catch((error) => {
            // Failed - 
            // TODO: Better error handling for this...
            console.log('error on signout', error);
            this.setState({
                ...this.state,
                isLoading: false
            });
        });
    }

    // Render Profile Screen
    render() {
        // Loading Mickey Graphic
        if (this.state.isLoading) {
            return (
                <View style={styles.container}>
                    <LoadingMickey />
                </View>
            );
        }

        // If user preset show profile
        if(this.state.authenticated) {
            return (
                <View style={styles.container}>
                    <View style={styles.upperContainer}>
                        <Text style={styles.upperText}>Pic goes here</Text>
                    </View>
                    <View style={styles.middleContainer}>
                        <Text >email: {this.state.currentUser.email}</Text>
                        <Text>First Name: {this.state.currentUser.firstName}</Text>
                        <Text>Last Name: {this.state.currentUser.lastName}</Text>
                        <Text>User ID: {this.state.currentUser.id}</Text>
                        <Text>Journal Count: {(this.state.currentUser.journals.length > 0) ? this.state.currentUser.journals.length : 0} </Text>
                        <Text>Active Journal: {(this.state.currentUser.activeJournal) ? this.state.currentUser.activeJournal.name : null}</Text>
                        <Text>Active Journal Entries: {(this.state.currentUser.activeJournal && this.state.currentUser.activeJournal.journalEntries.length > 0) ? this.state.currentUser.activeJournal.journalEntries.length : 0}</Text>
                        <Text>Date User Created: {this.state.currentUser.dateCreated.toString()}</Text>
                        <Text>Date User Modified: {this.state.currentUser.dateModified.toString()}</Text>
                    </View>
                    <View style={styles.lowerContainer}>
                        <TouchableOpacity style={styles.button} onPress={() => this.handleItemPress('signOut')}>
                            <Text>Sign Out</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        // Default render sign in and sign up buttons
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

export default Profile;