import React, { Component } from "react";
import { 
    Animated,
    Easing,
    Image,
    ImageBackground,
    StyleSheet,
    Text,
    View
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

    renderTitle = () => {
        const title = this.props.title !== '' 
            ? (<Text style={styles.title}>{this.props.title}</Text>) 
            : null

        const text = this.props.text !== '' 
            ? (<Text style={styles.text}>{this.props.text}</Text>)
            : null

        return (
            <View style={styles.titleContainer}>
                {title}
                {text}            
            </View>
        );
    }

    // Render spin animation
    render() {
        const spin = this.spinValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        })

        let title = null;

        if (this.props.title || this.props.text) {
            title = this.renderTitle();
        }


        return (
            <View style={styles.container}>
                <ImageBackground 
                    style={styles.image} 
                    source={require('../assets/Mickey_Background.png')}
                    resizeMode='cover'
                    blurRadius={2}
                    opacity={10}>
                    {title}
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
                </ImageBackground>
            </View>
        );
  }
}

var styles = StyleSheet.create({
    container: {
        flex: 1
    },
    titleContainer: {
        paddingTop: 75,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        color: '#FFFFFF',
        fontSize: 30,
        fontWeight: 'bold'
    },
    text: {
        color: '#FFFFFF',
        fontSize: 24,
        paddingTop: 10
    },
    image: {
        flex: 1,
    },
    mickey: {
        paddingTop: 100,
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