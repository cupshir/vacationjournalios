import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { 
    Text, 
    View,
    StyleSheet
} from 'react-native';

class StatBoxSmall extends Component {
    render(props) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>{this.props.label}</Text>
                <Text style={styles.stat}>{this.props.value}</Text>
                <Text style={styles.title}>{this.props.title}</Text>
            </View>
        );
    }
}

var styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        height: 100,
        width: 90,
        margin: 5,
        backgroundColor: '#C7D0FE'
    },
    stat: {
        fontSize: 34,
        textAlign: 'center'
    },
    title: {
        textAlign: 'center'
    }
});

StatBoxSmall.propTypes = {  
  title: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired
};

export default StatBoxSmall;
