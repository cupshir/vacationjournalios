import React, { Component } from "react";
import { 
    AlertIOS,
    Image,
    StyleSheet,
    Switch,
    View
} from "react-native";
import { 
    Text
} from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/Ionicons';

import * as UserService from '../../realm/userService';

class Park extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            currentUser: null,
            park: null,
            isLoading: true,
        };
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    // handle navigation events
    onNavigatorEvent(event) {
        if (event.id === 'willAppear') {
            this.updateCurrentUserInState(UserService.currentUser);
            // check if an park id was passed, if so update state with park data
            if (this.props.parkId !== null && this.props.parkId !== '') {
                this.setState({
                    ...this.state,
                    park: UserService.parkRealm.objectForPrimaryKey('Park', this.props.parkId)
                });
            } 
        }
    }

    // Navbar styling: Do we need?
    componentDidMount() {
        this.props.navigator.setStyle({
            navBarNoBorder: false
        })
    }

    // loads current user object into state if exists
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

    // render photo image
    renderPhoto = (photo) => {
        return (
            <View style={styles.photo}>
                <Image 
                    style={{ width: 300, height: 300 }}
                    resizeMode={'cover'}
                    source={{uri: `data:image/png;base64,${photo}`}} />
            </View>
        );
    }

    renderPark = () => {
        // render photo or camera button
        const photo = (this.state.park.photo !== '') 
            ? this.renderPhoto(this.state.park.photo) 
            : null

        const devParkId = (UserService.isDevAdmin)
            ? <Text style={styles.contentText} selectable={true}>{this.state.park.id}</Text>
            : null

        return (
            <View style={styles.container}>
                <Text style={styles.parkText}>
                    {this.state.park.name}
                </Text>
                <View style={styles.photoSection}>
                    {photo}
                </View>
                <Text style={styles.description}>
                    {this.state.park.description}
                </Text>
                {devParkId}
            </View>
        );
    }

    render() {
        if (this.state.park === null) {
            return (
                <Text>
                    {'Park is missing'}
                </Text>
            );
        }

        const park = this.renderPark();

        return (
            <KeyboardAwareScrollView style={styles.container}>
                {park}
            </KeyboardAwareScrollView> 
        );        
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 5
    },
    photoSection: {
        paddingTop: 5,
        paddingBottom: 5
    },
    photo: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    error: {
        borderWidth: 1,
        borderColor: 'red'
    },
    parkText: {
        color: '#0087ff',
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        paddingTop: 5,
        paddingBottom: 5
    },
    contentText: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontSize: 20,
        paddingTop: 5,
        paddingBottom: 5
    },
    description: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontSize: 20,
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 20,
        paddingRight: 20
    }
})

export default Park;