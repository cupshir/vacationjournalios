import React, { PureComponent } from "react";
import { 
    View, 
    Text, 
    StyleSheet,
    TouchableOpacity
} from "react-native";
import Swipeout from 'react-native-swipeout';

// custom ListItem - TODO: add prop types
class ListItem extends PureComponent {
    // Press event
    onPress = () => {
        this.props.onPress(this.props.id, this.props.title);
    };

    // Edit event
    onEditPress = () => {
        this.props.onEditPress(this.props.id);
    }

    // Delete event
    onDeletePress = () => {
        this.props.onDeletePress(this.props.id, this.props.title);
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

        return (
            <Swipeout left={leftSwipeButtons} right={rightSwipeButtons} autoClose={true} backgroundColor={'white'}>
                <TouchableOpacity onPress={this.onPress}>
                    <View style={this.props.viewStyle ? this.props.viewStyle : null}>
                        <Text style={this.props.textStyle ? this.props.textStyle : null}>
                            {this.props.title}
                        </Text>
                    </View>
                </TouchableOpacity>
            </Swipeout>
        );
    }
}

export default ListItem;