import React, { PureComponent } from "react";
import { 
    View, 
    Text, 
    StyleSheet,
    TouchableOpacity
} from "react-native";
import PropTypes from 'prop-types';
import Swipeout from 'react-native-swipeout';

// custom ListItem
class ListItemAttraction extends PureComponent {
    // Press event
    onPress = () => {
        this.props.onPress(this.props.item);
    };

    // Edit event
    onEditPress = () => {
        this.props.onEditPress(this.props.item);
    }

    // Delete event
    onDeletePress = () => {
        this.props.onDeletePress(this.props.item);
    }

    // Render component
    render() {
        // right swipe buttons
        const rightSwipeButtons = [
            {
                text: 'Delete',
                backgroundColor: 'red',
                onPress: this.onDeletePress
            }
        ]

        // left swipe buttons
        const leftSwipeButtons = [
            {
                text: 'Edit',
                backgroundColor: 'blue',
                onPress: this.onEditPress
            }
        ]

        // render List
        // if no edit or delete function are passed, dont render swipe buttons
        return (
            <Swipeout 
                left={this.props.onEditPress ? leftSwipeButtons : null} 
                right={this.props.onDeletePress ? rightSwipeButtons : null} 
                autoClose={true} 
                backgroundColor={'white'} >
                <TouchableOpacity onPress={this.onPress}>
                    <View style={this.props.viewStyle ? this.props.viewStyle : null}>
                        <Text style={this.props.textStyle ? this.props.textStyle : null}>
                            {this.props.item.attractionname}
                        </Text>
                    </View>
                </TouchableOpacity>
            </Swipeout>
        );
    }
}

ListItemAttraction.propTypes = {  
    item: PropTypes.object.isRequired,
    onPress: PropTypes.func,
    onEditPress: PropTypes.func,
    onDeletePress: PropTypes.func,
    viewStyle: PropTypes.any,
    textStyle: PropTypes.any
};

export default ListItemAttraction;