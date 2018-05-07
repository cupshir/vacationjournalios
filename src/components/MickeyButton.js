import React, { Component } from "react";
import { 
    StyleSheet,
    TouchableOpacity,
    Text,
    View,
} from "react-native";

// Mickey Shaped Button
class MickeyButton extends Component {
    onPress = () => {
        this.props.onPress()
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.mickey}>
                    <View style={styles.ears}>
                        <TouchableOpacity style={styles.ear} onPress={() => this.onPress()} activeOpacity={1} />
                        <TouchableOpacity style={styles.ear} onPress={() => this.onPress()} activeOpacity={1}  />
                    </View>
                    <TouchableOpacity style={styles.head} onPress={() => this.onPress()}  activeOpacity={1}>
                        <Text style={styles.buttonText}>{this.props.text}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1
    },
    mickey: {
        alignItems: 'center'
    },
    ears: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 150
    },
    ear: {
        backgroundColor: 'lightgrey',
        width: 50,
        height: 50,
        borderRadius: 100
    },
    head: {
        backgroundColor: 'lightgrey',
        width: 100,
        height: 100,
        marginTop: -30,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonText: {
        color: '#000000',
        fontWeight: 'bold',
        fontSize: 16
    }
})

export default MickeyButton;