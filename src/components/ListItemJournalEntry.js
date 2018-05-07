import React, { PureComponent } from "react";
import { 
    View, 
    Text, 
    Image,
    StyleSheet,
    TouchableOpacity
} from "react-native";
import PropTypes from 'prop-types';
import Swipeout from 'react-native-swipeout';
import moment from 'moment';
import Icon from 'react-native-vector-icons/FontAwesome';

import * as AppConstants from '../realm/config';

class ListItemJournalEntry extends PureComponent {
    // Press event
    onPress = () => {
        this.props.onPress(this.props.item.id);
    };

    // Edit event
    onEditPress = () => {
        this.props.onEditPress(this.props.item.id);
    }

    // Delete event
    onDeletePress = () => {
        this.props.onDeletePress(this.props.item.id);
    }

    // render fastpass image
    renderFastpass = (plus) => {
        // get the correct fast pass image
        const imageSource = plus
            ? require('../assets/FastPassPlus_90.png')
            : require('../assets/FastPass_90.png')

        return (
            <Image 
                style={styles.fastpassImage} 
                source={imageSource}
            />
        );
    }

    render() {
        const rightSwipeButtons = [
            {
                text: 'Delete',
                backgroundColor: 'red',
                onPress: this.onDeletePress
            }
        ]

        const leftSwipeButtons = [
            {
                text: 'Edit',
                backgroundColor: '#999999',
                onPress: this.onEditPress
            }
        ]

        // render photo or placeholder
        const photo = (this.props.item.photo === '') 
        ? <Icon style={{ fontSize: 75, color: 'white' }} name="photo" />  
        : <Image 
                style={{ flex: 1, width: 100, height: null }}
                source={{uri: `data:image/png;base64,${this.props.item.photo}`}} 
            />

        // render fastpass image if used
        let fastpass = null;
        if (this.props.item.usedFastPass) {
            const parkId = this.props.item.park.id;
            if (parkId === AppConstants.DISNEYLAND || parkId === AppConstants.CALIFORNIA_ADVENTURE) {
                fastpass = this.renderFastpass(false);
            } else if (parkId === AppConstants.MAGIC_KINGDOM || parkId === AppConstants.EPCOT || parkId === AppConstants.HOLLYWOOD_STUDIOS || parkId === AppConstants.ANIMAL_KINGDOM) {
                fastpass = this.renderFastpass(true);
            }
        }

        // Format date
        const dateJournaled = moment(this.props.item.dateJournaled).format('MM-DD-YYYY hh:mm a');

        return (
            <View style={styles.container}>
                <Swipeout 
                    left={leftSwipeButtons} 
                    right={rightSwipeButtons} 
                    autoClose={true} 
                    backgroundColor={'#222222'} >
                        <TouchableOpacity onPress={this.onPress}>
                            <View style={styles.row}>
                                <View style={styles.image}>
                                    {photo}
                                </View>
                                <View style={styles.contentContainer}>
                                    <Text style={styles.attractionText}>
                                        {this.props.item.attraction.name}
                                    </Text>
                                    <View>
                                        <Text style={styles.parkText}>
                                            {this.props.item.park.name}
                                        </Text>
                                        <View style={styles.footer}>
                                            <View style={styles.fastpass}>
                                                {fastpass}
                                            </View>
                                            <Text style={styles.footerText}>
                                                {dateJournaled}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                </Swipeout>
            </View>
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch'
    },
    row: {
        borderBottomColor: '#444444',
        borderBottomWidth: 1,
        flexDirection: 'row',
        backgroundColor: '#222222',
        marginLeft: 15,
        marginRight: 15
    },
    image: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#999999',
        width: 100,
        height: null,
        marginTop: 5,
        marginBottom: 5,
    },
    contentContainer: {
        justifyContent: 'space-between',
        flex: 1,
        marginLeft: 5,
        marginRight: 15
    },
    attractionText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF'
    },
    parkText: {
        fontSize: 14,
        color: '#FFFFFF',
        paddingTop: 5,
        paddingBottom: 5
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        marginTop: -5,
        marginBottom: 5
    },
    footerText: {
        fontSize: 14,
        color: '#FFFFFF'
    },
    fastpass: {
        width: 35,
        height: 35,
        marginLeft: 5,
        marginRight: 10,
        paddingTop: 5
    },
    fastpassImage: {
        width: 35,
        height: 35,
    }
})

ListItemJournalEntry.propTypes = {  
    item: PropTypes.object.isRequired
};

export default ListItemJournalEntry;