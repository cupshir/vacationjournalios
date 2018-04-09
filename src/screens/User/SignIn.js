import React, { Component } from 'react';
import {
    View,
    StyleSheet,
    AlertIOS
} from 'react-native';
import { 
    Button,
    FormLabel, 
    FormInput,
    FormValidationMessage,
    Text
} from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { 
    signInUser,
} from '../../realm/userService';

import LoadingMickey from '../../components/LoadingMickey';

class SignIn extends Component {
    static navigatorButtons = {
        rightButtons: [
            {
                title: 'Sign In',
                id: 'signIn'
            }
        ],
        leftButtons: [
            {
                title: 'Cancel',
                id: 'cancel'
            }
        ]
    };

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
            },
            authenticationError: '',
            isLoading: false
        };
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    // handle navigation event
    onNavigatorEvent(event) {
        if (event.type == 'NavBarButtonPress') {
            if (event.id == 'signIn') {
                this.handleSignIn();
            } else if (event.id =='cancel') {
                this.props.navigator.dismissModal({});
            }
        }
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

    // Handle Sign In Press
    handleSignIn = () => {
        // Check if ready to submit
        const ready = this.readyForSubmit(this.state.formValues)

        if(ready) {
            // Set loading state
            this.setState({
                ...this.state,
                isLoading: true
            });

            // attempt sign in user
            signInUser(this.state.formValues.email,this.state.formValues.password).then((user) => {
                // success - stop loading animation - close modal
                this.setState({
                    ...this.state,
                    isLoading: false
                });
                this.props.navigator.dismissModal();
            }).catch((error) => {
                // failed
                console.log('signInError: ', error);
                // set error message in state
                this.setState({
                    ...this.state,
                    authenticationError: error.message,
                    isLoading: false
                });
            });
        } else {
            // not ready for submit
            AlertIOS.alert('Please enter a valid email address and password')
        }
    }

    // Check if form is ready for submit and return true/false
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

    // Check if error messages exist in state and return true/false
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

    // Render Form
    render() {        
        // Check for formErrors in state
        const emailError = (this.state.formErrors.email !== '') ? this.renderError(this.state.formErrors.email) : null;
        const passwordError = (this.state.formErrors.password !== '') ? this.renderError(this.state.formErrors.password) : null;
        // Check for authentication error in state
        const authenticationError = (this.state.authenticationError !== '') ? this.renderError(this.state.authenticationError) : null;

        // Loading Mickey Graphic
        if (this.state.isLoading) {
            return (
                <View style={styles.container}>
                    <LoadingMickey />
                </View>
            );
        }
        
        // Render Sign In Form
        return (
            <KeyboardAwareScrollView style={styles.container}>
                <View style={styles.upper}>
                    <Text style={styles.image}>Sign In Graphic</Text>
                </View>
                <View style={styles.lower}>
                    {authenticationError}
                    <View>
                        <FormLabel
                            labelStyle={styles.inputLabel}
                        >
                            Email
                        </FormLabel>
                        <FormInput 
                            onChangeText={this.handleEmailChange}
                            placeholder='Enter email address'
                            autoCapitalize='none'
                            autoCorrect={false}
                            containerStyle={styles.input}
                            inputStyle={styles.inputText}
                            value={this.state.formValues.email}
                        />
                        {emailError}
                        <FormLabel
                            labelStyle={styles.inputLabel}
                        >Password</FormLabel>
                        <FormInput 
                            onChangeText={this.handlePasswordChange}
                            placeholder='Enter password'
                            secureTextEntry={true}
                            autoCapitalize='none'
                            autoCorrect={false}
                            spellCheck={false}
                            containerStyle={styles.input}
                            inputStyle={styles.inputText}
                        />
                        {passwordError}
                    </View>
                </View>
            </KeyboardAwareScrollView>
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
    input: {
        backgroundColor: '#AAAAAA',
        borderRadius: 5,
        paddingLeft: 10
    },
    inputLabel: {
        color: '#FFFFFF'
    },
    inputText: {
        color: '#000000'
    }
});

export default SignIn;