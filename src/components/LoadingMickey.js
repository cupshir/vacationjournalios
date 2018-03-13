import React, { Component } from "react";
import { 
    View, 
    Text, 
    StyleSheet,
    Animated,
    Image,
    Easing 
} from "react-native";

// Activity Indicator shaped like Mickey
class LoadingMickey extends Component {
    constructor () {
        super()
        this.spinValue = new Animated.Value(0)
    }

    // Start Spin animation
    componentDidMount () {
        this.spin()
    }
    
    // Define spin animation
    spin() {
        this.spinValue.setValue(0)
        Animated.timing(
            this.spinValue,
            {
                toValue: 1,
                duration: 2000,
                easing: Easing.linear
            }
        ).start(() => this.spin())
    }

    // Render spin animation
    render() {
        const spin = this.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        })

        return (
            <View style={styles.container}>
                <View style={styles.mickey}>
                    <View style={styles.ears}>
                        <Animated.View style={{ transform: [{rotate: spin}] }}>
                            <View style={styles.ear} />
                        </Animated.View>
                        <Animated.View style={{ transform: [{rotate: spin}] }}>
                            <View style={styles.ear} />
                        </Animated.View>
                    </View>
                    <View style={styles.headContainer}>
                        <Animated.View style={{ transform: [{rotate: spin}] }}>                       
                            <View style={styles.head} />
                        </Animated.View>
                    </View>
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
        paddingTop: 200,
        alignItems: 'center'
    },
    ears: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 175
    },
    ear: {
        borderStyle: 'solid',
        borderColor: 'lightgrey',
        borderWidth: 10,
        borderTopColor: 'blue', 
        borderRadius: 60,
        width: 60,
        height: 60
    },
    headContainer: {
        marginTop: -15,
    },
    head: {
        borderStyle: 'solid',
        borderColor: 'lightgrey',
        borderWidth: 10,
        borderTopColor: 'blue', 
        borderRadius: 120,
        width: 120,
        height: 120
    }
})

export default LoadingMickey;