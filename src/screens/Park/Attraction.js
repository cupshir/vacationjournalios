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

class Attraction extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            currentUser: null,
            attraction: null,
            isLoading: true,
        };
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    // handle navigation events
    onNavigatorEvent(event) {
        if (event.id === 'willAppear') {
            this.updateCurrentUserInState(UserService.currentUser);
            // check if an attraction id was passed, if so update state with attraction data
            if (this.props.attractionId !== null && this.props.attractionId !== '') {
                this.setState({
                    ...this.state,
                    attraction: UserService.parkRealm.objectForPrimaryKey('Attraction', this.props.attractionId)
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

    renderAttraction = () => {
        // render photo or camera button
        const photo = (this.state.attraction.photo !== '') 
        ? this.renderPhoto(this.state.attraction.photo) 
        : null

        const devAttractionId = (UserService.isDevAdmin)
        ? <Text style={styles.contentText} selectable={true}>{this.state.attraction.id}</Text>
        : null

        return (
            <View style={styles.container}>
                <Text style={styles.parkText}>
                    {this.state.attraction.park.name}
                </Text>
                <Text style={styles.attractionText}>
                    {this.state.attraction.name}
                </Text>        
                <View style={styles.photoSection}>
                    {photo}
                </View>
                <View style={styles.heightScore}>
                    <Text style={styles.contentText}>
                        {this.state.attraction.heightToRide === 0 ? 'Any Height' : this.state.attraction.heightToRide + '"' }
                    </Text>
                    <Text style={styles.contentText}>
                        {this.state.attraction.hasScore ? 'Does Keep Score' : 'Doesnt Keep Score'}
                    </Text>
                </View>
                <Text style={styles.description}>
                    {this.state.attraction.description}
                </Text>
                {devAttractionId}
            </View>
        );
    }

    render() {
        if (this.state.attraction === null) {
            return (
                <Text>
                    {'Attraction is missing'}
                </Text>
            );
        }

        const attraction = this.renderAttraction();

        return (
            <KeyboardAwareScrollView style={styles.container}>
                {attraction}
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
    attractionText: {
        color: '#FFFFFF',
        fontSize: 26,
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
    heightScore: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 20,
        paddingRight: 20
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

export default Attraction;