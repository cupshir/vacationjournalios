
import React, { Component } from 'react';
import {
    View,
    StyleSheet
} from 'react-native';
import { 
    Button,
    FormLabel, 
    FormInput,
    FormValidationMessage,
    Text
     } from 'react-native-elements';

export default class Login extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            formValues: {
                email: '',
                password: ''
            },
            formErrors: {
                email: '',
                password: ''
            }
        };
    }

    // Handle Email input change
    handleEmailChange = (value) => {
        let emailError;

        // Check input for errors, if found set error message
        if (!value) {
            emailError = 'Please enter an email.';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,8}$/i.test(value)) {
            emailError = 'Invalid email address.'
        }

        // Set state and error messages
        this.setState({ 
            formValues: {
                ...this.state.formValues, 
                email: value
            },
            formErrors: {
                ...this.state.formErrors,
                email: emailError
            }
        });
    }

    // Handle Password input change
    handlePasswordChange = (value) => {
        let passwordError;

        // Check input for errors, if found set error message
        if (!value) {
            passwordError = 'Please enter a password.';
        }

        // Set state and error messages
        this.setState({ 
            formValues: {
                ...this.state.formValues, 
                password: value
            },
            formErrors: {
                ...this.state.formErrors,
                password: passwordError
            }
        });
    }

    handleSignUpPress = () => {
        this.props.navigator.push({
            screen: 'vacationjournalios.SignUp',
            title: 'Sign Up'
        });
    }

    // Handle Submit Click
    handleLoginPress = () => {

        this.props.navigator.push({
            screen: 'vacationjournalios.JournalEntry',
            title: 'Add Journal Entry'
        });
    }

    // Check if form ready for submit
    readyForSubmit = (values) => {
        let ready = true;

        // Check that each formValue has a value, if value missing return false
        Object.entries(values).forEach(([key, val]) => {
            if(val === '') {
                ready = false;
            }
        });

        // If all values present, Check that there are no formError messages
        if(ready) {
            ready = !this.checkForErrorMessages();
        }

        return ready;
    }

    // Return true if error messages exist in state
    checkForErrorMessages = () => {
        let errorCount = 0;
        Object.entries(this.state.formErrors).forEach(([key, val]) => {
            if (val || val === '') {
                errorCount++;
            }
        });

        if (errorCount > 0) {
            return true;
        } else {
            return false;
        }
    }

    // Render Validation Error component
    renderError = (error) => {
        return (
            <FormValidationMessage>
                {error}
            </FormValidationMessage>            
        );
    }

    render() {
        // Check if errors exist in state.formErrors
        const emailError = (this.state.formErrors.email !== '') ? this.renderError(this.state.formErrors.email) : null;
        const passwordError = (this.state.formErrors.password !== '') ? this.renderError(this.state.formErrors.password) : null;

        // Check if form is ready to submit (all validation passes and values exist)
        const readyForSubmit = this.readyForSubmit(this.state.formValues);
       
        return (
        <View style={styles.container}>
            <View style={styles.upper}>
                <Text style={styles.image}>Login Graphic</Text>
            </View>
            <View style={styles.lower}>
                <View>
                    <FormLabel>Email</FormLabel>
                    <FormInput 
                        onChangeText={this.handleEmailChange}
                        placeholder='Enter email address'
                        autoCapitalize='none'
                        autoCorrect={false}
                    />
                    {emailError}
                    <FormLabel>Password</FormLabel>
                    <FormInput 
                        onChangeText={this.handlePasswordChange}
                        placeholder='Enter password'
                        secureTextEntry={true}
                        autoCapitalize='none'
                        autoCorrect={false}
                        spellCheck={false} 
                    />
                    {passwordError}
                </View>
                <View style={styles.buttons}>
                    <Button
                        raised
                        title='Sign up'
                        buttonStyle={styles.button}
                        onPress={this.handleSignUpPress}
                    />
                    <Button
                        raised
                        title='Login'
                        buttonStyle={styles.button}
                        backgroundColor='#387EF7'
                        //disabled={readyForSubmit}
                        onPress={this.handleLoginPress}
                    />
                </View>
            </View>
        </View>
        )
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1
    },
    upper: {
        flex: .5,
        marginTop: 25,
        marginRight: 25,
        marginLeft: 25,
    },
    lower: {
        flex: .4,
        justifyContent: 'space-around',
        marginBottom: 50,
        marginRight: 25,
        marginLeft: 25,
    },
    image: {
        flex: .9,
        backgroundColor: '#C7D0FE',
        borderWidth: 1
    },
    form: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5
    },
    buttons: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    button: {
        borderRadius: 5,
        width: 100
    }
  });
