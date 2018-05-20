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

class ListItemJournal extends PureComponent {
    // Press event
    onPress = () => {
        this.props.onPress(this.props.item.id, this.props.item.name);
    };

    // Edit event
    onEditPress = () => {
        this.props.onEditPress(this.props.item.id, this.props.item.name);
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
                backgroundColor: '#999999',
                onPress: this.onEditPress
            }
        ]

        const photo = (this.props.item.photo === '') 
            ? <Icon style={{ fontSize: 75, color: 'white' }} name="photo" />  
            : <Image 
                    style={{ width: 100, height: 75 }}
                    source={{uri: `data:image/png;base64,${this.props.item.photo}`}} 
                />

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
                    backgroundColor={'#222222'} >
                        <TouchableOpacity onPress={this.onPress}>
                            <View style={styles.row}>
                                <View style={styles.image}>
                                    {photo}
                                </View>
                                <View style={styles.contentContainer}>
                                    <Text style={styles.headerText}>
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
        borderBottomColor: '#444444',
        borderBottomWidth: 1,
        flexDirection: 'row',
        backgroundColor: '#222222'
    },
    image: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#999999',
        width: 100,
        height: 75,
        marginLeft: 15,
        marginTop: 5,
        marginBottom: 5,
        marginRight: 5
    },
    contentContainer: {
        justifyContent: 'space-around',
        marginLeft: 5,
        marginRight: 15
    },
    headerText: {
        fontSize: 18,
        color: '#FFFFFF'
    },
    contentText: {
        fontSize: 14,
        color: '#FFFFFF'
    }
})

ListItemJournal.propTypes = {  
    item: PropTypes.object.isRequired
};

export default ListItemJournal;