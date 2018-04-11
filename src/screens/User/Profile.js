import React, { Component } from "react";
import { 
    AlertIOS,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity, 
    View,  
} from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';

import * as UserService from '../../realm/userService';

import LoadingMickey from '../../components/LoadingMickey';
import CameraModal from "../../components/CameraModal";


class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            currentUser: null,
            authenticated: false,
            cameraModalVisible: false,
            isLoading: true
        };
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    // on mount try to load user from cache
    componentDidMount() {
        UserService.loadUserFromCache().then((user) => {
            // Success - update user in state
            this.setState({
                ...this.state,
                isLoading: true
            })
            this.updateCurrentUserInState(user);

            // Date comparison not working, circle back to fix...
            const currentTime = new Date();
            currentTime.setDate(currentTime.getDate()-14);
            if (user.attractionsLastSynced.getDate() === currentTime.getDate()) {
                
                // add network check before querying
                
                console.log('starting attraction seed');
                let seedAttractions = UserService.parkRealm.objects('Attraction');

                UserService.updateUserAttractions(seedAttractions).then(() => {
                    console.log('seed attractions success');
                }).catch((error) => {
                    console.log('seed attractions failed');
                });

            }
            // debugging
            console.log('CT: ', currentTime.getDate())
            console.log('lastSyncParks: ', user.parksLastSynced.getDate());
            console.log('lastSyncAttractions: ', user.attractionsLastSynced.getDate())
            if (user.parksLastSynced.getDate() === currentTime.getDate()) {

                // add network check before querying

                console.log('starting park seed');
                let seedParks = UserService.parkRealm.objects('Park');
                UserService.updateUserParks(seedParks).then(() => {
                    console.log('seed  parks success');
                }).catch((error) => {
                    console.log('seed parks failed');
                });
            }
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
            if (UserService.currentUser) {
                this.updateCurrentUserInState(UserService.currentUser);
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
                cameraModalVisible: false,
                isLoading: false
            });
        } else {
            this.setState({
                ...this.state,
                currentUser: null,
                authenticated: false,
                cameraModalVisible: false,
                isLoading: false
            })
        }
    }

    // toggle camera modal
    toggleCameraModal = () => {
        this.setState({
            ...this.state,
            cameraModalVisible: !this.state.cameraModalVisible
        });
    }

    // save photo to state
    savePhoto = (photo) => {
        UserService.saveUserPhoto(photo).then((updatedUser) => {
            this.updateCurrentUserInState(updatedUser);
        }).catch((error) => {
            console.log('Save Photo Failed: ', error);
        });
    }

    // photo delete press event
    onPhotoDeletePress = () => {
        // display confirm prompt, user must type CONFIRM to delete photo
        AlertIOS.prompt(
            'Confirm Delete',
            'Are you sure you want to delete the profile image?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Delete',
                    onPress: () => this.handleDeletePhoto()
                }
            ]
        );
    }

    // handle photo delete
    handleDeletePhoto = () => {
        UserService.saveUserPhoto(null).then((updatedUser) => {
            this.updateCurrentUserInState(updatedUser);
        }).catch((error) => {
            console.log('Delete Photo Failed: ', error);
        });
    }


    // Press Events
    handleItemPress = (item) => {
        switch(item) {
            case 'signIn': {
                this.props.navigator.showModal({
                    screen: 'vacationjournalios.SignIn',
                    title: 'Sign In',
                    navigatorStyle: {
                        largeTitle: true,
                        navBarBackgroundColor: '#252525',
                        navBarTextColor: '#FFFFFF',
                        navBarButtonColor: '#FFFFFF',
                        statusBarTextColorScheme: 'light',
                        screenBackgroundColor: '#151515'
                    },
                    animated: true
                });
                break;
            }
            case 'register': {
                this.props.navigator.showModal({
                    screen: 'vacationjournalios.Register',
                    title: 'Register',
                    navigatorStyle: {
                        largeTitle: true,
                        navBarBackgroundColor: '#252525',
                        navBarTextColor: '#FFFFFF',
                        navBarButtonColor: '#FFFFFF',
                        statusBarTextColorScheme: 'light',
                        screenBackgroundColor: '#151515'
                    },
                    animated: true
                });
                break;
            }
            case 'edit': {
                this.props.navigator.showModal({
                    screen: 'vacationjournalios.EditPerson',
                    title: 'Edit',
                    passProps: {
                        currentUserId: this.state.currentUser.id
                    },
                    navigatorStyle: {
                        largeTitle: true,
                        navBarBackgroundColor: '#252525',
                        navBarTextColor: '#FFFFFF',
                        navBarButtonColor: '#FFFFFF',
                        statusBarTextColorScheme: 'light',
                        screenBackgroundColor: '#151515'
                    },
                    animated: true
                });
                break;
            }
            case 'password': {
                this.props.navigator.showModal({
                    screen: 'vacationjournalios.ChangePassword',
                    title: 'Change Password',
                    passProps: {
                        currentUserId: this.state.currentUser.id
                    },
                    navigatorStyle: {
                        largeTitle: true,
                        navBarBackgroundColor: '#252525',
                        navBarTextColor: '#FFFFFF',
                        navBarButtonColor: '#FFFFFF',
                        statusBarTextColorScheme: 'light',
                        screenBackgroundColor: '#151515'
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
        UserService.signOutUser().then(() => {
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

    // render camera button for triggering camera modal
    renderCameraButton = () => {
        return (
            <TouchableOpacity
                onPress={() => { this.toggleCameraModal(); }} 
            >
                <View style={styles.photo}>
                    <Icon style={{ fontSize: 80, color: 'white' }} name="ios-camera" /> 
                </View>
            </TouchableOpacity>
        );
    }

    // render photo image
    renderPhoto = (photo) => {
        return (
            <TouchableOpacity
                onLongPress={() => { this.onPhotoDeletePress(); }} 
            >
                <View style={styles.photo}>
                    <Image 
                        style={{ width: 150, height: 150, borderRadius: 75 }}
                        resizeMode={'cover'}
                        source={{uri: `data:image/png;base64,${photo}`}} 
                    />
                </View>
            </TouchableOpacity>
        );
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
            // Check if photo exists, otherwise render camera button
            const photo = (this.state.currentUser.profilePhoto) 
            ? this.renderPhoto(this.state.currentUser.profilePhoto) 
            : this.renderCameraButton()

            // Assigning content here to make render below more readable
            const journalCount = (this.state.currentUser.journals.length > 0) ? this.state.currentUser.journals.length : 0;
            const journalLabel = (journalCount === 1) ? 'journal' : 'journals';
            const activeJournal = (this.state.currentUser.activeJournal) ? this.state.currentUser.activeJournal.name : null;
            const journalEntriesCount = (this.state.currentUser.activeJournal && this.state.currentUser.activeJournal.journalEntries.length > 0) 
                                            ? this.state.currentUser.activeJournal.journalEntries.length 
                                            : 0
            const journalEntriesLabel = (journalEntriesCount === 1) ? 'entry' : 'entries';

            return (
                <View style={styles.container}>
                    <View style={styles.profileContainer}>
                        <View style={styles.nameSection}>
                            <Text style={{ fontSize: 24, color: 'white' }}>{this.state.currentUser.firstName} {this.state.currentUser.lastName}</Text>
                            <Text style={{ fontSize: 20, color: 'white' }}>{this.state.currentUser.email}</Text>
                        </View>
                        <View style={styles.photoSection}>
                            {photo}
                        </View>
                        <View style={styles.journalSection}>
                            <Text style={styles.journalText}>You have {journalCount} {journalLabel}!</Text>
                            <Text style={styles.journalText}>Your active journal is, {activeJournal}, and it has {journalEntriesCount} {journalEntriesLabel}.</Text>
                            <View>
                                <Text style={styles.journalText}>It was created on {moment(this.state.currentUser.dateCreated).format('M-D-YYYY h:mm a')}.</Text>
                                <Text style={styles.journalText}>It was last updated on {moment(this.state.currentUser.dateModified).format('M-D-YYYY h:mm a')}.</Text>
                            </View>
                        </View>
                        <View style={styles.lowerContainer}>
                            <TouchableOpacity style={styles.button} onPress={() => this.handleItemPress('edit')}>
                                <Text>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button} onPress={() => this.handleItemPress('password')}>
                                <Text style={{ textAlign: 'center' }}>Change Password</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button} onPress={() => this.handleItemPress('signOut')}>
                                <Text>Sign Out</Text>
                            </TouchableOpacity>
                        </View>
                        <CameraModal 
                            quality={'.5'}
                            savePhoto={this.savePhoto}
                            visible={this.state.cameraModalVisible}
                            toggleCameraModal={this.toggleCameraModal}
                        />
                    </View>

                </View>
            );
        }

        // Default render sign in and sign up buttons
        return (
            <View style={styles.signInContainer}>
                <View style={styles.signInButtons}>
                    <TouchableOpacity style={styles.button} onPress={() => this.handleItemPress('signIn')}>
                        <Text>Sign In</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => this.handleItemPress('register')}>
                        <Text>Register</Text>
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
    signInButtons: {
        flex: .1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderRadius: 10
    },
    container: {
        flex: 1,
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    profileContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    nameSection: {
        alignItems: 'center',
        padding: 15,
        paddingBottom: 0
    },
    photoSection: {
        padding: 15
    },
    journalSection: {
        flex: .9,
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15
    },
    lowerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    journalText: {
        fontSize: 18,
        textAlign: 'center',
        color: 'white'
    },
    button: {
        backgroundColor: 'white',
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