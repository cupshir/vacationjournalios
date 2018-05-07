import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { 
    Image,
    StyleSheet,
    Text, 
    View
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

class StatBoxLarge extends Component {
    
    render(props) {
        let photo = <Icon style={{ fontSize: 75, color: 'white' }} name="photo" /> ;
        let name = '';

        if (this.props.value !== undefined) {
            name = this.props.value.name;

            if (this.props.value.photo) {
                photo = (
                    <Image 
                        style={{ width: 100, height: 75 }}
                        source={{uri: `data:image/png;base64,${this.props.value.photo}`}} 
                    />
                );
            }    
        }


        return (
            <View style={styles.container}>
                <View style={styles.image}>
                    {photo}
                </View>
                <View style={styles.content}>
                    <View style={styles.title}>
                        <Text style={styles.titleText}>{this.props.title}</Text>
                        <Text style={styles.titleText}>{this.props.label}</Text>
                    </View>
                    <View>
                        <Text style={styles.text}>
                            {name}
                        </Text>
                    </View>
                </View>
            </View>
        );
    }
}

var styles = StyleSheet.create({
    container: {
        height: 100,
        flexDirection: 'row',
        marginTop: 5,
        marginBottom: 5,
        marginLeft: 10,
        marginRight: 10 
    },
    image: {
        flex: .4,
        backgroundColor: '#C7D0FE',
        justifyContent: 'center',
        alignItems: 'center'
    },
    content: {
        flex: .6,
        backgroundColor: '#252525'
    },
    title: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 5,
        paddingRight: 5,
        flexWrap: 'wrap'
    },
    titleText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold'
    },
    text: {
        color: '#FFFFFF',
        padding: 5
    }
})

StatBoxLarge.propTypes = {  
    title: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ])
};

export default StatBoxLarge;
