import React, { Component } from "react";
import { 
    View, 
    Text,
    TouchableOpacity, 
    StyleSheet 
} from "react-native";

class DrawerMenu extends Component {
    constructor(props) {
        super(props);
        //this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    handleItemPress = (item) => {
        this.toggleDrawer();
        switch(item) {
            case 'journal': {
                this.props.navigator.handleDeepLink({
                    link: 'journal'
                });
                break;
            }
            case 'journalEntry': {
                this.props.navigator.handleDeepLink({
                    link: 'journalEntry'
                });
                break;
            }
            case 'signUp': {
                this.props.navigator.handleDeepLink({
                    link: 'signUp'
                });
                break;
            }
            case 'signIn': {
                this.props.navigator.handleDeepLink({
                    link: 'signIn'
                });
                break;
            }
            case 'signOut': {
                this.props.navigator.handleDeepLink({
                    link: 'signOut'
                });
                break;
            }
        }
    }

    toggleDrawer = () => {
        this.props.navigator.toggleDrawer({
          side: 'left'
        });
      };
  
    render(props) {
        const tempLoginBool = false;
        const loginText = tempLoginBool ? 'Sign Out' : 'Sign In';
        const loginKey = tempLoginBool ? 'signOut' : 'signIn';

        return (
        <View style={styles.container}>
            <View style={styles.user}>
                <Text>Pic</Text>
                <Text>Christopher</Text>
                <Text>Line</Text>
            </View>
            <View style={styles.menuItems}>
                <TouchableOpacity onPress={() => this.handleItemPress('journal')}>
                    <Text>Journal</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.handleItemPress('journalEntry')}>
                    <Text>Add Journal Entry</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.handleItemPress('signUp')}>
                    <Text>Sign Up</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.handleItemPress(loginKey)}>
                    <Text>{loginText}</Text>
                </TouchableOpacity>
            </View>
        </View>
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    user: {
        flex: .3,
        marginTop: 100,
        backgroundColor: 'aliceblue',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingRight: 60,
        paddingLeft: 60
    },
    menuItems: {
        flex: .7,
        backgroundColor: 'lightblue',
        justifyContent: 'space-around',
        marginBottom: 50,
        alignItems: 'center',
        paddingRight: 60,
        paddingLeft: 60
    }
});

export default DrawerMenu;