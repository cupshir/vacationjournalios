import React, { PureComponent } from "react";
import { 
    View, 
    Text, 
    StyleSheet
} from "react-native";
import PropTypes from 'prop-types';

// SectionHeader for SectionList
class SectionHeader extends PureComponent {
    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>
                    {this.props.title}
                </Text>
            </View>
        );
    }
}

var styles = StyleSheet.create({
    container: {
        backgroundColor: '#999999',
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 15,
        paddingRight: 15
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center'
    }
})

SectionHeader.propTypes = {  
    title: PropTypes.string.isRequired
};

export default SectionHeader;