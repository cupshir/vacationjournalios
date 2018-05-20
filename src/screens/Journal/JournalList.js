import React, { Component } from 'react';
import { 
    AlertIOS,
    FlatList, 
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { 
    IconsMap,
    IconsLoaded
} from '../../AppIcons';

import * as UserService from '../../realm/userService';

import ListItemJournal from '../../components/ListItemJournal';
import LoadingMickey from '../../components/LoadingMickey';
import MickeyButton from '../../components/MickeyButton';

class JournalList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentUser: null,
            isLoading: false
        }  
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    // Navigator button event
    onNavigatorEvent(event) {
        if (event.id === 'willAppear') {
            this.updateCurrentUserInState(UserService.currentUser);
        }
        if (event.type == 'NavBarButtonPress') {
            if (event.id == 'addJournal') {
                this.onCreateJournalPress();
            }
        }
    }

    componentDidMount() {
        // hack to show navbar border (so parent search box looks like ios Native)
        this.props.navigator.setStyle({
            navBarNoBorder: false
        });

        // Set nav buttons
        IconsLoaded.then(() => {
            if (UserService.currentUser) {
                this.props.navigator.setButtons({
                    rightButtons: 
                    [
                        {
                            id: 'addJournal',
                            icon: IconsMap['add']
                        }
                    ]
                });
            }
        });
    }

    updateCurrentUserInState = (user) => {
        if (user) {
            this.setState({
                ...this.state,
                currentUser: user
            });
        } else {
            this.setState({
                ...this.state,
                currentUser: null
            });
        }
    }

    onSignInPress = () => {
        this.props.navigator.showModal({
            screen: 'vacationjournalios.SignIn',
            title: 'Sign In',
            animated: true
        });
    }

    onCreateJournalPress = () => {
        this.props.navigator.push({
            screen: 'vacationjournalios.EditJournal',
            title: 'Create Journal',
            animated: true,
            animationType: 'fade'
        });
    }

    // row on press event
    onPress = (journalId) => {
        // activate loading animation
        this.setState({
            ...this.state,
            isLoading: true
        });
        if (journalId) {
            // attempt to set active journal
            UserService.setActiveJournal(journalId)
                .then((journal) => {
                    //success - stop loading animation and close modal
                    this.setState({
                        ...this.state,
                        isLoading: false
                    });
                    // navigate to Journal screen
                    this.props.navigator.push({
                        screen: 'vacationjournalios.Journal',
                        title: journal.name,
                        animated: true,
                        animationType: 'fade'
                    });
                }).catch((error) => {
                    console.log('setJournalError: ', error);
                    this.setState({
                        ...this.state,
                        isLoading: false
                    });
                });
        } 
    }

    // row edit press event
    onEditPress = (id, name) => {
        // set name
        const newName = 'Edit ' + name;
        this.props.navigator.push({
            screen: 'vacationjournalios.EditJournal',
            title: newName,
            passProps: {
                journalId: id
            },
            animated: true,
            animationType: 'fade'
        });
    }

    // row delete press event
    onDeletePress = (id, journalName) => {
        // display confirm prompt, user must type matching name to delete
        AlertIOS.prompt(
            'Confirm Delete',
            'WARNING: This will delete all associated journal entries and cant be undone! Type the exact journal name to proceed. Again, this cant be undone...you have been warned!!!',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Delete',
                    onPress: (enteredName) => this.handleDeleteJournal(id, journalName, enteredName)
                }
            ]
        );
    }

    // handle delete journal
    handleDeleteJournal = (journalId, journalName, enteredName) => {
        // verify typed name matches journal name
        if(enteredName === journalName) {
            // start loading animation
            this.setState({
                ...this.state,
                isLoading: true
            });
            // attempt to delete journal
            UserService.deleteJournal(journalId)
                .then(() => {
                    // Success - stop loading animation
                    this.setState({
                        ...this.state,
                        isLoading: false
                    });
                }).catch((error) => {
                    // Failed - stop loading animation
                    this.setState({
                        ...this.state,
                        isLoading: false
                    });
                });
        } else {
            // dont match, display alert and do nothing
            AlertIOS.alert('Names dont match. Journal not deleted!');
        }
    }

    // render row item
    renderItem = ({ item }) => (
        <ListItemJournal
            item={item}
            onPress={this.onPress}
            onEditPress={this.onEditPress}
            onDeletePress={this.onDeletePress}
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

        // if user not logged in, display signin message
        if(!this.state.currentUser) {
            return (
                <View style={styles.messageContainer}>
                    <ImageBackground 
                        style={styles.image} 
                        source={require('../../assets/Mickey_Background.png')}
                        resizeMode='cover'
                        blurRadius={2}
                        opacity={10}>
                        <View style={{flex: 1, marginTop: 200}}>
                            <MickeyButton text='Sign In' onPress={this.onSignInPress} />
                        </View>
                    </ImageBackground>
                </View>
            );
        }

        // if no journals exist, display message to create one
        if (this.state.currentUser && this.state.currentUser.journals.length === 0) {
            return (
                <View style={styles.messageContainer}>
                    <ImageBackground 
                        style={styles.image} 
                        source={require('../../assets/Mickey_Background.png')}
                        resizeMode='cover'
                        blurRadius={2}
                        opacity={10}>
                        <View style={{flex: 1, marginTop: 200}}>
                            <MickeyButton text='Create A Journal' onPress={this.onCreateJournalPress} />
                        </View>
                    </ImageBackground>
                </View>
            );
        }
    
        return (
            <View style={styles.container}>
                <FlatList
                    data={this.state.currentUser.journals}
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
    image: {
        flex: 1,
    },
    container: {
        flex: 1,
        alignItems: 'stretch'
    },
    listView: {
        padding: 5,
        paddingRight: 10,
        paddingLeft: 10,
        borderBottomColor: 'lightgrey',
        borderBottomWidth: 1
    },
    listText: {
        color: 'blue',
        textAlign: 'center',
        fontSize: 20
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

export default JournalList;
