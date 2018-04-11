import React, { Component } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    AlertIOS
} from 'react-native';
import { 
    FormLabel, 
    FormInput,
    FormValidationMessage,
    Text
} from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import * as UserService from '../../realm/userService';

import LoadingMickey from '../../components/LoadingMickey';

class Register extends Component {
    static navigatorButtons = {
        rightButtons: [
            {
                title: 'Sign Up',
                id: 'signUp'
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
                confirmEmail: '',
                password: '',
                confirmPassword: '',
                firstName: '',
                lastName: ''                                                               
            },
            formErrors: {
                email: '',
                confirmEmail: '',
                password: '',
                confirmPassword: '',
                firstName: '',
                lastName: ''
            },
            signUpError: '',
            isLoading: false
        };
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    // handle navigation event
    onNavigatorEvent(event) {
        if (event.type == 'NavBarButtonPress') {
            if (event.id == 'signUp') {
                this.handleSignUp();
            } else if (event.id =='cancel') {
                this.props.navigator.dismissModal({});
            }
        }
    }

    // Handle Email input change
    handleEmailChange = (value, errors) => {
        let emailError;
        let confirmEmailError;

        // Check input for errors, if found set error message
        if (!value) {
            emailError = 'Please enter an email.';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,8}$/i.test(value)) {
            emailError = 'Invalid email address.'
        }

        // Check if confirm input matches, if not set error message
        if (this.state.formValues.confirmEmail) {
            if (value !== this.state.formValues.confirmEmail) {
                confirmEmailError = 'Email addresses do not match.'
            }
        }

        // Set state and error messages
        this.setState({ 
            formValues: {
                ...this.state.formValues, 
                email: value
            },
            formErrors: {
                ...this.state.formErrors,
                email: emailError,
                confirmEmail: confirmEmailError
            }
        });
    }

    // Handle Confirm Email input change
    handleConfirmEmailChange = (value) => {
        let confirmEmailError;

        // Check input for errors, if found set error message
        if (!value) {
            confirmEmailError = 'Please enter an email.';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,8}$/i.test(value)) {
            confirmEmailError = 'Invalid email address.'
        } else if (value !== this.state.formValues.email) {
            confirmEmailError = 'Email addresses do not match.'
        }

        // Set state and error messages
        this.setState({ 
            formValues: {
                ...this.state.formValues, 
                confirmEmail: value
            },
            formErrors: {
                ...this.state.formErrors,
                confirmEmail: confirmEmailError
            }
        });
    }

    // Handle Password input change
    handlePasswordChange = (value) => {
        let passwordError;
        let confirmPasswordError;

        // Check input for errors, if found set error message
        if (!value) {
            passwordError = 'Please enter a password.';
        }
        
        // Check if confirm input matches, if not set error message
        if(this.state.formValues.confirmPassword) {
            if (value !== this.state.formValues.confirmPassword) {
                confirmPasswordError = 'Passwords do not match.';
            }
        }

        // Set state and error messages
        this.setState({ 
            formValues: {
                ...this.state.formValues, 
                password: value
            },
            formErrors: {
                ...this.state.formErrors,
                password: passwordError,
                confirmPassword: confirmPasswordError
            }
        });
    }

    // Handle Confirm Password Change
    handleConfirmPasswordChange = (value) => {
        let confirmPasswordError;

        // Check input for errors, if found set error message
        if (!value) {
            confirmPasswordError = 'Please enter a password.';
        } else if (value !== this.state.formValues.password) {
            confirmPasswordError = 'Passwords do not match.'
        }

        // Set state and error messages
        this.setState({ 
            formValues: {
                ...this.state.formValues, 
                confirmPassword: value
            },
            formErrors: {
                ...this.state.formErrors,
                confirmPassword: confirmPasswordError
            }
        });
    }

    // Handle First Name Change
    handleFirstNameChange = (value) => {
        let firstNameError;

        // Check input for errors, if found set error message
        if (!value) {
            firstNameError = 'Please enter your first name.';
        }

        // Set state and error messages
        this.setState({ 
            formValues: {
                ...this.state.formValues, 
                firstName: value
            },
            formErrors: {
                ...this.state.formErrors,
                firstName: firstNameError
            }
        });
    }

    // Handle Last Name Change
    handleLastNameChange = (value) => {
        let lastNameError;

        // Check input for errors, if found set error message
        if (!value) {
            lastNameError = 'Please enter your last name.';
        }

        // Set state and error messages
        this.setState({ 
            formValues: {
                ...this.state.formValues, 
                lastName: value
            },
            formErrors: {
                ...this.state.formErrors,
                lastName: lastNameError
            }
        });
    }

    // Handle Submit Click
    handleSignUp = () => {
        if(this.readyForSubmit(this.state.formValues)){
            // start loading animation
            this.setState({
                ...this.state,
                isLoading: true
            });
            // Create and populate credentials object
            let credentials = [];
            credentials.firstName = this.state.formValues.firstName;
            credentials.lastName = this.state.formValues.lastName;
            credentials.email = this.state.formValues.email;
            credentials.password = this.state.formValues.password;

            // Attempt registration
            UserService.registerUser(credentials).then((user) => {
                // success - stoping loading animation and close modal
                this.setState({
                    ...this.state,
                    isLoading: false
                })
                this.props.navigator.dismissModal();
            }).catch((error) => {
                // failed
                console.log('handleSignUpError: ', error);
                // set error message in state
                this.setState({
                    ...this.state,
                    signUpError: error.message,
                    isLoading: false
                });
            });
        } else {
            // TODO: Dynamic alert to better direct what to do
            AlertIOS.alert('Please correct form errrors and try again')
        }
    }

    // Check if form ready for submit
    readyForSubmit = (values) => {
        let ready = true;

        // Check for value in Form Values
        Object.entries(values).forEach(([key, val]) => {
            if(val === '') {
                ready = false;
            }
        });

        // If all values preset, check for error messages
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

    // Render Form
    render() {
        // Check for form errors in state
        const emailError = (this.state.formErrors.email !== '') ? this.renderError(this.state.formErrors.email) : null;
        const confirmEmailError = (this.state.formErrors.confirmEmail !== '') ? this.renderError(this.state.formErrors.confirmEmail) : null;
        const passwordError = (this.state.formErrors.password !== '') ? this.renderError(this.state.formErrors.password) : null;
        const confirmPasswordError = (this.state.formErrors.confirmPassword !== '') ? this.renderError(this.state.formErrors.confirmPassword) : null;
        const firstNameError = (this.state.formErrors.firstName !== '') ? this.renderError(this.state.formErrors.firstName) : null;
        const lastNameError = (this.state.formErrors.lastName !== '') ? this.renderError(this.state.formErrors.lastName) : null;
        
        // Check if sign in errors in state
        const signUpError = (this.state.signUpError !== '') ? this.renderError(this.state.signUpError) : null;

        // Loading Mickey Graphic
        if (this.state.isLoading) {
            return (
                <View style={styles.container}>
                    <LoadingMickey />
                </View>
            );
        }

        // Render form
        return (
        <KeyboardAwareScrollView 
            style={styles.container}
            extraScrollHeight={50}>
            <ScrollView style={styles.form}>
                <View>
                    {signUpError}
                    <FormLabel
                        labelStyle={styles.inputLabel}
                    >Email</FormLabel>
                    <FormInput 
                        onChangeText={this.handleEmailChange}
                        placeholder='Enter email address'
                        autoCapitalize='none'
                        autoCorrect={false}
                        containerStyle={styles.input}
                        inputStyle={styles.inputText}
                    />
                    {emailError}
                    <FormLabel
                        labelStyle={styles.inputLabel}                                        
                    >Confirm Email</FormLabel>
                    <FormInput 
                        onChangeText={this.handleConfirmEmailChange}
                        placeholder='Confirm email address'
                        autoCapitalize='none'
                        autoCorrect={false}
                        containerStyle={styles.input}
                        inputStyle={styles.inputText}
                    />
                    {confirmEmailError}
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
                    <FormLabel                  
                        labelStyle={styles.inputLabel}                           
                    >Confirm Password</FormLabel>
                    <FormInput 
                        onChangeText={this.handleConfirmPasswordChange}
                        placeholder='Confirm password'
                        secureTextEntry={true}
                        autoCapitalize='none'
                        autoCorrect={false}
                        spellCheck={false}
                        containerStyle={styles.input}
                        inputStyle={styles.inputText} 
                    />
                    {confirmPasswordError}
                    <FormLabel
                        labelStyle={styles.inputLabel}                           
                    >First Name</FormLabel>
                    <FormInput 
                        onChangeText={this.handleFirstNameChange}
                        placeholder='Enter first name'
                        containerStyle={styles.input}
                        inputStyle={styles.inputText}
                    />
                    {firstNameError}
                    <FormLabel
                        labelStyle={styles.inputLabel}                           
                    >Last Name</FormLabel>
                    <FormInput 
                        onChangeText={this.handleLastNameChange}
                        placeholder='Enter last name'
                        containerStyle={styles.input}
                        inputStyle={styles.inputText}
                    />
                    {lastNameError}
                </View>
            </ScrollView>
        </KeyboardAwareScrollView>
        )
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1
    },
    form: {
        flex: .9,
        marginBottom: 20,
        marginRight: 25,
        marginLeft: 25,
    },
    image: {
        flex: .8,
        backgroundColor: '#C7D0FE',
        borderWidth: 1
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


export default Register;
