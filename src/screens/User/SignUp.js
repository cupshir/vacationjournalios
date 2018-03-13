
import React, { Component } from 'react';
import {
    View,
    ScrollView,
    StyleSheet
} from 'react-native';
import { 
    Button,
    FormLabel, 
    FormInput,
    FormValidationMessage,
    Text
} from 'react-native-elements';


export default class SignUp extends Component {
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
            }
        };
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
    handleSubmitPress = () => {

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
        // Check for error messages
        const emailError = (this.state.formErrors.email !== '') ? this.renderError(this.state.formErrors.email) : null;
        const confirmEmailError = (this.state.formErrors.confirmEmail !== '') ? this.renderError(this.state.formErrors.confirmEmail) : null;
        const passwordError = (this.state.formErrors.password !== '') ? this.renderError(this.state.formErrors.password) : null;
        const confirmPasswordError = (this.state.formErrors.confirmPassword !== '') ? this.renderError(this.state.formErrors.confirmPassword) : null;
        const firstNameError = (this.state.formErrors.firstName !== '') ? this.renderError(this.state.formErrors.firstName) : null;
        const lastNameError = (this.state.formErrors.lastName !== '') ? this.renderError(this.state.formErrors.lastName) : null;

        // Check if form is ready to submit (all validation pass and fields exist)
        const readyForSubmit = this.readyForSubmit(this.state.formValues);

        return (
        <View style={styles.container}>
            <ScrollView style={styles.form}>
                <View>
                    <FormLabel>Email</FormLabel>
                    <FormInput 
                        onChangeText={this.handleEmailChange}
                        placeholder='Enter email address'
                        autoCapitalize='none'
                        autoCorrect={false}
                    />
                    {emailError}
                    <FormLabel>Confirm Email</FormLabel>
                    <FormInput 
                        onChangeText={this.handleConfirmEmailChange}
                        placeholder='Confirm email address'
                        autoCapitalize='none'
                        autoCorrect={false}
                    />
                    {confirmEmailError}
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
                    <FormLabel>Confirm Password</FormLabel>
                    <FormInput 
                        onChangeText={this.handleConfirmPasswordChange}
                        placeholder='Confirm password'
                        secureTextEntry={true}
                        autoCapitalize='none'
                        autoCorrect={false}
                        spellCheck={false} 
                    />
                    {confirmPasswordError}
                    <FormLabel>First Name</FormLabel>
                    <FormInput 
                        onChangeText={this.handleFirstNameChange}
                        placeholder='Enter first name'
                    />
                    {firstNameError}
                    <FormLabel>Last Name</FormLabel>
                    <FormInput 
                        onChangeText={this.handleLastNameChange}
                        placeholder='Enter last name'
                    />
                    {lastNameError}
                </View>
                <View style={styles.buttons}>
                    <Button
                        raised={true}
                        title='Sign Up'
                        buttonStyle={styles.button}
                        backgroundColor='#387EF7'
                        disabled={!readyForSubmit}
                    />
                </View>
            </ScrollView>
        </View>
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
    buttons: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10
    },
    button: {
        borderRadius: 5,
        width: 100
    }
  });
