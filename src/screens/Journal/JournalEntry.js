import React, { Component } from 'react';
import {
    AlertIOS,
    Image,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';
import { 
    Text
} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import moment from 'moment';

import * as AppConstants from '../../realm/config'
import * as UserService from '../../realm/userService';

import LoadingMickey from '../../components/LoadingMickey';

class JournalEntry extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formValues: {
                journalEntryId: '',
                park: '',
                attraction: '',
                photo: '',
                dateCreated: '',
                dateJournaled: '',
                minutesWaited: '',
                usedFastPass: false,
                rating: '',
                pointsScored: '',
                comments: ''
            },
            isLoading: true
        };
    }

    componentDidMount() {
        if(this.props.journalEntryId) {
            UserService.getJournalEntryById(this.props.journalEntryId).then((journalEntry) => {
                // success - pass journal entry to edit screen
                this.loadEntryIntoState(journalEntry);
            }).catch((error) => {
                // failed
                console.log('error: ', error);
                this.props.navigator.pop();
            })
        } else {
            this.props.navigator.pop();
        }
        this.props.navigator.setStyle({
            navBarNoBorder: true
        });
    }

    // populate state with existing data
    loadEntryIntoState(journalEntry) {
        if (journalEntry) {
            this.setState({
                ...this.state,
                formValues: {
                    journalEntryId: journalEntry.id,
                    park: UserService.userRealm.objectForPrimaryKey('Park', journalEntry.park.id),
                    attraction: UserService.userRealm.objectForPrimaryKey('Attraction', journalEntry.attraction.id),
                    photo: journalEntry.photo ? journalEntry.photo : '',
                    dateCreated: journalEntry.dateCreated,
                    dateJournaled: journalEntry.dateJournaled,
                    minutesWaited: journalEntry.minutesWaited.toString(),
                    usedFastPass: journalEntry.usedFastPass ? true : false,
                    rating: journalEntry.rating.toString(),
                    pointsScored: journalEntry.pointsScored ? journalEntry.pointsScored.toString() : '',
                    comments: journalEntry.comments ? journalEntry.comments :  ''
                },
                isLoading: false
            });
        }
    }

    // Render points scored input
    renderPointsScored = () => {
        return (
            <View style={styles.pointsRow}>
                <View style={styles.points}>
                    <Text style={styles.label}>Points Scored</Text>
                    <Text style={styles.pointsText}>{this.state.formValues.pointsScored}</Text>
                </View>
            </View>
        );
    }

    renderPhoto = (photo) => {
        return (
            <View style={styles.photo}>
                <Image 
                        style={{ width: 300, height: 300, borderRadius: 5 }}
                        source={{uri: `data:image/png;base64,${photo}`}} 
                    />
            </View>
        );
    }

    renderPhotoPlaceholder = () => {
        return (
            <View style={styles.photo}>
                <Icon style={{ fontSize: 75, color: 'white' }} name="photo" /> 
            </View>
        );
    }

    // render fastpass image
    renderFastpass = (plus) => {
        // get the correct fast pass image
        const imageSource = plus
            ? require('../../assets/FastPassPlus_90.png')
            : require('../../assets/FastPass_90.png')

        return (
            <View style={styles.fastpass}>
                <Image 
                    style={styles.fastpassImage} 
                    source={imageSource}
                />
            </View>
        )
    }

    // render View
    render() {
        // Loading Graphic
        if (this.state.isLoading === true) {
            return (
                <View style={styles.container}>
                    <LoadingMickey />
                </View>
            );
        }

        // render photo or placeholder
        const photo = (this.state.formValues.photo !== '') 
        ? this.renderPhoto(this.state.formValues.photo)
        : this.renderPhotoPlaceholder()

        // render fastpass image if used
        let fastpass = null;
        if (this.state.formValues.usedFastPass) {
            const parkId = this.state.formValues.park.id;
            if (parkId === AppConstants.DISNEYLAND || parkId === AppConstants.CALIFORNIA_ADVENTURE) {
                fastpass = this.renderFastpass(false);
            } else if (parkId === AppConstants.MAGIC_KINGDOM || parkId === AppConstants.EPCOT || parkId === AppConstants.HOLLYWOOD_STUDIOS || parkId === AppConstants.ANIMAL_KINGDOM) {
                fastpass = this.renderFastpass(true);
            }
        }

        // render points scored if attraction keeps score
        let pointsScored = null;
        if (this.state.formValues.pointsScored !== '' && this.state.formValues.pointsScored !== '-1') {
            pointsScored = this.renderPointsScored();
        }

        // Render form
        return (
            <ScrollView style={styles.container}>
                <View style={styles.parkAttractionSection}>
                    <Text style={styles.parkAttractionText}>{this.state.formValues.park.name}</Text>
                    <Text style={styles.parkAttractionText}>{this.state.formValues.attraction.name}</Text>
                </View>
                <View style={styles.photoSection}>                   
                    {photo}
                </View>
                <View style={styles.minutesWaitedDateJournaledSection}>
                    <View>
                        <Text style={styles.label}>Waited</Text>
                        <Text style={styles.minuteswaited}>{this.state.formValues.minutesWaited}</Text>                        
                    </View>
                    <View>
                        <Text style={styles.label}>Date Journaled</Text>
                        <Text style={styles.date}>{moment(this.state.formValues.dateJournaled).format("MM/DD/YYYY h:mm a")}</Text>
                    </View>
                </View>
                <View style={styles.ratingFastPassSection}>
                    <View>
                        <Text style={styles.label}>Rating</Text>
                        <Text style={styles.minuteswaited}>{this.state.formValues.rating}</Text>
                    </View>
                    <View>
                        {fastpass}
                    </View>
                </View>
                {pointsScored}
                <View style={styles.commentsSection}>
                    <View>
                        <Text style={styles.label}>Comments</Text>
                        <Text style={styles.comments}>{this.state.formValues.comments}</Text>
                    </View>
                </View>
            </ScrollView>
        )
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#444444'
    },
    parkAttractionSection: {
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#252525',
        marginTop: 30,
        marginBottom: 15
    },
    parkAttractionText: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontSize: 20,
        paddingTop: 5,
        paddingBottom: 5,
        paddingRight: 15,
        paddingLeft: 15
    },
    photoSection: {
        backgroundColor: '#444444'
    },
    photo: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    label: {
        fontSize: 18,
        color: '#FFFFFF',
        textAlign: 'center'
    },
    minutesWaitedDateJournaledSection: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        backgroundColor: '#252525',
        marginTop: 15,
        paddingRight: 15,
        paddingLeft: 15,
        paddingTop: 10,
        paddingBottom: 10
    },
    minuteswaited: {
        width: 125,
        borderWidth: .5,
        backgroundColor: '#AAAAAA',
        borderRadius: 5,
        height: 25,
        fontSize: 18,
        textAlign: 'center',
        color: '#000000'
    },
    date: {
        width: 200,
        borderWidth: .5,
        backgroundColor: '#AAAAAA',
        borderRadius: 5,
        height: 25,
        fontSize: 18,
        textAlign: 'center',
        color: '#000000'
    },
    ratingFastPassSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#252525',
        paddingRight: 15,
        paddingLeft: 15
    },
    fastpass: {
        width: 200,
        alignItems: 'center',
        marginTop: 10
    },
    fastpassImage: {
        width: 50,
        height: 50
    },
    pointsRow: {
        backgroundColor: '#252525',
        paddingRight: 15,
        paddingLeft: 15,
        paddingTop: 10,
        paddingBottom: 10
    },
    points: {
        width: 125,
        marginTop: -5
    },
    pointsText: {
        backgroundColor: '#AAAAAA',
        borderRadius: 5,

        height: 25,
        fontSize: 18,
        textAlign: 'center'
    },
    commentsSection: {
        backgroundColor: '#252525',
        paddingRight: 15,
        paddingLeft: 15,
        paddingTop: 10,
        paddingBottom: 20,
        marginBottom: 30
    },
    comments: {
        backgroundColor: '#AAAAAA',
        borderRadius: 5,
        height: 150
    }
});

export default JournalEntry;