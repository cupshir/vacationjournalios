import React, { Component } from "react";
import { 
    View, 
    Text,
    FlatList, 
    StyleSheet,
    TouchableOpacity,
    AlertIOS 
} from "react-native";
import { 
    IconsMap,
    IconsLoaded
} from '../../AppIcons';

import * as UserService from '../../realm/userService';

import ListItem from "../../components/ListItem";
import LoadingMickey from '../../components/LoadingMickey';

class AttractionList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentUser: null,
            attractions: null,
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
            if (event.id == 'addAttraction') {
                this.props.navigator.push({
                    screen: 'vacationjournalios.EditAttraction',
                    title: 'Create Attraction',
                    passProps: {
                        parkId: this.props.parkId
                    },
                    animated: true,
                    animationType: 'fade'
                });
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
            if (UserService.currentUser && UserService.isAdmin) {
                this.props.navigator.setButtons({
                    rightButtons: 
                    [
                        {
                            id: 'addAttraction',
                            icon: IconsMap['add']
                        }
                    ]
                });
            }
        });
    }

    updateCurrentUserInState = (user) => {
        let attractions = null;
        if (UserService.parkRealm == null ){
            UserService.initializeParkRealm();
        } else {
            if (this.props.parkId) {
                attractions = UserService.parkRealm.objects('Attraction').filtered('park.id == $0', this.props.parkId).sorted('name');
            }
        }

        if (user) {
            this.setState({
                ...this.state,
                attractions: attractions,
                currentUser: user
            });
        } else {
            this.setState({
                ...this.state,
                attractions: null,
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

    // row on press event
    onPress = (id) => {
        if (id) {
            this.props.navigator.push({
                screen: 'vacationjournalios.Attraction',
                title: 'Attraction Info',
                passProps: {
                    attractionId: id
                },
                animated: true,
                animationType: 'fade'
            });
        } 
    }

    // row edit press event
    onEditPress = (id) => {
        this.props.navigator.push({
            screen: 'vacationjournalios.EditAttraction',
            title: 'Edit Attraction',
            passProps: {
                attractionId: id
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

        // if user not logged in, display signin message
        if(!this.state.currentUser) {
            return (
                <View style={styles.messageContainer}>
                    <TouchableOpacity style={styles.button} onPress={() => this.onSignInPress()}>
                        <Text>Sign In</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if(!this.state.attractions) {
            return (
                <View style={styles.messageContainer}>
                    <Text>Missing Attractions</Text>
                </View>
            );
        }
    
        return (
            <View style={styles.container}>
                <FlatList
                    data={this.state.attractions}
                    renderItem={this.renderItem}
                    keyExtractor={item => item.id} />
            </View>
        );
    }
}

var styles = StyleSheet.create({
    messageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
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

export default AttractionList;
