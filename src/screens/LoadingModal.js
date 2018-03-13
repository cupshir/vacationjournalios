import React, { Component } from "react";
import { 
    View, 
    Text, 
    StyleSheet 
} from "react-native";

class Loading extends Component {
  render() {
    return (
        <View  style={styles.container}>
            <Text>
                Loading
            </Text>
        </View>
    );
  }
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export default Loading;  