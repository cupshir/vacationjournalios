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

class ListItemJournal extends PureComponent {
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
        this.props.onDeletePress(this.props.item.id, this.props.item.name);
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

        let photo = (
            <Text>Placeholder Image</Text>
        );

        if (this.props.item.photo !== null) {
            if (this.props.item.photo !== '') {
                photo = (
                    <Image 
                        style={{ width: 100, height: 75 }}
                        source={{uri: `data:image/png;base64,${this.props.item.photo}`}} 
                    />
                );
            }
        }

        let dateRange = '';

        if (this.props.item.startDate !== null && this.props.item.endDate !== null) {
            dateRange = `${moment(this.props.item.startDate).format('MM-DD-YYYY')} - ${moment(this.props.item.endDate).format('MM-DD-YYYY')}`;
        }

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
                                    {photo}
                                </View>
                                <View style={styles.contentContainer}>
                                    <Text style={styles.contentHeader}>
                                        {this.props.item.name}
                                    </Text>
                                    <Text style={styles.contentText}>
                                        {dateRange}
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
        marginTop: 5,
        marginBottom: 5,
        marginRight: 5
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

ListItemJournal.propTypes = {  
    item: PropTypes.object.isRequired
};

export default ListItemJournal;