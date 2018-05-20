import React, { Component } from 'react';
import {
    ImageBackground,
    FlatList, 
    StyleSheet,
    Text,
    View 
} from 'react-native';
import { 
    IconsMap,
    IconsLoaded
} from '../../AppIcons';

import * as UserService from '../../realm/userService';

import ListItem from "../../components/ListItem";
import LoadingMickey from '../../components/LoadingMickey';
import MickeyButton from '../../components/MickeyButton';

class ParkList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentUser: null,
            parks: null,
            isLoading: true
        }  
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    // Navigator button event
    onNavigatorEvent(event) {
        if (event.id === 'willAppear') {
            if (UserService.currentUser) {
                this.updateCurrentUserInState(UserService.currentUser);
            } else {
                this.setState({
                    ...this.state,
                    parks: null,
                    currentUser: null,
                    isLoading: false
                });
            }
        }
        if (event.type == 'NavBarButtonPress') {
            if (event.id == 'addPark') {
                this.props.navigator.push({
                    screen: 'vacationjournalios.EditPark',
                    title: 'Create Park',
                    animated: true,
                    animationType: 'fade'
                });
            }
        }
    }

    componentDidMount() {
        if (UserService.currentUser) {
            if (UserService.parkRealm) {
                // seed park realm exists, refresh user data
                UserService.updateUserAttractions()
                    .then(() => {
                    }).catch((error) => {
                        console.log('Failed to update user attractions');
                        console.log(error);
                    });
                    UserService.updateUserParks().then(() => {
                    }).catch((error) => {
                        console.log('Failed to update user parks');
                        console.log(error);                
                    });
            }

            // Set nav buttons
            IconsLoaded.then(() => {
                if (UserService.currentUser && UserService.isAdmin) {
                    this.props.navigator.setButtons({
                        rightButtons: 
                        [
                            {
                                id: 'addPark',
                                icon: IconsMap['add']
                            }
                        ]
                    });
                }
            });
    
        } else {
            this.setState({
                ...this.state,
                parks: null,
                currentUser: null,
                isLoading: false
            });
        }

        // hack to show navbar border (so parent search box looks like ios Native)
        this.props.navigator.setStyle({
            navBarNoBorder: false
        });
    }

    updateCurrentUserInState = (user) => {
        let parks = null;
        if (UserService.parkRealm) {
            parks = UserService.parkRealm.objects('Park');
        }

        if (user) {
            this.setState({
                ...this.state,
                parks: parks,
                currentUser: user,
                isLoading: false
            });
        } else {
            this.setState({
                ...this.state,
                parks: null,
                currentUser: null,
                isLoading: false
            });
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

    // row on press event
    onPress = (id) => {
        if (id) {
            this.props.navigator.push({
                screen: 'vacationjournalios.AttractionList',
                title: 'Attractions',
                passProps: {
                    parkId: id
                },
                animated: true,
                animationType: 'fade'
            });
        } 
    }

    // row edit press event
    onEditPress = (id) => {
        this.props.navigator.push({
            screen: 'vacationjournalios.EditPark',
            title: 'Edit Park',
            passProps: {
                parkId: id
            },
            animated: true,
            animationType: 'fade'
        });
    }

    onLongPress = (id) => {
        this.props.navigator.push({
            screen: 'vacationjournalios.Park',
            title: 'Park Info',
            passProps: {
                parkId: id
            },
            animated: true,
            animationType: 'fade'
        });
    }

    // render row item
    renderItem = ({ item }) => (
        <ListItem
            id={item.id.toString()}
            title={item.name}
            onPress={this.onPress}
            onLongPress={this.onLongPress}
            onEditPress={UserService.isAdmin ? this.onEditPress : null}
            viewStyle={styles.listView}
            textStyle={styles.listText} />
    );

    // render list
    render() {
        // Loading Mickey Graphic
        if (this.state.isLoading) {
            return (
                <View style={styles.container}>
                    <LoadingMickey />
                </View>
            );
        }

        // If no current User, display Sign In button
        if (this.state.currentUser === null) {
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
            );
        }
    
        return (
            <View style={styles.container}>
                <FlatList
                    data={this.state.parks}
                    renderItem={this.renderItem}
                    keyExtractor={item => item.id} />
            </View>
        );
    }
}

var styles = StyleSheet.create({
    messageContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    container: {
        flex: 1,
        alignItems: 'stretch'
    },
    listView: {
        padding: 5,
        paddingRight: 10,
        paddingLeft: 10,
        borderBottomColor: '#444444',
        borderBottomWidth: 1,
        backgroundColor: '#151515',
    },
    listText: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontSize: 20
    },
    signInContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    image: {
        flex: 1,
    },
    signInButtons: {
        flex: 1,
        paddingTop: 100
    }
});

export default ParkList;
