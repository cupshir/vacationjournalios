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

import { 
    userRealm,
    changeUserPassword
} from '../../realm/userService';

import LoadingMickey from '../../components/LoadingMickey';

class ChangePassword extends Component {
    static navigatorButtons = {
        rightButtons: [
            {
                title: 'Save',
                id: 'save'
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
            currentUser: null,
            formValues: {
                newPassword: '',
                confirmPassword: '',
                oldPassword: ''
            },
            formErrors: {
                newPassword: '',
                confirmPassword: '',
                oldPassword: ''
            },
            changePasswordError: '',
            isLoading: true
        };
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    componentDidMount() {
        if(this.props.currentUserId) {
            const currentUser = userRealm.objectForPrimaryKey('Person', this.props.currentUserId);

            if(currentUser) {
                this.setState({
                    ...this.state,
                    currentUser: currentUser,
                    isLoading: false
                });
                return;
            }
        } 
        // Something went wrong loading user info, dismiss modal
        this.props.navigator.dismissModal();
        
    }

    // handle navigation event
    onNavigatorEvent(event) {
        if (event.type == 'NavBarButtonPress') {
            if (event.id == 'save') {
                this.handleSave();
            } else if (event.id =='cancel') {
                this.props.navigator.dismissModal({});
            }
        }
    }

    // Handle Old Password input change
    handleOldPasswordChange = (value) => {
        let oldPasswordError = '';

        // Check input for errors, if found set error message
        if (!value) {
            oldPasswordError = 'Please enter your password.';
        }
        
        // Set state and error messages
        this.setState({ 
            formValues: {
                ...this.state.formValues, 
                oldPassword: value
            },
            formErrors: {
                ...this.state.formErrors,
                oldPassword: oldPasswordError
            }
        });
    }
    

    // Handle Password input change
    handleNewPasswordChange = (value) => {
        let newPasswordError = '';
        let confirmPasswordError = '';

        // Check input for errors, if found set error message
        if (!value) {
            newPasswordError = 'Please enter a new password.';
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
                newPassword: value
            },
            formErrors: {
                ...this.state.formErrors,
                newPassword: newPasswordError,
                confirmPassword: confirmPasswordError
            }
        });
    }

    // Handle Confirm Password Change
    handleConfirmPasswordChange = (value) => {
        let confirmPasswordError = '';

        // Check input for errors, if found set error message
        if (!value) {
            confirmPasswordError = 'Please reenter password.';
        } else if (value !== this.state.formValues.newPassword) {
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

    // Handle Submit Click
    handleSave = () => {
        if(this.readyForSubmit(this.state.formValues) && (this.state.formValues.newPassword === this.state.formValues.confirmPassword)) {
            // start loading animation
            this.setState({
                ...this.state,
                isLoading: true
            });
            // Attempt registration
            changeUserPassword(this.state.formValues.oldPassword, this.state.formValues.newPassword).then((user) => {
                    // success - stoping loading animation and close modal
                    this.setState({
                        ...this.state,
                        isLoading: false
                    })
                    this.props.navigator.dismissModal();
                }).catch(error => {
                    // set error message in state
                    this.setState({
                        ...this.state,
                        changePasswordError: error,
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
            if (val !== '') {
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
        const oldPasswordError = (this.state.formErrors.oldPassword !== '') ? this.renderError(this.state.formErrors.oldPassword) : null;
        const newPasswordError = (this.state.formErrors.newPassword !== '') ? this.renderError(this.state.formErrors.newPassword) : null;
        const confirmPasswordError = (this.state.formErrors.confirmPassword !== '') ? this.renderError(this.state.formErrors.confirmPassword) : null;
        
        // Check if change password errors in state
        const changePasswordError = (this.state.changePasswordError !== '') ? this.renderError(this.state.changePasswordError) : null;

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
                    {changePasswordError}
                    <FormLabel
                        labelStyle={styles.inputLabel}                           
                    >Old Password</FormLabel>
                    <FormInput 
                        onChangeText={this.handleOldPasswordChange}
                        placeholder='Enter current password'
                        secureTextEntry={true}
                        autoCapitalize='none'
                        autoCorrect={false}
                        spellCheck={false}
                        containerStyle={styles.input}
                        inputStyle={styles.inputText} 
                    />
                    {oldPasswordError}
                    <FormLabel
                        labelStyle={styles.inputLabel}                           
                    >New Password</FormLabel>
                    <FormInput 
                        onChangeText={this.handleNewPasswordChange}
                        placeholder='Enter a new password'
                        secureTextEntry={true}
                        autoCapitalize='none'
                        autoCorrect={false}
                        spellCheck={false}
                        containerStyle={styles.input}
                        inputStyle={styles.inputText} 
                    />
                    {newPasswordError}
                    <FormLabel                  
                        labelStyle={styles.inputLabel}                           
                    >Confirm Password</FormLabel>
                    <FormInput 
                        onChangeText={this.handleConfirmPasswordChange}
                        placeholder='Confirm new password'
                        secureTextEntry={true}
                        autoCapitalize='none'
                        autoCorrect={false}
                        spellCheck={false}
                        containerStyle={styles.input}
                        inputStyle={styles.inputText} 
                    />
                    {confirmPasswordError}
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
        backgroundColor: '#e9e9e9',
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


export default ChangePassword;
