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

class EditPerson extends Component {
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
                firstName: '',
                lastName: ''                                                               
            },
            formErrors: {
                firstName: '',
                lastName: ''
            },
            editError: '',
            isLoading: true
        };
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    componentDidMount() {
        if(this.props.currentUserId) {
            const currentUser = UserService.userRealm.objectForPrimaryKey('Person', this.props.currentUserId);

            if(currentUser) {
                this.setState({
                    ...this.state,
                    currentUser: currentUser,
                    formValues: {
                        firstName: currentUser.firstName,
                        lastName: currentUser.lastName
                    },
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

    // Handle Email input change - Disabled for now, will circle back later to figure this out in realm
    //      its easy to update the email in the realm database, but need to figure out how to update it in the authentication database
    // handleEmailChange = (value, errors) => {
    //     let emailError = '';

    //     // Check input for errors, if found set error message
    //     if (!value) {
    //         emailError = 'Please enter an email.';
    //     } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,8}$/i.test(value)) {
    //         emailError = 'Invalid email address.'
    //     }

    //     // Set state and error messages
    //     this.setState({ 
    //         formValues: {
    //             ...this.state.formValues, 
    //             email: value
    //         },
    //         formErrors: {
    //             ...this.state.formErrors,
    //             email: emailError,
    //         }
    //     });
    // }

    // Handle First Name Change
    handleFirstNameChange = (value) => {
        let firstNameError = '';

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
        let lastNameError = '';

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
    handleSave = () => {
        if(this.readyForSubmit(this.state.formValues)){
            // start loading animation
            this.setState({
                ...this.state,
                isLoading: true
            });
            // Create and populate credentials object
            let updatedUserInfo = [];
            updatedUserInfo.firstName = this.state.formValues.firstName;
            updatedUserInfo.lastName = this.state.formValues.lastName;

            if (this.state.currentUser) {
                // Attempt registration
                UserService.saveUser(updatedUserInfo).then((user) => {
                    // success - stoping loading animation and close modal
                    this.setState({
                        ...this.state,
                        isLoading: false
                    })
                    this.props.navigator.dismissModal();
                }).catch((error) => {
                    // set error message in state
                    this.setState({
                        ...this.state,
                        editError: error.message,
                        isLoading: false
                    });
                });
            } else {
                this.setState({
                    // set error message in state
                    ...this.state,
                    editError: 'User not logged in',
                    isLoading: false
                });
            }
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
        const firstNameError = (this.state.formErrors.firstName !== '') ? this.renderError(this.state.formErrors.firstName) : null;
        const lastNameError = (this.state.formErrors.lastName !== '') ? this.renderError(this.state.formErrors.lastName) : null;
        
        // Check if sign in errors in state
        const editError = (this.state.editError !== '') ? this.renderError(this.state.editError) : null;

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
                    {editError}
                    <FormLabel
                        labelStyle={styles.inputLabel}                           
                    >First Name</FormLabel>
                    <FormInput 
                        onChangeText={this.handleFirstNameChange}
                        placeholder='Enter first name'
                        containerStyle={styles.input}
                        inputStyle={styles.inputText}
                        value={this.state.formValues.firstName}
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
                        value={this.state.formValues.lastName}
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


export default EditPerson;
