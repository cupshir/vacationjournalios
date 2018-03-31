import React, { Component } from "react";
import { 
  View, 
  Text,
  TouchableOpacity, 
  StyleSheet 
} from "react-native";

import {
    loadUserFromCache,
    signOutUser
} from '../../realm/userService';

import LoadingMickey from '../../components/LoadingMickey';

class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            currentUser: {
                id: '',
                email: '',
                firstName: '',
                lastName: ''
            },
            authenticated: false,
            isLoading: true
        };
    }

    // on mount try to load user from cache
    componentDidMount() {
        loadUserFromCache().then((user) => {
            // Success - update user in state
            this.updateUserInState(user);
        }).catch((error) => {
            // Failed no cache user - clear user in state
            this.setState({
                ...this.state,
                authenticated: false,
                isLoading: false
            });
        });
    }

    // Update user info in state
    updateUserInState = (user) => {
        if (user) {
            this.setState({
                ...this.state,
                currentUser: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName
                },
                authenticated: true,
                isLoading: false
            });
        }
    }

    // Press Events
    handleItemPress = (item) => {
        switch(item) {
            case 'signIn': {
                this.props.navigator.showModal({
                    screen: 'vacationjournalios.SignIn',
                    title: 'Sign In',
                    passProps: {
                        updateUserInState: this.updateUserInState
                    },
                    animated: true
                });
                break;
            }
            case 'signUp': {
                this.props.navigator.showModal({
                    screen: 'vacationjournalios.SignUp',
                    title: 'Sign Up',
                    passProps: {
                        updateUserInState: this.updateUserInState
                    },
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
                currentUser: {
                    id: '',
                    email: '',
                    firstName: '',
                    lastName: ''
                },
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
        if (this.state.isLoading == true) {
            return (
                <View style={styles.container}>
                    <LoadingMickey />
                </View>
            );
        }

        // If user preset show profile
        if(this.state.isLoading == false && this.state.currentUser.id != '') {
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