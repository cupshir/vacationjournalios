import React, { PureComponent } from "react";
import { 
    View, 
    Text, 
    StyleSheet,
    TouchableOpacity
} from "react-native";
import PropTypes from 'prop-types';
import Swipeout from 'react-native-swipeout';
import moment from 'moment';

class ListItemAttraction extends PureComponent {
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
                backgroundColor: 'blue',
                onPress: this.onEditPress
            }
        ]

        // Format date
        const dateJournaled = moment(this.props.item.dateJournaled).format('MM-DD-YYYY hh:mm a');

        return (
            <View style={styles.container}>
                <Swipeout 
                    left={leftSwipeButtons} 
                    right={rightSwipeButtons} 
                    autoClose={true} 
                    backgroundColor={'white'} >
                        <TouchableOpacity onPress={this.onPress}>
                            <View style={styles.row}>
                                <View style={styles.image}>
                                    <Text>Pic</Text>
                                </View>
                                <View style={styles.contentContainer}>
                                    <Text style={styles.contentHeader}>
                                        {this.props.item.attraction.name}
                                    </Text>
                                    <Text style={styles.contentText}>
                                        {this.props.item.park.name}
                                    </Text>
                                    <Text style={styles.contentText}>
                                        {dateJournaled}
                                    </Text>
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
        borderBottomColor: 'lightgrey',
        borderBottomWidth: 1,
        flexDirection: 'row'
    },
    image: {
        borderColor: 'black',
        borderWidth: 1,
        borderStyle: 'solid',
        width: 100,
        height: 75,
        marginLeft: 15,
    },
    contentContainer: {
        marginLeft: 5,
        marginRight: 15
    },
    contentHeader: {
        fontSize: 18
    },
    contentText: {
        fontSize: 14
    }
})

ListItemAttraction.propTypes = {  
    item: PropTypes.object.isRequired
};

export default ListItemAttraction;