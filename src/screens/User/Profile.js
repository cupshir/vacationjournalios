import React, { Component } from 'react';
import { 
    AlertIOS,
    Image,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity, 
    View,  
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/Ionicons';
import { 
    IconsMap,
    IconsLoaded
} from '../../AppIcons';
import moment from 'moment';

import * as UserService from '../../realm/userService';

import LoadingMickey from '../../components/LoadingMickey';
import MickeyButton from '../../components/MickeyButton';
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
        UserService.loadUserFromCache()
            .then((user) => {
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
            if (UserService.currentUser) {
                // add sync button for parks and attractions
                this.renderSyncParksAndAttractionsButton();

                this.updateCurrentUserInState(UserService.currentUser);
            } else {
                this.props.navigator.setButtons({
                    rightButtons: [
                    ]
                });
            }
        }
        if (event.type == 'NavBarButtonPress') {
            if (event.id === 'syncParksAndAttractions') {
                this.syncParksAndAttractions();
            }
            if (event.id === 'dev1') {
                this.dev1Function();
            }
            if (event.id === 'dev2') {
                this.dev2Function();
            }
            if (event.id === 'dev3') {
                this.dev3Function();
            }
        }
    }

    // dev functions for Admins
    dev1Function = () => {
        console.log('run dev 1 function');
        UserService.tempDev1Function();
    }

    dev2Function = () => {
        console.log('run dev 2 function');
        UserService.tempDev2Function();
    }

    dev3Function = () => {
        console.log('run dev 3 function');
        UserService.tempDev3Function();
    }

    // Render Add journal Entry Button in nav bar
    renderSyncParksAndAttractionsButton = () => {
        if (UserService.isDevAdmin === true) {
            IconsLoaded.then(() => {
                this.props.navigator.setButtons({
                    rightButtons: [
                        {
                            id: 'syncParksAndAttractions',
                            icon: IconsMap['sync']
                        },
                        {
                            id: 'dev1',
                            title: '1',
                            buttonFontSize: 32
                        },
                        {
                            id: 'dev2',
                            title: '2',
                            buttonFontSize: 32
                        },
                        {
                            id: 'dev3',
                            title: '3',
                            buttonFontSize: 32
                        }
                    ]
                });
            });
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
            });
        }
    }

    syncParksAndAttractions = () => {
        console.log('starting sync....')
        // initiliaze seed realm
        UserService.initializeParkRealm().then((response) => {
            UserService.updateUserAttractions().then(() => {
                // success
                console.log('seed attractions success');
            }).catch((error) => {
                console.log(error);
                console.log('seed attractions failed');
            });
        }).catch((error) => {
            console.log(error);
            console.log('Park Realm Init Failed');
        });

        // initiliaze seed realm
        UserService.initializeParkRealm().then((response) => {
            // update User parks
            UserService.updateUserParks().then(() => {
                // success
                console.log('seed parks success');
            }).catch((error) => {
                console.log(error);
                console.log('seed parks failed');
            });
        }).catch((error) => {
            console.log(error)
            console.log('Park Realm Init Failed');
        });

    }

    // toggle camera modal
    toggleCameraModal = () => {
        this.setState({
            ...this.state,
            cameraModalVisible: !this.state.cameraModalVisible
        });
    }

    // save photo to state and possibly camera roll
    savePhoto = (photoData, fromCameraRoll) => {
        if (UserService.currentUser.savePhotosToCameraRoll && !fromCameraRoll) {
            // save photo to camera roll
            UserService.savePhotoToCameraRoll(photoData.uri).then((returnedPhoto) => {
                UserService.saveUserPhoto(photoData.base64).then((updatedUser) => {
                    this.updateCurrentUserInState(updatedUser);
                }).catch((error) => {
                    console.log('Save Photo Failed: ', error);
                });                
            }).catch((error) => {
                console.log('error saving to camera roll: ', error);
            });
        } else {
            // save photo
            UserService.saveUserPhoto(photoData.base64).then((updatedUser) => {
                this.updateCurrentUserInState(updatedUser);
            }).catch((error) => {
                console.log('Save Photo Failed: ', error);
            }); 

            this.setState({
                ...this.state,
                formValues: {
                    ...this.state.formValues,
                    photo: photoData.base64
                },
                cameraModalVisible: false,
            });
        }
    }

    // photo delete press event
    onPhotoDeletePress = () => {
        // display confirm prompt, user must type CONFIRM to delete photo
        AlertIOS.alert(
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

    // lauch sign in modal
    onSignInPress = () => {
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
    }

    // launch register modal
    onRegisterPress = () => {
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

    // render active journal entries info
    renderActiveJournal = (journal) => {
        const journalEntriesLabel = (journal.journalEntries.length === 1) ? 'entry' : 'entries';

        return (
            <Text style={styles.journalText}>Your active journal is, {journal.name}, and it has {journal.journalEntries.length} {journalEntriesLabel}.</Text>
        );
    }

    // render active journal info
    renderActiveJournalInfo = (journal) => {
        return (
            <View>
                <Text style={styles.journalText}>It was created on {moment(journal.dateCreated).format('M-D-YYYY h:mm a')}.</Text>
                <Text style={styles.journalText}>It was last updated on {moment(journal.dateModified).format('M-D-YYYY h:mm a')}.</Text>
            </View>
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
            const journalEntries = (this.state.currentUser.activeJournal)
                ? this.renderActiveJournal(this.state.currentUser.activeJournal)
                : null
            const journalInfo = (this.state.currentUser.activeJournal)
                ? this.renderActiveJournalInfo(this.state.currentUser.activeJournal)
                : null
            
            // render user settings
            const userPhotoSetting = (this.state.currentUser.savePhotosToCameraRoll)
                ? 'Photos will be saved to camera roll.'
                : 'Photos will not be saved to camera roll.'

            return (
                <KeyboardAwareScrollView style={styles.container} contentContainerStyle={{flex: 1}} >
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
                            {journalEntries}
                            {journalInfo}
                        </View>
                        <View style={styles.userSetting}>
                            <Text style={styles.userSettingText}>{userPhotoSetting}</Text>
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
                    </View>
                    <CameraModal 
                        quality={'1'}
                        savePhoto={this.savePhoto}
                        visible={this.state.cameraModalVisible}
                        toggleCameraModal={this.toggleCameraModal} />
                </KeyboardAwareScrollView>
            );
        }

        // Default render sign in and sign up buttons
        return (
            <View style={styles.signInContainer}>
                <ImageBackground 
                    style={styles.image} 
                    source={require('../../assets/Mickey_Background.png')}
                    resizeMode='cover'
                    blurRadius={2}
                    opacity={10}>
                    <View style={styles.signInButtons}>
                        <MickeyButton text='Login' onPress={this.onSignInPress} />
                        <MickeyButton text='Register' onPress={this.onRegisterPress} />
                    </View>
                </ImageBackground>
            </View>
        )
    }
}

var styles = StyleSheet.create({
	signInContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    signInImage: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingTop: 100
    },
    image: {
        flex: 1,
    },
    signInButtons: {
        flex: 1,
        paddingTop: 100
    },
    container: {
        flex: 1
    },
    profileContainer: {
        flex: 1,
        justifyContent: 'space-between',
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
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15
    },
    lowerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        marginTop: 15
    },
    journalText: {
        fontSize: 18,
        textAlign: 'center',
        color: 'white'
    },
    userSettingText: {
        color: '#FFFFFF',
        fontSize: 16
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